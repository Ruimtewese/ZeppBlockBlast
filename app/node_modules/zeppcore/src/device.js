/*
 * =========================================================
 * ZEPPCORE DEVICE
 * =========================================================
 *
 * Friendly wrappers for:
 *
 * @zos/device
 * @zos/display
 * @zos/settings
 * @zos/sensor -> Vibrator
 *
 * This file handles things that describe or control the
 * watch itself rather than user-health sensors.
 *
 * Example:
 *
 * import {
 *   getDevice,
 *   getDisplay,
 *   setBrightness,
 *   vibrate
 * } from "zeppcore";
 *
 * =========================================================
 */


import {
  getDeviceInfo,
  getDiskInfo,
  SCREEN_SHAPE_SQUARE,
  SCREEN_SHAPE_ROUND
} from "@zos/device";


import {
  getBrightness,
  setBrightness,
  getAutoBrightness,
  setAutoBrightness,

  getSettings,

  setScreenOff,

  setPageBrightTime,
  resetPageBrightTime,

  setWakeUpRelaunch,

  pausePalmScreenOff,
  resetPalmScreenOff
} from "@zos/display";


import {
  getLanguage,

  getDateFormat,
  DATE_FORMAT_YMD,
  DATE_FORMAT_DMY,
  DATE_FORMAT_MDY,

  getDistanceUnit,
  DISTANCE_UNIT_METRIC,
  DISTANCE_UNIT_IMPERIAL,

  getWeightUnit,
  WEIGHT_UNIT_KILOGRAM,
  WEIGHT_UNIT_JIN,
  WEIGHT_UNIT_POUND,
  WEIGHT_UNIT_STONE,

  getTemperatureUnit,
  TEMPERATURE_UNIT_CENTIGRADE,
  TEMPERATURE_UNIT_FAHRENHEIT,

  getTimeFormat,
  TIME_FORMAT_12,
  TIME_FORMAT_24,

  getSystemInfo,
  getSystemMode
} from "@zos/settings";


import {
  Vibrator,

  VIBRATOR_SCENE_SHORT_LIGHT,
  VIBRATOR_SCENE_SHORT_MIDDLE,
  VIBRATOR_SCENE_SHORT_STRONG,

  VIBRATOR_SCENE_DURATION,
  VIBRATOR_SCENE_DURATION_LONG,

  VIBRATOR_SCENE_STRONG_REMINDER,
  VIBRATOR_SCENE_NOTIFICATION,
  VIBRATOR_SCENE_CALL,
  VIBRATOR_SCENE_TIMER
} from "@zos/sensor";


/* =========================================================
 * DEVICE INFORMATION
 * ========================================================= */


/**
 * Get all basic information about the current watch.
 *
 * Returns the native getDeviceInfo() object.
 *
 * Example:
 *
 * const device = getDevice();
 *
 * console.log(device.width);
 * console.log(device.height);
 * console.log(device.deviceName);
 */
export function getDevice() {
  return getDeviceInfo();
}


/**
 * Get the current screen dimensions.
 *
 * Returns:
 *
 * {
 *   width,
 *   height
 * }
 */
export function getScreenSize() {
  const {
    width,
    height
  } = getDeviceInfo();

  return {
    width,
    height
  };
}


/**
 * Get the device's screen width.
 */
export function getScreenWidth() {
  return getDeviceInfo().width;
}


/**
 * Get the device's screen height.
 */
export function getScreenHeight() {
  return getDeviceInfo().height;
}


/**
 * Get the device numeric source identifier.
 */
export function getDeviceSource() {
  return getDeviceInfo().deviceSource;
}


/**
 * Get the number of physical buttons/keys.
 */
export function getKeyCount() {
  return getDeviceInfo().keyNumber;
}


/**
 * Get the physical key type.
 */
export function getKeyType() {
  return getDeviceInfo().keyType;
}


/**
 * Get the device name.
 */
export function getDeviceName() {
  return getDeviceInfo().deviceName;
}


/**
 * Get the device color identifier.
 */
export function getDeviceColor() {
  return getDeviceInfo().deviceColor;
}


/**
 * Check whether the current device has a square display.
 */
export function isSquareScreen() {
  return (
    getDeviceInfo().screenShape ===
    SCREEN_SHAPE_SQUARE
  );
}


/**
 * Check whether the current device has a round display.
 */
export function isRoundScreen() {
  return (
    getDeviceInfo().screenShape ===
    SCREEN_SHAPE_ROUND
  );
}


/**
 * Get the raw screen-shape constant.
 */
export function getScreenShape() {
  return getDeviceInfo().screenShape;
}


/**
 * Return a convenient complete device summary.
 */
export function getDeviceSummary() {
  const device =
    getDeviceInfo();

  return {
    width:
      device.width,

    height:
      device.height,

    screenShape:
      device.screenShape,

    isSquare:
      device.screenShape ===
      SCREEN_SHAPE_SQUARE,

    isRound:
      device.screenShape ===
      SCREEN_SHAPE_ROUND,

    deviceName:
      device.deviceName,

    deviceSource:
      device.deviceSource,

    keyNumber:
      device.keyNumber,

    keyType:
      device.keyType,

    deviceColor:
      device.deviceColor
  };
}


/* =========================================================
 * STORAGE / DISK INFORMATION
 * ========================================================= */


/**
 * Get storage information.
 *
 * Returns:
 *
 * {
 *   total,
 *   free,
 *   app,
 *   watchface,
 *   music,
 *   system
 * }
 *
 * Values are bytes.
 */
export function getStorageInfo() {
  return getDiskInfo();
}


/**
 * Get total device storage in bytes.
 */
export function getStorageTotal() {
  return getDiskInfo().total;
}


/**
 * Get free device storage in bytes.
 */
export function getStorageFree() {
  return getDiskInfo().free;
}


/**
 * Get storage occupied by mini-programs in bytes.
 */
export function getAppStorage() {
  return getDiskInfo().app;
}


/**
 * Get storage occupied by watch faces in bytes.
 */
export function getWatchfaceStorage() {
  return getDiskInfo().watchface;
}


/**
 * Get storage occupied by music in bytes.
 */
export function getMusicStorage() {
  return getDiskInfo().music;
}


/**
 * Get storage occupied by the system in bytes.
 */
export function getSystemStorage() {
  return getDiskInfo().system;
}


/**
 * Convert bytes into convenient MB/GB values.
 *
 * Example:
 *
 * const storage = getStorageHuman();
 *
 * storage.freeMB
 * storage.freeGB
 */
export function getStorageHuman() {
  const disk =
    getDiskInfo();

  const MB =
    1024 * 1024;

  const GB =
    MB * 1024;

  return {
    total:
      disk.total,

    free:
      disk.free,

    app:
      disk.app,

    watchface:
      disk.watchface,

    music:
      disk.music,

    system:
      disk.system,

    totalMB:
      disk.total / MB,

    freeMB:
      disk.free / MB,

    totalGB:
      disk.total / GB,

    freeGB:
      disk.free / GB
  };
}


/* =========================================================
 * DISPLAY / BRIGHTNESS
 * ========================================================= */


/**
 * Get the current screen brightness.
 *
 * Returns 0-100.
 */
export function getBrightnessLevel() {
  return getBrightness();
}


/**
 * Set the screen brightness.
 *
 * brightness:
 * 0-100
 *
 * Returns the native Zepp result.
 *
 * Note:
 * If auto-brightness is enabled, manual brightness
 * changes will not take effect until auto-brightness
 * is disabled.
 */
export function setBrightnessLevel(
  brightness
) {
  const value =
    clamp(
      brightness,
      0,
      100
    );

  return setBrightness({
    brightness:
      value
  });
}


/**
 * Get whether automatic brightness is enabled.
 */
export function isAutoBrightnessEnabled() {
  return getAutoBrightness();
}


/**
 * Enable or disable automatic brightness.
 */
export function setAutoBrightnessEnabled(
  enabled
) {
  setAutoBrightness(
    Boolean(enabled)
  );
}


/**
 * Convenience function for forcing manual brightness.
 *
 * Disables auto-brightness first, then sets brightness.
 */
export function setManualBrightness(
  brightness
) {
  setAutoBrightness(
    false
  );

  return setBrightnessLevel(
    brightness
  );
}


/* =========================================================
 * SCREEN WAKE / SCREEN TIME
 * ========================================================= */


/**
 * Keep the current page bright for a specific amount
 * of time.
 *
 * milliseconds:
 * 1000 - 2147483000
 *
 * Example:
 *
 * setPageBrightnessTime(
 *   2147483000
 * );
 */
export function setPageBrightnessTime(
  milliseconds
) {
  const value =
    clamp(
      milliseconds,
      1000,
      2147483000
    );

  return setPageBrightTime({
    brightTime:
      value
  });
}


/**
 * Keep the page bright for the maximum documented time.
 *
 * Useful for tools like maps, calculators, remote controls,
 * timers, etc.
 */
export function keepScreenAwake() {
  return setPageBrightTime({
    brightTime:
      2147483000
  });
}


/**
 * Reset the page-specific brightness timeout back to
 * the system behavior.
 */
export function resetPageBrightnessTime() {
  return resetPageBrightTime();
}


/**
 * Immediately turn the screen off.
 */
export function turnScreenOff() {
  return setScreenOff();
}


/**
 * Choose whether the current app page should reopen
 * after the watch wakes from the screen-off state.
 */
export function setWakeUpRelaunchEnabled(
  enabled
) {
  setWakeUpRelaunch({
    relaunch:
      Boolean(enabled)
  });
}


/* =========================================================
 * DISPLAY SETTINGS
 * ========================================================= */


/**
 * Get system display settings.
 *
 * Includes:
 *
 * - screen
 * - wrist
 * - standby
 */
export function getDisplaySettings() {
  return getSettings();
}


/**
 * Get screen settings only.
 */
export function getScreenSettings() {
  return getSettings().screen;
}


/**
 * Get wrist-lift settings.
 */
export function getWristSettings() {
  return getSettings().wrist;
}


/**
 * Get standby/display settings.
 */
export function getStandbySettings() {
  return getSettings().standby;
}


/**
 * Temporarily pause palm-rest screen-off behavior.
 *
 * duration is milliseconds.
 *
 * Passing 0 keeps it paused until resetPalmScreenOff()
 * is called.
 */
export function pausePalmScreenOffFor(
  duration = 30000
) {
  return pausePalmScreenOff({
    duration:
      Math.max(
        0,
        duration
      )
  });
}


/**
 * Restore normal palm-rest screen behavior.
 */
export function resetPalmScreenOffBehavior() {
  return resetPalmScreenOff();
}


/* =========================================================
 * SYSTEM INFORMATION
 * ========================================================= */


/**
 * Get Zepp OS and firmware information.
 *
 * Returns:
 *
 * {
 *   osVersion,
 *   firmwareVersion,
 *   minAPI
 * }
 */
export function getSystemInformation() {
  return getSystemInfo();
}


/**
 * Get the minimum API level supported by the device.
 */
export function getDeviceApiLevel() {
  return getSystemInfo().minAPI;
}


/**
 * Get the Zepp OS version.
 */
export function getOsVersion() {
  return getSystemInfo().osVersion;
}


/**
 * Get the watch firmware version.
 */
export function getFirmwareVersion() {
  return getSystemInfo().firmwareVersion;
}


/**
 * Get current system modes.
 *
 * Includes things such as:
 *
 * - DND
 * - sleep
 * - theater
 * - systemLock
 * - lowTemperature
 * - powerSaving
 * - ultraPowerSaving
 */
export function getSystemModes() {
  return getSystemMode();
}


/* =========================================================
 * LANGUAGE / REGIONAL SETTINGS
 * ========================================================= */


/**
 * Get the current system language code number.
 */
export function getLanguageCode() {
  return getLanguage();
}


/**
 * Get the user's date format setting.
 */
export function getDateFormatSetting() {
  return getDateFormat();
}


/**
 * Get the user's time format setting.
 */
export function getTimeFormatSetting() {
  return getTimeFormat();
}


/**
 * Check whether the user uses 12-hour time.
 */
export function uses12HourTime() {
  return (
    getTimeFormat() ===
    TIME_FORMAT_12
  );
}


/**
 * Check whether the user uses 24-hour time.
 */
export function uses24HourTime() {
  return (
    getTimeFormat() ===
    TIME_FORMAT_24
  );
}


/**
 * Get the user's distance-unit setting.
 */
export function getDistanceUnitSetting() {
  return getDistanceUnit();
}


/**
 * Check whether the user uses metric units.
 */
export function usesMetricDistance() {
  return (
    getDistanceUnit() ===
    DISTANCE_UNIT_METRIC
  );
}


/**
 * Check whether the user uses imperial distance units.
 */
export function usesImperialDistance() {
  return (
    getDistanceUnit() ===
    DISTANCE_UNIT_IMPERIAL
  );
}


/**
 * Get the user's weight-unit setting.
 */
export function getWeightUnitSetting() {
  return getWeightUnit();
}


/**
 * Get the user's temperature-unit setting.
 */
export function getTemperatureUnitSetting() {
  return getTemperatureUnit();
}


/**
 * Check whether the user uses Celsius.
 */
export function usesCelsius() {
  return (
    getTemperatureUnit() ===
    TEMPERATURE_UNIT_CENTIGRADE
  );
}


/**
 * Check whether the user uses Fahrenheit.
 */
export function usesFahrenheit() {
  return (
    getTemperatureUnit() ===
    TEMPERATURE_UNIT_FAHRENHEIT
  );
}


/**
 * Return all regional settings together.
 */
export function getRegionalSettings() {
  return {
    language:
      getLanguage(),

    dateFormat:
      getDateFormat(),

    timeFormat:
      getTimeFormat(),

    distanceUnit:
      getDistanceUnit(),

    weightUnit:
      getWeightUnit(),

    temperatureUnit:
      getTemperatureUnit()
  };
}


/* =========================================================
 * VIBRATION
 * ========================================================= */


/**
 * Create a native Vibrator instance.
 *
 * Useful for advanced vibration control.
 */
export function createVibrator() {
  return new Vibrator();
}


/**
 * Trigger a short light vibration.
 */
export function vibrateLight() {
  const vibrator =
    new Vibrator();

  vibrator.start({
    mode:
      VIBRATOR_SCENE_SHORT_LIGHT
  });
}


/**
 * Trigger a normal short vibration.
 */
export function vibrate() {
  const vibrator =
    new Vibrator();

  vibrator.start({
    mode:
      VIBRATOR_SCENE_SHORT_MIDDLE
  });
}


/**
 * Trigger a strong short vibration.
 */
export function vibrateStrong() {
  const vibrator =
    new Vibrator();

  vibrator.start({
    mode:
      VIBRATOR_SCENE_SHORT_STRONG
  });
}


/**
 * Trigger a longer vibration.
 */
export function vibrateLong() {
  const vibrator =
    new Vibrator();

  vibrator.start({
    mode:
      VIBRATOR_SCENE_DURATION_LONG
  });
}


/**
 * Trigger a short notification-style vibration.
 */
export function vibrateNotification() {
  const vibrator =
    new Vibrator();

  vibrator.start({
    mode:
      VIBRATOR_SCENE_NOTIFICATION
  });
}


/**
 * Trigger the standard timer/alarm vibration.
 *
 * This is a continuous scene and should normally be
 * stopped explicitly.
 */
export function startTimerVibration() {
  const vibrator =
    new Vibrator();

  vibrator.start({
    mode:
      VIBRATOR_SCENE_TIMER
  });

  return vibrator;
}


/**
 * Start a call-style vibration.
 *
 * Returns the vibrator so the caller can stop it.
 */
export function startCallVibration() {
  const vibrator =
    new Vibrator();

  vibrator.start({
    mode:
      VIBRATOR_SCENE_CALL
  });

  return vibrator;
}


/**
 * Start a strong reminder vibration.
 */
export function vibrateReminder() {
  const vibrator =
    new Vibrator();

  vibrator.start({
    mode:
      VIBRATOR_SCENE_STRONG_REMINDER
  });
}


/**
 * Stop an active vibration.
 *
 * Pass the Vibrator returned from:
 *
 * startTimerVibration()
 * startCallVibration()
 */
export function stopVibration(
  vibrator
) {
  if (
    vibrator &&
    typeof vibrator.stop ===
    "function"
  ) {
    vibrator.stop();
  }
}


/* =========================================================
 * CONVENIENCE DEVICE SUMMARY
 * ========================================================= */


/**
 * Get a useful dashboard-style snapshot of the device.
 *
 * This combines information from several Zepp modules.
 */
export function getDeviceSnapshot() {

  const device =
    getDeviceInfo();

  const disk =
    getDiskInfo();

  const system =
    getSystemInfo();

  return {

    device: {
      width:
        device.width,

      height:
        device.height,

      screenShape:
        device.screenShape,

      deviceName:
        device.deviceName,

      deviceSource:
        device.deviceSource,

      keyNumber:
        device.keyNumber,

      keyType:
        device.keyType,

      deviceColor:
        device.deviceColor
    },


    storage: {
      total:
        disk.total,

      free:
        disk.free,

      app:
        disk.app,

      watchface:
        disk.watchface,

      music:
        disk.music,

      system:
        disk.system
    },


    system: {
      osVersion:
        system.osVersion,

      firmwareVersion:
        system.firmwareVersion,

      minAPI:
        system.minAPI
    },


    display: {
      brightness:
        getBrightness(),

      autoBrightness:
        getAutoBrightness(),

      settings:
        getSettings()
    },


    regional: {
      language:
        getLanguage(),

      dateFormat:
        getDateFormat(),

      timeFormat:
        getTimeFormat(),

      distanceUnit:
        getDistanceUnit(),

      weightUnit:
        getWeightUnit(),

      temperatureUnit:
        getTemperatureUnit()
    }
  };
}


/* =========================================================
 * CONSTANTS
 * =========================================================
 *
 * These are exported so advanced applications can still
 * access Zepp's native constants through ZeppCore.
 */


/*
 * Screen shapes
 */
export {
  SCREEN_SHAPE_SQUARE,
  SCREEN_SHAPE_ROUND
};


/*
 * Date formats
 */
export {
  DATE_FORMAT_YMD,
  DATE_FORMAT_DMY,
  DATE_FORMAT_MDY
};


/*
 * Distance units
 */
export {
  DISTANCE_UNIT_METRIC,
  DISTANCE_UNIT_IMPERIAL
};


/*
 * Weight units
 */
export {
  WEIGHT_UNIT_KILOGRAM,
  WEIGHT_UNIT_JIN,
  WEIGHT_UNIT_POUND,
  WEIGHT_UNIT_STONE
};


/*
 * Temperature units
 */
export {
  TEMPERATURE_UNIT_CENTIGRADE,
  TEMPERATURE_UNIT_FAHRENHEIT
};


/*
 * Time formats
 */
export {
  TIME_FORMAT_12,
  TIME_FORMAT_24
};


/*
 * Vibration scenes
 */
export {
  VIBRATOR_SCENE_SHORT_LIGHT,
  VIBRATOR_SCENE_SHORT_MIDDLE,
  VIBRATOR_SCENE_SHORT_STRONG,

  VIBRATOR_SCENE_DURATION,
  VIBRATOR_SCENE_DURATION_LONG,

  VIBRATOR_SCENE_STRONG_REMINDER,
  VIBRATOR_SCENE_NOTIFICATION,
  VIBRATOR_SCENE_CALL,
  VIBRATOR_SCENE_TIMER
};


/* =========================================================
 * UTILITY
 * ========================================================= */

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}