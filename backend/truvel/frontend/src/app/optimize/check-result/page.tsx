"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styled from "styled-components";

// TypeScript 인터페이스 정의
interface Activity {
  id: string;
  title: string;
  details: string;
  type: "activity";
  color: string;
  number?: number;
  iconType?: "restaurant" | "hotel";
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [travelData, setTravelData] = useState<TravelData>({
    title: "샌프란시스코 여행",
    dates: "2025. 05. 12-05. 16",
    days: [
      {
        date: "05. 12월",
        dayNumber: 1,
        items: [
          {
            id: "1",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#3CA6FF",
            number: 1,
          },
          {
            id: "2",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#3CA6FF",
            number: 2,
          },
          {
            id: "3",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#8B5A96",
            iconType: "hotel",
          },
        ],
      },
      {
        date: "05. 13화",
        dayNumber: 2,
        items: [
          {
            id: "4",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#E67E22",
            iconType: "hotel",
          },
          {
            id: "5",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#3CA6FF",
            number: 1,
          },
          {
            id: "6",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#3CA6FF",
            number: 2,
          },
          {
            id: "7",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#8B5A96",
            iconType: "restaurant",
          },
          {
            id: "8",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#3CA6FF",
            number: 3,
          },
        ],
      },
    ],
  });


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
    const draggedItemId = e.dataTransfer.getData("text/plain");
    
    // 소스 날짜 찾기
    const sourceDayIndex = travelData.days.findIndex(day => 
      day.items.some(item => item.id === draggedItemId)
    );
    
    // 같은 날짜 내에서는 순서만 변경
    if (sourceDayIndex === targetDayIndex) {
      // 같은 날짜 내에서의 순서 변경 로직 (추후 구현 가능)
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
      
      // 타겟에 추가
      targetDay.items.push(draggedItem);
      
      return newData;
    });
  };

  const handleRegisterSchedule = () => {
    router.push('/my-trips');
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

<MapPlaceholder>
  <MapLabel>지도</MapLabel>
  <ArrowContainer>
    <ArrowUp />
  </ArrowContainer>
</MapPlaceholder>

      {/* Content */}
      <Content>
        {travelData.days.map((day, dayIndex) => (
          <DaySection 
            key={day.dayNumber}
          >
            <DayTitle>
              Day {day.dayNumber} {day.date}
            </DayTitle>
            
            {day.items.map((item) => (
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
                  <DragHandle
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dayIndex)}
                  >
                    <DragLine />
                    <DragLine />
                    <DragLine />
                  </DragHandle>
                )}
              </ActivityItem>
            ))}
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
            <RegisterButton onClick={handleRegisterSchedule}>일정 등록하기</RegisterButton>
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

const MapPlaceholder = styled.div`
  height: 200px;
  background: #e5e5e5;
  margin: 0 20px 20px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const MapLabel = styled.div`
  color: #999;
  font-size: 16px;
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

const DaySection = styled.div`
  margin-bottom: 30px;
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

const RegisterButton = styled.button`
  background: #3CA6FF;
  border: none;
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
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
