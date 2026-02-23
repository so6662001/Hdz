package com.hdz.circle.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.hdz.circle.entity.CircleComment;
import com.hdz.circle.entity.CirclePost;

import java.util.List;
import java.util.Map;

public interface CirclePostService extends IService<CirclePost> {

    /**
     * 圈子 Feed 流（C端）
     */
    IPage<Map<String, Object>> getFeed(String stationCode, Long categoryId, String sortBy,
                                        Long userId, int pageNum, int pageSize);

    /**
     * 动态详情（C端）
     */
    Map<String, Object> getPostDetail(Long postId, Long userId);

    /**
     * 企业主页动态列表
     */
    IPage<CirclePost> getEnterprisePosts(String enterpriseName, Long stationId, int pageNum, int pageSize);

    /**
     * 点赞 / 取消点赞
     */
    boolean toggleLike(Long postId, Long userId);

    /**
     * 收藏 / 取消收藏
     */
    boolean toggleFavorite(Long postId, Long userId);

    /**
     * 发表评论
     */
    Long addComment(Long postId, Long userId, String nickname, String avatar,
                    String content, Long parentId);

    /**
     * 评论列表
     */
    IPage<CircleComment> getComments(Long postId, int pageNum, int pageSize);

    /**
     * 后台：发布动态
     */
    Long createPost(CirclePost post);

    /**
     * 后台：分页列表
     */
    IPage<CirclePost> pageAdmin(Map<String, Object> params);

    /**
     * 后台：审核
     */
    void audit(Long id, Integer auditStatus);

    /**
     * 后台：置顶/取消
     */
    void toggleTop(Long id);

    /**
     * 后台：热门/取消
     */
    void toggleHot(Long id);
}
