import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { INTRO_HEROES, img } from "./photos";

// First 4 seconds: four full-bleed photos, ~1s each, crossfading, each with a
// slow side pan. A centered title holds over them, then fades out just before
// the room storytelling begins.
// Crossfade shorter than each hold, so every image sits solid before dissolving.
const CROSSFADE = 15;

type Shot = { file: string; panX: [number, number]; dur: number };

// Four photos over a 5s intro (150 frames @ 30fps). The first (hero) holds
// longest; each interior still gets a clear solid beat. Alternating side pans.
// Solid time on screen ≈ dur − CROSSFADE.
const SHOTS: Shot[] = [
  { file: INTRO_HEROES[0], panX: [-3, 3], dur: 48 }, // exterior — held longest
  { file: INTRO_HEROES[1], panX: [3, -3], dur: 34 }, // living
  { file: INTRO_HEROES[2], panX: [-3, 3], dur: 34 }, // kitchen
  { file: INTRO_HEROES[3], panX: [3, -3], dur: 34 }, // master bedroom
];

// Cumulative start frame for each shot.
const STARTS = SHOTS.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].dur);
  return acc;
}, []);

const Shot: React.FC<{ shot: Shot; index: number; isLast: boolean }> = ({
  shot,
  index,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const start = STARTS[index];
  const end = start + shot.dur;

  // First image appears instantly (no fade-in); others crossfade in.
  const fadeIn =
    index === 0
      ? 1
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

  // Slow side pan (scaled up so the pan never reveals an edge).
  const x = interpolate(frame, [start - CROSSFADE, end], shot.panX, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity, zIndex: index }}>
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0d0f12" }}>
        <Img
          src={img(shot.file)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(1.12) translateX(${x}%)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CinematicFadeMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Centered title fades in early, holds, then clears before the tour begins.
  const textIn = interpolate(frame, [8, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textOut = interpolate(frame, [durationInFrames - 22, durationInFrames - 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = textIn * (1 - textOut);
  const textLift = interpolate(textIn, [0, 1], [16, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0f12" }}>
      {SHOTS.map((shot, i) => (
        <Shot key={shot.file + i} shot={shot} index={i} isLast={i === SHOTS.length - 1} />
      ))}

      {/* Vignette so the centered text stays legible over any photo. */}
      <AbsoluteFill
        style={{
          zIndex: 50,
          background:
            "radial-gradient(ellipse at center, rgba(8,10,14,0.55) 0%, rgba(8,10,14,0.15) 45%, rgba(8,10,14,0) 72%)",
          opacity: textOpacity,
        }}
      />

      {/* Centered title (above all shots). */}
      <AbsoluteFill
        style={{
          zIndex: 60,
          justifyContent: "center",
          alignItems: "center",
          opacity: textOpacity,
          transform: `translateY(${textLift}px)`,
        }}
      >
        <div
          style={{
            color: "white",
            fontFamily: "system-ui, sans-serif",
            fontSize: 108,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.0,
            textAlign: "center",
            textShadow: "0 6px 40px rgba(0,0,0,0.6)",
          }}
        >
          2 BHK
        </div>
        <div
          style={{
            marginTop: 8,
            color: "white",
            fontFamily: "system-ui, sans-serif",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.05,
            textAlign: "center",
            textShadow: "0 6px 40px rgba(0,0,0,0.6)",
          }}
        >
          Independent Villa
        </div>
        <div
          style={{
            marginTop: 26,
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "rgba(255,255,255,0.92)",
            fontFamily: "system-ui, sans-serif",
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 40, height: 2, background: "rgba(255,255,255,0.6)" }} />
          Ready to move
          <span style={{ width: 40, height: 2, background: "rgba(255,255,255,0.6)" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
