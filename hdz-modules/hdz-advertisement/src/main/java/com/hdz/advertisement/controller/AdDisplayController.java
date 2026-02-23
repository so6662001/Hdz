package com.hdz.advertisement.controller;

import com.hdz.advertisement.service.AdContentService;
import com.hdz.common.dto.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Api(tags = "C端-广告展示")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AdDisplayController {

    private final AdContentService adContentService;

    @ApiOperation("分站广告数据")
    @GetMapping("/station/{stationCode}/ads")
    public Result<List<Map<String, Object>>> getStationAds(@PathVariable String stationCode) {
        return Result.ok(adContentService.getStationAds(stationCode));
    }

    @ApiOperation("广告点击上报")
    @PostMapping("/ad/{adId}/click")
    public Result<Void> click(@PathVariable Long adId,
                              @RequestParam String stationCode,
                              @RequestParam(defaultValue = "WEB") String source) {
        adContentService.recordClick(adId, stationCode, source);
        return Result.ok();
    }

    @ApiOperation("广告展示上报")
    @PostMapping("/ad/impression")
    public Result<Void> impression(@RequestBody Map<String, Object> body) {
        String stationCode = (String) body.get("stationCode");
        @SuppressWarnings("unchecked")
        List<Long> adIds = ((List<Number>) body.get("adIds")).stream()
                .map(Number::longValue).collect(java.util.stream.Collectors.toList());
        String source = (String) body.getOrDefault("source", "WEB");
        adContentService.recordImpression(stationCode, adIds, source);
        return Result.ok();
    }
}
