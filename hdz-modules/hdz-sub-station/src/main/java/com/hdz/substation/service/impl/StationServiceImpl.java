package com.hdz.substation.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hdz.common.exception.BizException;
import com.hdz.substation.dto.StationCreateDTO;
import com.hdz.substation.dto.StationQueryDTO;
import com.hdz.substation.entity.SubStation;
import com.hdz.substation.entity.SubStationCity;
import com.hdz.substation.mapper.SubStationCityMapper;
import com.hdz.substation.mapper.SubStationMapper;
import com.hdz.substation.service.StationService;
import com.hdz.substation.vo.StationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationServiceImpl extends ServiceImpl<SubStationMapper, SubStation> implements StationService {

    private final SubStationCityMapper cityMapper;

    @Override
    public IPage<StationVO> pageStations(StationQueryDTO query) {
        LambdaQueryWrapper<SubStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(query.getStationName() != null, SubStation::getStationName, query.getStationName());
        wrapper.eq(query.getStatus() != null, SubStation::getStatus, query.getStatus());
        wrapper.orderByAsc(SubStation::getSortOrder);

        IPage<SubStation> page = this.page(new Page<>(query.getPageNum(), query.getPageSize()), wrapper);

        return page.convert(station -> {
            StationVO vo = toVO(station);
            vo.setCities(getCities(station.getId()));
            return vo;
        });
    }

    @Override
    public StationVO getStationDetail(Long id) {
        SubStation station = this.getById(id);
        if (station == null) {
            throw new BizException(404, "分站不存在");
        }
        StationVO vo = toVO(station);
        vo.setCities(getCities(id));
        return vo;
    }

    @Override
    public StationVO getStationByCode(String stationCode) {
        SubStation station = this.lambdaQuery()
                .eq(SubStation::getStationCode, stationCode)
                .eq(SubStation::getStatus, 1)
                .one();
        if (station == null) {
            throw new BizException(404, "分站不存在或未启用");
        }
        StationVO vo = toVO(station);
        vo.setCities(getCities(station.getId()));
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createStation(StationCreateDTO dto) {
        long count = this.lambdaQuery().eq(SubStation::getStationCode, dto.getStationCode()).count();
        if (count > 0) {
            throw new BizException("分站编码已存在");
        }

        SubStation station = new SubStation();
        BeanUtil.copyProperties(dto, station);
        this.save(station);

        if (CollUtil.isNotEmpty(dto.getCityCodeList())) {
            saveCities(station.getId(), dto.getCityCodeList());
        }

        return station.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStation(Long id, StationCreateDTO dto) {
        SubStation station = this.getById(id);
        if (station == null) {
            throw new BizException(404, "分站不存在");
        }

        SubStation existByCode = this.lambdaQuery()
                .eq(SubStation::getStationCode, dto.getStationCode())
                .ne(SubStation::getId, id)
                .one();
        if (existByCode != null) {
            throw new BizException("分站编码已被占用");
        }

        BeanUtil.copyProperties(dto, station, "id");
        this.updateById(station);

        if (dto.getCityCodeList() != null) {
            updateCities(id, dto.getCityCodeList());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteStation(Long id) {
        SubStation station = this.getById(id);
        if (station == null) {
            throw new BizException(404, "分站不存在");
        }
        this.removeById(id);
        cityMapper.delete(new LambdaQueryWrapper<SubStationCity>()
                .eq(SubStationCity::getStationId, id));
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        SubStation station = new SubStation();
        station.setId(id);
        station.setStatus(status);
        this.updateById(station);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCities(Long id, List<String> cityCodeList) {
        cityMapper.delete(new LambdaQueryWrapper<SubStationCity>()
                .eq(SubStationCity::getStationId, id));
        if (CollUtil.isNotEmpty(cityCodeList)) {
            saveCities(id, cityCodeList);
        }
    }

    @Override
    public List<StationVO> listEnabledStations() {
        List<SubStation> stations = this.lambdaQuery()
                .eq(SubStation::getStatus, 1)
                .orderByAsc(SubStation::getSortOrder)
                .list();
        return stations.stream().map(s -> {
            StationVO vo = toVO(s);
            vo.setCities(getCities(s.getId()));
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public String getStationCodeByCity(String cityCode) {
        SubStationCity city = cityMapper.selectOne(
                new LambdaQueryWrapper<SubStationCity>().eq(SubStationCity::getCityCode, cityCode));
        if (city == null) {
            return null;
        }
        SubStation station = this.getById(city.getStationId());
        return station != null ? station.getStationCode() : null;
    }

    private void saveCities(Long stationId, List<String> cityCodeList) {
        for (String cityCode : cityCodeList) {
            SubStationCity existing = cityMapper.selectOne(
                    new LambdaQueryWrapper<SubStationCity>().eq(SubStationCity::getCityCode, cityCode));
            if (existing != null) {
                throw new BizException("城市 " + cityCode + " 已绑定其他分站");
            }
            SubStationCity city = new SubStationCity();
            city.setStationId(stationId);
            city.setCityCode(cityCode);
            city.setCityName(cityCode);
            city.setCreateTime(LocalDateTime.now());
            cityMapper.insert(city);
        }
    }

    private List<StationVO.CityVO> getCities(Long stationId) {
        List<SubStationCity> cities = cityMapper.selectList(
                new LambdaQueryWrapper<SubStationCity>().eq(SubStationCity::getStationId, stationId));
        if (CollUtil.isEmpty(cities)) {
            return Collections.emptyList();
        }
        return cities.stream().map(c -> {
            StationVO.CityVO vo = new StationVO.CityVO();
            vo.setCityCode(c.getCityCode());
            vo.setCityName(c.getCityName());
            return vo;
        }).collect(Collectors.toList());
    }

    private StationVO toVO(SubStation station) {
        StationVO vo = new StationVO();
        BeanUtil.copyProperties(station, vo);
        return vo;
    }
}
