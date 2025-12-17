import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background-color: white;
  min-height: 100vh;
  position: relative;

  @media (min-width: 768px) {
    max-width: 600px;
  }

  @media (min-width: 1024px) {
    max-width: 700px;
  }

  @media (min-width: 1440px) {
    max-width: 800px;
  }
`;

export const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;

  @media (min-width: 768px) {
    padding: 1.5rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 1.5rem 2.5rem;
  }
`;

export const BackButton = styled.button`
  padding: 0.5rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    background-color: #f3f4f6;
  }
`;

export const Title = styled.h1`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1.25rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.5rem;
  }
`;

export const Spacer = styled.div`
  width: 2.5rem;
`;

export const ScrollableArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 6rem;
`;

export const CalendarContainer = styled.div`
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;

  @media (min-width: 768px) {
    padding: 2rem;
    gap: 2rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    padding: 2.5rem 3rem;
    gap: 2.5rem;
  }

  @media (min-width: 1440px) {
    padding: 3rem 4rem;
    gap: 3rem;
  }
`;

export const MonthSection = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const MonthTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    margin: 0 0 1.25rem 0;
  }

  @media (min-width: 1024px) {
    font-size: 1.5rem;
    margin: 0 0 1.5rem 0;
  }
`;

export const SelectableBadge = styled.span`
  font-size: 0.75rem;
  background-color: #dbeafe;
  color: #2563eb;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-weight: 500;
`;

export const WeekDaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  padding: 0 0.25rem;
  margin-bottom: 0.5rem;

  @media (min-width: 768px) {
    gap: 0.75rem;
    padding: 0 0.5rem;
    margin-bottom: 0.75rem;
  }

  @media (min-width: 1024px) {
    gap: 1rem;
    padding: 0 0.75rem;
    margin-bottom: 1rem;
  }
`;

export const WeekDayCell = styled.div`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WeekDayText = styled.span<{ $dayIndex: number }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ $dayIndex }) =>
    $dayIndex === 0 ? "#ef4444" : $dayIndex === 6 ? "#3b82f6" : "#6b7280"};

  @media (min-width: 768px) {
    font-size: 0.95rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.05rem;
    font-weight: 600;
  }
`;

export const DatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  padding: 0 0.25rem;

  @media (min-width: 768px) {
    gap: 0.75rem;
    padding: 0 0.5rem;
  }

  @media (min-width: 1024px) {
    gap: 1rem;
    padding: 0 0.75rem;
  }
`;

export const EmptyCell = styled.div`
  aspect-ratio: 1;
`;

export const DateButtonStyled = styled.button<{
  $isSelected: boolean;
  $isWeekend: boolean;
  $isSelectable: boolean;
}>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
  border: none;
  background: ${({ $isSelected }) => ($isSelected ? "#3CA6FF" : "transparent")};
  color: ${({ $isSelected, $isWeekend, $isSelectable }) =>
    $isSelected
      ? "white"
      : $isWeekend && $isSelectable
      ? "#ef4444"
      : $isSelectable
      ? "#111827"
      : "#9ca3af"};
  border-radius: ${({ $isSelected }) => ($isSelected ? "50%" : "0.5rem")};
  cursor: ${({ $isSelectable }) => ($isSelectable ? "pointer" : "default")};
  opacity: ${({ $isSelectable }) => ($isSelectable ? 1 : 0.5)};
  transform: ${({ $isSelected }) => ($isSelected ? "scale(1.05)" : "scale(1)")};
  box-shadow: ${({ $isSelected }) =>
    $isSelected ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "none"};

  @media (min-width: 768px) {
    font-size: 0.95rem;
    font-weight: 500;
  }

  @media (min-width: 1024px) {
    font-size: 1.05rem;
    font-weight: 600;
    border-radius: ${({ $isSelected }) => ($isSelected ? "50%" : "0.75rem")};
  }

  &:hover {
    background-color: ${({ $isSelected, $isWeekend, $isSelectable }) =>
      $isSelected
        ? "#3CA6FF"
        : $isWeekend && $isSelectable
        ? "#fef2f2"
        : $isSelectable
        ? "#eff6ff"
        : "transparent"};
    box-shadow: ${({ $isSelectable }) =>
      $isSelectable ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none"};
    transform: ${({ $isSelected, $isSelectable }) =>
      $isSelected ? "scale(1.05)" : $isSelectable ? "scale(1.08)" : "scale(1)"};
  }

  &:disabled {
    cursor: default;
  }
`;

export const DateNumber = styled.span`
  position: relative;
  z-index: 10;
`;

export const PulseEffect = styled.div`
  position: absolute;
  inset: 0;
  background-color: #3ca6ff;
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.2;
    }
    50% {
      opacity: 0.1;
    }
  }
`;

export const BottomFixedContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  padding: 1rem 1.25rem;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    max-width: 600px;
    padding: 1.5rem 2rem;
  }

  @media (min-width: 1024px) {
    max-width: 700px;
    padding: 1.5rem 2.5rem;
  }

  @media (min-width: 1440px) {
    max-width: 800px;
    padding: 2rem 3rem;
  }
`;

export const CompleteButton = styled.button<{ $hasSelections: boolean }>`
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
  border: none;
  cursor: ${({ $hasSelections }) =>
    $hasSelections ? "pointer" : "not-allowed"};
  background-color: ${({ $hasSelections }) =>
    $hasSelections ? "#3CA6FF" : "#e5e7eb"};
  color: ${({ $hasSelections }) => ($hasSelections ? "white" : "#9ca3af")};
  box-shadow: ${({ $hasSelections }) =>
    $hasSelections ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "none"};

  @media (min-width: 768px) {
    font-size: 1.125rem;
    padding: 1.25rem 2rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.25rem;
    padding: 1.5rem 2.5rem;
    border-radius: 1rem;
  }

  &:hover {
    background-color: ${({ $hasSelections }) =>
      $hasSelections ? "#2b8fd9" : "#e5e7eb"};
    transform: ${({ $hasSelections }) =>
      $hasSelections ? "translateY(-2px)" : "none"};
  }

  &:active {
    background-color: ${({ $hasSelections }) =>
      $hasSelections ? "#2377bd" : "#e5e7eb"};
    transform: ${({ $hasSelections }) =>
      $hasSelections ? "translateY(0)" : "none"};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export default {
  Container,
  Header,
  HeaderContent,
  BackButton,
  Title,
  Spacer,
  ScrollableArea,
  CalendarContainer,
  MonthSection,
  MonthHeader,
  MonthTitle,
  SelectableBadge,
  WeekDaysGrid,
  WeekDayCell,
  WeekDayText,
  DatesGrid,
  EmptyCell,
  DateButtonStyled,
  DateNumber,
  PulseEffect,
  BottomFixedContainer,
  CompleteButton,
};
