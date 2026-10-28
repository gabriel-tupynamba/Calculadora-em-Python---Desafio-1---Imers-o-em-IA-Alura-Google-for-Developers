"""
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
    """
    Casos de teste unitário para validar as quatro operações aritméticas
    e os comportamentos de borda da classe Calculadora.
    """

    def setUp(self) -> None:
        """
        Método executado automaticamente antes de CADA teste individual.
        Garante um estado limpo (nova instância) para evitar dependência entre testes.
        """
        self.calc = Calculadora()

    # --- Testes de Adição ---
    def test_adicionar_inteiros_positivos(self) -> None:
        """Verifica a soma entre dois inteiros positivos."""
        self.assertEqual(self.calc.adicionar(10, 5), 15)

    def test_adicionar_com_negativos(self) -> None:
        """Verifica a adição envolvendo números negativos."""
        self.assertEqual(self.calc.adicionar(-8, 3), -5)
        self.assertEqual(self.calc.adicionar(-4, -6), -10)

    def test_adicionar_decimais(self) -> None:
        """Verifica a precisão ao somar números com ponto flutuante."""
        self.assertEqual(self.calc.adicionar(0.1, 0.2), 0.3)

    # --- Testes de Subtração ---
    def test_subtrair_positivos(self) -> None:
        """Verifica a subtração padrão entre inteiros."""
        self.assertEqual(self.calc.subtrair(20, 8), 12)

    def test_subtrair_resultando_negativo(self) -> None:
        """Verifica quando o subtraendo é maior que o minuendo."""
        self.assertEqual(self.calc.subtrair(5, 12), -7)

    def test_subtrair_com_decimais(self) -> None:
        """Verifica a subtração com números decimais."""
        self.assertEqual(self.calc.subtrair(10.5, 2.5), 8)

    # --- Testes de Multiplicação ---
    def test_multiplicar_positivos(self) -> None:
        """Verifica a multiplicação comum."""
        self.assertEqual(self.calc.multiplicar(7, 6), 42)

    def test_multiplicar_por_zero(self) -> None:
        """Verifica a propriedade do elemento nulo (qualquer número * 0 = 0)."""
        self.assertEqual(self.calc.multiplicar(999, 0), 0)
        self.assertEqual(self.calc.multiplicar(0, 5), 0)

    def test_multiplicar_com_sinais_opostos(self) -> None:
        """Verifica a regra de sinais: positivo * negativo = negativo."""
        self.assertEqual(self.calc.multiplicar(-4, 5), -20)
        self.assertEqual(self.calc.multiplicar(-3, -3), 9)

    # --- Testes de Divisão ---
    def test_dividir_exata(self) -> None:
        """Verifica a divisão exata com quociente inteiro."""
        self.assertEqual(self.calc.dividir(20, 4), 5)

    def test_dividir_com_resto_decimal(self) -> None:
        """Verifica a divisão com casas decimais no resultado."""
        self.assertEqual(self.calc.dividir(7, 2), 3.5)

    def test_dividir_por_zero_dispara_excecao(self) -> None:
        """
        Teste crítico de segurança:
        Verifica se a tentativa de dividir por zero lança especificamente DivisaoPorZeroError.
        """
        with self.assertRaises(DivisaoPorZeroError):
            self.calc.dividir(10, 0)

    # --- Testes do Despachante (Método calcular) ---
    def test_metodo_calcular_despachante(self) -> None:
        """Verifica se o método despachante aceita diferentes símbolos de operadores."""
        self.assertEqual(self.calc.calcular("+", 10, 2), 12)
        self.assertEqual(self.calc.calcular("-", 10, 2), 8)
        self.assertEqual(self.calc.calcular("*", 10, 2), 20)
        self.assertEqual(self.calc.calcular("×", 10, 2), 20)
        self.assertEqual(self.calc.calcular("/", 10, 2), 5)
        self.assertEqual(self.calc.calcular("÷", 10, 2), 5)

    def test_operador_invalido_dispara_value_error(self) -> None:
        """Verifica se um operador desconhecido lança ValueError."""
        with self.assertRaises(ValueError):
            self.calc.calcular("%", 10, 2)


# Executa os testes se o arquivo for chamado diretamente no terminal
if __name__ == "__main__":
    unittest.main()
