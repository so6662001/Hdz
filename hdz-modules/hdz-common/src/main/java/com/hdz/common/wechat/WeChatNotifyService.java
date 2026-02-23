package com.hdz.common.wechat;

import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class WeChatNotifyService {

    /**
     * 通过 Webhook 发送企微群消息
     */
    public boolean sendWebhookMessage(String webhookUrl, String content) {
        try {
            JSONObject body = new JSONObject();
            body.set("msgtype", "markdown");
            JSONObject markdown = new JSONObject();
            markdown.set("content", content);
            body.set("markdown", markdown);

            String response = HttpUtil.post(webhookUrl, body.toString());
            JSONObject result = JSONUtil.parseObj(response);
            if (result.getInt("errcode", -1) == 0) {
                log.info("企微Webhook消息发送成功");
                return true;
            }
            log.warn("企微Webhook消息发送失败: {}", response);
            return false;
        } catch (Exception e) {
            log.error("企微Webhook消息发送异常", e);
            return false;
        }
    }

    /**
     * 构建招商登记通知内容
     */
    public String buildInquiryNotifyContent(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        sb.append("### 新招商登记通知\n");
        sb.append("> **企业名称**: ").append(params.getOrDefault("companyName", "-")).append("\n");
        sb.append("> **联系人**: ").append(params.getOrDefault("contactName", "-")).append("\n");
        sb.append("> **联系电话**: ").append(params.getOrDefault("contactPhone", "-")).append("\n");
        sb.append("> **所在城市**: ").append(params.getOrDefault("cityName", "-")).append("\n");
        sb.append("> **合作意向**: ").append(params.getOrDefault("cooperationType", "-")).append("\n");
        sb.append("> **登记时间**: ").append(params.getOrDefault("createTime", "-")).append("\n");
        sb.append("\n请及时跟进处理");
        return sb.toString();
    }

    /**
     * 构建广告需求登记通知内容
     */
    public String buildAdDemandNotifyContent(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        sb.append("### 新广告需求登记通知\n");
        sb.append("> **企业名称**: ").append(params.getOrDefault("companyName", "-")).append("\n");
        sb.append("> **联系人**: ").append(params.getOrDefault("contactName", "-")).append("\n");
        sb.append("> **联系电话**: ").append(params.getOrDefault("contactPhone", "-")).append("\n");
        sb.append("> **意向版块**: ").append(params.getOrDefault("targetZoneType", "-")).append("\n");
        sb.append("> **预算范围**: ").append(params.getOrDefault("budgetRange", "-")).append("\n");
        sb.append("> **登记时间**: ").append(params.getOrDefault("createTime", "-")).append("\n");
        sb.append("\n请及时跟进处理");
        return sb.toString();
    }
}
