package com.hdz.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum LinkType {

    STORE_PC("STORE_PC", "商家首页(PC端)"),
    STORE_MOBILE("STORE_MOBILE", "商家首页(移动端)"),
    OFFICIAL_SITE("OFFICIAL_SITE", "公司官网"),
    CUSTOM("CUSTOM", "自定义链接");

    private final String code;
    private final String desc;
}
