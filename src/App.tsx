import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EntryPage from './components/EntryPage';
import Dashboard from './components/Dashboard';
import { AppState, LayoutMode } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>('entry');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('desktop');

  const handleSelectMode = (mode: LayoutMode) => {
    setLayoutMode(mode);
    setAppState('dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--color-navy-dark)] text-white font-sans overflow-x-hidden">
      <AnimatePresence mode="wait">
        {appState === 'entry' ? (
          <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            <EntryPage onSelectMode={handleSelectMode} />
          </motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            <Dashboard layoutMode={layoutMode} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
