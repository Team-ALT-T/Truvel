"use client";

import styled from "styled-components";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type Day = {
  date: Date;
  startAm: boolean;
  startHour: number;
  startMin: number;
  endAm: boolean;
  endHour: number;
  endMin: number;
};

const weekdaysKo = ["일", "월", "화", "수", "목", "금", "토"] as const;
function formatDayLabel(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const weekday = weekdaysKo[date.getDay()];
  return `${mm}.${dd} ${weekday}`;
}

const Page = styled.div`
  min-height: 100vh;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const HeaderInner = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackBtn = styled.button`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 0;
  border: 0;
  background: transparent;
`;


const Title = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1c1c1c;
`;

const Content = styled.div`
  flex: 1;
  padding: 12px 12px 88px;
`;

const DayCard = styled.section`
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 0 #eee;
  & + & { margin-top: 12px; }
`;

const DayTitle = styled.div`
  color: #777777;
  font-size: 12px;
  margin-bottom: 8px;
`;

const FieldTitle = styled.div`
  font-size: 12px;
  color: #1C1C1C;
  margin: 8px 0 10px;
`;



const TimeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const InputGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const ToggleGroup = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const Toggle = styled.button<{$active?: boolean}>`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${p => (p.$active ? "#777777" : "#eeeeee")};
  background: ${p => (p.$active ? "#777777" : "#ffffff")};
  color: ${p => (p.$active ? "#ffffff" : "#1C1C1C")};
  font-weight: 600;
`;

const TimeInput = styled.input`
  height: 48px;
  width: 72px;
  padding: 0 12px;
  text-align: center;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fff;
  font-weight: 700;
  font-size: 16px;
  outline: none;
  
`;

const Colon = styled.div`
  font-weight: 700;
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 15px 12px 20px;
  border-top: 1px solid #eee;
`;

const NextButton = styled.button`
  width: 100%;
  height: 56px;
  background: #6ea8ff;
  color: #fff;
  border: 0;
  border-radius: 12px;
  font-weight: 700;
`;

function DayBlock({ index, day, onChange }: { index: number; day: Day; onChange: (next: Day) => void }) {
  const startAm = day.startAm;
  const endAm = day.endAm;
  const [startHourStr, setStartHourStr] = React.useState<string>(String(day.startHour).padStart(2, "0"));
  const [startMinStr, setStartMinStr] = React.useState<string>(String(day.startMin).padStart(2, "0"));
  const [endHourStr, setEndHourStr] = React.useState<string>(String(day.endHour).padStart(2, "0"));
  const [endMinStr, setEndMinStr] = React.useState<string>(String(day.endMin).padStart(2, "0"));
  React.useEffect(() => {
    setStartHourStr(String(day.startHour).padStart(2, "0"));
    setStartMinStr(String(day.startMin).padStart(2, "0"));
    setEndHourStr(String(day.endHour).padStart(2, "0"));
    setEndMinStr(String(day.endMin).padStart(2, "0"));
  }, [day.startHour, day.startMin, day.endHour, day.endMin]);
  const toDigits = (v: string) => v.replace(/[^0-9]/g, "");
  const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
  const pad2 = (v: number) => v.toString().padStart(2, "0");
  
  return (
    <DayCard>
      <DayTitle>{`Day ${index} ${formatDayLabel(day.date)}`}</DayTitle>
      <FieldTitle>여행 출발 시간</FieldTitle>
      <TimeRow>
        <ToggleGroup>
          <Toggle $active={startAm} onClick={() => onChange({ ...day, startAm: true })}>AM</Toggle>
          <Toggle $active={!startAm} onClick={() => onChange({ ...day, startAm: false })}>PM</Toggle>
        </ToggleGroup>
        <InputGroup>
          <TimeInput
            inputMode="numeric"
            maxLength={2}
            value={startHourStr}
            onChange={(e) => setStartHourStr(toDigits(e.target.value).slice(0, 2))}
            onBlur={(e) => {
              const n = Number(toDigits(e.target.value || "0"));
              const clamped = clamp(n, 1, 24);
              onChange({ ...day, startHour: clamped });
              setStartHourStr(pad2(clamped));
            }}
          />
          <Colon>:</Colon>
          <TimeInput
            inputMode="numeric"
            maxLength={2}
            value={startMinStr}
            onChange={(e) => setStartMinStr(toDigits(e.target.value).slice(0, 2))}
            onBlur={(e) => {
              const n = Number(toDigits(e.target.value || "0"));
              const clamped = clamp(n, 0, 59);
              onChange({ ...day, startMin: clamped });
              setStartMinStr(pad2(clamped));
            }}
          />
        </InputGroup>
      </TimeRow>

      <FieldTitle>여행 도착 시간</FieldTitle>
      <TimeRow>
        <ToggleGroup>
          <Toggle $active={endAm} onClick={() => onChange({ ...day, endAm: true })}>AM</Toggle>
          <Toggle $active={!endAm} onClick={() => onChange({ ...day, endAm: false })}>PM</Toggle>
        </ToggleGroup>
        <InputGroup>
          <TimeInput
            inputMode="numeric"
            maxLength={2}
            value={endHourStr}
            onChange={(e) => setEndHourStr(toDigits(e.target.value).slice(0, 2))}
            onBlur={(e) => {
              const n = Number(toDigits(e.target.value || "0"));
              const clamped = clamp(n, 1, 24);
              onChange({ ...day, endHour: clamped });
              setEndHourStr(pad2(clamped));
            }}
          />
          <Colon>:</Colon>
          <TimeInput
            inputMode="numeric"
            maxLength={2}
            value={endMinStr}
            onChange={(e) => setEndMinStr(toDigits(e.target.value).slice(0, 2))}
            onBlur={(e) => {
              const n = Number(toDigits(e.target.value || "0"));
              const clamped = clamp(n, 0, 59);
              onChange({ ...day, endMin: clamped });
              setEndMinStr(pad2(clamped));
            }}
          />
        </InputGroup>
      </TimeRow>
    </DayCard>
  );
}

export default function RouteOptimizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // schedule에서 선택한 날짜 읽어오기
  const initialDays = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const selectedDatesStr = localStorage.getItem('selectedTravelDates');
      if (selectedDatesStr) {
        const selectedDates: string[] = JSON.parse(selectedDatesStr);
        
        // 문자열을 Date 객체로 변환하고 정렬
        const dates = selectedDates
          .map(dateStr => new Date(dateStr))
          .filter(date => !isNaN(date.getTime()))
          .sort((a, b) => a.getTime() - b.getTime());

        if (dates.length > 0) {
          return dates.map((date) => ({
            date: date,
            startAm: true,
            startHour: 9,
            startMin: 0,
            endAm: false,
            endHour: 6,
            endMin: 0,
          } as Day));
        }
      }
    } catch (error) {
      console.error('Failed to parse selected dates:', error);
    }

    // 날짜가 없으면 기본값 (3일)
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 3 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        date: d,
        startAm: true,
        startHour: 9,
        startMin: 0,
        endAm: false,
        endHour: 6,
        endMin: 0,
      } as Day;
    });
  }, []);

  const [days, setDays] = React.useState<Day[]>(initialDays);
  return (
    <Page>
      <Header>
        <HeaderInner>
          <BackBtn onClick={() => router.back()} aria-label="뒤로">
          
              <Image src="/icons/Larrow.png" alt="back" width={18} height={18} />
            
          </BackBtn>
          <Title>전체 경로 최적화</Title>
        </HeaderInner>
      </Header>
      <Content>
        {days.map((day, idx) => (
          <DayBlock
            key={idx}
            index={idx + 1}
            day={day}
            onChange={(next) =>
              setDays((prev) => prev.map((p, i) => (i === idx ? next : p)))
            }
          />
        ))}
      </Content>
      <Footer>
        <NextButton onClick={() => router.push('/optimize/places')}>다음</NextButton>
      </Footer>
    </Page>
  );
}


