package com.hdz.substation.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;

@Data
public class StationCreateDTO implements Serializable {

    @NotBlank(message = "分站编码不能为空")
    private String stationCode;

    @NotBlank(message = "分站名称不能为空")
    private String stationName;

    private String stationLogo;
    private String stationBanner;
    private String description;
    private String contactPhone;
    private String contactEmail;
    private Integer sortOrder = 0;

    @NotNull(message = "状态不能为空")
    private Integer status;

    private Integer isDefault = 0;
    private String seoTitle;
    private String seoKeywords;
    private String seoDescription;

    private List<String> cityCodeList;
}
