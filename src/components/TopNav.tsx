import React from 'react';
import { Code2, History, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface TopNavProps {
  onOpenCode: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  engineName: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenCode,
  onOpenHistory,
  historyCount,
  soundEnabled,
  onToggleSound,
  engineName,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold text-base shadow-sm shadow-amber-500/20">
            π
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap">
            Calculadora Python
          </span>
        </div>

        {/* Zone 2: Navigation Actions (Single line) */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={onOpenHistory}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
          >
            <History className="w-4 h-4" />
            <span>Histórico</span>
            {historyCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                {historyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCode}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
          >
            <Code2 className="w-4 h-4" />
            <span>Código & Estudos</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
            title={soundEnabled ? 'Desativar som de clique' : 'Ativar feedback acústico'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCode}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl transition-all shadow-sm shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Código Python</span>
            <span className="sm:hidden">Código</span>
          </button>
        </div>
      </div>
    </header>
  );
};
