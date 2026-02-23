package com.hdz.leads.service.impl;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.map.MapUtil;
import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hdz.common.exception.BizException;
import com.hdz.common.wechat.WeChatNotifyService;
import com.hdz.leads.dto.FollowUpDTO;
import com.hdz.leads.dto.InquirySubmitDTO;
import com.hdz.leads.entity.BusinessInquiry;
import com.hdz.leads.entity.FollowUpRecord;
import com.hdz.leads.entity.WeChatNotifyConfig;
import com.hdz.leads.mapper.BusinessInquiryMapper;
import com.hdz.leads.mapper.FollowUpRecordMapper;
import com.hdz.leads.mapper.WeChatNotifyConfigMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessInquiryServiceImpl extends ServiceImpl<BusinessInquiryMapper, BusinessInquiry>
        implements BusinessInquiryService {

    private final FollowUpRecordMapper followUpMapper;
    private final WeChatNotifyConfigMapper notifyConfigMapper;
    private final WeChatNotifyService weChatNotifyService;

    @Override
    public String submit(InquirySubmitDTO dto, String source, String ip, String ua) {
        String inquiryNo = "ZS" + DateUtil.format(LocalDateTime.now(), "yyyyMMddHHmmss")
                + String.format("%03d", (int)(Math.random() * 1000));

        BusinessInquiry inquiry = new BusinessInquiry();
        inquiry.setInquiryNo(inquiryNo);
        inquiry.setCompanyName(dto.getCompanyName());
        inquiry.setContactName(dto.getContactName());
        inquiry.setContactPhone(dto.getContactPhone());
        inquiry.setContactEmail(dto.getContactEmail());
        inquiry.setIndustry(dto.getIndustry());
        inquiry.setCityName(dto.getCityName());
        inquiry.setCooperationType(dto.getCooperationType());
        inquiry.setDescription(dto.getDescription());
        inquiry.setSource(source);
        inquiry.setProcessStatus(0);
        inquiry.setIpAddress(ip);
        inquiry.setUserAgent(ua);
        inquiry.setNotifySent(0);
        inquiry.setCreateTime(LocalDateTime.now());

        this.save(inquiry);

        sendNotifyAsync(inquiry);

        return inquiryNo;
    }

    @Override
    public IPage<BusinessInquiry> pageInquiries(Map<String, Object> params) {
        int pageNum = MapUtil.getInt(params, "pageNum", 1);
        int pageSize = MapUtil.getInt(params, "pageSize", 10);

        LambdaQueryWrapper<BusinessInquiry> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(params.get("stationId") != null, BusinessInquiry::getStationId, params.get("stationId"));
        wrapper.eq(params.get("processStatus") != null, BusinessInquiry::getProcessStatus, params.get("processStatus"));
        wrapper.like(params.get("companyName") != null, BusinessInquiry::getCompanyName, params.get("companyName"));
        wrapper.orderByDesc(BusinessInquiry::getCreateTime);

        return this.page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Map<String, Object> getDetail(Long id) {
        BusinessInquiry inquiry = this.getById(id);
        if (inquiry == null) {
            throw new BizException(404, "登记记录不存在");
        }
        Map<String, Object> result = new HashMap<>();
        result.put("inquiry", inquiry);
        result.put("followUpRecords", getFollowUpRecords(id));
        return result;
    }

    @Override
    public void updateProcessStatus(Long id, Integer processStatus) {
        BusinessInquiry inquiry = this.getById(id);
        if (inquiry == null) {
            throw new BizException(404, "登记记录不存在");
        }
        BusinessInquiry update = new BusinessInquiry();
        update.setId(id);
        update.setProcessStatus(processStatus);
        this.updateById(update);
    }

    @Override
    public void addFollowUp(Long id, FollowUpDTO dto, String operator, String operatorName) {
        BusinessInquiry inquiry = this.getById(id);
        if (inquiry == null) {
            throw new BizException(404, "登记记录不存在");
        }

        FollowUpRecord record = new FollowUpRecord();
        record.setRefType("INQUIRY");
        record.setRefId(id);
        record.setFollowContent(dto.getFollowContent());
        record.setFollowResult(dto.getFollowResult());
        record.setFollowBy(operator);
        record.setFollowByName(operatorName);
        record.setFollowTime(dto.getFollowTime() != null ? dto.getFollowTime() : LocalDateTime.now());
        record.setCreateTime(LocalDateTime.now());
        followUpMapper.insert(record);
    }

    @Override
    public List<FollowUpRecord> getFollowUpRecords(Long id) {
        return followUpMapper.selectList(
                new LambdaQueryWrapper<FollowUpRecord>()
                        .eq(FollowUpRecord::getRefType, "INQUIRY")
                        .eq(FollowUpRecord::getRefId, id)
                        .orderByDesc(FollowUpRecord::getFollowTime));
    }

    @Async
    void sendNotifyAsync(BusinessInquiry inquiry) {
        try {
            List<WeChatNotifyConfig> configs = notifyConfigMapper.selectList(
                    new LambdaQueryWrapper<WeChatNotifyConfig>()
                            .eq(WeChatNotifyConfig::getNotifyType, "INQUIRY")
                            .eq(WeChatNotifyConfig::getEnabled, 1));

            for (WeChatNotifyConfig config : configs) {
                if ("WEBHOOK".equals(config.getChannelType()) && config.getWebhookUrl() != null) {
                    Map<String, String> params = new HashMap<>();
                    params.put("companyName", inquiry.getCompanyName());
                    params.put("contactName", inquiry.getContactName());
                    params.put("contactPhone", inquiry.getContactPhone());
                    params.put("cityName", inquiry.getCityName());
                    params.put("cooperationType", inquiry.getCooperationType());
                    params.put("createTime", inquiry.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                    String content = weChatNotifyService.buildInquiryNotifyContent(params);
                    boolean sent = weChatNotifyService.sendWebhookMessage(config.getWebhookUrl(), content);

                    BusinessInquiry update = new BusinessInquiry();
                    update.setId(inquiry.getId());
                    update.setNotifySent(sent ? 1 : 2);
                    this.updateById(update);
                }
            }
        } catch (Exception e) {
            log.error("企微通知发送异常", e);
        }
    }
}
