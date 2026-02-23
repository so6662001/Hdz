package com.hdz.substation.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hdz.substation.entity.UserStation;
import com.hdz.substation.mapper.UserStationMapper;
import com.hdz.substation.service.UserStationService;
import org.springframework.data.redis.core.StringRedisTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserStationServiceImpl extends ServiceImpl<UserStationMapper, UserStation> implements UserStationService {

    private final StringRedisTemplate redisTemplate;

    private static final String CACHE_PREFIX = "hdz:user:station:";

    @Override
    public void recordVisit(Long userId, Long stationId, String stationCode) {
        UserStation existing = this.lambdaQuery()
                .eq(UserStation::getUserId, userId)
                .one();

        if (existing != null) {
            existing.setStationId(stationId);
            existing.setStationCode(stationCode);
            existing.setLastVisitTime(LocalDateTime.now());
            this.updateById(existing);
        } else {
            UserStation record = new UserStation();
            record.setUserId(userId);
            record.setStationId(stationId);
            record.setStationCode(stationCode);
            record.setLastVisitTime(LocalDateTime.now());
            record.setCreateTime(LocalDateTime.now());
            record.setUpdateTime(LocalDateTime.now());
            this.save(record);
        }

        redisTemplate.opsForValue().set(CACHE_PREFIX + userId, stationCode, Duration.ofDays(7));
    }

    @Override
    public String getLastStationCode(Long userId) {
        String cached = redisTemplate.opsForValue().get(CACHE_PREFIX + userId);
        if (cached != null) {
            return cached;
        }

        UserStation record = this.lambdaQuery()
                .eq(UserStation::getUserId, userId)
                .one();

        if (record != null) {
            redisTemplate.opsForValue().set(CACHE_PREFIX + userId, record.getStationCode(), Duration.ofDays(7));
            return record.getStationCode();
        }
        return null;
    }
}
