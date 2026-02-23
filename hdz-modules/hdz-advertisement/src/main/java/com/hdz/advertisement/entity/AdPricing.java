package com.hdz.advertisement.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hdz.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hdz_ad_pricing")
public class AdPricing extends BaseEntity {

    private Long zoneId;
    private Long stationId;
    private String pricingName;
    private String priceType;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String description;
    private Integer sortOrder;
    private Integer status;
}
