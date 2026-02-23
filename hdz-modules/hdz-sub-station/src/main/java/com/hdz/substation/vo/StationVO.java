package com.hdz.substation.vo;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class StationVO implements Serializable {

    private Long id;
    private String stationCode;
    private String stationName;
    private String stationLogo;
    private String stationBanner;
    private String description;
    private String contactPhone;
    private String contactEmail;
    private Integer sortOrder;
    private Integer status;
    private Integer isDefault;
    private String seoTitle;
    private String seoKeywords;
    private String seoDescription;
    private LocalDateTime createTime;

    private List<CityVO> cities;
    private Integer adCount;

    @Data
    public static class CityVO implements Serializable {
        private String cityCode;
        private String cityName;
    }
}
