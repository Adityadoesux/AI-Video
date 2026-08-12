import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KenBurnsImage } from "./KenBurnsImage";
import type { Room } from "./photos";
import { img } from "./photos";
import { useCardSafe } from "./layout";

export const RoomScene: React.FC<{
  room: Room;
  durationInFrames: number;
  imgSrc?: string;
}> = ({ room, durationInFrames, imgSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const safe = useCardSafe();

  // Caption slides up as the scene opens and eases away just before it ends.
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 22 });
  const exit = interpolate(
    frame,
    [durationInFrames - 14, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const y = interpolate(enter, [0, 1], [40, 0]) + exit * 20;
  const opacity = enter * (1 - exit);

  return (
    <AbsoluteFill>
      <KenBurnsImage src={imgSrc ?? img(room.file)} pan={room.pan} durationInFrames={durationInFrames} />

      {/* Scrim that darkens from mid-safe-band downward so the caption stays
          legible whether the card is cropped to 4:3 or expanded to full 9:16. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: safe.top + safe.height * 0.32,
          bottom: 0,
          background:
            "linear-gradient(to top, rgba(8,10,14,0.88) 0%, rgba(8,10,14,0.5) 42%, rgba(8,10,14,0) 100%)",
        }}
      />

      {/* Caption anchored to the bottom of the 4:3 safe band (top/bottom edges
          get cropped on the card), so it's always visible on the listing card. */}
      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: safe.bottomOffset + 152,
          transform: `translateY(${y}px)`,
          opacity,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 18px",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.28)",
            backdropFilter: "blur(6px)",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              backgroundColor: "#7fd1ff",
            }}
          />
          <span
            style={{
              color: "rgba(255,255,255,0.92)",
              fontFamily: "system-ui, sans-serif",
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {room.kicker}
          </span>
        </div>

        <div
          style={{
            color: "white",
            fontFamily: "system-ui, sans-serif",
            fontSize: 66,
            fontWeight: 800,
            lineHeight: 1.03,
            letterSpacing: -1.2,
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}
        >
          {room.title}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.82)",
            fontFamily: "system-ui, sans-serif",
            fontSize: 32,
            fontWeight: 400,
            marginTop: 12,
            textShadow: "0 2px 16px rgba(0,0,0,0.5)",
          }}
        >
          {room.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
