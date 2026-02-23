package com.hdz.substation.dto;

import com.hdz.common.dto.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class StationQueryDTO extends PageQuery {

    private String stationName;
    private Integer status;
}
