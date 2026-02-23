package com.hdz.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ChargeType {

    FREE("FREE", "赠送"),
    PAID("PAID", "收费");

    private final String code;
    private final String desc;
}
