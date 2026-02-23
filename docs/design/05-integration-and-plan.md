# 货袋子平台 — 模块集成方案与实施计划

> 版本：v2.0 | 日期：2026-02-23  
> 更新说明：新增 hdz-leads 模块（招商/需求登记管理）；新增企业微信 SDK 集成；新增权限编码；更新项目结构和实施计划

---

## 一、模块集成方案

### 1.1 后端集成（Java / Spring Boot）

三个业务模块（分站管理、广告管理、招商/需求登记管理）以 **Maven 多模块** 形式组织。

#### Maven 项目结构（v2 更新）

```
hdz-modules/
├── pom.xml                          # 父 POM
├── hdz-common/                      # 公共模块
│   ├── pom.xml
│   └── src/main/java/com/hdz/common/
│       ├── config/                  # 通用配置
│       ├── entity/                  # 基础实体（BaseEntity等）
│       ├── dto/                     # 通用 DTO（Result, PageResult等）
│       ├── exception/               # 统一异常处理
│       ├── util/                    # 工具类（IpUtil, FileUtil等）
│       ├── spi/                     # SPI 接口（权限、用户信息）
│       └── wechat/                  # 🆕 企业微信 SDK 封装
│           ├── WeChatNotifyService.java    # 通知发送服务
│           ├── WeChatWebhookSender.java   # Webhook 方式
│           ├── WeChatAppMsgSender.java    # 应用消息方式
│           └── WeChatConfig.java          # 配置类
├── hdz-sub-station/                 # 分站管理模块
│   ├── pom.xml
│   └── src/main/java/com/hdz/substation/
│       ├── controller/
│       │   ├── StationController.java         # C端接口
│       │   ├── StationAdminController.java    # 管理端接口
│       │   └── UserStationController.java     # 🆕 用户分站记忆接口
│       ├── service/
│       │   ├── StationService.java
│       │   ├── UserStationService.java        # 🆕 用户分站记忆服务
│       │   └── impl/
│       ├── mapper/
│       ├── entity/
│       │   └── UserStation.java               # 🆕 用户分站记忆实体
│       ├── dto/
│       ├── vo/
│       └── config/
│           └── SubStationAutoConfiguration.java
├── hdz-advertisement/               # 广告管理模块
│   ├── pom.xml
│   └── src/main/java/com/hdz/advertisement/
│       ├── controller/
│       │   ├── AdDisplayController.java       # C端广告展示
│       │   ├── AdZoneAdminController.java     # 版块管理
│       │   ├── AdSlotAdminController.java     # 广告位管理
│       │   ├── AdContentAdminController.java  # 广告内容管理（含赠送/收费、位置调整）
│       │   ├── AdPricingAdminController.java  # 定价管理
│       │   ├── AdOrderAdminController.java    # 订单管理
│       │   └── AdStatsAdminController.java    # 数据统计
│       ├── service/
│       │   ├── AdContentService.java          # 含 reposition() 位置调整
│       │   └── impl/
│       ├── mapper/
│       ├── entity/
│       ├── dto/
│       ├── vo/
│       ├── enums/
│       │   ├── ChargeType.java                # 🆕 FREE/PAID 收费模式枚举
│       │   └── LinkType.java                  # 🆕 跳转链接类型枚举
│       ├── task/
│       │   ├── AdStatusTask.java              # 广告到期处理（下线 or 待调整）
│       │   ├── AdStatsSyncTask.java           # 统计数据定时同步
│       │   └── AdExpireNotifyTask.java        # 🆕 广告到期企微提醒
│       └── config/
│           └── AdvertisementAutoConfiguration.java
├── hdz-leads/                        # 🆕 招商/需求登记管理模块
│   ├── pom.xml
│   └── src/main/java/com/hdz/leads/
│       ├── controller/
│       │   ├── BusinessInquiryController.java       # C端招商登记提交
│       │   ├── AdDemandController.java              # C端广告需求提交
│       │   ├── InquiryAdminController.java          # 后台招商登记管理
│       │   ├── AdDemandAdminController.java         # 后台广告需求管理
│       │   ├── FollowUpAdminController.java         # 跟进记录管理
│       │   └── WeChatNotifyConfigController.java    # 企微通知配置管理
│       ├── service/
│       │   ├── BusinessInquiryService.java
│       │   ├── AdDemandService.java
│       │   ├── FollowUpService.java
│       │   ├── WeChatNotifyConfigService.java
│       │   └── impl/
│       ├── mapper/
│       ├── entity/
│       │   ├── BusinessInquiry.java
│       │   ├── AdDemand.java
│       │   ├── FollowUpRecord.java
│       │   └── WeChatNotifyConfig.java
│       ├── dto/
│       ├── vo/
│       ├── listener/                              # 🆕 事件监听
│       │   └── LeadSubmitListener.java            # 登记提交 → 触发企微通知
│       └── config/
│           └── LeadsAutoConfiguration.java
└── hdz-ui/                          # 前端模块
    ├── package.json
    └── src/
        ├── views/
        │   ├── admin/
        │   │   ├── sub-station/       # 分站管理页面
        │   │   ├── advertisement/     # 广告管理页面
        │   │   ├── leads/             # 🆕 招商/需求登记管理页面
        │   │   └── settings/          # 🆕 系统设置（企微通知配置）
        │   └── client/
        │       ├── fullscreen/        # 平台介绍页
        │       ├── station/           # 分站首页
        │       ├── city-select/       # 城市选择页
        │       └── forms/             # 🆕 登记表单组件（弹窗）
        ├── api/
        ├── components/
        └── router/
```

#### 集成步骤

1. **添加 Maven 依赖**

```xml
<dependency>
    <groupId>com.hdz</groupId>
    <artifactId>hdz-sub-station</artifactId>
    <version>1.0.0</version>
</dependency>
<dependency>
    <groupId>com.hdz</groupId>
    <artifactId>hdz-advertisement</artifactId>
    <version>1.0.0</version>
</dependency>
<dependency>
    <groupId>com.hdz</groupId>
    <artifactId>hdz-leads</artifactId>
    <version>1.0.0</version>
</dependency>
```

2. **实现 SPI 接口**

```java
public interface HdzUserProvider {
    HdzUserInfo getCurrentUser();
    boolean hasPermission(String permissionCode);
    boolean isLoggedIn();
}
```

3. **数据库迁移**

执行模块提供的 SQL 脚本，共创建 15 张表（`hdz_` 前缀）。

4. **配置文件**

```yaml
hdz:
  sub-station:
    ip-location-provider: ip2region
    default-station-code: default
  advertisement:
    upload-path: /data/hdz/ad/
    max-file-size: 5MB
    cache-ttl: 600
    expire-notify-days: 3          # 到期前N天发送企微通知
  leads:
    captcha-enabled: true           # 登记表单验证码开关
    form-limit-per-hour: 5          # 同IP每小时最多提交次数
  wechat:
    enabled: true                   # 企微通知总开关
```

5. **菜单注册**

模块启动时自动注册菜单项：分站管理、广告管理、招商/需求管理、系统设置。

---

### 1.2 前端集成

#### 方案 A：路由模块方式（推荐）

```javascript
import subStationRoutes from '@hdz/sub-station/router'
import adRoutes from '@hdz/advertisement/router'
import leadsRoutes from '@hdz/leads/router'

const routes = [
  ...existingRoutes,
  ...subStationRoutes,
  ...adRoutes,
  ...leadsRoutes
]
```

#### 方案 B：iframe 嵌入方式 / 方案 C：微前端方式

（同 v1 设计）

---

### 1.3 权限设计（v2 更新）

| 权限编码 | 权限名称 | 说明 |
|---------|---------|------|
| hdz:station:list | 分站查看 | 查看分站列表 |
| hdz:station:create | 分站新增 | 新增分站 |
| hdz:station:edit | 分站编辑 | 编辑分站 |
| hdz:station:delete | 分站删除 | 删除分站 |
| hdz:station:config | 分站配置 | 管理分站配置 |
| hdz:ad:zone:manage | 版块管理 | 管理广告版块 |
| hdz:ad:slot:manage | 广告位管理 | 管理广告位 |
| hdz:ad:content:list | 广告查看 | 查看广告列表 |
| hdz:ad:content:create | 广告新增 | 新增广告 |
| hdz:ad:content:edit | 广告编辑 | 编辑广告 |
| hdz:ad:content:delete | 广告删除 | 删除广告 |
| hdz:ad:content:audit | 广告审核 | 审核广告 |
| hdz:ad:content:status | 广告上下线 | 控制广告上下线 |
| hdz:ad:content:reposition | 🆕 广告位置调整 | 到期后重新分配广告位 |
| hdz:ad:pricing:manage | 定价管理 | 管理广告定价 |
| hdz:ad:order:manage | 订单管理 | 管理广告订单 |
| hdz:ad:stats:view | 数据统计 | 查看广告统计 |
| **hdz:leads:inquiry:list** | 🆕 招商登记查看 | 查看招商登记列表和详情 |
| **hdz:leads:inquiry:follow** | 🆕 招商登记跟进 | 添加跟进记录、更新处理状态 |
| **hdz:leads:demand:list** | 🆕 广告需求查看 | 查看广告需求登记列表和详情 |
| **hdz:leads:demand:follow** | 🆕 广告需求跟进 | 添加跟进记录、更新处理状态 |
| **hdz:leads:export** | 🆕 登记数据导出 | 导出招商登记/广告需求数据 |
| **hdz:wechat:config** | 🆕 企微通知配置 | 管理企业微信通知配置 |

---

## 二、实施计划

### 2.1 阶段划分（v2 更新，新增招商/需求登记和企微通知相关任务）

| 阶段 | 时间 | 主要工作 |
|------|------|---------|
| 阶段一：基础搭建 | 第 1-2 周 | 项目脚手架、数据库建表、基础框架、企微 SDK |
| 阶段二：分站模块 | 第 3-4 周 | 分站管理 CRUD、城市绑定、IP 定位、用户分站记忆 |
| 阶段三：广告模块 | 第 5-7 周 | 广告版块/位/内容管理、赠送/收费、位置调整、跳转链接类型、审核、定价 |
| 阶段四：招商/需求登记模块 | 第 8-9 周 | 🆕 招商登记、广告需求登记、跟进记录、企微即时通知 |
| 阶段五：C端页面 | 第 10-11 周 | 平台介绍页、分站首页、招商/需求登记弹窗、城市选择页 |
| 阶段六：数据统计 | 第 12 周 | 广告统计、登记数据统计、数据看板 |
| 阶段七：集成联调 | 第 13-14 周 | 与现有系统集成、联调、性能优化 |
| 阶段八：测试上线 | 第 15-16 周 | 功能测试、压测、灰度上线 |

### 2.2 各阶段详细任务

#### 阶段一：基础搭建（第 1-2 周）

- [ ] 创建 Maven 多模块项目结构（含 hdz-leads 模块）
- [ ] 搭建公共模块（BaseEntity、Result、异常处理）
- [ ] 集成 MyBatis-Plus + 代码生成器
- [ ] 数据库建表（执行 15 张表的 DDL 脚本）
- [ ] 集成 Redis 缓存配置
- [ ] 集成 Swagger/Knife4j 文档
- [ ] 搭建前端 Vue 3 项目（Element Plus + 路由）
- [ ] 实现文件上传通用服务
- [ ] 🆕 封装企业微信通知 SDK（Webhook + 应用消息）
- [ ] 🆕 实现图形验证码服务

#### 阶段二：分站模块（第 3-4 周）

- [ ] 分站 CRUD 接口开发（后台）
- [ ] 分站城市绑定管理
- [ ] 分站配置管理
- [ ] IP 定位服务集成（ip2region）
- [ ] C 端分站定位与跳转逻辑
- [ ] 🆕 用户分站记忆功能（DB + Redis + Cookie 三级存储）
- [ ] 分站列表/详情 C 端接口
- [ ] 分站管理前端页面（列表、新增、编辑）
- [ ] 城市选择前端页面

#### 阶段三：广告模块（第 5-7 周）

- [ ] 广告版块管理接口 + 页面
- [ ] 广告位管理接口 + 页面
- [ ] 广告内容管理接口 + 页面
- [ ] 🆕 赠送/收费模式（charge_type 字段及业务逻辑）
- [ ] 🆕 跳转链接类型（link_type，支持商家首页 PC/移动端、公司官网、自定义）
- [ ] 🆕 移动端链接自动适配（link_url_mobile）
- [ ] 🆕 到期位置调整功能（position_adjustable，到期后进入"待调整"状态）
- [ ] 🆕 广告位置重新分配接口（reposition）
- [ ] 广告审核流程
- [ ] 广告上下线管理
- [ ] 广告定价管理接口 + 页面
- [ ] 广告订单管理接口 + 页面
- [ ] 广告素材上传与管理
- [ ] 广告到期处理定时任务（区分自动下线和待调整）
- [ ] 🆕 广告到期企微提醒定时任务（提前 3 天通知）

#### 阶段四：招商/需求登记模块（第 8-9 周） 🆕

- [ ] 招商登记提交接口（C 端）
- [ ] 广告需求登记提交接口（C 端）
- [ ] 表单防刷保护（验证码 + IP 频率限制）
- [ ] 登记提交后即时推送企微通知
- [ ] 招商登记管理后台（列表、详情）
- [ ] 广告需求管理后台（列表、详情）
- [ ] 跟进记录管理（追加式，不可修改删除）
- [ ] 处理状态更新
- [ ] 数据操作权限约束（禁止删除/修改原始数据）
- [ ] 企微通知配置管理页面
- [ ] 通知测试功能
- [ ] 登记数据 Excel 导出

#### 阶段五：C 端页面（第 10-11 周）

- [ ] 平台介绍页开发（含招商入驻区块、广告投放入口）
- [ ] 分站首页开发（广告版块渲染 + 快捷入口栏）
- [ ] 🆕 招商登记弹窗组件
- [ ] 🆕 广告需求登记弹窗组件
- [ ] Banner 轮播组件
- [ ] 推荐企业卡片组件
- [ ] 列表广告组件
- [ ] 侧边栏广告组件
- [ ] 弹窗广告组件
- [ ] 🆕 广告点击跳转（根据 linkType + 设备类型自动选择链接）
- [ ] 移动端响应式适配
- [ ] 广告展示/点击上报
- [ ] 🆕 用户分站记忆前端逻辑

#### 阶段六：数据统计（第 12 周）

- [ ] 广告展示/点击数据采集
- [ ] 数据统计定时聚合任务
- [ ] 广告数据概览 + 趋势图 + 排名
- [ ] 🆕 招商/需求登记数据统计（待处理/跟进中/已成交/已关闭 各状态数量）
- [ ] 数据导出（Excel）

#### 阶段七：集成联调（第 13-14 周）

- [ ] 与现有系统权限对接
- [ ] 菜单注册（含招商/需求管理、企微通知配置）
- [ ] 前端路由集成
- [ ] 接口联调
- [ ] 企业微信通知联调测试
- [ ] Redis 缓存优化
- [ ] 接口限流配置
- [ ] CDN 静态资源配置

#### 阶段八：测试上线（第 15-16 周）

- [ ] 功能测试
- [ ] 性能压测（广告接口 QPS > 1000）
- [ ] 🆕 企微通知稳定性测试
- [ ] 🆕 登记数据不可删改验证
- [ ] 安全审计
- [ ] 灰度发布
- [ ] 正式上线
- [ ] 运营培训（含企微通知使用、跟进记录填写规范）

---

## 三、技术风险与对策

| 风险项 | 风险等级 | 对策 |
|--------|---------|------|
| IP 定位不准确 | 中 | 多源定位 + 用户手动选择 + 分站记忆 |
| 广告数据缓存一致性 | 中 | 后台操作时主动清除缓存 + 缓存短 TTL |
| 高并发下广告接口性能 | 中 | Redis 缓存 + CDN + 接口限流 |
| 素材存储成本 | 低 | 限制文件大小 + 图片压缩 + 过期素材清理 |
| 与现有系统兼容性 | 中 | SPI 解耦 + 独立表 + 完善集成文档 |
| 移动端适配 | 低 | 响应式设计 + 真机测试 |
| 🆕 企微通知发送失败 | 中 | 失败重试（3 次）+ 失败状态记录 + 后台可查看 + 定时补发 |
| 🆕 登记表单被刷 | 中 | 验证码 + IP 频率限制 + User-Agent 校验 |
| 🆕 跟进记录数据安全 | 低 | 服务层禁止 UPDATE/DELETE + 接口层无修改/删除入口 |

---

## 四、验收标准

### 4.1 功能验收

- [ ] 用户访问首页自动根据 IP 跳转到对应分站
- [ ] 🆕 已登录用户再次访问时自动跳转到上次访问的分站
- [ ] 分站首页正确展示所有广告版块内容
- [ ] 🆕 广告点击可正确打开商家首页（PC/移动端）、公司官网或自定义链接
- [ ] 支持至少 5 种广告版块类型
- [ ] 后台可管理分站（增删改查 + 城市绑定）
- [ ] 后台可管理广告（增删改查 + 审核 + 上下线）
- [ ] 🆕 后台可区分赠送与收费广告，可筛选查看
- [ ] 🆕 赠送广告可记录赠送原因，收费广告关联定价方案
- [ ] 🆕 广告到期后根据配置自动下线或进入待调整状态
- [ ] 🆕 待调整状态的广告可重新分配位置或续期
- [ ] 后台可配置不同版块的广告价位
- [ ] 广告展示/点击数据正确统计
- [ ] 平台介绍页正常展示
- [ ] 🆕 首页和分站首页有招商入驻入口和广告需求登记入口
- [ ] 🆕 用户可通过弹窗表单提交招商登记和广告需求登记
- [ ] 🆕 登记提交后即时推送企业微信消息到指定责任人
- [ ] 🆕 运营后台可查看所有登记数据（不可删除、不可修改原始数据）
- [ ] 🆕 运营后台可添加多条跟进记录（不可修改、不可删除已有记录）
- [ ] 🆕 运营后台可更新登记处理状态
- [ ] 🆕 企业微信通知可在后台配置和测试

### 4.2 性能验收

- [ ] 分站首页加载时间 < 2 秒
- [ ] 广告数据接口响应时间 < 200ms
- [ ] 广告接口支持 1000+ QPS
- [ ] 后台管理页面操作响应 < 1 秒
- [ ] 🆕 企微通知送达延迟 < 5 秒
- [ ] 🆕 登记表单提交响应 < 1 秒

### 4.3 兼容性验收

- [ ] 支持 Chrome、Firefox、Safari、Edge 最新两个版本
- [ ] 移动端 iOS Safari、Android Chrome 正常显示
- [ ] 最小分辨率支持 375px 宽度
- [ ] 🆕 招商/需求登记弹窗在移动端正常展示和提交

### 4.4 安全验收

- [ ] 🆕 登记数据在数据库层面无 DELETE 和 UPDATE（除 process_status）操作
- [ ] 🆕 跟进记录在数据库层面无 DELETE 和 UPDATE 操作
- [ ] 🆕 登记表单有验证码保护
- [ ] 🆕 同 IP 每小时登记提交不超过 5 次
