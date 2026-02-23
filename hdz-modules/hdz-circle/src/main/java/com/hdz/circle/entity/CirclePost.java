package com.hdz.circle.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hdz.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hdz_circle_post")
public class CirclePost extends BaseEntity {

    private Long stationId;
    private Long adContentId;
    private String enterpriseName;
    private String enterpriseLogo;
    private String enterprisePhone;
    private String enterpriseWebsite;
    private String enterpriseAddress;
    private String postType;
    private String title;
    private String content;
    private String images;
    private String videoUrl;
    private String videoCover;
    private LocalDateTime activityStartTime;
    private LocalDateTime activityEndTime;
    private String activityAddress;
    private String linkUrl;
    private String linkUrlMobile;
    private Long categoryId;
    private String tags;
    private Integer isTop;
    private Integer isHot;
    private String chargeType;
    private Integer likeCount;
    private Integer commentCount;
    private Integer shareCount;
    private Integer viewCount;
    private Integer favoriteCount;
    private Integer sortWeight;
    private Integer status;
    private Integer auditStatus;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
