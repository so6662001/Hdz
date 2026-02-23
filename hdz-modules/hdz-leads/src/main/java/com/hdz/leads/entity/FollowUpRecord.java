package com.hdz.leads.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("hdz_follow_up_record")
public class FollowUpRecord implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String refType;
    private Long refId;
    private String followContent;
    private String followResult;
    private String followBy;
    private String followByName;
    private LocalDateTime followTime;
    private LocalDateTime createTime;
}
