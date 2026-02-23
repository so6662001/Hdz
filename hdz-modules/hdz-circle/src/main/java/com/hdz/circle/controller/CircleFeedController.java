package com.hdz.circle.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hdz.circle.entity.CircleCategory;
import com.hdz.circle.entity.CircleComment;
import com.hdz.circle.entity.CirclePost;
import com.hdz.circle.mapper.CircleCategoryMapper;
import com.hdz.circle.service.CirclePostService;
import com.hdz.common.dto.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Api(tags = "C端-圈子")
@RestController
@RequestMapping("/api/v1/circle")
@RequiredArgsConstructor
public class CircleFeedController {

    private final CirclePostService circlePostService;
    private final CircleCategoryMapper categoryMapper;

    @ApiOperation("圈子Feed流")
    @GetMapping("/feed")
    public Result<IPage<Map<String, Object>>> feed(
            @RequestParam String stationCode,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "recommend") String sortBy,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.ok(circlePostService.getFeed(stationCode, categoryId, sortBy, userId, pageNum, pageSize));
    }

    @ApiOperation("动态详情")
    @GetMapping("/post/{id}")
    public Result<Map<String, Object>> postDetail(@PathVariable Long id,
                                                   @RequestParam(required = false) Long userId) {
        return Result.ok(circlePostService.getPostDetail(id, userId));
    }

    @ApiOperation("企业主页动态列表")
    @GetMapping("/enterprise/{enterpriseName}/posts")
    public Result<IPage<CirclePost>> enterprisePosts(
            @PathVariable String enterpriseName,
            @RequestParam(required = false) Long stationId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.ok(circlePostService.getEnterprisePosts(enterpriseName, stationId, pageNum, pageSize));
    }

    @ApiOperation("点赞/取消")
    @PostMapping("/post/{id}/like")
    public Result<Map<String, Boolean>> like(@PathVariable Long id, @RequestParam Long userId) {
        boolean liked = circlePostService.toggleLike(id, userId);
        return Result.ok(Map.of("liked", liked));
    }

    @ApiOperation("收藏/取消")
    @PostMapping("/post/{id}/favorite")
    public Result<Map<String, Boolean>> favorite(@PathVariable Long id, @RequestParam Long userId) {
        boolean favorited = circlePostService.toggleFavorite(id, userId);
        return Result.ok(Map.of("favorited", favorited));
    }

    @ApiOperation("发表评论")
    @PostMapping("/post/{id}/comment")
    public Result<Map<String, Long>> comment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long userId = Long.parseLong(body.get("userId").toString());
        String nickname = (String) body.getOrDefault("nickname", "用户");
        String avatar = (String) body.get("avatar");
        String content = (String) body.get("content");
        Long parentId = body.get("parentId") != null ? Long.parseLong(body.get("parentId").toString()) : null;

        Long commentId = circlePostService.addComment(id, userId, nickname, avatar, content, parentId);
        return Result.ok(Map.of("commentId", commentId));
    }

    @ApiOperation("评论列表")
    @GetMapping("/post/{id}/comments")
    public Result<IPage<CircleComment>> comments(@PathVariable Long id,
                                                  @RequestParam(defaultValue = "1") int pageNum,
                                                  @RequestParam(defaultValue = "10") int pageSize) {
        return Result.ok(circlePostService.getComments(id, pageNum, pageSize));
    }

    @ApiOperation("分类列表")
    @GetMapping("/categories")
    public Result<List<CircleCategory>> categories() {
        return Result.ok(categoryMapper.selectList(
                new LambdaQueryWrapper<CircleCategory>()
                        .eq(CircleCategory::getStatus, 1)
                        .orderByAsc(CircleCategory::getSortOrder)));
    }
}
