"use client";

import styled from "styled-components";
import { useMemo, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from 'react';
import Image from "next/image";

const Page = styled.div`
  min-height: 100vh;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: #fff;
  height: 60px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #eee;
  position: relative;
`;


const BackBtn = styled.button`
  background: transparent;
  border: 0;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;



const NextBtn = styled.button`
  background: transparent;
  border: 0;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

 

  /* 아이콘을 좌우 반전만 할 때 */
  & > img {
    transform: scaleX(-1);
    opacity: 1 !important;
    filter: none !important;
  }
`;


const CenterControls = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BagIcon = styled.div`
  width: 30px;
  height: 30px;
  margin-left: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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


const MapContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background-image: url('/icons/EXmap.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const MapContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
`;



// 경로 포인트
const RoutePoint = styled.div<{ top: string; left: string }>`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  width: 20px;
  height: 20px;
  background: #3CA6FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 10px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
`;

// 위험도 마커
const DangerMarker = styled.div`
  position: relative;
  width: 70px;
  height: 70px;
  background: rgba(255, 243, 17, 0.7);  
  border-radius: 60%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  user-select: none;
  pointer-events: auto;
  border: 2px solid rgba(255, 243, 17, 0.9);
`;

// 툴팁
const Tooltip = styled.div<{ visible: boolean; isLeft?: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: white;
  color: black;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e5e5;
  z-index: 30;
  max-width: 200px;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-bottom-color: white;
  }
  
  /* 왼쪽에 표시될 때 화살표 방향 변경 */
  ${props => props.isLeft && `
    &::before {
      top: -8px;
      left: 20px;
      transform: none;
      border-bottom-color: white;
    }
  `}
`;



// 하단 정보 패널
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
  touch-action: none; /* 드래그 제스처 인식용 */
  user-select: none;
  z-index: 20;
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
  background: #ffffff;         /* 흰색 배경 */
  border: 2px solid #3CA6FF;   /* 파란색 테두리 */
  border-radius: 50%;          /* 원형 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3CA6FF;              /* 글자색도 파란색으로 */
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

// 확장 영역 UI 요소들
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
  color: #1C1C1C; /* 내부 SVG의 stroke가 currentColor를 따르도록 */
  
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
  border: 1px solid #F1F5F9; /* slate-100 */
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
  color: #111827; /* gray-900 */
  font-size: 14px;
  line-height: 1.4;
`;

// 더보기 버튼 카드
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
  border: 1px solid #E5E7EB; /* gray-200 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MoreLabel = styled.div`
  font-size: 14px;
  color: #6B7280; /* gray-500 */
`;

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12h14" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" />
    <path d="M13 6l6 6-6 6" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 아이콘(SVG) 컴포넌트
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

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const StarIcon = ({ color = '#FBBF24' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
  </svg>
);


const MenuButton = styled.button`
  width: 32px;
  height: 32px;
  position: relative;

  background: #fff;              /* 흰색 배경 */
  border: 3px solid #4CAF50;     /* 초록색 테두리 */
  border-radius: 10px;           /* 둥근 사각형 */
  box-sizing: border-box;
  cursor: pointer;

  /* 가운데 정렬 */
  display: flex;
  align-items: center;
  justify-content: center;

  /* 가로줄 2개 */
  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;        /* 줄 길이 */
    height: 2px;        /* 줄 두께 */
    background: #4CAF50;
    border-radius: 2px;
  }

  &::before {
    top: 8px;    /* 위쪽 줄 */
  }
  &::after {
    bottom: 8px; /* 아래쪽 줄 */
  }
`;

/* ExpandToggle 제거 (드래그 제스처로 대체) */
const ExpandToggle = styled.button<{ expanded: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  & .arrow-svg {
    transition: transform 0.2s ease;
    transform: rotate(${props => (props.expanded ? '90deg' : '0deg')});
    display: block;
  }
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
    background: #e5e7eb; /* #ddd 유사 */
  }
`;

const ExpandedContent = styled.div<{ expanded: boolean }>`
  margin-top: 8px;
  overflow: hidden;
  max-height: ${props => (props.expanded ? '1200px' : '0')};
  transition: max-height 0.25s ease;
`;


export default function ResultPage() {
  const [selectedPlace, setSelectedPlace] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [hoveredDanger, setHoveredDanger] = useState<number | null>(null);
  
  // sessionStorage에서 선택한 날짜 읽어오기
  const startDate = useMemo(() => {
    if (typeof window === 'undefined') {
      return new Date();
    }
    
    try {
      const selectedDatesStr = localStorage.getItem('selectedTravelDates');
      if (selectedDatesStr) {
        const selectedDates: string[] = JSON.parse(selectedDatesStr);
        if (selectedDates && selectedDates.length > 0) {
          const firstDate = new Date(selectedDates[0]);
          if (!isNaN(firstDate.getTime())) {
            return firstDate;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse selected dates', e);
    }
    
    return new Date();
  }, []);

  const displayDate = useMemo(() => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + (currentDay - 1));
    return date;
  }, [startDate, currentDay]);

  const formattedDate = useMemo(() => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const month = (displayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = displayDate.getDate().toString().padStart(2, '0');
    const weekday = days[displayDate.getDay()];
    return `${month}. ${day} ${weekday}`;
  }, [displayDate]);

  // sessionStorage에서 선택한 장소 읽어오기
  const places = useMemo(() => {
    if (typeof window === 'undefined') {
      return [
        { name: "서울타워", theme: "관광명소", distance: "0m", time: "11:00", x: "25%", y: "20%" },
        { name: "명동", theme: "쇼핑", distance: "2.3km", time: "13:30", x: "40%", y: "35%" },
        { name: "홍대입구", theme: "문화/예술", distance: "1.8km", time: "16:00", x: "55%", y: "70%" }
      ];
    }

    try {
      const selectedPlacesStr = sessionStorage.getItem('selectedPlaces');
      if (selectedPlacesStr) {
        const selectedPlaces: Array<{ name: string; address: string; latitude?: number; longitude?: number }> = JSON.parse(selectedPlacesStr);
        if (selectedPlaces && selectedPlaces.length > 0) {
          // 선택한 장소들을 지도 위치에 맞게 변환 (간단한 예시)
          return selectedPlaces.map((place, index) => {
            const positions = [
              { x: "25%", y: "20%" },
              { x: "40%", y: "35%" },
              { x: "55%", y: "70%" },
              { x: "60%", y: "50%" },
              { x: "30%", y: "60%" },
            ];
            const pos = positions[index] || { x: "50%", y: "50%" };
            return {
              name: place.name,
              theme: "관광명소", // 기본값
              distance: index === 0 ? "0m" : `${(index * 1.5).toFixed(1)}km`,
              time: `${9 + index * 2}:${index % 2 === 0 ? "00" : "30"}`,
              x: pos.x,
              y: pos.y,
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse selected places', e);
    }

    // 기본값
    return [
      { name: "서울타워", theme: "관광명소", distance: "0m", time: "11:00", x: "25%", y: "20%" },
      { name: "명동", theme: "쇼핑", distance: "2.3km", time: "13:30", x: "40%", y: "35%" },
      { name: "홍대입구", theme: "문화/예술", distance: "1.8km", time: "16:00", x: "55%", y: "70%" }
    ];
  }, []);

  const categoryPlaces = [
    { name: "인천공항", x: "20%", y: "15%", icon: "/icons/plane-icon.png" },
    { name: "맛집거리", x: "70%", y: "90%", icon: "/icons/res-icon.png" },
    { name: "호텔", x: "80%", y: "80%", icon: "/icons/hotel-icon.png" }
  ];

  const dangerPlaces = [
    { name: "위험구역", x: "85%", y: "15%", message: "최근 소매치기 발생 사례 다수 신고" }
  ];

  // 퍼블리싱용 임시 카테고리 마커는 바로 렌더링 블록에 추가

  const handlePlaceClick = (index: number) => {
    setSelectedPlace(index);
  };

  const handlePrevDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  const handleNextDay = () => {
    setCurrentDay(currentDay + 1);
  };

  // 토글 버튼 없이 드래그로만 제어

  const onPanelPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
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
    if (deltaY <= -threshold) expanded = true;      // 위로 끌면 확장
    else if (deltaY >= threshold) expanded = false; // 아래로 끌면 축소

    setIsExpanded(expanded);
    setIsDragging(false);
    setDragStartY(null);
  };

  return (
    <Page>
                           <Header>
                            <BagIcon>
                              <Image src="/icons/trip-on.png" alt="trip" width={25} height={25} />
                            </BagIcon>
                    <CenterControls>
                      <BackBtn onClick={handlePrevDay} aria-label="이전 날짜">
                        <Image src="/icons/Larrow.png" alt="prev" width={20} height={20} />
                      </BackBtn>
                      <DayText>
                        <span className="day-label">Day {currentDay}</span>
                        <span className="date-label">({formattedDate})</span>
                      </DayText>
                      <NextBtn onClick={handleNextDay} aria-label="다음 날짜">
                        <Image src="/icons/Larrow.png" alt="next" width={20} height={20} />
                      </NextBtn>
                    </CenterControls>
        </Header>
      

      
      <MapContainer>
        <MapContent>
          {/* SVG 경로 선 - 비행기 → 1번 → 2번 → 3번 → 식당 → 호텔 순으로 연결 */}
          <svg 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d={`M ${parseFloat(categoryPlaces[0].x.replace('%', ''))} ${parseFloat(categoryPlaces[0].y.replace('%', ''))} L ${parseFloat(places[0].x.replace('%', ''))} ${parseFloat(places[0].y.replace('%', ''))} L ${parseFloat(places[1].x.replace('%', ''))} ${parseFloat(places[1].y.replace('%', ''))} L ${parseFloat(places[2].x.replace('%', ''))} ${parseFloat(places[2].y.replace('%', ''))} L ${parseFloat(categoryPlaces[1].x.replace('%', ''))} ${parseFloat(categoryPlaces[1].y.replace('%', ''))} L ${parseFloat(categoryPlaces[2].x.replace('%', ''))} ${parseFloat(categoryPlaces[2].y.replace('%', ''))}`}
              stroke="#777777"
              strokeWidth="0.5"
              strokeDasharray="1,1"
              fill="none"
            />
          </svg>

          {/* 숫자 장소들 (1, 2, 3) - 클릭 가능 */}
          {places.map((place, index) => (
            <RoutePoint 
              key={index}
              top={place.y} 
              left={place.x} 
              onClick={() => handlePlaceClick(index)}
            >
              {index + 1}
            </RoutePoint>
          ))}

          {/* 아이콘 장소들 (비행기, 식당, 호텔) - 클릭 불가 */}
          {categoryPlaces.map((place, index) => (
            <div
              key={`category-${index}`}
              style={{
                position: 'absolute',
                top: place.y,
                left: place.x,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
              }}
            >
              <Image src={place.icon} alt={place.name} width={24} height={24} />
            </div>
          ))}

          {/* 위험도 마커들 */}
          {dangerPlaces.map((place, index) => (
            <div 
              key={`danger-${index}`} 
              style={{ 
                position: 'absolute',
                top: place.y,
                left: place.x,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                width: '70px',
                height: '70px',
                pointerEvents: 'auto'
              }}
              onMouseEnter={() => setHoveredDanger(index)}
              onMouseLeave={() => setHoveredDanger(null)}
            >
              <DangerMarker>
                <Image src="/icons/danger.png" alt="위험" width={24} height={24} />
              </DangerMarker>
              {hoveredDanger === index && (
                <Tooltip 
                  visible={true}
                  isLeft={parseFloat(place.x) > 70}
                  style={{
                    // 화면 오른쪽 끝에 가까우면 더 왼쪽으로 이동 (여전히 아래 위치 유지)
                    left: parseFloat(place.x) > 70 ? '20%' : '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {place.message}
                </Tooltip>
              )}
            </div>
          ))}

         </MapContent>
         
         {/* 하단 정보 패널 */}
         <BottomPanel onPointerDown={onPanelPointerDown} onPointerMove={onPanelPointerMove} onPointerUp={onPanelPointerUp}>
           <DragHandle />
           {!isExpanded && (
             <ExpandToggle expanded={isExpanded} onClick={() => setIsExpanded(true)} aria-label="펼치기">
               <svg className="arrow-svg" width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M2 9 H22" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                 <path d="M18 5 L22 9 L18 13" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </ExpandToggle>
           )}
           <CurrentStop>
             <StopNumber>{selectedPlace + 1}</StopNumber>
             <StopTime>{places[selectedPlace].time}</StopTime>
           </CurrentStop>
           <PlaceInfo>
             <PlaceImage>이미지</PlaceImage>
             <PlaceDetails>
               <PlaceTitle>{places[selectedPlace].name}</PlaceTitle>
               <PlaceTheme>테마 ({places[selectedPlace].theme})</PlaceTheme>
               <PlaceDistance>
                여기서부터 <span className="value">{places[selectedPlace].distance}</span>
              </PlaceDistance>
            </PlaceDetails>
            <MenuButton></MenuButton>
          </PlaceInfo>
          <ExpandedContent expanded={isExpanded}>
            <Section>
              <Row>
                <RowIcon><ClockIcon /></RowIcon>
                <div>
                  <RowTextStrong>오늘 {places[selectedPlace].time} 방문 예정</RowTextStrong>
                 
                </div>
              </Row>
              <Row>
                <RowIcon><PinIcon /></RowIcon>
                <div>
                  <RowText>장소의 상세 주소 입력칸</RowText>
                 
                </div>
              </Row>
              <Row>
                <RowIcon><PhoneIcon /></RowIcon>
                <div>
                  <RowText>+82 02-000-0000</RowText>
                  
                </div>
              </Row>
              <Row>
                <RowIcon><UsersIcon /></RowIcon>
                <div>
                  <RowText>10:00 조금 붐비는 시간대</RowText>
                  
                </div>
              </Row>
            </Section>
            <ReviewsSection>
              <ReviewsHeader>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  4.8 (1,228) <StarIcon />
                </span>
                <GoogleNote>리뷰는 Google Map에서 제공됩니다</GoogleNote>
              </ReviewsHeader>
              <ReviewCards>
                <ReviewCard>
                  <ReviewRating>
                    <span>4.5</span>
                    <StarIcon />
                  </ReviewRating>
                  <ReviewText>리뷰 내용은 최대 두 줄만 보이도록</ReviewText>
                </ReviewCard>
                <ReviewCard>
                  <ReviewRating>
                    <span>4.5</span>
                    <StarIcon />
                  </ReviewRating>
                  <ReviewText>리뷰 내용은 최대 두 줄만 보이도록</ReviewText>
                </ReviewCard>
                <MoreCard>
                  <CircleButton aria-label="더 보기">
                    <ArrowRightIcon />
                  </CircleButton>
                  <MoreLabel>더 보기</MoreLabel>
                </MoreCard>
              </ReviewCards>
            </ReviewsSection>
          </ExpandedContent>
        </BottomPanel>
      </MapContainer>
    </Page>
  );
}
