import React from 'react';
import { useStore } from '../store';

export const ExportProgress: React.FC = () => {
  const { exporting, exportProgress } = useStore();
  if (!exporting) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.label}>Exporting frames...</div>
        <div style={styles.barBg}>
          <div
            style={{
              ...styles.barFg,
              width: `${exportProgress * 100}%`,
            }}
          />
        </div>
        <div style={styles.percent}>{(exportProgress * 100).toFixed(0)}%</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#2a2a2a',
    borderRadius: 8,
    padding: '24px 32px',
    minWidth: 300,
    textAlign: 'center' as const,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    color: '#ddd',
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    background: '#444',
    overflow: 'hidden',
  },
  barFg: {
    height: '100%',
    background: '#ccc',
    borderRadius: 3,
    transition: 'width 0.1s',
  },
  percent: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
};
