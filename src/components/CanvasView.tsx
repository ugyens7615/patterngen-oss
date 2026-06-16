import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from '../store';
import { CANVAS_W, CANVAS_H } from '../types';
import { snapToGrid } from '../core/grid';
import { evaluate } from '../engine/timeline';
import { renderFrame, drawGrid } from '../export/renderer';

const CANVAS_BG = '#323232';

export const CanvasView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scaleRef = useRef(1);
  const [dragOver, setDragOver] = useState(false);

  const {
    titles, patterns, squares, dots,
    elapsedMs, durationMs, easing, stagger, patternDefsMap, playing,
    addTitle, moveTitle, removeTitle,
    showGrid: gridOn, bgImage, clearBgImage,
    setBgImage, setElapsedMs, setPlaying,
  } = useStore();

  useEffect(() => {
    const resize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const scale = Math.min(cw / CANVAS_W, ch / CANVAS_H);
      scaleRef.current = scale;
      canvas.style.width = `${CANVAS_W * scale}px`;
      canvas.style.height = `${CANVAS_H * scale}px`;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let cancelled = false;
    const state = evaluate(elapsedMs, durationMs, titles, patterns, squares, dots, easing, stagger);
    renderFrame(ctx, state, titles, patterns, squares, dots, patternDefsMap, 1, undefined, CANVAS_BG, bgImage).then(() => {
      if (!cancelled && !playing && gridOn) drawGrid(ctx, 1);
    });
    return () => { cancelled = true; };
  }, [elapsedMs, durationMs, titles, patterns, squares, dots, easing, stagger, patternDefsMap, playing, gridOn, bgImage]);

  const toCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = scaleRef.current;
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
  }, []);

  const isInsideCanvas = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (!files.length) return;
      const { x: dropX, y: dropY } = toCanvasCoords(e.clientX, e.clientY);
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const w = Math.round(img.naturalWidth / 2);
            const h = Math.round(img.naturalHeight / 2);
            const x = snapToGrid(dropX - w / 2);
            const y = snapToGrid(dropY - h / 2);
            addTitle(img, x, y, w, h);
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    },
    [addTitle, toCanvasCoords],
  );

  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const { x: mx, y: my } = toCanvasCoords(e.clientX, e.clientY);
      for (let i = titles.length - 1; i >= 0; i--) {
        const t = titles[i];
        if (mx >= t.x && mx <= t.x + t.w && my >= t.y && my <= t.y + t.h) {
          dragState.current = { id: t.id, offsetX: mx - t.x, offsetY: my - t.y };
          return;
        }
      }
    },
    [titles, toCanvasCoords],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.current) return;
      const { x: mx, y: my } = toCanvasCoords(e.clientX, e.clientY);
      const x = snapToGrid(mx - dragState.current.offsetX);
      const y = snapToGrid(my - dragState.current.offsetY);
      moveTitle(dragState.current.id, x, y);
    },
    [moveTitle, toCanvasCoords],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.current) return;
      const id = dragState.current.id;
      dragState.current = null;
      if (!isInsideCanvas(e.clientX, e.clientY)) removeTitle(id);
    },
    [removeTitle, isInsideCanvas],
  );

  const handleMouseLeave = useCallback(() => {
    if (!dragState.current) return;
    const id = dragState.current.id;
    dragState.current = null;
    removeTitle(id);
  }, [removeTitle]);

  const handleBgUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => setBgImage(img, reader.result as string);
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [setBgImage]);

  const cycleDuration = 5 * durationMs;
  const scrubValue = cycleDuration > 0 ? Math.min(elapsedMs / cycleDuration, 1) : 0;
  const titleEnd = durationMs / cycleDuration;
  const patternEnd = (2 * durationMs) / cycleDuration;

  const handleScrub = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setElapsedMs(val * cycleDuration);
    if (playing) setPlaying(false);
  }, [cycleDuration, setElapsedMs, playing, setPlaying]);

  return (
    <div style={styles.wrapper}>
      <div
        ref={containerRef}
        style={{ ...styles.container, ...(dragOver ? styles.containerDragOver : {}) }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
        {titles.length === 0 && !playing && (
          <div style={styles.hint}>Drop title images here</div>
        )}
        <div style={styles.bgBtnGroup}>
          <button onClick={handleBgUpload} style={styles.bgBtn} title="Upload background reference">BG</button>
          {bgImage && <button onClick={clearBgImage} style={styles.bgBtn} title="Remove background">×</button>}
        </div>
      </div>

      <div style={styles.timelineArea}>
        <div style={styles.trackWrap}>
          <div style={styles.trackBg}>
            <div style={{ ...styles.trackSegment, left: 0, width: `${titleEnd * 100}%`, background: 'var(--track-light)' }} />
            <div style={{ ...styles.trackSegment, left: `${titleEnd * 100}%`, width: `${(patternEnd - titleEnd) * 100}%`, background: 'var(--track-mid)' }} />
            <div style={{ ...styles.trackSegment, left: `${patternEnd * 100}%`, width: `${(1 - patternEnd) * 100}%`, background: 'var(--track-dark)' }} />
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={scrubValue}
            onChange={handleScrub}
            style={styles.scrubber}
            className="timeline-scrubber"
          />
        </div>
        <div style={styles.labelsRow}>
          <span style={{ ...styles.layerLabel, position: 'absolute', left: `${titleEnd * 50}%`, transform: 'translateX(-50%)' }}>TITLES</span>
          <span style={{ ...styles.layerLabel, position: 'absolute', left: `${(titleEnd + patternEnd) / 2 * 100}%`, transform: 'translateX(-50%)' }}>PATTERNS</span>
          <span style={{ ...styles.layerLabel, position: 'absolute', left: `${(patternEnd + 1) / 2 * 100}%`, transform: 'translateX(-50%)' }}>DOTS</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    gap: 40,
    minWidth: 0,
  },
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'var(--canvas-frame)',
    position: 'relative',
    borderRadius: 12,
  },
  containerDragOver: {
    outline: '1px solid var(--muted)',
    outlineOffset: -1,
  },
  canvas: {
    display: 'block',
    borderRadius: 12,
  },
  hint: {
    position: 'absolute',
    color: 'var(--hint)',
    fontSize: 14,
    pointerEvents: 'none',
    bottom: 16,
  },
  bgBtnGroup: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    display: 'flex',
    gap: 4,
    zIndex: 10,
  },
  bgBtn: {
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid var(--muted-3)',
    borderRadius: 3,
    color: 'var(--muted)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '3px 8px',
    fontFamily: 'inherit',
  },
  timelineArea: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  trackWrap: {
    position: 'relative',
    height: 8,
  },
  trackBg: {
    position: 'absolute',
    inset: 0,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  scrubber: {
    position: 'absolute',
    top: -4,
    left: 0,
    width: '100%',
    height: 16,
    margin: 0,
    cursor: 'pointer',
    background: 'transparent',
    WebkitAppearance: 'none' as never,
    appearance: 'none' as never,
  },
  labelsRow: {
    position: 'relative',
    height: 16,
  },
  layerLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--muted-2)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap',
  },
};
