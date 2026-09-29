/*
 * =========================================================
 * ZEPPCORE NAVIGATION
 * =========================================================
 *
 * Friendly wrappers around @zos/router.
 * =========================================================
 */

import {
  push,
  replace,
  back,
  home,
  exit,
  launchApp,
  setLaunchAppTimeout,
  clearLaunchAppTimeout
} from "@zos/router";

export function goTo(url, params) {
  const options = { url };

  if (params !== undefined) options.params = params;

  return push(options);
}

export function replacePage(url, params) {
  const options = { url };

  if (params !== undefined) options.params = params;

  return replace(options);
}

export function goBack() {
  return back();
}

export function goHome() {
  return home();
}

export function exitApp() {
  return exit();
}

export function launchMiniApp(appId, url = "", params) {
  const options = {
    appId,
    url
  };

  if (params !== undefined) options.params = params;

  return launchApp(options);
}

export function launchSystemApp(appId) {
  return launchApp({
    appId,
    native: true
  });
}

export function scheduleLaunch(options = {}) {
  return setLaunchAppTimeout(options);
}

export function cancelScheduledLaunch(timeoutId) {
  return clearLaunchAppTimeout({ timeoutId });
}

export {
  launchApp,
  setLaunchAppTimeout,
  clearLaunchAppTimeout
};
