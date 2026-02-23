package com.hdz.substation.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hdz.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hdz_sub_station")
public class SubStation extends BaseEntity {

    private String stationCode;
    private String stationName;
    private String stationLogo;
    private String stationBanner;
    private String description;
    private String contactPhone;
    private String contactEmail;
    private Integer sortOrder;
    private Integer status;
    private Integer isDefault;
    private String seoTitle;
    private String seoKeywords;
    private String seoDescription;
}
