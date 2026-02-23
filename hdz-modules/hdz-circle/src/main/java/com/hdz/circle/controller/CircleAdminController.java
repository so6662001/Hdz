package com.hdz.circle.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hdz.circle.entity.CircleCategory;
import com.hdz.circle.entity.CirclePost;
import com.hdz.circle.mapper.CircleCategoryMapper;
import com.hdz.circle.mapper.CircleCommentMapper;
import com.hdz.circle.service.CirclePostService;
import com.hdz.common.dto.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Api(tags = "后台-圈子管理")
@RestController
@RequestMapping("/api/admin/v1/circle")
@RequiredArgsConstructor
public class CircleAdminController {

    private final CirclePostService circlePostService;
    private final CircleCategoryMapper categoryMapper;
    private final CircleCommentMapper commentMapper;

    @ApiOperation("动态列表(后台分页)")
    @GetMapping("/post/page")
    public Result<IPage<CirclePost>> page(@RequestParam Map<String, Object> params) {
        return Result.ok(circlePostService.pageAdmin(params));
    }

    @ApiOperation("发布动态")
    @PostMapping("/post")
    public Result<Long> create(@RequestBody CirclePost post) {
        return Result.ok(circlePostService.createPost(post));
    }

    @ApiOperation("编辑动态")
    @PutMapping("/post/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody CirclePost post) {
        post.setId(id);
        circlePostService.updateById(post);
        return Result.ok();
    }

    @ApiOperation("删除动态")
    @DeleteMapping("/post/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        circlePostService.removeById(id);
        return Result.ok();
    }

    @ApiOperation("审核动态")
    @PutMapping("/post/{id}/audit")
    public Result<Void> audit(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        circlePostService.audit(id, body.get("auditStatus"));
        return Result.ok();
    }

    @ApiOperation("置顶/取消")
    @PutMapping("/post/{id}/top")
    public Result<Void> toggleTop(@PathVariable Long id) {
        circlePostService.toggleTop(id);
        return Result.ok();
    }

    @ApiOperation("热门/取消")
    @PutMapping("/post/{id}/hot")
    public Result<Void> toggleHot(@PathVariable Long id) {
        circlePostService.toggleHot(id);
        return Result.ok();
    }

    @ApiOperation("新增分类")
    @PostMapping("/category")
    public Result<Void> createCategory(@RequestBody CircleCategory category) {
        categoryMapper.insert(category);
        return Result.ok();
    }

    @ApiOperation("更新分类")
    @PutMapping("/category/{id}")
    public Result<Void> updateCategory(@PathVariable Long id, @RequestBody CircleCategory category) {
        category.setId(id);
        categoryMapper.updateById(category);
        return Result.ok();
    }

    @ApiOperation("删除违规评论")
    @DeleteMapping("/comment/{id}")
    public Result<Void> deleteComment(@PathVariable Long id) {
        commentMapper.deleteById(id);
        return Result.ok();
    }
}
