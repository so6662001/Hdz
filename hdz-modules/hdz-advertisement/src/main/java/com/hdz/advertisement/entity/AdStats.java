package com.hdz.advertisement.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("hdz_ad_stats")
public class AdStats implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long adContentId;
    private Long stationId;
    private LocalDate statDate;
    private Integer viewCount;
    private Integer clickCount;
    private Integer uniqueView;
    private Integer uniqueClick;
    private LocalDateTime createTime;
}
