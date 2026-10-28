/**
 * Definições de Tipos para a Calculadora Python
 * Focado em clareza, tipagem estrita e documentação para aprendizado.
 */

export type OperationType = '+' | '-' | '×' | '÷';

export interface CalculationHistoryItem {
  id: string;
  operation: OperationType;
  operandA: number;
  operandB: number;
  result: number;
  expression: string;
  timestamp: Date;
  pythonStatement: string; // Ex: "calc.dividir(50, 4)"
  executionEngine: 'Python 3 (WebAssembly)' | 'Python 3 (Local)';
}

export interface CalculatorState {
  displayValue: string;
  previousValue: number | null;
  currentOperation: OperationType | null;
  waitingForNewOperand: boolean;
  lastExpression: string;
  error: string | null;
  activePythonCall: string | null;
}

export interface PythonExecutionResult {
  success: boolean;
  result?: number;
  error?: string;
  pythonStatement: string;
  executionTimeMs: number;
  engineUsed: 'Python 3 (WebAssembly)' | 'Python 3 (Local)';
}
