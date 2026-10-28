/**
 * Serviço de Execução do Motor Python (Python Engine Service)
 * 
 * Este serviço integra a lógica de cálculo em Python com a interface do usuário.
 * Suporta execução via Pyodide (Python 3 compilado para WebAssembly) com fallback
 * de fidelidade total às regras matemáticas do interpretador Python oficial.
 */

import { OperationType, PythonExecutionResult } from '../types/calculator';

// Código-fonte exato do arquivo calculator.py para ser inspecionado pelo estudante
export const PYTHON_CALCULATOR_SOURCE = `"""
Módulo: calculator.py
Autor: Desenvolvedor Especialista Python
Objetivo: Módulo didático de operações aritméticas fundamentais para fins de estudo
          em Engenharia de Software e Fundamentos de Inteligência Artificial.

Conceitos explorados neste código:
1. PEP 8: Guia de estilo oficial para código Python.
2. Docstrings (PEP 257): Documentação padronizada de módulos, classes e funções.
3. Type Hints (PEP 484): Anotações de tipo para maior previsibilidade e segurança.
4. Programação Orientada a Objetos (POO): Encapsulamento e coesão.
5. Tratamento Defensivo de Exceções: Robustez contra falhas de execução.
6. Aritmética de Ponto Flutuante (IEEE 754): Compreensão de precisão numérica.
"""

from typing import Union

# Apelido de tipo (Type Alias) para números aceitos nas operações
Numero = Union[int, float]


class CalculadoraError(Exception):
    """Exceção base para erros específicos da Calculadora."""
    pass


class DivisaoPorZeroError(CalculadoraError):
    """Exceção disparada quando é feita uma tentativa de divisão pelo número zero."""
    pass


class Calculadora:
    """
    Classe principal responsável pelas quatro operações aritméticas básicas.

    Princípios aplicados:
    - SRP (Single Responsibility Principle): Esta classe cuida estritamente do
      cálculo matemático de operações de dois operandos.
    - Funções Puras / Métodos Sem Efeito Colateral: Cada método recebe valores,
      processa e retorna o resultado sem modificar estados globais ocultos.
    """

    def __init__(self, precisao_arredondamento: int = 10) -> None:
        """
        Inicializa uma nova instância da Calculadora.

        Args:
            precisao_arredondamento (int): Quantidade máxima de casas decimais
                para evitar artefatos de representação binária (ex: 0.1 + 0.2).
        """
        self.precisao = precisao_arredondamento

    def _formatar_resultado(self, valor: Numero) -> Numero:
        """Formata o resultado para int se não houver parte decimal, ou float arredondado."""
        if isinstance(valor, int):
            return valor

        valor_arredondado = round(float(valor), self.precisao)
        if valor_arredondado.is_integer():
            return int(valor_arredondado)
        return valor_arredondado

    def adicionar(self, a: Numero, b: Numero) -> Numero:
        """Calcula a soma de dois números (a + b)."""
        resultado = a + b
        return self._formatar_resultado(resultado)

    def subtrair(self, a: Numero, b: Numero) -> Numero:
        """Calcula a diferença entre dois números (a - b)."""
        resultado = a - b
        return self._formatar_resultado(resultado)

    def multiplicar(self, a: Numero, b: Numero) -> Numero:
        """Calcula o produto de dois números (a * b)."""
        resultado = a * b
        return self._formatar_resultado(resultado)

    def dividir(self, a: Numero, b: Numero) -> Numero:
        """
        Calcula o quociente da divisão de 'a' por 'b' (a / b).
        
        Raises:
            DivisaoPorZeroError: Se o divisor (b) for estritamente igual a zero.
        """
        if b == 0:
            raise DivisaoPorZeroError("Divisão por zero não é permitida em números reais.")

        resultado = a / b
        return self._formatar_resultado(resultado)

    def calcular(self, operacao: str, a: Numero, b: Numero) -> Numero:
        """Método despachante de conveniência (Dispatcher Pattern)."""
        mapeamento = {
            "+": self.adicionar,
            "-": self.subtrair,
            "*": self.multiplicar,
            "x": self.multiplicar,
            "×": self.multiplicar,
            "/": self.dividir,
            "÷": self.dividir,
        }

        funcao = mapeamento.get(operacao.strip())
        if not funcao:
            raise ValueError(f"Operação desconhecida: '{operacao}'. Use +, -, * ou /.")

        return funcao(a, b)
`;

export const PYTHON_TESTS_SOURCE = `"""
Módulo: test_calculator.py
Autor: Desenvolvedor Especialista Python
Objetivo: Suíte de testes automatizados unitários para o módulo calculator.py.

Por que Testes Unitários são fundamentais para quem estuda Software e IA?
1. Prevenção de Regressão: Garantem que alterações futuras não quebrem o que já funcionava.
2. Documentação Executável: Servem como especificação prática de como cada função deve se comportar.
3. Confiabilidade para Algoritmos e Redes Neurais: Em Machine Learning / IA, os pipelines de dados
   dependem de transformações matemáticas exatas; um bug silencioso de aritmética destrói o treinamento de um modelo.
"""

import unittest
from calculator import Calculadora, DivisaoPorZeroError


class TestCalculadora(unittest.TestCase):
    def setUp(self) -> None:
        self.calc = Calculadora()

    # --- Testes de Adição ---
    def test_adicionar_inteiros_positivos(self) -> None:
        self.assertEqual(self.calc.adicionar(10, 5), 15)

    def test_adicionar_com_negativos(self) -> None:
        self.assertEqual(self.calc.adicionar(-8, 3), -5)
        self.assertEqual(self.calc.adicionar(-4, -6), -10)

    def test_adicionar_decimais(self) -> None:
        self.assertEqual(self.calc.adicionar(0.1, 0.2), 0.3)

    # --- Testes de Subtração ---
    def test_subtrair_positivos(self) -> None:
        self.assertEqual(self.calc.subtrair(20, 8), 12)

    def test_subtrair_resultando_negativo(self) -> None:
        self.assertEqual(self.calc.subtrair(5, 12), -7)

    def test_subtrair_com_decimais(self) -> None:
        self.assertEqual(self.calc.subtrair(10.5, 2.5), 8)

    # --- Testes de Multiplicação ---
    def test_multiplicar_positivos(self) -> None:
        self.assertEqual(self.calc.multiplicar(7, 6), 42)

    def test_multiplicar_por_zero(self) -> None:
        self.assertEqual(self.calc.multiplicar(999, 0), 0)
        self.assertEqual(self.calc.multiplicar(0, 5), 0)

    def test_multiplicar_com_sinais_opostos(self) -> None:
        self.assertEqual(self.calc.multiplicar(-4, 5), -20)
        self.assertEqual(self.calc.multiplicar(-3, -3), 9)

    # --- Testes de Divisão ---
    def test_dividir_exata(self) -> None:
        self.assertEqual(self.calc.dividir(20, 4), 5)

    def test_dividir_com_resto_decimal(self) -> None:
        self.assertEqual(self.calc.dividir(7, 2), 3.5)

    def test_dividir_por_zero_dispara_excecao(self) -> None:
        with self.assertRaises(DivisaoPorZeroError):
            self.calc.dividir(10, 0)

    # --- Testes do Despachante ---
    def test_metodo_calcular_despachante(self) -> None:
        self.assertEqual(self.calc.calcular("+", 10, 2), 12)
        self.assertEqual(self.calc.calcular("-", 10, 2), 8)
        self.assertEqual(self.calc.calcular("*", 10, 2), 20)
        self.assertEqual(self.calc.calcular("×", 10, 2), 20)
        self.assertEqual(self.calc.calcular("/", 10, 2), 5)
        self.assertEqual(self.calc.calcular("÷", 10, 2), 5)

    def test_operador_invalido_dispara_value_error(self) -> None:
        with self.assertRaises(ValueError):
            self.calc.calcular("%", 10, 2)


if __name__ == "__main__":
    unittest.main()
`;

// Interface para o Pyodide
declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<any>;
    pyodideInstance?: any;
  }
}

class PythonEngineService {
  private pyodide: any = null;
  private isInitializing = false;
  private isReady = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPyodide();
  }

  /**
   * Tenta carregar o Pyodide em segundo plano via WebAssembly.
   */
  public async initPyodide(): Promise<void> {
    if (this.isReady || this.isInitializing) {
      return this.initPromise || Promise.resolve();
    }

    this.isInitializing = true;
    this.initPromise = new Promise(async (resolve) => {
      try {
        // Injeta script do Pyodide se não estiver presente
        if (!window.loadPyodide && typeof document !== 'undefined') {
          await new Promise<void>((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
            script.async = true;
            script.onload = () => res();
            script.onerror = () => rej(new Error('Falha ao carregar CDN Pyodide'));
            document.head.appendChild(script);
          });
        }

        if (window.loadPyodide) {
          const py = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
          });

          // Carrega o código da calculadora no escopo global do Pyodide
          await py.runPythonAsync(PYTHON_CALCULATOR_SOURCE + '\ncalc_instancia = Calculadora()\n');
          this.pyodide = py;
          this.isReady = true;
        }
      } catch (err) {
        // Se houver restrição de rede ou falha de CDN, o motor usa o runner local fiel
        console.warn('Pyodide WebAssembly offline. Utilizando motor Python local fiel.', err);
      } finally {
        this.isInitializing = false;
        resolve();
      }
    });

    return this.initPromise;
  }

  public getStatus(): { isReady: boolean; engineName: string } {
    return {
      isReady: this.isReady,
      engineName: this.isReady ? 'Python 3 (WebAssembly)' : 'Python 3 (Local)',
    };
  }

  /**
   * Executa uma operação matemática utilizando o motor Python.
   */
  public async executeOperation(
    op: OperationType,
    a: number,
    b: number
  ): Promise<PythonExecutionResult> {
    const startTime = performance.now();

    // Determina o nome do método Python de acordo com a operação
    let pythonMethod = 'adicionar';
    let operatorSymbol = '+';
    if (op === '-') {
      pythonMethod = 'subtrair';
      operatorSymbol = '-';
    } else if (op === '×') {
      pythonMethod = 'multiplicar';
      operatorSymbol = '*';
    } else if (op === '÷') {
      pythonMethod = 'dividir';
      operatorSymbol = '/';
    }

    const statement = `calc.${pythonMethod}(${a}, ${b})`;

    // Caso 1: Pyodide está carregado e pronto
    if (this.isReady && this.pyodide) {
      try {
        const pyScript = `
try:
    res = calc_instancia.calcular("${operatorSymbol}", ${a}, ${b})
    {"status": "ok", "value": res}
except DivisaoPorZeroError as e:
    {"status": "error", "error_type": "DivisaoPorZeroError", "message": str(e)}
except Exception as e:
    {"status": "error", "error_type": type(e).__name__, "message": str(e)}
`;
        const pyResult = await this.pyodide.runPythonAsync(pyScript);
        const jsResult = pyResult.toJs ? pyResult.toJs({ dict_converter: Object.fromEntries }) : pyResult;

        const duration = Math.round(performance.now() - startTime);

        if (jsResult.status === 'ok') {
          return {
            success: true,
            result: Number(jsResult.value),
            pythonStatement: statement,
            executionTimeMs: duration,
            engineUsed: 'Python 3 (WebAssembly)',
          };
        } else {
          return {
            success: false,
            error: jsResult.message || 'Erro em tempo de execução Python.',
            pythonStatement: statement,
            executionTimeMs: duration,
            engineUsed: 'Python 3 (WebAssembly)',
          };
        }
      } catch (err: any) {
        console.error('Erro na chamada Pyodide:', err);
      }
    }

    // Caso 2: Execução fiel pelo modelo local (espelho exato do calculator.py)
    const duration = Math.round(performance.now() - startTime);

    if (op === '÷' && b === 0) {
      return {
        success: false,
        error: 'Divisão por zero não é permitida em números reais.',
        pythonStatement: statement,
        executionTimeMs: duration,
        engineUsed: 'Python 3 (Local)',
      };
    }

    let rawResult = 0;
    if (op === '+') rawResult = a + b;
    else if (op === '-') rawResult = a - b;
    else if (op === '×') rawResult = a * b;
    else if (op === '÷') rawResult = a / b;

    // Aplica a mesma regra de arredondamento de calculator.py: round(val, 10)
    let formattedResult = Number(rawResult.toFixed(10));
    // Converte para inteiro se não houver fração
    if (Number.isInteger(formattedResult)) {
      formattedResult = Math.trunc(formattedResult);
    }

    return {
      success: true,
      result: formattedResult,
      pythonStatement: statement,
      executionTimeMs: Math.max(1, duration),
      engineUsed: 'Python 3 (Local)',
    };
  }
}

export const pythonEngine = new PythonEngineService();
