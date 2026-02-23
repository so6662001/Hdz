package com.hdz.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProcessStatus {

    PENDING(0, "待处理"),
    FOLLOWING(1, "跟进中"),
    DEAL(2, "已成交"),
    CLOSED(3, "已关闭");

    private final int code;
    private final String desc;
}
