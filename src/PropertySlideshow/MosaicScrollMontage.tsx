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
import { ALL_FILES, INTRO_HEROES, TOTAL_PHOTOS, img } from "./photos";

// First 5 seconds:
//   0–86   Instagram-style 3-column photo grid, columns scrolling in
//          alternating directions, with a central text lockup transitioning in.
//   86–150 One photo zooms up to fill the whole screen, then holds as the
//          full-bleed hero before the soft-pan room showcase begins.
const ZOOM_START = 86;
const COLS = 3;
const TILE_W = 1080 / COLS; // 360 — no gaps, tiles stitched edge to edge
const TILE_H = 480; // large tiles — a moodboard-ish overview, not tiny thumbnails

// A single column: a tall stack of photos translating up or down. The list is
// duplicated and started mid-content so it never runs out over the intro.
const Column: React.FC<{ files: string[]; dir: 1 | -1; speed: number }> = ({
  files,
  dir,
  speed,
}) => {
  const frame = useCurrentFrame();
  const tiles = [...files, ...files]; // enough height for the whole scroll
  // Scroll, then freeze at the zoom hand-off so a stationary tile can grow.
  const f = Math.min(frame, ZOOM_START);
  const y = -2200 + dir * speed * f;

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, transform: `translateY(${y}px)` }}>
        {tiles.map((file, i) => (
          <div key={i} style={{ width: "100%", height: TILE_H, overflow: "hidden", backgroundColor: "#14171c" }}>
            <Img src={img(file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const MosaicScrollMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Distribute photos across three columns (offset so columns differ).
  const cols = [
    ALL_FILES,
    [...ALL_FILES.slice(4), ...ALL_FILES.slice(0, 4)],
    [...ALL_FILES.slice(7), ...ALL_FILES.slice(0, 7)],
  ];

  // Central text: scales in, holds, then clears as the zoom takes over.
  const textIn = spring({ frame: frame - 18, fps, config: { damping: 180 }, durationInFrames: 22 });
  const textOut = interpolate(frame, [ZOOM_START - 6, ZOOM_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = textIn * (1 - textOut);

  // Hero zoom: an actual grid-tile-sized cell (in the center column) grows from
  // 1x to fully cover the screen, so it reads as a photo within the grid
  // zooming — not a floating image above it. Scale to cover = max(w,h ratios).
  const coverScale = Math.max(1080 / TILE_W, 1920 / TILE_H); // 4
  const zoomScale =
    frame < 126
      ? interpolate(frame, [ZOOM_START, 126], [1, coverScale], {
          easing: Easing.out(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [126, 150], [coverScale, coverScale + 0.35], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const heroOpacity = interpolate(frame, [ZOOM_START, ZOOM_START + 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d11" }}>
      {/* Scrolling 3-column grid, stitched edge to edge (no gaps). */}
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        <Column files={cols[0]} dir={-1} speed={4.5} />
        <Column files={cols[1]} dir={1} speed={5.2} />
        <Column files={cols[2]} dir={-1} speed={4.0} />
      </div>

      {/* Dim the busy grid behind the central text. */}
      <AbsoluteFill style={{ backgroundColor: "#0b0d11", opacity: textOpacity * 0.5 }} />

      {/* Central text transition. */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: textOpacity,
          transform: `scale(${interpolate(textIn, [0, 1], [0.9, 1])})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            color: "#0b0d11",
            backgroundColor: "#ffd60a",
            fontFamily: "system-ui, sans-serif",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: "uppercase",
            padding: "7px 18px",
            borderRadius: 10,
            marginBottom: 22,
          }}
        >
          Global City
        </div>
        <div
          style={{
            textAlign: "center",
            color: "white",
            fontFamily: "system-ui, sans-serif",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.0,
            textShadow: "0 6px 40px rgba(0,0,0,0.6)",
          }}
        >
          2 BHK
          <br />
          Independent Villa
        </div>
        <div
          style={{
            marginTop: 20,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "system-ui, sans-serif",
            fontSize: 34,
            fontWeight: 400,
          }}
        >
          Ready to move · {TOTAL_PHOTOS} photos
        </div>
      </AbsoluteFill>

      {/* One tile in the (frozen) center column grows out to fill the screen. */}
      {frame >= ZOOM_START && (
        <div
          style={{
            position: "absolute",
            left: (1080 - TILE_W) / 2,
            top: (1920 - TILE_H) / 2,
            width: TILE_W,
            height: TILE_H,
            overflow: "hidden",
            backgroundColor: "#0d0f12",
            transform: `scale(${zoomScale})`,
            transformOrigin: "center center",
            opacity: heroOpacity,
            zIndex: 5,
          }}
        >
          <Img src={img(INTRO_HEROES[0])} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
    </AbsoluteFill>
  );
};
