import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BENTO_FRAMES } from "./bentoData";

const W = 1080;
const H = 1440;

const SPEED = 1.2;
const CUT_START = 232;
const CUT_END = 319;
const CUT_LEN = CUT_END - CUT_START;
const HOLD_AT = Math.round(93 / SPEED);
const HOLD_LEN = Math.round(21 / SPEED);
const SLOW_DATA = 200;
const SLOW_ADJ = Math.ceil(SLOW_DATA / SPEED);
const SLOW_RATE = 0.6;
const SLOW_FRAMES = Math.ceil((CUT_START - SLOW_DATA) / SLOW_RATE);
const HOLD2_ADJ = SLOW_ADJ + SLOW_FRAMES;
const HOLD2_VIS = 8;
const RAMP_FRAMES = 30;
const RAMP_DATA = RAMP_FRAMES * (SLOW_RATE + SPEED) / 2;
const POST_RAMP_DATA = BENTO_FRAMES.length - 1 - CUT_END - RAMP_DATA;
const POST_HOLD_ADJ = RAMP_FRAMES + Math.ceil(Math.max(0, POST_RAMP_DATA) / SPEED);
export const BENTO_BOX_2_DURATION =
  HOLD2_ADJ + HOLD2_VIS + POST_HOLD_ADJ + HOLD_LEN + 1;

const RIGHT_MARGIN = 0.9852;
const GAP = 0.0148;

const BG = "#0d0d10";
const RADIUS = 26;

const DIR = "property photos 2";
const img2 = (f: string) => staticFile(`${DIR}/${f}`);
const dining = "1ba1fce5b02236f3edfeb575cfbcb0f1.jpg";
const balcony = "436040661c04bb791bc3d295edbcb5ab.jpg";
const kitchen = "60eff5d6f1a1ee1837db965a10a78f05.jpg";
const living = "a5e79b0cd96f9e12a71e0b0cee196fbf.jpg";
const bedroom = "cea653c62600a3e54d98b2dac99e67e7.jpg";
const bedroom2 = "d35d2d0aec1219cf98a54ba4fce09935.jpg";
const bathroom = "e3f38b9671267e56fd4b72412dfa1bf9.jpg";

const ID_PHOTO: Record<number, string> = {
  0: living, 9: living, 13: living,
  7: dining, 16: dining,
  1: kitchen, 8: kitchen,
  4: bedroom2, 14: bedroom2,
  6: bedroom, 12: bedroom,
  5: balcony, 15: balcony,
  2: bedroom2, 10: bedroom2,
  3: balcony, 11: balcony,
};
const FALLBACK = kitchen;

const REMOVE_IDS = new Set([3, 11]);
const STRETCH_IDS = new Set([2, 10]);
const HALF_H = 0.2361;
const FULL_H = 0.4833;

function patchBoxes(
  raw: (readonly [number, number, number, number, number])[],
  dataIdx: number,
) {
  // Before the cut point, also remove id 4 (dining slide-in we're cutting).
  const skipIds =
    dataIdx < CUT_END ? new Set([...REMOVE_IDS, 4]) : REMOVE_IDS;

  const filtered = raw.filter((b) => !skipIds.has(b[0]));

  const id1 = raw.find((b) => b[0] === 1);

  return filtered.map((b) => {
    if (STRETCH_IDS.has(b[0])) {
      const rem = raw.find(
        (r) => REMOVE_IDS.has(r[0]) && Math.abs(r[1] - b[1]) < 0.15,
      );
      let newH = b[4];
      let newX = b[1];
      let newW = b[3];
      if (rem) {
        newH = rem[2] + rem[4] - b[2];
        newX = Math.min(b[1], rem[1]);
        newW = Math.max(b[1] + b[3], rem[1] + rem[3]) - newX;
      } else if (Math.abs(b[4] - HALF_H) < 0.01) {
        newH = FULL_H;
      }
      // id 2: keep right edge at the frame margin, expand left as kitchen exits.
      if (b[0] === 2 && dataIdx >= 188) {
        const leftEdge = id1 ? id1[1] + id1[3] + GAP : GAP;
        newX = leftEdge;
        newW = RIGHT_MARGIN - leftEdge;
      }
      return [b[0], newX, b[2], newW, newH] as const;
    }
    return b;
  });
}

const TITLE_IN: [number, number] = [Math.round(60 / SPEED), Math.round(88 / SPEED)];
const TITLE_OUT: [number, number] = [Math.round(116 / SPEED), Math.round(140 / SPEED)];

export const BentoBoxShowcase2: React.FC = () => {
  const frame = useCurrentFrame();
  let adj = frame;
  if (adj >= HOLD_AT) {
    adj = adj < HOLD_AT + HOLD_LEN ? HOLD_AT : adj - HOLD_LEN;
  }
  let inHold2 = false;
  if (adj >= HOLD2_ADJ) {
    if (adj < HOLD2_ADJ + HOLD2_VIS) {
      adj = HOLD2_ADJ;
      inHold2 = true;
    } else {
      adj -= HOLD2_VIS;
    }
  }
  let dataIdx;
  const pastHold2 = !inHold2 && adj >= HOLD2_ADJ;
  if (inHold2) {
    dataIdx = CUT_START;
  } else if (pastHold2) {
    const f = adj - HOLD2_ADJ;
    if (f < RAMP_FRAMES) {
      const cumulative = f * SLOW_RATE + (f * f * (SPEED - SLOW_RATE)) / (2 * RAMP_FRAMES);
      dataIdx = CUT_END + Math.floor(cumulative);
    } else {
      dataIdx = CUT_END + Math.floor(RAMP_DATA + (f - RAMP_FRAMES) * SPEED);
    }
  } else if (adj >= SLOW_ADJ) {
    dataIdx = SLOW_DATA + Math.floor((adj - SLOW_ADJ) * SLOW_RATE);
  } else {
    dataIdx = Math.floor(adj * SPEED);
  }
  dataIdx = Math.max(0, Math.min(BENTO_FRAMES.length - 1, dataIdx));
  const boxes = patchBoxes(BENTO_FRAMES[dataIdx], dataIdx);

  const titleOpacity =
    interpolate(frame, TITLE_IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (1 - interpolate(frame, TITLE_OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const titleLift = interpolate(frame, TITLE_IN, [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {boxes.map(([id, x, y, w, h]) => {
        const width = w * W;
        const height = h * H;
        const bottomAnchored = h < 0.4 && y > 0.5 && STRETCH_IDS.has(id);
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
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: bottomAnchored ? "top" : "center",
              }}
            />
          </div>
        );
      })}

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
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                color: "rgba(255,255,255,0.92)",
                fontFamily: "system-ui, sans-serif",
                fontSize: 32,
                fontWeight: 500,
                letterSpacing: 4,
                textTransform: "uppercase",
                textShadow: "0 4px 30px rgba(0,0,0,0.55)",
              }}
            >
              <span style={{ width: 40, height: 2, background: "rgba(255,255,255,0.6)" }} />
              Ready to move
              <span style={{ width: 40, height: 2, background: "rgba(255,255,255,0.6)" }} />
            </div>
          </AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};
