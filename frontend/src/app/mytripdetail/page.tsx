"use client";

import React, { useState } from "react";
import { Map, Share, MoreVertical, Plane, Info, X } from "lucide-react";
import * as S from "./styles";

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

const TravelItineraryApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("전체 경로 최적화");
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [showPlaceDrawer, setShowPlaceDrawer] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [memoText, setMemoText] = useState("");
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
          },
          {
            id: "3",
            text: "메모 내용만 있을 땐 최대 3줄 보이도록",
            type: "status",
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
          },
          {
            id: "5",
            title: "장소 이름",
            details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
            type: "activity",
            color: "#E67E22",
          },
          {
            id: "6",
            text: "메모 내용만 있을 땐 최대 3줄 보이도록",
            type: "status",
          },
        ],
      },
    ],
  });

  const handleAddMemo = (dayIndex: number) => {
    setCurrentDayIndex(dayIndex);
    setShowMemoModal(true);
  };

  const handleAddPlace = (dayIndex: number) => {
    setCurrentDayIndex(dayIndex);
    setShowPlaceDrawer(true);
  };

  const saveMemo = () => {
    if (memoText.trim()) {
      const newMemo: MemoItem = {
        id: Date.now().toString(),
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

      setMemoText("");
      setShowMemoModal(false);
    }
  };

  const addPlace = (placeName: string) => {
    const newPlace: Activity = {
      id: Date.now().toString(),
      title: placeName,
      details: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
      type: "activity",
      color: "#8B9DC3",
    };

    setTravelData((prev) => ({
      ...prev,
      days: prev.days.map((day, index) =>
        index === currentDayIndex
          ? { ...day, items: [...day.items, newPlace] }
          : day
      ),
    }));

    setShowPlaceDrawer(false);
  };

  const getIcon = (item: Flight | Activity | Status | MemoItem) => {
    if (item.type === "flight") {
      return <Plane className="w-5 h-5 text-white" />;
    }
    if (item.type === "activity") {
      return <Info className="w-5 h-5 text-white" />;
    }

    if (item.type === "status") {
      return <div className="w-5 h-5 text-white" />;
    }
    return null;
  };

  const getIconColor = (item: Flight | Activity | Status): string => {
    if (item.type === "flight") return "#007AFF";
    if (item.type === "activity") return (item as Activity).color;
    if (item.type === "status") return "#34C759";
    return "#34C759";
  };

  const renderTimelineItem = (item: Flight | Activity | Status | MemoItem) => {
    if (item.type === "memo") {
      return (
        <S.MemoBox key={item.id}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#000" }}>
              메모
            </span>
            <span
              style={{ fontSize: "14px", color: "#007AFF", cursor: "pointer" }}
            >
              삭제
            </span>
          </div>
          <S.MemoContent>{(item as MemoItem).text}</S.MemoContent>
        </S.MemoBox>
      );
    }

    return (
      <S.TimelineItem key={item.id}>
        <S.TimelineIcon color={getIconColor(item)}>
          {getIcon(item)}
        </S.TimelineIcon>
        <S.TimelineContent>
          {item.type === "flight" ? (
            <S.Container>
              <S.FlightHeader>
                <S.FlightRoute>
                  {(item as Flight).departure}{" "}
                  {(item as Flight).time.split(" - ")[1]
                    ? `- ${(item as Flight).arrival} ${
                        (item as Flight).time.split(" - ")[1]
                      }`
                    : `11:00 - ${(item as Flight).arrival} 15:00`}
                </S.FlightRoute>
              </S.FlightHeader>

              <S.FlightDetails>{(item as Flight).airport}</S.FlightDetails>
              <S.FlightDetails>{(item as Flight).details}</S.FlightDetails>
            </S.Container>
          ) : item.type === "activity" ? (
            <>
              <S.Container>
                <S.ActivityTitle>{(item as Activity).title}</S.ActivityTitle>
                <S.ActivityDetails>
                  {(item as Activity).details}
                </S.ActivityDetails>
              </S.Container>
            </>
          ) : (
            <>
              <S.Container>
                <span>{(item as Status).text}</span>
              </S.Container>
            </>
          )}
        </S.TimelineContent>
      </S.TimelineItem>
    );
  };

  return (
    <S.App>
      {/* Header */}
      <S.Header>
        <S.HeaderTop>
          <S.Title>{travelData.title}</S.Title>
          <div style={{ display: "flex", gap: "16px" }}>
            <Map className="w-6 h-6 text-gray-600" />
            <Share className="w-6 h-6 text-gray-600" />
            <MoreVertical className="w-6 h-6 text-gray-600" />
          </div>
        </S.HeaderTop>

        <S.Subtitle>{travelData.dates}</S.Subtitle>

        <S.TabContainer>
          <S.Tab
            active={activeTab === "전체 경로 최적화"}
            onClick={() => setActiveTab("전체 경로 최적화")}
          >
            전체 경로 최적화
          </S.Tab>
          <S.Tab
            active={activeTab === "가계부"}
            onClick={() => setActiveTab("가계부")}
          >
            가계부
          </S.Tab>
          <S.Tab
            active={activeTab === "일행 추가"}
            onClick={() => setActiveTab("일행 추가")}
          >
            + 일행 추가
          </S.Tab>
        </S.TabContainer>
      </S.Header>

      {/* Map Placeholder */}
      <S.MapPlaceholder>지도</S.MapPlaceholder>

      {/* Content */}
      <S.Content>
        {/* Daily Itinerary */}
        {travelData.days.map((day, dayIndex) => (
          <S.DaySection key={day.dayNumber}>
            <S.DayHeader>
              <S.DayTitle>
                Day {day.dayNumber} {day.date}
              </S.DayTitle>
              <S.EditButton>편집하기</S.EditButton>
            </S.DayHeader>

            {day.items.map(renderTimelineItem)}

            <S.ActionButtons>
              <S.ActionButton onClick={() => handleAddMemo(dayIndex)}>
                메모 추가
              </S.ActionButton>
              <S.ActionButton onClick={() => handleAddPlace(dayIndex)}>
                장소 추가
              </S.ActionButton>
            </S.ActionButtons>
          </S.DaySection>
        ))}
      </S.Content>

      {/* 메모 추가 모달 */}
      {showMemoModal && (
        <S.Modal onClick={() => setShowMemoModal(false)}>
          <S.ModalContent onClick={(e: any) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>메모</S.ModalTitle>
              <S.CloseButton onClick={() => setShowMemoModal(false)}>
                <X className="w-5 h-5" />
              </S.CloseButton>
            </S.ModalHeader>
            <S.TextArea
              placeholder="메모내용"
              value={memoText}
              onChange={(e: any) => setMemoText(e.target.value)}
            />
            <S.ModalButton onClick={saveMemo}>추가</S.ModalButton>
          </S.ModalContent>
        </S.Modal>
      )}

      {/* 장소 추가 Drawer */}
      <S.Drawer isOpen={showPlaceDrawer}>
        <div onClick={() => setShowPlaceDrawer(false)}>
          <S.DrawerHandle />
          <S.DrawerTitle>장소 이름</S.DrawerTitle>
          <div
            style={{ marginBottom: "16px", color: "#666", fontSize: "15px" }}
          >
            테마 (음식점, 관광명소, 쇼핑, 체험 등)
          </div>

          <S.DrawerOption onClick={() => addPlace("시간 추가")}>
            시간 추가
          </S.DrawerOption>

          <S.DrawerOption onClick={() => addPlace("비용 추가")}>
            비용 추가
          </S.DrawerOption>

          <S.DrawerOption onClick={() => addPlace("메모 추가")}>
            메모 추가
          </S.DrawerOption>
        </div>
      </S.Drawer>

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
    </S.App>
  );
};

export default TravelItineraryApp;
