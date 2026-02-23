package com.hdz.advertisement.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hdz.advertisement.dto.AdContentCreateDTO;
import com.hdz.advertisement.dto.AdContentQueryDTO;
import com.hdz.advertisement.entity.*;
import com.hdz.advertisement.mapper.*;
import com.hdz.advertisement.service.AdContentService;
import com.hdz.common.exception.BizException;
import com.hdz.substation.entity.SubStation;
import com.hdz.substation.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdContentServiceImpl extends ServiceImpl<AdContentMapper, AdContent> implements AdContentService {

    private final AdZoneMapper zoneMapper;
    private final AdSlotMapper slotMapper;
    private final AdStatsMapper statsMapper;
    private final StationService stationService;
    private final StringRedisTemplate redisTemplate;

    @Override
    public IPage<AdContent> pageAdContents(AdContentQueryDTO query) {
        LambdaQueryWrapper<AdContent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(query.getStationId() != null, AdContent::getStationId, query.getStationId());
        wrapper.eq(query.getZoneId() != null, AdContent::getZoneId, query.getZoneId());
        wrapper.eq(query.getAuditStatus() != null, AdContent::getAuditStatus, query.getAuditStatus());
        wrapper.eq(query.getStatus() != null, AdContent::getStatus, query.getStatus());
        wrapper.eq(query.getChargeType() != null, AdContent::getChargeType, query.getChargeType());
        wrapper.like(query.getTitle() != null, AdContent::getTitle, query.getTitle());
        wrapper.orderByDesc(AdContent::getCreateTime);
        return this.page(new Page<>(query.getPageNum(), query.getPageSize()), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createAdContent(AdContentCreateDTO dto) {
        AdContent content = new AdContent();
        BeanUtil.copyProperties(dto, content);
        content.setAuditStatus(0);
        content.setStatus(0);
        content.setClickCount(0);
        content.setViewCount(0);
        this.save(content);
        return content.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAdContent(Long id, AdContentCreateDTO dto) {
        AdContent existing = this.getById(id);
        if (existing == null) {
            throw new BizException(404, "广告不存在");
        }
        BeanUtil.copyProperties(dto, existing, "id", "auditStatus", "status", "clickCount", "viewCount");
        this.updateById(existing);
    }

    @Override
    public void deleteAdContent(Long id) {
        this.removeById(id);
    }

    @Override
    public void audit(Long id, Integer auditStatus, String auditRemark) {
        AdContent content = this.getById(id);
        if (content == null) {
            throw new BizException(404, "广告不存在");
        }
        content.setAuditStatus(auditStatus);
        content.setAuditRemark(auditRemark);
        content.setAuditTime(LocalDateTime.now());
        this.updateById(content);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        AdContent content = new AdContent();
        content.setId(id);
        content.setStatus(status);
        this.updateById(content);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reposition(Long id, Long newSlotId, AdContentCreateDTO dto) {
        AdContent content = this.getById(id);
        if (content == null) {
            throw new BizException(404, "广告不存在");
        }
        if (content.getPositionAdjustable() == null || content.getPositionAdjustable() != 1) {
            throw new BizException("该广告不允许位置调整");
        }

        content.setSlotId(newSlotId);
        if (dto.getStartTime() != null) content.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) content.setEndTime(dto.getEndTime());
        if (dto.getChargeType() != null) content.setChargeType(dto.getChargeType());
        if (dto.getChargeRemark() != null) content.setChargeRemark(dto.getChargeRemark());
        content.setStatus(1);
        this.updateById(content);
    }

    @Override
    public List<Map<String, Object>> getStationAds(String stationCode) {
        SubStation station = stationService.lambdaQuery()
                .eq(SubStation::getStationCode, stationCode)
                .eq(SubStation::getStatus, 1)
                .one();
        if (station == null) {
            return Collections.emptyList();
        }

        List<AdZone> zones = zoneMapper.selectList(
                new LambdaQueryWrapper<AdZone>()
                        .eq(AdZone::getStatus, 1)
                        .orderByAsc(AdZone::getSortOrder));

        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> result = new ArrayList<>();

        for (AdZone zone : zones) {
            List<AdContent> ads = this.lambdaQuery()
                    .eq(AdContent::getStationId, station.getId())
                    .eq(AdContent::getZoneId, zone.getId())
                    .eq(AdContent::getStatus, 1)
                    .eq(AdContent::getAuditStatus, 1)
                    .le(AdContent::getStartTime, now)
                    .ge(AdContent::getEndTime, now)
                    .orderByDesc(AdContent::getSortWeight)
                    .list();

            Map<String, Object> zoneData = new HashMap<>();
            zoneData.put("zoneCode", zone.getZoneCode());
            zoneData.put("zoneName", zone.getZoneName());
            zoneData.put("zoneType", zone.getZoneType());
            zoneData.put("width", zone.getWidth());
            zoneData.put("height", zone.getHeight());
            zoneData.put("ads", ads.stream().map(ad -> {
                Map<String, Object> adData = new HashMap<>();
                adData.put("id", ad.getId());
                adData.put("title", ad.getTitle());
                adData.put("subtitle", ad.getSubtitle());
                adData.put("imageUrl", ad.getImageUrl());
                adData.put("linkType", ad.getLinkType());
                adData.put("linkUrl", ad.getLinkUrl());
                adData.put("linkUrlMobile", ad.getLinkUrlMobile());
                adData.put("linkTarget", ad.getLinkTarget());
                adData.put("advertiserName", ad.getAdvertiserName());
                return adData;
            }).collect(Collectors.toList()));
            result.add(zoneData);
        }

        return result;
    }

    @Override
    public void recordClick(Long adId, String stationCode, String source) {
        this.lambdaUpdate()
                .eq(AdContent::getId, adId)
                .setSql("click_count = click_count + 1")
                .update();

        String key = "hdz:ad:stats:" + adId + ":" + LocalDate.now();
        redisTemplate.opsForHash().increment(key, "click", 1);
    }

    @Override
    public void recordImpression(String stationCode, List<Long> adIds, String source) {
        for (Long adId : adIds) {
            this.lambdaUpdate()
                    .eq(AdContent::getId, adId)
                    .setSql("view_count = view_count + 1")
                    .update();

            String key = "hdz:ad:stats:" + adId + ":" + LocalDate.now();
            redisTemplate.opsForHash().increment(key, "view", 1);
        }
    }
}
