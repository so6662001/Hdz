package com.hdz.advertisement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hdz.advertisement.dto.AdContentCreateDTO;
import com.hdz.advertisement.dto.AdContentQueryDTO;
import com.hdz.advertisement.entity.AdContent;
import com.hdz.advertisement.service.AdContentService;
import com.hdz.common.dto.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@Api(tags = "后台-广告内容管理")
@RestController
@RequestMapping("/api/admin/v1/ad-content")
@RequiredArgsConstructor
public class AdContentAdminController {

    private final AdContentService adContentService;

    @ApiOperation("广告列表(分页)")
    @GetMapping("/page")
    public Result<IPage<AdContent>> page(AdContentQueryDTO query) {
        return Result.ok(adContentService.pageAdContents(query));
    }

    @ApiOperation("广告详情")
    @GetMapping("/{id}")
    public Result<AdContent> detail(@PathVariable Long id) {
        return Result.ok(adContentService.getById(id));
    }

    @ApiOperation("创建广告")
    @PostMapping
    public Result<Long> create(@Valid @RequestBody AdContentCreateDTO dto) {
        return Result.ok(adContentService.createAdContent(dto));
    }

    @ApiOperation("更新广告")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody AdContentCreateDTO dto) {
        adContentService.updateAdContent(id, dto);
        return Result.ok();
    }

    @ApiOperation("删除广告")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        adContentService.deleteAdContent(id);
        return Result.ok();
    }

    @ApiOperation("审核广告")
    @PutMapping("/{id}/audit")
    public Result<Void> audit(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Integer auditStatus = (Integer) body.get("auditStatus");
        String auditRemark = (String) body.get("auditRemark");
        adContentService.audit(id, auditStatus, auditRemark);
        return Result.ok();
    }

    @ApiOperation("广告上下线")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        adContentService.updateStatus(id, body.get("status"));
        return Result.ok();
    }

    @ApiOperation("广告位置调整(到期后)")
    @PutMapping("/{id}/reposition")
    public Result<Void> reposition(@PathVariable Long id, @RequestBody AdContentCreateDTO dto) {
        adContentService.reposition(id, dto.getSlotId(), dto);
        return Result.ok();
    }
}
