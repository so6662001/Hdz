package com.hdz.advertisement.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hdz.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hdz_ad_order")
public class AdOrder extends BaseEntity {

    private String orderNo;
    private Long adContentId;
    private Long stationId;
    private Long zoneId;
    private Long pricingId;
    private String advertiserName;
    private String advertiserPhone;
    private BigDecimal amount;
    private Integer payStatus;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String remark;
}
