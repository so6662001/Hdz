package com.hdz.circle.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("hdz_circle_category")
public class CircleCategory implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String categoryName;
    private String categoryIcon;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createTime;
}
