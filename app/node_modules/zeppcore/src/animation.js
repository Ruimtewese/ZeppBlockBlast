/*
 * =========================================================
 * ZEPPCORE ANIMATION
 * =========================================================
 *
 * Native PROPERTY animation for Zepp OS widgets.
 *
 * This is NOT frame/image animation.
 *
 * It animates widget properties directly:
 *
 *   X
 *   Y
 *   W
 *   H
 *   ALPHA
 *
 * Supported easing:
 *
 *   linear
 *   easein
 *   easeout
 *   easeinout
 *   bounce
 *
 * Zepp OS also supports:
 *
 *   delay / offset
 *   repeat
 *   FPS
 *   complete callbacks
 *   repeat callbacks
 *   frame callbacks
 *   start
 *   stop
 *   pause
 *   resume
 *
 * =========================================================
 *
 * Example:
 *
 * const animation =
 *   animate(textWidget, {
 *     x: [20, 100],
 *     duration: 500,
 *     easing: "easeout"
 *   });
 *
 *
 * Or:
 *
 * fadeIn(textWidget);
 *
 *
 * Or:
 *
 * slideIn(textWidget, {
 *   from: "left"
 * });
 *
 *
 * For a pill:
 *
 * const pill =
 *   pill(...);
 *
 * animatePill(pill, {
 *   from: "small",
 *   to: "normal"
 * });
 *
 * =========================================================
 */


/* =========================================================
 * NATIVE ZEP OS ANIMATION API
 * ========================================================= */

import {
  prop,
  anim_status
} from "@zos/ui";


/* =========================================================
 * INTERNAL ANIMATION REGISTRY
 * =========================================================
 *
 * Keeps track of animations created through ZeppCore.
 *
 * This allows:
 *
 *   stopAllAnimations()
 *   pauseAllAnimations()
 *   resumeAllAnimations()
 *
 * and makes individual animation handles easier to use.
 */

const animationRegistry =
  new Map();


let nextAnimationHandleId =
  1;


/* =========================================================
 * SUPPORTED PROPERTIES
 * ========================================================= */


/**
 * Native properties that Zepp OS allows to animate.
 */
export const ANIM_X =
  prop.X;

export const ANIM_Y =
  prop.Y;

export const ANIM_W =
  prop.W;

export const ANIM_H =
  prop.H;

export const ANIM_ALPHA =
  prop.ALPHA;


/* =========================================================
 * EASING
 * ========================================================= */


/**
 * Zepp OS supported easing names.
 */
export const EASE_LINEAR =
  "linear";

export const EASE_IN =
  "easein";

export const EASE_OUT =
  "easeout";

export const EASE_IN_OUT =
  "easeinout";

export const EASE_BOUNCE =
  "bounce";


/**
 * Validate and normalize an easing value.
 */
export function normalizeEasing(
  easing = EASE_LINEAR
) {
  const value =
    String(easing)
      .toLowerCase();

  switch (value) {

    case "linear":
      return EASE_LINEAR;

    case "easein":
      return EASE_IN;

    case "easeout":
      return EASE_OUT;

    case "easeinout":
      return EASE_IN_OUT;

    case "bounce":
      return EASE_BOUNCE;

    default:
      throw new Error(
        `Unsupported ZeppCore easing: ${easing}`
      );
  }
}


/* =========================================================
 * ANIMATION STATUS
 * ========================================================= */


/**
 * Start an animation.
 */
export const ANIM_START =
  anim_status.START;


/**
 * Stop an animation.
 */
export const ANIM_STOP =
  anim_status.STOP;


/**
 * Pause an animation.
 */
export const ANIM_PAUSE =
  anim_status.PAUSE;


/**
 * Resume an animation.
 */
export const ANIM_RESUME =
  anim_status.RESUME;


/* =========================================================
 * BASIC ANIMATION
 * ========================================================= */


/**
 * Create a native property animation on one widget.
 *
 * The main function used by this entire module.
 *
 * Example:
 *
 * animate(widget, {
 *   x: [20, 200],
 *   duration: 500,
 *   easing: "easeout"
 * });
 *
 *
 * Multiple properties:
 *
 * animate(widget, {
 *   x: [20, 100],
 *   y: [200, 150],
 *   alpha: [0, 255],
 *   duration: 500
 * });
 *
 *
 * Different timings:
 *
 * animate(widget, {
 *   x: {
 *     from: 20,
 *     to: 100,
 *     duration: 500,
 *     easing: "easeout"
 *   },
 *
 *   y: {
 *     from: 200,
 *     to: 150,
 *     duration: 300,
 *     offset: 100
 *   }
 * });
 *
 *
 * Returns an AnimationHandle.
 */
export function animate(
  target,
  options = {}
) {

  validateWidget(
    target
  );


  const steps =
    buildSteps(
      options
    );


  if (
    steps.length === 0
  ) {
    throw new Error(
      "ZeppCore animate() requires at least one animatable property."
    );
  }


  const config = {

    anim_steps:
      steps,

    anim_fps:
      options.fps ??
      25,

    anim_auto_start:
      options.autoStart ===
      false
        ? 0
        : 1,

    anim_auto_destroy:
      options.autoDestroy ===
      false
        ? 0
        : 1,

    anim_repeat:
      normalizeRepeat(
        options.repeat
      )
  };


  if (
    typeof options.onFrame ===
    "function"
  ) {
    config.anim_frame_func =
      options.onFrame;
  }


  if (
    typeof options.onComplete ===
    "function"
  ) {
    config.anim_complete_func =
      options.onComplete;
  }


  if (
    typeof options.onRepeat ===
    "function"
  ) {
    config.anim_repeat_func =
      options.onRepeat;
  }


  const nativeId =
    target.setProperty(
      prop.ANIM,
      config
    );


  const handle =
    createAnimationHandle(
      target,
      nativeId,
      options
    );


  if (
    options.autoStart ===
    false
  ) {
    /*
     * Native anim_auto_start=0 already keeps it stopped.
     */
  }


  return handle;
}


/* =========================================================
 * BUILD ANIMATION STEPS
 * ========================================================= */


/**
 * Convert convenient property options into native
 * anim_config objects.
 */
function buildSteps(
  options
) {
  const steps = [];


  /*
   * -------------------------------------------------------
   * X
   * -------------------------------------------------------
   */

  if (
    options.x !==
    undefined
  ) {

    steps.push(
      makeStep(
        prop.X,
        options.x,
        options
      )
    );

  }


  /*
   * -------------------------------------------------------
   * Y
   * -------------------------------------------------------
   */

  if (
    options.y !==
    undefined
  ) {

    steps.push(
      makeStep(
        prop.Y,
        options.y,
        options
      )
    );

  }


  /*
   * -------------------------------------------------------
   * WIDTH
   * -------------------------------------------------------
   */

  if (
    options.w !==
    undefined
  ) {

    steps.push(
      makeStep(
        prop.W,
        options.w,
        options
      )
    );

  }


  /*
   * -------------------------------------------------------
   * HEIGHT
   * -------------------------------------------------------
   */

  if (
    options.h !==
    undefined
  ) {

    steps.push(
      makeStep(
        prop.H,
        options.h,
        options
      )
    );

  }


  /*
   * -------------------------------------------------------
   * ALPHA
   * -------------------------------------------------------
   */

  if (
    options.alpha !==
    undefined
  ) {

    steps.push(
      makeStep(
        prop.ALPHA,
        options.alpha,
        options
      )
    );

  }


  /*
   * -------------------------------------------------------
   * CUSTOM STEPS
   * -------------------------------------------------------
   *
   * Allows direct native-property animation.
   *
   * Example:
   *
   * steps: [
   *   {
   *     property: prop.X,
   *     from: 20,
   *     to: 200
   *   }
   * ]
   */

  if (
    Array.isArray(
      options.steps
    )
  ) {

    for (
      const step of
      options.steps
    ) {

      if (
        !step
      ) {
        continue;
      }


      if (
        step.anim_prop !==
        undefined
      ) {

        steps.push(
          normalizeNativeStep(
            step
          )
        );

      } else {

        steps.push(
          makeStep(
            step.property,
            {
              from:
                step.from,
              to:
                step.to,

              duration:
                step.duration,

              easing:
                step.easing,

              offset:
                step.offset
            },

            options
          )
        );

      }
    }
  }


  return steps;
}


/**
 * Create one native Zepp animation step.
 */
function makeStep(
  nativeProperty,
  definition,
  globalOptions
) {

  let from;
  let to;
  let duration;
  let easing;
  let offset;


  /*
   * Array shorthand:
   *
   * x: [20, 100]
   */

  if (
    Array.isArray(
      definition
    )
  ) {

    from =
      definition[0];

    to =
      definition[1];

    duration =
      globalOptions.duration;

    easing =
      globalOptions.easing;

    offset =
      globalOptions.offset;

  }


  /*
   * Object form:
   *
   * x: {
   *   from: 20,
   *   to: 100,
   *   duration: 600
   * }
   */

  else if (
    definition &&
    typeof definition ===
      "object"
  ) {

    from =
      definition.from;

    to =
      definition.to;

    duration =
      definition.duration ??
      globalOptions.duration;

    easing =
      definition.easing ??
      globalOptions.easing;

    offset =
      definition.offset ??
      globalOptions.offset;

  }


  else {
    throw new TypeError(
      "Animation property must be [from, to] or an animation configuration object."
    );
  }


  if (
    from ===
    undefined ||
    to ===
    undefined
  ) {
    throw new Error(
      "Animation requires both from and to values."
    );
  }


  const step = {

    anim_prop:
      nativeProperty,

    anim_from:
      Number(from),

    anim_to:
      Number(to),

    anim_rate:
      normalizeEasing(
        easing ??
        EASE_LINEAR
      ),

    anim_duration:
      Number(
        duration ??
        300
      )
  };


  if (
    offset !==
    undefined
  ) {
    step.anim_offset =
      Number(offset);
  }


  return step;
}


/**
 * Normalize an already-native step.
 */
function normalizeNativeStep(
  step
) {

  const result = {
    anim_prop:
      step.anim_prop,

    anim_from:
      Number(
        step.anim_from
      ),

    anim_to:
      Number(
        step.anim_to
      ),

    anim_rate:
      normalizeEasing(
        step.anim_rate ??
        EASE_LINEAR
      ),

    anim_duration:
      Number(
        step.anim_duration ??
        300
      )
  };


  if (
    step.anim_offset !==
    undefined
  ) {
    result.anim_offset =
      Number(
        step.anim_offset
      );
  }


  return result;
}


/* =========================================================
 * ANIMATION HANDLE
 * ========================================================= */


/**
 * Create the object returned by animate().
 */
function createAnimationHandle(
  widget,
  nativeId,
  options
) {

  const handleId =
    nextAnimationHandleId++;


  const handle = {

    id:
      handleId,

    nativeId,

    widget,


    /*
     * Start/restart.
     */
    start() {

      setStatus(
        widget,
        nativeId,
        anim_status.START
      );

      return handle;

    },


    /*
     * Stop permanently.
     */
    stop() {

      setStatus(
        widget,
        nativeId,
        anim_status.STOP
      );

      return handle;

    },


    /*
     * Pause.
     */
    pause() {

      setStatus(
        widget,
        nativeId,
        anim_status.PAUSE
      );

      return handle;

    },


    /*
     * Resume.
     */
    resume() {

      setStatus(
        widget,
        nativeId,
        anim_status.RESUME
      );

      return handle;

    },


    /*
     * Read native animation status.
     */
    getStatus() {

      return widget.getProperty(
        prop.ANIM_STATUS,
        nativeId
      );

    },


    /*
     * Remove from ZeppCore's registry.
     */
    destroyHandle() {

      animationRegistry.delete(
        handleId
      );

      return handle;

    }

  };


  animationRegistry.set(
    handleId,
    handle
  );


  return handle;
}


/**
 * Set an animation state.
 */
function setStatus(
  widget,
  nativeId,
  status
) {

  widget.setProperty(
    prop.ANIM_STATUS,
    {
      anim_id:
        nativeId,

      anim_status:
        status
    }
  );
}


/* =========================================================
 * ANIMATION STATUS HELPERS
 * ========================================================= */


/**
 * Start an existing AnimationHandle.
 */
export function startAnimation(
  animation
) {
  return animation.start();
}


/**
 * Stop an existing AnimationHandle.
 */
export function stopAnimation(
  animation
) {
  return animation.stop();
}


/**
 * Pause an existing AnimationHandle.
 */
export function pauseAnimation(
  animation
) {
  return animation.pause();
}


/**
 * Resume an existing AnimationHandle.
 */
export function resumeAnimation(
  animation
) {
  return animation.resume();
}


/**
 * Get an AnimationHandle's native status.
 */
export function getAnimationStatus(
  animation
) {
  return animation.getStatus();
}


/* =========================================================
 * SIMPLE PROPERTY ANIMATIONS
 * ========================================================= */


/**
 * Move a widget horizontally.
 */
export function moveX(
  target,
  from,
  to,
  options = {}
) {
  return animate(
    target,
    {
      ...options,
      x: {
        from,
        to,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT,

        offset:
          options.offset
      }
    }
  );
}


/**
 * Move a widget vertically.
 */
export function moveY(
  target,
  from,
  to,
  options = {}
) {
  return animate(
    target,
    {
      ...options,
      y: {
        from,
        to,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT,

        offset:
          options.offset
      }
    }
  );
}


/**
 * Move both X and Y simultaneously.
 */
export function move(
  target,
  fromX,
  fromY,
  toX,
  toY,
  options = {}
) {
  return animate(
    target,
    {
      ...options,

      x: {
        from:
          fromX,

        to:
          toX,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT,

        offset:
          options.offset
      },


      y: {
        from:
          fromY,

        to:
          toY,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT,

        offset:
          options.offset
      }

    }
  );
}


/**
 * Change widget width.
 */
export function resizeWidth(
  target,
  from,
  to,
  options = {}
) {
  return animate(
    target,
    {
      ...options,

      w: {
        from,
        to,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT,

        offset:
          options.offset
      }
    }
  );
}


/**
 * Change widget height.
 */
export function resizeHeight(
  target,
  from,
  to,
  options = {}
) {
  return animate(
    target,
    {
      ...options,

      h: {
        from,
        to,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT,

        offset:
          options.offset
      }
    }
  );
}


/**
 * Change both width and height.
 */
export function resize(
  target,
  fromW,
  fromH,
  toW,
  toH,
  options = {}
) {
  return animate(
    target,
    {
      ...options,

      w: {
        from:
          fromW,

        to:
          toW,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT,

        offset:
          options.offset
      },


      h: {
        from:
          fromH,

        to:
          toH,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT,

        offset:
          options.offset
      }

    }
  );
}


/**
 * Animate widget opacity.
 *
 * Zepp uses its native ALPHA property.
 */
export function fade(
  target,
  from,
  to,
  options = {}
) {
  return animate(
    target,
    {
      ...options,

      alpha: {
        from,
        to,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_LINEAR,

        offset:
          options.offset
      }
    }
  );
}


/* =========================================================
 * FADE PRESETS
 * ========================================================= */


/**
 * Fade in.
 */
export function fadeIn(
  target,
  options = {}
) {
  return fade(
    target,
    options.from ??
      0,

    options.to ??
      255,

    {
      ...options,

      easing:
        options.easing ??
        EASE_OUT
    }
  );
}


/**
 * Fade out.
 */
export function fadeOut(
  target,
  options = {}
) {
  return fade(
    target,
    options.from ??
      255,

    options.to ??
      0,

    {
      ...options,

      easing:
        options.easing ??
        EASE_IN
    }
  );
}


/* =========================================================
 * SLIDE PRESETS
 * ========================================================= */


/**
 * Slide a widget in from the left.
 *
 * distance:
 * How many pixels away the widget starts.
 *
 * This assumes the widget is already positioned at its
 * final location before the animation starts.
 */
export function slideInLeft(
  target,
  finalX,
  options = {}
) {

  const distance =
    options.distance ??
    80;


  return moveX(
    target,

    finalX -
      distance,

    finalX,

    {
      ...options,

      easing:
        options.easing ??
        EASE_OUT
    }
  );
}


/**
 * Slide in from the right.
 */
export function slideInRight(
  target,
  finalX,
  options = {}
) {

  const distance =
    options.distance ??
    80;


  return moveX(
    target,

    finalX +
      distance,

    finalX,

    {
      ...options,

      easing:
        options.easing ??
        EASE_OUT
    }
  );
}


/**
 * Slide in from above.
 */
export function slideInTop(
  target,
  finalY,
  options = {}
) {

  const distance =
    options.distance ??
    80;


  return moveY(
    target,

    finalY -
      distance,

    finalY,

    {
      ...options,

      easing:
        options.easing ??
        EASE_OUT
    }
  );
}


/**
 * Slide in from below.
 */
export function slideInBottom(
  target,
  finalY,
  options = {}
) {

  const distance =
    options.distance ??
    80;


  return moveY(
    target,

    finalY +
      distance,

    finalY,

    {
      ...options,

      easing:
        options.easing ??
        EASE_OUT
    }
  );
}


/**
 * Slide out to the left.
 */
export function slideOutLeft(
  target,
  currentX,
  options = {}
) {

  const distance =
    options.distance ??
    80;


  return moveX(
    target,

    currentX,

    currentX -
      distance,

    {
      ...options,

      easing:
        options.easing ??
        EASE_IN
    }
  );
}


/**
 * Slide out to the right.
 */
export function slideOutRight(
  target,
  currentX,
  options = {}
) {

  const distance =
    options.distance ??
    80;


  return moveX(
    target,

    currentX,

    currentX +
      distance,

    {
      ...options,

      easing:
        options.easing ??
        EASE_IN
    }
  );
}


/**
 * Slide out upwards.
 */
export function slideOutTop(
  target,
  currentY,
  options = {}
) {

  const distance =
    options.distance ??
    80;


  return moveY(
    target,

    currentY,

    currentY -
      distance,

    {
      ...options,

      easing:
        options.easing ??
        EASE_IN
    }
  );
}


/**
 * Slide out downwards.
 */
export function slideOutBottom(
  target,
  currentY,
  options = {}
) {

  const distance =
    options.distance ??
    80;


  return moveY(
    target,

    currentY,

    currentY +
      distance,

    {
      ...options,

      easing:
        options.easing ??
        EASE_IN
    }
  );
}


/* =========================================================
 * POP / SCALE-LIKE ANIMATIONS
 * =========================================================
 *
 * Zepp doesn't have a native SCALE property.
 *
 * We therefore simulate scale using W/H.
 *
 * The center point is preserved by adjusting X/Y at the
 * same time.
 */


/**
 * Pop a widget from a smaller size to its final size.
 *
 * x/y:
 * final top-left position
 *
 * w/h:
 * final dimensions
 *
 * scale:
 * starting scale, e.g. 0.85
 */
export function popIn(
  target,
  x,
  y,
  w,
  h,
  options = {}
) {

  const scale =
    options.scale ??
    0.85;


  const startW =
    w * scale;

  const startH =
    h * scale;


  const startX =
    x +
    (w - startW) / 2;

  const startY =
    y +
    (h - startH) / 2;


  return animate(
    target,
    {

      x: {
        from:
          startX,

        to:
          x,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT
      },


      y: {
        from:
          startY,

        to:
          y,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT
      },


      w: {
        from:
          startW,

        to:
          w,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT
      },


      h: {
        from:
          startH,

        to:
          h,

        duration:
          options.duration ??
          300,

        easing:
          options.easing ??
          EASE_OUT
      },


      alpha: {
        from:
          options.alphaFrom ??
          0,

        to:
          options.alphaTo ??
          255,

        duration:
          options.duration ??
          300,

        easing:
          options.alphaEasing ??
          EASE_OUT
      }

    }
  );
}


/**
 * Shrink a widget.
 */
export function shrink(
  target,
  x,
  y,
  w,
  h,
  scale = 0.9,
  options = {}
) {

  const endW =
    w * scale;

  const endH =
    h * scale;


  const endX =
    x +
    (w - endW) / 2;

  const endY =
    y +
    (h - endH) / 2;


  return animate(
    target,
    {

      x: {
        from:
          x,

        to:
          endX,

        duration:
          options.duration ??
          180,

        easing:
          options.easing ??
          EASE_IN
      },


      y: {
        from:
          y,

        to:
          endY,

        duration:
          options.duration ??
          180,

        easing:
          options.easing ??
          EASE_IN
      },


      w: {
        from:
          w,

        to:
          endW,

        duration:
          options.duration ??
          180,

        easing:
          options.easing ??
          EASE_IN
      },


      h: {
        from:
          h,

        to:
          endH,

        duration:
          options.duration ??
          180,

        easing:
          options.easing ??
          EASE_IN
      }

    }
  );
}


/**
 * Expand a widget.
 */
export function expand(
  target,
  x,
  y,
  w,
  h,
  scale = 1.1,
  options = {}
) {

  const endW =
    w * scale;

  const endH =
    h * scale;


  const endX =
    x -
    (endW - w) / 2;

  const endY =
    y -
    (endH - h) / 2;


  return animate(
    target,
    {

      x: {
        from:
          x,

        to:
          endX,

        duration:
          options.duration ??
          180,

        easing:
          options.easing ??
          EASE_OUT
      },


      y: {
        from:
          y,

        to:
          endY,

        duration:
          options.duration ??
          180,

        easing:
          options.easing ??
          EASE_OUT
      },


      w: {
        from:
          w,

        to:
          endW,

        duration:
          options.duration ??
          180,

        easing:
          options.easing ??
          EASE_OUT
      },


      h: {
        from:
          h,

        to:
          endH,

        duration:
          options.duration ??
          180,

        easing:
          options.easing ??
          EASE_OUT
      }

    }
  );
}


/* =========================================================
 * BOUNCE
 * ========================================================= */


/**
 * Bounce a widget vertically.
 *
 * Uses the native bounce easing.
 */
export function bounceY(
  target,
  y,
  distance = 20,
  options = {}
) {

  return moveY(
    target,

    y,

    y -
      distance,

    {
      ...options,

      duration:
        options.duration ??
        450,

      easing:
        EASE_BOUNCE
    }
  );
}


/**
 * Bounce a widget horizontally.
 */
export function bounceX(
  target,
  x,
  distance = 20,
  options = {}
) {

  return moveX(
    target,

    x,

    x +
      distance,

    {
      ...options,

      duration:
        options.duration ??
        450,

      easing:
        EASE_BOUNCE
    }
  );
}


/* =========================================================
 * PULSE
 * ========================================================= */


/**
 * Pulse opacity.
 *
 * Example:
 *
 * pulse(widget, {
 *   minAlpha: 80,
 *   maxAlpha: 255,
 *   duration: 800,
 *   repeat: -1
 * });
 */
export function pulse(
  target,
  options = {}
) {

  const minAlpha =
    options.minAlpha ??
    80;

  const maxAlpha =
    options.maxAlpha ??
    255;


  return animate(
    target,
    {

      alpha: {
        from:
          minAlpha,

        to:
          maxAlpha,

        duration:
          options.duration ??
          800,

        easing:
          options.easing ??
          EASE_IN_OUT
      }

    }
  );
}


/**
 * Breathing effect.
 *
 * Fade down, then back up repeatedly.
 *
 * This uses two synchronized properties with offsets.
 */
export function breathe(
  target,
  options = {}
) {

  const duration =
    options.duration ??
    900;

  const low =
    options.minAlpha ??
    100;

  const high =
    options.maxAlpha ??
    255;


  const animation =
    animate(
      target,
      {

        steps: [

          {
            anim_prop:
              prop.ALPHA,

            anim_from:
              high,

            anim_to:
              low,

            anim_rate:
              EASE_IN_OUT,

            anim_duration:
              duration
          },


          {
            anim_prop:
              prop.ALPHA,

            anim_from:
              low,

            anim_to:
              high,

            anim_rate:
              EASE_IN_OUT,

            anim_duration:
              duration,

            anim_offset:
              duration
          }

        ],

        duration:
          duration,

        repeat:
          options.repeat ??
          -1

      }
    );


  return animation;
}


/* =========================================================
 * SHAKE
 * ========================================================= */


/**
 * Shake left and right.
 *
 * This is implemented as a short native animation timeline.
 */
export function shake(
  target,
  x,
  distance = 12,
  options = {}
) {

  const duration =
    options.duration ??
    70;


  return animate(
    target,
    {

      steps: [

        {
          anim_prop:
            prop.X,

          anim_from:
            x,

          anim_to:
            x -
            distance,

          anim_rate:
            EASE_OUT,

          anim_duration:
            duration
        },


        {
          anim_prop:
            prop.X,

          anim_from:
            x -
            distance,

          anim_to:
            x +
            distance,

          anim_rate:
            EASE_IN_OUT,

          anim_duration:
            duration,

          anim_offset:
            duration
        },


        {
          anim_prop:
            prop.X,

          anim_from:
            x +
            distance,

          anim_to:
            x -
            distance,

          anim_rate:
            EASE_IN_OUT,

          anim_duration:
            duration,

          anim_offset:
            duration * 2
        },


        {
          anim_prop:
            prop.X,

          anim_from:
            x -
            distance,

          anim_to:
            x,

          anim_rate:
            EASE_OUT,

          anim_duration:
            duration,

          anim_offset:
            duration * 3
        }

      ],

      repeat:
        options.repeat ??
        0

    }
  );
}


/* =========================================================
 * TEXT ANIMATIONS
 * ========================================================= */


/**
 * Animate a TEXT widget.
 *
 * This is simply a semantic wrapper around animate().
 *
 * Native Zepp does NOT animate the actual text string.
 *
 * It animates:
 *
 *   X
 *   Y
 *   W
 *   H
 *   ALPHA
 */
export function animateText(
  textWidget,
  options = {}
) {
  return animate(
    textWidget,
    options
  );
}


/**
 * Slide text into view.
 */
export function textIn(
  textWidget,
  x,
  y,
  options = {}
) {

  const direction =
    options.from ??
    "left";


  let animation;


  if (
    direction ===
    "right"
  ) {

    animation =
      animate(
        textWidget,
        {
          x: {
            from:
              x +
              (
                options.distance ??
                80
              ),

            to:
              x,

            duration:
              options.duration ??
              350,

            easing:
              options.easing ??
              EASE_OUT
          },

          alpha: {
            from:
              0,

            to:
              255,

            duration:
              options.fadeDuration ??
              250,

            easing:
              EASE_OUT
          }
        }
      );

  }


  else if (
    direction ===
    "top"
  ) {

    animation =
      animate(
        textWidget,
        {
          y: {
            from:
              y -
              (
                options.distance ??
                80
              ),

            to:
              y,

            duration:
              options.duration ??
              350,

            easing:
              options.easing ??
              EASE_OUT
          },

          alpha: {
            from:
              0,

            to:
              255,

            duration:
              options.fadeDuration ??
              250,

            easing:
              EASE_OUT
          }
        }
      );

  }


  else if (
    direction ===
    "bottom"
  ) {

    animation =
      animate(
        textWidget,
        {
          y: {
            from:
              y +
              (
                options.distance ??
                80
              ),

            to:
              y,

            duration:
              options.duration ??
              350,

            easing:
              options.easing ??
              EASE_OUT
          },

          alpha: {
            from:
              0,

            to:
              255,

            duration:
              options.fadeDuration ??
              250,

            easing:
              EASE_OUT
          }
        }
      );

  }


  else {

    animation =
      animate(
        textWidget,
        {
          x: {
            from:
              x -
              (
                options.distance ??
                80
              ),

            to:
              x,

            duration:
              options.duration ??
              350,

            easing:
              options.easing ??
              EASE_OUT
          },

          alpha: {
            from:
              0,

            to:
              255,

            duration:
              options.fadeDuration ??
              250,

            easing:
              EASE_OUT
          }
        }
      );

  }


  return animation;
}


/* =========================================================
 * PILL / CARD ANIMATIONS
 * ========================================================= */


/**
 * Animate a single pill/card widget.
 *
 * This works when the supplied widget itself is the
 * rectangle/background that you want to animate.
 *
 * For a pill composed of:
 *
 *   background widget
 *   text widget
 *
 * use animateGroup() so both move together.
 */
export function animatePill(
  pillWidget,
  options = {}
) {
  return animate(
    pillWidget,
    options
  );
}


/**
 * Pop a pill.
 */
export function popPill(
  pillWidget,
  x,
  y,
  w,
  h,
  options = {}
) {
  return popIn(
    pillWidget,
    x,
    y,
    w,
    h,
    {
      ...options,

      scale:
        options.scale ??
        0.88
    }
  );
}


/**
 * Animate a card.
 */
export function animateCard(
  cardWidget,
  options = {}
) {
  return animate(
    cardWidget,
    options
  );
}


/* =========================================================
 * MULTI-WIDGET ANIMATION
 * ========================================================= */


/**
 * Animate several widgets with the same animation.
 *
 * Example:
 *
 * animateGroup(
 *   [background, label],
 *   {
 *     x: [20, 40],
 *     alpha: [0, 255],
 *     duration: 400
 *   }
 * );
 */
export function animateGroup(
  widgets,
  options = {}
) {

  if (
    !Array.isArray(
      widgets
    )
  ) {
    throw new TypeError(
      "animateGroup requires an array of widgets."
    );
  }


  return widgets.map(
    (target) =>
      animate(
        target,
        {
          ...options
        }
      )
  );
}


/**
 * Move several widgets together.
 *
 * Preserves the relative arrangement between them.
 */
export function moveGroup(
  widgets,
  dx,
  dy,
  options = {}
) {

  if (
    !Array.isArray(
      widgets
    )
  ) {
    throw new TypeError(
      "moveGroup requires an array of widgets."
    );
  }


  /*
   * Because native animation needs absolute values,
   * caller should normally use animateGroup() when exact
   * starting coordinates are known.
   *
   * This helper instead uses a special custom function when
   * each item contains its starting geometry.
   */

  if (
    !Array.isArray(
      options.positions
    )
  ) {
    throw new Error(
      "moveGroup requires options.positions with one {x,y} entry for each widget."
    );
  }


  const animations = [];


  for (
    let i = 0;
    i < widgets.length;
    i++
  ) {

    const position =
      options.positions[i];


    animations.push(
      animate(
        widgets[i],
        {

          x: {
            from:
              position.x,

            to:
              position.x +
              dx,

            duration:
              options.duration ??
              300,

            easing:
              options.easing ??
              EASE_OUT
          },


          y: {
            from:
              position.y,

            to:
              position.y +
              dy,

            duration:
              options.duration ??
              300,

            easing:
              options.easing ??
              EASE_OUT
          }

        }
      )
    );

  }


  return animations;
}


/* =========================================================
 * STAGGERED ANIMATIONS
 * ========================================================= */


/**
 * Animate widgets one after another.
 *
 * Example:
 *
 * staggerIn(
 *   [card1, card2, card3],
 *   {
 *     interval: 80,
 *     animation: {
 *       alpha: [0, 255]
 *     }
 *   }
 * );
 */
export function staggerIn(
  widgets,
  options = {}
) {

  if (
    !Array.isArray(
      widgets
    )
  ) {
    throw new TypeError(
      "staggerIn requires an array of widgets."
    );
  }


  const interval =
    options.interval ??
    80;


  const animationOptions =
    options.animation ??
    {
      alpha: [0, 255]
    };


  return widgets.map(
    (
      widget,
      index
    ) => {

      return animate(
        widget,
        {
          ...animationOptions,

          offset:
            (
              animationOptions.offset ??
              0
            ) +
            index *
              interval
        }
      );

    }
  );
}


/**
 * Fade several widgets in with a stagger.
 */
export function staggerFadeIn(
  widgets,
  options = {}
) {

  const interval =
    options.interval ??
    80;


  const duration =
    options.duration ??
    250;


  return widgets.map(
    (
      widget,
      index
    ) => {

      return fadeIn(
        widget,
        {
          duration,

          offset:
            index *
            interval
        }
      );

    }
  );
}


/**
 * Slide several widgets upward into place with a stagger.
 */
export function staggerSlideUp(
  widgets,
  positions,
  options = {}
) {

  const interval =
    options.interval ??
    80;


  const distance =
    options.distance ??
    40;


  return widgets.map(
    (
      widget,
      index
    ) => {

      const position =
        positions[index];


      return moveY(
        widget,

        position.y +
          distance,

        position.y,

        {
          duration:
            options.duration ??
            300,

          easing:
            options.easing ??
            EASE_OUT,

          offset:
            index *
            interval
        }
      );

    }
  );
}


/* =========================================================
 * TIMELINE
 * ========================================================= */


/**
 * Create a simple multi-widget animation timeline.
 *
 * Each action describes:
 *
 * {
 *   target: widget,
 *   options: {...},
 *   offset: 300
 * }
 *
 *
 * Example:
 *
 * createTimeline([
 *
 *   {
 *     target: title,
 *     options: {
 *       x: [400, 20],
 *       alpha: [0, 255],
 *       duration: 400
 *     },
 *     offset: 0
 *   },
 *
 *   {
 *     target: button,
 *     options: {
 *       y: [500, 350],
 *       alpha: [0, 255],
 *       duration: 400
 *     },
 *     offset: 200
 *   }
 *
 * ]);
 */
export function createTimeline(
  actions = []
) {

  if (
    !Array.isArray(
      actions
    )
  ) {
    throw new TypeError(
      "createTimeline requires an array."
    );
  }


  const handles =
    [];


  for (
    const action of
    actions
  ) {

    if (
      !action ||
      !action.target
    ) {
      continue;
    }


    handles.push(
      animate(
        action.target,
        {
          ...action.options,

          /*
           * Timeline offset has priority.
           */
          offset:
            action.offset ??
            action.options?.offset
        }
      )
    );

  }


  return createGroupHandle(
    handles
  );
}


/**
 * Create a controller around multiple animation handles.
 */
function createGroupHandle(
  handles
) {

  return {

    animations:
      handles,


    start() {

      for (
        const animation of
        handles
      ) {
        animation.start();
      }

      return this;
    },


    stop() {

      for (
        const animation of
        handles
      ) {
        animation.stop();
      }

      return this;
    },


    pause() {

      for (
        const animation of
        handles
      ) {
        animation.pause();
      }

      return this;
    },


    resume() {

      for (
        const animation of
        handles
      ) {
        animation.resume();
      }

      return this;
    }

  };
}


/* =========================================================
 * REPEATING EFFECTS
 * ========================================================= */


/**
 * Generic repeating property animation.
 */
export function loop(
  target,
  options = {}
) {

  return animate(
    target,
    {
      ...options,

      repeat:
        options.repeat ??
        -1
    }
  );
}


/**
 * Loop a fade between two alpha values.
 */
export function loopFade(
  target,
  options = {}
) {

  return animate(
    target,
    {

      alpha: {
        from:
          options.from ??
          80,

        to:
          options.to ??
          255,

        duration:
          options.duration ??
          700,

        easing:
          options.easing ??
          EASE_IN_OUT
      },


      repeat:
        options.repeat ??
        -1

    }
  );
}


/**
 * Loop a horizontal movement.
 */
export function loopMoveX(
  target,
  from,
  to,
  options = {}
) {

  return animate(
    target,
    {

      x: {
        from,
        to,

        duration:
          options.duration ??
          1000,

        easing:
          options.easing ??
          EASE_IN_OUT
      },


      repeat:
        options.repeat ??
        -1

    }
  );
}


/**
 * Loop a vertical movement.
 */
export function loopMoveY(
  target,
  from,
  to,
  options = {}
) {

  return animate(
    target,
    {

      y: {
        from,
        to,

        duration:
          options.duration ??
          1000,

        easing:
          options.easing ??
          EASE_IN_OUT
      },


      repeat:
        options.repeat ??
        -1

    }
  );
}


/* =========================================================
 * CONTROL ALL ANIMATIONS
 * ========================================================= */


/**
 * Pause every animation created by ZeppCore.
 */
export function pauseAllAnimations() {

  for (
    const animation of
    animationRegistry.values()
  ) {
    animation.pause();
  }

}


/**
 * Resume every animation created by ZeppCore.
 */
export function resumeAllAnimations() {

  for (
    const animation of
    animationRegistry.values()
  ) {
    animation.resume();
  }

}


/**
 * Stop every animation created by ZeppCore.
 */
export function stopAllAnimations() {

  for (
    const animation of
    animationRegistry.values()
  ) {
    animation.stop();
  }

}


/**
 * Return the number of animations currently tracked.
 */
export function getAnimationCount() {
  return animationRegistry.size;
}


/**
 * Clear ZeppCore's animation registry.
 *
 * This does NOT magically delete native animations.
 * It only removes their references from the ZeppCore
 * registry.
 */
export function clearAnimationRegistry() {
  animationRegistry.clear();
}


/* =========================================================
 * VALIDATION
 * ========================================================= */


/**
 * Check whether something looks like a Zepp widget.
 */
export function isWidget(
  value
) {
  return (
    value !== null &&
    typeof value ===
      "object" &&
    typeof value.setProperty ===
      "function"
  );
}


/**
 * Make sure a native widget was supplied.
 */
function validateWidget(
  widget
) {

  if (
    !isWidget(
      widget
    )
  ) {
    throw new TypeError(
      "ZeppCore animation requires a Zepp UI widget returned by createWidget() or a ZeppCore UI wrapper."
    );
  }

}


/**
 * Normalize repeat settings.
 *
 * Native Zepp values:
 *
 *   -1 = infinite
 *    0 = play once
 *   >0 = repeat count
 */
function normalizeRepeat(
  repeat
) {

  if (
    repeat ===
    undefined
  ) {
    return 0;
  }


  const value =
    Number(repeat);


  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }


  if (
    value < 0
  ) {
    return -1;
  }


  return Math.floor(
    value
  );
}


/* =========================================================
 * NATIVE EXPORTS
 * ========================================================= */


/*
 * Animation properties.
 */
export {
  prop
};


/*
 * Animation statuses.
 */
export {
  anim_status
};


/* =========================================================
 * DEFAULT GROUPED API
 * ========================================================= */

const animation = {

  animate,

  startAnimation,
  stopAnimation,
  pauseAnimation,
  resumeAnimation,
  getAnimationStatus,

  moveX,
  moveY,
  move,

  resizeWidth,
  resizeHeight,
  resize,

  fade,
  fadeIn,
  fadeOut,

  slideInLeft,
  slideInRight,
  slideInTop,
  slideInBottom,

  slideOutLeft,
  slideOutRight,
  slideOutTop,
  slideOutBottom,

  popIn,
  shrink,
  expand,

  bounceX,
  bounceY,

  pulse,
  breathe,
  shake,

  animateText,
  textIn,

  animatePill,
  popPill,
  animateCard,

  animateGroup,
  moveGroup,

  staggerIn,
  staggerFadeIn,
  staggerSlideUp,

  createTimeline,

  loop,
  loopFade,
  loopMoveX,
  loopMoveY,

  pauseAllAnimations,
  resumeAllAnimations,
  stopAllAnimations,

  getAnimationCount,
  clearAnimationRegistry,

  isWidget,

  normalizeEasing

};


export default animation;

/* =========================================================
 * ANIMATION COMPOSITION
 * =========================================================
 *
 * Higher-level orchestration helpers.
 * ========================================================= */

/**
 * Run animation factories one after another.
 *
 * Each factory receives:
 *
 *   done(index)
 *
 * and must create an animation with an onComplete callback
 * that calls done().
 *
 * Example:
 *
 * sequence([
 *   (done) => animate(widget, {
 *     x: [0, 100],
 *     duration: 300,
 *     onComplete: done
 *   }),
 *   (done) => animate(widget, {
 *     y: [0, 100],
 *     duration: 300,
 *     onComplete: done
 *   })
 * ]);
 */
export function sequence(
  factories = [],
  onComplete = null
) {
  const list = Array.isArray(factories)
    ? factories
    : [];

  let index = 0;
  let stopped = false;
  let current = null;

  function next() {
    if (stopped) return;

    if (index >= list.length) {
      if (typeof onComplete === "function") {
        onComplete();
      }
      return;
    }

    const currentIndex = index++;
    const factory = list[currentIndex];

    if (typeof factory !== "function") {
      next();
      return;
    }

    current = factory(
      () => next(),
      currentIndex
    );
  }

  next();

  return {
    start() {
      stopped = false;
      if (!current && index === 0) next();
      else if (current && typeof current.start === "function") {
        current.start();
      }
      return this;
    },

    stop() {
      stopped = true;

      if (
        current &&
        typeof current.stop === "function"
      ) {
        current.stop();
      }

      return this;
    },

    pause() {
      if (
        current &&
        typeof current.pause === "function"
      ) {
        current.pause();
      }

      return this;
    },

    resume() {
      if (
        current &&
        typeof current.resume === "function"
      ) {
        current.resume();
      }

      return this;
    },

    getCurrentIndex() {
      return Math.max(0, index - 1);
    }
  };
}

/**
 * Start several animation factories together.
 */
export function parallel(
  factories = [],
  onComplete = null
) {
  const list = Array.isArray(factories)
    ? factories
    : [];

  if (list.length === 0) {
    if (typeof onComplete === "function") {
      onComplete();
    }

    return {
      start() { return this; },
      stop() { return this; },
      pause() { return this; },
      resume() { return this; },
      getCompleted() { return 0; }
    };
  }

  let completed = 0;
  let stopped = false;
  const handles = [];

  const done = () => {
    if (stopped) return;

    completed += 1;

    if (
      completed >= list.length &&
      typeof onComplete === "function"
    ) {
      onComplete();
    }
  };

  for (let i = 0; i < list.length; i++) {
    const factory = list[i];

    if (typeof factory === "function") {
      handles.push(
        factory(done, i)
      );
    } else {
      done();
    }
  }

  return {
    start() {
      for (const handle of handles) {
        if (
          handle &&
          typeof handle.start === "function"
        ) {
          handle.start();
        }
      }

      return this;
    },

    stop() {
      stopped = true;

      for (const handle of handles) {
        if (
          handle &&
          typeof handle.stop === "function"
        ) {
          handle.stop();
        }
      }

      return this;
    },

    pause() {
      for (const handle of handles) {
        if (
          handle &&
          typeof handle.pause === "function"
        ) {
          handle.pause();
        }
      }

      return this;
    },

    resume() {
      stopped = false;

      for (const handle of handles) {
        if (
          handle &&
          typeof handle.resume === "function"
        ) {
          handle.resume();
        }
      }

      return this;
    },

    getCompleted() {
      return completed;
    },

    getHandles() {
      return [...handles];
    }
  };
}

/**
 * Alias for sequence().
 */
export function chain(
  factories = [],
  onComplete = null
) {
  return sequence(
    factories,
    onComplete
  );
}

/**
 * Spring-like animation preset.
 *
 * Uses Zepp OS's native bounce easing to create a spring-like
 * overshoot effect without frame/image animation.
 */
export function spring(
  target,
  properties = {},
  options = {}
) {
  return animate(
    target,
    {
      ...properties,
      ...options,
      easing:
        options.easing ||
        EASE_BOUNCE
    }
  );
}

/**
 * Interrupt an animation and immediately start another one.
 */
export function interruptAnimation(
  current,
  next
) {
  if (
    current &&
    typeof current.stop === "function"
  ) {
    current.stop();
  }

  if (typeof next === "function") {
    return next();
  }

  if (
    next &&
    typeof next.start === "function"
  ) {
    next.start();
  }

  return next;
}

/**
 * Animate a widget while reporting approximate progress.
 *
 * The progress callback receives a value from 0 to 1.
 */
export function animateWithProgress(
  target,
  options = {},
  onProgress = null
) {
  const duration =
    Math.max(
      1,
      Number(options.duration || 0)
    );

  const startedAt = Date.now();

  const userFrame =
    options.onFrame;

  return animate(
    target,
    {
      ...options,

      onFrame(frame) {
        const elapsed =
          Date.now() - startedAt;

        const progress =
          Math.max(
            0,
            Math.min(
              1,
              elapsed / duration
            )
          );

        if (typeof onProgress === "function") {
          onProgress(progress, frame);
        }

        if (typeof userFrame === "function") {
          userFrame(frame);
        }
      },

      onComplete(...args) {
        if (typeof onProgress === "function") {
          onProgress(1, null);
        }

        if (
          typeof options.onComplete ===
          "function"
        ) {
          options.onComplete(...args);
        }
      }
    }
  );
}
