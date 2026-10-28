/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { CalculatorKeypad } from './components/CalculatorKeypad';
import { HistoryDrawer } from './components/HistoryDrawer';
import { CodeModal } from './components/CodeModal';
import { pythonEngine } from './services/pythonEngine';
import { OperationType, CalculationHistoryItem, CalculatorState } from './types/calculator';
import { Code2, History, Terminal, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function App() {
  // Estado principal da Calculadora
  const [calcState, setCalcState] = useState<CalculatorState>({
    displayValue: '0',
    previousValue: null,
    currentOperation: null,
    waitingForNewOperand: false,
    lastExpression: '',
    error: null,
    activePythonCall: 'calc = Calculadora()',
  });

  // Histórico de cálculos
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);

  // Estados dos modais e preferências
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [engineStatus, setEngineStatus] = useState(pythonEngine.getStatus());

  // Atualiza status do motor Python periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setEngineStatus(pythonEngine.getStatus());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Inserção de dígitos (0 a 9)
  const handleDigit = useCallback((digit: string) => {
    setCalcState((prev) => {
      if (prev.error) {
        return {
          ...prev,
          displayValue: digit,
          error: null,
          waitingForNewOperand: false,
          activePythonCall: `entrada_digito('${digit}')`,
        };
      }

      if (prev.waitingForNewOperand) {
        return {
          ...prev,
          displayValue: digit,
          waitingForNewOperand: false,
          activePythonCall: `operando_b = ${digit}`,
        };
      }

      // Previne múltiplos zeros iniciais
      const newValue = prev.displayValue === '0' ? digit : prev.displayValue + digit;
      // Limite razoável de dígitos para evitar overflow visual
      if (newValue.replace('-', '').replace('.', '').length > 16) {
        return prev;
      }

      return {
        ...prev,
        displayValue: newValue,
        activePythonCall: `entrada = ${newValue}`,
      };
    });
  }, []);

  // Ponto decimal (.)
  const handleDecimal = useCallback(() => {
    setCalcState((prev) => {
      if (prev.error) {
        return {
          ...prev,
          displayValue: '0.',
          error: null,
          waitingForNewOperand: false,
          activePythonCall: 'ponto_flutuante = 0.0',
        };
      }

      if (prev.waitingForNewOperand) {
        return {
          ...prev,
          displayValue: '0.',
          waitingForNewOperand: false,
          activePythonCall: 'ponto_flutuante = 0.0',
        };
      }

      if (!prev.displayValue.includes('.')) {
        return {
          ...prev,
          displayValue: prev.displayValue + '.',
          activePythonCall: `ponto_flutuante = ${prev.displayValue}.`,
        };
      }

      return prev;
    });
  }, []);

  // Inverter sinal (+/-)
  const handleToggleSign = useCallback(() => {
    setCalcState((prev) => {
      if (prev.error || prev.displayValue === '0') return prev;

      let newValue: string;
      if (prev.displayValue.startsWith('-')) {
        newValue = prev.displayValue.substring(1);
      } else {
        newValue = '-' + prev.displayValue;
      }

      return {
        ...prev,
        displayValue: newValue,
        activePythonCall: `valor = -(${prev.displayValue})`,
      };
    });
  }, []);

  // Apagar último dígito (Backspace)
  const handleDeleteChar = useCallback(() => {
    setCalcState((prev) => {
      if (prev.error) {
        return { ...prev, error: null, displayValue: '0' };
      }
      if (prev.waitingForNewOperand) return prev;

      if (prev.displayValue.length <= 1 || (prev.displayValue.length === 2 && prev.displayValue.startsWith('-'))) {
        return {
          ...prev,
          displayValue: '0',
          activePythonCall: 'entrada = 0',
        };
      }

      const newValue = prev.displayValue.slice(0, -1);
      return {
        ...prev,
        displayValue: newValue,
        activePythonCall: `entrada = ${newValue}`,
      };
    });
  }, []);

  // Limpeza completa (AC)
  const handleClear = useCallback(() => {
    setCalcState({
      displayValue: '0',
      previousValue: null,
      currentOperation: null,
      waitingForNewOperand: false,
      lastExpression: '',
      error: null,
      activePythonCall: 'calc.limpar()',
    });
  }, []);

  // Seleção de operador (+, -, ×, ÷)
  const handleOperation = useCallback((op: OperationType) => {
    setCalcState((prev) => {
      const currentValNum = parseFloat(prev.displayValue);

      // Se já tínhamos uma operação pendente e o usuário digitou um novo número, resolvemos encadeado
      if (prev.previousValue !== null && prev.currentOperation && !prev.waitingForNewOperand) {
        // Dispara cálculo intermediário
        pythonEngine.executeOperation(prev.currentOperation, prev.previousValue, currentValNum).then((res) => {
          if (res.success && res.result !== undefined) {
            setCalcState((state) => ({
              ...state,
              previousValue: res.result!,
              displayValue: String(res.result),
              currentOperation: op,
              waitingForNewOperand: true,
              lastExpression: `${state.previousValue} ${state.currentOperation} ${currentValNum}`,
              activePythonCall: res.pythonStatement,
            }));
          } else {
            setCalcState((state) => ({
              ...state,
              error: res.error || 'Erro na operação.',
              activePythonCall: res.pythonStatement,
            }));
          }
        });

        return {
          ...prev,
          waitingForNewOperand: true,
          currentOperation: op,
        };
      }

      return {
        ...prev,
        previousValue: currentValNum,
        currentOperation: op,
        waitingForNewOperand: true,
        error: null,
        activePythonCall: `operacao_selecionada = '${op}'`,
      };
    });
  }, []);

  // Execução do cálculo (=)
  const handleEquals = useCallback(async () => {
    if (calcState.previousValue === null || !calcState.currentOperation) {
      return;
    }

    const a = calcState.previousValue;
    const b = parseFloat(calcState.displayValue);
    const op = calcState.currentOperation;

    const res = await pythonEngine.executeOperation(op, a, b);

    if (res.success && res.result !== undefined) {
      const expression = `${a} ${op} ${b}`;
      const newHistoryItem: CalculationHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        operation: op,
        operandA: a,
        operandB: b,
        result: res.result,
        expression,
        timestamp: new Date(),
        pythonStatement: res.pythonStatement,
        executionEngine: res.engineUsed,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]); // Guarda até 50 cálculos

      setCalcState({
        displayValue: String(res.result),
        previousValue: null,
        currentOperation: null,
        waitingForNewOperand: true,
        lastExpression: `${expression} = ${res.result}`,
        error: null,
        activePythonCall: res.pythonStatement,
      });
    } else {
      setCalcState((prev) => ({
        ...prev,
        error: res.error || 'Erro Matemático',
        previousValue: null,
        currentOperation: null,
        waitingForNewOperand: true,
        activePythonCall: `raise ${res.error?.includes('zero') ? 'DivisaoPorZeroError' : 'CalculadoraError'}()`,
      }));
    }
  }, [calcState]);

  // Reutiliza valor do histórico
  const handleSelectHistoryResult = (val: number) => {
    setCalcState((prev) => ({
      ...prev,
      displayValue: String(val),
      waitingForNewOperand: false,
      error: null,
      activePythonCall: `valor_reutilizado = ${val}`,
    }));
  };

  // Suporte a teclado físico do computador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em um input ou textarea (caso exista)
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperation('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperation('-');
      } else if (e.key === '*' || e.key === 'x') {
        e.preventDefault();
        handleOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteChar();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDecimal, handleOperation, handleEquals, handleDeleteChar, handleClear]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Barra de Navegação Superior */}
      <TopNav
        onOpenCode={() => setIsCodeModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        engineName={engineStatus.engineName}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna Central: Chassi da Calculadora (Design Tátil e Ergonomia) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-[2.5rem] p-5 sm:p-7 shadow-2xl shadow-black/80 relative">
              {/* Luz ambiente de chassi */}
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-30 pointer-events-none" />

              {/* Visor Digital Tabular */}
              <CalculatorDisplay
                currentValue={calcState.displayValue}
                previousValue={calcState.previousValue}
                operation={calcState.currentOperation}
                lastExpression={calcState.lastExpression}
                error={calcState.error}
                activePythonCall={calcState.activePythonCall}
              />

              {/* Teclado Físico Tátil */}
              <CalculatorKeypad
                onDigit={handleDigit}
                onOperation={handleOperation}
                onEquals={handleEquals}
                onClear={handleClear}
                onDeleteChar={handleDeleteChar}
                onToggleSign={handleToggleSign}
                onDecimal={handleDecimal}
                activeOperation={calcState.currentOperation}
                soundEnabled={soundEnabled}
              />

              {/* Rodapé sutil de atalhos e motor */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>{engineStatus.engineName}</span>
                </span>
                <span className="hidden sm:inline text-slate-400">
                  Teclado ativo [0-9, +, -, *, /, Enter]
                </span>
              </div>
            </div>
          </div>

          {/* Coluna Lateral: Resumo de Histórico e Painel de Estudos (Desktop Presence) */}
          <div className="lg:col-span-5 flex flex-col gap-5 w-full">
            
            {/* Card de Boas-Vindas aos Estudos de Software & IA */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Ambiente de Aprendizado
                </h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Esta aplicação foi construída com foco nos seus estudos de <strong>Engenharia de Software</strong> e <strong>IA</strong>. As 4 operações aritméticas fundamentais (+, -, ×, ÷) são processadas por uma arquitetura em <strong>Python 3 puro</strong> com classes, tipagem forte (<code className="text-amber-400 font-mono">Type Hints</code>) e tratamento defensivo de erros.
              </p>
              
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Arquivo: <code className="text-slate-300">src/python/calculator.py</code>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCodeModalOpen(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Explorar Código</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Painel de Histórico Rápido de Sessão */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-slate-100">Últimos Cálculos</h3>
                </div>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(true)}
                    className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
                  >
                    Ver todos ({history.length})
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Faça sua primeira operação na calculadora ao lado.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {history.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryResult(item.result)}
                      className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/60 transition-all cursor-pointer flex items-center justify-between group"
                      title="Clique para reutilizar o valor"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-400">
                          {item.expression} =
                        </span>
                        <span className="text-base font-bold font-mono tabular-nums text-slate-100 group-hover:text-amber-300 transition-colors">
                          {item.result}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400/80 opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.pythonStatement}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chamada para o Terminal / Testes */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span>14 testes unitários automatizados</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCodeModalOpen(true)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                Inspecionar
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Drawer / Modal de Histórico Completo */}
      <HistoryDrawer
        history={history}
        onSelectResult={handleSelectHistoryResult}
        onClearHistory={() => setHistory([])}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Modal de Inspeção do Código Python & Guia Didático */}
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
