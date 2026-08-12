import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { BentoBoxShowcase2, BENTO_BOX_2_DURATION } from "./BentoBoxShowcase2";
import { RoomScene } from "./RoomScene";
import type { Room } from "./photos";

const DIR = "property photos 2";
const img2 = (f: string) => staticFile(`${DIR}/${f}`);

const ROOMS_2: Room[] = [
  {
    id: "living",
    file: "a5e79b0cd96f9e12a71e0b0cee196fbf.jpg",
    kicker: "Living hall",
    title: "Open-Plan Living",
    subtitle: "Warm tones with premium flooring",
    pan: "panRight",
  },
  {
    id: "kitchen",
    file: "60eff5d6f1a1ee1837db965a10a78f05.jpg",
    kicker: "The kitchen",
    title: "Modern Kitchen",
    subtitle: "Sleek countertops and ample storage",
    pan: "panLeft",
  },
  {
    id: "dining",
    file: "1ba1fce5b02236f3edfeb575cfbcb0f1.jpg",
    kicker: "Dining area",
    title: "Dining Space",
    subtitle: "Adjacent to kitchen for easy entertaining",
    pan: "panRight",
  },
  {
    id: "bedroom",
    file: "cea653c62600a3e54d98b2dac99e67e7.jpg",
    kicker: "Master bedroom",
    title: "Sunlit Master Suite",
    subtitle: "Spacious with natural light",
    pan: "panLeft",
  },
  {
    id: "bedroom2",
    file: "d35d2d0aec1219cf98a54ba4fce09935.jpg",
    kicker: "Bedroom two",
    title: "Cozy Second Bedroom",
    subtitle: "Versatile space with clean lines",
    pan: "panRight",
  },
  {
    id: "balcony",
    file: "436040661c04bb791bc3d295edbcb5ab.jpg",
    kicker: "The balcony",
    title: "Private Balcony",
    subtitle: "Open air with a garden view",
    pan: "zoomIn",
  },
  {
    id: "bathroom",
    file: "e3f38b9671267e56fd4b72412dfa1bf9.jpg",
    kicker: "The bathroom",
    title: "Designer Bathroom",
    subtitle: "Statement tiling throughout",
    pan: "panUp",
  },
];

const ROOM_DUR = 180; // 3s at 60fps
const TRANS_DUR = 20; // ~0.33s crossfade at 60fps

export const BENTO_BOX_FULL_2_DURATION =
  BENTO_BOX_2_DURATION +
  ROOMS_2.length * ROOM_DUR -
  ROOMS_2.length * TRANS_DUR;

export const BentoBoxFull2: React.FC = () => {
  const timing = linearTiming({ durationInFrames: TRANS_DUR });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0d10" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={BENTO_BOX_2_DURATION}>
          <BentoBoxShowcase2 />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        {ROOMS_2.map((room, i) => (
          <React.Fragment key={room.id}>
            <TransitionSeries.Sequence durationInFrames={ROOM_DUR}>
              <RoomScene room={room} durationInFrames={ROOM_DUR} imgSrc={img2(room.file)} />
            </TransitionSeries.Sequence>
            {i < ROOMS_2.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={timing}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
