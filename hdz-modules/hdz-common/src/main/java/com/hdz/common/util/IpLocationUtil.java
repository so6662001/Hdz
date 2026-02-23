package com.hdz.common.util;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.lionsoul.ip2region.xdb.Searcher;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.InputStream;

@Slf4j
@Component
public class IpLocationUtil {

    private Searcher searcher;

    @PostConstruct
    public void init() {
        try {
            InputStream is = getClass().getResourceAsStream("/ip2region.xdb");
            if (is != null) {
                byte[] dbBuff = is.readAllBytes();
                searcher = Searcher.newWithBuffer(dbBuff);
                log.info("ip2region 数据库加载成功");
            } else {
                log.warn("ip2region.xdb 文件不存在，IP定位功能不可用");
            }
        } catch (Exception e) {
            log.error("ip2region 初始化失败", e);
        }
    }

    /**
     * 根据IP获取地理位置信息
     * @return 格式: "国家|区域|省份|城市|ISP"
     */
    public IpLocation getLocation(String ip) {
        IpLocation location = new IpLocation();
        if (searcher == null) {
            return location;
        }
        try {
            String region = searcher.search(ip);
            if (region != null) {
                String[] parts = region.split("\\|");
                if (parts.length >= 5) {
                    location.setCountry(parts[0]);
                    location.setProvince(parts[2]);
                    location.setCity(parts[3]);
                    location.setIsp(parts[4]);
                }
            }
        } catch (Exception e) {
            log.warn("IP定位失败: ip={}", ip, e);
        }
        return location;
    }

    @Data
    public static class IpLocation {
        private String country = "";
        private String province = "";
        private String city = "";
        private String isp = "";
    }
}
