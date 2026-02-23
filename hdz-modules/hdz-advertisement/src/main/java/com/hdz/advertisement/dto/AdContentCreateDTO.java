package com.hdz.advertisement.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class AdContentCreateDTO implements Serializable {

    @NotNull(message = "广告位ID不能为空")
    private Long slotId;

    @NotNull(message = "分站ID不能为空")
    private Long stationId;

    @NotNull(message = "版块ID不能为空")
    private Long zoneId;

    @NotBlank(message = "广告标题不能为空")
    private String title;

    private String subtitle;

    @NotBlank(message = "广告图片不能为空")
    private String imageUrl;

    private String linkType = "CUSTOM";
    private String linkUrl;
    private String linkUrlMobile;
    private String linkTarget = "_blank";
    private String advertiserName;
    private String advertiserPhone;
    private String contentType = "IMAGE";
    private String videoUrl;
    private String htmlContent;

    private String chargeType = "FREE";
    private String chargeRemark;
    private Integer positionAdjustable = 0;

    private Integer sortWeight = 0;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
