# AI 货袋子获客系统 · 高保真交互原型

对应设计文档 [`docs/ai-acquisition/`](../../docs/ai-acquisition/README.md)（尤其是 [06-前端页面设计](../../docs/ai-acquisition/06-前端页面设计.md)），按其 §13 的优先级实现：看板 → 会话工作台 → 自然语言任务 → 跟进流程编辑器 → 线索 → 话术库 → 开通向导 → 海报分发 → 渠道 / 设备 / 风控 → 触达 / 审核 / 跟进待办。

纯前端静态页面，**无构建、无依赖、无后端**。所有数据与 AI 行为都在浏览器本地模拟。

## 打开方式

因为页面通过 `<script src>` 加载共享模块，建议用任意静态服务器打开（直接双击 `file://` 也能用，但部分浏览器会限制 localStorage）：

```bash
cd prototypes/ai-acquisition
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080/index.html
```

入口页 `index.html` 有推荐演示路线、页面清单与所有深链接。

## 文件

| 文件 | 说明 |
|------|------|
| `index.html` | 原型总览：演示路线、页面卡片、URL 参数说明 |
| `dashboard.html` | 看板（今日 / 7 天 / 14 天；漏斗、渠道健康、话术效果、销售效率、销售时间分配手工填报卡片） |
| `workbench.html` | 会话工作台（会话队列、聊天、AI 建议 / 话术插入 / 润色、审核草稿、流程实例、机器处理记录、模拟客户来消息） |
| `jobs.html` | 自然语言 → 定时任务（JobSpec 解析、歧义提示、试运行含缺变量拦截、运行记录） |
| `flows.html` | 跟进流程（SOP）纵向树编辑器、校验 / 发布版本、模拟器、实例管理、统计 |
| `leads.html` | 线索列表与详情抽屉（全链路时间线、变量检查、触达记录、批量操作、手工录入） |
| `scripts.html` | 话术库（分类、关键词 / 变量、测试匹配、编辑抽屉实时预览、AI 变体、审核开关） |
| `wizard.html` | 开通向导四步（商家信息 → 自然语言任务 + SOP → 绑渠道 → 5 条测试线索跑通） |
| `poster-dispatch.html` | 海报分发（选海报 → 选目标 → 每渠道独立追踪码 → 队列发送 → 分发详情与归因） |
| `channels.html` | 渠道与设备（账号卡片 / 额度 / 熔断恢复、工作手机、抓取规则、抓取原始记录） |
| `risk.html` | 风控与设置（频率策略、风险事件、黑名单；总开关、意图阈值、内容 / AI、销售日报、数据保留） |
| `outreach.html` | 触达记录（触发来源、话术、命中变量、账号拟人参数、失败码、重试） |
| `approvals.html` | 审核（报价 / 合同 / 承诺类 AI 草稿的采纳 / 改写 / 驳回） |
| `follow-ups.html` | 跟进待办（需人工 / 机器自动 / 已完成；逾期 / 今天 / 以后） |
| `shared/base.css` | 设计系统（色板、布局、卡片、表格、表单、标签、抽屉 / 弹窗、时间线、聊天气泡、流程树） |
| `shared/app.js` | 壳层（侧边导航、角色切换、企微通知抽屉、重置数据）、通用组件（`UI` / `Modal` / `Drawer` / `toast` / `Chart`） |
| `shared/data.js` | 演示数据：商家、用户、账号 / 设备、抓取规则、话术、线索、会话、流程与实例、任务与运行、触达、审核、海报分发、风控策略 / 事件 / 黑名单、14 天统计 |
| `shared/engine.js` | 模拟引擎：意图识别、话术匹配、变量渲染与校验、敏感词、拟人节流 / 额度、自然语言解析（任务 / 流程）、FlowEngine 校验与推进 |

## 演示约定

- **角色**：右上角可在「管理员 陈总」与「销售 张三」间切换（存于 `localStorage acq:role`）。销售视角只显示看板、会话工作台、线索、跟进待办、审核，数据按归属人过滤。
- **数据**：首次打开时由 `shared/data.js` 生成并写入 `localStorage`（键 `acq:state:v6`）。页面上的操作（接管、发送、审核、发布流程、创建任务……）都会持久化；右上角「重置演示数据」可恢复初始状态。
- **AI 行为**：`shared/engine.js` 以规则优先、LLM 语义兜底的方式模拟意图识别与话术匹配，并给出来源与置信度。没有任何网络请求。
- **硬约束在原型中可见**：
  - 每条消息必须含 ≥ 1 个个性化变量，否则报 `ACQ-2001` 并拦截（任务试运行、向导测试跑通、线索「立即触达」、话术编辑预览均可复现，样例为无昵称的 L012 / 测试线索第 5 条）。
  - 敏感词 / 平台规范报 `ACQ-2002`（如小红书文案含联系方式）。
  - 客户表达拒绝 → 自动进黑名单并终止流程；报价 / 合同 / 承诺效果类话术 → 转人工并进入审核队列。
  - 账号按平台 / 档位限速（养号期 20% / 50% / 100% 额度），被限制即熔断，需人工恢复。
  - 「抓取他人公开评论」默认关闭，开启需勾选风险告知；相关抓取规则受总开关约束。

## 常用深链接

| 页面 | 参数 |
|------|------|
| `dashboard.html` | `?range=today\|7d\|14d` |
| `workbench.html` | `?c=C1..C8&tab=NEED_HUMAN\|AUTO\|HUMAN\|ALL` |
| `leads.html` | `?open=L001..L032`，`?stage=NEW\|CONTACTED\|REPLIED\|HOT\|WON\|LOST` |
| `jobs.html` | `?nl=<自然语言>` 自动解析；`?run=J1..J5` 打开运行记录 |
| `flows.html` | `?id=F1\|F2\|F3&tab=edit\|sim\|inst\|stats`；`?inst=FI1..FI8` |
| `scripts.html` | `?open=101..114` |
| `wizard.html` | `?step=1..4` |
| `poster-dispatch.html` | `?new=PS1..PS4` |
| `channels.html` | `?tab=accounts\|devices\|rules\|raw` |
| `risk.html` | `?tab=policies\|incidents\|blacklist\|settings` |
| `outreach.html` | `?replied=1` |

## 推荐演示路线

1. 管理员：`wizard.html` 四步走完，第 4 步第 5 条测试线索缺昵称被拦下，补齐后重跑。
2. 管理员：`jobs.html` 输入「每天早上 9 点抓取抖音评论区求推荐的线索并首触」，看解析与试运行。
3. 销售：`dashboard.html` → 点张总 → `leads.html?open=L001` 时间线 → `workbench.html?c=C1` 审核报价草稿并发送，观察 SOP 推进。
4. 销售：工作台底部演示条模拟「不需要，别再发了」（拒绝 → 黑名单）与「有没有热轧卷板现货，多少钱」（实体 + 问价 → 转人工）。
5. 管理员：`flows.html?id=F1` 插入节点 / 分支 → 校验 → 发布；`tab=sim` 逐事件模拟；实例迁移版本。
6. 管理员：`poster-dispatch.html?new=PS2` 勾选群 / 朋友圈 / 小红书，看追踪码与逐条发送。
7. 管理员：`channels.html` 恢复熔断小号；`risk.html?tab=settings` 开启公开评论抓取需确认风险告知。
