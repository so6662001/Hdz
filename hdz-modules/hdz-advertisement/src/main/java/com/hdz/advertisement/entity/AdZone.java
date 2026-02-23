package com.hdz.advertisement.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hdz.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hdz_ad_zone")
public class AdZone extends BaseEntity {

    private String zoneCode;
    private String zoneName;
    private String zoneType;
    private String description;
    private Integer maxSlots;
    private Integer width;
    private Integer height;
    private Integer sortOrder;
    private Integer status;
}
