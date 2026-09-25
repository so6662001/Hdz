# 04 · API 接口设计

> 所属：AI 货袋子获客系统 v0.1  
> 约定：RESTful，前缀 `/api/acquisition`；统一响应 `{code, message, data}`；分页参数 `pageNum/pageSize`，返回 `{list, total}`；时间 ISO-8601；鉴权复用平台 Token，`merchant_id` 从登录态取，不由前端传；权限编码见 07 分册。  
> 运营端接口前缀 `/api/admin/acquisition`。执行端走 WebSocket `/ws/executor`。

---

## 1. 开通向导 Wizard

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/wizard/status` | 向导进度与各步骤完成情况（配置是否完整、渠道数、任务数、测试线索数） |
| PUT | `/wizard/step1/knowledge` | 步骤 1：公司简介、主营品类、销售名单、默认变量、自定义字段；`importIndustryPack: "STEEL_TRADE"` 导入行业话术包 |
| POST | `/wizard/step2/jobs/preset` | 步骤 2：一键生成 4 个预设任务的自然语言草稿（09:00 抓取 / 10:00 触达 / 14:00 跟进 / 17:00 看板），返回待确认的 JobSpec 列表 |
| GET | `/wizard/step3/channels/guide` | 步骤 3：各平台接入指引（企微授权链接、App 下载二维码、设备绑定码） |
| POST | `/wizard/step4/test-leads` | 步骤 4：批量创建测试线索（`is_test=1`，body 5 条）并返回建议的试运行入口 |
| PUT | `/wizard/complete` | 标记向导完成 |

---

## 2. 线索 Lead

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/leads` | 列表；筛选 `stage, platform, ownerUserId, minScore, sourceType, keyword(昵称/摘要), createdFrom/To, lastActiveFrom/To, hasReply, isTest, tag`；排序 `intentScore/lastActiveAt/createdAt` |
| GET | `/leads/{id}` | 详情（含脱敏联系方式、变量预览、来源原文与截图、最近会话摘要） |
| GET | `/leads/{id}/timeline` | 时间线（`lead_event`，倒序分页） |
| POST | `/leads` | 手工新增（`nickname, platform, sourceChannel, sourceExcerpt, sourceUrl, productInterest, ext, isTest`） |
| POST | `/leads/import` | Excel/CSV 导入（异步，返回 jobRunId；模板字段同上） |
| PUT | `/leads/{id}` | 修改可编辑字段（产品意向、区域、公司、手机号、标签、自定义字段） |
| PUT | `/leads/{id}/stage` | 人工改阶段 `{stage, lostReason?, wonAmount?, note}` → 写 STAGE_CHANGED |
| PUT | `/leads/{id}/owner` | 转派 `{ownerUserId}` |
| POST | `/leads/{id}/notes` | 添加备注（事件 NOTE） |
| POST | `/leads/{id}/blacklist` | 拉黑并置 LOST |
| POST | `/leads/batch/outreach` | 选中线索立即触达 `{leadIds[], scriptId, channelAccountId?, dryRun}` → 返回 jobRunId |
| POST | `/leads/batch/assign` | 批量转派 |
| GET | `/leads/{id}/variables` | 该线索可用的个性化变量与当前值（用于话术预览） |

---

## 3. 抓取 Capture

| 方法 | 路径 | 说明 |
|------|------|------|
| GET / POST / PUT / DELETE | `/capture-rules[/{id}]` | 抓取规则 CRUD；创建时校验所选账号具备对应能力（如个人微信账号不可选 TOPIC） |
| POST | `/capture-rules/{id}/run` | 立即执行一次（返回 jobRunId，SSE 看进度） |
| GET | `/capture-raw` | 原始记录列表；筛选 `ruleId, platform, status, intent, minScore, jobRunId` |
| PUT | `/capture-raw/{id}/promote` | 人工把一条 IGNORED 记录转为线索 |
| PUT | `/capture-raw/{id}/ignore` | 人工忽略 |
| POST | `/capture-raw/reclassify` | 对一批记录重新跑意图识别（改了意图短语后） |

---

## 4. 触达 Outreach

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/outreaches` | 列表；筛选 `status, platform, channelAccountId, scriptId, jobRunId, leadId, sentFrom/To, replied, triggerType` |
| GET | `/outreaches/{id}` | 详情（渲染内容、变量快照、命中的个性化变量、回执码、截图） |
| POST | `/outreaches/preview` | **预览/校验**：`{leadIds[], scriptId, aiPolish?}` → 返回每条渲染文本、`personalizationHits`、`missingVars`、`moderation` 结果；不落库 |
| PUT | `/outreaches/{id}/cancel` | 取消 QUEUED/PENDING_APPROVAL |
| POST | `/outreaches/{id}/retry` | 手动重试 FAILED |
| GET | `/outreaches/queue/summary` | 各账号队列长度、预计完成时间、当前配额剩余 |

---

## 5. 会话 Conversation & 消息 Message

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/conversations` | 列表；筛选 `status(AUTO/NEED_HUMAN/HUMAN), ownerUserId, platform, unreadOnly, stage(关联线索阶段), keyword`；按 `lastMessageAt` 倒序 |
| GET | `/conversations/{id}/messages` | 消息流（分页，含命中话术、匹配来源与置信度、实体） |
| POST | `/conversations/{id}/messages` | 人工发送 `{content, attachments?, scriptId?}`（走渲染→校验→节流→发送链路，`sender_type=USER`） |
| PUT | `/conversations/{id}/take-over` | 人工接管（AUTO/NEED_HUMAN → HUMAN） |
| PUT | `/conversations/{id}/release` | 交还机器（HUMAN → AUTO） |
| PUT | `/conversations/{id}/read` | 标记已读 |
| PUT | `/conversations/{id}/close` | 关闭 |
| GET | `/conversations/{id}/suggestions` | AI 建议回复（基于话术库 + 企业资料库 RAG，返回 ≤3 条候选，附引用的话术/资料），仅供销售选择，不自动发送 |
| GET | `/conversations/workbench/summary` | 工作台角标：待人工数、未读数、今日待跟进数、待审核数 |

---

## 6. 话术库 Script

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/scripts` | 列表；筛选 `category, usageScene, platform, enabled, keyword`；返回近 7/30 日 sent/reply/回复率 |
| GET / POST / PUT / DELETE | `/scripts[/{id}]` | CRUD；PUT 时 `version+1` |
| POST | `/scripts/{id}/test-match` | 输入一段客户话，返回是否命中该话术（规则层） |
| POST | `/scripts/match` | 输入客户话，返回整个话术库的匹配结果（RULE → LLM），用于调试 |
| POST | `/scripts/{id}/render` | 用某线索变量渲染预览 `{leadId, aiPolish?}` |
| POST | `/scripts/ai-draft` | 让 LLM 依据企业资料库草拟话术 `{category, scene, styleHint}` → 草稿（`source=AI_DRAFT`，需人工保存） |
| GET | `/scripts/industry-packs` | 可导入的行业话术包列表 |
| POST | `/scripts/industry-packs/{code}/import` | 导入行业包（复制为商家话术） |
| GET | `/scripts/{id}/stats` | 效果趋势（`script_stat_daily`） |
| GET | `/scripts/ranking` | 话术效果排行（回复率/高意向率），支持 `range=7d/30d` |
| GET | `/scripts/variables` | 系统支持的变量清单与说明 |

---

## 7. 跟进 FollowUp

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/follow-ups` | 列表；筛选 `status, type, ownerUserId, dueFrom/To, overdueOnly, leadId` |
| GET | `/follow-ups/today` | 今日/逾期待跟进（看板"谁该跟进"数据源） |
| POST | `/follow-ups` | 人工创建 `{leadId, dueAt, note, plannedScriptId?}` |
| PUT | `/follow-ups/{id}/done` | 完成 `{result, note, outreachId?}` |
| PUT | `/follow-ups/{id}/reschedule` | 改期 |
| PUT | `/follow-ups/{id}/cancel` | 取消（若为流程定时器则同时终止/跳过对应流程步骤，需二次确认） |

---

## 7A. 跟进流程 Flow（分支编排）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/flows` | 列表（状态、发布版本、优先级、在途实例数、近 30 日完成/终止数） |
| POST | `/flows` | 创建草稿 `{name, description, trigger, guardrails, definition}` |
| GET | `/flows/{id}` | 详情（草稿 + 已发布版本） |
| PUT | `/flows/{id}` | 保存草稿（不影响在途实例） |
| POST | `/flows/{id}/validate` | 静态校验：孤立节点、不可达 End、GoTo 目标、脚本/账号存在、分支键合法、护栏不超风控上限；返回 `errors[] / warnings[]` |
| POST | `/flows/{id}/publish` | 发布草稿为新版本（先校验）；`{migrateActive: false}` 可选把在途实例迁移到新版本（仅当前节点 id 仍存在者） |
| PUT | `/flows/{id}/enable` `/disable` | 启停 Trigger（禁用后在途实例可选 `{terminateActive}`） |
| DELETE | `/flows/{id}` | 删除（需无非终态实例） |
| GET | `/flows/{id}/versions` | 版本历史 |
| POST | `/flows/parse` | **自然语言 → DAG**：`{text}` → `{definition, trigger, ambiguities[], confidence}`，不落库 |
| POST | `/flows/{id}/simulate` | 模拟：`{leadId?, events:[{type:"REPLY", category:"ASK_PRICE"}, {type:"TIMEOUT"}, ...]}` → 返回逐步路径与每步将发送的渲染文本（不真正发送） |
| GET | `/flows/templates` | 平台预置模板（如"标准跟进 SOP"） |
| POST | `/flows/templates/{code}/import` | 导入为商家草稿 |
| GET | `/flows/{id}/stats` | 节点级漏斗：每个节点进入数、各出口占比、平均停留时长（用于优化 SOP） |
| GET | `/flow-instances` | 实例列表；筛选 `flowId, status, leadId, ownerUserId, currentNodeId, waitingType, waitingBefore` |
| GET | `/flow-instances/{id}` | 实例详情（当前节点、等待类型与到期、上下文、步骤日志） |
| POST | `/flow-instances` | 手动把线索加入流程 `{leadId, flowId}`（若已有非终态实例需 `{preempt: true}`） |
| PUT | `/flow-instances/{id}/pause` `/resume` | 暂停 / 恢复 |
| PUT | `/flow-instances/{id}/skip-wait` | 跳过当前等待（立即按 TIMEOUT 推进） |
| PUT | `/flow-instances/{id}/jump` | 管理员跳转到指定节点 `{nodeId, reason}` |
| PUT | `/flow-instances/{id}/terminate` | 终止 `{reason}` |
| POST | `/flow-instances/{id}/retry-step` | 重试 FAILED 的当前步 |
| GET | `/leads/{id}/flow` | 线索当前流程实例摘要（线索详情/会话工作台右栏用：在哪个流程第几步、下一步何时、可用操作） |

---

## 8. 自动化任务 AutomationJob

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/jobs/parse` | **自然语言解析**：`{text}` → `{spec: JobSpec, ambiguities[], warnings[], confidence}`；不落库 |
| GET | `/jobs` | 列表（含下次运行时间、最近运行状态） |
| POST | `/jobs` | 保存 `{nlDescription, spec}`（前端把确认卡片修改后的 spec 一并提交）→ 注册调度 |
| GET / PUT / DELETE | `/jobs/{id}` | 详情 / 修改（重新解析或直接改 spec，`spec_version+1`）/ 删除 |
| PUT | `/jobs/{id}/enable` `/disable` | 启停 |
| POST | `/jobs/{id}/run` | 立即运行 `{dryRun: true|false}` → jobRunId |
| GET | `/jobs/{id}/runs` | 运行历史 |
| GET | `/job-runs/{runId}` | 运行详情（统计、结果摘要、dryRun 预览列表、失败明细） |
| GET | `/job-runs/{runId}/stream` | **SSE** 进度流（`{processed,total,success,failed,currentItem,phase}`） |
| PUT | `/job-runs/{runId}/cancel` | 取消运行中任务（已入队消息随之取消） |

---

## 9. 渠道账号 Channel & 执行端 Device

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/channels/accounts` | 账号列表（状态、今日发送/配额、熔断、绑定设备、心跳） |
| POST | `/channels/accounts` | 新增账号 `{platform, execMode, accountName, tier, deviceId?, credential?}` |
| PUT / DELETE | `/channels/accounts/{id}` | 修改（tier、风控策略、能力子集、归属销售）/ 删除 |
| PUT | `/channels/accounts/{id}/enable` `/disable` | 启停 |
| POST | `/channels/accounts/{id}/health-check` | 主动健康检查（RPA 渠道下发 HEALTH_CHECK 指令） |
| POST | `/channels/accounts/{id}/reset-circuit` | 人工解除熔断（记录操作人） |
| GET | `/channels/wecom/auth-url` | 企业微信授权链接（第三方应用/自建应用两种模式） |
| GET | `/channels/wecom/callback` | 企微授权回调 |
| GET | `/channels/wecom/{accountId}/groups` | 拉取企微客户群列表（供抓取规则/海报分发选目标） |
| POST | `/devices/bind-code` | 生成设备绑定二维码（含一次性 code，10 分钟有效） |
| GET | `/devices` | 设备列表（在线状态、已装 App 版本、绑定账号） |
| PUT | `/devices/{id}` | 改名 |
| DELETE | `/devices/{id}` | 解绑（吊销令牌） |
| GET | `/devices/{id}/commands` | 该设备近期指令与回执（排错） |

---

## 10. 海报分发 PosterDispatch

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/poster-dispatches` | 任务列表（含成功/失败目标数、扫码数） |
| POST | `/poster-dispatches` | 创建 `{posterSessionId, captionTemplate, scheduledAt?, targets:[{channelAccountId, targetType, targetKey?, targetName?}]}`；服务端逐目标调海报系统出渠道码图 |
| GET | `/poster-dispatches/{id}` | 详情（每目标状态、渠道码、成图、截图、扫码/咨询） |
| PUT | `/poster-dispatches/{id}/cancel` | 取消未发目标 |
| POST | `/poster-dispatches/{id}/items/{itemId}/retry` | 重试单目标 |
| GET | `/poster-dispatches/targets` | 可选目标聚合：各账号的群列表、朋友圈可用、论坛版块、小红书账号 |
| GET | `/posters/pickable` | 代理海报系统：当前商家可选海报（缩略图、标题、场景） |

---

## 11. 看板 Dashboard

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dashboard/overview` | 参数 `range=today/7d/30d, ownerUserId?, platform?`；返回核心指标（触达量、回复率、高意向、成交、自动处理率、转人工率）及环比 |
| GET | `/dashboard/funnel` | 阶段漏斗 NEW→CONTACTED→REPLIED→HOT→WON |
| GET | `/dashboard/trend` | 日趋势序列（stat_daily ⊕ 实时） |
| GET | `/dashboard/todo` | "谁该跟进"：到期跟进 + 待人工会话 + 待审核，按紧急度排序 |
| GET | `/dashboard/hot` | "谁快成交"：HOT 线索按意图分/最近活跃排序 |
| GET | `/dashboard/lost` | "谁已流失"：LOST/SILENT 及原因分布 |
| GET | `/dashboard/by-owner` | 销售维度对比 |
| GET | `/dashboard/by-channel` | 渠道维度对比（含账号健康度） |
| GET | `/dashboard/by-script` | 话术效果排行（同 `/scripts/ranking`） |
| POST | `/dashboard/refresh` | 手动触发当日聚合（对应"17:00 更新看板"任务的手动版） |
| GET | `/dashboard/export` | 导出 Excel（按当前筛选） |

---

## 12. 审核 Approval

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/approvals` | 列表；筛选 `status, type, assigneeUserId, overdueOnly` |
| GET | `/approvals/{id}` | 详情（触发消息、会话上下文、AI 草拟建议） |
| PUT | `/approvals/{id}/approve` | `{finalContent, attachments?}` → 发送并关闭审核单 |
| PUT | `/approvals/{id}/reject` | `{reason}`（可选择转人工会话） |
| PUT | `/approvals/{id}/reassign` | 转派 |

---

## 13. 风控 Risk

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/risk/policies` | 商家策略列表 + 平台默认（只读） |
| POST / PUT / DELETE | `/risk/policies[/{id}]` | 商家自定义策略（不得超过平台默认上限） |
| GET | `/risk/blacklist` | 黑名单列表 |
| POST / DELETE | `/risk/blacklist[/{id}]` | 添加 / 移除 |
| GET | `/risk/incidents` | 风控事件（BLOCKED / NEED_VERIFY / CAPTCHA / UI_CHANGED / 熔断），带账号与截图 |
| GET | `/risk/forbidden-words` `PUT` | 商家禁词维护 |
| POST | `/risk/moderate` | 文本检测调试 |

---

## 14. 配置 Settings

| 方法 | 路径 | 说明 |
|------|------|------|
| GET / PUT | `/settings` | 商家配置（阈值、静默期、活跃时段、分配策略、AI 润色确认、测试白名单、同步线索中心） |
| GET / PUT | `/settings/custom-fields` | 线索自定义字段定义 |
| GET | `/settings/subscription` | 订阅套餐、席位、设备数、到期 |

---

## 15. 运营端 `/api/admin/acquisition`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/merchants` | 已开通商家列表（套餐、席位、设备、今日用量、风控事件数） |
| PUT | `/merchants/{id}/subscription` | 开通/变更套餐 |
| GET / POST / PUT | `/industry-packs[/{code}]` | 行业话术包维护 |
| GET / PUT | `/risk/default-policies` | 平台默认风控策略（各平台 × 档位） |
| PUT | `/risk/global-switch` | **总闸**：`{rpaEnabled, platform?}` 一键暂停全部/某平台 RPA 指令 |
| GET | `/risk/incidents` | 全平台风控事件 |
| GET | `/executors/nodes` | 执行端网关节点与连接数 |
| GET | `/ai/usage` | 模型用量与成本（按商家/用途） |
| GET | `/stats/overview` | 平台级用量看板 |

---

## 16. 执行端 WebSocket 协议 `/ws/executor`

**握手**：`GET /ws/executor?token=<deviceJwt>&deviceCode=<code>&appVersion=<v>`；服务端校验后回 `{"event":"CONNECTED","serverTime":...,"heartbeatSec":30}`。

**帧类型**

| 方向 | type / event | 说明 |
|------|--------------|------|
| S→E | `COMMAND` | 指令（结构见 02 分册 4.2）；类型：`CAPTURE_COMMENTS / CAPTURE_TOPIC / CAPTURE_GROUP / CAPTURE_MOMENTS / SEND_DM / REPLY_GROUP / POST_MOMENT / PUBLISH_POST / PULL_INBOX / HEALTH_CHECK / PAUSE / RESUME` |
| E→S | `RECEIPT` | 回执，含 `cmdId, status, code, data, screenshotUrl` |
| E→S | `PROGRESS` | 长指令进度（抓取每页回传一次，`data.items` 增量） |
| E→S | `INBOUND_MESSAGE` | 新入站消息（对端、文本、附件、群信息、时间） |
| E→S | `HEARTBEAT` | 30 s 一次；含账号在线状态、前台 App、电量、网络 |
| E→S | `RISK_SIGNAL` | `CAPTCHA_SHOWN / FREQ_LIMIT_TOAST / LOGGED_OUT / UI_CHANGED / ACCOUNT_BANNED` |
| S→E | `ACK` | 对 INBOUND_MESSAGE / RISK_SIGNAL 的确认（执行端据此清本地队列） |
| S→E | `CONFIG` | 下发配置更新（截图策略、日志级别、允许操作的 App 列表） |

**约束**

- 指令有 `deadlineAt`，过期执行端直接回 `TIMEOUT`。
- 执行端同一时刻只执行一条指令（串行），`PAUSE` 后停止取新指令但完成当前。
- 截图先上传 OSS（服务端签发的直传凭据经 `CONFIG` 下发），回执只带 URL。
- 所有帧带 `seq`，支持断线重连后的补发（服务端按 `cmdId` 幂等）。

---

## 17. 对外回调 / 内部事件

| 来源 | 端点 / 事件 | 处理 |
|------|-------------|------|
| 企业微信 | `POST /callback/wecom/{corpId}` | 客户消息 → `InboundRouter`；添加客户/退群/朋友圈互动事件 → 线索或时间线；消息签名与解密按企微规范 |
| 海报系统 | 内部事件 `poster.scanned` / `poster.lead.created`（MQ 或 HTTP `POST /internal/events/poster`） | 按 `track_code` 找 `poster_dispatch_item` 累加扫码/咨询；`poster_lead` 创建/合并 `hdz_acq_lead`（source_type=POSTER_SCAN） |
| 货袋子站内 | 内部事件 `circle.comment.created` / `inquiry.created` | 经 `HdzInternalAdapter.capture()` 进入意图识别 |
| 论坛 Worker | `POST /internal/capture/forum/results` | 浏览器自动化进程回传抓取结果（内网鉴权） |
| 平台线索中心 | 本模块出站：`LeadCenterClient.push(lead)` | stage 进入 HOT/WON 时单向同步 |
| 模块内部事件总线 | `LeadStageEntered` / `ReplyClassified(category, entities)` / `PosterScanned` / `ApprovalDone` / `FollowUpDone` / `ConversationTakenOver` / `ConversationReleased` / `LeadBlacklisted` | `FlowEventListener` 消费，驱动流程实例创建、推进、暂停、终止 |

---

## 18. 错误码（模块段 `ACQ-`）

| 码 | 含义 |
|----|------|
| ACQ-1001 | 订阅未开通/已过期 |
| ACQ-1002 | 席位或设备数超限 |
| ACQ-2001 | 话术渲染缺少必需变量（`data.missingVars`） |
| ACQ-2002 | 内容未通过安全/禁词检测（`data.reasons`） |
| ACQ-2003 | 线索在黑名单或静默期 |
| ACQ-2004 | 单线索触达次数达上限 |
| ACQ-3001 | 渠道账号不具备该能力 |
| ACQ-3002 | 渠道账号离线/熔断/需验证 |
| ACQ-3003 | 执行端未绑定或离线 |
| ACQ-3004 | 平台 RPA 总闸已关闭 |
| ACQ-4001 | 自然语言无法解析为任务（返回 ambiguities） |
| ACQ-4002 | JobSpec 校验失败（cron/渠道/话术不存在） |
| ACQ-5001 | 海报系统出码失败 |
| ACQ-6001 | 状态迁移不允许 |
| ACQ-7001 | 流程定义校验失败（`data.errors`：孤立节点/不可达 End/GoTo 目标不存在/分支键非法/护栏超限） |
| ACQ-7002 | 线索已有非终态流程实例（需 `preempt`） |
| ACQ-7003 | 流程有在途实例，不可删除 |
| ACQ-7004 | 实例状态不允许该操作（如对 COMPLETED 实例 resume） |
| ACQ-7005 | 跳转目标节点在当前版本不存在 |
