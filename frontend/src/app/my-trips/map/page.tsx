'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import LocationSearchInput from './components/LocationSearchInput';
import { getLocations, LocationResponse, searchPlaces } from '@/lib/api/location';
import { getTravelPlan } from '@/lib/api/travel';

// 구글 맵을 클라이언트 사이드에서만 로드 (SSR 방지)
const GoogleMapComponent = dynamic(
  () => import('./components/GoogleMapComponent'),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }}>지도 로딩 중...</div> }
);

// RouteMapComponent도 dynamic import로 로드 (SSR 방지 및 API 로딩 대기)
const RouteMapComponent = dynamic(
  () => import('@/app/optimize/result/components/RouteMapComponent'),
  { 
    ssr: false, 
    loading: () => (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <p style={{ color: '#666', fontSize: '16px' }}>지도를 불러오는 중...</p>
      </div>
    )
  }
);

export default function Page() {
  const router = useRouter();
  const [selectedPlaces, setSelectedPlaces] = useState<
    { name: string; address: string; latitude: number; longitude: number; image?: string; rating?: number; reviewCount?: number; types?: string[] | null; photoReference?: string | null }[]
  >([]);
  const [currentPin, setCurrentPin] = useState<{ name: string; address: string; latitude: number; longitude: number; rating?: number; reviewCount?: number; types?: string[] | null; photoReference?: string | null } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [initialCity, setInitialCity] = useState<string | null>(null);
  const [cityCenter, setCityCenter] = useState<{ lat: number; lng: number } | null>(null);
  
  // 경로 뷰어 모드 관련 상태
  const [isRouteViewerMode, setIsRouteViewerMode] = useState(false);
  const [routePlaces, setRoutePlaces] = useState<Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    theme?: string;
    distance?: string;
    time?: string;
    rating?: number;
    reviewCount?: number;
    types?: string[];
    phoneNumber?: string;
  }>>([]);
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState<number>(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  // Day 네비게이션 (optimize/result 스타일)
  const [placesByDay, setPlacesByDay] = useState<Array<Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    theme?: string;
    distance?: string;
    time?: string;
    rating?: number;
    reviewCount?: number;
    types?: string[];
    phoneNumber?: string;
  }>>>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [totalDays, setTotalDays] = useState(1);
  const [startDate, setStartDate] = useState<Date>(new Date());

  // 경로 뷰어 모드 체크 및 데이터 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentTravelPlanId = sessionStorage.getItem('currentTravelPlanId');
      
      if (currentTravelPlanId) {
        // 경로 뷰어 모드 활성화
        setIsRouteViewerMode(true);
        setIsLoadingRoute(true);
        
        // 여행 계획 상세 정보와 locations를 병렬로 가져오기
        Promise.all([
          getTravelPlan(Number(currentTravelPlanId)),
          getLocations(Number(currentTravelPlanId))
        ])
          .then(([travelPlan, allLocations]) => {
            // locations를 name으로 매핑 (빠른 조회를 위해)
            const locationMap = new Map<string, LocationResponse>();
            allLocations.forEach(loc => {
              locationMap.set(loc.place, loc);
            });
            
            // Google Places API types를 한국어로 변환
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
              
              return types[0]?.replace(/_/g, ' ') || "관광명소";
            };
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // daySchedules가 있으면 날짜별로 placesByDay 구성
            if (travelPlan.daySchedules && Array.isArray(travelPlan.daySchedules) && travelPlan.daySchedules.length > 0) {
              const sortedDaySchedules = [...travelPlan.daySchedules].sort((a: any, b: any) => {
                const da = new Date(a.date);
                const db = new Date(b.date);
                return da.getTime() - db.getTime();
              });

              const allDaysPlaces: typeof routePlaces[] = [];

              sortedDaySchedules.forEach((daySchedule: any) => {
                if (!daySchedule.schedules || !Array.isArray(daySchedule.schedules)) {
                  allDaysPlaces.push([]);
                  return;
                }
                const sortedSchedules = [...daySchedule.schedules].sort((a: any, b: any) => (a.scheduleOrder || 0) - (b.scheduleOrder || 0));
                const places: typeof routePlaces = [];

                sortedSchedules.forEach((schedule: any, index: number) => {
                  let location: any = null;
                  if (schedule.location && schedule.location.latitude != null && schedule.location.longitude != null) {
                    location = schedule.location;
                  } else if (schedule.locationName) {
                    location = locationMap.get(schedule.locationName);
                  }
                  if (!location) return;

                  let distanceStr = "0m";
                  if (index > 0 && places[index - 1]) {
                    const prevPlace = places[index - 1];
                    const R = 6371;
                    const dLat = (location.latitude - prevPlace.latitude) * Math.PI / 180;
                    const dLon = (location.longitude - prevPlace.longitude) * Math.PI / 180;
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(prevPlace.latitude * Math.PI / 180) * Math.cos(location.latitude * Math.PI / 180) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distanceKm = R * c;
                    distanceStr = distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`;
                  }

                  let timeStr = "10:00";
                  if (daySchedule.startTime && daySchedule.finishTime) {
                    const startTime = new Date(`2000-01-01T${daySchedule.startTime}`);
                    const finishTime = new Date(`2000-01-01T${daySchedule.finishTime}`);
                    const totalMinutes = (finishTime.getTime() - startTime.getTime()) / (1000 * 60);
                    const placeMinutes = Math.floor(totalMinutes / Math.max(sortedSchedules.length, 1)) * index;
                    const visitMinutes = startTime.getMinutes() + placeMinutes;
                    const visitHour = Math.floor(visitMinutes / 60) % 24;
                    const visitMin = visitMinutes % 60;
                    const hour12 = visitHour > 12 ? visitHour - 12 : (visitHour === 0 ? 12 : visitHour);
                    const amPm = visitHour >= 12 ? 'PM' : 'AM';
                    timeStr = `${hour12}:${String(visitMin).padStart(2, '0')} ${amPm}`;
                  }

                  places.push({
                    name: location.name || location.place || schedule.locationName || '',
                    address: location.address || '',
                    latitude: location.latitude,
                    longitude: location.longitude,
                    theme: getThemeFromTypes(location.types || schedule.location?.types),
                    distance: distanceStr,
                    time: timeStr,
                    rating: location.rating ?? schedule.location?.rating,
                    reviewCount: location.reviewCount ?? schedule.location?.reviewCount,
                    types: location.types ?? schedule.location?.types,
                    phoneNumber: location.phoneNumber ?? schedule.location?.phoneNumber,
                  });
                });

                allDaysPlaces.push(places);
              });

              const firstDayDate = sortedDaySchedules[0]?.date ? new Date(sortedDaySchedules[0].date) : today;
              firstDayDate.setHours(0, 0, 0, 0);
              let todayIndex = sortedDaySchedules.findIndex((ds: any) => {
                const d = new Date(ds.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
              });
              if (todayIndex < 0) todayIndex = 0;

              setPlacesByDay(allDaysPlaces);
              setTotalDays(allDaysPlaces.length);
              setStartDate(firstDayDate);
              setCurrentDayIndex(todayIndex);
              setRoutePlaces(allDaysPlaces[todayIndex] ?? []);
              setSelectedPlaceIndex(0);
              setIsLoadingRoute(false);
            } else {
              // daySchedules가 비어있을 때, getLocations로 직접 장소 가져오기 시도
              if (allLocations && allLocations.length > 0) {
                const places: Array<{
                  name: string;
                  address: string;
                  latitude: number;
                  longitude: number;
                  theme: string;
                  distance: string;
                  time: string;
                  rating?: number;
                  reviewCount?: number;
                  types?: string[];
                  phoneNumber?: string;
                }> = [];
                
                allLocations.forEach((location: LocationResponse, index: number) => {
                  // 이전 장소로부터의 거리 계산
                  let distanceStr = "0m";
                  if (index > 0 && places[index - 1]) {
                    const prevPlace = places[index - 1];
                    const R = 6371; // 지구 반지름 (km)
                    const dLat = (location.latitude - prevPlace.latitude) * Math.PI / 180;
                    const dLon = (location.longitude - prevPlace.longitude) * Math.PI / 180;
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(prevPlace.latitude * Math.PI / 180) * Math.cos(location.latitude * Math.PI / 180) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distanceKm = R * c;
                    
                    if (distanceKm < 1) {
                      distanceStr = `${Math.round(distanceKm * 1000)}m`;
                    } else {
                      distanceStr = `${distanceKm.toFixed(1)}km`;
                    }
                  }
                  
                  // 기본 시간 설정 (오전 10시부터 시작해서 2시간 간격)
                  const hour = 10 + (index * 2);
                  const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                  const amPm = hour >= 12 ? 'PM' : 'AM';
                  const timeStr = `${hour12}:00 ${amPm}`;
                  
                  // category를 theme으로 사용
                  const theme = location.category || "관광명소";
                  
                  const place = {
                    name: location.place || '',
                    address: location.address || '',
                    latitude: location.latitude,
                    longitude: location.longitude,
                    theme: theme,
                    distance: distanceStr,
                    time: timeStr,
                    rating: undefined,
                    reviewCount: undefined,
                    types: undefined,
                    phoneNumber: undefined,
                  };
                  places.push(place);
                });
                
                setPlacesByDay([places]);
                setTotalDays(1);
                setStartDate(today);
                setCurrentDayIndex(0);
                setRoutePlaces(places);
                setSelectedPlaceIndex(0);
                setIsLoadingRoute(false);
              } else {
                setRoutePlaces([]);
                setIsLoadingRoute(false);
              }
            }
          })
          .catch((error) => {
            console.error('Failed to load travel plan:', error);
            setIsLoadingRoute(false);
            // 에러 발생 시 일반 모드로 전환
            setIsRouteViewerMode(false);
            sessionStorage.removeItem('currentTravelPlanId');
          });
      } else {
        // 일반 모드: popular에서 선택한 도시 정보 읽기
        const selectedCitiesStr = sessionStorage.getItem('selectedCities');
        if (selectedCitiesStr) {
          try {
            const selectedCities = JSON.parse(selectedCitiesStr);
            if (selectedCities && selectedCities.length > 0) {
              // 첫 번째 선택된 도시로 초기 중심 설정
              setInitialCity(selectedCities[0].name);
            }
          } catch (e) {
            console.error('Failed to parse selected cities', e);
          }
        }
      }
    }
  }, []);

  // Day 변경 시 해당 날짜의 경로로 전환
  useEffect(() => {
    if (placesByDay.length > 0 && currentDayIndex >= 0 && currentDayIndex < placesByDay.length) {
      setRoutePlaces(placesByDay[currentDayIndex]);
      setSelectedPlaceIndex(0);
    }
  }, [currentDayIndex, placesByDay]);

  // 평점/리뷰가 없는 장소는 Google Places 검색으로 보강
  useEffect(() => {
    const places = placesByDay[currentDayIndex] ?? [];
    if (!places.length) return;
    places.forEach((place, index) => {
      if (place.rating != null && place.reviewCount != null) return;
      searchPlaces(place.name)
        .then((results) => {
          if (results && results[0]) {
            const r = results[0];
            setRoutePlaces((prev) =>
              prev.map((p, i) =>
                i === index
                  ? { ...p, rating: r.rating ?? undefined, reviewCount: r.reviewCount ?? undefined }
                  : p
              )
            );
          }
        })
        .catch(() => {});
    });
  }, [currentDayIndex, placesByDay]);

  // 도시 중심 좌표 변경 핸들러
  const handleCityCenterChange = useCallback((center: { lat: number; lng: number } | null) => {
    setCityCenter(center);
    // sessionStorage에 도시 좌표 저장 (optimize/places에서 사용)
    if (center && typeof window !== 'undefined') {
      sessionStorage.setItem('cityCenter', JSON.stringify(center));
    }
  }, []);

  const handleSelect = (place: { name: string; address: string; latitude: number; longitude: number; rating?: number; reviewCount?: number; types?: string[] | null; photoReference?: string | null }) => {
    const isDuplicate = selectedPlaces.some(
      (p) => p.name === place.name && p.address === place.address
    );
    if (!isDuplicate) {
      setSelectedPlaces((prev) => [...prev, { ...place, image: "/icons/blank.png" }]);
    }
    setCurrentPin(place);
    setIsSearching(false);
  };

  const handleRemove = (index: number) => {
    const updated = [...selectedPlaces];
    const removed = updated.splice(index, 1)[0];
    setSelectedPlaces(updated);

    if (currentPin && removed.name === currentPin.name) {
      setCurrentPin(null);
    }
  };

  const handleActionClick = () => {
    if (selectedPlaces.length === 0 && currentPin) {
      const isDuplicate = selectedPlaces.some(
        (place) => place.name === currentPin.name && place.address === currentPin.address
      );
      if (!isDuplicate) {
        setSelectedPlaces([{ ...currentPin, image: "/icons/blank.png" }]);
      }
    }
    
    if (selectedPlaces.length > 0) {
      // 선택한 장소들을 sessionStorage에 저장
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedPlaces', JSON.stringify(selectedPlaces));
      }
      router.push('/optimize/route');
    }
  };

  const handleClear = () => {
    setCurrentPin(null);
    setIsSearching(false);
  };

  const handleSearchStart = () => {
    setIsSearching(true);
  };

  // 경로 뷰어 모드에서 뒤로가기 시 sessionStorage 정리
  const handleBackInRouteViewer = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentTravelPlanId');
    }
    router.back();
  };

  // 하단 패널 드래그 제스처 (드래그 핸들에서만 캡처)
  const onPanelPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag-handle]')) return;
    setIsDragging(true);
    setDragStartY(e.clientY);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPanelPointerMove = () => {
    if (!isDragging || dragStartY === null) return;
  };

  const onPanelPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (dragStartY === null) {
      setIsDragging(false);
      return;
    }
    const deltaY = e.clientY - dragStartY;
    const threshold = 40;
    let expanded = isExpanded;
    if (deltaY <= -threshold) expanded = true;
    else if (deltaY >= threshold) expanded = false;

    setIsExpanded(expanded);
    setIsDragging(false);
    setDragStartY(null);
  };

  const handlePlaceClick = (index: number) => {
    setSelectedPlaceIndex(index);
  };

  const displayDate = useMemo(() => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + currentDayIndex);
    return d;
  }, [startDate, currentDayIndex]);

  const formattedDate = useMemo(() => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = (displayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = displayDate.getDate().toString().padStart(2, '0');
    const weekday = days[displayDate.getDay()];
    return `${month}. ${day} ${weekday}`;
  }, [displayDate]);

  const handlePrevDay = () => {
    if (currentDayIndex > 0) setCurrentDayIndex((prev) => prev - 1);
  };

  const handleNextDay = () => {
    if (currentDayIndex < totalDays - 1) setCurrentDayIndex((prev) => prev + 1);
  };

  const handleNextPlace = () => {
    if (routePlaces.length <= 1) return;
    setSelectedPlaceIndex((prev) => (prev + 1) % routePlaces.length);
  };

  // 경로 뷰어 모드 렌더링
  if (isRouteViewerMode) {
    return (
      <FullScreenContainer>
        {/* optimize/result 스타일 날짜 바 */}
        <RouteViewerHeader>
          <BackButton onClick={handleBackInRouteViewer} aria-label="뒤로">
            <ArrowIcon src="/icons/Larrow.png" alt="back" />
          </BackButton>
          <CenterControls>
            <DayPrevBtn onClick={handlePrevDay} aria-label="이전 날짜">
              <Image src="/icons/Larrow.png" alt="prev" width={20} height={20} />
            </DayPrevBtn>
            <DayText>
              <span className="day-label">Day {currentDayIndex + 1}</span>
              <span className="date-label">({formattedDate})</span>
            </DayText>
            <DayNextBtn onClick={handleNextDay} aria-label="다음 날짜">
              <Image src="/icons/Larrow.png" alt="next" width={20} height={20} />
            </DayNextBtn>
          </CenterControls>
        </RouteViewerHeader>

        <MapContainer>
          {isLoadingRoute ? (
            <LoadingContainer>
              <LoadingText>경로를 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : routePlaces.length > 0 ? (
            <>
              <MapContent aria-hidden="false">
                <MapInnerWrap>
                  <RouteMapComponent
                    places={routePlaces}
                    selectedPlaceIndex={selectedPlaceIndex}
                    onPlaceClick={handlePlaceClick}
                    initialCityName={null}
                  />
                </MapInnerWrap>
              </MapContent>
              {/* 하단 정보 패널 */}
              <BottomPanel onPointerDown={onPanelPointerDown} onPointerMove={onPanelPointerMove} onPointerUp={onPanelPointerUp}>
                <DragHandle data-drag-handle />
                {!isExpanded && (
                  <ExpandToggle 
                    type="button"
                    $expanded={isExpanded} 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNextPlace();
                    }} 
                    aria-label="다음 장소"
                  >
                    <svg className="arrow-svg" width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 9 H22" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18 5 L22 9 L18 13" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </ExpandToggle>
                )}
                {routePlaces.length > 0 && routePlaces[selectedPlaceIndex] && (
                  <>
                    <CurrentStop>
                      <StopNumber>{selectedPlaceIndex + 1}</StopNumber>
                      <StopTime>{routePlaces[selectedPlaceIndex].time || "시간 정보 없음"}</StopTime>
                    </CurrentStop>
                    <PlaceInfo>
                      <PlaceImage>이미지</PlaceImage>
                      <PlaceDetails>
                        <PlaceTitle>{routePlaces[selectedPlaceIndex].name}</PlaceTitle>
                        <PlaceTheme>테마 ({routePlaces[selectedPlaceIndex].theme || "관광명소"})</PlaceTheme>
                        <PlaceDistance>
                          여기서부터 <span className="value">{routePlaces[selectedPlaceIndex].distance || "0m"}</span>
                        </PlaceDistance>
                      </PlaceDetails>
                      <MenuButton></MenuButton>
                    </PlaceInfo>
                    <ExpandedContent $expanded={isExpanded}>
                      <Section>
                        <Row>
                          <RowIcon><ClockIcon /></RowIcon>
                          <div>
                            <RowTextStrong>오늘 {routePlaces[selectedPlaceIndex].time || "시간 정보 없음"} 방문 예정</RowTextStrong>
                          </div>
                        </Row>
                        <Row>
                          <RowIcon><PinIcon /></RowIcon>
                          <div>
                            <RowText>{routePlaces[selectedPlaceIndex].address || "주소 정보 없음"}</RowText>
                          </div>
                        </Row>
                        <Row>
                          <RowIcon><PhoneIcon /></RowIcon>
                          <div>
                            <RowText>{routePlaces[selectedPlaceIndex].phoneNumber || "전화번호 정보 없음"}</RowText>
                          </div>
                        </Row>
                      </Section>
                      <ReviewsSection>
                        <ReviewsHeader>
                          {routePlaces[selectedPlaceIndex].rating && routePlaces[selectedPlaceIndex].reviewCount ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {routePlaces[selectedPlaceIndex].rating.toFixed(1)} ({routePlaces[selectedPlaceIndex].reviewCount.toLocaleString()}) <StarIcon />
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              - (리뷰 정보 없음) <StarIcon />
                            </span>
                          )}
                          <GoogleNote>리뷰는 Google Map에서 제공됩니다</GoogleNote>
                        </ReviewsHeader>
                        <ReviewCards>
                          {routePlaces[selectedPlaceIndex].rating && routePlaces[selectedPlaceIndex].reviewCount ? (
                            <ReviewCard>
                              <ReviewRating>
                                <span>{routePlaces[selectedPlaceIndex].rating?.toFixed(1) || '0.0'}</span>
                                <StarIcon />
                              </ReviewRating>
                              <ReviewText>{routePlaces[selectedPlaceIndex].reviewCount?.toLocaleString() || 0}개의 리뷰가 있습니다</ReviewText>
                            </ReviewCard>
                          ) : (
                            <ReviewCard>
                              <ReviewRating>
                                <span>-</span>
                                <StarIcon />
                              </ReviewRating>
                              <ReviewText>리뷰 정보 없음</ReviewText>
                            </ReviewCard>
                          )}
                          <MoreCard>
                            <CircleButton 
                              aria-label="더 보기"
                              onClick={() => {
                                setIsExpanded(!isExpanded);
                              }}
                            >
                              <ArrowRightIcon />
                            </CircleButton>
                            <MoreLabel>더 보기</MoreLabel>
                          </MoreCard>
                        </ReviewCards>
                      </ReviewsSection>
                    </ExpandedContent>
                  </>
                )}
              </BottomPanel>
            </>
          ) : (
            <LoadingContainer>
              <LoadingText>경로 정보가 없습니다.</LoadingText>
            </LoadingContainer>
          )}
        </MapContainer>
      </FullScreenContainer>
    );
  }

  // 일반 모드 렌더링 (기존 코드)
  return (
    <FullScreenContainer>
      {/* 구글 맵 배경 */}
      <MapContainer>
        <GoogleMapComponent 
          selectedPlace={currentPin}
          selectedPlaces={selectedPlaces}
          initialCityName={initialCity}
          onCityCenterChange={handleCityCenterChange}
        />
      </MapContainer>

      <OverlayContent>
        {/* 모바일 스타일 헤더 - 화면 전체 너비 */}
        <MobileHeader>
          <HeaderContent>
            <BackButton onClick={() => router.back()}>
              <ArrowIcon src="/icons/Larrow.png" alt="back" />
            </BackButton>
            <HeaderText>장소 추가하기</HeaderText>
          </HeaderContent>
        </MobileHeader>

        {/* 검색바 섹션 */}
        <SearchSection>
          <LocationSearchInput
            onSelect={handleSelect}
            selectedPlaces={selectedPlaces}
            onClear={handleClear}
            onSearchStart={handleSearchStart}
            searchCenter={cityCenter}
          />
        </SearchSection>

        {/* 하단 액션 섹션 - 검색 중일 때는 숨김 */}
        {!isSearching && (
          <BottomActionSection>
            {selectedPlaces.length > 0 && (
              <SelectedPlacesList>
                {selectedPlaces.map((place, index) => (
                  <SelectedPlaceItem key={index}>
                    <PlaceThumbnail src={place.image || "/icons/blank.png"} alt="thumb" />
                    <PlaceLabel>장소 {index + 1}</PlaceLabel>
                    <RemoveButton onClick={() => handleRemove(index)}>✕</RemoveButton>
                  </SelectedPlaceItem>
                ))}
                <EditButton>편집</EditButton>
              </SelectedPlacesList>
            )}
                         <AddButton onClick={handleActionClick}>
               {selectedPlaces.length === 0 ? '추가' : '추가 완료'}
             </AddButton>
          </BottomActionSection>
        )}
      </OverlayContent>
    </FullScreenContainer>
  );
}

const FullScreenContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const RouteViewerHeader = styled.header`
  background: #fff;
  height: 60px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #eee;
  position: relative;
  flex-shrink: 0;
`;

const CenterControls = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DayText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #1c1c1c;
  white-space: nowrap;
  & .day-label {
    font-size: 18px;
    font-weight: 700;
  }
  & .date-label {
    font-size: 16px;
    font-weight: 500;
    color: #777777;
  }
`;

const DayPrevBtn = styled.button`
  background: transparent;
  border: 0;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DayNextBtn = styled.button`
  background: transparent;
  border: 0;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  & > img {
    transform: scaleX(-1);
    opacity: 1 !important;
    filter: none !important;
  }
`;

const MapContainer = styled.div`
  position: relative;
  flex: 1;
  min-height: 250px;
  width: 100%;
  z-index: 0;
  overflow: hidden;
`;

const MapContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  min-height: 250px;
`;

const MapInnerWrap = styled.div`
  width: 100%;
  height: 100%;
  min-height: 250px;
  position: relative;
`;

const OverlayContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  box-sizing: border-box;
  z-index: 1;
  pointer-events: none; // 지도 클릭 가능하도록

  // 자식 요소들은 클릭 가능하도록
  > * {
    pointer-events: auto;
  }
`;

const MobileHeader = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 100%;
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;


const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ArrowIcon = styled.img`
  width: 20px;
  height: 20px;
`;

const HeaderText = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1C1C1C;
  flex: 1;
`;

const SearchSection = styled.div`
  margin: 16px 16px 0 16px;
`;

const BottomActionSection = styled.div`
  margin-top: auto;
  padding: 16px 20px;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
  background: white;
  border-top: 1px solid #e9ecef;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const SelectedPlacesList = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 11px;
  margin-bottom: 11px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;

const SelectedPlaceItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  flex-shrink: 0;
  padding-top: 5px;
`;

const PlaceThumbnail = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PlaceLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-align: center;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 1px;
  right: -4px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #ff3742;
    transform: scale(1.1);
  }
`;

const EditButton = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f8f9fa;
  color: #666;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    color: #495057;
  }
`;

const AddButton = styled.button`
  width: 100%;
  max-width: 560px;
  padding: 18px 0;
  background: #3CA6FF;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 11px auto 0 auto;
  display: block;

  &:hover {
    background: #3295e6;
  }

  &:active {
    background: #2884cc;
  }
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 16px;
  font-weight: 500;
`;

// 하단 정보 패널 (optimize/result 스타일)
const BottomPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 16px 16px 24px;
  box-shadow: 0 -8px 24px rgba(0,0,0,0.08);
  transition: none;
  touch-action: none;
  user-select: none;
  z-index: 20;
`;

const DragHandle = styled.div`
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: none;

  &::before {
    content: "";
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: #e5e7eb;
  }
`;

const ExpandToggle = styled.button<{ $expanded: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  min-width: 44px;
  min-height: 44px;

  & .arrow-svg {
    transition: transform 0.2s ease;
    transform: rotate(${props => (props.$expanded ? '90deg' : '0deg')});
    display: block;
  }
`;

const CurrentStop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const StopNumber = styled.div`
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: 2px solid #3CA6FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3CA6FF;
  font-weight: bold;
  font-size: 14px;
`;

const StopTime = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #777777;
`;

const PlaceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PlaceImage = styled.div`
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
`;

const PlaceDetails = styled.div`
  flex: 1;
`;

const PlaceTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin-bottom: 4px;
`;

const PlaceTheme = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const PlaceDistance = styled.div`
  font-size: 14px;
  color: #1c1c1c;
  & .value {
    color: #3CA6FF;
    font-weight: 600;
  }
`;

const MenuButton = styled.button`
  width: 32px;
  height: 32px;
  position: relative;
  background: #fff;
  border: 3px solid #4CAF50;
  border-radius: 10px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 2px;
    background: #4CAF50;
    border-radius: 2px;
  }

  &::before {
    top: 8px;
  }
  &::after {
    bottom: 8px;
  }
`;

const ExpandedContent = styled.div<{ $expanded: boolean }>`
  margin-top: 8px;
  overflow: hidden;
  max-height: ${props => (props.$expanded ? '1200px' : '0')};
  transition: max-height 0.25s ease;
`;

const Section = styled.div`
  padding: 4px 0 8px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
`;

const RowIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1C1C1C;
`;

const RowText = styled.div`
  color: #1c1c1c;
  font-size: 16px;
  font-weight: 500;
`;

const RowTextStrong = styled(RowText)`
  font-weight: 700;
`;

const ReviewsSection = styled.div`
  margin-top: 8px;
`;

const ReviewsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 16px;
  font-weight: 700;
  color: #1c1c1c;
`;

const GoogleNote = styled.div`
  margin-top: 0;
  font-size: 11px;
  color: #777777;
  text-align: right;
`;

const ReviewCards = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const ReviewCard = styled.div`
  min-width: 220px;
  max-width: 240px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #F1F5F9;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  padding: 12px 14px;
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1c1c1c;
  font-weight: 700;
`;

const ReviewText = styled.div`
  margin-top: 6px;
  color: #111827;
  font-size: 14px;
  line-height: 1.4;
`;

const MoreCard = styled.div`
  min-width: 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const CircleButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const MoreLabel = styled.div`
  font-size: 14px;
  color: #6B7280;
`;

// 아이콘 컴포넌트
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.3 19.3 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h2a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.63a2 2 0 0 1-.45 2.11L7.1 9.9a16 16 0 0 0 6 6l1.44-1.11a2 2 0 0 1 2.12-.45c.85.28 1.73.48 2.63.6A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = ({ color = '#FBBF24' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12h14" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" />
    <path d="M13 6l6 6-6 6" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

