import { create } from 'zustand';
import type {
  TitleElement,
  PatternElement,
  SquareElement,
  DotElement,
  PatternDef,
  ColorPair,
} from './types';
import { FIXED_COLORS, DEFAULT_CUSTOM_COLORS } from './types';
import type { EasingName } from './engine/easing';
import { loadAllPatterns } from './core/patterns';
import { generatePlacement } from './core/placement';
import { generatePalette } from './core/colors';
import { mulberry32, randomSeed } from './core/rng';

interface SavedTitle {
  id: string;
  dataUrl: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SavedScene {
  sceneName?: string;
  seed?: number;
  titles: SavedTitle[];
  patterns?: PatternElement[];
  squares?: SquareElement[];
  dots?: DotElement[];
  durationMs: number;
  easing: EasingName;
  density: number;
  proximity: number;
  stagger: number;
  theme: 'dark' | 'light';
  enabledColors: string[];
  customColors?: string[];
  enabledPatterns?: string[];
}

function imgToDataUrl(img: HTMLImageElement, displayW: number, displayH: number): string {
  const c = document.createElement('canvas');
  c.width = displayW;
  c.height = displayH;
  c.getContext('2d')!.drawImage(img, 0, 0, displayW, displayH);
  return c.toDataURL('image/png');
}

function dataUrlToImg(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

interface AppState {
  patternDefs: PatternDef[];
  patternDefsMap: Map<string, PatternDef>;
  enabledPatterns: Set<string>;
  loadingPatterns: boolean;

  titles: TitleElement[];
  patterns: PatternElement[];
  squares: SquareElement[];
  dots: DotElement[];

  sceneName: string;
  seed: number;
  durationMs: number;
  easing: EasingName;
  density: number;
  proximity: number;
  stagger: number;
  showGrid: boolean;
  theme: 'dark' | 'light';

  enabledColors: string[];
  customColors: string[];

  bgImage: HTMLImageElement | null;
  bgImageDataUrl: string | null;

  logoColors: ColorPair[];

  playing: boolean;
  elapsedMs: number;

  exporting: boolean;
  exportProgress: number;

  init: () => Promise<void>;
  togglePattern: (id: string) => void;
  selectAllPatterns: () => void;
  deselectAllPatterns: () => void;
  toggleColor: (color: string) => void;
  setCustomColor: (index: number, color: string) => void;
  addCustomColor: () => void;
  removeCustomColor: (index: number) => void;
  setSceneName: (name: string) => void;
  setSeed: (seed: number) => void;
  setDuration: (ms: number) => void;
  setEasing: (e: EasingName) => void;
  setDensity: (d: number) => void;
  setProximity: (p: number) => void;
  setStagger: (s: number) => void;
  setShowGrid: (v: boolean) => void;
  setTheme: (t: 'dark' | 'light') => void;
  addTitle: (img: HTMLImageElement, x: number, y: number, w: number, h: number) => void;
  moveTitle: (id: string, x: number, y: number) => void;
  removeTitle: (id: string) => void;
  generate: (seed?: number) => void;
  setPlaying: (p: boolean) => void;
  setElapsedMs: (ms: number) => void;
  setExporting: (e: boolean) => void;
  setExportProgress: (p: number) => void;
  saveSceneToFile: () => void;
  loadSceneFromFile: () => void;
  setBgImage: (img: HTMLImageElement, dataUrl: string) => void;
  clearBgImage: () => void;
}

let idCounter = 0;
const nextId = () => `el_${++idCounter}`;

export const useStore = create<AppState>((set, get) => ({
  patternDefs: [],
  patternDefsMap: new Map(),
  enabledPatterns: new Set(),
  loadingPatterns: true,

  titles: [],
  patterns: [],
  squares: [],
  dots: [],

  sceneName: 'scene',
  seed: randomSeed(),
  durationMs: 6000,
  easing: 'easeOutCubic',
  density: 10,
  proximity: 2,
  stagger: 3,
  showGrid: true,
  theme: 'dark',

  enabledColors: [...FIXED_COLORS],
  customColors: [...DEFAULT_CUSTOM_COLORS],

  bgImage: null,
  bgImageDataUrl: null,

  logoColors: [],

  playing: false,
  elapsedMs: 0,

  exporting: false,
  exportProgress: 0,

  async init() {
    const defs = await loadAllPatterns();
    const defsMap = new Map(defs.map((d) => [d.id, d]));
    const allIds = new Set(defs.map((d) => d.id));
    set({ patternDefs: defs, patternDefsMap: defsMap, enabledPatterns: allIds, loadingPatterns: false });
  },

  togglePattern(id) {
    set((s) => {
      const next = new Set(s.enabledPatterns);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { enabledPatterns: next };
    });
  },

  selectAllPatterns() {
    set((s) => ({ enabledPatterns: new Set(s.patternDefs.map((d) => d.id)) }));
  },

  deselectAllPatterns() {
    set({ enabledPatterns: new Set() });
  },

  toggleColor(color) {
    set((s) => {
      const next = s.enabledColors.includes(color)
        ? s.enabledColors.filter((c) => c !== color)
        : [...s.enabledColors, color];
      return { enabledColors: next };
    });
  },

  setCustomColor(index, color) {
    set((s) => {
      const next = [...s.customColors];
      next[index] = color;
      const wasEnabled = s.enabledColors.includes(s.customColors[index]);
      let enabledNext = s.enabledColors.filter((c) => c !== s.customColors[index]);
      if (wasEnabled) enabledNext = [...enabledNext, color];
      return { customColors: next, enabledColors: enabledNext };
    });
  },

  addCustomColor() {
    set((s) => {
      if (s.customColors.length >= 3) return {};
      const newColor = '#808080';
      return {
        customColors: [...s.customColors, newColor],
        enabledColors: [...s.enabledColors, newColor],
      };
    });
  },

  removeCustomColor(index) {
    set((s) => {
      const removed = s.customColors[index];
      const next = s.customColors.filter((_, i) => i !== index);
      return {
        customColors: next,
        enabledColors: s.enabledColors.filter((c) => c !== removed),
      };
    });
  },

  setSceneName(name) { set({ sceneName: name }); },
  setSeed(seed) { set({ seed }); },
  setDuration(ms) { set({ durationMs: ms }); },
  setEasing(e) { set({ easing: e }); },
  setDensity(d) { set({ density: d }); },
  setProximity(p) { set({ proximity: p }); },
  setStagger(s) { set({ stagger: s }); },
  setShowGrid(v) { set({ showGrid: v }); },
  setTheme(t) {
    set({ theme: t });
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = t;
    }
  },

  addTitle(img, x, y, w, h) {
    set((s) => ({ titles: [...s.titles, { id: nextId(), img, x, y, w, h }] }));
  },

  moveTitle(id, x, y) {
    set((s) => ({ titles: s.titles.map((t) => (t.id === id ? { ...t, x, y } : t)) }));
  },

  removeTitle(id) {
    set((s) => ({ titles: s.titles.filter((t) => t.id !== id) }));
  },

  generate(seed) {
    const s = get();
    const useSeed = seed !== undefined ? seed : randomSeed();
    const rand = mulberry32(useSeed);
    const enabledDefs = s.patternDefs.filter((d) => s.enabledPatterns.has(d.id));
    const { patterns, squares, dots } = generatePlacement(
      s.titles, enabledDefs, s.enabledColors, s.density, s.proximity, rand,
    );
    const palette = generatePalette(s.enabledColors);
    const logoColors: ColorPair[] = [];
    for (let i = 0; i < 3; i++) {
      logoColors.push(palette.length > 0 ? palette[Math.floor(rand() * palette.length)] : { bg: '#404040', fg: '#888888' });
    }
    set({ seed: useSeed, patterns, squares, dots, logoColors, elapsedMs: 3 * s.durationMs, playing: false });
  },

  setPlaying(p) { set({ playing: p }); },
  setElapsedMs(ms) { set({ elapsedMs: ms }); },
  setExporting(e) { set({ exporting: e }); },
  setExportProgress(p) { set({ exportProgress: p }); },

  setBgImage(img, dataUrl) { set({ bgImage: img, bgImageDataUrl: dataUrl }); },
  clearBgImage() { set({ bgImage: null, bgImageDataUrl: null }); },

  saveSceneToFile() {
    try {
      const s = get();
      const saved: SavedScene = {
        sceneName: s.sceneName,
        seed: s.seed,
        titles: s.titles.map((t) => ({
          id: t.id, dataUrl: imgToDataUrl(t.img, t.w, t.h), x: t.x, y: t.y, w: t.w, h: t.h,
        })),
        durationMs: s.durationMs,
        easing: s.easing,
        density: s.density,
        proximity: s.proximity,
        stagger: s.stagger,
        theme: s.theme,
        enabledColors: s.enabledColors,
        customColors: s.customColors,
        enabledPatterns: Array.from(s.enabledPatterns),
      };
      const json = JSON.stringify(saved, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${s.sceneName || 'scene'}_patterngen.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Save failed:', e);
    }
  },

  loadSceneFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const saved: SavedScene = JSON.parse(text);
        const titles: TitleElement[] = [];
        for (const st of saved.titles) {
          const img = await dataUrlToImg(st.dataUrl);
          titles.push({ id: st.id, img, x: st.x, y: st.y, w: st.w, h: st.h });
        }
        const maxId = titles.length > 0
          ? Math.max(...titles.map((t) => parseInt(t.id.replace('el_', '')) || 0))
          : 0;
        idCounter = Math.max(idCounter, maxId);
        const allPatternIds = get().patternDefs.map((d) => d.id);
        const seed = saved.seed ?? randomSeed();
        set({
          sceneName: saved.sceneName ?? 'scene',
          seed,
          titles,
          patterns: saved.patterns ?? [],
          squares: saved.squares ?? [],
          dots: saved.dots ?? [],
          durationMs: saved.durationMs ?? 6000,
          easing: saved.easing ?? 'easeOutCubic',
          density: saved.density ?? 10,
          proximity: saved.proximity ?? 2,
          stagger: saved.stagger ?? 3,
          theme: saved.theme ?? 'dark',
          enabledColors: saved.enabledColors ?? [...FIXED_COLORS],
          customColors: saved.customColors ?? [...DEFAULT_CUSTOM_COLORS],
          enabledPatterns: new Set(
            saved.enabledPatterns !== undefined ? saved.enabledPatterns : allPatternIds,
          ),
        });
        if (typeof document !== 'undefined') {
          document.documentElement.dataset.theme = saved.theme ?? 'dark';
        }

        const noPlacement =
          (saved.patterns?.length ?? 0) === 0 &&
          (saved.squares?.length ?? 0) === 0 &&
          (saved.dots?.length ?? 0) === 0;
        if (noPlacement && titles.length > 0) {
          get().generate(seed);
        }
      } catch (e) {
        console.error('Load failed:', e);
      }
    };
    input.click();
  },
}));
