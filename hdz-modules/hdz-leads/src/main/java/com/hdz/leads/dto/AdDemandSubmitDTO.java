package com.hdz.leads.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.io.Serializable;

@Data
public class AdDemandSubmitDTO implements Serializable {

    private String stationCode;

    @NotBlank(message = "企业名称不能为空")
    private String companyName;

    @NotBlank(message = "联系人不能为空")
    private String contactName;

    @NotBlank(message = "联系电话不能为空")
    private String contactPhone;

    private String contactEmail;
    private String targetZoneType;
    private String budgetRange;
    private String duration;
    private String description;
}
