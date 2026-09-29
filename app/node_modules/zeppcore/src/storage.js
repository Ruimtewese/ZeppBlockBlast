/*
 * =========================================================
 * ZEPPCORE STORAGE
 * =========================================================
 *
 * Handles:
 *
 * @zos/storage
 *   - Persistent LocalStorage
 *   - Temporary SessionStorage
 *
 * @zos/fs
 *   - Read/write files
 *   - JSON files
 *   - Binary files
 *   - Directories
 *   - File information
 *   - Rename/delete
 *   - Assets
 *
 * Zepp OS filesystem layout:
 *
 *   /assets
 *       Read-only application resources
 *
 *   /data
 *       Application read/write data
 *
 * Most helpers in this file work with relative paths.
 *
 * Example:
 *
 * import {
 *   setData,
 *   getData,
 *   saveJSON,
 *   loadJSON,
 *   fileExists
 * } from "zeppcore";
 *
 * =========================================================
 */


/* =========================================================
 * KEY-VALUE STORAGE
 * ========================================================= */

import {
  LocalStorage,
  SessionStorage
} from "@zos/storage";


/* =========================================================
 * FILESYSTEM
 * ========================================================= */

import {
  readFileSync,
  writeFileSync,

  openSync,
  openAssetsSync,
  closeSync,

  readSync,
  writeSync,

  statSync,
  statAssetsSync,

  readdirSync,

  mkdirSync,
  rmSync,
  renameSync,

  O_RDONLY,
  O_WRONLY,
  O_RDWR,
  O_APPEND,
  O_CREAT,
  O_EXCL,
  O_TRUNC
} from "@zos/fs";


/* =========================================================
 * DEFAULT STORAGE INSTANCES
 * =========================================================
 *
 * One LocalStorage instance is kept alive so repeated reads
 * and writes can use the same in-memory storage object.
 *
 * Zepp's documentation specifically notes that LocalStorage
 * keeps loaded data in memory, which makes it suitable for
 * repeated access.
 */


/**
 * Default persistent application storage.
 */
export const local =
  new LocalStorage();


/**
 * Default temporary session storage.
 */
export const session =
  new SessionStorage();


/* =========================================================
 * LOCAL STORAGE
 * ========================================================= */


/**
 * Save a persistent value.
 *
 * Data survives leaving the Mini Program and is cleared
 * when the Mini Program is uninstalled.
 *
 * Example:
 *
 * setData("theme", "dark");
 */
export function setData(
  key,
  value
) {
  local.setItem(
    key,
    value
  );
}


/**
 * Read a persistent value.
 *
 * Example:
 *
 * const theme =
 *   getData("theme", "dark");
 */
export function getData(
  key,
  defaultValue
) {
  return local.getItem(
    key,
    defaultValue
  );
}


/**
 * Delete one persistent value.
 *
 * Returns the native boolean result.
 */
export function removeData(
  key
) {
  return local.removeItem(
    key
  );
}


/**
 * Clear all persistent application data.
 *
 * Use carefully.
 */
export function clearData() {
  local.clear();
}


/**
 * Create another persistent storage namespace.
 *
 * Useful when you want separate files for different
 * groups of settings.
 *
 * Example:
 *
 * const settings =
 *   createStorage("settings");
 */
export function createStorage(
  path
) {
  return new LocalStorage(
    path
  );
}


/* =========================================================
 * SESSION STORAGE
 * ========================================================= */


/**
 * Save temporary data for the current Mini Program session.
 *
 * Session data is cleared after the Mini Program exits.
 */
export function setSession(
  key,
  value
) {
  session.setItem(
    key,
    value
  );
}


/**
 * Read temporary session data.
 */
export function getSession(
  key,
  defaultValue
) {
  return session.getItem(
    key,
    defaultValue
  );
}


/**
 * Delete temporary session data.
 */
export function removeSession(
  key
) {
  return session.removeItem(
    key
  );
}


/**
 * Clear all current session data.
 */
export function clearSession() {
  session.clear();
}


/**
 * Create an independent session storage object.
 */
export function createSession() {
  return new SessionStorage();
}


/* =========================================================
 * JSON CONVENIENCE
 * ========================================================= */


/**
 * Save any JavaScript value as JSON.
 *
 * Example:
 *
 * saveJSON(
 *   "settings.json",
 *   {
 *     theme: "blue",
 *     vibration: true
 *   }
 * );
 */
export function saveJSON(
  path,
  data
) {
  const json =
    JSON.stringify(
      data
    );

  writeFileSync({
    path,
    data: json,
    options: {
      encoding: "utf8"
    }
  });
}


/**
 * Load a JSON file.
 *
 * Returns:
 *   parsed object
 *
 * Returns defaultValue if the file cannot be read
 * or parsed.
 */
export function loadJSON(
  path,
  defaultValue = null
) {
  const content =
    readFileSync({
      path,
      options: {
        encoding: "utf8"
      }
    });

  if (
    typeof content !==
    "string"
  ) {
    return defaultValue;
  }

  try {
    return JSON.parse(
      content
    );
  } catch {
    return defaultValue;
  }
}


/**
 * Check whether a JSON file exists and contains valid JSON.
 */
export function isJSONFile(
  path
) {
  const data =
    loadJSON(
      path,
      undefined
    );

  return data !==
    undefined;
}


/**
 * Update a JSON object stored in a file.
 *
 * Example:
 *
 * updateJSON("settings.json", {
 *   theme: "blue"
 * });
 */
export function updateJSON(
  path,
  updates = {}
) {
  const current =
    loadJSON(
      path,
      {}
    );

  if (
    !isPlainObject(current)
  ) {
    throw new Error(
      "updateJSON requires the existing JSON value to be an object"
    );
  }

  const next = {
    ...current,
    ...updates
  };

  saveJSON(
    path,
    next
  );

  return next;
}


/**
 * Delete one property from a JSON object.
 */
export function removeJSONKey(
  path,
  key
) {
  const current =
    loadJSON(
      path,
      {}
    );

  if (
    !isPlainObject(current)
  ) {
    throw new Error(
      "removeJSONKey requires the JSON value to be an object"
    );
  }

  delete current[key];

  saveJSON(
    path,
    current
  );

  return current;
}


/* =========================================================
 * FILE READ / WRITE
 * ========================================================= */


/**
 * Read a UTF-8 text file.
 *
 * Returns undefined when the file cannot be read.
 */
export function readText(
  path
) {
  const result =
    readFileSync({
      path,
      options: {
        encoding: "utf8"
      }
    });

  return result;
}


/**
 * Read a raw binary file.
 *
 * Returns an ArrayBuffer.
 */
export function readBinary(
  path
) {
  return readFileSync({
    path
  });
}


/**
 * Write a UTF-8 text file.
 *
 * Existing contents are replaced.
 */
export function writeText(
  path,
  text
) {
  return writeFileSync({
    path,
    data:
      String(text),
    options: {
      encoding: "utf8"
    }
  });
}


/**
 * Write a raw ArrayBuffer/DataView/string-compatible value.
 */
export function writeBinary(
  path,
  data
) {
  return writeFileSync({
    path,
    data
  });
}


/* =========================================================
 * FILE APPENDING
 * ========================================================= */


/**
 * Append UTF-8 text to the end of a file.
 *
 * Creates the file when it does not exist.
 *
 * Example:
 *
 * appendText(
 *   "log.txt",
 *   "Battery: 82%\n"
 * );
 */
export function appendText(
  path,
  text
) {
  const fd =
    openSync({
      path,
      flag:
        O_WRONLY |
        O_APPEND |
        O_CREAT
    });

  try {

    return writeSync({
      fd,
      buffer:
        stringToArrayBuffer(
          String(text)
        )
    });

  } finally {

    closeSync({
      fd
    });

  }
}


/**
 * Append raw binary data.
 */
export function appendBinary(
  path,
  data
) {
  const fd =
    openSync({
      path,
      flag:
        O_WRONLY |
        O_APPEND |
        O_CREAT
    });

  try {

    return writeSync({
      fd,
      buffer:
        data
    });

  } finally {

    closeSync({
      fd
    });

  }
}


/* =========================================================
 * OPEN FILES
 * ========================================================= */


/**
 * Open a file and return its file descriptor.
 *
 * This is for advanced filesystem operations.
 */
export function openFile(
  path,
  flag = O_RDONLY
) {
  return openSync({
    path,
    flag
  });
}


/**
 * Close an opened file descriptor.
 */
export function closeFile(
  fd
) {
  return closeSync({
    fd
  });
}


/**
 * Read data from an already-open file.
 */
export function readOpenedFile(
  fd,
  buffer,
  options = {}
) {
  return readSync({
    fd,
    buffer,
    options
  });
}


/**
 * Write data to an already-open file.
 */
export function writeOpenedFile(
  fd,
  buffer,
  options = {}
) {
  return writeSync({
    fd,
    buffer,
    options
  });
}


/* =========================================================
 * FILE INFORMATION
 * ========================================================= */


/**
 * Get information about a file.
 *
 * Returns undefined when the file does not exist.
 *
 * Example:
 *
 * const info =
 *   getFileInfo("settings.json");
 */
export function getFileInfo(
  path
) {
  return statSync({
    path
  });
}


/**
 * Check whether a file exists.
 */
export function fileExists(
  path
) {
  return Boolean(
    statSync({
      path
    })
  );
}


/**
 * Get the size of a file in bytes.
 */
export function getFileSize(
  path
) {
  const info =
    getFileInfo(
      path
    );

  return info
    ? info.size
    : 0;
}


/**
 * Get the last modification time.
 *
 * Returns undefined if the file does not exist.
 */
export function getFileModifiedTime(
  path
) {
  const info =
    getFileInfo(
      path
    );

  return info
    ? info.mtimeMs
    : undefined;
}


/* =========================================================
 * DIRECTORY OPERATIONS
 * ========================================================= */


/**
 * Create a directory inside /data.
 *
 * Zepp returns 0 on success.
 */
export function createDirectory(
  path
) {
  return mkdirSync({
    path
  });
}


/**
 * List entries inside a directory.
 *
 * Returns undefined when the directory does not exist.
 */
export function listDirectory(
  path
) {
  return readdirSync({
    path
  });
}


/**
 * Check whether a directory exists.
 *
 * Zepp's stat result does not need to be interpreted
 * here; this helper simply checks for a filesystem entry.
 */
export function directoryExists(
  path
) {
  const result =
    readdirSync({
      path
    });

  return (
    Array.isArray(result)
  );
}


/**
 * Remove a file.
 *
 * Returns 0 on success.
 */
export function deleteFile(
  path
) {
  return rmSync({
    path
  });
}


/**
 * Rename a file.
 *
 * Returns 0 on success.
 */
export function renameFile(
  oldPath,
  newPath
) {
  return renameSync({
    oldPath,
    newPath
  });
}


/* =========================================================
 * BATCH FILE HELPERS
 * ========================================================= */


/**
 * Delete a file only when it exists.
 *
 * Returns:
 *
 * true  = deleted
 * false = didn't exist
 */
export function deleteIfExists(
  path
) {
  if (
    !fileExists(path)
  ) {
    return false;
  }

  return (
    deleteFile(path) === 0
  );
}


/**
 * Rename a file only when the source exists.
 */
export function renameIfExists(
  oldPath,
  newPath
) {
  if (
    !fileExists(oldPath)
  ) {
    return false;
  }

  return (
    renameFile(
      oldPath,
      newPath
    ) === 0
  );
}


/* =========================================================
 * ASSETS
 * =========================================================
 *
 * Assets are read-only.
 *
 * These helpers deliberately use openAssetsSync(),
 * because normal readFileSync() operates on /data.
 */


/**
 * Get information about an asset.
 */
export function getAssetInfo(
  path
) {
  return statAssetsSync({
    path
  });
}


/**
 * Check whether an asset exists.
 */
export function assetExists(
  path
) {
  return Boolean(
    statAssetsSync({
      path
    })
  );
}


/**
 * Get the size of an asset in bytes.
 */
export function getAssetSize(
  path
) {
  const info =
    getAssetInfo(
      path
    );

  return info
    ? info.size
    : 0;
}


/**
 * Open a read-only asset.
 */
export function openAsset(
  path
) {
  return openAssetsSync({
    path,
    flag:
      O_RDONLY
  });
}


/**
 * Read an asset as an ArrayBuffer.
 *
 * Example:
 *
 * const image =
 *   readAsset("images/logo.bin");
 */
export function readAsset(
  path
) {
  const info =
    statAssetsSync({
      path
    });

  if (!info) {
    return undefined;
  }

  const fd =
    openAssetsSync({
      path,
      flag:
        O_RDONLY
    });

  try {

    const buffer =
      new ArrayBuffer(
        info.size
      );

    readSync({
      fd,
      buffer
    });

    return buffer;

  } finally {

    closeSync({
      fd
    });

  }
}


/**
 * Read a text asset.
 *
 * Uses the raw asset bytes and decodes UTF-8.
 */
export function readAssetText(
  path
) {
  const buffer =
    readAsset(
      path
    );

  if (
    !buffer
  ) {
    return undefined;
  }

  return arrayBufferToString(
    buffer
  );
}


/**
 * Read a JSON asset.
 */
export function readAssetJSON(
  path,
  defaultValue = null
) {
  const text =
    readAssetText(
      path
    );

  if (
    typeof text !==
    "string"
  ) {
    return defaultValue;
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return defaultValue;
  }
}


/* =========================================================
 * HIGH-LEVEL PERSISTENT OBJECT STORAGE
 * ========================================================= */


/**
 * Save a complete object in LocalStorage.
 *
 * LocalStorage already supports objects directly, so JSON
 * serialization is not required. This helper exists to give
 * ZeppCore applications an obvious API.
 */
export function saveObject(
  key,
  object
) {
  local.setItem(
    key,
    object
  );
}


/**
 * Load an object from LocalStorage.
 */
export function loadObject(
  key,
  defaultValue = {}
) {
  return local.getItem(
    key,
    defaultValue
  );
}


/**
 * Delete an object from LocalStorage.
 */
export function deleteObject(
  key
) {
  return local.removeItem(
    key
  );
}


/* =========================================================
 * SETTINGS HELPERS
 * ========================================================= */


/**
 * Save a boolean setting.
 *
 * Example:
 *
 * setBool("enabled", true);
 */
export function setBool(
  key,
  value
) {
  local.setItem(
    key,
    Boolean(value)
  );
}


/**
 * Read a boolean setting.
 */
export function getBool(
  key,
  defaultValue = false
) {
  return Boolean(
    local.getItem(
      key,
      defaultValue
    )
  );
}


/**
 * Save a numeric setting.
 */
export function setNumber(
  key,
  value
) {
  local.setItem(
    key,
    Number(value)
  );
}


/**
 * Read a numeric setting.
 */
export function getNumber(
  key,
  defaultValue = 0
) {
  const value =
    local.getItem(
      key,
      defaultValue
    );

  return Number(value);
}


/**
 * Save a string setting.
 */
export function setString(
  key,
  value
) {
  local.setItem(
    key,
    String(value)
  );
}


/**
 * Read a string setting.
 */
export function getString(
  key,
  defaultValue = ""
) {
  return String(
    local.getItem(
      key,
      defaultValue
    )
  );
}


/* =========================================================
 * SESSION SETTINGS
 * ========================================================= */


/**
 * Save a session boolean.
 */
export function setSessionBool(
  key,
  value
) {
  session.setItem(
    key,
    Boolean(value)
  );
}


/**
 * Read a session boolean.
 */
export function getSessionBool(
  key,
  defaultValue = false
) {
  return Boolean(
    session.getItem(
      key,
      defaultValue
    )
  );
}


/**
 * Save a session number.
 */
export function setSessionNumber(
  key,
  value
) {
  session.setItem(
    key,
    Number(value)
  );
}


/**
 * Read a session number.
 */
export function getSessionNumber(
  key,
  defaultValue = 0
) {
  return Number(
    session.getItem(
      key,
      defaultValue
    )
  );
}


/**
 * Save a session string.
 */
export function setSessionString(
  key,
  value
) {
  session.setItem(
    key,
    String(value)
  );
}


/**
 * Read a session string.
 */
export function getSessionString(
  key,
  defaultValue = ""
) {
  return String(
    session.getItem(
      key,
      defaultValue
    )
  );
}


/* =========================================================
 * SIMPLE CACHE
 * =========================================================
 *
 * Small in-memory cache for data that does not need to be
 * persisted.
 */


const memoryCache =
  Object.create(null);


/**
 * Store something in the ZeppCore runtime cache.
 */
export function cacheSet(
  key,
  value
) {
  memoryCache[key] =
    value;
}


/**
 * Read something from the runtime cache.
 */
export function cacheGet(
  key,
  defaultValue
) {
  if (
    Object.prototype.hasOwnProperty.call(
      memoryCache,
      key
    )
  ) {
    return memoryCache[key];
  }

  return defaultValue;
}


/**
 * Check whether a cache entry exists.
 */
export function cacheHas(
  key
) {
  return Object.prototype.hasOwnProperty.call(
    memoryCache,
    key
  );
}


/**
 * Remove one cache entry.
 */
export function cacheDelete(
  key
) {
  if (
    cacheHas(key)
  ) {
    delete memoryCache[key];
    return true;
  }

  return false;
}


/**
 * Clear the complete runtime cache.
 */
export function cacheClear() {
  for (
    const key in memoryCache
  ) {
    delete memoryCache[key];
  }
}


/* =========================================================
 * CONVERSION HELPERS
 * ========================================================= */


/**
 * Convert a JavaScript string to UTF-8 ArrayBuffer.
 *
 * Uses TextEncoder when available.
 */
function stringToArrayBuffer(
  text
) {
  if (
    typeof TextEncoder ===
    "function"
  ) {
    const encoded =
      new TextEncoder().encode(
        text
      );

    return encoded.buffer;
  }


  /*
   * Fallback for Zepp runtimes that expose Uint8Array
   * but don't expose TextEncoder.
   */
  const length =
    text.length;

  const buffer =
    new ArrayBuffer(
      length
    );

  const view =
    new Uint8Array(
      buffer
    );

  for (
    let i = 0;
    i < length;
    i++
  ) {
    view[i] =
      text.charCodeAt(i) &
      0xff;
  }

  return buffer;
}


/**
 * Convert UTF-8 ArrayBuffer to JavaScript string.
 */
function arrayBufferToString(
  buffer
) {
  if (
    typeof TextDecoder ===
    "function"
  ) {
    return new TextDecoder(
      "utf-8"
    ).decode(
      buffer
    );
  }


  /*
   * Fallback decoder.
   */
  const view =
    new Uint8Array(
      buffer
    );

  let result =
    "";

  for (
    let i = 0;
    i < view.length;
    i++
  ) {
    result +=
      String.fromCharCode(
        view[i]
      );
  }

  return result;
}


/**
 * Check whether a value is a normal JavaScript object.
 */
function isPlainObject(
  value
) {
  return (
    value !== null &&
    typeof value ===
      "object" &&
    !Array.isArray(value)
  );
}


/* =========================================================
 * NATIVE EXPORTS
 * ========================================================= */


/*
 * Filesystem open flags.
 */
export {
  O_RDONLY,
  O_WRONLY,
  O_RDWR,
  O_APPEND,
  O_CREAT,
  O_EXCL,
  O_TRUNC
};


/*
 * Native filesystem functions.
 *
 * Exported for advanced applications that need an API
 * ZeppCore does not wrap yet.
 */
export {
  readFileSync,
  writeFileSync,
  openSync,
  openAssetsSync,
  closeSync,
  readSync,
  writeSync,
  statSync,
  statAssetsSync,
  readdirSync,
  mkdirSync,
  rmSync,
  renameSync
};


/*
 * Native storage classes.
 *
 * Advanced users can construct their own storage objects.
 */
export {
  LocalStorage,
  SessionStorage
};