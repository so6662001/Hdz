# 货袋子平台 — 数据库设计

> 版本：v1.0 | 日期：2026-02-23

---

## 一、数据库总览

所有表统一使用 `hdz_` 前缀，采用 InnoDB 引擎，字符集 utf8mb4。

### 表清单

| 序号 | 表名 | 说明 | 所属模块 |
|------|------|------|---------|
| 1 | hdz_sub_station | 分站信息表 | 分站管理 |
| 2 | hdz_sub_station_city | 分站-城市绑定表 | 分站管理 |
| 3 | hdz_sub_station_config | 分站配置表 | 分站管理 |
| 4 | hdz_ad_zone | 广告版块/区域表 | 广告管理 |
| 5 | hdz_ad_slot | 广告位表 | 广告管理 |
| 6 | hdz_ad_content | 广告内容表 | 广告管理 |
| 7 | hdz_ad_pricing | 广告定价表 | 广告管理 |
| 8 | hdz_ad_order | 广告订单表 | 广告管理 |
| 9 | hdz_ad_stats | 广告统计表 | 广告管理 |
| 10 | hdz_city | 城市字典表 | 公共模块 |

---

## 二、ER 关系图

```
hdz_city ──────┐
               │ N:1
               ▼
hdz_sub_station_city ──── hdz_sub_station
                              │
                    ┌─────────┼──────────┐
                    │         │          │
                    ▼         ▼          ▼
         hdz_sub_station   hdz_ad_zone  hdz_sub_station_config
              _config          │
                               │ 1:N
                               ▼
                         hdz_ad_slot
                               │ 1:N
                               ▼
                        hdz_ad_content
                          │         │
                    ┌─────┘         └──────┐
                    ▼                      ▼
              hdz_ad_order          hdz_ad_stats
                    │
                    ▼
              hdz_ad_pricing
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

**索引：**
- UNIQUE INDEX `uk_station_code` (station_code)
- INDEX `idx_status` (status)

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

### 3.4 hdz_ad_zone（广告版块表）

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

### 3.5 hdz_ad_slot（广告位表）

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

### 3.6 hdz_ad_content（广告内容表）

具体的广告内容，包含素材、链接、投放时间等。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| slot_id | BIGINT | NO | | 广告位 ID |
| station_id | BIGINT | NO | | 分站 ID（冗余，便于查询） |
| zone_id | BIGINT | NO | | 版块 ID（冗余，便于查询） |
| title | VARCHAR(128) | NO | | 广告标题 |
| subtitle | VARCHAR(256) | YES | | 广告副标题 |
| image_url | VARCHAR(512) | NO | | 广告图片 URL |
| link_url | VARCHAR(512) | YES | | 点击跳转链接 |
| link_target | VARCHAR(16) | NO | _blank | 链接打开方式：_self / _blank |
| advertiser_name | VARCHAR(128) | YES | | 广告主名称 |
| advertiser_phone | VARCHAR(20) | YES | | 广告主联系电话 |
| content_type | VARCHAR(16) | NO | IMAGE | 素材类型：IMAGE/VIDEO/HTML |
| video_url | VARCHAR(512) | YES | | 视频素材 URL |
| html_content | TEXT | YES | | 富文本素材内容 |
| sort_weight | INT | NO | 0 | 排序权重（越大越靠前） |
| start_time | DATETIME | YES | | 投放开始时间 |
| end_time | DATETIME | YES | | 投放结束时间 |
| audit_status | TINYINT | NO | 0 | 审核状态：0=待审核, 1=通过, 2=拒绝 |
| audit_remark | VARCHAR(256) | YES | | 审核备注 |
| audit_by | VARCHAR(64) | YES | | 审核人 |
| audit_time | DATETIME | YES | | 审核时间 |
| status | TINYINT | NO | 0 | 上线状态：0=下线, 1=上线 |
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
  `link_url` VARCHAR(512) DEFAULT NULL COMMENT '跳转链接',
  `link_target` VARCHAR(16) NOT NULL DEFAULT '_blank' COMMENT '打开方式',
  `advertiser_name` VARCHAR(128) DEFAULT NULL COMMENT '广告主名称',
  `advertiser_phone` VARCHAR(20) DEFAULT NULL COMMENT '广告主电话',
  `content_type` VARCHAR(16) NOT NULL DEFAULT 'IMAGE' COMMENT '素材类型:IMAGE/VIDEO/HTML',
  `video_url` VARCHAR(512) DEFAULT NULL COMMENT '视频URL',
  `html_content` TEXT DEFAULT NULL COMMENT '富文本内容',
  `sort_weight` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
  `start_time` DATETIME DEFAULT NULL COMMENT '投放开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '投放结束时间',
  `audit_status` TINYINT NOT NULL DEFAULT 0 COMMENT '审核:0待审核,1通过,2拒绝',
  `audit_remark` VARCHAR(256) DEFAULT NULL COMMENT '审核备注',
  `audit_by` VARCHAR(64) DEFAULT NULL COMMENT '审核人',
  `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '上线:0下线,1上线',
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
  KEY `idx_status_time` (`status`, `start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告内容表';
```

---

### 3.7 hdz_ad_pricing（广告定价表）

不同版块的广告价位配置。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| zone_id | BIGINT | NO | | 版块 ID |
| station_id | BIGINT | YES | | 分站 ID（NULL=全局定价） |
| pricing_name | VARCHAR(64) | NO | | 价位名称（如 "首页 Banner 月度"） |
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

### 3.8 hdz_ad_order（广告订单表）

记录广告投放的商业订单。

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

### 3.9 hdz_ad_stats（广告统计表）

按日统计广告的展示量与点击量。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| ad_content_id | BIGINT | NO | | 广告内容 ID |
| station_id | BIGINT | NO | | 分站 ID |
| stat_date | DATE | NO | | 统计日期 |
| view_count | INT | NO | 0 | 当日展示次数 |
| click_count | INT | NO | 0 | 当日点击次数 |
| unique_view | INT | NO | 0 | 当日独立访客展示数 |
| unique_click | INT | NO | 0 | 当日独立访客点击数 |
| create_time | DATETIME | NO | CURRENT_TIMESTAMP | 创建时间 |

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

### 3.10 hdz_city（城市字典表）

全国城市基础数据字典。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主键 |
| city_code | VARCHAR(16) | NO | | 城市编码 |
| city_name | VARCHAR(64) | NO | | 城市名称 |
| province_code | VARCHAR(16) | NO | | 省份编码 |
| province_name | VARCHAR(64) | NO | | 省份名称 |
| pinyin | VARCHAR(64) | YES | | 城市拼音 |
| first_letter | CHAR(1) | YES | | 首字母 |
| longitude | DECIMAL(10,6) | YES | | 经度 |
| latitude | DECIMAL(10,6) | YES | | 纬度 |
| status | TINYINT | NO | 1 | 状态：0=停用, 1=启用 |

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

## 四、缓存设计（Redis）

| 缓存 Key | 数据结构 | TTL | 说明 |
|----------|----------|-----|------|
| `hdz:station:list` | String (JSON) | 30min | 所有启用分站列表 |
| `hdz:station:{stationCode}` | Hash | 30min | 单个分站详情 |
| `hdz:station:city:{cityCode}` | String | 1h | 城市对应的分站编码 |
| `hdz:ad:zone:{stationId}` | String (JSON) | 10min | 分站下所有广告版块及内容 |
| `hdz:ad:content:{slotId}` | String (JSON) | 10min | 广告位当前投放内容 |
| `hdz:ip:city:{ip}` | String | 24h | IP 对应的城市编码缓存 |
| `hdz:ad:stats:{adId}:{date}` | Hash | 1d | 广告当日统计（view/click） |
