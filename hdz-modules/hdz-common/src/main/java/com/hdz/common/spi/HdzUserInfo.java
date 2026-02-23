package com.hdz.common.spi;

import lombok.Data;

import java.io.Serializable;

@Data
public class HdzUserInfo implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long userId;
    private String username;
    private String nickname;
    private String phone;
    private String avatar;
}
