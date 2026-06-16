import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { PatternDef } from '../types';
import { colorizeSvgFg, svgToImage } from '../core/patterns';
import { drawAnimatedPattern } from '../engine/animations';
import { useStore } from '../store';

const TILE_BG = {
  dark: { on: '#ffffff', off: '#404040', fg: '#000000' },
  light: { on: '#1a1a1a', off: '#c0c0c0', fg: '#ffffff' },
} as const;

interface Props {
  def: PatternDef;
  enabled: boolean;
  onToggle: () => void;
}

export const PatternTile: React.FC<Props> = ({ def, enabled, onToggle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovering, setHovering] = useState(false);
  const animRef = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const theme = useStore((s) => s.theme);

  const palette = TILE_BG[theme];
  const bg = enabled ? palette.on : palette.off;
  const fg = palette.fg;

  useEffect(() => {
    const fgSvg = colorizeSvgFg(def.svgText, fg);
    svgToImage(fgSvg).then((img) => {
      imgRef.current = img;
      drawStatic();
    });
  }, [def, fg]);

  const drawStatic = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 40, 40);
    drawAnimatedPattern(ctx, bg, fg, img, def.animType, 1, 40, def.shapes, 'left', false);
  }, [def.animType, def.shapes, bg, fg]);

  useEffect(() => {
    if (!hovering) {
      cancelAnimationFrame(animRef.current);
      drawStatic();
      return;
    }
    const start = performance.now();
    const loop = (now: number) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 40, 40);
      const progress = ((now - start) % 1200) / 1200;
      drawAnimatedPattern(ctx, bg, fg, img, def.animType, progress, 40, def.shapes, 'left', false);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [hovering, def.animType, def.shapes, drawStatic, bg, fg]);

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      title={def.name}
      style={{ cursor: 'pointer' }}
    >
      <canvas ref={canvasRef} width={40} height={40} style={{ width: 40, height: 40, display: 'block' }} />
    </div>
  );
};
