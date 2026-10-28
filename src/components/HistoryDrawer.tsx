import React from 'react';
import { CalculationHistoryItem } from '../types/calculator';
import { History, Trash2, ArrowUpRight, Copy, Check } from 'lucide-react';

interface HistoryDrawerProps {
  history: CalculationHistoryItem[];
  onSelectResult: (val: number) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectResult,
  onClearHistory,
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (item: CalculationHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${item.expression} = ${item.result}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Histórico de Operações</h2>
              <p className="text-xs text-slate-400">
                {history.length} {history.length === 1 ? 'cálculo realizado' : 'cálculos realizados'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Limpar histórico"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-sm font-medium cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Lista de Cálculos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y-0">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-400">Nenhum cálculo registrado ainda</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Realize contas na calculadora para registrar as operações e o comando em Python executado.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectResult(item.result);
                  onClose();
                }}
                className="group p-3.5 rounded-2xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-amber-500/30 transition-all duration-150 cursor-pointer flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{item.expression} =</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(item, e)}
                      className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-slate-200"
                      title="Copiar cálculo"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-100 group-hover:text-amber-300 transition-colors">
                    {item.result}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                    <span>Reutilizar</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Código Python correspondente */}
                <div className="pt-1.5 mt-1 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500">Python:</span>
                  <span className="text-amber-400/80 font-medium truncate">{item.pythonStatement}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
