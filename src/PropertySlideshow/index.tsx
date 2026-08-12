import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { z } from "zod";
import { FullBleedMontage } from "./FullBleedMontage";
import { OverviewMontage } from "./OverviewMontage";
import { KineticMontage } from "./KineticMontage";
import { MosaicScrollMontage } from "./MosaicScrollMontage";
import { CinematicFadeMontage } from "./CinematicFadeMontage";
import { RoomScene } from "./RoomScene";
import { ROOMS } from "./photos";

export const slideshowSchema = z.object({
  montageVariant: z.enum([
    "gallery",
    "stack",
    "kinetic",
    "mosaic",
    "cinematic",
  ]),
  roomTransition: z.enum(["mixed", "fade"]),
  montageDuration: z.number().min(60).max(240),
  roomDuration: z.number().min(45).max(150),
  transitionDuration: z.number().min(6).max(30),
});

// 30-second slideshow at 30fps:
//   montage 150 + 10 rooms x 90 = 1050 sequence frames
//   minus 10 transitions x 15   = 150 overlapped frames
//   => 900 frames = 30s exactly
export const SLIDESHOW_DEFAULTS: z.infer<typeof slideshowSchema> = {
  montageVariant: "gallery",
  roomTransition: "mixed",
  montageDuration: 150,
  roomDuration: 90,
  transitionDuration: 15,
};

export const PropertySlideshow: React.FC<z.infer<typeof slideshowSchema>> = ({
  montageVariant,
  roomTransition,
  montageDuration,
  roomDuration,
  transitionDuration,
}) => {
  const timing = linearTiming({ durationInFrames: transitionDuration });
  const Montage =
    montageVariant === "stack"
      ? OverviewMontage
      : montageVariant === "kinetic"
        ? KineticMontage
        : montageVariant === "mosaic"
          ? MosaicScrollMontage
          : montageVariant === "cinematic"
            ? CinematicFadeMontage
            : FullBleedMontage;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0f12" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={montageDuration}>
          <Montage />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        {ROOMS.map((room, i) => (
          <React.Fragment key={room.id}>
            <TransitionSeries.Sequence durationInFrames={roomDuration}>
              <RoomScene room={room} durationInFrames={roomDuration} />
            </TransitionSeries.Sequence>
            {i < ROOMS.length - 1 && (
              <TransitionSeries.Transition
                presentation={
                  roomTransition === "fade"
                    ? fade()
                    : i % 2 === 0
                      ? slide({ direction: "from-right" })
                      : fade()
                }
                timing={timing}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Total duration derived from props so Root and render stay in sync.
export const slideshowDuration = (
  p: z.infer<typeof slideshowSchema> = SLIDESHOW_DEFAULTS,
) =>
  p.montageDuration +
  ROOMS.length * p.roomDuration -
  ROOMS.length * p.transitionDuration;
