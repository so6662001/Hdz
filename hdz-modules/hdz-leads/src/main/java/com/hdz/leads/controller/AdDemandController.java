package com.hdz.leads.controller;

import com.hdz.common.dto.Result;
import com.hdz.leads.dto.AdDemandSubmitDTO;
import com.hdz.leads.entity.AdDemand;
import com.hdz.leads.mapper.AdDemandMapper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Api(tags = "C端-广告需求登记")
@RestController
@RequestMapping("/api/v1/ad-demand")
@RequiredArgsConstructor
public class AdDemandController {

    private final AdDemandMapper adDemandMapper;

    @ApiOperation("提交广告需求登记")
    @PostMapping("/submit")
    public Result<Map<String, String>> submit(@Valid @RequestBody AdDemandSubmitDTO dto,
                                               @RequestParam(defaultValue = "WEB") String source,
                                               HttpServletRequest request) {
        String demandNo = "GG" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + String.format("%03d", (int)(Math.random() * 1000));

        AdDemand demand = new AdDemand();
        demand.setDemandNo(demandNo);
        demand.setCompanyName(dto.getCompanyName());
        demand.setContactName(dto.getContactName());
        demand.setContactPhone(dto.getContactPhone());
        demand.setContactEmail(dto.getContactEmail());
        demand.setTargetZoneType(dto.getTargetZoneType());
        demand.setBudgetRange(dto.getBudgetRange());
        demand.setDuration(dto.getDuration());
        demand.setDescription(dto.getDescription());
        demand.setSource(source);
        demand.setProcessStatus(0);
        demand.setIpAddress(request.getRemoteAddr());
        demand.setUserAgent(request.getHeader("User-Agent"));
        demand.setNotifySent(0);
        demand.setCreateTime(LocalDateTime.now());

        adDemandMapper.insert(demand);

        return Result.ok("需求登记成功，我们将尽快与您联系", Map.of("demandNo", demandNo));
    }
}
