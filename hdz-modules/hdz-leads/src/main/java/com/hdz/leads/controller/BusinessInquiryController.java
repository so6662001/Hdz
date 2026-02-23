package com.hdz.leads.controller;

import com.hdz.common.dto.Result;
import com.hdz.leads.dto.InquirySubmitDTO;
import com.hdz.leads.service.BusinessInquiryService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.Map;

@Api(tags = "C端-招商登记")
@RestController
@RequestMapping("/api/v1/business-inquiry")
@RequiredArgsConstructor
public class BusinessInquiryController {

    private final BusinessInquiryService inquiryService;

    @ApiOperation("提交招商登记")
    @PostMapping("/submit")
    public Result<Map<String, String>> submit(@Valid @RequestBody InquirySubmitDTO dto,
                                               @RequestParam(defaultValue = "WEB") String source,
                                               HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = request.getRemoteAddr();
        String ua = request.getHeader("User-Agent");

        String inquiryNo = inquiryService.submit(dto, source, ip, ua);
        return Result.ok("登记成功，我们将尽快与您联系", Map.of("inquiryNo", inquiryNo));
    }
}
