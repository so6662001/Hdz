package com.hdz.leads.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hdz.common.dto.Result;
import com.hdz.leads.dto.FollowUpDTO;
import com.hdz.leads.entity.BusinessInquiry;
import com.hdz.leads.service.BusinessInquiryService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@Api(tags = "后台-招商登记管理")
@RestController
@RequestMapping("/api/admin/v1/business-inquiry")
@RequiredArgsConstructor
public class InquiryAdminController {

    private final BusinessInquiryService inquiryService;

    @ApiOperation("招商登记列表(分页)")
    @GetMapping("/page")
    public Result<IPage<BusinessInquiry>> page(@RequestParam Map<String, Object> params) {
        return Result.ok(inquiryService.pageInquiries(params));
    }

    @ApiOperation("招商登记详情(含跟进记录)")
    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id) {
        return Result.ok(inquiryService.getDetail(id));
    }

    @ApiOperation("更新处理状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        inquiryService.updateProcessStatus(id, body.get("processStatus"));
        return Result.ok();
    }

    @ApiOperation("添加跟进记录")
    @PostMapping("/{id}/follow-up")
    public Result<Void> addFollowUp(@PathVariable Long id, @Valid @RequestBody FollowUpDTO dto) {
        inquiryService.addFollowUp(id, dto, "admin", "管理员");
        return Result.ok();
    }
}
