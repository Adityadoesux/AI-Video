import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BENTO_FRAMES } from "./bentoData";

// ---------------------------------------------------------------------------
// Frame-accurate replica of the bento reference clip (453 frames @ 60fps, 3:4).
// The box positions are MEASURED from every reference frame (see bentoData.ts)
// and replayed verbatim here. Each tracked box id is mapped to a property photo
// so the same photo stays on the same "card" across the whole timeline.
// ---------------------------------------------------------------------------

const W = 1080;
const H = 1440;

// Freeze the whole scene (images + title) at this frame for HOLD_LEN, then continue.
const HOLD_AT = 93;
const HOLD_LEN = 21; // 0.35s @ 60fps
export const BENTO_BOX_DURATION = BENTO_FRAMES.length + HOLD_LEN;

const BG = "#0d0d10";
const RADIUS = 26;

// Photos from "property photos 2".
const DIR = "property photos 2";
const img2 = (f: string) => staticFile(`${DIR}/${f}`);
const dining = "1ba1fce5b02236f3edfeb575cfbcb0f1.jpg";
const balcony = "436040661c04bb791bc3d295edbcb5ab.jpg";
const kitchen = "60eff5d6f1a1ee1837db965a10a78f05.jpg";
const living = "a5e79b0cd96f9e12a71e0b0cee196fbf.jpg";
const bedroom = "cea653c62600a3e54d98b2dac99e67e7.jpg";
const bedroom2 = "d35d2d0aec1219cf98a54ba4fce09935.jpg";
const bathroom = "e3f38b9671267e56fd4b72412dfa1bf9.jpg";

// Each tracked id → the property photo for that logical card. Ids that belong to
// the same card (across scenes / the T3 override) share one photo.
const ID_PHOTO: Record<number, string> = {
  0: living, 9: living, 13: living, // main hero (woman)
  7: dining, 16: dining, // 2nd hero (man)
  1: kitchen, 8: kitchen, // beans / bowl
  4: bathroom, 14: bathroom, // wood / texture
  6: bedroom, 12: bedroom, // record (top-left)
  5: balcony, 15: balcony, // phone (bottom-right)
  2: bedroom2, 10: bedroom2, // forest
  3: balcony, 11: balcony, // car
};
const FALLBACK = kitchen;

// Opening title (test — easy to remove). Fades in at the start, holds, fades out.
const TITLE_IN: [number, number] = [60, 88];
const TITLE_OUT: [number, number] = [116, 140];

export const BentoBoxShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  // Hold at HOLD_AT for HOLD_LEN frames, then resume.
  const df =
    frame < HOLD_AT ? frame : frame < HOLD_AT + HOLD_LEN ? HOLD_AT : frame - HOLD_LEN;
  const idx = Math.max(0, Math.min(BENTO_FRAMES.length - 1, df));
  const boxes = BENTO_FRAMES[idx];

  const titleOpacity =
    interpolate(frame, TITLE_IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (1 - interpolate(frame, TITLE_OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const titleLift = interpolate(frame, TITLE_IN, [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {boxes.map(([id, x, y, w, h]) => {
        const width = w * W;
        const height = h * H;
        return (
          <div
            key={id}
            style={{
              position: "absolute",
              left: x * W,
              top: y * H,
              width,
              height,
              borderRadius: Math.min(RADIUS, width / 2, height / 2),
              overflow: "hidden",
              backgroundColor: "#17171b",
            }}
          >
            <Img
              src={img2(ID_PHOTO[id] ?? FALLBACK)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        );
      })}

      {/* Opening title overlay (test) */}
      {titleOpacity > 0.001 && (
        <>
          <AbsoluteFill
            style={{
              opacity: titleOpacity,
              background:
                "radial-gradient(ellipse at center, rgba(8,10,14,0.55) 0%, rgba(8,10,14,0.2) 45%, rgba(8,10,14,0) 72%)",
            }}
          />
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              opacity: titleOpacity,
              transform: `translateY(${titleLift}px)`,
            }}
          >
            <div
              style={{
                color: "white",
                fontFamily: "system-ui, sans-serif",
                fontSize: 132,
                fontWeight: 800,
                letterSpacing: -3,
                lineHeight: 1,
                textShadow: "0 6px 40px rgba(0,0,0,0.55)",
              }}
            >
              2 BHK
            </div>
            <div
              style={{
                marginTop: 14,
                color: "white",
                fontFamily: "system-ui, sans-serif",
                fontSize: 60,
                fontWeight: 600,
                letterSpacing: 1,
                textShadow: "0 4px 30px rgba(0,0,0,0.55)",
              }}
            >
              Independent Villa
            </div>
          </AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};
