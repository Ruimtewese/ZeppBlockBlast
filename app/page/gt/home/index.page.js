import {
  setupPage,
  card,
  text,
  button,
  pillAligned,
  outlineCard,
  prop,
  popIn,
  fadeOut,
  fadeIn,
  shake,
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

const WIDTH = 390;
const HEIGHT = 450;

const BOARD_SIZE = 8;
const CELL = 32;
const GAP = 2;
const STRIDE = CELL + GAP;
const BOARD_X = 60;
const BOARD_Y = 64;
const BOARD_PX = BOARD_SIZE * CELL + (BOARD_SIZE - 1) * GAP;

const TRAY_Y = 348;
const TRAY_W = 108;
const TRAY_H = 94;
const TRAY_X = [18, 141, 264];
const PREVIEW_CELL = 16;
const PREVIEW_GAP = 3;

const COLORS = [
  0xA8E6CF,
  0xA9D6FF,
  0xFFD6A5,
  0xD8B4FE,
  0xFFB7D5,
  0xFFF0A6,
];

const EMPTY = 0x111722;
const EMPTY_PRESSED = 0x1A2331;
const BOARD_FRAME = 0x080B10;
const CARD = 0x0D121B;
const TEXT = 0xF5F7FA;
const MUTED = 0x8D98A8;
const ACCENT = 0xA8E6CF;
const ACCENT_PRESSED = 0x82CBB1;
const OVERLAY = 0x05070B;

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

const PIECE_PREVIEW_NAMES = ["1", "2", "3"];

function cloneCells(cells) {
  return cells.map(([r, c]) => [r, c]);
}

function randomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    cells: cloneCells(shape),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function key(row, col) {
  return row + ":" + col;
}

Page({
  onInit() {
    setupPage({ hideStatusBar: true });
    this.board = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(null)
    );
    this.pieces = [randomPiece(), randomPiece(), randomPiece()];
    this.selectedPiece = -1;
    this.score = 0;
    this.best = getNumber("blockblast_best", 0);
    this.busy = false;
    this.overlayWidgets = [];
    this.previewWidgets = [[], [], []];
    this.systemSounds = createSystemSounds();
    this.soundTypes = getSystemSoundTypes(this.systemSounds);
  },

  build() {
    card({
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
      color: 0x000000,
      radius: 0,
    });

    card({
      x: BOARD_X - 7,
      y: BOARD_Y - 7,
      w: BOARD_PX + 14,
      h: BOARD_PX + 14,
      color: BOARD_FRAME,
      radius: 18,
    });

    this.title = text({
      x: 18,
      y: 7,
      w: 125,
      h: 20,
      value: "BLOCKS",
      color: ACCENT,
      size: 16,
    });

    this.scoreText = text({
      x: 18,
      y: 24,
      w: 150,
      h: 34,
      value: "0",
      color: TEXT,
      size: 30,
    });

    this.bestPill = pillAligned({
      x: 182,
      y: 10,
      w: 104,
      h: 38,
      text: "BEST " + this.best,
      textColor: TEXT,
      textSize: 14,
      normalColor: CARD,
      pressColor: CARD,
      radius: 19,
    });

    this.newPill = pillAligned({
      x: 294,
      y: 10,
      w: 78,
      h: 38,
      text: "NEW",
      textColor: 0x000000,
      textSize: 15,
      normalColor: ACCENT,
      pressColor: ACCENT_PRESSED,
      radius: 19,
      onClick: () => this.startNewGame(),
    });

    this.statusText = text({
      x: 60,
      y: 335,
      w: BOARD_PX,
      h: 18,
      value: "TAP A BLOCK",
      color: MUTED,
      size: 14,
    });

    this.boardWidgets = [];
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const r = row;
        const c = col;
        const cell = button({
          x: BOARD_X + c * STRIDE,
          y: BOARD_Y + r * STRIDE,
          w: CELL,
          h: CELL,
          text: "",
          textSize: 1,
          color: 0x000000,
          normalColor: EMPTY,
          pressColor: EMPTY_PRESSED,
          radius: 8,
          onClick: () => this.onBoardTap(r, c),
        });
        this.boardWidgets.push(cell);
      }
    }

    for (let i = 0; i < 3; i += 1) {
      outlineCard({
        x: TRAY_X[i],
        y: TRAY_Y,
        w: TRAY_W,
        h: TRAY_H,
        color: 0x263040,
        radius: 22,
        lineWidth: 2,
      });

      text({
        x: TRAY_X[i] + 8,
        y: TRAY_Y + 5,
        w: 16,
        h: 16,
        value: PIECE_PREVIEW_NAMES[i],
        color: MUTED,
        size: 12,
      });

      this.renderPiecePreview(i);
    }

    this.createGameOverOverlay();
    this.hideOverlay();
    onBackKey(() => exitApp());
    this.updateAll();
  },

  onDestroy() {
    offKeyPress();
  },

  startNewGame() {
    if (this.busy) return;

    this.busy = true;
    this.hideOverlay();
    this.board = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(null)
    );
    this.pieces = [randomPiece(), randomPiece(), randomPiece()];
    this.selectedPiece = -1;
    this.score = 0;
    this.busy = false;
    this.updateAll();
    this.setStatus("TAP A BLOCK");
  },

  createGameOverOverlay() {
    const panel = card({
      x: 20,
      y: 105,
      w: 350,
      h: 235,
      color: OVERLAY,
      radius: 30,
    });

    const accent = card({
      x: 45,
      y: 105,
      w: 300,
      h: 7,
      color: ACCENT,
      radius: 4,
    });

    const title = text({
      x: 45,
      y: 135,
      w: 300,
      h: 48,
      value: "GAME OVER",
      color: TEXT,
      size: 31,
    });

    const score = text({
      x: 55,
      y: 186,
      w: 280,
      h: 28,
      value: "SCORE 0",
      color: ACCENT,
      size: 20,
    });

    const best = text({
      x: 55,
      y: 214,
      w: 280,
      h: 24,
      value: "BEST " + this.best,
      color: MUTED,
      size: 17,
    });

    const again = pillAligned({
      x: 80,
      y: 255,
      w: 230,
      h: 58,
      text: "PLAY AGAIN",
      textColor: 0x000000,
      textSize: 18,
      normalColor: ACCENT,
      pressColor: ACCENT_PRESSED,
      radius: 29,
      onClick: () => this.startNewGame(),
    });

    this.overlayWidgets = [
      panel,
      accent,
      title,
      score,
      best,
      again.button,
      again.text,
    ];
    this.overlayScore = score;
    this.overlayBest = best;
  },

  hideOverlay() {
    if (!this.overlayWidgets.length) return;
    this.overlayWidgets.forEach((widgetItem) => {
      widgetItem.setProperty(prop.MORE, {
        x: 1000,
        y: 1000,
      });
    });
  },

  showOverlay() {
    const positions = [
      [20, 105, 350, 235],
      [45, 105, 300, 7],
      [45, 135, 300, 48],
      [55, 186, 280, 28],
      [55, 214, 280, 24],
      [80, 255, 230, 58],
      [80, 255, 230, 58],
    ];

    this.overlayWidgets.forEach((widgetItem, index) => {
      const [x, y, w, h] = positions[index];
      widgetItem.setProperty(prop.MORE, { x, y, w, h });
    });

    this.overlayScore.setProperty(prop.MORE, {
      text: "SCORE " + this.score,
    });
    this.overlayBest.setProperty(prop.MORE, {
      text: "BEST " + this.best,
    });
  },

  renderPiecePreview(index) {
    const containerX = TRAY_X[index];
    const containerY = TRAY_Y;
    const piece = this.pieces[index];
    const cells = piece.cells;
    const maxPreviewCells = 9;

    const maxRow = Math.max(...cells.map(([r]) => r));
    const maxCol = Math.max(...cells.map(([, c]) => c));
    const rows = maxRow + 1;
    const cols = maxCol + 1;
    const previewW = cols * PREVIEW_CELL + (cols - 1) * PREVIEW_GAP;
    const previewH = rows * PREVIEW_CELL + (rows - 1) * PREVIEW_GAP;
    const startX = containerX + Math.floor((TRAY_W - previewW) / 2);
    const startY = containerY + 42 + Math.floor((TRAY_H - 42 - previewH) / 2);

    if (this.previewWidgets[index].length === 0) {
      for (let i = 0; i < maxPreviewCells; i += 1) {
        const tile = button({
          x: 1000,
          y: 1000,
          w: PREVIEW_CELL,
          h: PREVIEW_CELL,
          text: "",
          textSize: 1,
          color: 0x000000,
          normalColor: piece.color,
          pressColor: 0xFFFFFF,
          radius: 5,
          onClick: () => this.selectPiece(index),
        });
        this.previewWidgets[index].push(tile);
      }
    }

    this.previewWidgets[index].forEach((tile, tileIndex) => {
      if (tileIndex >= cells.length) {
        tile.setProperty(prop.MORE, {
          x: 1000,
          y: 1000,
        });
        return;
      }

      const cell = cells[tileIndex];
      const r = cell[0];
      const c = cell[1];
      const selected = this.selectedPiece === index;

      tile.setProperty(prop.MORE, {
        x: startX + c * (PREVIEW_CELL + PREVIEW_GAP),
        y: startY + r * (PREVIEW_CELL + PREVIEW_GAP),
        w: PREVIEW_CELL,
        h: PREVIEW_CELL,
        normal_color: selected ? 0xFFFFFF : piece.color,
        press_color: selected ? ACCENT : 0xFFFFFF,
        radius: 5,
      });
    });
  },

  selectPiece(index) {
    if (this.busy || !this.pieces[index]) return;

    if (this.selectedPiece === index) {
      this.selectedPiece = -1;
    } else {
      this.selectedPiece = index;
    }

    this.updatePieceSelection();
    this.setStatus(
      this.selectedPiece === -1 ? "TAP A BLOCK" : "TAP A GRID SPACE"
    );
  },

  updatePieceSelection() {
    for (let index = 0; index < 3; index += 1) {
      const selected = this.selectedPiece === index;
      const piece = this.pieces[index];
      if (!piece) continue;

      this.previewWidgets[index].forEach((widgetItem) => {
        widgetItem.setProperty(prop.MORE, {
          normal_color: selected ? 0xFFFFFF : piece.color,
          press_color: selected ? ACCENT : 0xFFFFFF,
        });
      });
    }
  },

  onBoardTap(row, col) {
    if (this.busy || this.selectedPiece < 0) return;

    const piece = this.pieces[this.selectedPiece];
    if (!piece) return;

    if (!this.canPlace(piece, row, col)) {
      const index = row * BOARD_SIZE + col;
      shake(this.boardWidgets[index], { duration: 180 });
      vibrateLight();
      this.setStatus("NO ROOM HERE");
      return;
    }

    this.busy = true;
    const placedCells = this.placePiece(piece, row, col);
    const usedIndex = this.selectedPiece;
    this.selectedPiece = -1;
    this.pieces[usedIndex] = randomPiece();

    this.score += placedCells.length;
    vibrateLight();
    this.playPlaceSound();
    this.updateScore();
    this.updateBoard();

    placedCells.forEach(({ row: r, col: c }) => {
      const index = r * BOARD_SIZE + c;
      popIn(
        this.boardWidgets[index],
        BOARD_X + c * STRIDE,
        BOARD_Y + r * STRIDE,
        CELL,
        CELL,
        { duration: 140, scale: 0.75 }
      );
    });
    this.updatePieceSelection();
    this.renderPiecePreview(usedIndex);
    this.setStatus("KEEP GOING");

    const clearData = this.getCompletedLines();
    if (clearData.cells.length === 0) {
      this.busy = false;
      if (this.noMovesLeft()) this.endGame();
      return;
    }

    const lineCount = clearData.rows.length + clearData.cols.length;
    this.score += lineCount * 10 + Math.max(0, lineCount - 1) * 5;
    if (this.score > this.best) {
      this.best = this.score;
      setNumber("blockblast_best", this.best);
      this.bestPill.setText("BEST " + this.best);
    }
    this.updateScore();
    vibrateStrong();
    this.playClearSound();
    this.setStatus(lineCount + " LINE" + (lineCount === 1 ? "" : "S") + " CLEARED");

    clearData.cells.forEach(([r, c]) => {
      const index = r * BOARD_SIZE + c;
      fadeOut(this.boardWidgets[index], {
        duration: 150,
      });
    });

    setTimeout(() => {
      clearData.cells.forEach(([r, c]) => {
        this.board[r][c] = null;
      });
      this.updateBoard();
      clearData.cells.forEach(([r, c]) => {
        const index = r * BOARD_SIZE + c;
        fadeIn(this.boardWidgets[index], { duration: 120 });
      });
      this.busy = false;
      if (this.noMovesLeft()) this.endGame();
    }, 170);
  },

  canPlace(piece, row, col) {
    return piece.cells.every(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      return (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        !this.board[r][c]
      );
    });
  },

  placePiece(piece, row, col) {
    const placedCells = [];
    piece.cells.forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      this.board[r][c] = piece.color;
      placedCells.push({ row: r, col: c });
    });
    return placedCells;
  },

  getCompletedLines() {
    const rows = [];
    const cols = [];
    const cellSet = new Set();

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      if (this.board[row].every(Boolean)) rows.push(row);
    }

    for (let col = 0; col < BOARD_SIZE; col += 1) {
      let full = true;
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        if (!this.board[row][col]) {
          full = false;
          break;
        }
      }
      if (full) cols.push(col);
    }

    rows.forEach((row) => {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        cellSet.add(key(row, col));
      }
    });

    cols.forEach((col) => {
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        cellSet.add(key(row, col));
      }
    });

    const cells = Array.from(cellSet).map((value) => {
      const parts = value.split(":");
      const row = Number(parts[0]);
      const col = Number(parts[1]);
      return [row, col];
    });

    return { rows, cols, cells };
  },

  noMovesLeft() {
    return this.pieces.every((piece) => {
      if (!piece) return true;
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
          if (this.canPlace(piece, row, col)) return false;
        }
      }
      return true;
    });
  },

  endGame() {
    if (this.score > this.best) {
      this.best = this.score;
      setNumber("blockblast_best", this.best);
      this.bestPill.setText("BEST " + this.best);
    }
    this.showOverlay();
    this.setStatus("NO MORE MOVES");
  },

  updateBoard() {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const index = row * BOARD_SIZE + col;
        const value = this.board[row][col];
        this.boardWidgets[index].setProperty(prop.MORE, {
          x: BOARD_X + col * STRIDE,
          y: BOARD_Y + row * STRIDE,
          w: CELL,
          h: CELL,
          normal_color: value || EMPTY,
          press_color: value || EMPTY_PRESSED,
          radius: 8,
        });
      }
    }
  },

  updateScore() {
    this.scoreText.setProperty(prop.MORE, {
      text: String(this.score),
    });
    this.bestPill.setText("BEST " + this.best);
  },

  updateAll() {
    this.updateBoard();
    this.updateScore();
    this.updatePieceSelection();
    for (let i = 0; i < 3; i += 1) {
      this.renderPiecePreview(i);
    }
  },

  setStatus(value) {
    this.statusText.setProperty(prop.MORE, {
      text: value,
    });
  },

  playPlaceSound() {
    if (this.soundTypes && this.soundTypes.REGULAR !== undefined) {
      playSystemSound(this.soundTypes.REGULAR, 0, this.systemSounds);
    }
  },

  playClearSound() {
    if (this.soundTypes && this.soundTypes.ACHIEVE !== undefined) {
      playSystemSound(this.soundTypes.ACHIEVE, 0, this.systemSounds);
    }
  },
});