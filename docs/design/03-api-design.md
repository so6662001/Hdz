# 货袋子平台 — API 接口设计

> 版本：v1.0 | 日期：2026-02-23

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

### 1.2 分页请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数，默认 10 |

### 1.3 分页响应格式

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

### 1.4 接口前缀

| 类别 | 前缀 | 说明 |
|------|------|------|
| C 端（用户侧） | `/api/v1/` | 分站首页、广告展示 |
| B 端（管理侧） | `/api/admin/v1/` | 后台管理接口 |

---

## 二、C 端接口（用户侧）

### 2.1 IP 定位接口

**GET** `/api/v1/location/detect`

根据用户 IP 自动定位城市并返回对应分站信息。

**请求参数：** 无（通过 Request Header 获取 IP）

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
    "hasStation": true
  }
}
```

若用户所在城市没有对应分站，`hasStation` 为 `false`，前端引导用户选择其他城市或跳转默认分站。

---

### 2.2 分站列表接口

**GET** `/api/v1/station/list`

获取所有已启用的分站列表（用于城市选择页）。

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {
      "stationCode": "beijing",
      "stationName": "北京站",
      "stationLogo": "https://cdn.huodaizi.com/logo/bj.png",
      "cities": [
        { "cityCode": "110100", "cityName": "北京市" }
      ]
    },
    {
      "stationCode": "shanghai",
      "stationName": "上海站",
      "stationLogo": "https://cdn.huodaizi.com/logo/sh.png",
      "cities": [
        { "cityCode": "310100", "cityName": "上海市" }
      ]
    }
  ]
}
```

---

### 2.3 分站详情接口

**GET** `/api/v1/station/{stationCode}`

获取指定分站的详细信息。

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "stationCode": "shenzhen",
    "stationName": "深圳站",
    "stationLogo": "https://cdn.huodaizi.com/logo/sz.png",
    "stationBanner": "https://cdn.huodaizi.com/banner/sz.jpg",
    "description": "货袋子深圳站，服务深圳及周边企业",
    "contactPhone": "0755-88888888",
    "seoTitle": "货袋子深圳站 - 本地企业服务平台",
    "seoKeywords": "深圳,企业服务,货袋子",
    "seoDescription": "货袋子深圳站为深圳地区企业提供一站式服务"
  }
}
```

---

### 2.4 分站广告数据接口

**GET** `/api/v1/station/{stationCode}/ads`

获取指定分站首页的所有广告版块及广告内容，用于渲染分站首页。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneType | string | 否 | 按版块类型筛选：BANNER/RECOMMEND/LIST/SIDEBAR |

**响应示例：**
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
            "linkUrl": "https://www.example.com",
            "linkTarget": "_blank",
            "advertiserName": "XX科技有限公司"
          },
          {
            "id": 1002,
            "title": "YY 物流优惠活动",
            "imageUrl": "https://cdn.huodaizi.com/ad/1002.jpg",
            "linkUrl": "https://www.example2.com",
            "linkTarget": "_blank",
            "advertiserName": "YY物流有限公司"
          }
        ]
      },
      {
        "zoneCode": "recommend_grid",
        "zoneName": "推荐企业",
        "zoneType": "RECOMMEND",
        "width": 280,
        "height": 200,
        "ads": [
          {
            "id": 2001,
            "title": "ZZ 建材",
            "subtitle": "深圳领先的建材供应商",
            "imageUrl": "https://cdn.huodaizi.com/ad/2001.jpg",
            "linkUrl": "https://www.example3.com",
            "advertiserName": "ZZ建材有限公司"
          }
        ]
      },
      {
        "zoneCode": "list_ads",
        "zoneName": "企业列表广告",
        "zoneType": "LIST",
        "ads": [
          {
            "id": 3001,
            "title": "AA 餐饮连锁",
            "subtitle": "全城100+门店，品质保证",
            "imageUrl": "https://cdn.huodaizi.com/ad/3001.jpg",
            "linkUrl": "https://www.example4.com",
            "advertiserName": "AA餐饮管理有限公司"
          }
        ]
      }
    ]
  }
}
```

---

### 2.5 广告点击上报接口

**POST** `/api/v1/ad/{adId}/click`

上报广告点击事件，用于数据统计。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stationCode | string | 是 | 分站编码 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success"
}
```

---

### 2.6 广告展示上报接口

**POST** `/api/v1/ad/impression`

批量上报广告展示事件。

**请求体：**
```json
{
  "stationCode": "shenzhen",
  "adIds": [1001, 1002, 2001, 3001]
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success"
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
| stationName | string | 否 | 分站名称模糊搜索 |
| status | int | 否 | 状态筛选 |

---

#### 3.1.2 创建分站

**POST** `/api/admin/v1/station`

**请求体：**
```json
{
  "stationCode": "shenzhen",
  "stationName": "深圳站",
  "stationLogo": "https://cdn.huodaizi.com/logo/sz.png",
  "stationBanner": "https://cdn.huodaizi.com/banner/sz.jpg",
  "description": "货袋子深圳站",
  "contactPhone": "0755-88888888",
  "contactEmail": "sz@huodaizi.com",
  "sortOrder": 10,
  "status": 1,
  "isDefault": 0,
  "seoTitle": "货袋子深圳站",
  "seoKeywords": "深圳,货袋子",
  "seoDescription": "服务深圳地区",
  "cityCodeList": ["440300", "440400"]
}
```

---

#### 3.1.3 更新分站

**PUT** `/api/admin/v1/station/{id}`

请求体同创建接口。

---

#### 3.1.4 删除分站

**DELETE** `/api/admin/v1/station/{id}`

逻辑删除。该分站下有生效中的广告时禁止删除。

---

#### 3.1.5 分站详情

**GET** `/api/admin/v1/station/{id}`

---

#### 3.1.6 分站城市管理

**PUT** `/api/admin/v1/station/{id}/cities`

更新分站绑定的城市列表。

```json
{
  "cityCodeList": ["440300", "440400", "441300"]
}
```

---

#### 3.1.7 分站状态变更

**PUT** `/api/admin/v1/station/{id}/status`

```json
{
  "status": 1
}
```

---

#### 3.1.8 分站配置管理

**GET** `/api/admin/v1/station/{id}/config`

**PUT** `/api/admin/v1/station/{id}/config`

```json
{
  "configs": [
    { "configKey": "theme_color", "configValue": "#1890ff", "configDesc": "主题色" },
    { "configKey": "footer_text", "configValue": "版权所有 货袋子", "configDesc": "页脚文字" }
  ]
}
```

---

### 3.2 广告版块管理接口

#### 3.2.1 版块列表

**GET** `/api/admin/v1/ad-zone/list`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneType | string | 否 | 版块类型筛选 |
| status | int | 否 | 状态筛选 |

---

#### 3.2.2 创建版块

**POST** `/api/admin/v1/ad-zone`

```json
{
  "zoneCode": "top_banner",
  "zoneName": "顶部轮播Banner",
  "zoneType": "BANNER",
  "description": "首页顶部大图轮播区域",
  "maxSlots": 5,
  "width": 1200,
  "height": 400,
  "sortOrder": 1,
  "status": 1
}
```

---

#### 3.2.3 更新版块

**PUT** `/api/admin/v1/ad-zone/{id}`

---

#### 3.2.4 删除版块

**DELETE** `/api/admin/v1/ad-zone/{id}`

---

### 3.3 广告位管理接口

#### 3.3.1 广告位列表

**GET** `/api/admin/v1/ad-slot/list`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stationId | long | 否 | 分站 ID |
| zoneId | long | 否 | 版块 ID |
| status | int | 否 | 状态筛选 |

---

#### 3.3.2 创建广告位

**POST** `/api/admin/v1/ad-slot`

```json
{
  "stationId": 1,
  "zoneId": 1,
  "slotName": "深圳站-顶部Banner位1",
  "slotIndex": 1,
  "status": 1
}
```

---

#### 3.3.3 更新广告位

**PUT** `/api/admin/v1/ad-slot/{id}`

---

#### 3.3.4 删除广告位

**DELETE** `/api/admin/v1/ad-slot/{id}`

---

### 3.4 广告内容管理接口

#### 3.4.1 广告列表（分页）

**GET** `/api/admin/v1/ad-content/page`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| stationId | long | 否 | 分站 ID |
| zoneId | long | 否 | 版块 ID |
| auditStatus | int | 否 | 审核状态 |
| status | int | 否 | 上线状态 |
| title | string | 否 | 标题模糊搜索 |

---

#### 3.4.2 创建广告

**POST** `/api/admin/v1/ad-content`

```json
{
  "slotId": 1,
  "stationId": 1,
  "zoneId": 1,
  "title": "XX企业品牌推广",
  "subtitle": "深圳领先的科技企业",
  "imageUrl": "https://cdn.huodaizi.com/ad/upload/xxx.jpg",
  "linkUrl": "https://www.example.com",
  "linkTarget": "_blank",
  "advertiserName": "XX科技有限公司",
  "advertiserPhone": "13800138000",
  "contentType": "IMAGE",
  "sortWeight": 100,
  "startTime": "2026-03-01 00:00:00",
  "endTime": "2026-03-31 23:59:59"
}
```

---

#### 3.4.3 更新广告

**PUT** `/api/admin/v1/ad-content/{id}`

---

#### 3.4.4 删除广告

**DELETE** `/api/admin/v1/ad-content/{id}`

---

#### 3.4.5 广告审核

**PUT** `/api/admin/v1/ad-content/{id}/audit`

```json
{
  "auditStatus": 1,
  "auditRemark": "审核通过"
}
```

---

#### 3.4.6 广告上下线

**PUT** `/api/admin/v1/ad-content/{id}/status`

```json
{
  "status": 1
}
```

---

#### 3.4.7 广告详情

**GET** `/api/admin/v1/ad-content/{id}`

---

### 3.5 广告定价管理接口

#### 3.5.1 定价列表

**GET** `/api/admin/v1/ad-pricing/list`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneId | long | 否 | 版块 ID |
| stationId | long | 否 | 分站 ID |

---

#### 3.5.2 创建/更新定价

**POST** `/api/admin/v1/ad-pricing`

```json
{
  "zoneId": 1,
  "stationId": 1,
  "pricingName": "顶部Banner月度投放",
  "priceType": "MONTH",
  "price": 5000.00,
  "originalPrice": 6000.00,
  "description": "首页顶部Banner位，月度投放",
  "sortOrder": 1,
  "status": 1
}
```

**PUT** `/api/admin/v1/ad-pricing/{id}`

---

#### 3.5.3 删除定价

**DELETE** `/api/admin/v1/ad-pricing/{id}`

---

### 3.6 广告订单管理接口

#### 3.6.1 订单列表（分页）

**GET** `/api/admin/v1/ad-order/page`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| stationId | long | 否 | 分站 ID |
| payStatus | int | 否 | 支付状态 |
| orderNo | string | 否 | 订单号 |
| advertiserName | string | 否 | 广告主名称 |

---

#### 3.6.2 创建订单

**POST** `/api/admin/v1/ad-order`

```json
{
  "adContentId": 1,
  "stationId": 1,
  "zoneId": 1,
  "pricingId": 1,
  "advertiserName": "XX科技有限公司",
  "advertiserPhone": "13800138000",
  "amount": 5000.00,
  "payStatus": 1,
  "startTime": "2026-03-01 00:00:00",
  "endTime": "2026-03-31 23:59:59",
  "remark": "月度Banner广告"
}
```

---

#### 3.6.3 订单详情

**GET** `/api/admin/v1/ad-order/{id}`

---

### 3.7 广告数据统计接口

#### 3.7.1 广告效果概览

**GET** `/api/admin/v1/ad-stats/overview`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stationId | long | 否 | 分站 ID |
| startDate | string | 是 | 开始日期 yyyy-MM-dd |
| endDate | string | 是 | 结束日期 yyyy-MM-dd |

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "totalView": 125000,
    "totalClick": 3200,
    "avgCtr": 2.56,
    "totalAds": 45,
    "activeAds": 38
  }
}
```

---

#### 3.7.2 广告效果趋势

**GET** `/api/admin/v1/ad-stats/trend`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stationId | long | 否 | 分站 ID |
| adContentId | long | 否 | 广告 ID |
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |

**响应示例：**
```json
{
  "code": 200,
  "data": [
    { "date": "2026-03-01", "viewCount": 5200, "clickCount": 130 },
    { "date": "2026-03-02", "viewCount": 4800, "clickCount": 112 }
  ]
}
```

---

#### 3.7.3 广告排名

**GET** `/api/admin/v1/ad-stats/ranking`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stationId | long | 否 | 分站 ID |
| rankBy | string | 否 | 排名维度：view/click/ctr，默认 view |
| top | int | 否 | 前 N 名，默认 10 |
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |

---

### 3.8 城市数据接口

#### 3.8.1 城市列表

**GET** `/api/admin/v1/city/list`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| provinceCode | string | 否 | 按省份筛选 |
| keyword | string | 否 | 关键词搜索 |

---

#### 3.8.2 未绑定分站的城市列表

**GET** `/api/admin/v1/city/unbindList`

返回尚未绑定任何分站的城市列表，方便创建分站时选择。

---

### 3.9 文件上传接口

#### 3.9.1 上传广告素材

**POST** `/api/admin/v1/upload/ad-material`

Content-Type: multipart/form-data

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片/视频文件 |
| type | string | 否 | 类型：image/video |

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "url": "https://cdn.huodaizi.com/ad/upload/2026/03/xxx.jpg",
    "fileName": "xxx.jpg",
    "fileSize": 102400,
    "fileType": "image/jpeg"
  }
}
```
