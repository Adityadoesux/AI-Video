import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  Easing,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KINETIC, TOTAL_PHOTOS, img } from "./photos";
import { CARD_SAFE, SAFE_BOTTOM_OFFSET } from "./layout";

// First 5 seconds:
//   - Shot 1 opens with an ease-out SPEED RAMP: rushes in fast, decelerates,
//     motion blur clearing to sharp.
//   - Then the intro flows through full-bleed shots with EASE-IN-OUT pans
//     (camera accelerates then decelerates) joined by soft crossfades — no cuts.
const CROSSFADE = 18;
const RAMP = 18; // frames of the opening speed ramp

const EASE_IO = Easing.inOut(Easing.cubic);
const EASE_OUT = Easing.out(Easing.exp);

type Shot = {
  file: string;
  zoom: [number, number];
  panX: [number, number]; // percent
};

const SHOTS: Shot[] = [
  { file: KINETIC.hero, zoom: [1.06, 1.14], panX: [0, -2.2] }, // exterior (ramp)
  { file: KINETIC.rapid[0], zoom: [1.15, 1.05], panX: [-3, 3] }, // living
  { file: KINETIC.rapid[1], zoom: [1.05, 1.16], panX: [3, -2] }, // kitchen
];

const ShotView: React.FC<{ shot: Shot; index: number; seg: number; isLast: boolean }> = ({
  shot,
  index,
  seg,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const start = index * seg;
  const end = (index + 1) * seg;
  const isFirst = index === 0;

  // Crossfade in/out.
  const fadeIn = isFirst
    ? interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : interpolate(frame, [start - CROSSFADE, start], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const fadeOut = isLast
    ? 1
    : interpolate(frame, [end - CROSSFADE, end], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const opacity = Math.min(fadeIn, fadeOut);

  // Ease-in-out pan + zoom across the shot's span.
  const panStart = isFirst ? RAMP : start - CROSSFADE;
  let scale = interpolate(frame, [panStart, end], shot.zoom, {
    easing: EASE_IO,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, [panStart, end], shot.panX, {
    easing: EASE_IO,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Opening speed ramp on the first shot: fast push that eases out, blur clears.
  let blur = 0;
  if (isFirst) {
    const ramping = frame < RAMP;
    if (ramping) {
      scale = interpolate(frame, [0, RAMP], [1.3, shot.zoom[0]], {
        easing: EASE_OUT,
        extrapolateRight: "clamp",
      });
    }
    blur = interpolate(frame, [0, RAMP], [16, 0], {
      easing: EASE_OUT,
      extrapolateRight: "clamp",
    });
  }

  return (
    <AbsoluteFill style={{ opacity, zIndex: index }}>
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0d0f12" }}>
        <Img
          src={img(shot.file)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translateX(${x}%)`,
            filter: blur ? `blur(${blur}px)` : undefined,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const KineticMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seg = durationInFrames / SHOTS.length;

  const titleIn = spring({
    frame: frame - (durationInFrames - seg) - 6,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0f12" }}>
      {SHOTS.map((shot, i) => (
        <ShotView key={shot.file + i} shot={shot} index={i} seg={seg} isLast={i === SHOTS.length - 1} />
      ))}

      {/* Scrim + title lockup, kept inside the 4:3 safe band. */}
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
          opacity: titleIn,
        }}
      />
      <div
        style={{
          position: "absolute",
          zIndex: 60,
          left: 56,
          right: 56,
          bottom: SAFE_BOTTOM_OFFSET + 40,
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [28, 0])}px)`,
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
