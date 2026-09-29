import {
  setupPage,
  text,
  pillAligned,
  prop,
  confirm,
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
const BOARD_PX =
  BOARD_SIZE * CELL +
  (BOARD_SIZE - 1) * GAP;

const BOARD_X =
  Math.floor((WIDTH - BOARD_PX) / 2);
const BOARD_Y = 58;

const TRAY_Y = 334;
const TRAY_W = 108;
const TRAY_H = 94;
const TRAY_GAP = 9;

const TRAY_X = [
  18,
  18 + TRAY_W + TRAY_GAP,
  18 + (TRAY_W + TRAY_GAP) * 2,
];

const PREVIEW_CELL = 14;
const PREVIEW_GAP = 2;
const BLOCK_RADIUS = 4;

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
const INVALID = 0xF28C8C;

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
  return {
    cells: cloneCells(
      SHAPES[
        Math.floor(
          Math.random() * SHAPES.length
        )
      ]
    ),
    color:
      COLORS[
        Math.floor(
          Math.random() * COLORS.length
        )
      ],
  };
}

function inRect(
  x,
  y,
  rectX,
  rectY,
  rectW,
  rectH
) {
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

    this.pieces = [
      randomPiece(),
      randomPiece(),
      randomPiece(),
    ];

    this.selectedPiece = -1;
    this.usedPieces = 0;

    this.score = 0;
    this.best =
      getNumber(
        "blockblast_best",
        0
      );

    this.gameOver = false;
    this.locked = false;

    this.status = "TAP A BLOCK";

    this.hoverCell = null;

    this.animation = null;
    this.animationTimer = null;

    this.systemSounds =
      createSystemSounds();

    this.soundTypes =
      getSystemSoundTypes(
        this.systemSounds
      );
  },

  build() {
    this.createBackground();

    this.canvas =
      createWidget(
        widget.CANVAS,
        {
          x: 0,
          y: 0,
          w: WIDTH,
          h: HEIGHT,
        }
      );

    if (
      event.CLICK_DOWN !==
      undefined
    ) {
      this.canvas.addEventListener(
        event.CLICK_DOWN,
        (info) => {
          this.onCanvasDown(
            info.x,
            info.y
          );
        }
      );
    }

    this.canvas.addEventListener(
      event.CLICK_UP,
      (info) => {
        this.onCanvasTap(
          info.x,
          info.y
        );
      }
    );

    // Dedicated transparent hit areas make the three piece
    // slots reliable on-device while the game remains rendered
    // by one lightweight Canvas.
    this.pieceHitTargets = [];

    for (let index = 0; index < 3; index += 1) {
      const hitTarget = createWidget(widget.FILL_RECT, {
        x: TRAY_X[index],
        y: TRAY_Y,
        w: TRAY_W,
        h: TRAY_H,
        color: 0x000000,
        alpha: 0,
      });

      hitTarget.addEventListener(
        event.CLICK_UP,
        () => this.selectPiece(index)
      );

      this.pieceHitTargets.push(hitTarget);
    }

    this.createHeader();
    this.createNewButton();

    onBackKey(() =>
      exitApp()
    );

    this.redraw();
  },

  onDestroy() {
    offKeyPress();

    if (
      this.animationTimer
    ) {
      clearInterval(
        this.animationTimer
      );

      this.animationTimer = null;
    }
  },

  makeEmptyBoard() {
    return Array.from(
      {
        length:
          BOARD_SIZE,
      },
      () =>
        Array(
          BOARD_SIZE
        ).fill(null)
    );
  },

  createBackground() {
    const background =
      createWidget(
        widget.FILL_RECT,
        {
          x: 0,
          y: 0,
          w: WIDTH,
          h: HEIGHT,
          color: 0x000000,
        }
      );

    background.setTouchEnabled?.(
      false
    );
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

    this.scoreText =
      text({
        x: 16,
        y: 25,
        w: 120,
        h: 30,
        value: "0",
        color: TEXT,
        size: 28,
      });

    this.bestPill =
      pillAligned({
        x: 186,
        y: 10,
        w: 105,
        h: 36,
        text:
          "BEST " +
          this.best,
        textColor: TEXT,
        textSize: 13,
        normalColor:
          0x0D121B,
        pressColor:
          0x0D121B,
        radius: 18,
      });
  },

  createNewButton() {
    this.newButton =
      pillAligned({
        x: 298,
        y: 10,
        w: 76,
        h: 36,
        text: "NEW",
        textColor: 0x000000,
        textSize: 14,
        normalColor: ACCENT,
        pressColor:
          ACCENT_PRESSED,
        radius: 18,
        onClick: () =>
          this.confirmRestart(),
      });
  },

  confirmRestart() {
    if (
      this.locked
    ) {
      return;
    }

    confirm(
      "Restart game?",
      (confirmed) => {
        if (
          confirmed
        ) {
          this.startNewGame();
        }
      }
    );
  },

  startNewGame() {
    this.locked = true;
    this.gameOver = false;
    this.selectedPiece = -1;
    this.hoverCell = null;
    this.usedPieces = 0;

    this.board =
      this.makeEmptyBoard();

    this.pieces = [
      randomPiece(),
      randomPiece(),
      randomPiece(),
    ];

    this.score = 0;

    this.updateScoreText();
    this.setStatus(
      "NEW GAME"
    );

    this.animation = {
      type: "reset",
      start:
        Date.now(),
      duration: 240,
    };

    this.startAnimationLoop();
  },

  onCanvasDown(x, y) {
    if (
      this.locked ||
      this.gameOver ||
      this.selectedPiece < 0
    ) {
      return;
    }

    if (
      !inRect(
        x,
        y,
        BOARD_X,
        BOARD_Y,
        BOARD_PX,
        BOARD_PX
      )
    ) {
      return;
    }

    const cell =
      this.pointToCell(
        x,
        y
      );

    if (cell) {
      this.hoverCell = cell;
      this.startAnimationLoop();
      this.redraw();
    }
  },

  onCanvasTap(x, y) {
    if (
      this.locked
    ) {
      return;
    }

    if (
      this.gameOver
    ) {
      if (
        inRect(
          x,
          y,
          79,
          244,
          232,
          58
        )
      ) {
        this.startNewGame();
      }
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
      const cell =
        this.pointToCell(
          x,
          y
        );

      if (!cell) {
        return;
      }

      this.hoverCell =
        null;

      if (
        this.selectedPiece < 0
      ) {
        this.setStatus(
          "TAP A BLOCK"
        );
        vibrateLight();
        this.redraw();

        return;
      }

      // The tapped grid cell is the exact origin:
      // the piece's top-left block [0,0] goes here.
      this.placeSelectedPiece(
        cell.row,
        cell.col
      );
    }
  },

  pointToCell(x, y) {
    const localX =
      x - BOARD_X;
    const localY =
      y - BOARD_Y;

    const col =
      Math.floor(
        localX / STRIDE
      );
    const row =
      Math.floor(
        localY / STRIDE
      );

    if (
      row < 0 ||
      row >= BOARD_SIZE ||
      col < 0 ||
      col >= BOARD_SIZE
    ) {
      return null;
    }

    const cellX =
      BOARD_X +
      col * STRIDE;

    const cellY =
      BOARD_Y +
      row * STRIDE;

    if (
      x > cellX + CELL ||
      y > cellY + CELL
    ) {
      return null;
    }

    return {
      row,
      col,
    };
  },

  selectPiece(index) {
    if (
      !this.pieces[index]
    ) {
      return;
    }

    if (
      this.selectedPiece ===
      index
    ) {
      this.selectedPiece = -1;
      this.hoverCell = null;

      this.setStatus(
        "TAP A BLOCK"
      );

      this.stopAnimationLoopIfIdle();
      this.redraw();

      return;
    }

    this.selectedPiece =
      index;

    this.hoverCell = null;

    this.setStatus(
      "TAP A GRID SPACE"
    );

    vibrateLight();

    this.startAnimationLoop();
    this.redraw();
  },

  placeSelectedPiece(
    row,
    col
  ) {
    const piece =
      this.pieces[
        this.selectedPiece
      ];

    if (!piece) {
      this.selectedPiece = -1;
      return;
    }

    // row/col is the origin of [0,0].
    if (
      !this.canPlace(
        piece,
        row,
        col
      )
    ) {
      this.setStatus(
        "NO ROOM HERE"
      );

      vibrateLight();
      this.redraw();

      return;
    }

    this.locked = true;

    const placedCells = [];

    for (
      const [dr, dc]
      of piece.cells
    ) {
      const targetRow =
        row + dr;

      const targetCol =
        col + dc;

      this.board[targetRow][
        targetCol
      ] = piece.color;

      placedCells.push({
        row: targetRow,
        col: targetCol,
        color: piece.color,
      });
    }

    this.score +=
      piece.cells.length;

    this.pieces[
      this.selectedPiece
    ] = null;

    this.selectedPiece = -1;
    this.usedPieces += 1;

    vibrateLight();
    this.playPlaceSound();

    const clearInfo =
      this.getCompletedLines();

    clearInfo.colors =
      clearInfo.cells.map(
        ([clearRow, clearCol]) => ({
          row: clearRow,
          col: clearCol,
          color:
            this.board[
              clearRow
            ][clearCol],
        })
      );

    for (
      const [
        clearRow,
        clearCol
      ]
      of clearInfo.cells
    ) {
      this.board[
        clearRow
      ][
        clearCol
      ] = null;
    }

    if (
      clearInfo.lineCount >
      0
    ) {
      const lineBonus =
        clearInfo.lineCount *
          10 +
        Math.max(
          0,
          clearInfo.lineCount -
            1
        ) *
          5;

      this.score +=
        lineBonus;

      this.setStatus(
        clearInfo.lineCount +
        " LINE" +
        (
          clearInfo.lineCount ===
          1
            ? ""
            : "S"
        ) +
        " CLEARED"
      );
    } else {
      this.setStatus(
        "KEEP GOING"
      );
    }

    if (
      this.score >
      this.best
    ) {
      this.best =
        this.score;

      setNumber(
        "blockblast_best",
        this.best
      );
    }

    this.updateScoreText();

    this.animation = {
      type: "place",
      start:
        Date.now(),
      duration: 170,
      cells: placedCells,
      clearInfo,
    };

    this.startAnimationLoop();
  },

  finishTurn(animation) {
    if (
      animation.clearInfo &&
      animation.clearInfo.lineCount >
        0
    ) {
      this.animation = {
        type: "clear",
        start:
          Date.now(),
        duration: 180,
        cells:
          animation
            .clearInfo
            .colors,
      };

      vibrateStrong();
      this.playClearSound();
      this.startAnimationLoop();

      return;
    }

    this.finishTurnAfterClear();
  },

  finishTurnAfterClear() {
    if (
      this.usedPieces ===
      3
    ) {
      this.pieces = [
        randomPiece(),
        randomPiece(),
        randomPiece(),
      ];

      this.usedPieces = 0;

      this.animation = {
        type: "refill",
        start:
          Date.now(),
        duration: 220,
      };

      this.setStatus(
        "NEW BLOCKS"
      );

      if (
        !this.hasAnyMove()
      ) {
        this.gameOver = true;
        this.setStatus(
          "NO MORE MOVES"
        );
      }

      this.startAnimationLoop();

      return;
    }

    if (
      !this.hasAnyMove()
    ) {
      this.endGame();
      return;
    }

    this.locked = false;
    this.stopAnimationLoopIfIdle();
    this.redraw();
  },

  endGame() {
    this.gameOver = true;
    this.locked = false;
    this.setStatus(
      "NO MORE MOVES"
    );

    vibrateStrong();
    this.stopAnimationLoopIfIdle();
    this.redraw();
  },

  canPlace(
    piece,
    row,
    col
  ) {
    return piece.cells.every(
      ([dr, dc]) => {
        const targetRow =
          row + dr;

        const targetCol =
          col + dc;

        return (
          targetRow >= 0 &&
          targetRow <
            BOARD_SIZE &&
          targetCol >= 0 &&
          targetCol <
            BOARD_SIZE &&
          !this.board[
            targetRow
          ][targetCol]
        );
      }
    );
  },

  pieceHasMove(piece) {
    for (
      let row = 0;
      row < BOARD_SIZE;
      row += 1
    ) {
      for (
        let col = 0;
        col < BOARD_SIZE;
        col += 1
      ) {
        if (
          this.canPlace(
            piece,
            row,
            col
          )
        ) {
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
        this.pieceHasMove(
          piece
        )
    );
  },

  getCompletedLines() {
    const rows = [];
    const cols = [];
    const cellSet =
      Object.create(
        null
      );

    for (
      let row = 0;
      row < BOARD_SIZE;
      row += 1
    ) {
      let full = true;

      for (
        let col = 0;
        col < BOARD_SIZE;
        col += 1
      ) {
        if (
          !this.board[
            row
          ][col]
        ) {
          full = false;
          break;
        }
      }

      if (full) {
        rows.push(row);
      }
    }

    for (
      let col = 0;
      col < BOARD_SIZE;
      col += 1
    ) {
      let full = true;

      for (
        let row = 0;
        row < BOARD_SIZE;
        row += 1
      ) {
        if (
          !this.board[
            row
          ][col]
        ) {
          full = false;
          break;
        }
      }

      if (full) {
        cols.push(col);
      }
    }

    for (
      const row of rows
    ) {
      for (
        let col = 0;
        col < BOARD_SIZE;
        col += 1
      ) {
        cellSet[
          row +
          ":" +
          col
        ] = true;
      }
    }

    for (
      const col of cols
    ) {
      for (
        let row = 0;
        row < BOARD_SIZE;
        row += 1
      ) {
        cellSet[
          row +
          ":" +
          col
        ] = true;
      }
    }

    const cells =
      Object.keys(
        cellSet
      ).map(
        (entry) => {
          const parts =
            entry.split(
              ":"
            );

          return [
            Number(
              parts[0]
            ),
            Number(
              parts[1]
            ),
          ];
        }
      );

    return {
      rows,
      cols,
      cells,
      lineCount:
        rows.length +
        cols.length,
      colors: [],
    };
  },

  updateScoreText() {
    this.scoreText.setProperty(
      prop.MORE,
      {
        text:
          String(
            this.score
          ),
      }
    );

    this.bestPill.setText(
      "BEST " +
      this.best
    );
  },

  setStatus(value) {
    this.status =
      String(value);

    this.redraw();
  },

  drawRoundedBlock(
    x,
    y,
    size,
    color,
    scale = 1
  ) {
    const safeScale =
      Math.max(
        0,
        Math.min(
          1,
          scale
        )
      );

    const scaledSize =
      size * safeScale;

    if (
      scaledSize <= 0
    ) {
      return;
    }

    const drawX =
      x +
      (size -
        scaledSize) /
        2;

    const drawY =
      y +
      (size -
        scaledSize) /
        2;

    const radius =
      Math.min(
        BLOCK_RADIUS,
        scaledSize / 2
      );

    if (
      radius < 1
    ) {
      this.canvas.drawRect({
        x1: drawX,
        y1: drawY,
        x2:
          drawX +
          scaledSize,
        y2:
          drawY +
          scaledSize,
        color,
      });

      return;
    }

    this.canvas.drawRect({
      x1:
        drawX +
        radius,
      y1: drawY,
      x2:
        drawX +
        scaledSize -
        radius,
      y2:
        drawY +
        scaledSize,
      color,
    });

    this.canvas.drawRect({
      x1: drawX,
      y1:
        drawY +
        radius,
      x2:
        drawX +
        scaledSize,
      y2:
        drawY +
        scaledSize -
        radius,
      color,
    });

    this.canvas.drawCircle({
      center_x:
        drawX +
        radius,
      center_y:
        drawY +
        radius,
      radius,
      color,
    });

    this.canvas.drawCircle({
      center_x:
        drawX +
        scaledSize -
        radius,
      center_y:
        drawY +
        radius,
      radius,
      color,
    });

    this.canvas.drawCircle({
      center_x:
        drawX +
        radius,
      center_y:
        drawY +
        scaledSize -
        radius,
      radius,
      color,
    });

    this.canvas.drawCircle({
      center_x:
        drawX +
        scaledSize -
        radius,
      center_y:
        drawY +
        scaledSize -
        radius,
      radius,
      color,
    });
  },

  drawRoundedPanel(
    x,
    y,
    w,
    h,
    color,
    radius = 14
  ) {
    const r =
      Math.min(
        radius,
        w / 2,
        h / 2
      );

    this.canvas.drawRect({
      x1:
        x + r,
      y1: y,
      x2:
        x + w - r,
      y2:
        y + h,
      color,
    });

    this.canvas.drawRect({
      x1: x,
      y1:
        y + r,
      x2:
        x + w,
      y2:
        y + h - r,
      color,
    });

    this.canvas.drawCircle({
      center_x:
        x + r,
      center_y:
        y + r,
      radius: r,
      color,
    });

    this.canvas.drawCircle({
      center_x:
        x + w - r,
      center_y:
        y + r,
      radius: r,
      color,
    });

    this.canvas.drawCircle({
      center_x:
        x + r,
      center_y:
        y + h - r,
      radius: r,
      color,
    });

    this.canvas.drawCircle({
      center_x:
        x + w - r,
      center_y:
        y + h - r,
      radius: r,
      color,
    });
  },

  drawRoundedOutline(
    x,
    y,
    w,
    h,
    fillColor,
    borderColor,
    radius = 14,
    border = 2
  ) {
    this.drawRoundedPanel(
      x,
      y,
      w,
      h,
      borderColor,
      radius
    );

    this.drawRoundedPanel(
      x + border,
      y + border,
      w -
        border * 2,
      h -
        border * 2,
      fillColor,
      Math.max(
        1,
        radius -
          border
      )
    );
  },

  drawBoard() {
    this.drawRoundedPanel(
      BOARD_X - 5,
      BOARD_Y - 5,
      BOARD_PX + 10,
      BOARD_PX + 10,
      GRID_FRAME,
      14
    );

    const hidden =
      this.animation &&
      this.animation.type ===
        "place"
        ? this.animation
            .cells
        : null;

    for (
      let row = 0;
      row < BOARD_SIZE;
      row += 1
    ) {
      for (
        let col = 0;
        col < BOARD_SIZE;
        col += 1
      ) {
        const isHidden =
          hidden &&
          hidden.some(
            (cell) =>
              cell.row === row &&
              cell.col === col
          );

        if (
          isHidden
        ) {
          this.drawRoundedBlock(
            BOARD_X +
              col *
                STRIDE,
            BOARD_Y +
              row *
                STRIDE,
            CELL,
            EMPTY,
            1
          );
          continue;
        }

        this.drawRoundedBlock(
          BOARD_X +
            col *
              STRIDE,
          BOARD_Y +
            row *
              STRIDE,
          CELL,
          this.board[row][col] ||
            EMPTY,
          1
        );
      }
    }
  },

  drawGhost() {
    if (
      !this.selectedPiece ||
      !this.pieces[
        this.selectedPiece
      ] ||
      !this.hoverCell
    ) {
      return;
    }

    const piece =
      this.pieces[
        this.selectedPiece
      ];

    const valid =
      this.canPlace(
        piece,
        this.hoverCell.row,
        this.hoverCell.col
      );

    const ghostColor =
      valid
        ? piece.color
        : INVALID;

    for (
      const [dr, dc]
      of piece.cells
    ) {
      const row =
        this.hoverCell.row +
        dr;

      const col =
        this.hoverCell.col +
        dc;

      if (
        row < 0 ||
        row >= BOARD_SIZE ||
        col < 0 ||
        col >= BOARD_SIZE
      ) {
        continue;
      }

      this.drawRoundedBlock(
        BOARD_X +
          col *
            STRIDE,
        BOARD_Y +
          row *
            STRIDE,
        CELL,
        ghostColor,
        0.72
      );
    }

    // The small outline marks the exact origin cell.
    const originX =
      BOARD_X +
      this.hoverCell.col *
        STRIDE;

    const originY =
      BOARD_Y +
      this.hoverCell.row *
        STRIDE;

    this.canvas.setPaint({
      color: valid
        ? 0xFFFFFF
        : INVALID,
      line_width: 2,
    });

    this.canvas.strokeRect({
      x1:
        originX + 2,
      y1:
        originY + 2,
      x2:
        originX + CELL - 2,
      y2:
        originY + CELL - 2,
    });
  },

  drawTray() {
    const now =
      Date.now();

    let pulse = 0;

    if (
      this.selectedPiece >=
        0 &&
      !this.locked
    ) {
      pulse =
        (
          Math.sin(
            now / 140
          ) +
          1
        ) /
        2;
    }

    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      const x =
        TRAY_X[index];
      const y =
        TRAY_Y;

      const selected =
        this.selectedPiece ===
        index;

      const border =
        selected
          ? TRAY_SELECTED
          : TRAY_BORDER;

      this.drawRoundedOutline(
        x,
        y,
        TRAY_W,
        TRAY_H,
        TRAY_FILL,
        border,
        20,
        selected
          ? 2 +
            Math.round(
              pulse * 2
            )
          : 2
      );

      const piece =
        this.pieces[index];

      if (!piece) {
        this.drawTextCentered(
          "✓",
          x +
            TRAY_W / 2,
          y + 34,
          22,
          MUTED
        );

        continue;
      }

      const maxRow =
        Math.max(
          ...piece.cells.map(
            ([row]) => row
          )
        );

      const maxCol =
        Math.max(
          ...piece.cells.map(
            ([, col]) => col
          )
        );

      const rows =
        maxRow + 1;
      const cols =
        maxCol + 1;

      const previewW =
        cols *
          PREVIEW_CELL +
        (cols - 1) *
          PREVIEW_GAP;

      const previewH =
        rows *
          PREVIEW_CELL +
        (rows - 1) *
          PREVIEW_GAP;

      const startX =
        Math.floor(
          x +
            (
              TRAY_W -
              previewW
            ) /
              2
        );

      const startY =
        Math.floor(
          y +
            (
              TRAY_H -
              previewH
            ) /
              2
        );

      let scale = 1;

      if (
        this.animation &&
        this.animation.type ===
          "refill"
      ) {
        const progress =
          this.getAnimationProgress(
            this.animation
          );

        scale =
          0.45 +
          0.55 *
            this.easeOutBack(
              progress
            );
      }

      if (
        selected &&
        scale === 1
      ) {
        scale = 1.04;
      }

      for (
        const [row, col]
        of piece.cells
      ) {
        const px =
          startX +
          col *
            (
              PREVIEW_CELL +
              PREVIEW_GAP
            );

        const py =
          startY +
          row *
            (
              PREVIEW_CELL +
              PREVIEW_GAP
            );

        this.drawRoundedBlock(
          px,
          py,
          PREVIEW_CELL,
          selected
            ? TEXT
            : piece.color,
          scale
        );
      }
    }
  },

  drawTextCentered(
    value,
    centerX,
    y,
    size,
    color
  ) {
    const stringValue =
      String(value);

    const width =
      stringValue.length *
      size *
      0.54;

    this.canvas.drawText({
      x:
        Math.floor(
          centerX -
            width / 2
        ),
      y,
      text:
        stringValue,
      text_size:
        size,
      color,
    });
  },

  drawStatus() {
    const status =
      this.status ||
      (
        this.selectedPiece >=
          0
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

  drawAnimationOverlay() {
    if (
      !this.animation
    ) {
      return;
    }

    const animation =
      this.animation;

    const progress =
      this.getAnimationProgress(
        animation
      );

    if (
      animation.type ===
      "place"
    ) {
      const scale =
        0.35 +
        0.65 *
          this.easeOutBack(
            progress
          );

      for (
        const cell
        of animation.cells
      ) {
        this.drawRoundedBlock(
          BOARD_X +
            cell.col *
              STRIDE,
          BOARD_Y +
            cell.row *
              STRIDE,
          CELL,
          cell.color,
          scale
        );
      }

      return;
    }

    if (
      animation.type ===
      "clear"
    ) {
      const scale =
        1 -
        this.easeInCubic(
          progress
        );

      for (
        const cell
        of animation.cells
      ) {
        this.drawRoundedBlock(
          BOARD_X +
            cell.col *
              STRIDE,
          BOARD_Y +
            cell.row *
              STRIDE,
          CELL,
          cell.color,
          scale
        );
      }

      return;
    }

    if (
      animation.type ===
      "reset"
    ) {
      const scale =
        this.easeOutCubic(
          progress
        );

      for (
        let index = 0;
        index < 3;
        index += 1
      ) {
        const piece =
          this.pieces[index];

        if (!piece) {
          continue;
        }

        this.drawPiecePreviewAtScale(
          piece,
          index,
          scale
        );
      }
    }
  },

  drawPiecePreviewAtScale(
    piece,
    index,
    scale
  ) {
    const x =
      TRAY_X[index];
    const y =
      TRAY_Y;

    const maxRow =
      Math.max(
        ...piece.cells.map(
          ([row]) => row
        )
      );

    const maxCol =
      Math.max(
        ...piece.cells.map(
          ([, col]) => col
        )
      );

    const rows =
      maxRow + 1;
    const cols =
      maxCol + 1;

    const previewW =
      cols *
        PREVIEW_CELL +
      (cols - 1) *
        PREVIEW_GAP;

    const previewH =
      rows *
        PREVIEW_CELL +
      (rows - 1) *
        PREVIEW_GAP;

    const startX =
      Math.floor(
        x +
          (
            TRAY_W -
            previewW
          ) /
            2
      );

    const startY =
      Math.floor(
        y +
          (
            TRAY_H -
            previewH
          ) /
            2
      );

    for (
      const [row, col]
      of piece.cells
    ) {
      this.drawRoundedBlock(
        startX +
          col *
            (
              PREVIEW_CELL +
              PREVIEW_GAP
            ),
        startY +
          row *
            (
              PREVIEW_CELL +
              PREVIEW_GAP
            ),
        PREVIEW_CELL,
        piece.color,
        scale
      );
    }
  },

  drawGameOver() {
    if (
      !this.gameOver
    ) {
      return;
    }

    this.drawRoundedPanel(
      24,
      90,
      WIDTH - 48,
      220,
      OVERLAY,
      26
    );

    this.drawRoundedPanel(
      51,
      90,
      WIDTH - 102,
      6,
      ACCENT,
      3
    );

    this.drawTextCentered(
      "GAME OVER",
      WIDTH / 2,
      132,
      29,
      TEXT
    );

    this.drawTextCentered(
      "SCORE " +
        this.score,
      WIDTH / 2,
      178,
      19,
      ACCENT
    );

    this.drawTextCentered(
      "BEST " +
        this.best,
      WIDTH / 2,
      205,
      16,
      MUTED
    );

    this.drawRoundedPanel(
      79,
      246,
      232,
      58,
      ACCENT,
      29
    );

    this.drawTextCentered(
      "PLAY AGAIN",
      WIDTH / 2,
      263,
      18,
      0x000000
    );
  },

  redraw() {
    if (
      !this.canvas
    ) {
      return;
    }

    this.canvas.clear({
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
    });

    this.drawBoard();
    this.drawGhost();
    this.drawTray();
    this.drawStatus();
    this.drawAnimationOverlay();
    this.drawGameOver();
  },

  getAnimationProgress(
    animation
  ) {
    return Math.max(
      0,
      Math.min(
        1,
        (
          Date.now() -
          animation.start
        ) /
          animation.duration
      )
    );
  },

  startAnimationLoop() {
    if (
      this.animationTimer
    ) {
      return;
    }

    this.animationTimer =
      setInterval(
        () => {
          this.redraw();

          if (
            this.animation
          ) {
            const progress =
              this.getAnimationProgress(
                this.animation
              );

            if (
              progress >= 1
            ) {
              const finished =
                this.animation;

              this.animation = null;

              if (
                finished.type ===
                "place"
              ) {
                this.finishTurn(
                  finished
                );
              } else if (
                finished.type ===
                "clear"
              ) {
                this.finishTurnAfterClear();
              } else if (
                finished.type ===
                "refill"
              ) {
                this.locked =
                  false;

                this.setStatus(
                  this.gameOver
                    ? "NO MORE MOVES"
                    : "TAP A BLOCK"
                );

                this.stopAnimationLoopIfIdle();
                this.redraw();
              } else if (
                finished.type ===
                "reset"
              ) {
                this.locked =
                  false;

                this.setStatus(
                  "TAP A BLOCK"
                );

                this.stopAnimationLoopIfIdle();
                this.redraw();
              }
            }
          }

          if (
            !this.animation &&
            this.selectedPiece <
              0
          ) {
            this.stopAnimationLoopIfIdle();
          }
        },
        20
      );
  },

  stopAnimationLoopIfIdle() {
    if (
      this.animation ||
      this.selectedPiece >=
        0
    ) {
      return;
    }

    if (
      this.animationTimer
    ) {
      clearInterval(
        this.animationTimer
      );

      this.animationTimer =
        null;
    }
  },

  easeOutCubic(t) {
    const inverse =
      1 - t;

    return 1 -
      inverse *
        inverse *
        inverse;
  },

  easeInCubic(t) {
    return t * t * t;
  },

  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 =
      c1 + 1;

    return (
      1 +
      c3 *
        Math.pow(
          t - 1,
          3
        ) +
      c1 *
        Math.pow(
          t - 1,
          2
        )
    );
  },
});
