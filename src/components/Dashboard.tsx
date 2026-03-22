import { LayoutMode } from '../types';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Workspace from './Workspace';

interface DashboardProps {
  layoutMode: LayoutMode;
}

export default function Dashboard({ layoutMode }: DashboardProps) {
  const [activeMode, setActiveMode] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--color-navy-dark', '#f8fafc');
      document.documentElement.style.setProperty('color', '#0f172a');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--color-navy-dark', '#051033');
      document.documentElement.style.setProperty('color', '#ffffff');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[var(--color-navy-dark)] text-white transition-colors duration-300`}>
      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 glass-panel flex items-center justify-between px-6 z-30 sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveMode('home')}>
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold">K</div>
          <span className="font-semibold text-lg">Kreasi AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {layoutMode === 'mobile' && (
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-full hover:bg-white/10 transition md:hidden">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </header>

      <div className={`flex-1 flex ${layoutMode === 'desktop' ? 'flex-row' : 'flex-col'} overflow-hidden relative`}>
        {/* Desktop Sidebar */}
        {layoutMode === 'desktop' && (
          <div className="hidden md:flex flex-col w-28 lg:w-32 border-r border-white/10 glass-panel z-20 overflow-y-auto custom-scrollbar">
            <div className="py-4 px-2">
              <Sidebar activeMode={activeMode} onSelectMode={setActiveMode} />
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {layoutMode === 'mobile' && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 glass-panel border-b border-white/10 z-40 p-4 max-h-full overflow-y-auto"
          >
            <Sidebar activeMode={activeMode} onSelectMode={(mode) => {
              setActiveMode(mode);
              setIsMobileMenuOpen(false);
            }} />
          </motion.div>
        )}

        {/* Workspace */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <Workspace activeMode={activeMode} onSelectMode={setActiveMode} />
        </main>
      </div>
    </div>
  );
}
