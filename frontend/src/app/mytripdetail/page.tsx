"use client";

import React, { useState } from "react";
import { Map, Share, MoreVertical } from "lucide-react";
import Image from 'next/image';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

// TypeScript 인터페이스 정의
interface Flight {
  id: string;
  departure: string;
  arrival: string;
  time: string;
  airport: string;
  details: string;
  type: "flight";
}

interface Activity {
  id: string;
  title: string;
  details: string;
  type: "activity";
  color: string;
  iconType: "number" | "hotel" | "food" | "attraction";
  number?: number;
}

interface Status {
  id: string;
  text: string;
  type: "status";
}

interface MemoItem {
  id: string;
  text: string;
  type: "memo";
}

interface DayPlan {
  date: string;
  dayNumber: number;
  items: (Flight | Activity | Status | MemoItem)[];
}

interface TravelData {
  title: string;
  dates: string;
  days: DayPlan[];
}

// Styled Components
const App = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f8f8f8;
  min-height: 100vh;
  max-width: 400px;
  margin: 0 auto;
  position: relative;
`;

const Header = styled.div`
  background-color: #fff;
  padding: 16px 20px 20px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1C1C1C;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #777777;
  margin: 12px 0 10px 0;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 10px 18px;
  border-radius: 20px;
  border: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${({ $active }) => ($active ? "#3CA6FF" : "#f0f0f0")};
  color: ${({ $active }) => ($active ? "#fff" : "#666")};
`;

const MapPlaceholder = styled.div`
  background-color: #e8e8e8;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 16px;
`;

const Content = styled.div`
  background-color: #fff;
  padding: 0;
  padding-bottom: 100px;
`;

const DaySection = styled.div`
  margin-bottom: 0;
  padding: 20px 20px 0 20px;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DayTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #777777;
  margin: 0;
  padding: 0;
`;

const EditButton = styled.button`
  font-size: 14px;
  color: #777777;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;

const TimelineItem = styled.div`
  display: flex;
  margin-bottom: 24px;
  position: relative;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  margin-top: 2px;
`;


const NumberIconCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #3CA6FF;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  min-height: 80px;
  flex-direction: column;
  border: 1px solid #f2f2f2;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(53, 53, 53, 0.1);
  margin-bottom: 4px;
  background-color: #fff;
`;

const FlightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const FlightRoute = styled.span`
  font-size: 17px;
  font-weight: 600;
  color: #1C1C1C;
`;

const FlightDetails = styled.div`
  font-size: 14px;
  color: #777777;
  margin-bottom: 4px;
`;

const ActivityTitle = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: #1C1C1C;
  
`;

const ActivityDetails = styled.div`
  font-size: 14px;
  color: #777777;
`;

const MemoContainer = styled.div`
  border: 1px solid #f2f2f2;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(53, 53, 53, 0.1);
  background-color: #fff;
  min-height: 70px;
  max-height: 90px;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f8f8;
  }
`;

const MemoContent = styled.div`
  font-size: 14px;
  color: #1C1C1C;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  background-color: #f0f0f0;
  color: #1C1C1C;
  cursor: pointer;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  width: 90vw;
  max-width: 400px;
  box-shadow: 0 1px 3px rgba(53, 53, 53, 0.1);
  border: 1px solid #f2f2f2;
  min-height: 400px;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: #1C1C1C;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #777777;
  font-weight: 500;
`;

const TextArea = styled.textarea`
  width: 100%;
  flex: 1;
  border: none;
  border-radius: 0;
  padding: 0;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  color: #1C1C1C;
  line-height: 1.5;
  background-color: transparent;
  min-height: 200px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ModalButton = styled.button`
  display: none;
`;

const ConfirmButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #1C1C1C;
  font-weight: 500;
  margin-right: 8px;
`;

const Drawer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.3);
  z-index: 1000;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  & > div {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    border-radius: 16px 16px 0 0;
    padding: 20px;
    transform: ${({ $isOpen }) => ($isOpen ? "translateY(0)" : "translateY(100%)")};
    transition: transform 0.3s ease;
  }
`;

const DrawerHandle = styled.div`
  width: 40px;
  height: 4px;
  background-color: #ddd;
  border-radius: 2px;
  margin: 0 auto 20px;
`;

const DrawerTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin: 0 0 20px 0;
`;

const DrawerOption = styled.button`
  width: 100%;
  padding: 16px;
  background-color: #f8f8f8;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  color: #777777;
  cursor: pointer;
  margin-bottom: 12px;
  text-align: left;
`;



// 하단바 컴포넌트들
interface HoverIconProps {
  path: string;
  label: string;
  off: string;
  on: string;
  active?: boolean;
}

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
  const [hover, setHover] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(path);
  };

  return (
    <IconButton
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      $active={active}
    >
      <Image src={hover || active ? on : off} alt={label} width={20} height={20} />
      <span>{label}</span>
    </IconButton>
  );
}

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 4rem;
  width: 100%;
  max-width: 400px;
  font-size: 0.75rem;
  z-index: 20;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
`;

const TravelItineraryApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("전체 경로 최적화");
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [showPlaceDrawer, setShowPlaceDrawer] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [memoText, setMemoText] = useState("");
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [travelData, setTravelData] = useState<TravelData>({
    title: "샌프란시스코 여행",
    dates: "2025. 05. 12~ 05. 16",
    days: [
      {
        date: "05. 12 월",
        dayNumber: 1,
        items: [
          {
            id: "1",
            departure: "ICN",
            arrival: "SFO",
            time: "11:00",
            airport: "대한항공 KE101",
            details: "메모 내용",
            type: "flight",
          },
          {
            id: "2",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#8B9DC3",
            iconType: "number",
            number: 1,
          },
          {
            id: "3",
            text: "메모 내용만 있을 땐 최대 3줄 보이도록",
            type: "memo",
          },
        ],
      },
      {
        date: "05. 13 화",
        dayNumber: 2,
        items: [
          {
            id: "4",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#8B5A96",
            iconType: "hotel",
          },
          {
            id: "5",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#E67E22",
            iconType: "food",
          },
          {
            id: "6",
            text: "메모 내용만 있을 땐 최대 3줄 보이도록",
            type: "memo",
          },
        ],
      },
    ],
  });

  const handleAddMemo = (dayIndex: number) => {
    setCurrentDayIndex(dayIndex);
    setEditingMemoId(null);
    setMemoText("");
    setShowMemoModal(true);
  };

  const handleEditMemo = (dayIndex: number, memoId: string, memoText: string) => {
    setCurrentDayIndex(dayIndex);
    setEditingMemoId(memoId);
    setMemoText(memoText);
    setShowMemoModal(true);
  };


  const handleAddPlace = (dayIndex: number) => {
    setCurrentDayIndex(dayIndex);
    setShowPlaceDrawer(true);
  };

  const addPlace = (placeName: string) => {
    // 장소 추가 기능 비활성화 - 실제로는 아무것도 하지 않음
    console.log("장소 추가 기능이 비활성화되었습니다:", placeName);
    setShowPlaceDrawer(false);
  };

  const saveMemo = () => {
    if (memoText.trim()) {
      if (editingMemoId) {
        // 기존 메모 수정
        setTravelData((prev) => ({
          ...prev,
          days: prev.days.map((day, index) =>
            index === currentDayIndex
              ? {
                  ...day,
                  items: day.items.map((item) =>
                    item.id === editingMemoId
                      ? { ...item, text: memoText }
                      : item
                  ),
                }
              : day
          ),
        }));
      } else {
        // 새 메모 추가
        const newMemo: MemoItem = {
          id: `memo-${Math.random().toString(36).substr(2, 9)}`,
          text: memoText,
          type: "memo",
        };

        setTravelData((prev) => ({
          ...prev,
          days: prev.days.map((day, index) =>
            index === currentDayIndex
              ? { ...day, items: [...day.items, newMemo] }
              : day
          ),
        }));
      }

      setMemoText("");
      setEditingMemoId(null);
      setShowMemoModal(false);
    }
  };

  const deleteMemo = () => {
    if (editingMemoId) {
      // 기존 메모 삭제
      setTravelData((prev) => ({
        ...prev,
        days: prev.days.map((day, index) =>
          index === currentDayIndex
            ? {
                ...day,
                items: day.items.filter((item) => item.id !== editingMemoId),
              }
            : day
        ),
      }));
    }
    
    setMemoText("");
    setEditingMemoId(null);
    setShowMemoModal(false);
  };



  const getIcon = (item: Flight | Activity | Status | MemoItem) => {
    if (item.type === "flight") {
      return (
        <Image 
          src="/icons/plane-icon.png" 
          alt="비행기" 
          width={30} 
          height={30} 
          priority
        />
      );
    }
    if (item.type === "activity") {
      const activity = item as Activity;
      if (activity.iconType === "number") {
        return (
          <NumberIconCircle>
            <NumberIcon>{activity.number}</NumberIcon>
          </NumberIconCircle>
        );
      } else if (activity.iconType === "hotel") {
        return (
          <Image 
            src="/icons/hotel-icon.png" 
            alt="호텔" 
            width={30} 
            height={30} 
            priority
          />
        );
      } else if (activity.iconType === "food") {
        return (
          <Image 
            src="/icons/res-icon.png" 
            alt="식당" 
            width={30} 
            height={30} 
            priority
          />
        );
      }
    }
    if (item.type === "memo") {
      return (
        <MemoDot />
      );
    }
    return null;
  };


  const renderTimelineItem = (item: Flight | Activity | Status | MemoItem, dayIndex: number) => {
    if (item.type === "memo") {
      return (
        <TimelineItem key={item.id}>
          <IconContainer>
            {getIcon(item)}
          </IconContainer>
          <TimelineContent>
            <MemoContainer onClick={() => handleEditMemo(dayIndex, item.id, (item as MemoItem).text)}>
              <MemoContent>{(item as MemoItem).text}</MemoContent>
            </MemoContainer>
          </TimelineContent>
        </TimelineItem>
      );
    }

    return (
      <TimelineItem key={item.id}>
        <IconContainer>
          {getIcon(item)}
        </IconContainer>
        <TimelineContent>
          {item.type === "flight" ? (
            <Container>
              <FlightHeader>
                <FlightRoute>
                  {(item as Flight).departure} {(item as Flight).time} - {(item as Flight).arrival} 15:00
                </FlightRoute>
              </FlightHeader>

              <FlightDetails>{(item as Flight).airport}</FlightDetails>
              <FlightDetails>{(item as Flight).details}</FlightDetails>
            </Container>
          ) : item.type === "activity" ? (
            <Container>
              <ActivityTitle>{(item as Activity).title}</ActivityTitle>
              <ActivityDetails>
                {(item as Activity).details}
              </ActivityDetails>
            </Container>
          ) : null}
        </TimelineContent>
      </TimelineItem>
    );
  };

  return (
    <App>
      {/* Header */}
      <Header>
        <HeaderTop>
          <Title>{travelData.title}</Title>
          <div style={{ display: "flex", gap: "16px" }}>
            <Map className="w-6 h-6 text-gray-600" />
            <Share className="w-6 h-6 text-gray-600" />
            <MoreVertical className="w-6 h-6 text-gray-600" />
          </div>
        </HeaderTop>

        <Subtitle>{travelData.dates}</Subtitle>

        <TabContainer>
          <Tab
            $active={activeTab === "전체 경로 최적화"}
            onClick={() => setActiveTab("전체 경로 최적화")}
          >
            전체 경로 최적화
          </Tab>
          <Tab
            $active={activeTab === "가계부"}
            onClick={() => setActiveTab("가계부")}
          >
            가계부
          </Tab>
          <Tab
            $active={activeTab === "일행 추가"}
            onClick={() => setActiveTab("일행 추가")}
          >
            + 일행 추가
          </Tab>
        </TabContainer>
      </Header>

      {/* Map Placeholder */}
      <MapPlaceholder>지도</MapPlaceholder>

      {/* Content */}
      <Content>
        {/* Daily Itinerary */}
        {travelData.days.map((day, dayIndex) => (
          <DaySection key={day.dayNumber}>
            <DayHeader>
              <DayTitle>
                Day {day.dayNumber} {day.date}
              </DayTitle>
              <EditButton>편집하기</EditButton>
            </DayHeader>

            {day.items.map((item) => renderTimelineItem(item, dayIndex))}

            <ActionButtons>
              <ActionButton onClick={() => handleAddMemo(dayIndex)}>
                메모 추가
              </ActionButton>
              <ActionButton onClick={() => handleAddPlace(dayIndex)}>
                장소 추가
              </ActionButton>
            </ActionButtons>
          </DaySection>
        ))}
      </Content>

      {/* 메모 추가 모달 */}
      {showMemoModal && (
        <Modal onClick={() => setShowMemoModal(false)}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>메모</ModalTitle>
              <div>
                <ConfirmButton onClick={saveMemo}>
                  확인
                </ConfirmButton>
                <CloseButton onClick={deleteMemo}>
                  삭제
                </CloseButton>
              </div>
            </ModalHeader>
            <div style={{ color: '#1C1C1C', fontSize: '14px', marginBottom: '8px' }}>
              
            </div>
            <TextArea
              placeholder=""
              value={memoText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMemoText(e.target.value)}
            />
            <ModalButton onClick={saveMemo}>추가</ModalButton>
          </ModalContent>
        </Modal>
      )}


      {/* 장소 추가 Drawer */}
      <Drawer $isOpen={showPlaceDrawer} onClick={() => setShowPlaceDrawer(false)}>
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <DrawerHandle />
          <DrawerTitle>장소 이름</DrawerTitle>
          <div
            style={{ marginBottom: "16px", color: "#777777", fontSize: "15px" }}
          >
            테마 (음식점, 관광명소, 쇼핑, 체험 등)
          </div>

          <DrawerOption onClick={() => addPlace("시간 추가")}>
            시간 추가
          </DrawerOption>

          <DrawerOption onClick={() => addPlace("비용 추가")}>
            비용 추가
          </DrawerOption>

          <DrawerOption onClick={() => addPlace("메모 추가")}>
            메모 추가
          </DrawerOption>
        </div>
      </Drawer>

      {/* 백그라운드 오버레이 */}
      {(showMemoModal || showPlaceDrawer) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
          onClick={() => {
            setShowMemoModal(false);
            setShowPlaceDrawer(false);
          }}
        />
      )}

      {/* 하단바 */}
      <Footer>
        <HoverIconButton path="/home" label="홈" off="/icons/home-off.png" on="/icons/home-on.png" />
        <HoverIconButton path="/my-trips" label="내 여행" off="/icons/trip-off.png" on="/icons/trip-on.png" active />
        <HoverIconButton path="/map" label="지도" off="/icons/map-off.png" on="/icons/map-on.png" />
        <HoverIconButton path="/account" label="가계부" off="/icons/money-off.png" on="/icons/money-on.png" />
        <HoverIconButton path="/my" label="MY" off="/icons/my-off.png" on="/icons/my-on.png" />
      </Footer>
    </App>
  );
};

// 아이콘 컴포넌트들
const NumberIcon = ({ children }: { children?: number }) => (
  <div style={{ 
    color: '#3CA6FF', 
    fontWeight: 'bold', 
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif'
  }}>
    {children || 1}
  </div>
);

const MemoDot = () => (
  <div style={{ 
    width: '20px', 
    height: '20px', 
    borderRadius: '50%', 
    backgroundColor: '#34C759',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }} />
);

export default TravelItineraryApp;