import React from 'react';
import { Delete } from 'lucide-react';
import { OperationType } from '../types/calculator';

interface CalculatorKeypadProps {
  onDigit: (digit: string) => void;
  onOperation: (op: OperationType) => void;
  onEquals: () => void;
  onClear: () => void;
  onDeleteChar: () => void;
  onToggleSign: () => void;
  onDecimal: () => void;
  activeOperation: OperationType | null;
  soundEnabled: boolean;
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  onDigit,
  onOperation,
  onEquals,
  onClear,
  onDeleteChar,
  onToggleSign,
  onDecimal,
  activeOperation,
  soundEnabled,
}) => {
  // Síntese acústica ultra-sutil de clique tátil usando a Web Audio API
  const playTactileClick = (frequency = 600) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch {
      // Ignora silenciosamente se o contexto de áudio estiver bloqueado
    }
  };

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // Fallback suave
      }
    }
  };

  const handlePress = (action: () => void, soundFreq = 500) => {
    triggerHaptic();
    playTactileClick(soundFreq);
    action();
  };

  // Botão numérico padrão
  const NumberButton = ({ digit, span = '' }: { digit: string; span?: string }) => (
    <button
      type="button"
      onClick={() => handlePress(() => onDigit(digit), 480)}
      className={`${span} min-h-[58px] sm:min-h-[64px] rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600/90 text-slate-100 font-mono text-xl sm:text-2xl font-semibold border border-slate-700/50 shadow-sm shadow-black/40 active:scale-[0.95] active:shadow-none transition-all duration-150 cursor-pointer flex items-center justify-center select-none`}
    >
      {digit}
    </button>
  );

  // Botão de operador (+, -, ×, ÷)
  const OperatorButton = ({ op, symbol }: { op: OperationType; symbol: string }) => {
    const isActive = activeOperation === op;
    return (
      <button
        type="button"
        onClick={() => handlePress(() => onOperation(op), 650)}
        className={`min-h-[58px] sm:min-h-[64px] rounded-2xl font-mono text-2xl font-semibold border transition-all duration-150 cursor-pointer flex items-center justify-center select-none ${
          isActive
            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30 scale-[0.98]'
            : 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 border-amber-400 shadow-sm shadow-amber-900/40 active:scale-[0.95]'
        }`}
      >
        {symbol}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full">
      {/* Linha 1: Limpeza e Funções Auxiliares */}
      <button
        type="button"
        onClick={() => handlePress(onClear, 400)}
        className="min-h-[58px] sm:min-h-[64px] rounded-2xl bg-slate-700/70 hover:bg-slate-600/80 active:bg-slate-500/90 text-amber-300 font-mono text-lg sm:text-xl font-bold border border-slate-600/60 shadow-sm shadow-black/40 active:scale-[0.95] transition-all duration-150 cursor-pointer flex items-center justify-center select-none"
      >
        AC
      </button>

      <button
        type="button"
        onClick={() => handlePress(onDeleteChar, 420)}
        className="min-h-[58px] sm:min-h-[64px] rounded-2xl bg-slate-700/70 hover:bg-slate-600/80 active:bg-slate-500/90 text-slate-200 border border-slate-600/60 shadow-sm shadow-black/40 active:scale-[0.95] transition-all duration-150 cursor-pointer flex items-center justify-center select-none"
        title="Apagar último dígito (Backspace)"
      >
        <Delete className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={() => handlePress(onToggleSign, 440)}
        className="min-h-[58px] sm:min-h-[64px] rounded-2xl bg-slate-700/70 hover:bg-slate-600/80 active:bg-slate-500/90 text-slate-200 font-mono text-lg sm:text-xl font-semibold border border-slate-600/60 shadow-sm shadow-black/40 active:scale-[0.95] transition-all duration-150 cursor-pointer flex items-center justify-center select-none"
        title="Inverter sinal (+/-)"
      >
        ±
      </button>

      <OperatorButton op="÷" symbol="÷" />

      {/* Linha 2: 7, 8, 9, × */}
      <NumberButton digit="7" />
      <NumberButton digit="8" />
      <NumberButton digit="9" />
      <OperatorButton op="×" symbol="×" />

      {/* Linha 3: 4, 5, 6, - */}
      <NumberButton digit="4" />
      <NumberButton digit="5" />
      <NumberButton digit="6" />
      <OperatorButton op="-" symbol="−" />

      {/* Linha 4: 1, 2, 3, + */}
      <NumberButton digit="1" />
      <NumberButton digit="2" />
      <NumberButton digit="3" />
      <OperatorButton op="+" symbol="+" />

      {/* Linha 5: 0, ., = */}
      <NumberButton digit="0" span="col-span-2" />

      <button
        type="button"
        onClick={() => handlePress(onDecimal, 490)}
        className="min-h-[58px] sm:min-h-[64px] rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600/90 text-slate-100 font-mono text-2xl font-bold border border-slate-700/50 shadow-sm shadow-black/40 active:scale-[0.95] transition-all duration-150 cursor-pointer flex items-center justify-center select-none"
      >
        .
      </button>

      <button
        type="button"
        onClick={() => handlePress(onEquals, 720)}
        className="min-h-[58px] sm:min-h-[64px] rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 text-slate-950 font-mono text-2xl font-bold border border-amber-300 shadow-md shadow-amber-500/20 active:scale-[0.95] transition-all duration-150 cursor-pointer flex items-center justify-center select-none"
        title="Calcular resultado (= ou Enter)"
      >
        =
      </button>
    </div>
  );
};
