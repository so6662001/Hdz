# 货袋子平台 — API 接口设计

> 版本：v2.0 | 日期：2026-02-23  
> 更新说明：新增招商登记、广告需求登记、跟进记录、企微通知配置、用户分站记忆等接口；广告接口增加赠送/收费、位置调整、跳转链接类型字段

---

## 一、接口规范

### 1.1 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { },
  "timestamp": 1708700000000
}
```

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 1.2 分页请求/响应

请求参数：pageNum（默认 1）、pageSize（默认 10）

```json
{
  "code": 200,
  "data": {
    "records": [],
    "total": 100,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 10
  }
}
```

### 1.3 接口前缀

| 类别 | 前缀 | 说明 |
|------|------|------|
| C 端（用户侧） | `/api/v1/` | 分站首页、广告展示、登记表单提交 |
| B 端（管理侧） | `/api/admin/v1/` | 后台管理接口 |

---

## 二、C 端接口（用户侧）

### 2.1 IP 定位接口

**GET** `/api/v1/location/detect`

根据用户 IP 自动定位城市并返回对应分站信息。若用户已登录，同时返回上次访问的分站。

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "ip": "116.25.100.1",
    "cityCode": "440300",
    "cityName": "深圳市",
    "provinceName": "广东省",
    "stationCode": "shenzhen",
    "stationName": "深圳站",
    "hasStation": true,
    "lastStationCode": "guangzhou"
  }
}
```

`lastStationCode`：用户上次访问的分站编码，仅已登录用户有值。前端优先使用此值跳转。

---

### 2.2 分站列表接口

**GET** `/api/v1/station/list`

获取所有已启用的分站列表（用于城市选择页）。

---

### 2.3 分站详情接口

**GET** `/api/v1/station/{stationCode}`

获取指定分站的详细信息。

---

### 2.4 分站广告数据接口

**GET** `/api/v1/station/{stationCode}/ads`

获取指定分站首页的所有广告版块及广告内容。

**响应示例（v2 新增 linkType、linkUrlMobile 字段）：**
```json
{
  "code": 200,
  "data": {
    "stationName": "深圳站",
    "zones": [
      {
        "zoneCode": "top_banner",
        "zoneName": "顶部轮播Banner",
        "zoneType": "BANNER",
        "width": 1200,
        "height": 400,
        "ads": [
          {
            "id": 1001,
            "title": "XX 企业品牌推广",
            "imageUrl": "https://cdn.huodaizi.com/ad/1001.jpg",
            "linkType": "OFFICIAL_SITE",
            "linkUrl": "https://www.example.com",
            "linkUrlMobile": "https://m.example.com",
            "linkTarget": "_blank",
            "advertiserName": "XX科技有限公司"
          }
        ]
      }
    ]
  }
}
```

---

### 2.5 用户分站记忆接口 🆕

**POST** `/api/v1/user/station`

记录当前登录用户访问的分站（每次进入分站首页时调用）。

**请求体：**
```json
{
  "stationCode": "shenzhen"
}
```

**GET** `/api/v1/user/station`

获取当前登录用户上次访问的分站编码。

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "stationCode": "shenzhen",
    "stationName": "深圳站",
    "lastVisitTime": "2026-03-15 14:30:00"
  }
}
```

---

### 2.6 广告点击上报接口

**POST** `/api/v1/ad/{adId}/click`

上报广告点击事件。返回跳转地址（根据设备类型自动选择 PC/移动端链接）。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stationCode | string | 是 | 分站编码 |
| deviceType | string | 否 | 设备类型：PC/MOBILE，用于返回对应链接 |

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "redirectUrl": "https://www.example.com",
    "linkTarget": "_blank"
  }
}
```

---

### 2.7 广告展示上报接口

**POST** `/api/v1/ad/impression`

批量上报广告展示事件。

---

### 2.8 招商登记提交接口 🆕

**POST** `/api/v1/business-inquiry/submit`

用户在首页或分站首页提交招商入驻登记。提交后即时推送企业微信通知。

**请求体：**
```json
{
  "stationCode": "shenzhen",
  "companyName": "XX科技有限公司",
  "contactName": "张先生",
  "contactPhone": "13800138000",
  "contactEmail": "zhang@example.com",
  "industry": "互联网/科技",
  "cityName": "深圳",
  "cooperationType": "JOIN",
  "description": "希望入驻深圳站，主营智能硬件",
  "captchaCode": "a8d3",
  "captchaKey": "uuid-xxxx"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "登记成功，我们将尽快与您联系",
  "data": {
    "inquiryNo": "ZS20260315143022001"
  }
}
```

---

### 2.9 广告需求登记提交接口 🆕

**POST** `/api/v1/ad-demand/submit`

用户在首页或分站首页提交广告投放需求登记。提交后即时推送企业微信通知。

**请求体：**
```json
{
  "stationCode": "shenzhen",
  "companyName": "YY物流有限公司",
  "contactName": "李女士",
  "contactPhone": "13900139000",
  "contactEmail": "li@example.com",
  "targetZoneType": "BANNER",
  "budgetRange": "3000-5000",
  "duration": "MONTH",
  "description": "希望在深圳站首页Banner位投放一个月广告",
  "captchaCode": "b7e2",
  "captchaKey": "uuid-yyyy"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "需求登记成功，我们将尽快与您联系",
  "data": {
    "demandNo": "GG20260315150000001"
  }
}
```

---

### 2.10 图形验证码接口 🆕

**GET** `/api/v1/captcha`

获取图形验证码（用于招商登记和广告需求登记表单的防刷保护）。

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "captchaKey": "uuid-xxxx",
    "captchaImage": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

---

## 三、B 端接口（后台管理）

> 以下接口均需要携带认证 Token，对接现有系统权限体系。

### 3.1 分站管理接口

#### 3.1.1 分站列表（分页）

**GET** `/api/admin/v1/station/page`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| stationName | string | 否 | 模糊搜索 |
| status | int | 否 | 状态筛选 |

#### 3.1.2 创建分站

**POST** `/api/admin/v1/station`

#### 3.1.3 更新分站

**PUT** `/api/admin/v1/station/{id}`

#### 3.1.4 删除分站

**DELETE** `/api/admin/v1/station/{id}`

#### 3.1.5 分站详情

**GET** `/api/admin/v1/station/{id}`

#### 3.1.6 分站城市管理

**PUT** `/api/admin/v1/station/{id}/cities`

#### 3.1.7 分站状态变更

**PUT** `/api/admin/v1/station/{id}/status`

#### 3.1.8 分站配置管理

**GET/PUT** `/api/admin/v1/station/{id}/config`

---

### 3.2 广告版块管理接口

**GET** `/api/admin/v1/ad-zone/list` — 列表
**POST** `/api/admin/v1/ad-zone` — 创建
**PUT** `/api/admin/v1/ad-zone/{id}` — 更新
**DELETE** `/api/admin/v1/ad-zone/{id}` — 删除

---

### 3.3 广告位管理接口

**GET** `/api/admin/v1/ad-slot/list` — 列表
**POST** `/api/admin/v1/ad-slot` — 创建
**PUT** `/api/admin/v1/ad-slot/{id}` — 更新
**DELETE** `/api/admin/v1/ad-slot/{id}` — 删除

---

### 3.4 广告内容管理接口（v2 更新）

#### 3.4.1 广告列表（分页）

**GET** `/api/admin/v1/ad-content/page`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| stationId | long | 否 | 分站 ID |
| zoneId | long | 否 | 版块 ID |
| auditStatus | int | 否 | 审核状态 |
| status | int | 否 | 上线状态（含 3=待调整） |
| chargeType | string | 否 | 🆕 收费模式：FREE/PAID |
| title | string | 否 | 标题模糊搜索 |

#### 3.4.2 创建广告（v2 更新）

**POST** `/api/admin/v1/ad-content`

```json
{
  "slotId": 1,
  "stationId": 1,
  "zoneId": 1,
  "title": "XX企业品牌推广",
  "subtitle": "深圳领先的科技企业",
  "imageUrl": "https://cdn.huodaizi.com/ad/upload/xxx.jpg",
  "linkType": "OFFICIAL_SITE",
  "linkUrl": "https://www.example.com",
  "linkUrlMobile": "https://m.example.com",
  "linkTarget": "_blank",
  "advertiserName": "XX科技有限公司",
  "advertiserPhone": "13800138000",
  "contentType": "IMAGE",
  "chargeType": "FREE",
  "chargeRemark": "首批合作企业免费赠送3个月Banner广告位",
  "positionAdjustable": 1,
  "sortWeight": 100,
  "startTime": "2026-03-01 00:00:00",
  "endTime": "2026-05-31 23:59:59"
}
```

#### 3.4.3 更新广告

**PUT** `/api/admin/v1/ad-content/{id}`

#### 3.4.4 删除广告

**DELETE** `/api/admin/v1/ad-content/{id}`

#### 3.4.5 广告审核

**PUT** `/api/admin/v1/ad-content/{id}/audit`

#### 3.4.6 广告上下线

**PUT** `/api/admin/v1/ad-content/{id}/status`

```json
{
  "status": 1
}
```

status 取值：0=下线, 1=上线, 3=待调整

#### 3.4.7 广告详情

**GET** `/api/admin/v1/ad-content/{id}`

#### 3.4.8 广告位置调整（到期后） 🆕

**PUT** `/api/admin/v1/ad-content/{id}/reposition`

将到期且 position_adjustable=1 的广告重新分配到新的广告位。

```json
{
  "newSlotId": 5,
  "newStartTime": "2026-06-01 00:00:00",
  "newEndTime": "2026-08-31 23:59:59",
  "chargeType": "PAID",
  "chargeRemark": "续期转为收费"
}
```

---

### 3.5 广告定价管理接口

**GET** `/api/admin/v1/ad-pricing/list` — 列表
**POST** `/api/admin/v1/ad-pricing` — 创建
**PUT** `/api/admin/v1/ad-pricing/{id}` — 更新
**DELETE** `/api/admin/v1/ad-pricing/{id}` — 删除

---

### 3.6 广告订单管理接口

**GET** `/api/admin/v1/ad-order/page` — 列表（分页）
**POST** `/api/admin/v1/ad-order` — 创建
**GET** `/api/admin/v1/ad-order/{id}` — 详情

---

### 3.7 广告数据统计接口

**GET** `/api/admin/v1/ad-stats/overview` — 效果概览
**GET** `/api/admin/v1/ad-stats/trend` — 效果趋势
**GET** `/api/admin/v1/ad-stats/ranking` — 广告排名

---

### 3.8 招商登记管理接口 🆕

> 招商登记数据不可删除、不可修改原始信息，仅可更新处理状态和添加跟进记录。

#### 3.8.1 招商登记列表（分页）

**GET** `/api/admin/v1/business-inquiry/page`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| stationId | long | 否 | 来源分站 |
| processStatus | int | 否 | 处理状态：0=待处理, 1=跟进中, 2=已成交, 3=已关闭 |
| companyName | string | 否 | 企业名称模糊搜索 |
| contactPhone | string | 否 | 联系电话搜索 |
| startTime | string | 否 | 登记开始时间 |
| endTime | string | 否 | 登记结束时间 |

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "id": 1,
        "inquiryNo": "ZS20260315143022001",
        "stationName": "深圳站",
        "companyName": "XX科技有限公司",
        "contactName": "张先生",
        "contactPhone": "13800138000",
        "industry": "互联网/科技",
        "cooperationType": "JOIN",
        "processStatus": 1,
        "processStatusText": "跟进中",
        "followUpCount": 3,
        "lastFollowTime": "2026-03-16 10:00:00",
        "notifySent": true,
        "createTime": "2026-03-15 14:30:22"
      }
    ],
    "total": 50
  }
}
```

#### 3.8.2 招商登记详情

**GET** `/api/admin/v1/business-inquiry/{id}`

返回完整登记信息 + 所有跟进记录列表。

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "inquiryNo": "ZS20260315143022001",
    "stationName": "深圳站",
    "companyName": "XX科技有限公司",
    "contactName": "张先生",
    "contactPhone": "13800138000",
    "contactEmail": "zhang@example.com",
    "industry": "互联网/科技",
    "cityName": "深圳",
    "cooperationType": "JOIN",
    "description": "希望入驻深圳站，主营智能硬件",
    "source": "WEB",
    "processStatus": 1,
    "ipAddress": "116.25.100.1",
    "notifySent": true,
    "createTime": "2026-03-15 14:30:22",
    "followUpRecords": [
      {
        "id": 1,
        "followContent": "已电话联系张先生，确认入驻意向，约下周面谈",
        "followResult": "CONTACTED",
        "followBy": "admin",
        "followByName": "王运营",
        "followTime": "2026-03-15 16:00:00",
        "createTime": "2026-03-15 16:00:00"
      },
      {
        "id": 2,
        "followContent": "面谈完成，对方同意入驻，需准备入驻材料",
        "followResult": "NEGOTIATING",
        "followBy": "admin",
        "followByName": "王运营",
        "followTime": "2026-03-18 14:00:00",
        "createTime": "2026-03-18 14:00:00"
      }
    ]
  }
}
```

#### 3.8.3 更新处理状态

**PUT** `/api/admin/v1/business-inquiry/{id}/status`

仅允许更新处理状态，不允许修改原始登记信息。

```json
{
  "processStatus": 2
}
```

#### 3.8.4 添加跟进记录

**POST** `/api/admin/v1/business-inquiry/{id}/follow-up`

跟进记录一旦提交不可修改、不可删除。

```json
{
  "followContent": "已电话联系张先生，确认入驻意向，约下周面谈",
  "followResult": "CONTACTED",
  "followTime": "2026-03-15 16:00:00"
}
```

---

### 3.9 广告需求登记管理接口 🆕

> 广告需求登记数据不可删除、不可修改原始信息，仅可更新处理状态和添加跟进记录。

#### 3.9.1 广告需求列表（分页）

**GET** `/api/admin/v1/ad-demand/page`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| stationId | long | 否 | 来源分站 |
| processStatus | int | 否 | 处理状态 |
| targetZoneType | string | 否 | 意向版块类型 |
| companyName | string | 否 | 企业名称模糊搜索 |
| startTime | string | 否 | 登记开始时间 |
| endTime | string | 否 | 登记结束时间 |

#### 3.9.2 广告需求详情

**GET** `/api/admin/v1/ad-demand/{id}`

返回完整登记信息 + 所有跟进记录列表（结构同招商登记详情）。

#### 3.9.3 更新处理状态

**PUT** `/api/admin/v1/ad-demand/{id}/status`

```json
{
  "processStatus": 1
}
```

#### 3.9.4 添加跟进记录

**POST** `/api/admin/v1/ad-demand/{id}/follow-up`

```json
{
  "followContent": "已与李女士确认Banner广告需求，报价5000元/月",
  "followResult": "NEGOTIATING",
  "followTime": "2026-03-16 09:30:00"
}
```

---

### 3.10 企业微信通知配置接口 🆕

#### 3.10.1 通知配置列表

**GET** `/api/admin/v1/wechat-notify/list`

#### 3.10.2 创建/更新通知配置

**POST** `/api/admin/v1/wechat-notify`

```json
{
  "configName": "招商登记通知",
  "notifyType": "INQUIRY",
  "channelType": "WEBHOOK",
  "webhookUrl": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx",
  "receiverUserIds": "user1,user2",
  "enabled": 1,
  "silentStart": "23:00",
  "silentEnd": "08:00"
}
```

**PUT** `/api/admin/v1/wechat-notify/{id}`

#### 3.10.3 删除通知配置

**DELETE** `/api/admin/v1/wechat-notify/{id}`

#### 3.10.4 测试通知发送

**POST** `/api/admin/v1/wechat-notify/{id}/test`

发送一条测试消息到企微，验证配置是否正确。

---

### 3.11 城市数据接口

**GET** `/api/admin/v1/city/list` — 城市列表
**GET** `/api/admin/v1/city/unbindList` — 未绑定分站的城市列表

---

### 3.12 文件上传接口

**POST** `/api/admin/v1/upload/ad-material` — 上传广告素材
