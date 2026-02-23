package com.hdz.leads.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("hdz_wechat_notify_config")
public class WeChatNotifyConfig implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String configName;
    private String notifyType;
    private String channelType;
    private String webhookUrl;
    private String corpId;
    private String agentId;
    private String agentSecret;
    private String receiverUserIds;
    private Integer enabled;
    private String silentStart;
    private String silentEnd;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
