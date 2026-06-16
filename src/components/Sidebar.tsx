import React from 'react';
import { useStore } from '../store';
import { FIXED_COLORS } from '../types';
import { PatternTile } from './PatternTile';

const PATTERN_GAP = 20;
const PATTERN_SIZE = 40;
const PATTERN_COLS = 4;
const CONTENT_W = PATTERN_COLS * PATTERN_SIZE + (PATTERN_COLS - 1) * PATTERN_GAP;

export const Sidebar: React.FC = () => {
  const {
    patternDefs, enabledPatterns, togglePattern, selectAllPatterns, deselectAllPatterns,
    enabledColors, toggleColor,
    customColors, setCustomColor, addCustomColor, removeCustomColor,
    density, setDensity,
    proximity, setProximity,
    stagger, setStagger,
    showGrid, setShowGrid,
    theme, setTheme,
  } = useStore();

  const allSelected = patternDefs.length > 0 && patternDefs.every((d) => enabledPatterns.has(d.id));

  return (
    <aside style={styles.sidebar}>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>COLORS</div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {FIXED_COLORS.map((c) => (
            <div
              key={c}
              onClick={() => toggleColor(c)}
              style={{
                ...styles.colorSwatch,
                background: c,
                border: `2px solid ${c === '#000000' ? '#444' : '#ccc'}`,
              }}
            >
              <SelectedDot visible={enabledColors.includes(c)} inverted={c === '#FFFFFF'} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customColors.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="color"
                value={c}
                onChange={(e) => setCustomColor(i, e.target.value)}
                style={styles.colorPicker}
              />
              <div
                onClick={() => toggleColor(c)}
                style={{ ...styles.colorSwatch, background: c, width: 40, height: 40 }}
              >
                <SelectedDot visible={enabledColors.includes(c)} />
              </div>
              <button
                onClick={() => removeCustomColor(i)}
                style={styles.removeBtn}
                title="Remove color"
              >
                ×
              </button>
            </div>
          ))}
          {customColors.length < 3 && (
            <button onClick={addCustomColor} style={styles.addColorBtn}>
              + ADD COLOR
            </button>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          DENSITY <span style={styles.valueNum}>{density}</span>
        </div>
        <BarSlider value={density} max={20} onChange={setDensity} width={CONTENT_W} />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          PROXIMITY <span style={styles.valueNum}>{proximity}</span>
        </div>
        <BarSlider value={proximity} max={20} onChange={setProximity} width={CONTENT_W} />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          STAGGER <span style={styles.valueNum}>{stagger}</span>
        </div>
        <BarSlider value={stagger} max={5} min={0} onChange={setStagger} width={CONTENT_W} />
      </div>

      <div style={styles.section}>
        <div
          style={{ ...styles.sectionTitle, cursor: 'pointer', marginBottom: 0 }}
          onClick={() => setShowGrid(!showGrid)}
        >
          GRID <span style={styles.valueNum}>{showGrid ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      <div style={styles.section}>
        <div
          style={{ ...styles.sectionTitle, cursor: 'pointer', marginBottom: 0 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          THEME <span style={styles.valueNum}>{theme === 'dark' ? 'DARK' : 'LIGHT'}</span>
        </div>
      </div>

      {patternDefs.length > 0 && (
        <div style={styles.section}>
          <div
            style={{ ...styles.sectionTitle, cursor: 'pointer' }}
            onClick={() => { allSelected ? deselectAllPatterns() : selectAllPatterns(); }}
          >
            {allSelected ? 'DESELECT ALL' : 'SELECT ALL'}
          </div>
          <div style={{ ...styles.patternGrid, width: CONTENT_W }}>
            {patternDefs.map((def) => (
              <PatternTile
                key={def.id}
                def={def}
                enabled={enabledPatterns.has(def.id)}
                onToggle={() => togglePattern(def.id)}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

const SelectedDot: React.FC<{ visible: boolean; inverted?: boolean }> = ({ visible, inverted }) => (
  <div
    style={{
      ...styles.selectedDot,
      background: inverted ? '#ccc' : 'var(--swatch-dot)',
      transform: visible ? 'scale(1)' : 'scale(0)',
      opacity: visible ? 1 : 0,
      transition:
        'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease-out',
    }}
  />
);

const BarSlider: React.FC<{ value: number; max: number; min?: number; onChange: (v: number) => void; width: number }> = ({ value, max, min = 1, onChange, width }) => {
  const steps = [];
  for (let v = min === 0 ? 1 : min; v <= max; v++) steps.push(v);
  return (
    <div style={{ display: 'flex', gap: 3, cursor: 'pointer', width }}>
      {steps.map((v) => (
        <div
          key={v}
          className="bar-step"
          onClick={() => onChange(v)}
          style={{ flex: 1, height: 16, borderRadius: 2, background: v <= value ? 'var(--bar-filled)' : 'var(--bar-empty)' }}
        />
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 'fit-content',
    flexShrink: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
    alignSelf: 'flex-start',
  },
  section: {
    width: 'fit-content',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 600,
    color: 'var(--fg-strong)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    marginBottom: 12,
  },
  valueNum: {
    color: 'var(--muted-2)',
    opacity: 0.5,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 4,
    cursor: 'pointer',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: 'var(--swatch-dot)',
  },
  colorPicker: {
    width: 40,
    height: 40,
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    borderRadius: 4,
    background: 'transparent',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    fontSize: 20,
    cursor: 'pointer',
    padding: '0 4px',
    fontFamily: 'inherit',
  },
  addColorBtn: {
    background: 'none',
    border: '1px dashed var(--muted-3)',
    borderRadius: 4,
    color: 'var(--muted)',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    padding: '8px 12px',
    fontFamily: 'inherit',
  },
  patternGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(${PATTERN_COLS}, ${PATTERN_SIZE}px)`,
    gap: PATTERN_GAP,
  },
};
