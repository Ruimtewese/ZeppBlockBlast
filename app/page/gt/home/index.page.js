import {
  setupPage,
  text,
  pillAligned,
  getNumber,
  setNumber,
  vibrateLight,
  vibrateStrong,
  createSystemSounds,
  getSystemSoundTypes,
  playSystemSound,
  onBackKey,
  offKeyPress,
  exitApp,
} from "zeppcore";

import {
  createWidget,
  widget,
  event,
} from "@zos/ui";

const WIDTH = 390;
const HEIGHT = 450;

const BOARD_SIZE = 8;
const CELL = 30;
const GAP = 2;
const STRIDE = CELL + GAP;
const BOARD_PX = BOARD_SIZE * CELL + (BOARD_SIZE - 1) * GAP;
const BOARD_X = Math.floor((WIDTH - BOARD_PX) / 2);
const BOARD_Y = 58;

const TRAY_Y = 338;
const TRAY_W = 112;
const TRAY_H = 106;
const TRAY_GAP = 9;
const TRAY_X = [
  8,
  8 + TRAY_W + TRAY_GAP,
  8 + (TRAY_W + TRAY_GAP) * 2,
];

const PREVIEW_CELL = 15;
const PREVIEW_GAP = 2;

const COLORS = [
  0xA8E6CF,
  0xA9D6FF,
  0xFFD6A5,
  0xD8B4FE,
  0xFFB7D5,
  0xFFF0A6,
];

const EMPTY = 0x151C27;
const GRID_FRAME = 0x0A0E15;
const TRAY_FILL = 0x0D121B;
const TRAY_BORDER = 0x253040;
const TRAY_SELECTED = 0xA8E6CF;
const TEXT = 0xF5F7FA;
const MUTED = 0x8D98A8;
const ACCENT = 0xA8E6CF;
const ACCENT_PRESSED = 0x82CBB1;
const OVERLAY = 0x070A10;

const SHAPES = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 1], [1, 1], [2, 0], [2, 1]],
  [[0, 0], [0, 1], [1, 1], [1, 2]],
  [[0, 1], [0, 2], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2],
  ],
];

function cloneCells(cells) {
  return cells.map(([row, col]) => [row, col]);
}

function randomPiece() {
  const cells = cloneCells(
    SHAPES[Math.floor(Math.random() * SHAPES.length)]
  );

  return {
    cells,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function inRect(x, y, rectX, rectY, rectW, rectH) {
  return (
    x >= rectX &&
    x < rectX + rectW &&
    y >= rectY &&
    y < rectY + rectH
  );
}

Page({
  onInit() {
    setupPage({
      hideStatusBar: true,
    });

    this.board = this.makeEmptyBoard();
    this.pieces = [randomPiece(), randomPiece(), randomPiece()];
    this.selectedPiece = -1;
    this.usedPieces = 0;

    this.score = 0;
    this.best = getNumber("blockblast_best", 0);

    this.gameOver = false;
    this.locked = false;

    this.systemSounds = createSystemSounds();
    this.soundTypes = getSystemSoundTypes(this.systemSounds);
  },

  build() {
    this.createBackground();
    this.createHeader();

    this.canvas = createWidget(widget.CANVAS, {
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
    });

    this.canvas.addEventListener(
      event.CLICK_UP,
      (info) => this.onCanvasTap(info.x, info.y)
    );

    this.createNewButton();

    onBackKey(() => exitApp());

    this.redraw();
  },

  onDestroy() {
    offKeyPress();
  },

  makeEmptyBoard() {
    return Array.from(
      { length: BOARD_SIZE },
      () => Array(BOARD_SIZE).fill(null)
    );
  },

  createBackground() {
    // ZeppCore UI remains responsible for the page background.
    const background = createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
      color: 0x000000,
    });

    background.setTouchEnabled?.(false);
  },

  createHeader() {
    text({
      x: 16,
      y: 6,
      w: 110,
      h: 20,
      value: "BLOCKS",
      color: ACCENT,
      size: 16,
    });

    this.scoreText = text({
      x: 16,
      y: 25,
      w: 120,
      h: 30,
      value: "0",
      color: TEXT,
      size: 28,
    });

    this.bestPill = pillAligned({
      x: 186,
      y: 10,
      w: 105,
      h: 36,
      text: "BEST " + this.best,
      textColor: TEXT,
      textSize: 13,
      normalColor: 0x0D121B,
      pressColor: 0x0D121B,
      radius: 18,
    });
  },

  createNewButton() {
    this.newButton = pillAligned({
      x: 298,
      y: 10,
      w: 76,
      h: 36,
      text: "NEW",
      textColor: 0x000000,
      textSize: 14,
      normalColor: ACCENT,
      pressColor: ACCENT_PRESSED,
      radius: 18,
      onClick: () => this.startNewGame(),
    });
  },

  startNewGame() {
    if (this.locked) return;

    this.board = this.makeEmptyBoard();
    this.pieces = [randomPiece(), randomPiece(), randomPiece()];
    this.selectedPiece = -1;
    this.usedPieces = 0;
    this.score = 0;
    this.gameOver = false;

    this.updateScoreText();
    this.redraw();
  },

  onCanvasTap(x, y) {
    if (this.locked) return;

    if (this.gameOver) {
      if (inRect(x, y, 79, 246, 232, 58)) {
        this.startNewGame();
      }
      return;
    }

    const trayIndex = this.getTrayIndexAt(x, y);

    if (trayIndex >= 0) {
      this.selectPiece(trayIndex);
      return;
    }

    if (
      inRect(
        x,
        y,
        BOARD_X,
        BOARD_Y,
        BOARD_PX,
        BOARD_PX
      )
    ) {
      if (this.selectedPiece < 0) {
        this.setStatus("TAP A BLOCK");
        vibrateLight();
        return;
      }

      const col = Math.floor(
        (x - BOARD_X) / STRIDE
      );

      const row = Math.floor(
        (y - BOARD_Y) / STRIDE
      );

      const cellX = BOARD_X + col * STRIDE;
      const cellY = BOARD_Y + row * STRIDE;

      // Ignore taps in the 2 px gaps between cells.
      if (
        x > cellX + CELL ||
        y > cellY + CELL
      ) {
        return;
      }

      this.placeSelectedPiece(row, col);
    }
  },

  getTrayIndexAt(x, y) {
    if (y < TRAY_Y || y >= TRAY_Y + TRAY_H) {
      return -1;
    }

    for (let i = 0; i < 3; i += 1) {
      if (
        inRect(
          x,
          y,
          TRAY_X[i],
          TRAY_Y,
          TRAY_W,
          TRAY_H
        )
      ) {
        return i;
      }
    }

    return -1;
  },

  selectPiece(index) {
    if (!this.pieces[index]) {
      return;
    }

    if (this.selectedPiece === index) {
      this.selectedPiece = -1;
      this.setStatus("TAP A BLOCK");
      this.redraw();
      return;
    }

    this.selectedPiece = index;
    this.setStatus("TAP A GRID SPACE");
    vibrateLight();
    this.redraw();
  },

  placeSelectedPiece(row, col) {
    const piece = this.pieces[this.selectedPiece];

    if (!piece) {
      this.selectedPiece = -1;
      return;
    }

    if (!this.canPlace(piece, row, col)) {
      this.setStatus("NO ROOM HERE");
      vibrateLight();
      return;
    }

    this.locked = true;

    for (const [dr, dc] of piece.cells) {
      this.board[row + dr][col + dc] = piece.color;
    }

    this.score += piece.cells.length;

    const usedIndex = this.selectedPiece;
    this.pieces[usedIndex] = null;
    this.selectedPiece = -1;
    this.usedPieces += 1;

    vibrateLight();
    this.playPlaceSound();

    const clearInfo = this.getCompletedLines();

    for (const [clearRow, clearCol] of clearInfo.cells) {
      this.board[clearRow][clearCol] = null;
    }

    if (clearInfo.lineCount > 0) {
      const lineBonus =
        clearInfo.lineCount * 10 +
        Math.max(0, clearInfo.lineCount - 1) * 5;

      this.score += lineBonus;

      vibrateStrong();
      this.playClearSound();
      this.setStatus(
        clearInfo.lineCount +
        " LINE" +
        (clearInfo.lineCount === 1 ? "" : "S") +
        " CLEARED"
      );
    } else {
      this.setStatus("KEEP GOING");
    }

    if (this.score > this.best) {
      this.best = this.score;
      setNumber(
        "blockblast_best",
        this.best
      );
    }

    this.updateScoreText();
    this.redraw();

    // IMPORTANT:
    // Pieces are NOT replaced individually.
    // The three slots are consumed one by one and only
    // refill after all three have been played.
    if (this.usedPieces === 3) {
      this.pieces = [
        randomPiece(),
        randomPiece(),
        randomPiece(),
      ];
      this.usedPieces = 0;

      if (!this.hasAnyMove()) {
        this.endGame();
      }
    } else if (!this.hasAnyMove()) {
      // When some slots remain, only those remaining pieces
      // matter for continuing the current set.
      if (
        this.pieces.some(
          (remainingPiece) =>
            remainingPiece &&
            this.pieceHasMove(remainingPiece)
        ) === false
      ) {
        this.endGame();
      }
    }

    this.locked = false;
    this.updateScoreText();
    this.redraw();
  },

  canPlace(piece, row, col) {
    return piece.cells.every(([dr, dc]) => {
      const targetRow = row + dr;
      const targetCol = col + dc;

      return (
        targetRow >= 0 &&
        targetRow < BOARD_SIZE &&
        targetCol >= 0 &&
        targetCol < BOARD_SIZE &&
        !this.board[targetRow][targetCol]
      );
    });
  },

  pieceHasMove(piece) {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (this.canPlace(piece, row, col)) {
          return true;
        }
      }
    }

    return false;
  },

  hasAnyMove() {
    return this.pieces.some(
      (piece) =>
        piece &&
        this.pieceHasMove(piece)
    );
  },

  getCompletedLines() {
    const rows = [];
    const cols = [];
    const cellSet = Object.create(null);

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      let full = true;

      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (!this.board[row][col]) {
          full = false;
          break;
        }
      }

      if (full) {
        rows.push(row);
      }
    }

    for (let col = 0; col < BOARD_SIZE; col += 1) {
      let full = true;

      for (let row = 0; row < BOARD_SIZE; row += 1) {
        if (!this.board[row][col]) {
          full = false;
          break;
        }
      }

      if (full) {
        cols.push(col);
      }
    }

    for (const row of rows) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        cellSet[row + ":" + col] = true;
      }
    }

    for (const col of cols) {
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        cellSet[row + ":" + col] = true;
      }
    }

    const cells = Object.keys(cellSet).map((entry) => {
      const parts = entry.split(":");

      return [
        Number(parts[0]),
        Number(parts[1]),
      ];
    });

    return {
      rows,
      cols,
      cells,
      lineCount:
        rows.length + cols.length,
    };
  },

  endGame() {
    this.gameOver = true;
    this.setStatus("NO MORE MOVES");
    vibrateStrong();

    if (this.score > this.best) {
      this.best = this.score;
      setNumber(
        "blockblast_best",
        this.best
      );
    }

    this.updateScoreText();
    this.redraw();
  },

  updateScoreText() {
    this.scoreText.setProperty(
      12,
      {
        text: String(this.score),
      }
    );

    this.bestPill.setText(
      "BEST " + this.best
    );
  },

  setStatus(value) {
    this.status = value;

    if (this.statusText) {
      this.statusText.setProperty(
        12,
        {
          text: String(value),
        }
      );
    }
  },

  playPlaceSound() {
    if (
      this.soundTypes &&
      this.soundTypes.REGULAR !== undefined
    ) {
      playSystemSound(
        this.soundTypes.REGULAR,
        0,
        this.systemSounds
      );
    }
  },

  playClearSound() {
    if (
      this.soundTypes &&
      this.soundTypes.ACHIEVE !== undefined
    ) {
      playSystemSound(
        this.soundTypes.ACHIEVE,
        0,
        this.systemSounds
      );
    }
  },

  drawBlock(x, y, size, color) {
    this.canvas.drawRect({
      x1: x,
      y1: y,
      x2: x + size,
      y2: y + size,
      color,
    });
  },

  drawTextCentered(value, centerX, y, size, color) {
    const stringValue = String(value);
    const width = stringValue.length * size * 0.54;

    this.canvas.drawText({
      x: Math.floor(centerX - width / 2),
      y,
      text: stringValue,
      text_size: size,
      color,
    });
  },

  drawBoard() {
    this.canvas.setPaint({
      color: GRID_FRAME,
      line_width: 1,
    });

    this.canvas.drawRect({
      x1: BOARD_X - 5,
      y1: BOARD_Y - 5,
      x2: BOARD_X + BOARD_PX + 5,
      y2: BOARD_Y + BOARD_PX + 5,
      color: GRID_FRAME,
    });

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const x = BOARD_X + col * STRIDE;
        const y = BOARD_Y + row * STRIDE;
        const value = this.board[row][col];

        this.drawBlock(
          x,
          y,
          CELL,
          value || EMPTY
        );
      }
    }
  },

  drawTray() {
    for (let index = 0; index < 3; index += 1) {
      const x = TRAY_X[index];
      const y = TRAY_Y;
      const selected =
        this.selectedPiece === index;

      this.canvas.drawRect({
        x1: x,
        y1: y,
        x2: x + TRAY_W,
        y2: y + TRAY_H,
        color: TRAY_FILL,
      });

      this.canvas.setPaint({
        color: selected
          ? TRAY_SELECTED
          : TRAY_BORDER,
        line_width: selected ? 3 : 2,
      });

      this.canvas.strokeRect({
        x1: x + 1,
        y1: y + 1,
        x2: x + TRAY_W - 1,
        y2: y + TRAY_H - 1,
      });

      const piece = this.pieces[index];

      if (!piece) {
        this.drawTextCentered(
          "✓",
          x + TRAY_W / 2,
          y + 39,
          22,
          MUTED
        );
        continue;
      }

      const cells = piece.cells;

      let maxRow = 0;
      let maxCol = 0;

      for (const [row, col] of cells) {
        if (row > maxRow) maxRow = row;
        if (col > maxCol) maxCol = col;
      }

      const rows = maxRow + 1;
      const cols = maxCol + 1;

      const previewW =
        cols * PREVIEW_CELL +
        (cols - 1) * PREVIEW_GAP;

      const previewH =
        rows * PREVIEW_CELL +
        (rows - 1) * PREVIEW_GAP;

      const startX =
        Math.floor(
          x +
          (TRAY_W - previewW) / 2
        );

      const startY =
        Math.floor(
          y +
          (TRAY_H - previewH) / 2
        );

      for (const [row, col] of cells) {
        this.drawBlock(
          startX +
            col *
              (PREVIEW_CELL + PREVIEW_GAP),
          startY +
            row *
              (PREVIEW_CELL + PREVIEW_GAP),
          PREVIEW_CELL,
          selected
            ? TEXT
            : piece.color
        );
      }
    }
  },

  drawStatus() {
    const status =
      this.status ||
      (
        this.selectedPiece >= 0
          ? "TAP A GRID SPACE"
          : "TAP A BLOCK"
      );

    this.drawTextCentered(
      status,
      WIDTH / 2,
      318,
      13,
      MUTED
    );
  },

  drawGameOver() {
    if (!this.gameOver) return;

    this.canvas.drawRect({
      x1: 24,
      y1: 90,
      x2: WIDTH - 24,
      y2: 310,
      color: OVERLAY,
    });

    this.canvas.drawRect({
      x1: 51,
      y1: 90,
      x2: WIDTH - 51,
      y2: 96,
      color: ACCENT,
    });

    this.drawTextCentered(
      "GAME OVER",
      WIDTH / 2,
      132,
      29,
      TEXT
    );

    this.drawTextCentered(
      "SCORE " + this.score,
      WIDTH / 2,
      178,
      19,
      ACCENT
    );

    this.drawTextCentered(
      "BEST " + this.best,
      WIDTH / 2,
      205,
      16,
      MUTED
    );

    this.canvas.drawRect({
      x1: 79,
      y1: 246,
      x2: 311,
      y2: 304,
      color: ACCENT,
    });

    this.drawTextCentered(
      "PLAY AGAIN",
      WIDTH / 2,
      263,
      18,
      0x000000
    );
  },

  redraw() {
    if (!this.canvas) return;

    this.canvas.clear({
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
    });

    this.drawBoard();
    this.drawTray();
    this.drawStatus();
    this.drawGameOver();
  },
});
