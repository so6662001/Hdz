package com.hdz.advertisement.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hdz.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hdz_ad_slot")
public class AdSlot extends BaseEntity {

    private Long stationId;
    private Long zoneId;
    private String slotName;
    private Integer slotIndex;
    private Integer status;
}
