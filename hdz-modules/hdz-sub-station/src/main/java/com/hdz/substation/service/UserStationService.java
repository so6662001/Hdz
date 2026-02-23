package com.hdz.substation.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hdz.substation.entity.UserStation;

public interface UserStationService extends IService<UserStation> {

    /**
     * 记录用户访问的分站
     */
    void recordVisit(Long userId, Long stationId, String stationCode);

    /**
     * 获取用户上次访问的分站编码
     */
    String getLastStationCode(Long userId);
}
