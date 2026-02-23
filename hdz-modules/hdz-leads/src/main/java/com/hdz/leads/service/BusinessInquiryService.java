package com.hdz.leads.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.hdz.leads.dto.FollowUpDTO;
import com.hdz.leads.dto.InquirySubmitDTO;
import com.hdz.leads.entity.BusinessInquiry;
import com.hdz.leads.entity.FollowUpRecord;

import java.util.List;
import java.util.Map;

public interface BusinessInquiryService extends IService<BusinessInquiry> {

    String submit(InquirySubmitDTO dto, String source, String ip, String ua);

    IPage<BusinessInquiry> pageInquiries(Map<String, Object> params);

    Map<String, Object> getDetail(Long id);

    void updateProcessStatus(Long id, Integer processStatus);

    void addFollowUp(Long id, FollowUpDTO dto, String operator, String operatorName);

    List<FollowUpRecord> getFollowUpRecords(Long id);
}
