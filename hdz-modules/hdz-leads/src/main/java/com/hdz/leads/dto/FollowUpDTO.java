package com.hdz.leads.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class FollowUpDTO implements Serializable {

    @NotBlank(message = "跟进内容不能为空")
    private String followContent;

    private String followResult;
    private LocalDateTime followTime;
}
