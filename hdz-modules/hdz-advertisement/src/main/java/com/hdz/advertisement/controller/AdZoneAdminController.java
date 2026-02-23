package com.hdz.advertisement.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hdz.advertisement.entity.AdZone;
import com.hdz.advertisement.mapper.AdZoneMapper;
import com.hdz.common.dto.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "后台-广告版块管理")
@RestController
@RequestMapping("/api/admin/v1/ad-zone")
@RequiredArgsConstructor
public class AdZoneAdminController {

    private final AdZoneMapper adZoneMapper;

    @ApiOperation("版块列表")
    @GetMapping("/list")
    public Result<List<AdZone>> list(@RequestParam(required = false) String zoneType,
                                     @RequestParam(required = false) Integer status) {
        LambdaQueryWrapper<AdZone> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(zoneType != null, AdZone::getZoneType, zoneType);
        wrapper.eq(status != null, AdZone::getStatus, status);
        wrapper.orderByAsc(AdZone::getSortOrder);
        return Result.ok(adZoneMapper.selectList(wrapper));
    }

    @ApiOperation("创建版块")
    @PostMapping
    public Result<Void> create(@RequestBody AdZone zone) {
        adZoneMapper.insert(zone);
        return Result.ok();
    }

    @ApiOperation("更新版块")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody AdZone zone) {
        zone.setId(id);
        adZoneMapper.updateById(zone);
        return Result.ok();
    }

    @ApiOperation("删除版块")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        adZoneMapper.deleteById(id);
        return Result.ok();
    }
}
