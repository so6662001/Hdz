# 货袋子平台 — 模块集成方案与实施计划

> 版本：v1.0 | 日期：2026-02-23

---

## 一、模块集成方案

### 1.1 后端集成（Java / Spring Boot）

两个业务模块（分站管理、广告管理）以 **Maven 多模块** 形式组织，可独立打包为 JAR 引入现有系统。

#### Maven 项目结构

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
│       └── spi/                     # SPI 接口（权限、用户信息）
├── hdz-sub-station/                 # 分站管理模块
│   ├── pom.xml
│   └── src/main/java/com/hdz/substation/
│       ├── controller/              # 接口层
│       │   ├── StationController.java         # C端接口
│       │   └── StationAdminController.java    # 管理端接口
│       ├── service/                 # 业务层
│       │   ├── StationService.java
│       │   └── impl/
│       ├── mapper/                  # 数据访问层
│       ├── entity/                  # 实体类
│       ├── dto/                     # 数据传输对象
│       ├── vo/                      # 视图对象
│       └── config/                  # 模块配置
│           └── SubStationAutoConfiguration.java
├── hdz-advertisement/               # 广告管理模块
│   ├── pom.xml
│   └── src/main/java/com/hdz/advertisement/
│       ├── controller/
│       │   ├── AdDisplayController.java       # C端广告展示
│       │   ├── AdZoneAdminController.java     # 版块管理
│       │   ├── AdSlotAdminController.java     # 广告位管理
│       │   ├── AdContentAdminController.java  # 广告内容管理
│       │   ├── AdPricingAdminController.java  # 定价管理
│       │   ├── AdOrderAdminController.java    # 订单管理
│       │   └── AdStatsAdminController.java    # 数据统计
│       ├── service/
│       ├── mapper/
│       ├── entity/
│       ├── dto/
│       ├── vo/
│       ├── task/                    # 定时任务
│       │   ├── AdStatusTask.java    # 广告到期自动下线
│       │   └── AdStatsSyncTask.java # 统计数据定时同步
│       └── config/
│           └── AdvertisementAutoConfiguration.java
└── hdz-ui/                          # 前端模块
    ├── package.json
    └── src/
        ├── views/
        │   ├── admin/               # 后台管理页面
        │   └── client/              # C端页面
        ├── api/                     # API 调用层
        ├── components/              # 通用组件
        └── router/                  # 路由配置
```

#### 集成步骤

1. **添加 Maven 依赖**

在现有系统的 `pom.xml` 中添加模块依赖：

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
```

2. **实现 SPI 接口**

现有系统需实现以下 SPI 接口，模块通过 SPI 获取用户和权限信息：

```java
public interface HdzUserProvider {
    HdzUserInfo getCurrentUser();
    boolean hasPermission(String permissionCode);
}
```

3. **数据库迁移**

执行模块提供的 SQL 脚本创建所需表。模块使用独立的表（`hdz_` 前缀），不影响现有表。

4. **配置文件**

在 `application.yml` 中添加模块配置：

```yaml
hdz:
  sub-station:
    ip-location-provider: ip2region  # IP定位方式
    default-station-code: default    # 默认分站编码
  advertisement:
    upload-path: /data/hdz/ad/       # 素材上传路径
    max-file-size: 5MB               # 最大文件大小
    cache-ttl: 600                   # 广告缓存TTL(秒)
```

5. **菜单注册**

模块启动时自动注册菜单项到现有系统的菜单表中（或通过配置文件静态配置）。

---

### 1.2 前端集成

#### 方案 A：路由模块方式（推荐）

将管理页面作为独立路由模块注入现有 Vue 项目：

```javascript
// 在现有系统的 router 中引入
import subStationRoutes from '@hdz/sub-station/router'
import adRoutes from '@hdz/advertisement/router'

const routes = [
  ...existingRoutes,
  ...subStationRoutes,
  ...adRoutes
]
```

#### 方案 B：iframe 嵌入方式

将管理页面独立部署，通过 iframe 嵌入现有系统：

```html
<iframe src="/hdz-admin/sub-station" frameborder="0" width="100%" height="100%"></iframe>
```

#### 方案 C：微前端方式

使用 qiankun 或 Wujie 微前端方案，将管理页面作为子应用接入。

---

### 1.3 权限设计

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
| hdz:ad:pricing:manage | 定价管理 | 管理广告定价 |
| hdz:ad:order:manage | 订单管理 | 管理广告订单 |
| hdz:ad:stats:view | 数据统计 | 查看广告统计 |

---

## 二、实施计划

### 2.1 阶段划分

| 阶段 | 时间 | 主要工作 |
|------|------|---------|
| 阶段一：基础搭建 | 第 1-2 周 | 项目脚手架、数据库建表、基础框架 |
| 阶段二：分站模块 | 第 3-4 周 | 分站管理 CRUD、城市绑定、IP 定位 |
| 阶段三：广告模块 | 第 5-7 周 | 广告版块/位/内容管理、审核流程、定价体系 |
| 阶段四：C端页面 | 第 8-9 周 | 平台介绍页、分站首页、城市选择页 |
| 阶段五：数据统计 | 第 10 周 | 广告统计、数据看板、报表导出 |
| 阶段六：集成联调 | 第 11-12 周 | 与现有系统集成、联调、性能优化 |
| 阶段七：测试上线 | 第 13-14 周 | 功能测试、压测、灰度上线 |

### 2.2 各阶段详细任务

#### 阶段一：基础搭建（第 1-2 周）

- [ ] 创建 Maven 多模块项目结构
- [ ] 搭建公共模块（BaseEntity、Result、异常处理）
- [ ] 集成 MyBatis-Plus + 代码生成器
- [ ] 数据库建表（执行 DDL 脚本）
- [ ] 集成 Redis 缓存配置
- [ ] 集成 Swagger/Knife4j 文档
- [ ] 搭建前端 Vue 3 项目（Element Plus + 路由）
- [ ] 实现文件上传通用服务

#### 阶段二：分站模块（第 3-4 周）

- [ ] 分站 CRUD 接口开发（后台）
- [ ] 分站城市绑定管理
- [ ] 分站配置管理
- [ ] IP 定位服务集成（ip2region）
- [ ] C 端分站定位与跳转逻辑
- [ ] 分站列表/详情 C 端接口
- [ ] 分站管理前端页面（列表、新增、编辑）
- [ ] 城市选择前端页面

#### 阶段三：广告模块（第 5-7 周）

- [ ] 广告版块管理接口 + 页面
- [ ] 广告位管理接口 + 页面
- [ ] 广告内容管理接口 + 页面
- [ ] 广告审核流程
- [ ] 广告上下线管理
- [ ] 广告定价管理接口 + 页面
- [ ] 广告订单管理接口 + 页面
- [ ] 广告素材上传与管理
- [ ] 广告到期自动下线定时任务

#### 阶段四：C端页面（第 8-9 周）

- [ ] 平台介绍页开发（改造现有首页）
- [ ] 分站首页开发（广告版块渲染）
- [ ] Banner 轮播组件
- [ ] 推荐企业卡片组件
- [ ] 列表广告组件
- [ ] 侧边栏广告组件
- [ ] 弹窗广告组件
- [ ] 移动端响应式适配
- [ ] 广告展示/点击上报

#### 阶段五：数据统计（第 10 周）

- [ ] 广告展示/点击数据采集
- [ ] 数据统计定时聚合任务
- [ ] 数据概览接口 + 页面
- [ ] 趋势图表（ECharts）
- [ ] 广告排名
- [ ] 数据导出（Excel）

#### 阶段六：集成联调（第 11-12 周）

- [ ] 与现有系统权限对接
- [ ] 菜单注册
- [ ] 前端路由集成
- [ ] 接口联调
- [ ] Redis 缓存优化
- [ ] 接口限流配置
- [ ] CDN 静态资源配置

#### 阶段七：测试上线（第 13-14 周）

- [ ] 功能测试
- [ ] 性能压测（广告接口 QPS > 1000）
- [ ] 安全审计
- [ ] 灰度发布
- [ ] 正式上线
- [ ] 运营培训

---

## 三、技术风险与对策

| 风险项 | 风险等级 | 对策 |
|--------|---------|------|
| IP 定位不准确 | 中 | 多源定位（ip2region + 高德 API），支持用户手动选择 |
| 广告数据缓存一致性 | 中 | 后台操作时主动清除缓存 + 缓存短 TTL |
| 高并发下广告接口性能 | 中 | Redis 缓存 + CDN + 接口限流 |
| 素材存储成本 | 低 | 限制文件大小 + 图片压缩 + 过期素材清理 |
| 与现有系统兼容性 | 中 | SPI 解耦 + 独立表 + 完善集成文档 |
| 移动端适配 | 低 | 响应式设计 + 真机测试 |

---

## 四、验收标准

### 4.1 功能验收

- [ ] 用户访问首页自动根据 IP 跳转到对应分站
- [ ] 分站首页正确展示所有广告版块内容
- [ ] 支持至少 5 种广告版块类型
- [ ] 后台可管理分站（增删改查 + 城市绑定）
- [ ] 后台可管理广告（增删改查 + 审核 + 上下线）
- [ ] 后台可配置不同版块的广告价位
- [ ] 广告展示/点击数据正确统计
- [ ] 平台介绍页正常展示

### 4.2 性能验收

- [ ] 分站首页加载时间 < 2 秒
- [ ] 广告数据接口响应时间 < 200ms
- [ ] 广告接口支持 1000+ QPS
- [ ] 后台管理页面操作响应 < 1 秒

### 4.3 兼容性验收

- [ ] 支持 Chrome、Firefox、Safari、Edge 最新两个版本
- [ ] 移动端 iOS Safari、Android Chrome 正常显示
- [ ] 最小分辨率支持 375px 宽度
