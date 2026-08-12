import { staticFile } from "remotion";

const DIR = "Property Photos";

// Ken Burns pan presets. Values are in percent of the frame; the image is
// scaled up first so the pan never reveals an empty edge.
export type PanPreset =
  | "panRight"
  | "panLeft"
  | "panUp"
  | "panDown"
  | "zoomIn"
  | "zoomOut";

export type Room = {
  id: string;
  file: string;
  kicker: string;
  title: string;
  subtitle: string;
  pan: PanPreset;
};

export const img = (file: string) => staticFile(`${DIR}/${file}`);

// One gentle pan per space. Narration (voiceover) is layered on top of these
// captions — each subtitle mirrors what the narrator would say for that room.
export const ROOMS: Room[] = [
  {
    id: "exterior",
    file: "659948285O-1766875683325.jpg",
    kicker: "The exterior",
    title: "A Bold Modern Elevation",
    subtitle: "Private rooftop terrace & covered parking",
    pan: "zoomIn",
  },
  {
    id: "entrance",
    file: "659948289O-1766875630708.jpg",
    kicker: "The entrance",
    title: "Bright Foyer & Staircase",
    subtitle: "Leads up to a private terrace",
    pan: "panRight",
  },
  {
    id: "living",
    file: "659948291O-1766875597971.jpg",
    kicker: "Living hall",
    title: "Spacious Open Living",
    subtitle: "Premium marble flooring throughout",
    pan: "panLeft",
  },
  {
    id: "kitchen",
    file: "659948287O-1766875621631.jpg",
    kicker: "The kitchen",
    title: "Modern Granite Kitchen",
    subtitle: "Stainless sink with a garden view",
    pan: "panRight",
  },
  {
    id: "utility",
    file: "659948293O-1766875638457.jpg",
    kicker: "Utility area",
    title: "Prep & Storage Counter",
    subtitle: "Extra granite worktop and shelving",
    pan: "panLeft",
  },
  {
    id: "master",
    file: "659948281O-1766875624382.jpg",
    kicker: "Master bedroom",
    title: "Sunlit Master Suite",
    subtitle: "Dual windows, wall-to-wall marble",
    pan: "panRight",
  },
  {
    id: "bedroom-balcony",
    file: "659948297O-1766875706650.jpg",
    kicker: "Bedroom two",
    title: "Bedroom with Balcony",
    subtitle: "Private balcony and attached bath",
    pan: "panLeft",
  },
  {
    id: "bedroom-2",
    file: "659948295O-1766875612658.jpg",
    kicker: "Bedroom three",
    title: "Airy Guest Bedroom",
    subtitle: "Built-in display niche",
    pan: "zoomIn",
  },
  {
    id: "bedroom-3",
    file: "659948283O-1766875648578.jpg",
    kicker: "Extra room",
    title: "Study / Fourth Room",
    subtitle: "Flexible space with open shelving",
    pan: "panRight",
  },
  {
    id: "bathroom",
    file: "659948299O-1766875627765.jpg",
    kicker: "The bathroom",
    title: "Designer Bathroom",
    subtitle: "Statement marble tiling",
    pan: "panUp",
  },
];

// Full-bleed hero shots that cross-dissolve through the opening montage. These
// fill the entire portrait frame — the intro is edge-to-edge, not letterboxed.
export const INTRO_HEROES = [
  "659948285O-1766875683325.jpg", // exterior
  "659948291O-1766875597971.jpg", // living
  "659948287O-1766875621631.jpg", // kitchen
  "659948281O-1766875624382.jpg", // master bedroom
];

export const TOTAL_PHOTOS = ROOMS.length;

// Every photo, for the scrolling-columns ("mosaic") intro.
export const ALL_FILES = ROOMS.map((r) => r.file);

// Speed-ramp hero + rapid-fire match-cut set for the "kinetic" intro.
export const KINETIC = {
  hero: "659948285O-1766875683325.jpg", // exterior — the aggressive push shot
  rapid: [
    "659948291O-1766875597971.jpg", // living
    "659948287O-1766875621631.jpg", // kitchen
    "659948281O-1766875624382.jpg", // bedroom
    "659948299O-1766875627765.jpg", // bathroom
    "659948297O-1766875706650.jpg", // balcony / patio
  ],
};

// Six shots for the full-height 2x3 mosaic ("stack" alt intro).
export const MONTAGE_FILES = [
  "659948285O-1766875683325.jpg", // exterior
  "659948291O-1766875597971.jpg", // living
  "659948287O-1766875621631.jpg", // kitchen
  "659948281O-1766875624382.jpg", // master bedroom
  "659948297O-1766875706650.jpg", // bedroom + balcony
  "659948299O-1766875627765.jpg", // bathroom
];
