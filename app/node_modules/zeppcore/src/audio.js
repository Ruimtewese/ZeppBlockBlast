/*
 * =========================================================
 * ZEPPCORE AUDIO
 * =========================================================
 *
 * Friendly wrappers for Zepp OS audio playback, recording,
 * and built-in system sounds.
 *
 * Playback / recording:
 *   @zos/media
 *
 * System sounds:
 *   @zos/sensor -> SystemSounds
 *
 * Audio media APIs start at API_LEVEL 3.0.
 * SystemSounds starts at API_LEVEL 3.6.
 * =========================================================
 */

import {
  create,
  id,
  codec
} from "@zos/media";

import {
  SystemSounds
} from "@zos/sensor";


/* =========================================================
 * PLAYER
 * ========================================================= */

/**
 * Create a native ZeppCore audio player.
 *
 * The returned object is the native @zos/media Player,
 * so all native methods remain available.
 */
export function createAudioPlayer() {
  return create(id.PLAYER);
}


/**
 * Set the file used by a player.
 *
 * Supported file formats include MP3 and OPUS recorded by
 * the Zepp audio recorder.
 *
 * Example:
 *
 *   const player = createAudioPlayer();
 *   setAudioSource(player, "sounds/beep.mp3");
 *   prepareAudio(player);
 */
export function setAudioSource(
  player,
  file
) {
  player.setSource(
    player.source.FILE,
    {
      file: String(file)
    }
  );

  return player;
}


/**
 * Prepare an audio player.
 *
 * The result is delivered through the native PREPARE event.
 */
export function prepareAudio(
  player,
  callback = null
) {
  if (typeof callback === "function") {
    player.addEventListener(
      player.event.PREPARE,
      callback
    );
  }

  player.prepare();

  return player;
}


/**
 * Play an already prepared audio player.
 */
export function playAudio(
  player
) {
  player.start();

  return player;
}


/**
 * Pause playback.
 */
export function pauseAudio(
  player
) {
  player.pause();

  return player;
}


/**
 * Resume playback.
 */
export function resumeAudio(
  player
) {
  player.resume();

  return player;
}


/**
 * Stop playback.
 */
export function stopAudio(
  player
) {
  player.stop();

  return player;
}


/**
 * Get player status.
 */
export function getAudioStatus(
  player
) {
  return player.getStatus();
}


/**
 * Get current media duration in seconds.
 *
 * The player should be prepared first.
 */
export function getAudioDuration(
  player
) {
  return player.getDuration();
}


/**
 * Get current system volume, 0-100.
 */
export function getAudioVolume(
  player
) {
  return player.getVolume();
}


/**
 * Set system audio volume, 0-100.
 */
export function setAudioVolume(
  player,
  volume
) {
  const value =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          Number(volume)
        )
      )
    );

  return player.setVolume(value);
}


/**
 * Get current media information.
 *
 * Returns title, artist and duration.
 */
export function getAudioInfo(
  player
) {
  return player.getMediaInfo();
}


/**
 * Get the current media title.
 */
export function getAudioTitle(
  player
) {
  return player.getTitle();
}


/**
 * Get the current media artist.
 */
export function getAudioArtist(
  player
) {
  return player.getArtist();
}


/**
 * Seek using a percentage of the media duration.
 *
 * Requires API_LEVEL 4.2+.
 */
export function seekAudioPercent(
  player,
  percentage
) {
  if (
    typeof player.seek !==
    "function"
  ) {
    throw new Error(
      "seek() requires Zepp OS API_LEVEL 4.2+."
    );
  }

  const value =
    Math.max(
      0,
      Math.min(
        100,
        Number(percentage)
      )
    );

  return player.seek(value);
}


/**
 * Seek to a position in seconds.
 *
 * Requires API_LEVEL 4.3+.
 */
export function seekAudioSeconds(
  player,
  seconds
) {
  if (
    typeof player.seekTo !==
    "function"
  ) {
    throw new Error(
      "seekTo() requires Zepp OS API_LEVEL 4.3+."
    );
  }

  return player.seekTo(
    Math.max(
      0,
      Number(seconds)
    )
  );
}


/**
 * Attach a player event listener.
 *
 * Event should normally be one of:
 *   player.event.PREPARE
 *   player.event.COMPLETE
 *   player.event.PLAY
 *   player.event.STOP
 *   player.event.PAUSE
 *   player.event.PROGRESS
 */
export function onAudioEvent(
  player,
  eventType,
  callback
) {
  player.addEventListener(
    eventType,
    callback
  );

  return () => {
    if (
      typeof player.removeEventListener ===
      "function"
    ) {
      player.removeEventListener(
        eventType,
        callback
      );
    }
  };
}


/**
 * Play an audio file with a simple callback flow.
 *
 * Returns the player so callers can continue to control it.
 */
export function playAudioFile(
  file,
  options = {}
) {
  const player =
    createAudioPlayer();

  const {
    onPrepare = null,
    onComplete = null,
    onPlay = null,
    onPause = null,
    onStop = null,
    onProgress = null,
    onError = null,
    autoStart = true
  } = options;

  player.addEventListener(
    player.event.PREPARE,
    (result) => {
      if (result) {
        if (typeof onPrepare === "function") {
          onPrepare(player);
        }

        if (autoStart) {
          player.start();
        }
      } else if (typeof onError === "function") {
        onError(
          new Error(
            "ZeppCore audio preparation failed."
          )
        );
      }
    }
  );

  if (typeof onComplete === "function") {
    player.addEventListener(
      player.event.COMPLETE,
      () => onComplete(player)
    );
  }

  if (typeof onPlay === "function") {
    player.addEventListener(
      player.event.PLAY,
      (result) => onPlay(result, player)
    );
  }

  if (typeof onPause === "function") {
    player.addEventListener(
      player.event.PAUSE,
      () => onPause(player)
    );
  }

  if (typeof onStop === "function") {
    player.addEventListener(
      player.event.STOP,
      () => onStop(player)
    );
  }

  if (typeof onProgress === "function") {
    player.addEventListener(
      player.event.PROGRESS,
      (progress) => onProgress(progress, player)
    );
  }

  setAudioSource(
    player,
    file
  );

  player.prepare();

  return player;
}


/* =========================================================
 * RECORDER
 * ========================================================= */

/**
 * Create an audio recorder.
 *
 * Zepp currently documents OPUS as the supported recorder
 * codec.
 */
export function createAudioRecorder() {
  return create(id.RECORDER);
}


/**
 * Configure an OPUS audio recording target.
 *
 * Example:
 *
 *   const recorder = createAudioRecorder();
 *   setAudioRecordTarget(
 *     recorder,
 *     "data://recording.opus"
 *   );
 */
export function setAudioRecordTarget(
  recorder,
  targetFile
) {
  recorder.setFormat(
    codec.OPUS,
    {
      target_file:
        String(targetFile)
    }
  );

  return recorder;
}


/**
 * Start recording.
 */
export function startAudioRecording(
  recorder
) {
  recorder.start();

  return recorder;
}


/**
 * Stop recording.
 */
export function stopAudioRecording(
  recorder
) {
  recorder.stop();

  return recorder;
}


/**
 * Attach a recorder event listener.
 */
export function onAudioRecordEvent(
  recorder,
  eventType,
  callback
) {
  recorder.addEventListener(
    eventType,
    callback
  );

  return () => {
    if (
      typeof recorder.removeEventListener ===
      "function"
    ) {
      recorder.removeEventListener(
        eventType,
        callback
      );
    }
  };
}


/**
 * Start recording directly to a target file.
 *
 * The recorder uses OPUS.
 */
export function recordAudio(
  targetFile,
  options = {}
) {
  const recorder =
    createAudioRecorder();

  const {
    onStart = null,
    onStop = null
  } = options;

  if (typeof onStart === "function") {
    recorder.addEventListener(
      recorder.event.START,
      (result) => {
        onStart(result, recorder);
      }
    );
  }

  if (typeof onStop === "function") {
    recorder.addEventListener(
      recorder.event.STOP,
      (result) => {
        onStop(result, recorder);
      }
    );
  }

  setAudioRecordTarget(
    recorder,
    targetFile
  );

  recorder.start();

  return recorder;
}


/* =========================================================
 * SYSTEM SOUNDS
 * ========================================================= */

/**
 * Create a SystemSounds controller.
 *
 * SystemSounds is available from API_LEVEL 3.6.
 */
export function createSystemSounds() {
  return new SystemSounds();
}


/**
 * Check whether system sounds are enabled.
 */
export function areSystemSoundsEnabled(
  systemSounds = createSystemSounds()
) {
  return systemSounds.getEnabled();
}


/**
 * Get built-in sound source constants.
 */
export function getSystemSoundTypes(
  systemSounds = createSystemSounds()
) {
  return systemSounds.getSourceType();
}


/**
 * Play a built-in system sound.
 *
 * Examples of source types include:
 *   ALARM
 *   MESSAGE
 *   REGULAR
 *   ACHIEVE
 *   CAMERA
 *   ABN_HIGH
 *   ABN_LOW
 *   SOS
 */
export function playSystemSound(
  sourceType,
  repeatCount = 0,
  systemSounds = createSystemSounds()
) {
  if (!systemSounds.getEnabled()) {
    return false;
  }

  systemSounds.start(
    sourceType,
    Math.max(
      0,
      Math.floor(
        Number(repeatCount)
      )
    )
  );

  return true;
}


/**
 * Stop the current system sound.
 */
export function stopSystemSound(
  systemSounds = createSystemSounds()
) {
  systemSounds.stop();

  return systemSounds;
}


/* =========================================================
 * NATIVE EXPORTS
 * ========================================================= */

export {
  create,
  id,
  codec,
  SystemSounds
};
