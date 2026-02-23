package com.hdz.common.spi;

/**
 * SPI 接口：由宿主系统实现，提供当前用户信息和权限校验能力
 */
public interface HdzUserProvider {

    /**
     * 获取当前登录用户信息
     */
    HdzUserInfo getCurrentUser();

    /**
     * 校验当前用户是否具有指定权限
     */
    boolean hasPermission(String permissionCode);

    /**
     * 当前用户是否已登录
     */
    boolean isLoggedIn();
}
