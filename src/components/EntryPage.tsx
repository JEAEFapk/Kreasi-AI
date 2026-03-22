import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Monitor } from 'lucide-react';
import { LayoutMode } from '../types';

interface EntryPageProps {
  onSelectMode: (mode: LayoutMode) => void;
}

export default function EntryPage({ onSelectMode }: EntryPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-navy-dark)] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Kreasi AI</h1>
        <p className="text-blue-200/80 text-lg max-w-md mx-auto">
          Bikin Visual Keren Dalam Sekejap dengan AI. Pilih mode tampilan Anda.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-6 z-10">
        <ModeCard
          icon={<Smartphone className="w-8 h-8" />}
          title="Mode Mobile"
          description="Tampilan vertikal untuk layar kecil"
          onClick={() => onSelectMode('mobile')}
        />
        <ModeCard
          icon={<Monitor className="w-8 h-8" />}
          title="Mode Desktop"
          description="Tampilan penuh dengan sidebar"
          onClick={() => onSelectMode('desktop')}
        />
      </div>
    </div>
  );
}

function ModeCard({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group relative w-64 p-6 rounded-2xl glass-panel text-left transition-all duration-300 hover:border-blue-400/50 hover:bg-blue-900/40"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 glow-effect pointer-events-none" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:text-blue-300 group-hover:bg-blue-500/30 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-sm text-blue-200/70">{description}</p>
      </div>
    </motion.button>
  );
}
