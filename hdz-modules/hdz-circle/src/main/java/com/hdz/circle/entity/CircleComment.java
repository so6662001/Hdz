package com.hdz.circle.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("hdz_circle_comment")
public class CircleComment implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long postId;
    private Long userId;
    private String userNickname;
    private String userAvatar;
    private String content;
    private Long parentId;
    private Long replyUserId;
    private String replyUserNickname;
    private Integer likeCount;
    private Integer isEnterpriseReply;
    private Integer status;
    private LocalDateTime createTime;
}
