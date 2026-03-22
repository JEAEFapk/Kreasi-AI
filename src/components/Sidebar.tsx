import { MODES } from '../lib/modes';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeMode: string;
  onSelectMode: (mode: string) => void;
}

export default function Sidebar({ activeMode, onSelectMode }: SidebarProps) {
  return (
    <nav className="space-y-1">
      <button
        onClick={() => onSelectMode('home')}
        className={`w-full flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl transition-all duration-300 relative group mb-4 ${
          activeMode === 'home' ? 'text-white' : 'text-blue-200/70 hover:text-white hover:bg-white/5'
        }`}
      >
        {activeMode === 'home' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-blue-600/20 rounded-xl border border-blue-500/30 glow-effect"
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <Icons.Home size={24} className={`relative z-10 ${activeMode === 'home' ? 'text-blue-400' : 'group-hover:text-blue-300'}`} />
        <span className="relative z-10 font-medium text-xs text-center">Beranda</span>
      </button>

      {MODES.map((mode) => {
        const IconComponent = (Icons as any)[mode.icon] || Icons.Box;
        const isActive = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={`w-full flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl transition-all duration-300 relative group ${
              isActive ? 'text-white' : 'text-blue-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-600/20 rounded-xl border border-blue-500/30 glow-effect"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <IconComponent size={24} className={`relative z-10 ${isActive ? 'text-blue-400' : 'group-hover:text-blue-300'}`} />
            <span className="relative z-10 font-medium text-xs text-center">{mode.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
