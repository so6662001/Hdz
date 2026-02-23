package com.hdz.advertisement.dto;

import com.hdz.common.dto.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class AdContentQueryDTO extends PageQuery {

    private Long stationId;
    private Long zoneId;
    private Integer auditStatus;
    private Integer status;
    private String chargeType;
    private String title;
}
