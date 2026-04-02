"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styled from "styled-components";
import dynamic from 'next/dynamic';
import RouteMapComponent from '../result/components/RouteMapComponent';
import { createTravelPlan, createDaySchedule, type TravelPlanRequest, type DayScheduleRequest, type ScheduleRequest } from '@/lib/api/travel';
import { saveLocations, type LocationSaveRequest } from '@/lib/api/location';
import { travelQueries } from '@/lib/queries/travelQueries';
import { useQueryClient } from '@tanstack/react-query';

// TypeScript 인터페이스 정의
interface Activity {
  id: string;
  title: string;
  details: string;
  type: "activity";
  color: string;
  number?: number;
  iconType?: "restaurant" | "hotel";
  dayIndex?: number; // 장소가 속한 날짜 인덱스
}

interface DayPlan {
  date: string;
  dayNumber: number;
  items: Activity[];
}

interface TravelData {
  title: string;
  dates: string;
  days: DayPlan[];
}

interface HoverIconProps {
  path: string;
  label: string;
  off: string;
  on: string;
  active?: boolean;
}

const TravelItineraryApp: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [travelData, setTravelData] = useState<TravelData>({
    title: "",
    dates: "",
    days: [],
  });
  const [allPlaces, setAllPlaces] = useState<Array<{
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  }>>([]);
  const [initialCityName, setInitialCityName] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [cityId, setCityId] = useState<number | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Array<{
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    rating?: number;
    reviewCount?: number;
    types?: string[] | null;
    photoReference?: string | null;
  }>>([]);
  const [travelTimes, setTravelTimes] = useState<Array<{
    date: string;
    startAm: boolean;
    startHour: number;
    startMin: number;
    endAm: boolean;
    endHour: number;
    endMin: number;
  }>>([]);

  // Google Places API types를 한국어로 변환하는 함수
  const getThemeFromTypes = (types?: string[] | null): string => {
    if (!types || types.length === 0) return "관광명소";
    
    const typePriorityMap: { [key: string]: string } = {
      restaurant: "음식점",
      food: "음식점",
      cafe: "카페",
      bar: "바",
      lodging: "숙박",
      hotel: "숙박",
      tourist_attraction: "관광명소",
      amusement_park: "테마파크",
      museum: "박물관",
      park: "공원",
      shopping_mall: "쇼핑몰",
      store: "상점",
      night_club: "나이트클럽",
    };
    
    for (const type of types) {
      if (typePriorityMap[type]) {
        return typePriorityMap[type];
      }
    }
    
    return types[0].replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "관광명소";
  };

  // localStorage/sessionStorage에서 데이터 읽어오기
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // 선택한 날짜 읽어오기
      const selectedDatesStr = localStorage.getItem('selectedTravelDates');
      const selectedPlacesStr = sessionStorage.getItem('selectedPlaces');
      
      if (!selectedDatesStr || !selectedPlacesStr) {
        console.warn('Missing travel data');
        return;
      }

      const selectedDates: string[] = JSON.parse(selectedDatesStr);
      const selectedPlaces: Array<{
        name: string;
        address: string;
        latitude?: number;
        longitude?: number;
        rating?: number;
        reviewCount?: number;
        types?: string[] | null;
        photoReference?: string | null;
      }> = JSON.parse(selectedPlacesStr);

      if (!selectedDates || selectedDates.length === 0 || !selectedPlaces || selectedPlaces.length === 0) {
        return;
      }

      // 날짜 정렬
      const sortedDates = selectedDates
        .map(dateStr => new Date(dateStr))
        .filter(date => !isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      if (sortedDates.length === 0) return;

      // 여행 제목 생성 (첫 번째 도시 이름 사용)
      const selectedCitiesStr = sessionStorage.getItem('selectedCities');
      let title = "여행";
      if (selectedCitiesStr) {
        try {
          const cities = JSON.parse(selectedCitiesStr);
          if (cities && cities.length > 0) {
            title = `${cities[0].name} 여행`;
            setInitialCityName(cities[0].name);
            setCityId(cities[0].cityId);
          }
        } catch (e) {
          console.error('Failed to parse selected cities', e);
        }
      }

      // travelTimes 읽어오기
      const travelTimesStr = localStorage.getItem('selectedTravelTimes');
      if (travelTimesStr) {
        try {
          const times = JSON.parse(travelTimesStr);
          setTravelTimes(times);
        } catch (e) {
          console.error('Failed to parse travel times', e);
        }
      }

      // state에 저장
      setSelectedDates(sortedDates);
      setSelectedPlaces(selectedPlaces);

      // 지도에 표시할 모든 장소 저장
      setAllPlaces(selectedPlaces.map(place => ({
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
      })));

      // 날짜 범위 문자열 생성
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}. ${month}. ${day}`;
      };
      const datesStr = sortedDates.length === 1 
        ? formatDate(startDate)
        : `${formatDate(startDate)}-${formatDate(endDate).split('. ').slice(1).join('. ')}`;

      // 장소들을 날짜별로 균등 분배
      const placesPerDay = Math.ceil(selectedPlaces.length / sortedDates.length);
      const days: DayPlan[] = sortedDates.map((date, dayIndex) => {
        const startIdx = dayIndex * placesPerDay;
        const endIdx = Math.min(startIdx + placesPerDay, selectedPlaces.length);
        const dayPlaces = selectedPlaces.slice(startIdx, endIdx);

        // 날짜 포맷팅
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekday = days[date.getDay()];
        const dateStr = `${month}. ${day}${weekday}`;

        // 장소들을 Activity로 변환
        const items: Activity[] = dayPlaces.map((place, placeIndex) => {
          const theme = getThemeFromTypes(place.types);
          const isRestaurant = place.types?.some(t => t === 'restaurant' || t === 'food' || t === 'cafe');
          const isHotel = place.types?.some(t => t === 'lodging' || t === 'hotel');

          return {
            id: `day-${dayIndex}-place-${placeIndex}`,
            title: place.name,
            details: theme,
            type: "activity",
            color: "#3CA6FF",
            number: placeIndex + 1,
            iconType: isRestaurant ? "restaurant" : isHotel ? "hotel" : undefined,
            dayIndex: dayIndex,
          };
        });

        return {
          date: dateStr,
          dayNumber: dayIndex + 1,
          items: items,
        };
      });

      setTravelData({
        title: title,
        dates: datesStr,
        days: days,
      });
    } catch (e) {
      console.error('Failed to parse travel data', e);
    }
  }, []);


  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    // 모든 내용 삭제 후 이전 페이지로 이동
    router.back();
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleComplete = () => {
    setIsEditMode(false);
    setSelectedItems([]);
    
    // 수정된 데이터를 sessionStorage에 저장 (필요한 경우)
    // 현재는 state에만 저장하고 있지만, 필요시 여기서 저장할 수 있습니다
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    
    setTravelData(prev => ({
      ...prev,
      days: prev.days.map(day => ({
        ...day,
        items: day.items.filter(item => !selectedItems.includes(item.id))
      }))
    }));
    setSelectedItems([]);
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
    (e.currentTarget as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDayIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedItemId = e.dataTransfer.getData("text/plain");
    
    if (!draggedItemId) return;
    
    // 소스 날짜 찾기
    const sourceDayIndex = travelData.days.findIndex(day => 
      day.items.some(item => item.id === draggedItemId)
    );
    
    if (sourceDayIndex === -1) return;

    // 같은 날짜 내에서는 순서만 변경 (현재는 무시)
    if (sourceDayIndex === targetDayIndex) {
      return;
    }

    // 다른 날짜로 이동
    setTravelData(prev => {
      const newData = { ...prev };
      const sourceDay = newData.days[sourceDayIndex];
      const targetDay = newData.days[targetDayIndex];
      
      // 드래그된 아이템 찾기
      const draggedItem = sourceDay.items.find(item => item.id === draggedItemId);
      if (!draggedItem) return prev;
      
      // 소스에서 제거
      sourceDay.items = sourceDay.items.filter(item => item.id !== draggedItemId);
      
      // 타겟에 추가하고 dayIndex 업데이트
      const updatedItem = { ...draggedItem, dayIndex: targetDayIndex };
      targetDay.items.push(updatedItem);
      
      // 타겟 날짜의 모든 아이템에 number 재할당
      targetDay.items.forEach((item, index) => {
        item.number = index + 1;
      });
      
      // 소스 날짜의 모든 아이템에 number 재할당
      sourceDay.items.forEach((item, index) => {
        item.number = index + 1;
      });
      
      return newData;
    });
  };

  const handleRegisterSchedule = async () => {
    if (!cityId || selectedDates.length === 0 || travelData.days.length === 0) {
      alert('여행 정보가 불완전합니다. 다시 확인해주세요.');
      return;
    }

    setIsRegistering(true);

    try {
      // 1. 여행 계획 생성
      const startDate = selectedDates[0];
      const endDate = selectedDates[selectedDates.length - 1];
      
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const travelPlanRequest: TravelPlanRequest = {
        cityId: cityId,
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
      };

      const travelPlanResponse = await createTravelPlan(travelPlanRequest);
      const travelPlanId = travelPlanResponse.travelPlanId;

      // 2. 모든 장소를 Location으로 저장 (중복 제거)
      const uniquePlaceNames = new Set<string>();
      const locationRequests: LocationSaveRequest[] = [];
      
      // travelData.days에서 실제 사용되는 모든 장소 수집
      for (const day of travelData.days) {
        for (const item of day.items) {
          if (!uniquePlaceNames.has(item.title)) {
            uniquePlaceNames.add(item.title);
            // selectedPlaces에서 해당 장소 찾기
            const place = selectedPlaces.find(p => p.name === item.title);
            if (place) {
              // PlaceCategory 결정 (types 기반)
              let category: 'DEFAULT' | 'CAFE' | 'RESTAURANT' | 'ATTRACTION' = 'DEFAULT';
              if (place.types) {
                if (place.types.some(t => t === 'restaurant' || t === 'food')) {
                  category = 'RESTAURANT';
                } else if (place.types.some(t => t === 'cafe')) {
                  category = 'CAFE';
                } else if (place.types.some(t => t === 'tourist_attraction' || t === 'amusement_park' || t === 'museum' || t === 'park')) {
                  category = 'ATTRACTION';
                }
              }

              locationRequests.push({
                name: place.name,
                latitude: place.latitude || 0,
                longitude: place.longitude || 0,
                address: place.address || '',
                category: category,
              });
            }
          }
        }
      }

      if (locationRequests.length > 0) {
        await saveLocations(locationRequests);
      }

      // 3. 각 날짜별로 일정 생성
      const createdDaySchedules: number[] = [];
      try {
        for (let dayIndex = 0; dayIndex < travelData.days.length; dayIndex++) {
          const day = travelData.days[dayIndex];
          if (day.items.length === 0) continue;

          const dayDate = selectedDates[dayIndex];
          const dayTime = travelTimes[dayIndex] || travelTimes[0] || {
            startAm: true,
            startHour: 9,
            startMin: 0,
            endAm: false,
            endHour: 6,
            endMin: 0,
          };

          // 시간 변환 (12시간 -> 24시간)
          const startHour24 = dayTime.startAm 
            ? (dayTime.startHour === 12 ? 0 : dayTime.startHour)
            : (dayTime.startHour === 12 ? 12 : dayTime.startHour + 12);
          const endHour24 = dayTime.endAm
            ? (dayTime.endHour === 12 ? 0 : dayTime.endHour)
            : (dayTime.endHour === 12 ? 12 : dayTime.endHour + 12);

          const startTime = `${String(startHour24).padStart(2, '0')}:${String(dayTime.startMin).padStart(2, '0')}:00`;
          const finishTime = `${String(endHour24).padStart(2, '0')}:${String(dayTime.endMin).padStart(2, '0')}:00`;

          // 장소들을 ScheduleRequest로 변환
          const schedules: ScheduleRequest[] = day.items.map((item, index) => {
            // PreferTime 결정 (시간대별) - 백엔드 enum 형식에 맞춤: Morning, Afternoon, Evening, Random
            let preferTime: 'Morning' | 'Afternoon' | 'Evening' | 'Random' = 'Afternoon';
            const totalMinutes = (endHour24 * 60 + dayTime.endMin) - (startHour24 * 60 + dayTime.startMin);
            const placeMinutes = Math.floor(totalMinutes / day.items.length) * index;
            const visitHour = Math.floor((startHour24 * 60 + dayTime.startMin + placeMinutes) / 60) % 24;
            
            if (visitHour >= 5 && visitHour < 12) {
              preferTime = 'Morning';
            } else if (visitHour >= 12 && visitHour < 17) {
              preferTime = 'Afternoon';
            } else if (visitHour >= 17 && visitHour < 22) {
              preferTime = 'Evening';
            } else {
              // NIGHT는 백엔드에 없으므로 Evening으로 처리
              preferTime = 'Evening';
            }

            return {
              locationName: item.title,
              scheduleOrder: index + 1,
              preferTime: preferTime,
              memo: item.details,
              stayTime: 'PT1H', // 기본 1시간
            };
          });

          const dayScheduleRequest: DayScheduleRequest = {
            date: formatDateForAPI(dayDate),
            startTime: startTime,
            finishTime: finishTime,
            dayScheduleMemo: `Day ${day.dayNumber}`,
            schedules: schedules,
          };

          console.log(`Creating day schedule for Day ${day.dayNumber}:`, dayScheduleRequest);
          await createDaySchedule(travelPlanId, dayScheduleRequest);
          createdDaySchedules.push(dayIndex);
        }

        // 4. 여행 목록 새로고침
        queryClient.invalidateQueries({ queryKey: travelQueries.plans().queryKey });

        // 5. 성공 메시지 및 페이지 이동
        alert('여행 일정이 등록되었습니다!');
        router.push('/my-trips');
      } catch (scheduleError: any) {
        // 일정 생성 실패 시 상세 에러 로그
        console.error('Failed to create day schedule:', scheduleError);
        console.error('Request data:', scheduleError.config?.data);
        console.error('Response:', scheduleError.response?.data);
        
        const errorMessage = scheduleError.response?.data?.message || scheduleError.message || '알 수 없는 오류';
        const errorDetails = scheduleError.response?.data || {};
        
        alert(`일정 생성에 실패했습니다.\n\n에러: ${errorMessage}\n\n여행 계획은 생성되었지만 일정이 저장되지 않았습니다. 다시 시도해주세요.`);
        
        // 여행 목록은 새로고침 (부분 성공 상태)
        queryClient.invalidateQueries({ queryKey: travelQueries.plans().queryKey });
        throw scheduleError; // 상위 catch로 전달
      }
    } catch (error: any) {
      console.error('Failed to register travel plan:', error);
      const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류';
      alert(`여행 일정 등록에 실패했습니다: ${errorMessage}`);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <Title>{travelData.title}</Title>
        {isEditMode ? (
          <CancelButton onClick={handleComplete}>완료</CancelButton>
        ) : (
          <CancelButton onClick={handleCancel}>취소</CancelButton>
        )}
      </Header>

      <DateText>{travelData.dates}</DateText>

      <MapContainer>
        <RouteMapComponent
          places={allPlaces}
          selectedPlaceIndex={null}
          initialCityName={initialCityName}
        />
        <ArrowContainer>
          <ArrowUp />
        </ArrowContainer>
      </MapContainer>

      {/* Content */}
      <Content>
        {travelData.days.map((day, dayIndex) => (
          <DaySection 
            key={day.dayNumber}
            onDragOver={isEditMode ? handleDragOver : undefined}
            onDrop={isEditMode ? (e) => handleDrop(e, dayIndex) : undefined}
            $isEditMode={isEditMode}
          >
            <DayTitle>
              Day {day.dayNumber} {day.date}
            </DayTitle>
            
            {day.items.length === 0 ? (
              <EmptyDayMessage>이 날짜에는 장소가 없습니다</EmptyDayMessage>
            ) : (
              day.items.map((item) => (
                <ActivityItem 
                  key={item.id}
                  draggable={isEditMode}
                  onDragStart={isEditMode ? (e) => handleDragStart(e, item.id) : undefined}
                  onDragEnd={isEditMode ? handleDragEnd : undefined}
                >
                  {isEditMode ? (
                    <RadioButton
                      type="radio"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  ) : (
                    <ActivityIcon color={item.color}>
                      {item.number ? (
                        <NumberIcon>{item.number}</NumberIcon>
                      ) : item.iconType === "restaurant" ? (
                        <IconWrapper>
                          <Image src="/icons/res-icon.png" alt="restaurant" width={24} height={24} />
                        </IconWrapper>
                      ) : item.iconType === "hotel" ? (
                        <IconWrapper>
                          <Image src="/icons/hotel-icon.png" alt="hotel" width={24} height={24} />
                        </IconWrapper>
                      ) : null}
                    </ActivityIcon>
                  )}
                  <ActivityContent>
                    <ActivityTitle>{item.title}</ActivityTitle>
                    <ActivityDetails>{item.details}</ActivityDetails>
                  </ActivityContent>
                  {isEditMode && (
                    <DragHandle>
                      <DragLine />
                      <DragLine />
                      <DragLine />
                    </DragHandle>
                  )}
                </ActivityItem>
              ))
            )}
          </DaySection>
        ))}
      </Content>

      {/* Action Buttons */}
      <ActionButtons>
        {isEditMode ? (
          <>
            <EditButton 
              onClick={handleDeleteSelected}
              disabled={selectedItems.length === 0}
            >
              선택 삭제
            </EditButton>
            <RegisterButton onClick={handleComplete}>완료</RegisterButton>
          </>
        ) : (
          <>
            <EditButton onClick={handleEdit}>수정하기</EditButton>
            <RegisterButton onClick={handleRegisterSchedule} disabled={isRegistering}>
              {isRegistering ? '등록 중...' : '일정 등록하기'}
            </RegisterButton>
          </>
        )}
      </ActionButtons>

      {/* Footer Navigation */}
      <Footer>
        <HoverIconButton path="/" label="홈" off="/icons/home-off.png" on="/icons/home-on.png" />
        <HoverIconButton path="/my-trips" label="내 여행" off="/icons/trip-off.png" on="/icons/trip-on.png" active />
        <HoverIconButton path="/my-trips/map" label="지도" off="/icons/map-off.png" on="/icons/map-on.png" />
        <HoverIconButton path="/account" label="가계부" off="/icons/money-off.png" on="/icons/money-on.png" />
        <HoverIconButton path="/my" label="MY" off="/icons/my-off.png" on="/icons/my-on.png" />
      </Footer>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalIcon>ℹ</ModalIcon>
            <ModalTitle>모든 내용을 삭제할까요?</ModalTitle>
            <ModalMessage>
              등록한 모든 내용이 삭제돼요. 바꾸고 싶은 일정이 있다면, 수정 후 일정으로 등록해주세요.
            </ModalMessage>
            <ModalButton onClick={handleConfirmCancel}>
              확인
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

// 하단바 컴포넌트
const IconButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: ${({ $active }) => ($active ? '#1C1C1C' : '#A0A0A0')};
  font-weight: ${({ $active }) => ($active ? '700' : '400')};
  transition: all 0.2s ease-in-out;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: #1C1C1C;
    font-weight: 600;
  }

  img {
    margin-bottom: 0.25rem;
  }
`;

function HoverIconButton({ path, label, off, on, active = false }: HoverIconProps) {
  const router = useRouter();
  const [hover, setHover] = useState(false);

      return (
    <IconButton
      onClick={() => router.push(path)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      $active={active}
    >
      <Image src={hover || active ? on : off} alt={label} width={20} height={20} />
      <span>{label}</span>
    </IconButton>
  );
}

// 스타일드 컴포넌트들
const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px;
`;

const Header = styled.header`
  background: #fff;
  padding: 20px 20px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0;
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: #ff3b30;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
`;

const DateText = styled.div`
  background: #fff;
  padding: 0 20px 5px;
  font-size: 12px;
  font-weight: 700;
  color: #777777;
`;

const MapContainer = styled.div`
  height: 200px;
  margin: 0 20px 20px 20px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  background: #e5e5e5;
`;

const ArrowContainer = styled.div`
  position: absolute;
  bottom: -20px;   // 지도 박스 밖으로 살짝 나오게
  left: 50%;
  transform: translateX(-50%);
`;

const ArrowUp = styled.div`
  width: 24px;      // 전체 너비 넓힘
  height: 12px;     // 높이 줄여서 교차점이 아래쪽에 붙도록
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 15px;    // 선 길이
    height: 2px;    // 선 두께
    background: #EAEAEA;
    border-radius: 2px;
    bottom: 0;      // 교차점을 맨 아래쪽에 위치시킴
  }

  &::before {
    left: 0;
    transform: rotate(-35deg);
    transform-origin: left bottom;
  }

  &::after {
    right: 0;
    transform: rotate(35deg);
    transform-origin: right bottom;
  }
`;



const Content = styled.div`
  flex: 1;
  padding: 0 20px;
`;

const DaySection = styled.div<{ $isEditMode?: boolean }>`
  margin-bottom: 30px;
  min-height: ${({ $isEditMode }) => $isEditMode ? '100px' : 'auto'};
  padding: ${({ $isEditMode }) => $isEditMode ? '10px' : '0'};
  border-radius: ${({ $isEditMode }) => $isEditMode ? '8px' : '0'};
  background: ${({ $isEditMode }) => $isEditMode ? '#f9f9f9' : 'transparent'};
  transition: background 0.2s ease;
  
  ${({ $isEditMode }) => $isEditMode && `
    &:hover {
      background: #f0f0f0;
    }
  `}
`;

const EmptyDayMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

const DayTitle = styled.h2`
  font-size: 12px;
  font-weight: 700;
  color: #777777;
  margin: 0 0 15px 0;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const ActivityIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
`;

const NumberIcon = styled.div`
  color: #3CA6FF;
  font-weight: bold;
  font-size: 16px;
  background: white;
  border: 2px solid #3CA6FF;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 아이콘 컴포넌트들
const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1c1c1c;
  margin-bottom: 4px;
`;

const ActivityDetails = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #777777;
`;

const ActionButtons = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EditButton = styled.button<{ disabled?: boolean }>`
  background: white;
  border: 1px solid #e5e5e5;
  color: ${({ disabled }) => disabled ? '#ccc' : '#1c1c1c'};
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;

const RegisterButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) => disabled ? '#ccc' : '#3CA6FF'};
  border: none;
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
`;


const RadioButton = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 15px;
  flex-shrink: 0;
`;

const DragHandle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: grab;
  margin-left: auto;
`;

const DragLine = styled.div`
  width: 16px;
  height: 2px;
  background: #ccc;
  border-radius: 1px;
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 4rem;
  font-size: 0.75rem;
  z-index: 20;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
`;

// Modal 스타일드 컴포넌트들
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 320px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const ModalIcon = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid #1C1C1C;
  border-radius: 50%;
  background: #FFFFFF;
  color: #1C1C1C;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  margin: 0 auto 16px;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1c1c1c;
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const ModalMessage = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const ModalButton = styled.button`
  background: #3CA6FF;
  border: none;
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s ease;

  &:hover {
    background: #2A8FE6;
  }
`;

export default TravelItineraryApp;
