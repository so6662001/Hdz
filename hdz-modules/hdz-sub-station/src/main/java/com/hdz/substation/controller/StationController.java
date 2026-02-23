package com.hdz.substation.controller;

import com.hdz.common.dto.Result;
import com.hdz.common.util.IpLocationUtil;
import com.hdz.substation.service.StationService;
import com.hdz.substation.service.UserStationService;
import com.hdz.substation.vo.StationVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Api(tags = "C端-分站")
@RestController
@RequestMapping("/api/v1/station")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;
    private final UserStationService userStationService;
    private final IpLocationUtil ipLocationUtil;

    @ApiOperation("分站列表")
    @GetMapping("/list")
    public Result<List<StationVO>> list() {
        return Result.ok(stationService.listEnabledStations());
    }

    @ApiOperation("分站详情")
    @GetMapping("/{stationCode}")
    public Result<StationVO> detail(@PathVariable String stationCode) {
        return Result.ok(stationService.getStationByCode(stationCode));
    }

    @ApiOperation("IP定位")
    @GetMapping("/location/detect")
    public Result<Map<String, Object>> detectLocation(HttpServletRequest request) {
        String ip = getClientIp(request);
        IpLocationUtil.IpLocation location = ipLocationUtil.getLocation(ip);

        Map<String, Object> result = new HashMap<>();
        result.put("ip", ip);
        result.put("cityName", location.getCity());
        result.put("provinceName", location.getProvince());

        String stationCode = stationService.getStationCodeByCity(location.getCity());
        result.put("stationCode", stationCode);
        result.put("hasStation", stationCode != null);

        return Result.ok(result);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
