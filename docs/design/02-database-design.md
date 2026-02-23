# 货袋子平台 — 数据库设计

> 版本：v2.0 | 日期：2026-02-23  
> 更新说明：广告表增加赠送/收费模式、位置调整、跳转链接类型；新增招商登记表、广告需求登记表、跟进记录表、用户分站记忆表、企微通知配置表

---

## 一、数据库总览

所有表统一使用 `hdz_` 前缀，采用 InnoDB 引擎，字符集 utf8mb4。

### 表清单

| 序号 | 表名 | 说明 | 所属模块 |
|------|------|------|---------|
| 1 | hdz_sub_station | 分站信息表 | 分站管理 |
| 2 | hdz_sub_station_city | 分站-城市绑定表 | 分站管理 |
| 3 | hdz_sub_station_config | 分站配置表 | 分站管理 |
| 4 | hdz_user_station | 用户分站记忆表 | 分站管理 |
| 5 | hdz_ad_zone | 广告版块/区域表 | 广告管理 |
| 6 | hdz_ad_slot | 广告位表 | 广告管理 |
| 7 | hdz_ad_content | 广告内容表（v2：含赠送/收费、位置调整、链接类型） | 广告管理 |
| 8 | hdz_ad_pricing | 广告定价表 | 广告管理 |
| 9 | hdz_ad_order | 广告订单表 | 广告管理 |
| 10 | hdz_ad_stats | 广告统计表 | 广告管理 |
| 11 | hdz_business_inquiry | 招商登记表 | 招商/需求管理 |
| 12 | hdz_ad_demand | 广告需求登记表 | 招商/需求管理 |
| 13 | hdz_follow_up_record | 跟进记录表 | 招商/需求管理 |
| 14 | hdz_wechat_notify_config | 企业微信通知配置表 | 公共模块 |
| 15 | hdz_city | 城市字典表 | 公共模块 |

---

## 二、ER 关系图

```
hdz_city ──────┐
               │ N:1
               ▼
hdz_sub_station_city ──── hdz_sub_station ◄──── hdz_user_station
                              │
                    ┌─────────┼──────────┐
                    │         │          │
                    ▼         ▼          ▼
        hdz_sub_station    hdz_ad_zone  hdz_sub_station_config
             _config           │
                               │ 1:N
                               ▼
                         hdz_ad_slot
                               │ 1:N
                               ▼
                        hdz_ad_content ─────┐
                          │    │    │       │
                    ┌─────┘    │    └───┐   │
                    ▼          ▼       ▼   │
              hdz_ad_order  hdz_ad_stats   │
                    │                       │
                    ▼                       │
              hdz_ad_pricing               │
                                            │
hdz_sub_station ◄────────────┐              │
        │                    │              │
        ▼                    ▼              │
  hdz_business_inquiry   hdz_ad_demand     │
        │                    │              │
        └────────┬───────────┘              │
                 │                          │
                 ▼                          │
        hdz_follow_up_record               │
        (ref_type + ref_id 关联            │
         上面三种主表)◄─────────────────────┘

hdz_wechat_notify_config（独立配置表）
```

---

## 三、表结构详细设计

### 3.1 hdz_sub_station（分站信息表）

存储各个地区分站的基本信息。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| station_code | VARCHAR(32) | NO | | 分站编码（唯一，如 beijing, shanghai） |
| station_name | VARCHAR(64) | NO | | 分站名称（如 "北京站"） |
| station_logo | VARCHAR(256) | YES | | 分站 Logo URL |
| station_banner | VARCHAR(256) | YES | | 分站顶部 Banner 图 URL |
| description | VARCHAR(512) | YES | | 分站简介 |
| contact_phone | VARCHAR(20) | YES | | 联系电话 |
| contact_email | VARCHAR(64) | YES | | 联系邮箱 |
| sort_order | INT | NO | 0 | 排序号（越小越靠前） |
| status | TINYINT | NO | 1 | 状态：0=停用, 1=启用, 2=筹备中 |
| is_default | TINYINT | NO | 0 | 是否默认分站：0=否, 1=是 |
| seo_title | VARCHAR(128) | YES | | SEO 标题 |
| seo_keywords | VARCHAR(256) | YES | | SEO 关键词 |
| seo_description | VARCHAR(512) | YES | | SEO 描述 |
| create_by | VARCHAR(64) | YES | | 创建人 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |
| update_by | VARCHAR(64) | YES | | 更新人 |
| update_time | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | TINYINT | NO | 0 | 逻辑删除：0=未删除, 1=已删除 |

```sql
CREATE TABLE `hdz_sub_station` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `station_code` VARCHAR(32) NOT NULL COMMENT '分站编码',
  `station_name` VARCHAR(64) NOT NULL COMMENT '分站名称',
  `station_logo` VARCHAR(256) DEFAULT NULL COMMENT '分站Logo',
  `station_banner` VARCHAR(256) DEFAULT NULL COMMENT '分站Banner',
  `description` VARCHAR(512) DEFAULT NULL COMMENT '分站简介',
  `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `contact_email` VARCHAR(64) DEFAULT NULL COMMENT '联系邮箱',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0停用,1启用,2筹备中',
  `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认分站',
  `seo_title` VARCHAR(128) DEFAULT NULL COMMENT 'SEO标题',
  `seo_keywords` VARCHAR(256) DEFAULT NULL COMMENT 'SEO关键词',
  `seo_description` VARCHAR(512) DEFAULT NULL COMMENT 'SEO描述',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新人',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_station_code` (`station_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分站信息表';
```

---

### 3.2 hdz_sub_station_city（分站-城市绑定表）

一个分站可绑定多个城市，一个城市只能属于一个分站。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| station_id | BIGINT | NO | | 分站 ID |
| city_code | VARCHAR(16) | NO | | 城市编码（对应 hdz_city） |
| city_name | VARCHAR(64) | NO | | 城市名称（冗余存储） |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |

```sql
CREATE TABLE `hdz_sub_station_city` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `station_id` BIGINT NOT NULL COMMENT '分站ID',
  `city_code` VARCHAR(16) NOT NULL COMMENT '城市编码',
  `city_name` VARCHAR(64) NOT NULL COMMENT '城市名称',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_city_code` (`city_code`),
  KEY `idx_station_id` (`station_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分站城市绑定表';
```

---

### 3.3 hdz_sub_station_config（分站配置表）

分站个性化配置，采用 K-V 方式灵活扩展。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| station_id | BIGINT | NO | | 分站 ID |
| config_key | VARCHAR(64) | NO | | 配置键 |
| config_value | TEXT | YES | | 配置值 |
| config_desc | VARCHAR(128) | YES | | 配置说明 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

```sql
CREATE TABLE `hdz_sub_station_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `station_id` BIGINT NOT NULL COMMENT '分站ID',
  `config_key` VARCHAR(64) NOT NULL COMMENT '配置键',
  `config_value` TEXT DEFAULT NULL COMMENT '配置值',
  `config_desc` VARCHAR(128) DEFAULT NULL COMMENT '配置说明',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_station_config` (`station_id`, `config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分站配置表';
```

---

### 3.4 hdz_user_station（用户分站记忆表） 🆕

记录已登录用户上次访问的分站，下次登录自动跳转。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| user_id | BIGINT | NO | | 用户 ID（对接现有用户体系） |
| station_id | BIGINT | NO | | 分站 ID |
| station_code | VARCHAR(32) | NO | | 分站编码（冗余，便于直接跳转） |
| last_visit_time | DATETIME | NO | | 最后访问时间 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

```sql
CREATE TABLE `hdz_user_station` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `station_id` BIGINT NOT NULL COMMENT '分站ID',
  `station_code` VARCHAR(32) NOT NULL COMMENT '分站编码',
  `last_visit_time` DATETIME NOT NULL COMMENT '最后访问时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_station_id` (`station_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户分站记忆表';
```

---

### 3.5 hdz_ad_zone（广告版块表）

定义分站首页的广告版块/区域，如顶部 Banner、推荐位、列表广告等。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| zone_code | VARCHAR(32) | NO | | 版块编码（唯一） |
| zone_name | VARCHAR(64) | NO | | 版块名称 |
| zone_type | VARCHAR(32) | NO | | 版块类型：BANNER/RECOMMEND/LIST/SIDEBAR/POPUP |
| description | VARCHAR(256) | YES | | 版块说明 |
| max_slots | INT | NO | 1 | 该版块最大广告位数量 |
| width | INT | YES | | 建议宽度（px） |
| height | INT | YES | | 建议高度（px） |
| sort_order | INT | NO | 0 | 排序号 |
| status | TINYINT | NO | 1 | 状态：0=停用, 1=启用 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | TINYINT | NO | 0 | 逻辑删除 |

```sql
CREATE TABLE `hdz_ad_zone` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `zone_code` VARCHAR(32) NOT NULL COMMENT '版块编码',
  `zone_name` VARCHAR(64) NOT NULL COMMENT '版块名称',
  `zone_type` VARCHAR(32) NOT NULL COMMENT '版块类型:BANNER/RECOMMEND/LIST/SIDEBAR/POPUP',
  `description` VARCHAR(256) DEFAULT NULL COMMENT '版块说明',
  `max_slots` INT NOT NULL DEFAULT 1 COMMENT '最大广告位数',
  `width` INT DEFAULT NULL COMMENT '建议宽度px',
  `height` INT DEFAULT NULL COMMENT '建议高度px',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0停用,1启用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_zone_code` (`zone_code`),
  KEY `idx_zone_type` (`zone_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告版块表';
```

---

### 3.6 hdz_ad_slot（广告位表）

每个版块下的具体广告位，与分站关联。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| station_id | BIGINT | NO | | 所属分站 ID |
| zone_id | BIGINT | NO | | 所属版块 ID |
| slot_name | VARCHAR(64) | NO | | 广告位名称 |
| slot_index | INT | NO | 0 | 位置序号（版块内排序） |
| status | TINYINT | NO | 1 | 状态：0=停用, 1=空闲, 2=已占用 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | TINYINT | NO | 0 | 逻辑删除 |

```sql
CREATE TABLE `hdz_ad_slot` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `station_id` BIGINT NOT NULL COMMENT '分站ID',
  `zone_id` BIGINT NOT NULL COMMENT '版块ID',
  `slot_name` VARCHAR(64) NOT NULL COMMENT '广告位名称',
  `slot_index` INT NOT NULL DEFAULT 0 COMMENT '位置序号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0停用,1空闲,2已占用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_station_zone` (`station_id`, `zone_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告位表';
```

---

### 3.7 hdz_ad_content（广告内容表）🔄 v2 更新

具体的广告内容。**v2 新增字段：charge_type（赠送/收费）、charge_remark、position_adjustable（到期位置可调整）、link_type（跳转链接类型）、link_url_mobile。**

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| slot_id | BIGINT | NO | | 广告位 ID |
| station_id | BIGINT | NO | | 分站 ID（冗余） |
| zone_id | BIGINT | NO | | 版块 ID（冗余） |
| title | VARCHAR(128) | NO | | 广告标题 |
| subtitle | VARCHAR(256) | YES | | 广告副标题 |
| image_url | VARCHAR(512) | NO | | 广告图片 URL |
| **link_type** | VARCHAR(16) | NO | CUSTOM | 🆕 跳转类型：STORE_PC/STORE_MOBILE/OFFICIAL_SITE/CUSTOM |
| link_url | VARCHAR(512) | YES | | 点击跳转链接（PC 端） |
| **link_url_mobile** | VARCHAR(512) | YES | | 🆕 移动端跳转链接（为空时 PC/移动端统一使用 link_url） |
| link_target | VARCHAR(16) | NO | _blank | 链接打开方式：_self / _blank |
| advertiser_name | VARCHAR(128) | YES | | 广告主名称 |
| advertiser_phone | VARCHAR(20) | YES | | 广告主联系电话 |
| content_type | VARCHAR(16) | NO | IMAGE | 素材类型：IMAGE/VIDEO/HTML |
| video_url | VARCHAR(512) | YES | | 视频素材 URL |
| html_content | TEXT | YES | | 富文本素材内容 |
| **charge_type** | VARCHAR(8) | NO | FREE | 🆕 收费模式：FREE=赠送, PAID=收费 |
| **charge_remark** | VARCHAR(256) | YES | | 🆕 赠送/收费备注（赠送时填写赠送原因） |
| **position_adjustable** | TINYINT | NO | 0 | 🆕 到期后位置是否可调整：0=否（到期自动下线），1=是（到期后进入待调整状态） |
| sort_weight | INT | NO | 0 | 排序权重（越大越靠前） |
| start_time | DATETIME | YES | | 投放开始时间 |
| end_time | DATETIME | YES | | 投放结束时间 |
| audit_status | TINYINT | NO | 0 | 审核状态：0=待审核, 1=通过, 2=拒绝 |
| audit_remark | VARCHAR(256) | YES | | 审核备注 |
| audit_by | VARCHAR(64) | YES | | 审核人 |
| audit_time | DATETIME | YES | | 审核时间 |
| status | TINYINT | NO | 0 | 上线状态：0=下线, 1=上线, 3=待调整（到期可调整位置） |
| click_count | INT | NO | 0 | 累计点击数 |
| view_count | INT | NO | 0 | 累计展示数 |
| create_by | VARCHAR(64) | YES | | 创建人 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |
| update_by | VARCHAR(64) | YES | | 更新人 |
| update_time | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | TINYINT | NO | 0 | 逻辑删除 |

```sql
CREATE TABLE `hdz_ad_content` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `slot_id` BIGINT NOT NULL COMMENT '广告位ID',
  `station_id` BIGINT NOT NULL COMMENT '分站ID',
  `zone_id` BIGINT NOT NULL COMMENT '版块ID',
  `title` VARCHAR(128) NOT NULL COMMENT '广告标题',
  `subtitle` VARCHAR(256) DEFAULT NULL COMMENT '广告副标题',
  `image_url` VARCHAR(512) NOT NULL COMMENT '广告图片',
  `link_type` VARCHAR(16) NOT NULL DEFAULT 'CUSTOM' COMMENT '跳转类型:STORE_PC/STORE_MOBILE/OFFICIAL_SITE/CUSTOM',
  `link_url` VARCHAR(512) DEFAULT NULL COMMENT '跳转链接(PC端)',
  `link_url_mobile` VARCHAR(512) DEFAULT NULL COMMENT '移动端跳转链接',
  `link_target` VARCHAR(16) NOT NULL DEFAULT '_blank' COMMENT '打开方式',
  `advertiser_name` VARCHAR(128) DEFAULT NULL COMMENT '广告主名称',
  `advertiser_phone` VARCHAR(20) DEFAULT NULL COMMENT '广告主电话',
  `content_type` VARCHAR(16) NOT NULL DEFAULT 'IMAGE' COMMENT '素材类型:IMAGE/VIDEO/HTML',
  `video_url` VARCHAR(512) DEFAULT NULL COMMENT '视频URL',
  `html_content` TEXT DEFAULT NULL COMMENT '富文本内容',
  `charge_type` VARCHAR(8) NOT NULL DEFAULT 'FREE' COMMENT '收费模式:FREE赠送,PAID收费',
  `charge_remark` VARCHAR(256) DEFAULT NULL COMMENT '赠送/收费备注',
  `position_adjustable` TINYINT NOT NULL DEFAULT 0 COMMENT '到期后位置可调整:0否,1是',
  `sort_weight` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
  `start_time` DATETIME DEFAULT NULL COMMENT '投放开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '投放结束时间',
  `audit_status` TINYINT NOT NULL DEFAULT 0 COMMENT '审核:0待审核,1通过,2拒绝',
  `audit_remark` VARCHAR(256) DEFAULT NULL COMMENT '审核备注',
  `audit_by` VARCHAR(64) DEFAULT NULL COMMENT '审核人',
  `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0下线,1上线,3待调整',
  `click_count` INT NOT NULL DEFAULT 0 COMMENT '点击数',
  `view_count` INT NOT NULL DEFAULT 0 COMMENT '展示数',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新人',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_slot_id` (`slot_id`),
  KEY `idx_station_zone` (`station_id`, `zone_id`),
  KEY `idx_audit_status` (`audit_status`),
  KEY `idx_status_time` (`status`, `start_time`, `end_time`),
  KEY `idx_charge_type` (`charge_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告内容表';
```

#### link_type 跳转类型说明

| 值 | 说明 | 行为 |
|----|------|------|
| STORE_PC | 商家首页（PC端） | 点击后打开商家在平台上的 PC 版店铺页面 |
| STORE_MOBILE | 商家首页（移动端） | 点击后打开商家在平台上的移动版店铺页面 |
| OFFICIAL_SITE | 公司官网 | 点击后打开广告主的公司官方网站 |
| CUSTOM | 自定义链接 | 点击后打开运营手动填写的任意 URL |

#### charge_type 收费模式说明

| 值 | 说明 | 业务逻辑 |
|----|------|---------|
| FREE | 赠送（免费） | 前期推广阶段免费提供给企业，charge_remark 填写赠送原因 |
| PAID | 收费 | 正式商业投放，需关联定价方案并创建订单 |

#### position_adjustable 到期位置调整说明

| 值 | 说明 | 到期后行为 |
|----|------|-----------|
| 0 | 不可调整 | 到期后自动下线（status → 0） |
| 1 | 可调整 | 到期后进入"待调整"状态（status → 3），运营可重新分配广告位或续期 |

---

### 3.8 hdz_ad_pricing（广告定价表）

不同版块的广告价位配置。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| zone_id | BIGINT | NO | | 版块 ID |
| station_id | BIGINT | YES | | 分站 ID（NULL=全局定价） |
| pricing_name | VARCHAR(64) | NO | | 价位名称 |
| price_type | VARCHAR(16) | NO | | 计费方式：DAY/WEEK/MONTH/QUARTER/YEAR/CPM/CPC |
| price | DECIMAL(10,2) | NO | | 价格（元） |
| original_price | DECIMAL(10,2) | YES | | 原价（用于展示折扣） |
| description | VARCHAR(256) | YES | | 价位说明 |
| sort_order | INT | NO | 0 | 排序号 |
| status | TINYINT | NO | 1 | 状态：0=停用, 1=启用 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | TINYINT | NO | 0 | 逻辑删除 |

```sql
CREATE TABLE `hdz_ad_pricing` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `zone_id` BIGINT NOT NULL COMMENT '版块ID',
  `station_id` BIGINT DEFAULT NULL COMMENT '分站ID(NULL为全局)',
  `pricing_name` VARCHAR(64) NOT NULL COMMENT '价位名称',
  `price_type` VARCHAR(16) NOT NULL COMMENT '计费方式:DAY/WEEK/MONTH/QUARTER/YEAR/CPM/CPC',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
  `description` VARCHAR(256) DEFAULT NULL COMMENT '价位说明',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0停用,1启用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_zone_station` (`zone_id`, `station_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告定价表';
```

---

### 3.9 hdz_ad_order（广告订单表）

记录广告投放的商业订单（仅 charge_type=PAID 时创建）。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| order_no | VARCHAR(32) | NO | | 订单编号（唯一） |
| ad_content_id | BIGINT | NO | | 广告内容 ID |
| station_id | BIGINT | NO | | 分站 ID |
| zone_id | BIGINT | NO | | 版块 ID |
| pricing_id | BIGINT | NO | | 定价 ID |
| advertiser_name | VARCHAR(128) | NO | | 广告主名称 |
| advertiser_phone | VARCHAR(20) | YES | | 广告主联系方式 |
| amount | DECIMAL(10,2) | NO | | 订单金额 |
| pay_status | TINYINT | NO | 0 | 支付状态：0=未支付, 1=已支付, 2=已退款 |
| start_time | DATETIME | NO | | 广告开始时间 |
| end_time | DATETIME | NO | | 广告结束时间 |
| remark | VARCHAR(256) | YES | | 备注 |
| create_by | VARCHAR(64) | YES | | 创建人 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | TINYINT | NO | 0 | 逻辑删除 |

```sql
CREATE TABLE `hdz_ad_order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单编号',
  `ad_content_id` BIGINT NOT NULL COMMENT '广告内容ID',
  `station_id` BIGINT NOT NULL COMMENT '分站ID',
  `zone_id` BIGINT NOT NULL COMMENT '版块ID',
  `pricing_id` BIGINT NOT NULL COMMENT '定价ID',
  `advertiser_name` VARCHAR(128) NOT NULL COMMENT '广告主名称',
  `advertiser_phone` VARCHAR(20) DEFAULT NULL COMMENT '广告主电话',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `pay_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付:0未支付,1已支付,2已退款',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `remark` VARCHAR(256) DEFAULT NULL COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_station_id` (`station_id`),
  KEY `idx_ad_content_id` (`ad_content_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告订单表';
```

---

### 3.10 hdz_ad_stats（广告统计表）

按日统计广告的展示量与点击量。

```sql
CREATE TABLE `hdz_ad_stats` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `ad_content_id` BIGINT NOT NULL COMMENT '广告内容ID',
  `station_id` BIGINT NOT NULL COMMENT '分站ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `view_count` INT NOT NULL DEFAULT 0 COMMENT '展示次数',
  `click_count` INT NOT NULL DEFAULT 0 COMMENT '点击次数',
  `unique_view` INT NOT NULL DEFAULT 0 COMMENT '独立展示数',
  `unique_click` INT NOT NULL DEFAULT 0 COMMENT '独立点击数',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ad_date` (`ad_content_id`, `stat_date`),
  KEY `idx_station_date` (`station_id`, `stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告统计表';
```

---

### 3.11 hdz_business_inquiry（招商登记表） 🆕

前端招商入口提交的登记数据。**注意：此表数据不可删除、不可修改**，仅允许更新 process_status。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| inquiry_no | VARCHAR(32) | NO | | 登记编号（唯一，自动生成） |
| station_id | BIGINT | YES | | 来源分站 ID（从哪个分站页面提交的） |
| station_name | VARCHAR(64) | YES | | 来源分站名称（冗余） |
| company_name | VARCHAR(128) | NO | | 企业名称 |
| contact_name | VARCHAR(64) | NO | | 联系人姓名 |
| contact_phone | VARCHAR(20) | NO | | 联系电话 |
| contact_email | VARCHAR(64) | YES | | 联系邮箱 |
| industry | VARCHAR(64) | YES | | 所属行业 |
| city_name | VARCHAR(64) | YES | | 所在城市 |
| cooperation_type | VARCHAR(32) | YES | | 合作意向类型：JOIN（入驻）/AGENT（代理）/OTHER |
| description | TEXT | YES | | 详细描述/备注 |
| source | VARCHAR(16) | NO | WEB | 来源渠道：WEB=官网, MOBILE=移动端 |
| process_status | TINYINT | NO | 0 | 处理状态：0=待处理, 1=跟进中, 2=已成交, 3=已关闭 |
| ip_address | VARCHAR(45) | YES | | 提交 IP |
| user_agent | VARCHAR(256) | YES | | 浏览器 UA |
| notify_sent | TINYINT | NO | 0 | 企微通知是否已发送：0=未发送, 1=已发送, 2=发送失败 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 登记时间（不可修改） |

```sql
CREATE TABLE `hdz_business_inquiry` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `inquiry_no` VARCHAR(32) NOT NULL COMMENT '登记编号',
  `station_id` BIGINT DEFAULT NULL COMMENT '来源分站ID',
  `station_name` VARCHAR(64) DEFAULT NULL COMMENT '来源分站名称',
  `company_name` VARCHAR(128) NOT NULL COMMENT '企业名称',
  `contact_name` VARCHAR(64) NOT NULL COMMENT '联系人',
  `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `contact_email` VARCHAR(64) DEFAULT NULL COMMENT '联系邮箱',
  `industry` VARCHAR(64) DEFAULT NULL COMMENT '行业',
  `city_name` VARCHAR(64) DEFAULT NULL COMMENT '所在城市',
  `cooperation_type` VARCHAR(32) DEFAULT NULL COMMENT '合作意向:JOIN/AGENT/OTHER',
  `description` TEXT DEFAULT NULL COMMENT '详细描述',
  `source` VARCHAR(16) NOT NULL DEFAULT 'WEB' COMMENT '来源:WEB/MOBILE',
  `process_status` TINYINT NOT NULL DEFAULT 0 COMMENT '处理:0待处理,1跟进中,2已成交,3已关闭',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT '提交IP',
  `user_agent` VARCHAR(256) DEFAULT NULL COMMENT '浏览器UA',
  `notify_sent` TINYINT NOT NULL DEFAULT 0 COMMENT '企微通知:0未发送,1已发送,2失败',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登记时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inquiry_no` (`inquiry_no`),
  KEY `idx_station_id` (`station_id`),
  KEY `idx_process_status` (`process_status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='招商登记表';
```

---

### 3.12 hdz_ad_demand（广告需求登记表） 🆕

前端广告需求登记入口提交的数据。**注意：此表数据不可删除、不可修改**，仅允许更新 process_status。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| demand_no | VARCHAR(32) | NO | | 登记编号（唯一，自动生成） |
| station_id | BIGINT | YES | | 来源分站 ID |
| station_name | VARCHAR(64) | YES | | 来源分站名称（冗余） |
| company_name | VARCHAR(128) | NO | | 企业名称 |
| contact_name | VARCHAR(64) | NO | | 联系人姓名 |
| contact_phone | VARCHAR(20) | NO | | 联系电话 |
| contact_email | VARCHAR(64) | YES | | 联系邮箱 |
| target_zone_type | VARCHAR(32) | YES | | 意向广告版块：BANNER/RECOMMEND/LIST/SIDEBAR/POPUP |
| budget_range | VARCHAR(32) | YES | | 预算范围：如 "3000-5000" 或 "面议" |
| duration | VARCHAR(32) | YES | | 期望投放时长：MONTH/QUARTER/YEAR/OTHER |
| description | TEXT | YES | | 需求详细描述 |
| source | VARCHAR(16) | NO | WEB | 来源渠道 |
| process_status | TINYINT | NO | 0 | 处理状态：0=待处理, 1=跟进中, 2=已成交, 3=已关闭 |
| ip_address | VARCHAR(45) | YES | | 提交 IP |
| user_agent | VARCHAR(256) | YES | | 浏览器 UA |
| notify_sent | TINYINT | NO | 0 | 企微通知是否已发送 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 登记时间（不可修改） |

```sql
CREATE TABLE `hdz_ad_demand` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `demand_no` VARCHAR(32) NOT NULL COMMENT '登记编号',
  `station_id` BIGINT DEFAULT NULL COMMENT '来源分站ID',
  `station_name` VARCHAR(64) DEFAULT NULL COMMENT '来源分站名称',
  `company_name` VARCHAR(128) NOT NULL COMMENT '企业名称',
  `contact_name` VARCHAR(64) NOT NULL COMMENT '联系人',
  `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `contact_email` VARCHAR(64) DEFAULT NULL COMMENT '联系邮箱',
  `target_zone_type` VARCHAR(32) DEFAULT NULL COMMENT '意向版块:BANNER/RECOMMEND/LIST/SIDEBAR/POPUP',
  `budget_range` VARCHAR(32) DEFAULT NULL COMMENT '预算范围',
  `duration` VARCHAR(32) DEFAULT NULL COMMENT '期望时长:MONTH/QUARTER/YEAR/OTHER',
  `description` TEXT DEFAULT NULL COMMENT '需求描述',
  `source` VARCHAR(16) NOT NULL DEFAULT 'WEB' COMMENT '来源:WEB/MOBILE',
  `process_status` TINYINT NOT NULL DEFAULT 0 COMMENT '处理:0待处理,1跟进中,2已成交,3已关闭',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT '提交IP',
  `user_agent` VARCHAR(256) DEFAULT NULL COMMENT '浏览器UA',
  `notify_sent` TINYINT NOT NULL DEFAULT 0 COMMENT '企微通知:0未发送,1已发送,2失败',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登记时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_demand_no` (`demand_no`),
  KEY `idx_station_id` (`station_id`),
  KEY `idx_process_status` (`process_status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告需求登记表';
```

---

### 3.13 hdz_follow_up_record（跟进记录表） 🆕

支持对招商登记、广告需求登记、广告内容的跟进记录（一条登记可有多条跟进记录）。**注意：跟进记录一旦填写不可删除、不可修改。**

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| ref_type | VARCHAR(16) | NO | | 关联类型：INQUIRY=招商登记, DEMAND=广告需求, AD=广告内容 |
| ref_id | BIGINT | NO | | 关联记录 ID |
| follow_content | TEXT | NO | | 跟进内容 |
| follow_result | VARCHAR(32) | YES | | 处理结果：CONTACTED=已联系, NEGOTIATING=洽谈中, DEAL=已成交, CLOSED=已关闭, OTHER=其他 |
| follow_by | VARCHAR(64) | NO | | 跟进人 |
| follow_by_name | VARCHAR(64) | YES | | 跟进人姓名（冗余） |
| follow_time | DATETIME | NO | | 跟进时间 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 记录创建时间（不可修改） |

```sql
CREATE TABLE `hdz_follow_up_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `ref_type` VARCHAR(16) NOT NULL COMMENT '关联类型:INQUIRY/DEMAND/AD',
  `ref_id` BIGINT NOT NULL COMMENT '关联记录ID',
  `follow_content` TEXT NOT NULL COMMENT '跟进内容',
  `follow_result` VARCHAR(32) DEFAULT NULL COMMENT '处理结果:CONTACTED/NEGOTIATING/DEAL/CLOSED/OTHER',
  `follow_by` VARCHAR(64) NOT NULL COMMENT '跟进人',
  `follow_by_name` VARCHAR(64) DEFAULT NULL COMMENT '跟进人姓名',
  `follow_time` DATETIME NOT NULL COMMENT '跟进时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_ref` (`ref_type`, `ref_id`),
  KEY `idx_follow_time` (`follow_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='跟进记录表';
```

---

### 3.14 hdz_wechat_notify_config（企业微信通知配置表） 🆕

存储企业微信通知的配置信息。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| config_name | VARCHAR(64) | NO | | 配置名称 |
| notify_type | VARCHAR(16) | NO | | 通知类型：INQUIRY=招商登记, DEMAND=广告需求, AD_EXPIRE=广告到期 |
| channel_type | VARCHAR(16) | NO | | 推送渠道：WEBHOOK / APP_MSG |
| webhook_url | VARCHAR(512) | YES | | Webhook URL |
| corp_id | VARCHAR(64) | YES | | 企业微信 CorpId |
| agent_id | VARCHAR(64) | YES | | 应用 AgentId |
| agent_secret | VARCHAR(128) | YES | | 应用 Secret（加密存储） |
| receiver_user_ids | VARCHAR(512) | YES | | 接收人企微用户 ID（多个用逗号分隔） |
| enabled | TINYINT | NO | 1 | 是否启用：0=关闭, 1=启用 |
| silent_start | VARCHAR(5) | YES | | 静默开始时间（如 "23:00"） |
| silent_end | VARCHAR(5) | YES | | 静默结束时间（如 "08:00"） |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

```sql
CREATE TABLE `hdz_wechat_notify_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `config_name` VARCHAR(64) NOT NULL COMMENT '配置名称',
  `notify_type` VARCHAR(16) NOT NULL COMMENT '通知类型:INQUIRY/DEMAND/AD_EXPIRE',
  `channel_type` VARCHAR(16) NOT NULL COMMENT '渠道:WEBHOOK/APP_MSG',
  `webhook_url` VARCHAR(512) DEFAULT NULL COMMENT 'Webhook URL',
  `corp_id` VARCHAR(64) DEFAULT NULL COMMENT '企微CorpId',
  `agent_id` VARCHAR(64) DEFAULT NULL COMMENT '应用AgentId',
  `agent_secret` VARCHAR(128) DEFAULT NULL COMMENT '应用Secret',
  `receiver_user_ids` VARCHAR(512) DEFAULT NULL COMMENT '接收人企微用户ID',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `silent_start` VARCHAR(5) DEFAULT NULL COMMENT '静默开始时间',
  `silent_end` VARCHAR(5) DEFAULT NULL COMMENT '静默结束时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_notify_type` (`notify_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企微通知配置表';
```

---

### 3.15 hdz_city（城市字典表）

```sql
CREATE TABLE `hdz_city` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `city_code` VARCHAR(16) NOT NULL COMMENT '城市编码',
  `city_name` VARCHAR(64) NOT NULL COMMENT '城市名称',
  `province_code` VARCHAR(16) NOT NULL COMMENT '省份编码',
  `province_name` VARCHAR(64) NOT NULL COMMENT '省份名称',
  `pinyin` VARCHAR(64) DEFAULT NULL COMMENT '拼音',
  `first_letter` CHAR(1) DEFAULT NULL COMMENT '首字母',
  `longitude` DECIMAL(10,6) DEFAULT NULL COMMENT '经度',
  `latitude` DECIMAL(10,6) DEFAULT NULL COMMENT '纬度',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_city_code` (`city_code`),
  KEY `idx_province_code` (`province_code`),
  KEY `idx_first_letter` (`first_letter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='城市字典表';
```

---

## 四、数据操作权限约束

以下表有特殊的数据操作约束，需要在服务层和接口层严格执行：

| 表名 | 可新增 | 可修改 | 可删除 | 说明 |
|------|--------|--------|--------|------|
| hdz_business_inquiry | 是 | 仅 process_status | 否 | 招商登记数据一经提交不可改不可删 |
| hdz_ad_demand | 是 | 仅 process_status | 否 | 广告需求登记数据一经提交不可改不可删 |
| hdz_follow_up_record | 是 | 否 | 否 | 跟进记录一经填写不可改不可删 |

---

## 五、缓存设计（Redis）

| 缓存 Key | 数据结构 | TTL | 说明 |
|----------|----------|-----|------|
| `hdz:station:list` | String (JSON) | 30min | 所有启用分站列表 |
| `hdz:station:{stationCode}` | Hash | 30min | 单个分站详情 |
| `hdz:station:city:{cityCode}` | String | 1h | 城市对应的分站编码 |
| `hdz:user:station:{userId}` | String | 7d | 🆕 用户上次访问的分站编码 |
| `hdz:ad:zone:{stationId}` | String (JSON) | 10min | 分站下所有广告版块及内容 |
| `hdz:ad:content:{slotId}` | String (JSON) | 10min | 广告位当前投放内容 |
| `hdz:ip:city:{ip}` | String | 24h | IP 对应的城市编码缓存 |
| `hdz:ad:stats:{adId}:{date}` | Hash | 1d | 广告当日统计（view/click） |
| `hdz:form:limit:{ip}` | String (count) | 1h | 🆕 表单提交频率限制（同 IP 每小时最多 5 次） |
