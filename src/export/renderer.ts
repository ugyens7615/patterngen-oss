import type {
  AnimationState,
  TitleElement,
  PatternElement,
  SquareElement,
  DotElement,
  ExportLayer,
  PatternDef,
} from '../types';
import { CANVAS_W, CANVAS_H, GRID_SIZE } from '../types';
import { colorizeSvgFg, svgToImage } from '../core/patterns';
import { drawAnimatedPattern } from '../engine/animations';

export async function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: AnimationState,
  titles: TitleElement[],
  patterns: PatternElement[],
  squares: SquareElement[],
  dots: DotElement[],
  patternDefs: Map<string, PatternDef>,
  scale: number,
  layer?: ExportLayer,
  bgColor?: string,
  bgImage?: HTMLImageElement | null,
) {
  ctx.clearRect(0, 0, CANVAS_W * scale, CANVAS_H * scale);
  ctx.save();
  ctx.scale(scale, scale);

  if (!layer) {
    if (bgColor) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    if (bgImage) {
      const ir = bgImage.naturalWidth / bgImage.naturalHeight;
      const cr = CANVAS_W / CANVAS_H;
      let dw = CANVAS_W;
      let dh = CANVAS_H;
      if (ir > cr) {
        dh = CANVAS_W / ir;
      } else {
        dw = CANVAS_H * ir;
      }
      const dx = (CANVAS_W - dw) / 2;
      const dy = (CANVAS_H - dh) / 2;
      ctx.drawImage(bgImage, dx, dy, dw, dh);
    }
  }

  if (!layer || layer === 'titles') {
    for (const title of titles) {
      const clip = state.titleClips.get(title.id);
      if (!clip || clip.w <= 0 || clip.h <= 0) continue;
      ctx.save();
      ctx.beginPath();
      ctx.rect(clip.x, clip.y, clip.w, clip.h);
      ctx.clip();
      ctx.drawImage(title.img, title.x, title.y, title.w, title.h);
      ctx.restore();
    }
  }

  if (!layer || layer === 'patterns') {
    const patternSize = GRID_SIZE * 2;
    for (const pat of patterns) {
      const progress = state.patternProgress.get(pat.id) ?? 0;
      const def = patternDefs.get(pat.patternId);
      if (!def) continue;

      const fgSvg = colorizeSvgFg(def.svgText, pat.colors.fg);
      const fgImg = await svgToImage(fgSvg);

      ctx.save();
      ctx.translate(pat.x, pat.y);
      drawAnimatedPattern(
        ctx, pat.colors.bg, pat.colors.fg, fgImg,
        def.animType, progress, patternSize, def.shapes, pat.clipSide,
      );
      ctx.restore();
    }

    for (const sq of squares) {
      const clip = state.squareClips.get(sq.id);
      if (!clip || clip.w <= 0 || clip.h <= 0) continue;
      ctx.save();
      ctx.beginPath();
      ctx.rect(clip.x, clip.y, clip.w, clip.h);
      ctx.clip();
      ctx.fillStyle = sq.color;
      ctx.fillRect(sq.x, sq.y, sq.size, sq.size);
      ctx.restore();
    }
  }

  if (!layer || layer === 'dots') {
    for (const dot of dots) {
      const opacity = state.dotOpacities.get(dot.id) ?? 0;
      if (opacity <= 0) continue;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = dot.color;
      ctx.beginPath();
      ctx.arc(dot.x + 4, dot.y + 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

export function drawGrid(ctx: CanvasRenderingContext2D, scale: number) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= CANVAS_W; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_H);
    ctx.stroke();
  }
  for (let y = 0; y <= CANVAS_H; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
  ctx.restore();
}
