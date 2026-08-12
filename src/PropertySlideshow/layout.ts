import { useVideoConfig } from "remotion";

// The video renders at 9:16 portrait, but on listing cards only a centered 4:3
// crop is shown until the user taps to expand. Cropping a portrait frame to 4:3
// keeps the full WIDTH and trims the TOP and BOTTOM, so the safe zone is a
// horizontal band: every caption and the overview grid must stay inside it.
export const VIDEO = { width: 1080, height: 1920 };

const CARD_ASPECT = 4 / 3; // width : height of the visible card crop
const safeHeight = Math.round(VIDEO.width / CARD_ASPECT); // 810

export const CARD_SAFE = {
  top: Math.round((VIDEO.height - safeHeight) / 2), // 555
  height: safeHeight, // 810
  left: 0,
  width: VIDEO.width, // full width is always visible
};

// Distance from the frame's bottom edge up to the safe band's bottom edge
// (this lower strip is only shown when the card is tapped to expand).
export const SAFE_BOTTOM_OFFSET =
  VIDEO.height - (CARD_SAFE.top + CARD_SAFE.height); // 555

// Size-aware safe zone, derived from the actual composition dimensions. The
// listing-card crop is 3:4 portrait (width:height = 3:4), so the safe height is
// width * 4/3. At 9:16 this is a centered band (top/bottom get cropped on the
// card); at a native 3:4 ratio it fills the whole frame.
export const useCardSafe = () => {
  const { width, height } = useVideoConfig();
  const safeH = Math.min(height, Math.round((width * 4) / 3));
  const top = Math.round((height - safeH) / 2);
  return { top, height: safeH, bottomOffset: height - top - safeH };
};
