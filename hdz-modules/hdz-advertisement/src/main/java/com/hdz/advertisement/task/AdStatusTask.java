package com.hdz.advertisement.task;

import com.hdz.advertisement.entity.AdContent;
import com.hdz.advertisement.service.AdContentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 广告到期自动处理定时任务：
 * - position_adjustable=0 → 到期自动下线(status=0)
 * - position_adjustable=1 → 到期进入待调整状态(status=3)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdStatusTask {

    private final AdContentService adContentService;

    @Scheduled(cron = "0 */5 * * * ?")
    public void processExpiredAds() {
        LocalDateTime now = LocalDateTime.now();

        List<AdContent> expiredAds = adContentService.lambdaQuery()
                .eq(AdContent::getStatus, 1)
                .le(AdContent::getEndTime, now)
                .isNotNull(AdContent::getEndTime)
                .list();

        for (AdContent ad : expiredAds) {
            if (ad.getPositionAdjustable() != null && ad.getPositionAdjustable() == 1) {
                ad.setStatus(3);
                log.info("广告[{}]到期，进入待调整状态", ad.getId());
            } else {
                ad.setStatus(0);
                log.info("广告[{}]到期，自动下线", ad.getId());
            }
            adContentService.updateById(ad);
        }
    }
}
