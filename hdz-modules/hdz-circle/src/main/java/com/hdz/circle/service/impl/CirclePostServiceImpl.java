package com.hdz.circle.service.impl;

import cn.hutool.core.map.MapUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hdz.circle.entity.*;
import com.hdz.circle.mapper.*;
import com.hdz.circle.service.CirclePostService;
import com.hdz.common.exception.BizException;
import com.hdz.substation.entity.SubStation;
import com.hdz.substation.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CirclePostServiceImpl extends ServiceImpl<CirclePostMapper, CirclePost>
        implements CirclePostService {

    private final CircleLikeMapper likeMapper;
    private final CircleCommentMapper commentMapper;
    private final CircleFavoriteMapper favoriteMapper;
    private final CircleCategoryMapper categoryMapper;
    private final StationService stationService;

    @Override
    public IPage<Map<String, Object>> getFeed(String stationCode, Long categoryId, String sortBy,
                                                Long userId, int pageNum, int pageSize) {
        SubStation station = stationService.lambdaQuery()
                .eq(SubStation::getStationCode, stationCode)
                .eq(SubStation::getStatus, 1)
                .one();
        if (station == null) {
            throw new BizException(404, "分站不存在");
        }

        LambdaQueryWrapper<CirclePost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CirclePost::getStationId, station.getId());
        wrapper.eq(CirclePost::getStatus, 1);
        wrapper.eq(CirclePost::getAuditStatus, 1);
        wrapper.eq(categoryId != null, CirclePost::getCategoryId, categoryId);

        if ("hot".equals(sortBy)) {
            wrapper.orderByDesc(CirclePost::getIsTop)
                    .orderByDesc(CirclePost::getIsHot)
                    .orderByDesc(CirclePost::getLikeCount);
        } else if ("latest".equals(sortBy)) {
            wrapper.orderByDesc(CirclePost::getIsTop)
                    .orderByDesc(CirclePost::getCreateTime);
        } else {
            wrapper.orderByDesc(CirclePost::getIsTop)
                    .orderByDesc(CirclePost::getSortWeight)
                    .orderByDesc(CirclePost::getCreateTime);
        }

        IPage<CirclePost> page = this.page(new Page<>(pageNum, pageSize), wrapper);

        return page.convert(post -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", post.getId());
            map.put("postType", post.getPostType());
            map.put("enterpriseName", post.getEnterpriseName());
            map.put("enterpriseLogo", post.getEnterpriseLogo());
            map.put("title", post.getTitle());
            map.put("content", post.getContent());
            map.put("images", post.getImages() != null ? JSONUtil.parseArray(post.getImages()) : List.of());
            map.put("videoUrl", post.getVideoUrl());
            map.put("videoCover", post.getVideoCover());
            map.put("tags", post.getTags());
            map.put("isTop", post.getIsTop());
            map.put("isHot", post.getIsHot());
            map.put("likeCount", post.getLikeCount());
            map.put("commentCount", post.getCommentCount());
            map.put("shareCount", post.getShareCount());
            map.put("isPromoted", "PROMOTED".equals(post.getPostType()));
            map.put("createTime", post.getCreateTime());

            if (userId != null) {
                map.put("isLiked", isLiked(post.getId(), userId));
                map.put("isFavorited", isFavorited(post.getId(), userId));
            }
            return map;
        });
    }

    @Override
    public Map<String, Object> getPostDetail(Long postId, Long userId) {
        CirclePost post = this.getById(postId);
        if (post == null) {
            throw new BizException(404, "动态不存在");
        }

        this.lambdaUpdate().eq(CirclePost::getId, postId).setSql("view_count = view_count + 1").update();

        Map<String, Object> result = new HashMap<>();
        result.put("post", post);
        result.put("images", post.getImages() != null ? JSONUtil.parseArray(post.getImages()) : List.of());
        if (userId != null) {
            result.put("isLiked", isLiked(postId, userId));
            result.put("isFavorited", isFavorited(postId, userId));
        }
        return result;
    }

    @Override
    public IPage<CirclePost> getEnterprisePosts(String enterpriseName, Long stationId,
                                                 int pageNum, int pageSize) {
        return this.lambdaQuery()
                .eq(CirclePost::getEnterpriseName, enterpriseName)
                .eq(stationId != null, CirclePost::getStationId, stationId)
                .eq(CirclePost::getStatus, 1)
                .eq(CirclePost::getAuditStatus, 1)
                .orderByDesc(CirclePost::getCreateTime)
                .page(new Page<>(pageNum, pageSize));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean toggleLike(Long postId, Long userId) {
        CircleLike existing = likeMapper.selectOne(
                new LambdaQueryWrapper<CircleLike>()
                        .eq(CircleLike::getPostId, postId)
                        .eq(CircleLike::getUserId, userId));
        if (existing != null) {
            likeMapper.deleteById(existing.getId());
            this.lambdaUpdate().eq(CirclePost::getId, postId).setSql("like_count = like_count - 1").update();
            return false;
        } else {
            CircleLike like = new CircleLike();
            like.setPostId(postId);
            like.setUserId(userId);
            like.setCreateTime(LocalDateTime.now());
            likeMapper.insert(like);
            this.lambdaUpdate().eq(CirclePost::getId, postId).setSql("like_count = like_count + 1").update();
            return true;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean toggleFavorite(Long postId, Long userId) {
        CircleFavorite existing = favoriteMapper.selectOne(
                new LambdaQueryWrapper<CircleFavorite>()
                        .eq(CircleFavorite::getPostId, postId)
                        .eq(CircleFavorite::getUserId, userId));
        if (existing != null) {
            favoriteMapper.deleteById(existing.getId());
            this.lambdaUpdate().eq(CirclePost::getId, postId).setSql("favorite_count = favorite_count - 1").update();
            return false;
        } else {
            CircleFavorite fav = new CircleFavorite();
            fav.setPostId(postId);
            fav.setUserId(userId);
            fav.setCreateTime(LocalDateTime.now());
            favoriteMapper.insert(fav);
            this.lambdaUpdate().eq(CirclePost::getId, postId).setSql("favorite_count = favorite_count + 1").update();
            return true;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long addComment(Long postId, Long userId, String nickname, String avatar,
                           String content, Long parentId) {
        CircleComment comment = new CircleComment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setUserNickname(nickname);
        comment.setUserAvatar(avatar);
        comment.setContent(content);
        comment.setParentId(parentId);
        comment.setLikeCount(0);
        comment.setIsEnterpriseReply(0);
        comment.setStatus(1);
        comment.setCreateTime(LocalDateTime.now());
        commentMapper.insert(comment);

        this.lambdaUpdate().eq(CirclePost::getId, postId).setSql("comment_count = comment_count + 1").update();
        return comment.getId();
    }

    @Override
    public IPage<CircleComment> getComments(Long postId, int pageNum, int pageSize) {
        return commentMapper.selectPage(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<CircleComment>()
                        .eq(CircleComment::getPostId, postId)
                        .eq(CircleComment::getStatus, 1)
                        .orderByDesc(CircleComment::getCreateTime));
    }

    @Override
    public Long createPost(CirclePost post) {
        post.setLikeCount(0);
        post.setCommentCount(0);
        post.setShareCount(0);
        post.setViewCount(0);
        post.setFavoriteCount(0);
        this.save(post);
        return post.getId();
    }

    @Override
    public IPage<CirclePost> pageAdmin(Map<String, Object> params) {
        int pageNum = MapUtil.getInt(params, "pageNum", 1);
        int pageSize = MapUtil.getInt(params, "pageSize", 10);

        LambdaQueryWrapper<CirclePost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(params.get("stationId") != null, CirclePost::getStationId, params.get("stationId"));
        wrapper.eq(params.get("postType") != null, CirclePost::getPostType, params.get("postType"));
        wrapper.eq(params.get("status") != null, CirclePost::getStatus, params.get("status"));
        wrapper.eq(params.get("categoryId") != null, CirclePost::getCategoryId, params.get("categoryId"));
        wrapper.orderByDesc(CirclePost::getCreateTime);

        return this.page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void audit(Long id, Integer auditStatus) {
        CirclePost post = new CirclePost();
        post.setId(id);
        post.setAuditStatus(auditStatus);
        this.updateById(post);
    }

    @Override
    public void toggleTop(Long id) {
        CirclePost post = this.getById(id);
        if (post != null) {
            post.setIsTop(post.getIsTop() == 1 ? 0 : 1);
            this.updateById(post);
        }
    }

    @Override
    public void toggleHot(Long id) {
        CirclePost post = this.getById(id);
        if (post != null) {
            post.setIsHot(post.getIsHot() == 1 ? 0 : 1);
            this.updateById(post);
        }
    }

    private boolean isLiked(Long postId, Long userId) {
        return likeMapper.selectCount(new LambdaQueryWrapper<CircleLike>()
                .eq(CircleLike::getPostId, postId)
                .eq(CircleLike::getUserId, userId)) > 0;
    }

    private boolean isFavorited(Long postId, Long userId) {
        return favoriteMapper.selectCount(new LambdaQueryWrapper<CircleFavorite>()
                .eq(CircleFavorite::getPostId, postId)
                .eq(CircleFavorite::getUserId, userId)) > 0;
    }
}
