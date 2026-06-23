import type { CSSProperties, ReactNode } from "react";

// The device shell — ported pixel-for-pixel from the design (Atlas Body.dc.html). On a real phone,
// globals.css collapses the bezel/notch and goes edge-to-edge via attribute selectors that match
// these exact inline styles (width:390px / border-radius:56px / border-radius:45px). Don't reformat.

const GEIST = "'Geist', sans-serif";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background:
          "radial-gradient(120% 70% at 50% -10%, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0) 45%), #050506",
      }}
    >
      {children}
    </main>
  );
}

export function PhoneFrame({ children, contentStyle }: { children: ReactNode; contentStyle?: CSSProperties }) {
  return (
    <div
      style={{
        width: "390px",
        height: "844px",
        borderRadius: "56px",
        background: "#050506",
        padding: "11px",
        boxShadow: "0 60px 110px -34px rgba(26,24,20,0.6),0 0 0 1px rgba(0,0,0,0.55)",
        position: "relative",
        flex: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "11px",
          borderRadius: "45px",
          background: "#08080a",
          overflow: "hidden",
        }}
      >
        {/* gold top wash */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "240px",
            background: "radial-gradient(120% 150% at 50% -25%,rgba(212,175,55,0.07),transparent 62%)",
            pointerEvents: "none",
          }}
        />
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: "13px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "118px",
            height: "33px",
            borderRadius: "18px",
            background: "#000",
            zIndex: 6,
          }}
        />
        {/* fake status bar */}
        <div
          data-fake-statusbar
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "54px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            zIndex: 5,
          }}
        >
          <span style={{ fontFamily: GEIST, fontSize: "14px", fontWeight: 500, color: "#EFEBE3", letterSpacing: "0.02em" }}>
            9:41
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "11px" }}>
              <div style={{ width: "3px", height: "5px", background: "#EFEBE3", borderRadius: "1px" }} />
              <div style={{ width: "3px", height: "7px", background: "#EFEBE3", borderRadius: "1px" }} />
              <div style={{ width: "3px", height: "9px", background: "#EFEBE3", borderRadius: "1px" }} />
              <div style={{ width: "3px", height: "11px", background: "#EFEBE3", borderRadius: "1px" }} />
            </div>
            <div
              style={{
                width: "24px",
                height: "12px",
                borderRadius: "3px",
                border: "1px solid rgba(239,235,227,0.5)",
                padding: "1.5px",
                position: "relative",
              }}
            >
              <div style={{ width: "72%", height: "100%", background: "#EFEBE3", borderRadius: "1px" }} />
              <div
                style={{
                  position: "absolute",
                  right: "-3px",
                  top: "3.5px",
                  width: "2px",
                  height: "5px",
                  borderRadius: "0 1px 1px 0",
                  background: "rgba(239,235,227,0.5)",
                }}
              />
            </div>
          </div>
        </div>

        {/* screen content */}
        <div
          data-screen-content
          style={{
            position: "absolute",
            inset: 0,
            padding: "74px 34px 40px",
            display: "flex",
            flexDirection: "column",
            ...contentStyle,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export const EYEBROW_STYLE: CSSProperties = {
  textAlign: "center",
  fontFamily: GEIST,
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color: "#b9952f",
};
