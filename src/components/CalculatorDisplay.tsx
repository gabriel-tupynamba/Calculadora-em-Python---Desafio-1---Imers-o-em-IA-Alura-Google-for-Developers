import React from 'react';
import { OperationType } from '../types/calculator';

interface CalculatorDisplayProps {
  currentValue: string;
  previousValue: number | null;
  operation: OperationType | null;
  lastExpression: string;
  error: string | null;
  activePythonCall: string | null;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  currentValue,
  previousValue,
  operation,
  lastExpression,
  error,
  activePythonCall,
}) => {
  // Ajuste dinâmico de tamanho de fonte baseado no comprimento do número
  const getFontSizeClass = (text: string) => {
    const len = text.length;
    if (len > 14) return 'text-2xl sm:text-3xl';
    if (len > 10) return 'text-3xl sm:text-4xl';
    if (len > 7) return 'text-4xl sm:text-5xl';
    return 'text-5xl sm:text-6xl';
  };

  // Expressão superior em progresso
  const renderFormula = () => {
    if (error) {
      return <span className="text-rose-400 font-mono text-sm">Erro Matemático</span>;
    }
    if (previousValue !== null && operation) {
      return (
        <span className="text-slate-400 font-mono text-sm sm:text-base flex items-center justify-end gap-1.5">
          <span>{previousValue}</span>
          <span className="text-amber-400 font-bold">{operation}</span>
        </span>
      );
    }
    if (lastExpression) {
      return (
        <span className="text-slate-500 font-mono text-xs sm:text-sm truncate">
          {lastExpression}
        </span>
      );
    }
    return <span className="text-slate-600 text-xs font-mono">Python 3 Arithmetics</span>;
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-950/80 border border-slate-800/80 p-5 sm:p-6 mb-4 flex flex-col justify-between overflow-hidden shadow-inner">
      {/* Luz ambiente de destaque no topo do visor */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none" />

      {/* Linha superior: Expressão atual ou última fórmula calculada */}
      <div className="h-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
          <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase font-mono">
            {error ? 'Exception' : 'Ready'}
          </span>
        </div>
        <div className="text-right truncate">{renderFormula()}</div>
      </div>

      {/* Valor principal em exibição */}
      <div className="my-3 min-h-[4.5rem] flex items-end justify-end overflow-x-auto scrollbar-none select-all">
        {error ? (
          <div className="text-right">
            <span className="text-rose-400 font-semibold text-xl sm:text-2xl tracking-tight block">
              {error}
            </span>
            <span className="text-slate-500 text-xs font-mono mt-1 block">
              Pressione [AC] para reiniciar
            </span>
          </div>
        ) : (
          <span
            className={`font-mono font-bold tracking-tight text-slate-50 tabular-nums transition-all duration-150 ${getFontSizeClass(
              currentValue
            )}`}
          >
            {currentValue}
          </span>
        )}
      </div>

      {/* Linha inferior de inspeção: Mostra a chamada real em Python sendo executada */}
      <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="text-slate-500">Exec:</span>
        <span className="text-amber-300/90 truncate max-w-[280px]">
          {activePythonCall || 'Calculadora()'}
        </span>
      </div>
    </div>
  );
};
