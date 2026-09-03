"use client";

import Image from "next/image";
import styled from "styled-components";
import type { SelectableCity } from "../types";

type SelectedCitiesActionProps = {
  cities: SelectableCity[];
  onToggle: (city: SelectableCity) => void;
  onClear: () => void;
  onComplete: () => void;
};

export default function SelectedCitiesAction({
  cities,
  onToggle,
  onClear,
  onComplete,
}: SelectedCitiesActionProps) {
  if (cities.length === 0) return null;

  return (
    <Container>
      <SelectedList>
        {cities.map((city) => (
          <SelectedItem key={city.cityId}>
            <Thumbnail>
              <Image
                src={city.image || "/icons/blank.png"}
                alt={city.name}
                fill
                sizes="36px"
              />
            </Thumbnail>
            <Label>{city.name}</Label>
            <RemoveButton
              type="button"
              onClick={() => onToggle(city)}
              aria-label={`${city.name} 선택 해제`}
            >
              ✕
            </RemoveButton>
          </SelectedItem>
        ))}
        <EditButton type="button" onClick={onClear}>
          편집
        </EditButton>
      </SelectedList>
      <CompleteButton type="button" onClick={onComplete}>
        선택 완료
      </CompleteButton>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #e9ecef;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.08);
`;

const SelectedList = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 11px;
  margin-bottom: 11px;
`;

const SelectedItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  flex-shrink: 0;
  padding-top: 5px;
`;

const Thumbnail = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Label = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-align: center;
  white-space: nowrap;
`;

const CompleteButton = styled.button`
  width: 100%;
  max-width: 560px;
  padding: 18px 0;
  background: #3ca6ff;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  margin: 11px auto 0;
  display: block;

  &:hover {
    background: #3295e6;
  }
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
`;

const EditButton = styled.button`
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
`;
