-- ============================================================
-- 货袋子平台 - 数据库初始化脚本
-- 版本: v2.0
-- 日期: 2026-02-23
-- 共 20 张表: 分站(4) + 广告(6) + 招商/需求(4) + 圈子(5) + 公共(1)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 一、公共模块
-- ============================================================

DROP TABLE IF EXISTS `hdz_city`;
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
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0停用,1启用',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_city_code` (`city_code`),
  KEY `idx_province_code` (`province_code`),
  KEY `idx_first_letter` (`first_letter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='城市字典表';

-- ============================================================
-- 二、分站管理模块 (4张表)
-- ============================================================

DROP TABLE IF EXISTS `hdz_sub_station`;
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

DROP TABLE IF EXISTS `hdz_sub_station_city`;
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

DROP TABLE IF EXISTS `hdz_sub_station_config`;
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

DROP TABLE IF EXISTS `hdz_user_station`;
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

-- ============================================================
-- 三、广告管理模块 (6张表)
-- ============================================================

DROP TABLE IF EXISTS `hdz_ad_zone`;
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

DROP TABLE IF EXISTS `hdz_ad_slot`;
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

DROP TABLE IF EXISTS `hdz_ad_content`;
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

DROP TABLE IF EXISTS `hdz_ad_pricing`;
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

DROP TABLE IF EXISTS `hdz_ad_order`;
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

DROP TABLE IF EXISTS `hdz_ad_stats`;
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

-- ============================================================
-- 四、招商/需求登记模块 (4张表)
-- ============================================================

DROP TABLE IF EXISTS `hdz_business_inquiry`;
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
  `source` VARCHAR(16) NOT NULL DEFAULT 'WEB' COMMENT '来源:WEB/MOBILE/MINIAPP',
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

DROP TABLE IF EXISTS `hdz_ad_demand`;
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
  `source` VARCHAR(16) NOT NULL DEFAULT 'WEB' COMMENT '来源:WEB/MOBILE/MINIAPP',
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

DROP TABLE IF EXISTS `hdz_follow_up_record`;
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

DROP TABLE IF EXISTS `hdz_wechat_notify_config`;
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

-- ============================================================
-- 五、圈子模块 (5张表)
-- ============================================================

DROP TABLE IF EXISTS `hdz_circle_category`;
CREATE TABLE `hdz_circle_category` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `category_name` VARCHAR(32) NOT NULL COMMENT '分类名称',
  `category_icon` VARCHAR(256) DEFAULT NULL COMMENT '分类图标URL',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0停用,1启用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='圈子分类表';

DROP TABLE IF EXISTS `hdz_circle_post`;
CREATE TABLE `hdz_circle_post` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `station_id` BIGINT NOT NULL COMMENT '所属分站ID',
  `ad_content_id` BIGINT DEFAULT NULL COMMENT '关联广告内容ID',
  `enterprise_name` VARCHAR(128) NOT NULL COMMENT '企业名称',
  `enterprise_logo` VARCHAR(512) DEFAULT NULL COMMENT '企业Logo',
  `enterprise_phone` VARCHAR(20) DEFAULT NULL COMMENT '企业联系电话',
  `enterprise_website` VARCHAR(512) DEFAULT NULL COMMENT '企业官网',
  `enterprise_address` VARCHAR(256) DEFAULT NULL COMMENT '企业地址',
  `post_type` VARCHAR(16) NOT NULL COMMENT '动态类型:IMAGE_TEXT/VIDEO/ACTIVITY/PROMOTED',
  `title` VARCHAR(128) DEFAULT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '正文内容',
  `images` TEXT DEFAULT NULL COMMENT '图片列表JSON数组',
  `video_url` VARCHAR(512) DEFAULT NULL COMMENT '视频URL',
  `video_cover` VARCHAR(512) DEFAULT NULL COMMENT '视频封面图',
  `activity_start_time` DATETIME DEFAULT NULL COMMENT '活动开始时间',
  `activity_end_time` DATETIME DEFAULT NULL COMMENT '活动结束时间',
  `activity_address` VARCHAR(256) DEFAULT NULL COMMENT '活动地址',
  `link_url` VARCHAR(512) DEFAULT NULL COMMENT '跳转链接',
  `link_url_mobile` VARCHAR(512) DEFAULT NULL COMMENT '移动端跳转链接',
  `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
  `tags` VARCHAR(256) DEFAULT NULL COMMENT '标签逗号分隔',
  `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `is_hot` TINYINT NOT NULL DEFAULT 0 COMMENT '是否热门',
  `charge_type` VARCHAR(8) NOT NULL DEFAULT 'FREE' COMMENT '收费模式:FREE/PAID',
  `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` INT NOT NULL DEFAULT 0 COMMENT '评论数',
  `share_count` INT NOT NULL DEFAULT 0 COMMENT '分享数',
  `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览数',
  `favorite_count` INT NOT NULL DEFAULT 0 COMMENT '收藏数',
  `sort_weight` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0下线,1上线,2审核中',
  `audit_status` TINYINT NOT NULL DEFAULT 1 COMMENT '审核:0待审核,1通过,2拒绝',
  `start_time` DATETIME DEFAULT NULL COMMENT '投放开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '投放结束时间',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_station_id` (`station_id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_post_type` (`post_type`),
  KEY `idx_status` (`status`, `audit_status`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_ad_content_id` (`ad_content_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='圈子动态表';

DROP TABLE IF EXISTS `hdz_circle_like`;
CREATE TABLE `hdz_circle_like` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `post_id` BIGINT NOT NULL COMMENT '动态ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='圈子点赞表';

DROP TABLE IF EXISTS `hdz_circle_comment`;
CREATE TABLE `hdz_circle_comment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `post_id` BIGINT NOT NULL COMMENT '动态ID',
  `user_id` BIGINT NOT NULL COMMENT '评论用户ID',
  `user_nickname` VARCHAR(64) DEFAULT NULL COMMENT '用户昵称',
  `user_avatar` VARCHAR(512) DEFAULT NULL COMMENT '用户头像',
  `content` VARCHAR(500) NOT NULL COMMENT '评论内容',
  `parent_id` BIGINT DEFAULT NULL COMMENT '父评论ID',
  `reply_user_id` BIGINT DEFAULT NULL COMMENT '被回复用户ID',
  `reply_user_nickname` VARCHAR(64) DEFAULT NULL COMMENT '被回复用户昵称',
  `like_count` INT NOT NULL DEFAULT 0 COMMENT '评论点赞数',
  `is_enterprise_reply` TINYINT NOT NULL DEFAULT 0 COMMENT '是否企业官方回复',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0删除,1正常',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='圈子评论表';

DROP TABLE IF EXISTS `hdz_circle_favorite`;
CREATE TABLE `hdz_circle_favorite` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `post_id` BIGINT NOT NULL COMMENT '动态ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='圈子收藏表';

-- ============================================================
-- 六、小程序用户表
-- ============================================================

DROP TABLE IF EXISTS `hdz_mp_user`;
CREATE TABLE `hdz_mp_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `openid` VARCHAR(64) NOT NULL COMMENT '微信openid',
  `unionid` VARCHAR(64) DEFAULT NULL COMMENT '微信unionid',
  `user_id` BIGINT DEFAULT NULL COMMENT '关联平台用户ID',
  `nickname` VARCHAR(64) DEFAULT NULL COMMENT '微信昵称',
  `avatar_url` VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `last_station_code` VARCHAR(32) DEFAULT NULL COMMENT '上次访问分站编码',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `login_count` INT NOT NULL DEFAULT 0 COMMENT '登录次数',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_unionid` (`unionid`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小程序用户表';

SET FOREIGN_KEY_CHECKS = 1;
