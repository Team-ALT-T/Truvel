"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Map as MapIcon, Share, MoreVertical, ChevronLeft } from "lucide-react";
import Image from 'next/image';
import styled from 'styled-components';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTravelPlan, createDaySchedule, updateDaySchedule, type DayScheduleRequest } from '@/lib/api/travel';
import { getLocations, type LocationResponse } from '@/lib/api/location';

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

/** API 호출용: 해당 날짜의 daySchedule 메타 (메모 저장/수정 시 사용) */
interface DayScheduleMeta {
  dayScheduleId?: number;
  dateISO: string;
  startTime: string;
  finishTime: string;
  schedules: { locationName: string; scheduleOrder: number; preferTime: "Morning" | "Afternoon" | "Evening" | "Random" }[];
}

// Styled Components
const App = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f8f8f8;
  min-height: 100vh;
  max-width: 1400px;
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
  max-width: 1400px;
  font-size: 0.75rem;
  z-index: 20;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
`;

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

const TravelItineraryApp: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const travelPlanId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState<string>("전체 경로 최적화");
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [showPlaceDrawer, setShowPlaceDrawer] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [memoText, setMemoText] = useState("");
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [travelData, setTravelData] = useState<TravelData>({
    title: "",
    dates: "",
    days: [],
  });
  /** 각 Day별 API 메타 (dayScheduleId, dateISO, startTime, finishTime, schedules) - 메모 저장 시 사용 */
  const [dayScheduleMetaList, setDayScheduleMetaList] = useState<DayScheduleMeta[]>([]);
  const [isSavingMemo, setIsSavingMemo] = useState(false);

  // 여행 일정 API 연동
  useEffect(() => {
    if (!travelPlanId) {
      setIsLoading(false);
      setLoadError("여행 일정 ID가 없습니다.");
      return;
    }
    const id = Number(travelPlanId);
    if (Number.isNaN(id)) {
      setIsLoading(false);
      setLoadError("잘못된 여행 일정 ID입니다.");
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    Promise.all([getTravelPlan(id), getLocations(id)])
      .then(([plan, allLocations]) => {
        const locationMap = new Map<string, LocationResponse>();
        allLocations.forEach((loc) => locationMap.set(loc.place, loc));

        const title = `${plan.cityName} 여행`;
        const start = new Date(plan.startDate);
        const end = new Date(plan.endDate);
        const formatDate = (d: Date) =>
          `${String(d.getFullYear()).slice(2)}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
        const dates = `${formatDate(start)}~ ${formatDate(end)}`;

        // 여행 기간 전체(시작일~종료일) 기준으로 Day 구성 (1일이라도 메모 등 위해 표시)
        const planStart = new Date(plan.startDate);
        const planEnd = new Date(plan.endDate);
        planStart.setHours(0, 0, 0, 0);
        planEnd.setHours(0, 0, 0, 0);
        const dayCount = Math.max(1, Math.ceil((planEnd.getTime() - planStart.getTime()) / (24 * 60 * 60 * 1000)) + 1);

        const scheduleByDate = new Map<string, any>();
        (plan.daySchedules ?? []).forEach((ds: any) => {
          const d = new Date(ds.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          scheduleByDate.set(key, ds);
        });

        const days: DayPlan[] = [];
        const metaList: DayScheduleMeta[] = [];

        const toTimeStr = (t: any): string => {
          if (t == null) return "09:00:00";
          const s = String(t);
          if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) return s;
          if (/^\d{1,2}:\d{2}$/.test(s)) return `${s.padStart(5, "0")}:00`;
          return "09:00:00";
        };

        for (let i = 0; i < dayCount; i++) {
          const d = new Date(planStart);
          d.setDate(planStart.getDate() + i);
          d.setHours(0, 0, 0, 0);
          const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")} ${DAYS_KO[d.getDay()]}`;
          const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const ds = scheduleByDate.get(dateKey);

          const items: (Flight | Activity | Status | MemoItem)[] = [];
          let meta: DayScheduleMeta = {
            dateISO: dateKey,
            startTime: "09:00:00",
            finishTime: "18:00:00",
            schedules: [],
          };
          if (ds) {
            meta.dayScheduleId = ds.day_schedule_id ?? ds.dayScheduleId;
            meta.startTime = toTimeStr(ds.startTime);
            meta.finishTime = toTimeStr(ds.finishTime);
            if (ds.schedules && Array.isArray(ds.schedules)) {
              const preferTimes = ["Morning", "Afternoon", "Evening", "Random"] as const;
              meta.schedules = ds.schedules.map((s: any) => ({
                locationName: s.location?.place ?? s.location?.name ?? s.locationName ?? "",
                scheduleOrder: s.scheduleOrder ?? 0,
                preferTime: preferTimes.includes(s.preferTime) ? s.preferTime : "Random",
              }));
            }
          }
          metaList.push(meta);

          if (ds && ds.schedules && Array.isArray(ds.schedules)) {
            const schedules = [...ds.schedules].sort((a: any, b: any) => (a.scheduleOrder ?? 0) - (b.scheduleOrder ?? 0));
            schedules.forEach((s: any, idx: number) => {
              const loc = s.location && s.location.latitude != null
                ? s.location
                : (s.locationName ? locationMap.get(s.locationName) : null);
              const name = loc?.name ?? loc?.place ?? s.locationName ?? "장소";
              const theme = loc?.category ?? "관광명소";
              const address = loc?.address ?? "";
              items.push({
                id: `day-${i}-s-${idx}`,
                title: name,
                details: address ? `테마 (${theme}) · ${address}` : `테마 (${theme})`,
                type: "activity",
                color: "#8B9DC3",
                iconType: "number",
                number: idx + 1,
              });
            });
            if (ds.dayScheduleMemo && String(ds.dayScheduleMemo).trim()) {
              items.push({
                id: `day-${i}-memo`,
                text: ds.dayScheduleMemo,
                type: "memo",
              });
            }
          }

          days.push({
            date: dateStr,
            dayNumber: i + 1,
            items,
          });
        }

        setTravelData({
          title: title || "여행",
          dates: dates || "",
          days,
        });
        setDayScheduleMetaList(metaList);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("mytripdetail load error:", err);
        setLoadError("일정을 불러오는데 실패했습니다.");
        setIsLoading(false);
      });
  }, [travelPlanId]);

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

  const handleMapClick = () => {
    if (travelPlanId) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("currentTravelPlanId", travelPlanId);
      }
      router.push(`/my-trips/map?id=${travelPlanId}`);
    } else {
      router.push("/my-trips/map");
    }
  };

  const addPlace = (placeName: string) => {
    // 장소 추가 기능 비활성화 - 실제로는 아무것도 하지 않음
    console.log("장소 추가 기능이 비활성화되었습니다:", placeName);
    setShowPlaceDrawer(false);
  };

  /** 메모 저장/삭제 후 plan 다시 불러와서 화면 갱신 */
  const refetchPlanAndApply = useCallback(() => {
    if (!travelPlanId) return Promise.resolve();
    const id = Number(travelPlanId);
    if (Number.isNaN(id)) return Promise.resolve();
    return Promise.all([getTravelPlan(id), getLocations(id)])
      .then(([plan, allLocations]) => {
        const locationMap = new Map<string, LocationResponse>();
        allLocations.forEach((loc) => locationMap.set(loc.place, loc));
        const title = `${plan.cityName} 여행`;
        const start = new Date(plan.startDate);
        const end = new Date(plan.endDate);
        const formatDate = (d: Date) =>
          `${String(d.getFullYear()).slice(2)}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
        const dates = `${formatDate(start)}~ ${formatDate(end)}`;
        const planStart = new Date(plan.startDate);
        const planEnd = new Date(plan.endDate);
        planStart.setHours(0, 0, 0, 0);
        planEnd.setHours(0, 0, 0, 0);
        const dayCount = Math.max(1, Math.ceil((planEnd.getTime() - planStart.getTime()) / (24 * 60 * 60 * 1000)) + 1);
        const scheduleByDate = new Map<string, any>();
        (plan.daySchedules ?? []).forEach((ds: any) => {
          const d = new Date(ds.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          scheduleByDate.set(key, ds);
        });
        const days: DayPlan[] = [];
        const metaList: DayScheduleMeta[] = [];
        const toTimeStr = (t: any): string => {
          if (t == null) return "09:00:00";
          const s = String(t);
          if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) return s;
          if (/^\d{1,2}:\d{2}$/.test(s)) return `${s.padStart(5, "0")}:00`;
          return "09:00:00";
        };
        for (let i = 0; i < dayCount; i++) {
          const d = new Date(planStart);
          d.setDate(planStart.getDate() + i);
          d.setHours(0, 0, 0, 0);
          const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")} ${DAYS_KO[d.getDay()]}`;
          const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const ds = scheduleByDate.get(dateKey);
          const items: (Flight | Activity | Status | MemoItem)[] = [];
          let meta: DayScheduleMeta = { dateISO: dateKey, startTime: "09:00:00", finishTime: "18:00:00", schedules: [] };
          if (ds) {
            meta.dayScheduleId = ds.day_schedule_id ?? ds.dayScheduleId;
            meta.startTime = toTimeStr(ds.startTime);
            meta.finishTime = toTimeStr(ds.finishTime);
            if (ds.schedules && Array.isArray(ds.schedules)) {
              const preferTimes = ["Morning", "Afternoon", "Evening", "Random"] as const;
              meta.schedules = ds.schedules.map((s: any) => ({
                locationName: s.location?.place ?? s.location?.name ?? s.locationName ?? "",
                scheduleOrder: s.scheduleOrder ?? 0,
                preferTime: preferTimes.includes(s.preferTime) ? s.preferTime : "Random",
              }));
            }
          }
          metaList.push(meta);
          if (ds && ds.schedules && Array.isArray(ds.schedules)) {
            const schedules = [...ds.schedules].sort((a: any, b: any) => (a.scheduleOrder ?? 0) - (b.scheduleOrder ?? 0));
            schedules.forEach((s: any, idx: number) => {
              const loc = s.location && s.location.latitude != null ? s.location : (s.locationName ? locationMap.get(s.locationName) : null);
              const name = loc?.name ?? loc?.place ?? s.locationName ?? "장소";
              const theme = loc?.category ?? "관광명소";
              const address = loc?.address ?? "";
              items.push({
                id: `day-${i}-s-${idx}`,
                title: name,
                details: address ? `테마 (${theme}) · ${address}` : `테마 (${theme})`,
                type: "activity",
                color: "#8B9DC3",
                iconType: "number",
                number: idx + 1,
              });
            });
            if (ds.dayScheduleMemo && String(ds.dayScheduleMemo).trim()) {
              items.push({ id: `day-${i}-memo`, text: ds.dayScheduleMemo, type: "memo" });
            }
          }
          days.push({ date: dateStr, dayNumber: i + 1, items });
        }
        setTravelData({ title: title || "여행", dates: dates || "", days });
        setDayScheduleMetaList(metaList);
      });
  }, [travelPlanId]);

  const saveMemo = async () => {
    const text = memoText.trim();
    if (!text) return;
    const id = Number(travelPlanId);
    if (Number.isNaN(id) || !travelPlanId) return;
    const meta = dayScheduleMetaList[currentDayIndex];
    if (!meta) return;

    setIsSavingMemo(true);
    const request: DayScheduleRequest = {
      date: meta.dateISO,
      startTime: meta.startTime,
      finishTime: meta.finishTime,
      dayScheduleMemo: text,
      schedules: meta.schedules,
    };

    try {
      if (meta.dayScheduleId != null) {
        await updateDaySchedule(meta.dayScheduleId, request);
      } else {
        await createDaySchedule(id, request);
      }
      await refetchPlanAndApply();
      setMemoText("");
      setEditingMemoId(null);
      setShowMemoModal(false);
    } catch (err) {
      console.error("메모 저장 실패:", err);
    } finally {
      setIsSavingMemo(false);
    }
  };

  const deleteMemo = async () => {
    const id = Number(travelPlanId);
    if (Number.isNaN(id) || !travelPlanId) return;
    const meta = dayScheduleMetaList[currentDayIndex];
    if (!meta || meta.dayScheduleId == null) {
      setTravelData((prev) => ({
        ...prev,
        days: prev.days.map((day, index) =>
          index === currentDayIndex ? { ...day, items: day.items.filter((item) => item.type !== "memo") } : day
        ),
      }));
      setMemoText("");
      setEditingMemoId(null);
      setShowMemoModal(false);
      return;
    }

    setIsSavingMemo(true);
    const request: DayScheduleRequest = {
      date: meta.dateISO,
      startTime: meta.startTime,
      finishTime: meta.finishTime,
      dayScheduleMemo: "",
      schedules: meta.schedules,
    };

    try {
      await updateDaySchedule(meta.dayScheduleId, request);
      await refetchPlanAndApply();
      setMemoText("");
      setEditingMemoId(null);
      setShowMemoModal(false);
    } catch (err) {
      console.error("메모 삭제 실패:", err);
    } finally {
      setIsSavingMemo(false);
    }
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

  if (isLoading) {
    return (
      <App>
        <Header>
          <Title>일정 불러오는 중...</Title>
        </Header>
        <Content style={{ padding: "40px 20px", textAlign: "center", color: "#777" }}>
          여행 일정을 불러오는 중입니다.
        </Content>
      </App>
    );
  }

  if (loadError) {
    return (
      <App>
        <Header>
          <Title>일정 조회</Title>
        </Header>
        <Content style={{ padding: "40px 20px", textAlign: "center", color: "#777" }}>
          <p style={{ marginBottom: "16px" }}>{loadError}</p>
          <ActionButton onClick={() => router.push("/my-trips")}>내 여행으로</ActionButton>
        </Content>
      </App>
    );
  }

  return (
    <App>
      {/* Header */}
      <Header>
        <HeaderTop>
          <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, marginRight: 8, flexShrink: 0 }}
              aria-label="뒤로 가기"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <Title style={{ margin: 0 }}>{travelData.title}</Title>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleMapClick}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              aria-label="지도 보기"
            >
              <MapIcon className="w-6 h-6 text-gray-600" />
            </button>
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
            onClick={() => travelPlanId && router.push(`/mytripdetail/invite?id=${travelPlanId}`)}
          >
            + 일행 추가
          </Tab>
        </TabContainer>
      </Header>

      {/* Map Placeholder - 클릭 시 my-trips/map으로 이동 */}
      <MapPlaceholder
        onClick={handleMapClick}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleMapClick()}
      >
        지도 (클릭 시 경로 지도 보기)
      </MapPlaceholder>

      {/* Content */}
      <Content>
        {/* Daily Itinerary */}
        {travelData.days.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#777" }}>
            등록된 일정이 없습니다.
          </div>
        ) : (
        travelData.days.map((day, dayIndex) => (
          <DaySection key={day.dayNumber}>
            <DayHeader>
              <DayTitle>
                Day {day.dayNumber} {day.date}
              </DayTitle>
              <EditButton>편집하기</EditButton>
            </DayHeader>

            {day.items.length === 0 ? (
              <div style={{ padding: "16px 0", color: "#999", fontSize: "14px" }}>
                이 날짜에 등록된 일정이 없습니다.
              </div>
            ) : (
              day.items.map((item) => renderTimelineItem(item, dayIndex))
            )}

            <ActionButtons>
              <ActionButton onClick={() => handleAddMemo(dayIndex)}>
                메모 추가
              </ActionButton>
              <ActionButton onClick={() => handleAddPlace(dayIndex)}>
                장소 추가
              </ActionButton>
            </ActionButtons>
          </DaySection>
        ))
        )}
      </Content>

      {/* 메모 추가 모달 */}
      {showMemoModal && (
        <Modal onClick={() => setShowMemoModal(false)}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>메모</ModalTitle>
              <div>
                <ConfirmButton onClick={saveMemo} disabled={isSavingMemo}>
                  {isSavingMemo ? "저장 중..." : "확인"}
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