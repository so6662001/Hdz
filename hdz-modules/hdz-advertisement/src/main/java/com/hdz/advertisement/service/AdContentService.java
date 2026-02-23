package com.hdz.advertisement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.hdz.advertisement.dto.AdContentCreateDTO;
import com.hdz.advertisement.dto.AdContentQueryDTO;
import com.hdz.advertisement.entity.AdContent;

import java.util.List;
import java.util.Map;

public interface AdContentService extends IService<AdContent> {

    IPage<AdContent> pageAdContents(AdContentQueryDTO query);

    Long createAdContent(AdContentCreateDTO dto);

    void updateAdContent(Long id, AdContentCreateDTO dto);

    void deleteAdContent(Long id);

    void audit(Long id, Integer auditStatus, String auditRemark);

    void updateStatus(Long id, Integer status);

    void reposition(Long id, Long newSlotId, AdContentCreateDTO dto);

    /**
     * 获取分站下所有广告版块及内容（C端展示）
     */
    List<Map<String, Object>> getStationAds(String stationCode);

    void recordClick(Long adId, String stationCode, String source);

    void recordImpression(String stationCode, List<Long> adIds, String source);
}
