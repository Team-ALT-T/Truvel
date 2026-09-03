"use client";

import Image from "next/image";
import styled from "styled-components";
import type { SelectableCity } from "../types";

type CitySelectionListProps = {
  cities: SelectableCity[];
  selectedCityIds: Set<number>;
  onSelect: (city: SelectableCity) => void;
};

export default function CitySelectionList({
  cities,
  selectedCityIds,
  onSelect,
}: CitySelectionListProps) {
  return (
    <List>
      {cities.map((city) => (
        <Row key={city.cityId}>
          <Meta>
            <Thumb>
              <Image
                src={city.image || "/icons/blank.png"}
                alt={city.name}
                fill
                sizes="48px"
              />
            </Thumb>
            <Text>
              <Name>{city.name}</Name>
              {city.subtitle && <Subtitle>{city.subtitle}</Subtitle>}
            </Text>
          </Meta>
          <SelectButton
            type="button"
            onClick={() => onSelect(city)}
            $active={selectedCityIds.has(city.cityId)}
            aria-pressed={selectedCityIds.has(city.cityId)}
          >
            선택
          </SelectButton>
        </Row>
      ))}
    </List>
  );
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.25rem;
`;

const Meta = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const Thumb = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #eaeaea;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-size: 14px;
  color: #1c1c1c;
  font-weight: 700;
`;

const Subtitle = styled.div`
  font-size: 12px;
  color: #8b8b8b;
`;

const SelectButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 30px;
  background: ${({ $active }) => ($active ? "#E8F1FF" : "#f4f6f8")};
  color: #1c1c1c;
  border: 1px solid ${({ $active }) => ($active ? "#3CA6FF" : "#e6e6e6")};
  font-weight: 700;
  font-size: 12px;
  min-width: 64px;
`;
