import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { PanPreset } from "./photos";

// Start/end transforms for each pan. The image is always scaled above 1 so the
// translation stays inside the frame.
const PANS: Record<PanPreset, { from: Move; to: Move }> = {
  zoomIn: { from: { s: 1.06, x: 0, y: 0 }, to: { s: 1.2, x: 0, y: 0 } },
  zoomOut: { from: { s: 1.2, x: 0, y: 0 }, to: { s: 1.06, x: 0, y: 0 } },
  panRight: { from: { s: 1.14, x: -3.5, y: 0 }, to: { s: 1.14, x: 3.5, y: 0 } },
  panLeft: { from: { s: 1.14, x: 3.5, y: 0 }, to: { s: 1.14, x: -3.5, y: 0 } },
  panUp: { from: { s: 1.16, x: 0, y: 3 }, to: { s: 1.16, x: 0, y: -3 } },
  panDown: { from: { s: 1.16, x: 0, y: -3 }, to: { s: 1.16, x: 0, y: 3 } },
};

type Move = { s: number; x: number; y: number };

export const KenBurnsImage: React.FC<{
  src: string;
  pan: PanPreset;
  durationInFrames: number;
}> = ({ src, pan, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { from, to } = PANS[pan];

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = from.s + (to.s - from.s) * progress;
  const x = from.x + (to.x - from.x) * progress;
  const y = from.y + (to.y - from.y) * progress;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0d0f12" }}>
      <img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${x}%, ${y}%)`,
          willChange: "transform",
        }}
      />
    </AbsoluteFill>
  );
};
