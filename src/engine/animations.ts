import type { PatternAnimType, SvgShapeInfo } from '../types';

/**
 * Draw a pattern element with its animation.
 * ctx is already translated to the element's top-left corner.
 *
 * For dots/capsule types, draws each SVG shape individually using `shapes`.
 * For other types, uses the pre-rendered `fgImg`.
 */
export function drawAnimatedPattern(
  ctx: CanvasRenderingContext2D,
  bgColor: string,
  fgColor: string,
  fgImg: HTMLImageElement,
  animType: PatternAnimType,
  progress: number,
  size: number,
  shapes: SvgShapeInfo[],
  clipSide: 'top' | 'bottom' | 'left' | 'right',
  animateBg = true,
) {
  if (progress > 0) {
    if (!animateBg) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
    } else {
      ctx.save();
      let cx: number, cy: number, cw: number, ch: number;
      switch (clipSide) {
        case 'left':   cx = 0;                       cy = 0; cw = size * progress; ch = size; break;
        case 'right':  cx = size * (1 - progress);   cy = 0; cw = size * progress; ch = size; break;
        case 'top':    cx = 0; cy = 0;                       cw = size; ch = size * progress; break;
        case 'bottom': cx = 0; cy = size * (1 - progress);   cw = size; ch = size * progress; break;
      }
      ctx.beginPath();
      ctx.rect(cx, cy, cw, ch);
      ctx.clip();
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
    }
  }

  if (progress <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, size, size);
  ctx.clip();

  switch (animType) {
    case 'dots':
      drawDotsReveal(ctx, fgColor, shapes, progress, size);
      break;
    case 'capsule':
      drawCapsuleGrow(ctx, fgColor, shapes, progress, size);
      break;
    case 'circle':
      drawCirclePie(ctx, fgImg, progress, size);
      break;
    case 'arrow':
      drawArrowSlideUp(ctx, fgImg, progress, size);
      break;
    case 'square':
    case 'cross':
      drawScaleDown(ctx, fgImg, progress, size);
      break;
    case 'stripes':
      drawStripesReveal(ctx, fgColor, shapes, progress, size);
      break;
  }

  ctx.restore();
}

// --- Dots: each dot fades in individually with random stagger ---

function drawDotsReveal(
  ctx: CanvasRenderingContext2D,
  color: string,
  shapes: SvgShapeInfo[],
  progress: number,
  size: number,
) {
  const scale = size / 40;
  ctx.fillStyle = color;

  for (const s of shapes) {
    // per-dot progress with stagger
    const dotP = Math.max(0, Math.min(1, (progress - s.stagger * 0.6) / 0.4));
    if (dotP <= 0) continue;

    ctx.save();
    ctx.globalAlpha = dotP;
    const x = s.x * scale;
    const y = s.y * scale;
    const w = s.w * scale;
    const h = s.h * scale;
    const rx = Math.min(s.rx * scale, w / 2, h / 2);
    drawRoundedRect(ctx, x, y, w, h, rx);
    ctx.fill();
    ctx.restore();
  }
}

// --- Capsules: each element grows along its longer axis ---

function drawCapsuleGrow(
  ctx: CanvasRenderingContext2D,
  color: string,
  shapes: SvgShapeInfo[],
  progress: number,
  size: number,
) {
  const scale = size / 40;

  for (const s of shapes) {
    const elP = Math.max(0, Math.min(1, (progress - s.stagger * 0.3) / 0.7));
    if (elP <= 0) continue;

    ctx.save();

    if (s.rotation !== 0) {
      ctx.translate(s.rotOriginX * scale, s.rotOriginY * scale);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.translate(-s.rotOriginX * scale, -s.rotOriginY * scale);
    }

    const x = s.x * scale;
    const y = s.y * scale;
    const w = s.w * scale;
    const h = s.h * scale;
    const rx = Math.min(s.rx * scale, w / 2, h / 2);

    // Determine longer axis and animate growth from center
    const cx = x + w / 2;
    const cy = y + h / 2;

    if (w >= h) {
      // horizontal capsule: width grows, height stays
      const animW = w * elP;
      const animX = cx - animW / 2;
      if (s.isStroked) {
        ctx.strokeStyle = color;
        ctx.lineWidth = s.strokeWidth * scale;
        drawRoundedRect(ctx, animX, y, animW, h, rx);
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        drawRoundedRect(ctx, animX, y, animW, h, rx);
        ctx.fill();
      }
    } else {
      // vertical capsule: height grows, width stays
      const animH = h * elP;
      const animY = cy - animH / 2;
      if (s.isStroked) {
        ctx.strokeStyle = color;
        ctx.lineWidth = s.strokeWidth * scale;
        drawRoundedRect(ctx, x, animY, w, animH, rx);
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        drawRoundedRect(ctx, x, animY, w, animH, rx);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// --- Stripes: each stripe slides in from top-right, staggered ---

function drawStripesReveal(
  ctx: CanvasRenderingContext2D,
  color: string,
  shapes: SvgShapeInfo[],
  progress: number,
  size: number,
) {
  const scale = size / 40;
  ctx.fillStyle = color;

  // Sort by x position so they reveal left-to-right
  const sorted = [...shapes].sort((a, b) => a.rotOriginX - b.rotOriginX);
  const n = sorted.length;

  for (let i = 0; i < n; i++) {
    const s = sorted[i];
    const stripeStart = (i / n) * 0.5;
    const stripeP = Math.max(0, Math.min(1, (progress - stripeStart) / 0.5));
    if (stripeP <= 0) continue;

    ctx.save();

    if (s.rotation !== 0) {
      ctx.translate(s.rotOriginX * scale, s.rotOriginY * scale);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.translate(-s.rotOriginX * scale, -s.rotOriginY * scale);
    }

    // Slide in from above: translate Y from -size to 0
    const slideOffset = (1 - stripeP) * -size;
    ctx.translate(0, slideOffset);

    ctx.fillRect(
      s.x * scale,
      s.y * scale,
      s.w * scale,
      s.h * scale,
    );

    ctx.restore();
  }
}

// --- Circle: pie fill (unchanged, uses full fg image) ---

function drawCirclePie(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  size: number,
) {
  const cx = size / 2, cy = size / 2;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + Math.PI * 2 * progress;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, size, startAngle, endAngle);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 0, 0, size, size);
}

// --- Arrow: physically slides up from below the tile ---

function drawArrowSlideUp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  size: number,
) {
  const offset = size * (1 - progress);
  ctx.drawImage(img, 0, offset, size, size);
}

// --- Square / Cross: scale from 1.6x down to 1x ---

function drawScaleDown(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  size: number,
) {
  const s = 1 + (1 - progress) * 0.6;
  const cx = size / 2, cy = size / 2;
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);
  ctx.drawImage(img, 0, 0, size, size);
}

// --- Helpers ---

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  if (w <= 0 || h <= 0) return;
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
