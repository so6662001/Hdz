package com.hdz.substation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("hdz_user_station")
public class UserStation implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long stationId;
    private String stationCode;
    private LocalDateTime lastVisitTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
