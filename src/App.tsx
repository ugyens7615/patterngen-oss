import React, { useEffect } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { CanvasView } from './components/CanvasView';
import { Sidebar } from './components/Sidebar';
import { ExportProgress } from './components/ExportProgress';

const App: React.FC = () => {
  const init = useStore((s) => s.init);
  const loading = useStore((s) => s.loadingPatterns);
  const theme = useStore((s) => s.theme);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted-3)', fontSize: 24 }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.headerCell}><Header /></div>
      <div style={styles.canvasCell}><CanvasView /></div>
      <div style={styles.sidebarCell}><Sidebar /></div>
      <ExportProgress />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridTemplateRows: 'auto 1fr',
    columnGap: 40,
    rowGap: 40,
    padding: 40,
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: 'var(--bg)',
  },
  headerCell: {
    gridColumn: 1,
    gridRow: 1,
    minWidth: 0,
  },
  canvasCell: {
    gridColumn: 1,
    gridRow: 2,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
  },
  sidebarCell: {
    gridColumn: 2,
    gridRow: 2,
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: 0,
  },
};

export default App;
