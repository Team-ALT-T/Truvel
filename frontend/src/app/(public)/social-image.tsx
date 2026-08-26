import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export function createSocialImage() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        padding: "72px 80px",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#14243a",
        background:
          "linear-gradient(135deg, #f8fcff 0%, #e5f5ff 58%, #d2edff 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-180px",
          right: "-100px",
          display: "flex",
          width: "520px",
          height: "520px",
          border: "2px solid rgba(60, 166, 255, 0.2)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "105px",
          bottom: "-220px",
          display: "flex",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "rgba(60, 166, 255, 0.16)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <div
          style={{
            display: "flex",
            width: "56px",
            height: "56px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "17px",
            color: "white",
            background: "linear-gradient(145deg, #72c5ff, #208dde)",
            boxShadow: "0 12px 30px rgba(35, 142, 222, 0.28)",
            fontSize: "26px",
            fontWeight: 800,
          }}
        >
          T
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "34px",
            fontWeight: 800,
            letterSpacing: "-1px",
          }}
        >
          Truvel
        </div>
      </div>

      <div
        style={{ display: "flex", maxWidth: "850px", flexDirection: "column" }}
      >
        <div
          style={{
            display: "flex",
            color: "#1789e6",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          ONE FLOW, BETTER TRIP
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "18px",
            flexDirection: "column",
            fontSize: "78px",
            fontWeight: 800,
            letterSpacing: "-4px",
            lineHeight: 1.03,
          }}
        >
          <span>Plan less.</span>
          <span style={{ color: "#1789e6" }}>Travel better.</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          {["SELECT", "PLAN", "OPTIMIZE"].map((label, index) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "13px 18px",
                alignItems: "center",
                gap: "9px",
                border: "1px solid rgba(23, 137, 230, 0.18)",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.78)",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              <span style={{ color: "#1789e6" }}>0{index + 1}</span>
              {label}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", color: "#60758a", fontSize: "18px" }}>
          Your trip, naturally connected.
        </div>
      </div>
    </div>,
    socialImageSize,
  );
}
