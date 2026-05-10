import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);
const port = Number(process.env.PORT ?? 4174);

const CANVAS = { width: 852, height: 852 };
const FRAME = { width: 320, height: 320, blockedPadding: 26, offsetY: 0 };
const NOTE_WIDTH = 50;
const MAX_NOTES = 50;
const COLLISION_SCALE = 0.72;
const SEARCH_STEP_PX = 8;
const SEARCH_ANGLE_STEP = 30;
const BOARD_PADDING_PX = { top: 20, right: 14, bottom: 20, left: 14 };

const stickerSpecs = {
  red: {
    label: 'Red',
    color: '#ff5a5a',
    textColor: '#2a1717',
    aspectRatio: 249 / 271,
    hitboxDiff: { offsetX: 0, offsetY: 2, scaleX: 0.72, scaleY: 0.7 },
  },
  yellow: {
    label: 'Yellow',
    color: '#ffd46a',
    textColor: '#37290a',
    aspectRatio: 270 / 274,
    hitboxDiff: { offsetX: 0, offsetY: 0, scaleX: 0.72, scaleY: 0.72 },
  },
  green: {
    label: 'Green',
    color: '#71d98a',
    textColor: '#11351c',
    aspectRatio: 361 / 253,
    hitboxDiff: { offsetX: 0, offsetY: -6, scaleX: 0.78, scaleY: 0.64 },
  },
  blue: {
    label: 'Blue',
    color: '#79c3ff',
    textColor: '#0b2744',
    aspectRatio: 204 / 326,
    hitboxDiff: { offsetX: 1, offsetY: 1, scaleX: 0.7, scaleY: 0.76 },
  },
  purple: {
    label: 'Purple',
    color: '#b9a7ff',
    textColor: '#21194a',
    aspectRatio: 259 / 259,
    hitboxDiff: { offsetX: 0, offsetY: 0, scaleX: 0.72, scaleY: 0.72 },
  },
  pink: {
    label: 'Pink',
    color: '#f3a7d8',
    textColor: '#461434',
    aspectRatio: 271 / 271,
    hitboxDiff: { offsetX: -1, offsetY: 1, scaleX: 0.7, scaleY: 0.72 },
  },
};

const notes = [];
const idempotencyCache = new Map();
let boardQueue = Promise.resolve();

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const toPercent = (value, total) => Number(((value / total) * 100).toFixed(2));
const toPixels = (value, total) => (value / 100) * total;

function withBoardLock(task) {
  const runTask = boardQueue.then(task, task);
  boardQueue = runTask.catch(() => {});

  return runTask;
}

function getFrameRect() {
  return {
    x: (CANVAS.width - FRAME.width) / 2,
    y: (CANVAS.height - FRAME.height) / 2 + FRAME.offsetY,
    width: FRAME.width,
    height: FRAME.height,
  };
}

function getBlockedFrameRect() {
  const frameRect = getFrameRect();

  return {
    left: frameRect.x - FRAME.blockedPadding,
    top: frameRect.y - FRAME.blockedPadding,
    right: frameRect.x + frameRect.width + FRAME.blockedPadding,
    bottom: frameRect.y + frameRect.height + FRAME.blockedPadding,
  };
}

function getNoteSize(colorId) {
  const spec = stickerSpecs[colorId] ?? stickerSpecs.red;

  return {
    width: NOTE_WIDTH,
    height: Number((NOTE_WIDTH * spec.aspectRatio).toFixed(2)),
  };
}

function clampPlacement(placement, colorId) {
  const noteSize = getNoteSize(colorId);
  const minX = toPercent(BOARD_PADDING_PX.left + noteSize.width / 2, CANVAS.width);
  const maxX = toPercent(CANVAS.width - BOARD_PADDING_PX.right - noteSize.width / 2, CANVAS.width);
  const minY = toPercent(BOARD_PADDING_PX.top + noteSize.height / 2, CANVAS.height);
  const maxY = toPercent(
    CANVAS.height - BOARD_PADDING_PX.bottom - noteSize.height / 2,
    CANVAS.height,
  );

  return {
    x: Number(clamp(placement.x, minX, maxX).toFixed(2)),
    y: Number(clamp(placement.y, minY, maxY).toFixed(2)),
  };
}

function getCollisionRect(placement, colorId) {
  const noteSize = getNoteSize(colorId);
  const spec = stickerSpecs[colorId] ?? stickerSpecs.red;
  const hitbox = spec.hitboxDiff;
  const centerX = toPixels(placement.x, CANVAS.width) + hitbox.offsetX;
  const centerY = toPixels(placement.y, CANVAS.height) + hitbox.offsetY;
  const width = noteSize.width * (hitbox.scaleX ?? COLLISION_SCALE);
  const height = noteSize.height * (hitbox.scaleY ?? COLLISION_SCALE);

  return {
    left: centerX - width / 2,
    top: centerY - height / 2,
    right: centerX + width / 2,
    bottom: centerY + height / 2,
  };
}

function doRectsOverlap(firstRect, secondRect) {
  return (
    firstRect.left < secondRect.right &&
    firstRect.right > secondRect.left &&
    firstRect.top < secondRect.bottom &&
    firstRect.bottom > secondRect.top
  );
}

function isPlacementAvailable(placement, colorId) {
  const clampedPlacement = clampPlacement(placement, colorId);
  const candidateRect = getCollisionRect(clampedPlacement, colorId);

  if (doRectsOverlap(candidateRect, getBlockedFrameRect())) {
    return false;
  }

  return notes.every(
    (note) => !doRectsOverlap(candidateRect, getCollisionRect(note, note.colorId)),
  );
}

function findNearestAvailablePlacement(targetPlacement, colorId) {
  const clampedTarget = clampPlacement(targetPlacement, colorId);

  if (isPlacementAvailable(clampedTarget, colorId)) {
    return clampedTarget;
  }

  const targetX = toPixels(clampedTarget.x, CANVAS.width);
  const targetY = toPixels(clampedTarget.y, CANVAS.height);
  const maxRadius = Math.ceil(Math.hypot(CANVAS.width, CANVAS.height));

  for (let radius = SEARCH_STEP_PX; radius <= maxRadius; radius += SEARCH_STEP_PX) {
    for (let angle = 0; angle < 360; angle += SEARCH_ANGLE_STEP) {
      const radian = (angle * Math.PI) / 180;
      const candidatePlacement = clampPlacement(
        {
          x: toPercent(targetX + Math.cos(radian) * radius, CANVAS.width),
          y: toPercent(targetY + Math.sin(radian) * radius, CANVAS.height),
        },
        colorId,
      );

      if (isPlacementAvailable(candidatePlacement, colorId)) {
        return candidatePlacement;
      }
    }
  }

  return null;
}

function getAdjustmentDistancePx(requestedPlacement, resolvedPlacement) {
  return Number(
    Math.hypot(
      toPixels(resolvedPlacement.x - requestedPlacement.x, CANVAS.width),
      toPixels(resolvedPlacement.y - requestedPlacement.y, CANVAS.height),
    ).toFixed(2),
  );
}

function serializeBoard() {
  return {
    config: {
      canvas: CANVAS,
      frame: FRAME,
      frameRect: getFrameRect(),
      blockedFrameRect: getBlockedFrameRect(),
      noteWidth: NOTE_WIDTH,
      maxNotes: MAX_NOTES,
      stickerSpecs,
    },
    notes,
  };
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(data, null, 2));
}

function sendHtml(response) {
  response.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(getHtml());
}

async function parseJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function handleCreateNote(request, response) {
  const body = await parseJsonBody(request);

  await withBoardLock(async () => {
    await sleep(120);

    const idempotencyKey =
      typeof body.idempotencyKey === 'string' && body.idempotencyKey.trim()
        ? body.idempotencyKey.trim()
        : randomUUID();

    if (idempotencyCache.has(idempotencyKey)) {
      sendJson(response, 200, {
        ...idempotencyCache.get(idempotencyKey),
        replayed: true,
      });
      return;
    }

    if (notes.length >= MAX_NOTES) {
      sendJson(response, 409, {
        code: 'BOARD_FULL',
        message: 'This board is already full.',
        board: serializeBoard(),
      });
      return;
    }

    const colorId = stickerSpecs[body.colorId] ? body.colorId : 'red';
    const requestedPlacement = clampPlacement(
      {
        x: Number(body.requestedX ?? 50),
        y: Number(body.requestedY ?? 50),
      },
      colorId,
    );
    const resolvedPlacement = findNearestAvailablePlacement(requestedPlacement, colorId);

    if (!resolvedPlacement) {
      sendJson(response, 409, {
        code: 'NO_SPACE_NEARBY',
        message: 'The server could not find a valid placement.',
        board: serializeBoard(),
      });
      return;
    }

    const note = {
      id: randomUUID(),
      message:
        String(body.message ?? '축하합니다')
          .trim()
          .slice(0, 80) || '축하합니다',
      colorId,
      x: resolvedPlacement.x,
      y: resolvedPlacement.y,
      requestedX: requestedPlacement.x,
      requestedY: requestedPlacement.y,
      createdAt: new Date().toISOString(),
    };
    notes.push(note);

    const payload = {
      note,
      adjusted:
        Math.abs(note.x - note.requestedX) > 0.01 || Math.abs(note.y - note.requestedY) > 0.01,
      adjustmentDistancePx: getAdjustmentDistancePx(requestedPlacement, resolvedPlacement),
      board: serializeBoard(),
      replayed: false,
    };
    idempotencyCache.set(idempotencyKey, payload);

    sendJson(response, 201, payload);
  });
}

async function handleAsset(request, response) {
  const assetName = decodeURIComponent(request.url.replace('/assets/', ''));
  const assetPath = join(projectRoot, 'src', 'assets', 'rollingPaper', assetName);
  const contentTypes = {
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };

  try {
    const file = await readFile(assetPath);
    response.writeHead(200, {
      'content-type': contentTypes[extname(assetPath)] ?? 'application/octet-stream',
      'cache-control': 'public, max-age=3600',
    });
    response.end(file);
  } catch {
    sendJson(response, 404, { message: 'Asset not found.' });
  }
}

function handleReset(response) {
  notes.splice(0, notes.length);
  idempotencyCache.clear();
  sendJson(response, 200, serializeBoard());
}

function getHtml() {
  return String.raw`<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Rolling Paper Placement Demo</title>
    <style>
      :root {
        color: #171717;
        background: #f2f3f5;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(238, 240, 244, 0.92)),
          #f2f3f5;
      }

      button,
      textarea {
        font: inherit;
      }

      .shell {
        display: grid;
        grid-template-columns: minmax(320px, 430px) minmax(300px, 420px);
        gap: 24px;
        width: min(100%, 920px);
        margin: 0 auto;
        padding: 24px 18px;
      }

      .panel {
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 14px 38px rgba(0, 0, 0, 0.08);
      }

      .phone {
        overflow: hidden;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 16px 10px;
      }

      h1 {
        margin: 0;
        font-size: 20px;
        line-height: 1.2;
        letter-spacing: 0;
      }

      .counter {
        min-width: 70px;
        border-radius: 999px;
        background: #171717;
        color: white;
        padding: 7px 10px;
        text-align: center;
        font-size: 13px;
        font-weight: 700;
      }

      .board-wrap {
        padding: 10px 16px 0;
      }

      .board {
        position: relative;
        width: 100%;
        aspect-ratio: 375 / 509;
        overflow: hidden;
        touch-action: none;
        border-radius: 8px;
        background: #e7e9ed;
      }

      .canvas {
        position: absolute;
        left: 50%;
        top: 50%;
        width: ${CANVAS.width}px;
        height: ${CANVAS.height}px;
        overflow: hidden;
        border-radius: 8px;
        background: white;
        box-shadow: 0 16px 42px rgba(0, 0, 0, 0.12);
        transform-origin: center center;
      }

      .frame {
        position: absolute;
        object-fit: contain;
        pointer-events: none;
        user-select: none;
        z-index: 2;
      }

      .blocked {
        position: absolute;
        border: 2px dashed rgba(255, 61, 61, 0.45);
        border-radius: 8px;
        background: rgba(255, 61, 61, 0.06);
        z-index: 1;
      }

      .note {
        position: absolute;
        display: grid;
        place-items: center;
        width: ${NOTE_WIDTH}px;
        padding: 7px;
        transform: translate(-50%, -50%);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 7px 7px 12px 7px;
        box-shadow: 0 5px 12px rgba(0, 0, 0, 0.16);
        font-size: 8px;
        font-weight: 700;
        line-height: 1.25;
        text-align: center;
        word-break: keep-all;
        z-index: 4;
      }

      .note.pending {
        outline: 2px solid rgba(0, 0, 0, 0.35);
        opacity: 0.72;
      }

      .note.ghost {
        z-index: 5;
        pointer-events: none;
        outline: 2px solid rgba(255, 61, 61, 0.5);
      }

      .controls {
        display: grid;
        gap: 10px;
        padding: 14px 16px 16px;
      }

      textarea {
        width: 100%;
        min-height: 74px;
        resize: vertical;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 8px;
        padding: 12px;
        background: white;
        color: #171717;
        outline: none;
      }

      .colors {
        display: flex;
        gap: 8px;
      }

      .swatch {
        width: 34px;
        height: 34px;
        border: 2px solid transparent;
        border-radius: 999px;
        cursor: pointer;
      }

      .swatch.active {
        border-color: #171717;
      }

      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .action {
        min-height: 42px;
        border: 0;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 800;
      }

      .action.primary {
        background: #ff3d3d;
        color: white;
      }

      .action.secondary {
        background: #ebedf1;
        color: #171717;
      }

      .server {
        padding: 16px;
      }

      h2 {
        margin: 0 0 12px;
        font-size: 16px;
        line-height: 1.35;
        letter-spacing: 0;
      }

      .metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
      }

      .metric {
        border-radius: 8px;
        background: #f4f5f7;
        padding: 10px;
      }

      .metric strong {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        color: #6a6f7a;
      }

      .metric span {
        font-size: 14px;
        font-weight: 800;
      }

      .log {
        height: 462px;
        overflow: auto;
        margin: 0;
        border-radius: 8px;
        background: #171717;
        color: #f4f5f7;
        padding: 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
      }

      @media (max-width: 760px) {
        .shell {
          grid-template-columns: 1fr;
          padding: 12px;
        }

        .server {
          order: 2;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="panel phone">
        <div class="header">
          <h1>Rolling Paper Demo</h1>
          <div class="counter"><span id="noteCount">0</span>/${MAX_NOTES}</div>
        </div>
        <div class="board-wrap">
          <div id="board" class="board" aria-label="롤링페이퍼 데모 보드">
            <div id="canvas" class="canvas">
              <div id="blocked" class="blocked"></div>
              <img id="frame" class="frame" alt="" src="/assets/rolling-board-frame-main.png" />
              <div id="notes"></div>
              <div id="ghost" class="note ghost">DROP</div>
            </div>
          </div>
        </div>
        <div class="controls">
          <textarea id="message" maxlength="80">80주년 축하합니다!</textarea>
          <div id="colors" class="colors"></div>
          <div class="actions">
            <button id="placeButton" class="action primary" type="button">현재 위치에 붙이기</button>
            <button id="resetButton" class="action secondary" type="button">초기화</button>
          </div>
        </div>
      </section>

      <aside class="panel server">
        <h2>Server authority</h2>
        <div class="metrics">
          <div class="metric">
            <strong>Last status</strong>
            <span id="lastStatus">ready</span>
          </div>
          <div class="metric">
            <strong>Last adjustment</strong>
            <span id="lastAdjustment">0px</span>
          </div>
        </div>
        <pre id="log" class="log"></pre>
      </aside>
    </main>

    <script>
      const config = ${JSON.stringify({
        canvas: CANVAS,
        frame: FRAME,
        frameRect: getFrameRect(),
        blockedFrameRect: getBlockedFrameRect(),
        noteWidth: NOTE_WIDTH,
        maxNotes: MAX_NOTES,
        stickerSpecs,
      })};

      const state = {
        notes: [],
        selectedColor: 'red',
        placement: { x: 18, y: 18 },
        fitScale: 1,
        pending: false,
      };

      const board = document.querySelector('#board');
      const canvas = document.querySelector('#canvas');
      const frame = document.querySelector('#frame');
      const blocked = document.querySelector('#blocked');
      const notesEl = document.querySelector('#notes');
      const ghost = document.querySelector('#ghost');
      const colorsEl = document.querySelector('#colors');
      const messageEl = document.querySelector('#message');
      const logEl = document.querySelector('#log');
      const noteCountEl = document.querySelector('#noteCount');
      const lastStatusEl = document.querySelector('#lastStatus');
      const lastAdjustmentEl = document.querySelector('#lastAdjustment');

      function log(title, payload) {
        const line = '[' + new Date().toLocaleTimeString() + '] ' + title + '\\n' + JSON.stringify(payload, null, 2);
        logEl.textContent = line + '\\n\\n' + logEl.textContent;
      }

      function applyFrame() {
        const frameRect = config.frameRect;
        const blockedRect = config.blockedFrameRect;
        frame.style.left = frameRect.x + 'px';
        frame.style.top = frameRect.y + 'px';
        frame.style.width = frameRect.width + 'px';
        frame.style.height = frameRect.height + 'px';
        blocked.style.left = blockedRect.left + 'px';
        blocked.style.top = blockedRect.top + 'px';
        blocked.style.width = (blockedRect.right - blockedRect.left) + 'px';
        blocked.style.height = (blockedRect.bottom - blockedRect.top) + 'px';
      }

      function updateFitScale() {
        const rect = board.getBoundingClientRect();
        state.fitScale = Math.max(rect.width / config.canvas.width, rect.height / config.canvas.height);
        canvas.style.transform = 'translate(-50%, -50%) scale(' + state.fitScale + ')';
      }

      function getNoteHeight(colorId) {
        return config.noteWidth * config.stickerSpecs[colorId].aspectRatio;
      }

      function setNoteStyle(element, note) {
        const spec = config.stickerSpecs[note.colorId];
        element.style.left = note.x + '%';
        element.style.top = note.y + '%';
        element.style.height = getNoteHeight(note.colorId) + 'px';
        element.style.background = spec.color;
        element.style.color = spec.textColor;
      }

      function renderColors() {
        colorsEl.innerHTML = '';
        Object.entries(config.stickerSpecs).forEach(([colorId, spec]) => {
          const button = document.createElement('button');
          button.className = 'swatch' + (state.selectedColor === colorId ? ' active' : '');
          button.type = 'button';
          button.ariaLabel = spec.label;
          button.style.background = spec.color;
          button.addEventListener('click', () => {
            state.selectedColor = colorId;
            renderColors();
            renderGhost();
          });
          colorsEl.append(button);
        });
      }

      function renderNotes() {
        notesEl.innerHTML = '';
        state.notes.forEach((note) => {
          const element = document.createElement('div');
          element.className = 'note';
          element.textContent = note.message;
          setNoteStyle(element, note);
          notesEl.append(element);
        });
        noteCountEl.textContent = String(state.notes.length);
      }

      function renderGhost() {
        ghost.textContent = messageEl.value.trim() || 'DROP';
        setNoteStyle(ghost, {
          ...state.placement,
          colorId: state.selectedColor,
        });
      }

      function getPlacementFromEvent(event) {
        const rect = board.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const canvasX = (event.clientX - centerX) / state.fitScale + config.canvas.width / 2;
        const canvasY = (event.clientY - centerY) / state.fitScale + config.canvas.height / 2;

        return {
          x: Number(Math.min(Math.max((canvasX / config.canvas.width) * 100, 0), 100).toFixed(2)),
          y: Number(Math.min(Math.max((canvasY / config.canvas.height) * 100, 0), 100).toFixed(2)),
        };
      }

      async function loadBoard() {
        const response = await fetch('/api/board');
        const data = await response.json();
        state.notes = data.notes;
        renderNotes();
        log('GET /api/board', data);
      }

      async function placeNote() {
        if (state.pending) return;
        state.pending = true;
        lastStatusEl.textContent = 'posting';
        ghost.classList.add('pending');

        const requestBody = {
          message: messageEl.value,
          colorId: state.selectedColor,
          requestedX: state.placement.x,
          requestedY: state.placement.y,
          idempotencyKey: crypto.randomUUID(),
        };

        log('POST /api/notes request', requestBody);

        try {
          const response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
          const data = await response.json();

          if (!response.ok) {
            lastStatusEl.textContent = data.code ?? 'error';
            log('POST /api/notes error', data);
            return;
          }

          state.notes = data.board.notes;
          state.placement = { x: data.note.x, y: data.note.y };
          lastStatusEl.textContent = data.adjusted ? 'adjusted' : 'placed';
          lastAdjustmentEl.textContent = data.adjustmentDistancePx + 'px';
          renderNotes();
          renderGhost();
          log('POST /api/notes response', data);
        } finally {
          state.pending = false;
          ghost.classList.remove('pending');
        }
      }

      async function resetBoard() {
        const response = await fetch('/api/reset', { method: 'POST' });
        const data = await response.json();
        state.notes = data.notes;
        lastStatusEl.textContent = 'reset';
        lastAdjustmentEl.textContent = '0px';
        renderNotes();
        log('POST /api/reset', data);
      }

      board.addEventListener('pointerdown', (event) => {
        board.setPointerCapture(event.pointerId);
        state.placement = getPlacementFromEvent(event);
        renderGhost();
      });

      board.addEventListener('pointermove', (event) => {
        if (!board.hasPointerCapture(event.pointerId)) return;
        state.placement = getPlacementFromEvent(event);
        renderGhost();
      });

      board.addEventListener('pointerup', async (event) => {
        if (board.hasPointerCapture(event.pointerId)) {
          board.releasePointerCapture(event.pointerId);
        }
        state.placement = getPlacementFromEvent(event);
        renderGhost();
        await placeNote();
      });

      document.querySelector('#placeButton').addEventListener('click', placeNote);
      document.querySelector('#resetButton').addEventListener('click', resetBoard);
      messageEl.addEventListener('input', renderGhost);
      window.addEventListener('resize', updateFitScale);

      applyFrame();
      updateFitScale();
      renderColors();
      renderGhost();
      loadBoard();
    </script>
  </body>
</html>`;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === 'GET' && url.pathname === '/') {
      sendHtml(response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/board') {
      sendJson(response, 200, serializeBoard());
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/notes') {
      await handleCreateNote(request, response);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/reset') {
      handleReset(response);
      return;
    }

    if (request.method === 'GET' && url.pathname.startsWith('/assets/')) {
      await handleAsset(request, response);
      return;
    }

    sendJson(response, 404, { message: 'Not found.' });
  } catch (error) {
    sendJson(response, 500, {
      message: error instanceof Error ? error.message : 'Unknown server error.',
    });
  }
});

server.listen(port, () => {
  console.log(`Rolling paper placement demo: http://localhost:${port}`);
});
