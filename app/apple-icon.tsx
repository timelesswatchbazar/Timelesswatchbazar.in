import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — luxury watch mark in brand colors */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A2540",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 999,
            background: "#C7A252",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 102,
              height: 102,
              borderRadius: 999,
              background: "#F7F4EE",
              display: "flex",
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* 12 */}
            <div
              style={{
                position: "absolute",
                top: 10,
                width: 6,
                height: 14,
                background: "#C7A252",
                borderRadius: 2,
              }}
            />
            {/* 3 */}
            <div
              style={{
                position: "absolute",
                right: 10,
                width: 14,
                height: 6,
                background: "#C7A252",
                borderRadius: 2,
              }}
            />
            {/* 6 */}
            <div
              style={{
                position: "absolute",
                bottom: 10,
                width: 6,
                height: 14,
                background: "#C7A252",
                borderRadius: 2,
              }}
            />
            {/* 9 */}
            <div
              style={{
                position: "absolute",
                left: 10,
                width: 14,
                height: 6,
                background: "#C7A252",
                borderRadius: 2,
              }}
            />
            {/* Hour hand */}
            <div
              style={{
                position: "absolute",
                width: 6,
                height: 34,
                background: "#0A2540",
                borderRadius: 3,
                transform: "rotate(-30deg)",
                transformOrigin: "bottom center",
                top: 22,
              }}
            />
            {/* Minute hand */}
            <div
              style={{
                position: "absolute",
                width: 5,
                height: 42,
                background: "#0A2540",
                borderRadius: 3,
                transform: "rotate(60deg)",
                transformOrigin: "bottom center",
                top: 14,
              }}
            />
            {/* Pivot */}
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#C7A252",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
