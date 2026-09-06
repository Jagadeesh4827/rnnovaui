import {
  createOpacity,
  createInterpolation,
  createScale,
  createTranslate,
  createRotate,
} from "./helpers";

export function getRNNovaAnimationStyle({
  animationStyle,
  progress,
  loopValue,
  distance = 24,
}) {
  const opacity = createOpacity(progress);

  switch (animationStyle) {
    /*
     * None
     */
    case "none":
      return {
        opacity: 1,
        transform: [],
      };

    /*
     * Fade
     */
    case "fade":
    case "fadeIn":
      return {
        opacity,
        transform: [],
      };

    case "fadeOut":
      return {
        opacity: createOpacity(progress, 1, 0),
        transform: [],
      };

    /*
     * Zoom
     */
    case "zoom":
    case "zoomIn":
      return {
        opacity,

        transform: [
          {
            scale: createScale(progress, 0.85, 1),
          },
        ],
      };

    case "zoomOut":
      return {
        opacity: createOpacity(progress, 1, 0),

        transform: [
          {
            scale: createScale(progress, 1, 0.85),
          },
        ],
      };

    /*
     * Pop
     */
    case "pop":
    case "popIn":
      return {
        opacity,

        transform: [
          {
            scale: createInterpolation(progress, [0, 0.7, 1], [0.7, 1.08, 1]),
          },
        ],
      };

    case "popOut":
      return {
        opacity: createOpacity(progress, 1, 0),

        transform: [
          {
            scale: createInterpolation(progress, [0, 0.4, 1], [1, 1.08, 0.7]),
          },
        ],
      };

    /*
     * Bounce
     */
    case "bounce":
    case "bounceIn":
      return {
        opacity,

        transform: [
          {
            scale: createInterpolation(
              progress,
              [0, 0.65, 0.85, 1],
              [0.6, 1.12, 0.95, 1],
            ),
          },
        ],
      };

    case "bounceOut":
      return {
        opacity: createOpacity(progress, 1, 0),

        transform: [
          {
            scale: createInterpolation(progress, [0, 0.3, 1], [1, 1.1, 0.5]),
          },
        ],
      };

    /*
     * Slide
     */
    case "slideIn":
    case "slideUp":
      return {
        opacity,

        transform: [
          {
            translateY: createTranslate(progress, distance, 0),
          },
        ],
      };

    case "slideDown":
      return {
        opacity,

        transform: [
          {
            translateY: createTranslate(progress, -distance, 0),
          },
        ],
      };

    case "slideLeft":
      return {
        opacity,

        transform: [
          {
            translateX: createTranslate(progress, distance, 0),
          },
        ],
      };

    case "slideRight":
      return {
        opacity,

        transform: [
          {
            translateX: createTranslate(progress, -distance, 0),
          },
        ],
      };

    case "slideOut":
      return {
        opacity: createOpacity(progress, 1, 0),

        transform: [
          {
            translateY: createTranslate(progress, 0, -distance),
          },
        ],
      };

    /*
     * Spring styles
     */
    case "spring":
    case "elastic":
    case "rubberBand":
    case "jelly":
    case "overshoot":
    case "recoil":
      return {
        opacity,

        transform: [
          {
            scale: createScale(progress, 0.8, 1),
          },
        ],
      };

    /*
     * Attention
     */
    case "pulse":
      return {
        opacity: 1,

        transform: [
          {
            scale: createInterpolation(loopValue, [0, 1], [1, 1.06]),
          },
        ],
      };

    case "breathing":
    case "breath":
      return {
        opacity: createInterpolation(loopValue, [0, 1], [0.85, 1]),

        transform: [
          {
            scale: createInterpolation(loopValue, [0, 1], [0.98, 1.04]),
          },
        ],
      };

    case "blink":
      return {
        opacity: createInterpolation(loopValue, [0, 1], [1, 0.2]),

        transform: [],
      };

    case "heartbeat":
      return {
        opacity: 1,

        transform: [
          {
            scale: createInterpolation(
              loopValue,
              [0, 0.45, 0.7, 1],
              [1, 1.12, 0.98, 1.06],
            ),
          },
        ],
      };

    case "shake":
      return {
        opacity: 1,

        transform: [
          {
            translateX: createInterpolation(
              progress,
              [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
              [0, -8, 8, -6, 6, -3, 0],
            ),
          },
        ],
      };

    case "wobble":
      return {
        opacity: 1,

        transform: [
          {
            rotate: createInterpolation(
              progress,
              [0, 0.25, 0.5, 0.75, 1],
              ["0deg", "-4deg", "4deg", "-2deg", "0deg"],
            ),
          },
        ],
      };

    case "jiggle":
      return {
        opacity: 1,

        transform: [
          {
            translateY: createInterpolation(
              progress,
              [0, 0.25, 0.5, 0.75, 1],
              [0, -4, 4, -2, 0],
            ),
          },
        ],
      };

    /*
     * Motion
     */
    case "float":
    case "hover":
      return {
        opacity: 1,

        transform: [
          {
            translateY: createInterpolation(loopValue, [0, 1], [0, -10]),
          },
        ],
      };

    case "levitate":
      return {
        opacity: 1,

        transform: [
          {
            translateY: createInterpolation(loopValue, [0, 1], [0, -16]),
          },
        ],
      };

    case "bob":
      return {
        opacity: 1,

        transform: [
          {
            translateY: createInterpolation(loopValue, [0, 1], [4, -4]),
          },
        ],
      };

    case "drift":
      return {
        opacity: 1,

        transform: [
          {
            translateX: createInterpolation(loopValue, [0, 1], [-6, 6]),
          },

          {
            translateY: createInterpolation(loopValue, [0, 1], [3, -3]),
          },
        ],
      };

    case "sway":
    case "wind":
      return {
        opacity: 1,

        transform: [
          {
            rotate: createInterpolation(loopValue, [0, 1], ["-3deg", "3deg"]),
          },
        ],
      };

    case "spin":
    case "rotate":
      return {
        opacity: 1,

        transform: [
          {
            rotate: createRotate(loopValue, "0deg", "360deg"),
          },
        ],
      };

    case "orbit":
      return {
        opacity: 1,

        transform: [
          {
            translateX: createInterpolation(loopValue, [0, 0.5, 1], [0, 10, 0]),
          },

          {
            translateY: createInterpolation(
              loopValue,
              [0, 0.5, 1],
              [-10, 10, -10],
            ),
          },
        ],
      };

    case "pendulum":
    case "swing":
      return {
        opacity: 1,

        transform: [
          {
            rotate: createInterpolation(loopValue, [0, 1], ["-8deg", "8deg"]),
          },
        ],
      };

    /*
     * Flip
     */
    case "flip":
    case "flipIn":
      return {
        opacity,

        transform: [
          {
            perspective: 1000,
          },

          {
            rotateY: createInterpolation(progress, [0, 1], ["90deg", "0deg"]),
          },
        ],
      };

    case "flipOut":
      return {
        opacity: createOpacity(progress, 1, 0),

        transform: [
          {
            perspective: 1000,
          },

          {
            rotateY: createInterpolation(progress, [0, 1], ["0deg", "90deg"]),
          },
        ],
      };

    /*
     * 3D-like
     */
    case "tilt":
      return {
        opacity: 1,

        transform: [
          {
            perspective: 1000,
          },

          {
            rotateX: createInterpolation(
              progress,
              [0, 0.5, 1],
              ["0deg", "8deg", "0deg"],
            ),
          },
        ],
      };

    case "rotate3D":
      return {
        opacity: 1,

        transform: [
          {
            perspective: 1000,
          },

          {
            rotateY: createInterpolation(progress, [0, 1], ["0deg", "180deg"]),
          },
        ],
      };

    case "cardFlip":
      return {
        opacity: 1,

        transform: [
          {
            perspective: 1000,
          },

          {
            rotateY: createInterpolation(
              progress,
              [0, 0.5, 1],
              ["0deg", "90deg", "180deg"],
            ),
          },
        ],
      };

    case "door":
      return {
        opacity,

        transform: [
          {
            perspective: 1000,
          },

          {
            rotateY: createInterpolation(progress, [0, 1], ["-90deg", "0deg"]),
          },
        ],
      };

    /*
     * Expand / Collapse
     */
    case "expandIn":
      return {
        opacity,

        transform: [
          {
            scaleY: createScale(progress, 0, 1),
          },
        ],
      };

    case "collapseOut":
      return {
        opacity: createOpacity(progress, 1, 0),

        transform: [
          {
            scaleY: createScale(progress, 1, 0),
          },
        ],
      };

    /*
     * Drop
     */
    case "dropIn":
      return {
        opacity,

        transform: [
          {
            translateY: createTranslate(progress, -distance * 2, 0),
          },
        ],
      };

    case "dropOut":
      return {
        opacity: createOpacity(progress, 1, 0),

        transform: [
          {
            translateY: createTranslate(progress, 0, distance * 2),
          },
        ],
      };

    /*
     * Approximation presets
     */
    case "ripple":
    case "rippleExpand":
      return {
        opacity: createInterpolation(progress, [0, 0.7, 1], [0, 1, 0]),

        transform: [
          {
            scale: createInterpolation(progress, [0, 1], [0.2, 1.5]),
          },
        ],
      };

    case "waterDrop":
      return {
        opacity,

        transform: [
          {
            scaleX: createInterpolation(progress, [0, 0.5, 1], [0.8, 1.15, 1]),
          },

          {
            scaleY: createInterpolation(progress, [0, 0.5, 1], [1.15, 0.85, 1]),
          },
        ],
      };

    case "morph":
    case "shapeMorph":
    case "blobMorph":
    case "liquidMorph":
      return {
        opacity: 1,

        transform: [
          {
            scaleX: createInterpolation(loopValue, [0, 1], [0.95, 1.08]),
          },

          {
            scaleY: createInterpolation(loopValue, [0, 1], [1.06, 0.94]),
          },
        ],
      };

    case "magnetic":
    case "attract":
    case "follow":
      return {
        opacity: 1,

        transform: [
          {
            translateX: createInterpolation(progress, [0, 1], [-distance, 0]),
          },
        ],
      };

    case "repel":
    case "avoid":
      return {
        opacity: 1,

        transform: [
          {
            translateX: createInterpolation(progress, [0, 1], [0, distance]),
          },
        ],
      };

    case "snap":
    case "snapToTarget":
    case "dock":
      return {
        opacity: 1,

        transform: [
          {
            scale: createInterpolation(progress, [0, 0.7, 1], [0.9, 1.08, 1]),
          },
        ],
      };

    case "portal":
      return {
        opacity,

        transform: [
          {
            scale: createInterpolation(progress, [0, 1], [0.2, 1]),
          },

          {
            rotate: createInterpolation(progress, [0, 1], ["-180deg", "0deg"]),
          },
        ],
      };

    case "teleport":
      return {
        opacity: createInterpolation(progress, [0, 0.4, 0.6, 1], [0, 0, 1, 1]),

        transform: [
          {
            scale: createInterpolation(
              progress,
              [0, 0.4, 0.6, 1],
              [0.1, 0.1, 1.1, 1],
            ),
          },
        ],
      };

    default:
      return {
        opacity: 1,
        transform: [],
      };
  }
}
