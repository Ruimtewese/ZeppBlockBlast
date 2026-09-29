/*
 * =========================================================
 * ZEPPCORE INTERACTION
 * =========================================================
 *
 * Handles:
 *
 * @zos/interaction
 *   - Keys / buttons
 *   - Swipe gestures
 *   - Digital crown
 *   - Wrist motion
 *   - Toasts
 *   - Modals
 *
 * @zos/router
 *   - Open pages
 *   - Replace pages
 *   - Go back
 *   - Go home
 *   - Exit app
 *   - Launch other apps
 *
 * @zos/page
 *   - Scroll position
 *   - Page scrolling
 *   - Swiper pages
 *
 * Example:
 *
 * import {
 *   onKeyPress,
 *   onSwipe,
 *   goBack,
 *   toast,
 *   scrollTo
 * } from "zeppcore";
 *
 * =========================================================
 */


/* =========================================================
 * NATIVE INTERACTION API
 * ========================================================= */

import {
  onKey,
  offKey,

  onGesture,
  offGesture,

  onDigitalCrown,
  offDigitalCrown,

  onWristMotion,

  showToast,
  createModal,

  KEY_BACK,
  KEY_SELECT,
  KEY_HOME,
  KEY_UP,
  KEY_DOWN,
  KEY_SHORTCUT,

  KEY_EVENT_CLICK,
  KEY_EVENT_LONG_PRESS,
  KEY_EVENT_DOUBLE_CLICK,
  KEY_EVENT_PRESS,
  KEY_EVENT_RELEASE,

  GESTURE_UP,
  GESTURE_DOWN,
  GESTURE_LEFT,
  GESTURE_RIGHT,

  WRIST_MOTION_LIFT,
  WRIST_MOTION_LOWER,
  WRIST_MOTION_FLIP,

  MODAL_CONFIRM,
  MODAL_CANCEL
} from "@zos/interaction";


/* =========================================================
 * NATIVE ROUTER API
 * ========================================================= */

import {
  push,
  replace,
  back,
  home,
  exit,
  launchApp,

  SYSTEM_APP_STATUS,
  SYSTEM_APP_HR,
  SYSTEM_APP_SPORT,
  SYSTEM_APP_WEATHER,
  SYSTEM_APP_ALARM,
  SYSTEM_APP_CAMERA,
  SYSTEM_APP_MUSIC,
  SYSTEM_APP_STOPWATCH,
  SYSTEM_APP_COUNTDOWN,
  SYSTEM_APP_FINE_PHONE,
  SYSTEM_APP_CARD,
  SYSTEM_APP_SETTING,
  SYSTEM_APP_COMPASS,
  SYSTEM_APP_CALENDAR,
  SYSTEM_APP_PHONE
} from "@zos/router";


/* =========================================================
 * NATIVE PAGE API
 * ========================================================= */

import {
  scrollTo,
  getScrollTop,

  setScrollMode,
  swipeToIndex,
  getSwiperIndex,

  SCROLL_MODE_FREE,
  SCROLL_MODE_SWIPER,
  SCROLL_MODE_SWIPER_HORIZONTAL,

  SCROLL_ANIMATION_SMOOTH,
  SCROLL_ANIMATION_NONE
} from "@zos/page";


/* =========================================================
 * KEY / BUTTON INPUT
 * ========================================================= */


/**
 * Register a native key listener.
 *
 * Zepp allows only ONE active onKey registration at a time.
 *
 * callback:
 *
 * (key, event) => {
 *   return true;
 * }
 *
 * Returning true prevents the system's default behavior.
 */
export function onKeyPress(
  callback
) {
  if (
    typeof callback !==
    "function"
  ) {
    throw new TypeError(
      "onKeyPress callback must be a function"
    );
  }

  return onKey({
    callback
  });
}


/**
 * Remove the currently registered key listener.
 */
export function offKeyPress() {
  return offKey();
}


/**
 * Register a simple key-click handler.
 *
 * Example:
 *
 * onKeyClick((key) => {
 *   console.log(key);
 * });
 */
export function onKeyClick(
  callback
) {
  return onKeyPress(
    (key, event) => {

      if (
        event ===
        KEY_EVENT_CLICK
      ) {
        callback(key);
      }

      return true;
    }
  );
}


/**
 * Register a key long-press handler.
 */
export function onKeyLongPress(
  callback
) {
  return onKeyPress(
    (key, event) => {

      if (
        event ===
        KEY_EVENT_LONG_PRESS
      ) {
        callback(key);
      }

      return true;
    }
  );
}


/**
 * Register a key double-click handler.
 */
export function onKeyDoubleClick(
  callback
) {
  return onKeyPress(
    (key, event) => {

      if (
        event ===
        KEY_EVENT_DOUBLE_CLICK
      ) {
        callback(key);
      }

      return true;
    }
  );
}


/**
 * Register a key-press handler.
 */
export function onKeyDown(
  callback
) {
  return onKeyPress(
    (key, event) => {

      if (
        event ===
        KEY_EVENT_PRESS
      ) {
        callback(key);
      }

      return true;
    }
  );
}


/**
 * Register a key-release handler.
 */
export function onKeyUp(
  callback
) {
  return onKeyPress(
    (key, event) => {

      if (
        event ===
        KEY_EVENT_RELEASE
      ) {
        callback(key);
      }

      return true;
    }
  );
}


/**
 * Run a callback only when the BACK key is clicked.
 *
 * Returning true prevents normal BACK behavior.
 */
export function onBackKey(
  callback
) {
  return onKeyPress(
    (key, event) => {

      if (
        key === KEY_BACK &&
        event === KEY_EVENT_CLICK
      ) {
        callback();
      }

      return true;
    }
  );
}


/**
 * Run a callback only when the HOME key is clicked.
 */
export function onHomeKey(
  callback
) {
  return onKeyPress(
    (key, event) => {

      if (
        key === KEY_HOME &&
        event === KEY_EVENT_CLICK
      ) {
        callback();
      }

      return true;
    }
  );
}


/**
 * Run a callback only when the SELECT key is clicked.
 */
export function onSelectKey(
  callback
) {
  return onKeyPress(
    (key, event) => {

      if (
        key === KEY_SELECT &&
        event === KEY_EVENT_CLICK
      ) {
        callback();
      }

      return true;
    }
  );
}


/**
 * Go directly back when BACK is clicked.
 *
 * Useful for simple pages where BACK should always
 * behave like the native page back action.
 */
export function enableBackNavigation() {
  return onBackKey(() => {
    back();
  });
}


/* =========================================================
 * SWIPE / GESTURE INPUT
 * ========================================================= */


/**
 * Register a gesture listener.
 *
 * The callback receives:
 *
 * GESTURE_UP
 * GESTURE_DOWN
 * GESTURE_LEFT
 * GESTURE_RIGHT
 *
 * Return:
 *
 * true  = block default gesture behavior
 * false = allow default behavior
 */
export function onSwipe(
  callback
) {
  if (
    typeof callback !==
    "function"
  ) {
    throw new TypeError(
      "onSwipe callback must be a function"
    );
  }

  return onGesture({
    callback
  });
}


/**
 * Remove the current gesture listener.
 */
export function offSwipe() {
  return offGesture();
}


/**
 * Run callback when the user swipes UP.
 */
export function onSwipeUp(
  callback
) {
  return onSwipe(
    (gesture) => {

      if (
        gesture === GESTURE_UP
      ) {
        return callback();
      }

      return false;
    }
  );
}


/**
 * Run callback when the user swipes DOWN.
 */
export function onSwipeDown(
  callback
) {
  return onSwipe(
    (gesture) => {

      if (
        gesture === GESTURE_DOWN
      ) {
        return callback();
      }

      return false;
    }
  );
}


/**
 * Run callback when the user swipes LEFT.
 */
export function onSwipeLeft(
  callback
) {
  return onSwipe(
    (gesture) => {

      if (
        gesture === GESTURE_LEFT
      ) {
        return callback();
      }

      return false;
    }
  );
}


/**
 * Run callback when the user swipes RIGHT.
 */
export function onSwipeRight(
  callback
) {
  return onSwipe(
    (gesture) => {

      if (
        gesture === GESTURE_RIGHT
      ) {
        return callback();
      }

      return false;
    }
  );
}


/* =========================================================
 * DIGITAL CROWN
 * ========================================================= */


/**
 * Listen for digital crown rotation.
 *
 * callback:
 *
 * (key, degree) => {
 *   console.log(degree);
 * }
 *
 * Positive degree:
 *   counter-clockwise
 *
 * Negative degree:
 *   clockwise
 */
export function onCrown(
  callback
) {
  if (
    typeof callback !==
    "function"
  ) {
    throw new TypeError(
      "onCrown callback must be a function"
    );
  }

  return onDigitalCrown({
    callback
  });
}


/**
 * Remove the digital crown listener.
 */
export function offCrown() {
  return offDigitalCrown();
}


/**
 * Run callback when crown turns clockwise.
 *
 * The callback receives the absolute rotation amount.
 */
export function onCrownClockwise(
  callback
) {
  return onCrown(
    (key, degree) => {

      if (degree < 0) {
        callback(
          Math.abs(degree),
          key
        );
      }
    }
  );
}


/**
 * Run callback when crown turns counter-clockwise.
 */
export function onCrownCounterClockwise(
  callback
) {
  return onCrown(
    (key, degree) => {

      if (degree > 0) {
        callback(
          degree,
          key
        );
      }
    }
  );
}


/* =========================================================
 * WRIST MOTION
 * ========================================================= */


/**
 * Listen for wrist-motion events.
 *
 * callback receives:
 *
 * {
 *   type,
 *   motion
 * }
 */
export function onWrist(
  callback
) {
  if (
    typeof callback !==
    "function"
  ) {
    throw new TypeError(
      "onWrist callback must be a function"
    );
  }

  return onWristMotion({
    callback
  });
}


/**
 * Detect wrist lift.
 */
export function onWristLift(
  callback
) {
  return onWrist(
    (result) => {

      if (
        result.motion ===
        WRIST_MOTION_LIFT
      ) {
        callback(result);
      }
    }
  );
}


/**
 * Detect wrist lowering.
 */
export function onWristLower(
  callback
) {
  return onWrist(
    (result) => {

      if (
        result.motion ===
        WRIST_MOTION_LOWER
      ) {
        callback(result);
      }
    }
  );
}


/**
 * Detect wrist flip.
 */
export function onWristFlip(
  callback
) {
  return onWrist(
    (result) => {

      if (
        result.motion ===
        WRIST_MOTION_FLIP
      ) {
        callback(result);
      }
    }
  );
}


/* =========================================================
 * TOASTS
 * ========================================================= */


/**
 * Show a small native toast message.
 *
 * Example:
 *
 * toast("Saved!");
 */
export function toast(
  content
) {
  return showToast({
    content:
      String(content)
  });
}


/**
 * Show a success-style generic notification.
 *
 * Zepp's native toast does not expose a separate
 * success/error appearance, so this simply provides
 * a convenient named helper.
 */
export function successToast(
  message
) {
  return toast(
    String(message)
  );
}


/**
 * Show an error-style generic notification.
 */
export function errorToast(
  message
) {
  return toast(
    String(message)
  );
}


/* =========================================================
 * MODALS
 * ========================================================= */


/**
 * Create a native modal.
 *
 * All native createModal options can be passed.
 *
 * Example:
 *
 * const dialog = modal({
 *   content: "Delete this item?",
 *   onClick: ({ type }) => {
 *     if (type === MODAL_CONFIRM) {
 *       // delete
 *     }
 *   }
 * });
 */
export function modal(
  options = {}
) {
  return createModal(
    options
  );
}


/**
 * Show a simple confirmation modal.
 *
 * callback receives:
 *
 * true  = confirm
 * false = cancel
 */
export function confirm(
  content,
  callback,
  options = {}
) {

  let dialog;

  dialog = createModal({

    ...options,

    content:

      options.content ??
      String(content),

    autoHide:
      options.autoHide ??
      true,

    onClick:
      (keyObj) => {

        if (
          keyObj.type ===
          MODAL_CONFIRM
        ) {
          if (
            typeof callback ===
            "function"
          ) {
            callback(true);
          }

          return;
        }


        if (
          keyObj.type ===
          MODAL_CANCEL
        ) {
          if (
            typeof callback ===
            "function"
          ) {
            callback(false);
          }
        }
      }
  });

  return dialog;
}


/**
 * Show a modal.
 */
export function showModal(
  dialog
) {
  if (
    dialog &&
    typeof dialog.show ===
    "function"
  ) {
    dialog.show(true);
  }

  return dialog;
}


/**
 * Hide a modal.
 */
export function hideModal(
  dialog
) {
  if (
    dialog &&
    typeof dialog.show ===
    "function"
  ) {
    dialog.show(false);
  }

  return dialog;
}


/* =========================================================
 * ROUTER / PAGE NAVIGATION
 * ========================================================= */


/**
 * Open another page inside the current Mini Program.
 *
 * Example:
 *
 * goTo("page/settings");
 */
export function goTo(
  url,
  params
) {
  const options = {
    url
  };

  if (
    params !==
    undefined
  ) {
    options.params =
      params;
  }

  return push(
    options
  );
}


/**
 * Replace the current page.
 *
 * Unlike goTo(), the current page is closed.
 */
export function replacePage(
  url,
  params
) {
  const options = {
    url
  };

  if (
    params !==
    undefined
  ) {
    options.params =
      params;
  }

  return replace(
    options
  );
}


/**
 * Go back to the previous page.
 */
export function goBack() {
  return back();
}


/**
 * Return to the watch face.
 */
export function goHome() {
  return home();
}


/**
 * Exit the Mini Program and return to the app list.
 */
export function exitApp() {
  return exit();
}


/**
 * Launch another Mini Program.
 *
 * Example:
 *
 * launchMiniApp({
 *   appId: 12345,
 *   url: "page/index",
 *   params: {
 *     hello: true
 *   }
 * });
 */
export function launchMiniApp(
  options = {}
) {
  const {
    appId,
    url,
    params
  } = options;

  if (
    typeof appId !==
    "number"
  ) {
    throw new TypeError(
      "launchMiniApp requires a numeric appId"
    );
  }

  if (
    typeof url !==
    "string"
  ) {
    throw new TypeError(
      "launchMiniApp requires a url"
    );
  }

  return launchApp({
    appId,
    url,
    params,
    native: false
  });
}


/**
 * Launch a native Zepp system application.
 *
 * Example:
 *
 * launchSystemApp(SYSTEM_APP_HR);
 */
export function launchSystemApp(
  appId,
  params
) {
  if (
    typeof appId !==
    "number"
  ) {
    throw new TypeError(
      "launchSystemApp requires a numeric appId"
    );
  }

  const options = {
    appId,
    native: true
  };

  if (
    params !==
    undefined
  ) {
    options.params =
      params;
  }

  return launchApp(
    options
  );
}


/* =========================================================
 * PAGE SCROLLING
 * ========================================================= */


/**
 * Scroll the current page to a Y position.
 *
 * Example:
 *
 * scrollPageTo(-300);
 */
export function scrollPageTo(
  y,
  animation
) {
  const options = {
    y
  };

  if (
    animation !==
    undefined
  ) {
    options.animConfig =
      animation;
  }

  return scrollTo(
    options
  );
}


/**
 * Get the current page scroll position.
 */
export function getPageScroll() {
  return getScrollTop();
}


/**
 * Scroll to the top of the page.
 */
export function scrollToTop(
  animation
) {
  return scrollPageTo(
    0,
    animation
  );
}


/**
 * Scroll to a page position smoothly.
 *
 * Example:
 *
 * scrollSmoothTo(-500, 300);
 */
export function scrollSmoothTo(
  y,
  duration = 300,
  rate = "easeout"
) {
  return scrollPageTo(
    y,
    {
      anim_rate:
        rate,

      anim_duration:
        duration
    }
  );
}


/**
 * Configure the page as normal free scrolling.
 */
export function enableFreeScroll(
  options = {}
) {
  return setScrollMode({
    mode:
      SCROLL_MODE_FREE,

    options
  });
}


/**
 * Configure the page as a vertical swiper.
 *
 * height:
 * Height of one swiper screen/item.
 *
 * count:
 * Number of swiper items.
 */
export function enableVerticalSwiper(
  height,
  count,
  options = {}
) {
  return setScrollMode({
    mode:
      SCROLL_MODE_SWIPER,

    options: {
      height,
      count,
      ...options
    }
  });
}


/**
 * Configure the page as a horizontal swiper.
 *
 * width:
 * Width of one swiper screen/item.
 *
 * count:
 * Number of swiper items.
 */
export function enableHorizontalSwiper(
  width,
  count,
  options = {}
) {
  return setScrollMode({
    mode:
      SCROLL_MODE_SWIPER_HORIZONTAL,

    options: {
      width,
      count,
      ...options
    }
  });
}


/**
 * Move a swiper to a specific index.
 *
 * Note:
 * Zepp's native swiper index starts at 0.
 */
export function swipeToPage(
  index,
  animation =
    SCROLL_ANIMATION_SMOOTH
) {
  return swipeToIndex({
    index,
    animation
  });
}


/**
 * Get the currently visible swiper index.
 *
 * Zepp reports this index starting from 1.
 */
export function getCurrentSwiperIndex() {
  return getSwiperIndex();
}


/**
 * Move a swiper directly without animation.
 */
export function jumpToPage(
  index
) {
  return swipeToPage(
    index,
    SCROLL_ANIMATION_NONE
  );
}


/* =========================================================
 * COMMON DEVICE NAVIGATION HELPERS
 * ========================================================= */


/**
 * Open the watch's native Heart Rate app.
 */
export function openHeartRate() {
  return launchSystemApp(
    SYSTEM_APP_HR
  );
}


/**
 * Open the watch's native Weather app.
 */
export function openWeather() {
  return launchSystemApp(
    SYSTEM_APP_WEATHER
  );
}


/**
 * Open the watch's native Alarm app.
 */
export function openAlarm() {
  return launchSystemApp(
    SYSTEM_APP_ALARM
  );
}


/**
 * Open the watch's native Music app.
 */
export function openMusic() {
  return launchSystemApp(
    SYSTEM_APP_MUSIC
  );
}


/**
 * Open the watch's native Stopwatch app.
 */
export function openStopwatch() {
  return launchSystemApp(
    SYSTEM_APP_STOPWATCH
  );
}


/**
 * Open the watch's native Countdown/Timer app.
 */
export function openTimer() {
  return launchSystemApp(
    SYSTEM_APP_COUNTDOWN
  );
}


/**
 * Open the watch's native Find Phone app.
 */
export function openFindPhone() {
  return launchSystemApp(
    SYSTEM_APP_FINE_PHONE
  );
}


/**
 * Open the watch's native Settings app.
 */
export function openSettings() {
  return launchSystemApp(
    SYSTEM_APP_SETTING
  );
}


/**
 * Open the watch's native Camera Remote app.
 */
export function openCameraRemote() {
  return launchSystemApp(
    SYSTEM_APP_CAMERA
  );
}


/**
 * Open the watch's native Phone app.
 */
export function openPhone() {
  return launchSystemApp(
    SYSTEM_APP_PHONE
  );
}


/**
 * Open the watch's native Calendar app.
 */
export function openCalendar() {
  return launchSystemApp(
    SYSTEM_APP_CALENDAR
  );
}


/**
 * Open the watch's native Compass app.
 */
export function openCompass() {
  return launchSystemApp(
    SYSTEM_APP_COMPASS
  );
}


/**
 * Open the watch's native Workout app.
 */
export function openWorkout() {
  return launchSystemApp(
    SYSTEM_APP_SPORT
  );
}


/**
 * Open the native Status/Activity app.
 */
export function openStatus() {
  return launchSystemApp(
    SYSTEM_APP_STATUS
  );
}


/**
 * Open the native Cards app.
 */
export function openCards() {
  return launchSystemApp(
    SYSTEM_APP_CARD
  );
}


/* =========================================================
 * NATIVE CONSTANT EXPORTS
 * ========================================================= */


/*
 * Keys
 */
export {
  KEY_BACK,
  KEY_SELECT,
  KEY_HOME,
  KEY_UP,
  KEY_DOWN,
  KEY_SHORTCUT
};


/*
 * Key event types
 */
export {
  KEY_EVENT_CLICK,
  KEY_EVENT_LONG_PRESS,
  KEY_EVENT_DOUBLE_CLICK,
  KEY_EVENT_PRESS,
  KEY_EVENT_RELEASE
};


/*
 * Gestures
 */
export {
  GESTURE_UP,
  GESTURE_DOWN,
  GESTURE_LEFT,
  GESTURE_RIGHT
};


/*
 * Wrist motion
 */
export {
  WRIST_MOTION_LIFT,
  WRIST_MOTION_LOWER,
  WRIST_MOTION_FLIP
};


/*
 * Modal buttons
 */
export {
  MODAL_CONFIRM,
  MODAL_CANCEL
};


/*
 * Scroll modes
 */
export {
  SCROLL_MODE_FREE,
  SCROLL_MODE_SWIPER,
  SCROLL_MODE_SWIPER_HORIZONTAL
};


/*
 * Scroll animations
 */
export {
  SCROLL_ANIMATION_SMOOTH,
  SCROLL_ANIMATION_NONE
};


/*
 * Native system app IDs
 */
export {
  SYSTEM_APP_STATUS,
  SYSTEM_APP_HR,
  SYSTEM_APP_SPORT,
  SYSTEM_APP_WEATHER,
  SYSTEM_APP_ALARM,
  SYSTEM_APP_CAMERA,
  SYSTEM_APP_MUSIC,
  SYSTEM_APP_STOPWATCH,
  SYSTEM_APP_COUNTDOWN,
  SYSTEM_APP_FINE_PHONE,
  SYSTEM_APP_CARD,
  SYSTEM_APP_SETTING,
  SYSTEM_APP_COMPASS,
  SYSTEM_APP_CALENDAR,
  SYSTEM_APP_PHONE
};