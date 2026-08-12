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
import {
  TransitionSeries,
  linearTiming,
  type TransitionPresentation,
  type TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { ROOMS, ALL_FILES, img } from "./photos";

// Custom side-slide with parallax: the entering photo slides fully in from the
// right, while the exiting photo drifts left at ~1/3 the speed and eases back
// in scale/brightness — the speed differential is the parallax.
const ParallaxSlide: React.FC<
  TransitionPresentationComponentProps<Record<string, never>>
> = ({ presentationProgress: prog, presentationDirection: dir, children }) => {
  const entering = dir === "entering";
  const x = entering
    ? interpolate(prog, [0, 1], [100, 0])
    : interpolate(prog, [0, 1], [0, -34]);
  const scale = entering ? 1 : interpolate(prog, [0, 1], [1, 0.92]);
  const brightness = entering ? 1 : interpolate(prog, [0, 1], [1, 0.65]);
  return (
    <AbsoluteFill
      style={{ transform: `translateX(${x}%) scale(${scale})`, filter: `brightness(${brightness})` }}
    >
      {children}
    </AbsoluteFill>
  );
};

const parallaxSlide = (): TransitionPresentation<Record<string, never>> => ({
  component: ParallaxSlide,
  props: {},
});

// Inspired by a product-reel style: warm dark background with drifting
// particles, an intro where photo cards stack into a vertical column, each
// item then zooming up to fullscreen with a vertical side-label, and a kinetic
// centered end card.
const BG = "#3a272c";
const INTRO = 150;
const ROOM = 82;
const END = 120;
const TRANS = 12;

// ---------------------------------------------------------------- particles
const DOTS = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 137.5) % 100,
  y: (i * 61.8) % 100,
  size: 2 + (i % 3),
  phase: i * 0.7,
  amp: 8 + (i % 4) * 4,
}));

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {DOTS.map((d, i) => {
        const dy = Math.sin(frame * 0.04 + d.phase) * d.amp;
        const tw = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(frame * 0.06 + d.phase));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              borderRadius: 999,
              backgroundColor: `rgba(255,244,235,${tw})`,
              transform: `translateY(${dy}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- intro grid
// 0:00–0:02  tiny centered image scales up to a medium square
// 0:02–0:04  the square splits outward into a 2x2 grid of 4 tiles
// 0:04–0:05  the grid snaps back inward into the single central frame
// 3:4 tiles (matching the frame) so the 3x3 grid nearly fills it.
const TILE_W = 344;
const TILE_H = 459; // 344 * 4/3
const GRID_GAP = 16;

// 3x3 grid. Each tile's cell is (col, row) with values -1/0/1. The exterior is
// the CENTER cell and is rendered last so it sits on top while the tiles are
// stacked (collapsed) — the single frame reads as the exterior, and it's the
// one that magnifies to full screen.
const GRID_TILES = [
  { file: ALL_FILES[2], s: [0, -1] as const }, // living   → top-mid
  { file: ALL_FILES[3], s: [1, -1] as const }, // kitchen  → top-right
  { file: ALL_FILES[5], s: [-1, -1] as const }, // master  → top-left
  { file: ALL_FILES[6], s: [1, 0] as const }, // balcony   → mid-right
  { file: ALL_FILES[9], s: [-1, 0] as const }, // bathroom → mid-left
  { file: ALL_FILES[1], s: [-1, 1] as const }, // entrance → bottom-left
  { file: ALL_FILES[4], s: [0, 1] as const }, // utility   → bottom-mid
  { file: ALL_FILES[7], s: [1, 1] as const }, // bedroom   → bottom-right
  { file: ALL_FILES[0], s: [0, 0] as const }, // exterior  → center (the title image)
];

// The room tour (skips the exterior, which is used as the opening title).
const TOUR = ROOMS.slice(1);

const FULL_F = 1440 / TILE_H; // hero factor that fills the whole 3:4 frame
const H75_F = (1440 * 0.75) / TILE_H; // 75% of the frame

const IntroGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame;

  // Hero (center/exterior) tile size. ONE continuous zoom-out to 75% that
  // reveals the title, a hold while it reads, then eased down to tile size.
  //   0–16   FULL → 75%   (a single, smooth zoom-out — no intermediate step)
  //   16–44  hold at 75%  (title readable)
  //   44–66  75% → default tile size
  let heroF: number;
  if (f < 16) heroF = interpolate(f, [0, 16], [FULL_F, H75_F], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  else if (f < 44) heroF = H75_F;
  else if (f < 58) heroF = interpolate(f, [44, 58], [H75_F, 1], { easing: Easing.inOut(Easing.cubic) });
  else heroF = 1;

  // Fillet: sharp (0) when full-frame, rounded (22) as the single zoom-out lands.
  const heroRadius = interpolate(f, [0, 16], [0, 22], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Opening title — starts appearing from the very first frame, alongside the
  // zoom-out.
  const titleIn = interpolate(f, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOut = interpolate(f, [40, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOpacity = titleIn * (1 - titleOut);

  // Hero inner image keeps a slow Ken Burns the whole time (through the flare),
  // so the centre tile never freezes.
  const heroImgScale = interpolate(f, [0, 120], [1.05, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const heroImgPanX = interpolate(f, [0, 120], [-2, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const heroImgPanY = interpolate(f, [0, 120], [-1.5, 1.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Split progress for the 8 surrounding tiles: 0 = stacked behind the hero,
  // 1 = spread into the 3x3 grid. Smooth ease in/out both ways.
  let p: number;
  if (f < 58) p = 0;
  else if (f < 92)
    p = interpolate(f, [58, 92], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  else if (f < 107) p = 1; // hold fully flared for 0.5s (15 frames)
  else p = interpolate(f, [107, 126], [1, 0], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const offX = (TILE_W + GRID_GAP) * p; // horizontal pitch (3x3)
  const offY = (TILE_H + GRID_GAP) * p; // vertical pitch (3:4 tiles)

  // Surrounding tiles' inner parallax scale.
  const imgScale = interpolate(f, [58, 136], [1.28, 1.12], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Handoff: the foyer photo (first tour room) is the actual bottom-left tile,
  // and IT is the one that gets restacked on top. It rides its own grid cell in
  // to the centre (same collapse path), rises to the top of the stack, and then
  // that same card ZOOMS UP from tile size to fill the frame — landing
  // rounded→sharp at inner scale 1.05 to match room 1 exactly for a seamless cut.
  const cardF = interpolate(f, [128, 150], [1, FULL_F], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // tile → full frame
  const cardRadius = interpolate(f, [128, 150], [22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardMag = interpolate(f, [128, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // inner parallax → 1.05 as it magnifies

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Particles />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", isolation: "isolate" }}>
        <div style={{ position: "relative" }}>
          {GRID_TILES.map((t, i) => {
            const isHero = i === GRID_TILES.length - 1; // exterior center — opening zoomer + title
            const isFoyer = t.file === ALL_FILES[1]; // entrance bottom-left — closing zoomer

            let w: number, h: number, radius: number, z: number;
            if (isHero) {
              w = TILE_W * heroF;
              h = TILE_H * heroF;
              radius = heroRadius;
              z = 5;
            } else if (isFoyer) {
              // Rides its bottom-left cell to centre, then magnifies. Rises to
              // the top of the stack once the tiles are spread apart (no overlap
              // yet), so during the collapse it re-stacks ON TOP.
              w = TILE_W * cardF;
              h = TILE_H * cardF;
              radius = cardRadius;
              z = f >= 92 ? 30 : 1;
            } else {
              w = TILE_W;
              h = TILE_H;
              radius = 22;
              z = 1;
            }

            let imgTransform: string;
            if (isHero) {
              imgTransform = `translate(${heroImgPanX}%, ${heroImgPanY}%) scale(${heroImgScale})`;
            } else {
              // Counter-move against the split for parallax, within cover.
              const ovfX = (TILE_W * (imgScale - 1)) / 2;
              const ovfY = (TILE_H * (imgScale - 1)) / 2;
              let ix = -t.s[0] * ovfX * 0.75 * p;
              let iy = -t.s[1] * ovfY * 0.75 * p;
              // A small continuous directional drift so the flare/hold has life
              // instead of freezing once spread.
              const life = interpolate(f, [58, 126], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              ix += t.s[0] * 5 * life;
              iy += (t.s[1] - 0.5) * 5 * life;
              let sc = imgScale;
              if (isFoyer) {
                // As it magnifies, ease the parallax out and settle to 1.05 so it
                // matches room 1 at the cut.
                sc = imgScale * (1 - cardMag) + 1.05 * cardMag;
                ix *= 1 - cardMag;
                iy *= 1 - cardMag;
              }
              imgTransform = `translate(${ix}px, ${iy}px) scale(${sc})`;
            }
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: w,
                  height: h,
                  left: -w / 2,
                  top: -h / 2,
                  transform: `translate(${t.s[0] * offX}px, ${t.s[1] * offY}px)`,
                  borderRadius: radius,
                  overflow: "hidden",
                  zIndex: z,
                  backgroundColor: "#fff",
                }}
              >
                <Img
                  src={img(t.file)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: imgTransform }}
                />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Soft vignette + centered opening title over the zooming image. */}
      <AbsoluteFill
        style={{
          opacity: titleOpacity,
          background:
            "radial-gradient(ellipse at center, rgba(10,7,8,0.55) 0%, rgba(10,7,8,0.2) 42%, rgba(10,7,8,0) 68%)",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleIn, [0, 1], [22, 0])}px)`,
        }}
      >
        <div
          style={{
            color: "white",
            fontFamily: "system-ui, sans-serif",
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.0,
            textAlign: "center",
          }}
        >
          2 BHK
        </div>
        <div
          style={{
            marginTop: 8,
            color: "white",
            fontFamily: "system-ui, sans-serif",
            fontSize: 66,
            fontWeight: 700,
            letterSpacing: -1,
            textAlign: "center",
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
            fontSize: 30,
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

// ------------------------------------------------------- fullscreen room
const LabeledRoom: React.FC<{
  file: string;
  kicker: string;
  title: string;
  subtitle: string;
}> = ({ file, kicker, title, subtitle }) => {
  const frame = useCurrentFrame();

  // Full-bleed the whole time; a continuous push-in (magnify) gives depth.
  const kb = interpolate(frame, [0, ROOM], [1.05, 1.18], {
    extrapolateRight: "clamp",
  });

  // Caption fades in a beat after the scene starts.
  const textIn = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scrim eases in too, so it never pops on the hard cut from the intro.
  const scrimIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          backgroundColor: "#14100f",
        }}
      >
        <Img
          src={img(file)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${kb})`,
          }}
        />
        {/* Bottom scrim so the caption stays legible (eases in, no pop). */}
        <AbsoluteFill
          style={{
            opacity: scrimIn,
            background:
              "linear-gradient(to top, rgba(8,10,14,0.85) 0%, rgba(8,10,14,0.35) 24%, rgba(8,10,14,0) 48%)",
          }}
        />
      </div>

      {/* Bottom-left caption — same style as the cinematic variation. */}
      <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 130,
            opacity: textIn,
            transform: `translateY(${interpolate(textIn, [0, 1], [24, 0])}px)`,
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
            <span style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: "#7fd1ff" }} />
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
              {kicker}
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
            {title}
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
            {subtitle}
          </div>
        </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- end card
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines: { text: string; size: number; weight: number; gap: number }[] = [
    { text: "Global City", size: 30, weight: 700, gap: 18 },
    { text: "2 BHK", size: 108, weight: 800, gap: 4 },
    { text: "Independent Villa", size: 62, weight: 700, gap: 30 },
    { text: "Ready to move", size: 30, weight: 500, gap: 0 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Particles />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {lines.map((l, i) => {
          const s = spring({
            frame: frame - 6 - i * 9,
            fps,
            config: { damping: 200 },
            durationInFrames: 22,
          });
          const upper = i === 0 || i === 3;
          return (
            <div
              key={i}
              style={{
                marginBottom: l.gap,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px)`,
                color: i === 0 ? "#e9b7a0" : "white",
                fontFamily: "system-ui, sans-serif",
                fontSize: l.size,
                fontWeight: l.weight,
                letterSpacing: upper ? 6 : -1,
                textTransform: upper ? "uppercase" : "none",
                lineHeight: 1.0,
                textAlign: "center",
              }}
            >
              {l.text}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- assembly
// Intro hard-cuts into room 1 (the magnify is continuous), so there are only
// N room transitions, not N+1.
export const spaShowcaseDuration =
  INTRO + TOUR.length * ROOM + END - TOUR.length * TRANS;

export const SpaShowcase: React.FC = () => {
  const timing = linearTiming({ durationInFrames: TRANS, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <IntroGrid />
        </TransitionSeries.Sequence>

        {TOUR.map((room) => (
          <React.Fragment key={room.id}>
            <TransitionSeries.Sequence durationInFrames={ROOM}>
              <LabeledRoom
                file={room.file}
                kicker={room.kicker}
                title={room.title}
                subtitle={room.subtitle}
              />
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition
              presentation={parallaxSlide()}
              timing={timing}
            />
          </React.Fragment>
        ))}

        <TransitionSeries.Sequence durationInFrames={END}>
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
