import "./index.css";
import { Composition } from "remotion";
import {
  PropertySlideshow,
  slideshowSchema,
  SLIDESHOW_DEFAULTS,
  slideshowDuration,
} from "./PropertySlideshow";
import { SpaShowcase, spaShowcaseDuration } from "./PropertySlideshow/SpaShowcase";
import { BentoShowcase, BENTO_DURATION } from "./PropertySlideshow/BentoShowcase";
import { BentoBoxShowcase, BENTO_BOX_DURATION } from "./PropertySlideshow/BentoBoxShowcase";
import { BentoBoxShowcase2, BENTO_BOX_2_DURATION } from "./PropertySlideshow/BentoBoxShowcase2";
import { BentoBoxFull2, BENTO_BOX_FULL_2_DURATION } from "./PropertySlideshow/BentoBoxFull2";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Recommended — gallery-grid overview intro, built around the 4:3 card
          safe zone. All key content stays inside the visible card crop. */}
      <Composition
        id="PropertySlideshow"
        component={PropertySlideshow}
        durationInFrames={slideshowDuration()}
        fps={30}
        width={1080}
        height={1920}
        schema={slideshowSchema}
        defaultProps={SLIDESHOW_DEFAULTS}
      />
      {/* Alt — full-height 2x3 mosaic that assembles from the edges. */}
      <Composition
        id="PropertySlideshow-Stack"
        component={PropertySlideshow}
        durationInFrames={slideshowDuration()}
        fps={30}
        width={1080}
        height={1920}
        schema={slideshowSchema}
        defaultProps={{ ...SLIDESHOW_DEFAULTS, montageVariant: "stack" }}
      />
      {/* Alt — scrolling 3-column grid, central text, then zoom to fullscreen. */}
      <Composition
        id="PropertySlideshow-Mosaic"
        component={PropertySlideshow}
        durationInFrames={slideshowDuration()}
        fps={30}
        width={1080}
        height={1920}
        schema={slideshowSchema}
        defaultProps={{ ...SLIDESHOW_DEFAULTS, montageVariant: "mosaic" }}
      />
      {/* Alt — 4s of crossfading full-bleed photos with side pans + centered
          title, then the room story. All transitions are crossfades. */}
      <Composition
        id="PropertySlideshow-Cinematic"
        component={PropertySlideshow}
        durationInFrames={slideshowDuration({
          ...SLIDESHOW_DEFAULTS,
          montageDuration: 150,
        })}
        fps={30}
        width={1080}
        height={1920}
        schema={slideshowSchema}
        defaultProps={{
          ...SLIDESHOW_DEFAULTS,
          montageVariant: "cinematic",
          roomTransition: "fade",
          montageDuration: 150,
        }}
      />
      {/* Same cinematic slideshow, rendered at a native 3:4 portrait ratio
          (1080x1440) so it fills a 3:4 listing card with no cropping. Captions
          adapt to the frame size automatically. All other compositions stay 9:16. */}
      <Composition
        id="PropertySlideshow-Cinematic-3x4"
        component={PropertySlideshow}
        durationInFrames={slideshowDuration({
          ...SLIDESHOW_DEFAULTS,
          montageDuration: 150,
        })}
        fps={30}
        width={1080}
        height={1440}
        schema={slideshowSchema}
        defaultProps={{
          ...SLIDESHOW_DEFAULTS,
          montageVariant: "cinematic",
          roomTransition: "fade",
          montageDuration: 150,
        }}
      />

      {/* Product-reel inspired variation (3:4): warm dark bg + particles, an
          intro card-stack, fullscreen rooms with vertical side-labels, and a
          kinetic end card. */}
      <Composition
        id="PropertySlideshow-Spa-3x4"
        component={SpaShowcase}
        durationInFrames={spaShowcaseDuration}
        fps={30}
        width={1080}
        height={1440}
      />

      {/* "Bento One" style replica (3:4, 60fps): full-frame hero photos that
          collapse into asymmetric pinwheel bento grids with accent cards
          springing in from the edges, then a new hero wipes in. */}
      <Composition
        id="PropertySlideshow-Bento-3x4"
        component={BentoShowcase}
        durationInFrames={BENTO_DURATION}
        fps={60}
        width={1080}
        height={1440}
      />

      {/* Frame-accurate grey-box replica of the bento reference clip (453f @
          60fps). Placeholder boxes replicate the exact layout sequence and
          slide/resize movements; photos get dropped in later. */}
      <Composition
        id="PropertySlideshow-BentoBoxes"
        component={BentoBoxShowcase}
        durationInFrames={BENTO_BOX_DURATION}
        fps={60}
        width={1080}
        height={1440}
      />

      {/* Copy of BentoBoxes for iteration. */}
      <Composition
        id="PropertySlideshow-BentoBoxes-2"
        component={BentoBoxShowcase2}
        durationInFrames={BENTO_BOX_2_DURATION}
        fps={60}
        width={1080}
        height={1440}
      />

      {/* Bento animation → room-by-room slideshow with crossfades (60fps 3:4). */}
      <Composition
        id="PropertySlideshow-BentoFull-2"
        component={BentoBoxFull2}
        durationInFrames={BENTO_BOX_FULL_2_DURATION}
        fps={60}
        width={1080}
        height={1440}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
    </>
  );
};
