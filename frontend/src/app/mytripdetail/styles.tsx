import React from "react";

// styles.tsx
export const App = ({ children, ...props }: any) => (
  <div
    style={{
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: "#f8f8f8",
      minHeight: "100vh",
      maxWidth: "400px",
      margin: "0 auto",
      position: "relative" as const,
    }}
    {...props}
  >
    {children}
  </div>
);

export const Header = ({ children, ...props }: any) => (
  <div
    style={{
      backgroundColor: "#fff",
      padding: "16px 20px 20px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const HeaderTop = ({ children, ...props }: any) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const Title = ({ children, ...props }: any) => (
  <h1
    style={{
      fontSize: "20px",
      fontWeight: "semibold",
      color: "#000",
      margin: 0,
    }}
    {...props}
  >
    {children}
  </h1>
);

export const Subtitle = ({ children, ...props }: any) => (
  <p
    style={{
      fontSize: "16px",
      color: "#888",
      margin: "12px 0 10px 0",
    }}
    {...props}
  >
    {children}
  </p>
);

export const TabContainer = ({ children, ...props }: any) => (
  <div
    style={{
      display: "flex",
      gap: "8px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const Tab = ({
  active,
  children,
  onClick,
  ...props
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    style={{
      padding: "10px 18px",
      borderRadius: "20px",
      border: "none",
      fontSize: "15px",
      fontWeight: 500,
      cursor: "pointer",
      backgroundColor: active ? "#3CA6FF" : "#f0f0f0",
      color: active ? "#fff" : "#666",
    }}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

export const MapPlaceholder = ({ children, ...props }: any) => (
  <div
    style={{
      backgroundColor: "#e8e8e8",
      height: "200px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#666",
      fontSize: "16px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const Content = ({ children, ...props }: any) => (
  <div
    style={{
      backgroundColor: "#fff",
      padding: "20px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const DaySection = ({ children, ...props }: any) => (
  <div
    style={{
      marginBottom: "40px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const DayHeader = ({ children, ...props }: any) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const DayTitle = ({ children, ...props }: any) => (
  <h3
    style={{
      fontSize: "12px",
      fontWeight: 600,
      color: "#666",
      margin: 0,
    }}
    {...props}
  >
    {children}
  </h3>
);

export const EditButton = ({ children, ...props }: any) => (
  <button
    style={{
      fontSize: "14px",
      color: "#777777",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
    }}
    {...props}
  >
    {children}
  </button>
);

export const TimelineItem = ({ children, ...props }: any) => (
  <div
    style={{
      display: "flex",
      marginBottom: "24px",
      position: "relative" as const,
    }}
    {...props}
  >
    {children}
  </div>
);

export const TimelineIcon = ({
  color,
  children,
  ...props
}: {
  color: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      backgroundColor: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "16px",
      flexShrink: 0,
      marginTop: "2px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const TimelineContent = ({ children, ...props }: any) => (
  <div
    style={{
      flex: 1,
    }}
    {...props}
  >
    {children}
  </div>
);

export const Container = ({ children, ...props }: any) => (
  <div
    style={{
      display: "flex",
      width: "100%",
      height: "110px",
      flexDirection: "column",
      border: "1px solid #f2f2f2",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 1px 3px rgba(53, 53, 53, 0.1)",
      marginBottom: "4px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const FlightHeader = ({ children, ...props }: any) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const FlightRoute = ({ children, ...props }: any) => (
  <span
    style={{
      fontSize: "18px",
      fontWeight: 600,
      color: "#000",
    }}
    {...props}
  >
    {children}
  </span>
);

export const FlightDetails = ({ children, ...props }: any) => (
  <div
    style={{
      fontSize: "15px",
      color: "#666",
      marginBottom: "4px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const ActivityTitle = ({ children, ...props }: any) => (
  <div
    style={{
      fontSize: "18px",
      fontWeight: 600,
      color: "#000",
      marginBottom: "4px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const ActivityDetails = ({ children, ...props }: any) => (
  <div
    style={{
      fontSize: "15px",
      color: "#666",
    }}
    {...props}
  >
    {children}
  </div>
);

export const StatusIndicator = ({ children, ...props }: any) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "15px",
      color: "#000",
      marginTop: "16px",
      marginBottom: "16px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const StatusDot = ({ children, ...props }: any) => (
  <div
    style={{
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      backgroundColor: "#34C759",
      flexShrink: 0,
    }}
    {...props}
  >
    {children}
  </div>
);

export const MemoBox = ({ children, ...props }: any) => (
  <div
    style={{
      border: "2px dashed #ccc",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "20px",
      backgroundColor: "#fff",
      minHeight: "80px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const MemoContent = ({ children, ...props }: any) => (
  <div
    style={{
      fontSize: "15px",
      color: "#000",
      lineHeight: "1.5",
    }}
    {...props}
  >
    {children}
  </div>
);

export const ActionButtons = ({ children, ...props }: any) => (
  <div
    style={{
      display: "flex",
      gap: "12px",
      marginTop: "20px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const ActionButton = ({ children, ...props }: any) => (
  <button
    style={{
      flex: 1,
      padding: "14px",
      borderRadius: "12px",
      border: "none",
      fontSize: "16px",
      fontWeight: 500,
      backgroundColor: "#f0f0f0",
      color: "#666",
      cursor: "pointer",
    }}
    {...props}
  >
    {children}
  </button>
);

// 모달 관련 스타일
export const Modal = ({ children, ...props }: any) => (
  <div
    style={{
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
    {...props}
  >
    {children}
  </div>
);

export const ModalContent = ({ children, ...props }: any) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: "16px",
      padding: "20px",
      width: "320px",
      maxWidth: "90vw",
    }}
    {...props}
  >
    {children}
  </div>
);

export const ModalHeader = ({ children, ...props }: any) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const ModalTitle = ({ children, ...props }: any) => (
  <h3
    style={{
      fontSize: "18px",
      fontWeight: 600,
      color: "#000",
      margin: 0,
    }}
    {...props}
  >
    {children}
  </h3>
);

export const CloseButton = ({ children, ...props }: any) => (
  <button
    style={{
      background: "none",
      border: "none",
      fontSize: "18px",
      cursor: "pointer",
      color: "#666",
    }}
    {...props}
  >
    {children}
  </button>
);

export const TextArea = ({ ...props }: any) => (
  <textarea
    style={{
      width: "100%",
      height: "120px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "15px",
      resize: "none" as const,
      outline: "none",
      fontFamily: "inherit",
    }}
    {...props}
  />
);

export const ModalButton = ({ children, ...props }: any) => (
  <button
    style={{
      width: "100%",
      padding: "12px",
      backgroundColor: "#007AFF",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: 500,
      cursor: "pointer",
      marginTop: "16px",
    }}
    {...props}
  >
    {children}
  </button>
);

// Drawer 관련 스타일
export const Drawer = ({
  isOpen,
  children,
  ...props
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) => (
  <div
    style={{
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      zIndex: 1000,
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? "visible" : "hidden",
      transition: "opacity 0.3s ease, visibility 0.3s ease",
    }}
    {...props}
  >
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: "16px 16px 0 0",
        padding: "20px",
        transform: isOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease",
      }}
    >
      {children}
    </div>
  </div>
);

export const DrawerHandle = ({ children, ...props }: any) => (
  <div
    style={{
      width: "40px",
      height: "4px",
      backgroundColor: "#ddd",
      borderRadius: "2px",
      margin: "0 auto 20px",
    }}
    {...props}
  >
    {children}
  </div>
);

export const DrawerTitle = ({ children, ...props }: any) => (
  <h3
    style={{
      fontSize: "20px",
      fontWeight: 600,
      color: "#000",
      margin: "0 0 20px 0",
    }}
    {...props}
  >
    {children}
  </h3>
);

export const DrawerOption = ({ children, ...props }: any) => (
  <button
    style={{
      width: "100%",
      padding: "16px",
      backgroundColor: "#f8f8f8",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      color: "#007AFF",
      cursor: "pointer",
      marginBottom: "12px",
      textAlign: "left" as const,
    }}
    {...props}
  >
    {children}
  </button>
);
