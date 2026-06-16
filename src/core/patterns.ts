import type { PatternDef, PatternAnimType, ColorPair, SvgShapeInfo } from '../types';

/**
 * Register your own SVG patterns here.
 *
 * Each entry maps a filename in `public/patterns/` to an animation type.
 * Supported animation types:
 *   - 'dots'     — each shape fades in with stagger
 *   - 'capsule'  — shapes grow from center along their longer axis
 *   - 'circle'   — pie-fill reveal
 *   - 'arrow'    — slides up into view
 *   - 'square'   — scales down from 1.6× to 1×
 *   - 'stripes'  — stripes slide in from the top, staggered
 *   - 'cross'    — scales down from 1.6× to 1×
 *
 * SVGs should be 40×40 px with a white background rect and black
 * foreground shapes. PatternGen recolors black→fg and white→bg
 * at runtime, so keep fills as literal "black" and "white".
 */
const PATTERN_FILES: { file: string; animType: PatternAnimType }[] = [
  // Example (uncomment after adding SVGs to public/patterns/):
  // { file: 'circle_fill.svg', animType: 'circle' },
  // { file: 'square.svg', animType: 'square' },
];

function isBgRect(el: Element): boolean {
  return (
    el.tagName === 'rect' &&
    el.getAttribute('fill') === 'white' &&
    el.getAttribute('width') === '40' &&
    el.getAttribute('height') === '40'
  );
}

function parseFloat0(v: string | null): number {
  return v ? parseFloat(v) : 0;
}

function parseTransformRotation(el: Element): { angle: number; ox: number; oy: number } {
  const tr = el.getAttribute('transform') || '';
  const m = tr.match(/rotate\(\s*([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)\s*\)/);
  if (m) return { angle: parseFloat(m[1]), ox: parseFloat(m[2]), oy: parseFloat(m[3]) };
  return { angle: 0, ox: 0, oy: 0 };
}

function extractShape(el: Element): SvgShapeInfo | null {
  const tag = el.tagName as 'rect' | 'circle' | 'path';
  const isStroked = el.getAttribute('stroke') !== null && el.getAttribute('stroke') !== 'none';
  const sw = parseFloat0(el.getAttribute('stroke-width'));
  const rot = parseTransformRotation(el);

  if (tag === 'rect') {
    const x = parseFloat0(el.getAttribute('x'));
    const y = parseFloat0(el.getAttribute('y'));
    const w = parseFloat0(el.getAttribute('width'));
    const h = parseFloat0(el.getAttribute('height'));
    const rx = parseFloat0(el.getAttribute('rx'));
    return {
      tag, x, y, w, h, rx,
      cx: x + w / 2,
      cy: y + h / 2,
      rotation: rot.angle,
      rotOriginX: rot.ox,
      rotOriginY: rot.oy,
      isStroked,
      strokeWidth: sw,
      stagger: Math.random(),
    };
  }
  if (tag === 'circle') {
    const cx = parseFloat0(el.getAttribute('cx'));
    const cy = parseFloat0(el.getAttribute('cy'));
    const r = parseFloat0(el.getAttribute('r'));
    return {
      tag, x: cx - r, y: cy - r, w: r * 2, h: r * 2, rx: r,
      cx, cy,
      rotation: 0, rotOriginX: 0, rotOriginY: 0,
      isStroked, strokeWidth: sw,
      stagger: Math.random(),
    };
  }
  return null;
}

function extractShapesFromSvg(svgText: string): SvgShapeInfo[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.documentElement;
  const shapes: SvgShapeInfo[] = [];

  const processChildren = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (child.tagName === 'defs') continue;
      if (isBgRect(child)) continue;
      if (child.tagName === 'g') {
        processChildren(child);
        continue;
      }
      const s = extractShape(child);
      if (s) shapes.push(s);
    }
  };
  processChildren(svg);
  return shapes;
}

export async function loadAllPatterns(): Promise<PatternDef[]> {
  const results: PatternDef[] = [];
  for (const { file, animType } of PATTERN_FILES) {
    try {
      const resp = await fetch(`/patterns/${file}`);
      if (!resp.ok) continue;
      const svgText = await resp.text();
      const shapes = extractShapesFromSvg(svgText);
      results.push({
        id: file.replace('.svg', ''),
        name: file.replace('.svg', '').replace(/_/g, ' '),
        svgText,
        animType,
        shapes,
      });
    } catch {
      // skip missing files silently
    }
  }
  return results;
}

export function colorizeSvgFg(svgText: string, fgColor: string): string {
  let result = svgText;
  result = result.replace(/fill="white"/g, 'fill="none"');
  result = result.replace(/fill="black"/g, `fill="${fgColor}"`);
  result = result.replace(/stroke="black"/g, `stroke="${fgColor}"`);
  return result;
}

export function colorizeSvg(svgText: string, colors: ColorPair): string {
  let result = svgText;
  result = result.replace(/fill="white"/g, `fill="${colors.bg}"`);
  result = result.replace(/fill="black"/g, `fill="${colors.fg}"`);
  result = result.replace(/stroke="black"/g, `stroke="${colors.fg}"`);
  return result;
}

const imageCache = new Map<string, HTMLImageElement>();

export function svgToImage(svgText: string): Promise<HTMLImageElement> {
  const key = svgText;
  if (imageCache.has(key)) return Promise.resolve(imageCache.get(key)!);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      imageCache.set(key, img);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    img.src = url;
  });
}

export function clearImageCache() {
  imageCache.clear();
}
