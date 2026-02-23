package com.hdz.substation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("hdz_sub_station_city")
public class SubStationCity implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long stationId;
    private String cityCode;
    private String cityName;
    private LocalDateTime createTime;
}
