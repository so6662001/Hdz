package com.hdz.substation.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hdz.common.dto.Result;
import com.hdz.substation.dto.StationCreateDTO;
import com.hdz.substation.dto.StationQueryDTO;
import com.hdz.substation.service.StationService;
import com.hdz.substation.vo.StationVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@Api(tags = "后台-分站管理")
@RestController
@RequestMapping("/api/admin/v1/station")
@RequiredArgsConstructor
public class StationAdminController {

    private final StationService stationService;

    @ApiOperation("分站列表(分页)")
    @GetMapping("/page")
    public Result<IPage<StationVO>> page(StationQueryDTO query) {
        return Result.ok(stationService.pageStations(query));
    }

    @ApiOperation("分站详情")
    @GetMapping("/{id}")
    public Result<StationVO> detail(@PathVariable Long id) {
        return Result.ok(stationService.getStationDetail(id));
    }

    @ApiOperation("创建分站")
    @PostMapping
    public Result<Long> create(@Valid @RequestBody StationCreateDTO dto) {
        return Result.ok(stationService.createStation(dto));
    }

    @ApiOperation("更新分站")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody StationCreateDTO dto) {
        stationService.updateStation(id, dto);
        return Result.ok();
    }

    @ApiOperation("删除分站")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        stationService.deleteStation(id);
        return Result.ok();
    }

    @ApiOperation("分站状态变更")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        stationService.updateStatus(id, body.get("status"));
        return Result.ok();
    }

    @ApiOperation("分站城市管理")
    @PutMapping("/{id}/cities")
    public Result<Void> updateCities(@PathVariable Long id, @RequestBody Map<String, List<String>> body) {
        stationService.updateCities(id, body.get("cityCodeList"));
        return Result.ok();
    }
}
