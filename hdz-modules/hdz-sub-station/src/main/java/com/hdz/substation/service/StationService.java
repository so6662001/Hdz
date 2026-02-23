package com.hdz.substation.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.hdz.substation.dto.StationCreateDTO;
import com.hdz.substation.dto.StationQueryDTO;
import com.hdz.substation.entity.SubStation;
import com.hdz.substation.vo.StationVO;

import java.util.List;

public interface StationService extends IService<SubStation> {

    IPage<StationVO> pageStations(StationQueryDTO query);

    StationVO getStationDetail(Long id);

    StationVO getStationByCode(String stationCode);

    Long createStation(StationCreateDTO dto);

    void updateStation(Long id, StationCreateDTO dto);

    void deleteStation(Long id);

    void updateStatus(Long id, Integer status);

    void updateCities(Long id, List<String> cityCodeList);

    List<StationVO> listEnabledStations();

    String getStationCodeByCity(String cityCode);
}
