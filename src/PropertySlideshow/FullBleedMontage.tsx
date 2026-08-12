import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { INTRO_HEROES, TOTAL_PHOTOS, img } from "./photos";
import { CARD_SAFE, SAFE_BOTTOM_OFFSET } from "./layout";

const CROSSFADE = 16; // frames of overlap between hero shots

// One full-frame hero that fades in, holds with a slow Ken Burns push, then
// crossfades out into the next. Fills the entire portrait frame (full height).
const Hero: React.FC<{
  file: string;
  index: number;
  seg: number;
  isLast: boolean;
}> = ({ file, index, seg, isLast }) => {
  const frame = useCurrentFrame();
  const start = index * seg;

  const fadeIn =
    index === 0
      ? interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : interpolate(frame, [start - CROSSFADE, start], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const fadeOut = isLast
    ? 1
    : interpolate(frame, [start + seg - CROSSFADE, start + seg], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const opacity = Math.min(fadeIn, fadeOut);

  // Slow push-in across the shot's active span; alternate a gentle drift.
  const scale = interpolate(
    frame,
    [start - CROSSFADE, start + seg],
    [1.06, 1.16],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const dir = index % 2 === 0 ? 1 : -1;
  const x = interpolate(
    frame,
    [start - CROSSFADE, start + seg],
    [-1.5 * dir, 1.5 * dir],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity, zIndex: index }}>
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0d0f12" }}>
        <Img
          src={img(file)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translateX(${x}%)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const FullBleedMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seg = durationInFrames / INTRO_HEROES.length;

  const titleIn = spring({
    frame: frame - 14,
    fps,
    config: { damping: 200 },
    durationInFrames: 26,
  });
  const y = interpolate(titleIn, [0, 1], [28, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0f12" }}>
      {INTRO_HEROES.map((file, i) => (
        <Hero
          key={file}
          file={file}
          index={i}
          seg={seg}
          isLast={i === INTRO_HEROES.length - 1}
        />
      ))}

      {/* Scrim from mid-safe-band down, keeping the title legible in the crop. */}
      <div
        style={{
          position: "absolute",
          zIndex: 50,
          left: 0,
          right: 0,
          top: CARD_SAFE.top + CARD_SAFE.height * 0.3,
          bottom: 0,
          background:
            "linear-gradient(to top, rgba(8,10,14,0.9) 0%, rgba(8,10,14,0.5) 42%, rgba(8,10,14,0) 100%)",
        }}
      />

      {/* Title lockup — kept inside the 4:3 safe band so the card always
          shows it, even though the imagery runs full height. */}
      <div
        style={{
          position: "absolute",
          zIndex: 60,
          left: 56,
          right: 56,
          bottom: SAFE_BOTTOM_OFFSET + 40,
          opacity: titleIn,
          transform: `translateY(${y}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            color: "#0b0d11",
            backgroundColor: "#ffd60a",
            fontFamily: "system-ui, sans-serif",
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase",
            padding: "6px 16px",
            borderRadius: 9,
            marginBottom: 18,
          }}
        >
          Global City
        </div>
        <div
          style={{
            color: "white",
            fontFamily: "system-ui, sans-serif",
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: -1.5,
            lineHeight: 1.0,
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
          }}
        >
          2 BHK
          <br />
          Independent Villa
        </div>
        <div
          style={{
            marginTop: 16,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "system-ui, sans-serif",
            fontSize: 34,
            fontWeight: 400,
            textShadow: "0 2px 16px rgba(0,0,0,0.6)",
          }}
        >
          Ready to move · {TOTAL_PHOTOS} photos
        </div>
      </div>
    </AbsoluteFill>
  );
};
