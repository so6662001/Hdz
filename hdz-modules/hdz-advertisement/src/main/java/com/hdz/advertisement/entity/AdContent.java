package com.hdz.advertisement.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hdz.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hdz_ad_content")
public class AdContent extends BaseEntity {

    private Long slotId;
    private Long stationId;
    private Long zoneId;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String linkType;
    private String linkUrl;
    private String linkUrlMobile;
    private String linkTarget;
    private String advertiserName;
    private String advertiserPhone;
    private String contentType;
    private String videoUrl;
    private String htmlContent;
    private String chargeType;
    private String chargeRemark;
    private Integer positionAdjustable;
    private Integer sortWeight;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer auditStatus;
    private String auditRemark;
    private String auditBy;
    private LocalDateTime auditTime;
    private Integer status;
    private Integer clickCount;
    private Integer viewCount;
}
