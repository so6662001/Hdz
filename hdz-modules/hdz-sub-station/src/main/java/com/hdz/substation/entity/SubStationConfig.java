package com.hdz.substation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("hdz_sub_station_config")
public class SubStationConfig implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long stationId;
    private String configKey;
    private String configValue;
    private String configDesc;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
