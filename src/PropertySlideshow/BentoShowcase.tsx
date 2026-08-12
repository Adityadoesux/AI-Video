import React from "react";
import {
  AbsoluteFill,
  Img,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ALL_FILES, img } from "./photos";

// ---------------------------------------------------------------------------
// "Bento One" style — a VIRTUAL CAMERA over one big canvas of tiles.
//
// All photos live at fixed positions in a large world laid out as three bento
// clusters. A spring-driven camera (translate3d + scale) flies across the
// world: it zooms a focal hero tile to fill the whole viewport, then pulls back
// to reveal the bento grid around it, then pans to the next cluster and zooms
// in again — one continuous, physical move, never a discrete cut.
//
//  1. Camera navigation: the world is transformed by translate3d(x,y,0)·scale,
//     driven by spring()/useCurrentFrame() across X and Y.
//  2. Zoom & reflow: a focal tile scales from its grid cell up to full viewport
//     (its inset + corner radius melt to 0 as it fills the frame); neighbours
//     reflow into / out of view as the camera zooms.
//  3. Spring physics: every pan/zoom value maps to spring() curves with a sharp
//     ease-out and subtle elastic settle — no linear moves.
// ---------------------------------------------------------------------------

const VW = 1080;
const VH = 1440;
export const BENTO_DURATION = 450; // 7.5s @ 60fps

const BG = "#0d0d10";
const RADIUS = 30;
const GAP = 10; // half-gap between world tiles
const CGAP = 70; // gap between clusters in world space (kept small so camera pans stay on content)

// Springy camera physics: high initial velocity, medium mass, high damping with
// a subtle elastic settle.
const CAM_SPRING = { mass: 1, damping: 20, stiffness: 130 } as const;
const TRANS = 38; // frames a camera move takes to settle

type Rect = { x: number; y: number; w: number; h: number }; // fractions of a cluster
type Tmpl = { hero: Rect; t1: Rect; t2: Rect; t3: Rect };

// Two perfectly-tiling bento templates (no overlap) with a hero cell.
const BENTO_A: Tmpl = {
  hero: { x: 0, y: 0, w: 0.62, h: 0.64 },
  t1: { x: 0.62, y: 0, w: 0.38, h: 0.64 },
  t2: { x: 0, y: 0.64, w: 0.4, h: 0.36 },
  t3: { x: 0.4, y: 0.64, w: 0.6, h: 0.36 },
};
const BENTO_B: Tmpl = {
  hero: { x: 0.38, y: 0, w: 0.62, h: 0.64 },
  t1: { x: 0, y: 0, w: 0.38, h: 0.32 },
  t2: { x: 0, y: 0.32, w: 0.38, h: 0.32 },
  t3: { x: 0, y: 0.64, w: 1, h: 0.36 },
};

// Photo roles.
const exterior = ALL_FILES[0];
const entrance = ALL_FILES[1];
const living = ALL_FILES[2];
const kitchen = ALL_FILES[3];
const utility = ALL_FILES[4];
const master = ALL_FILES[5];
const balcony = ALL_FILES[6];
const bed2 = ALL_FILES[7];
const bed3 = ALL_FILES[8];
const bathroom = ALL_FILES[9];

type Cluster = { tmpl: Tmpl; hero: string; t1: string; t2: string; t3: string };
const CLUSTERS: Cluster[] = [
  { tmpl: BENTO_A, hero: exterior, t1: bathroom, t2: kitchen, t3: entrance },
  { tmpl: BENTO_B, hero: master, t1: balcony, t2: utility, t3: living },
  { tmpl: BENTO_A, hero: bed2, t1: bed3, t2: bathroom, t3: kitchen },
];

const clusterX = (i: number) => i * (VW + CGAP);

// A world tile: absolute rect in world px + which cluster it belongs to + role.
type WorldTile = { file: string; rect: Rect; cluster: number; isHero: boolean; phase: number };
const worldRect = (i: number, r: Rect): Rect => ({
  x: clusterX(i) + r.x * VW,
  y: r.y * VH,
  w: r.w * VW,
  h: r.h * VH,
});
const TILES: WorldTile[] = CLUSTERS.flatMap((c, i) => [
  { file: c.t1, rect: worldRect(i, c.tmpl.t1), cluster: i, isHero: false, phase: i * 4 + 1 },
  { file: c.t2, rect: worldRect(i, c.tmpl.t2), cluster: i, isHero: false, phase: i * 4 + 2 },
  { file: c.t3, rect: worldRect(i, c.tmpl.t3), cluster: i, isHero: false, phase: i * 4 + 3 },
  { file: c.hero, rect: worldRect(i, c.tmpl.hero), cluster: i, isHero: true, phase: i * 4 },
]);

// Cover-scale so a hero cell fills the whole viewport when focused.
const coverScale = (r: Rect) => Math.max(VW / (r.w * VW), VH / (r.h * VH));

// ---- camera shots ---------------------------------------------------------
type Shot = { start: number; kind: "hero" | "grid"; cluster: number };
const SHOTS: Shot[] = [
  { start: 0, kind: "hero", cluster: 0 },
  { start: 60, kind: "grid", cluster: 0 },
  { start: 150, kind: "hero", cluster: 1 },
  { start: 210, kind: "grid", cluster: 1 },
  { start: 300, kind: "hero", cluster: 2 },
  { start: 360, kind: "grid", cluster: 2 },
];

// Camera target (focal world point + scale + hero-focus amount) for a shot.
const shotTarget = (s: Shot) => {
  const c = CLUSTERS[s.cluster];
  if (s.kind === "hero") {
    const hr = worldRect(s.cluster, c.tmpl.hero);
    return {
      fx: hr.x + hr.w / 2,
      fy: hr.y + hr.h / 2,
      scale: coverScale(c.tmpl.hero),
      focus: 1,
    };
  }
  return {
    fx: clusterX(s.cluster) + VW / 2,
    fy: VH / 2,
    scale: 1,
    focus: 0,
  };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---- tile render ----------------------------------------------------------
const Tile: React.FC<{ tile: WorldTile; inset: number; radius: number }> = ({
  tile,
  inset,
  radius,
}) => {
  const frame = useCurrentFrame();
  const { rect, phase } = tile;
  // Very gentle life so tiles aren't dead, kept small so the camera leads.
  const kb = 1.03 + 0.015 * Math.sin(frame * 0.02 + phase);
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x + inset,
        top: rect.y + inset,
        width: rect.w - 2 * inset,
        height: rect.h - 2 * inset,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: "#17171b",
      }}
    >
      <Img
        src={img(tile.file)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${kb})`,
        }}
      />
    </div>
  );
};

export const BentoShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Active shot = last one that has started.
  let active = 0;
  for (let i = 0; i < SHOTS.length; i++) if (SHOTS[i].start <= frame) active = i;
  const shot = SHOTS[active];
  const prevShot = active > 0 ? SHOTS[active - 1] : null;

  const target = shotTarget(shot);
  const fromT = prevShot ? shotTarget(prevShot) : target;

  // Spring progress of the current camera move (sharp ease-out, subtle settle).
  const prog =
    active === 0
      ? 1
      : spring({
          frame: frame - shot.start,
          fps,
          config: CAM_SPRING,
          durationInFrames: TRANS,
        });

  const fx = lerp(fromT.fx, target.fx, prog);
  const fy = lerp(fromT.fy, target.fy, prog);
  const scale = lerp(fromT.scale, target.scale, prog);
  const focus = lerp(fromT.focus, target.focus, prog);

  // Which cluster's hero is being (un)focused — swap only while focus≈0 so it's
  // seamless.
  const focusCluster = target.focus === 1 ? shot.cluster : prevShot ? prevShot.cluster : shot.cluster;

  // Continuous, subtle drift so the frame is never fully static.
  const driftX = Math.sin(frame * 0.017) * 10;
  const driftY = Math.cos(frame * 0.013) * 8;

  // World → viewport transform (translate3d + scale), origin top-left.
  const tx = VW / 2 - scale * fx + driftX;
  const ty = VH / 2 - scale * fy + driftY;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: clusterX(CLUSTERS.length),
          height: VH,
          transformOrigin: "0 0",
          transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
          willChange: "transform",
        }}
      >
        {TILES.map((tile, i) => {
          const focal = tile.isHero && tile.cluster === focusCluster;
          const inset = focal ? lerp(GAP, 0, focus) : GAP;
          const radius = focal ? lerp(RADIUS, 0, focus) : RADIUS;
          return <Tile key={i} tile={tile} inset={inset} radius={radius} />;
        })}
      </div>
    </AbsoluteFill>
  );
};
