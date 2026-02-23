package com.hdz.substation.controller;

import com.hdz.common.dto.Result;
import com.hdz.substation.service.UserStationService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Api(tags = "C端-用户分站记忆")
@RestController
@RequestMapping("/api/v1/user/station")
@RequiredArgsConstructor
public class UserStationController {

    private final UserStationService userStationService;

    @ApiOperation("记录用户访问分站")
    @PostMapping
    public Result<Void> recordVisit(@RequestBody Map<String, Object> body) {
        Long userId = Long.parseLong(body.get("userId").toString());
        Long stationId = Long.parseLong(body.get("stationId").toString());
        String stationCode = body.get("stationCode").toString();
        userStationService.recordVisit(userId, stationId, stationCode);
        return Result.ok();
    }

    @ApiOperation("获取用户上次访问的分站")
    @GetMapping
    public Result<Map<String, String>> getLastStation(@RequestParam Long userId) {
        String code = userStationService.getLastStationCode(userId);
        return Result.ok(Map.of("stationCode", code != null ? code : ""));
    }
}
