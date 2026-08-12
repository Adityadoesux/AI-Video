import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MONTAGE_FILES, img } from "./photos";

// Each panel slides in from its nearest edge, staggered, so the six shots
// assemble into a full-height 2x3 mosaic — a quick glance at the whole
// property, edge to edge (the title stays in the 4:3 safe band).
const OFFSCREEN: { x: number; y: number }[] = [
  { x: -70, y: -70 }, // top-left
  { x: 70, y: -70 }, // top-right
  { x: -70, y: 0 }, // mid-left
  { x: 70, y: 0 }, // mid-right
  { x: -70, y: 70 }, // bottom-left
  { x: 70, y: 70 }, // bottom-right
];

const Panel: React.FC<{ file: string; index: number }> = ({ file, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - index * 7,
    fps,
    config: { damping: 200, mass: 0.9 },
    durationInFrames: 40,
  });

  const off = OFFSCREEN[index];
  const x = interpolate(enter, [0, 1], [off.x, 0]);
  const y = interpolate(enter, [0, 1], [off.y, 0]);
  const drift = interpolate(frame, [0, 150], [1.05, 1.12]);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        transform: `translate(${x}%, ${y}%)`,
        opacity: enter,
        backgroundColor: "#14171c",
      }}
    >
      <Img
        src={img(file)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${drift})`,
        }}
      />
    </div>
  );
};

export const OverviewMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleIn = spring({
    frame: frame - 34,
    fps,
    config: { damping: 200 },
    durationInFrames: 26,
  });
  const titleOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleOpacity = titleIn * (1 - titleOut);

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #191f29 0%, #0b0d11 70%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 20,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr",
          gap: 18,
        }}
      >
        {MONTAGE_FILES.map((file, i) => (
          <Panel key={file} file={file} index={i} />
        ))}
      </div>

      {/* Center title lockup over a soft vignette (inside the safe band). */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(8,10,14,0.6) 0%, rgba(8,10,14,0.12) 52%, rgba(8,10,14,0) 74%)",
          opacity: titleOpacity,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleIn, [0, 1], [24, 0])}px)`,
        }}
      >
        <div
          style={{
            color: "#0b0d11",
            backgroundColor: "#ffd60a",
            fontFamily: "system-ui, sans-serif",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: "uppercase",
            padding: "6px 18px",
            borderRadius: 10,
            marginBottom: 22,
          }}
        >
          Global City
        </div>
        <div
          style={{
            color: "white",
            fontFamily: "system-ui, sans-serif",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -2,
            textShadow: "0 6px 40px rgba(0,0,0,0.6)",
          }}
        >
          2 BHK Villa
        </div>
        <div
          style={{
            marginTop: 18,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "system-ui, sans-serif",
            fontSize: 34,
            fontWeight: 400,
          }}
        >
          A quick look inside your next home
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
