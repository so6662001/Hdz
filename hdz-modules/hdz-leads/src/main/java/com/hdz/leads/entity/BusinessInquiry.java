package com.hdz.leads.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("hdz_business_inquiry")
public class BusinessInquiry implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String inquiryNo;
    private Long stationId;
    private String stationName;
    private String companyName;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private String industry;
    private String cityName;
    private String cooperationType;
    private String description;
    private String source;
    private Integer processStatus;
    private String ipAddress;
    private String userAgent;
    private Integer notifySent;
    private LocalDateTime createTime;
}
