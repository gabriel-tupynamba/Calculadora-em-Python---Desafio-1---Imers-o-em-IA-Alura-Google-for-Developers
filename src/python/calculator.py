"""
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

# Definimos um apelido de tipo (Type Alias) para números aceitos nas operações.
# Em Python moderno, aceitamos tanto inteiros (int) quanto números decimais (float).
Numero = Union[int, float]


class CalculadoraError(Exception):
    """
    Exceção base para erros específicos da Calculadora.
    Herda da classe Exception padrão do Python.
    
    Criar exceções personalizadas é uma boa prática de engenharia de software,
    pois permite que quem consome seu código capture especificamente os erros
    do seu módulo sem afetar exceções genéricas do sistema.
    """
    pass


class DivisaoPorZeroError(CalculadoraError):
    """
    Exceção disparada quando é feita uma tentativa de divisão pelo número zero.
    Indica uma violação matemática que não pode ser resolvida em aritmética real.
    """
    pass


class Calculadora:
    """
    Classe principal responsável pelas quatro operações aritméticas básicas.

    Princípio de Design:
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
                para evitar artefatos de representação binária (ex: 0.1 + 0.2 = 0.30000000000000004).
                Padrão é 10 casas decimais.
        """
        self.precisao = precisao_arredondamento

    def _formatar_resultado(self, valor: Numero) -> Numero:
        """
        Método auxiliar (privado por convenção com sublinhado inicial '_').
        Formata o resultado para retornar um número inteiro se não houver parte decimal,
        ou um float arredondado caso haja casas decimais.

        Args:
            valor (Numero): O valor numérico bruto calculado (int ou float).

        Returns:
            Numero: Inteiro (ex: 5) ou float formatado (ex: 5.25).
        """
        # Se já for inteiro exato, podemos retornar imediatamente
        if isinstance(valor, int):
            return valor

        # Arredondamos para evitar ruído residual do padrão IEEE 754 de ponto flutuante
        valor_arredondado = round(float(valor), self.precisao)

        # Se o valor for matematicamente idêntico ao seu inteiro, convertemos para int
        # Exemplo: 4.0 se torna 4 para uma experiência de usuário mais limpa
        if valor_arredondado.is_integer():
            return int(valor_arredondado)
        return valor_arredondado

    def adicionar(self, a: Numero, b: Numero) -> Numero:
        """
        Calcula a soma de dois números (a + b).

        Args:
            a (Numero): Primeiro operando (parcela).
            b (Numero): Segundo operando (parcela).

        Returns:
            Numero: O total da adição.

        Exemplo de uso:
            >>> calc = Calculadora()
            >>> calc.adicionar(10, 5)
            15
        """
        resultado = a + b
        return self._formatar_resultado(resultado)

    def subtrair(self, a: Numero, b: Numero) -> Numero:
        """
        Calcula a diferença entre dois números (a - b).

        Args:
            a (Numero): O minuendo.
            b (Numero): O subtraendo.

        Returns:
            Numero: O resto ou diferença da subtração.

        Exemplo de uso:
            >>> calc = Calculadora()
            >>> calc.subtrair(10, 4)
            6
        """
        resultado = a - b
        return self._formatar_resultado(resultado)

    def multiplicar(self, a: Numero, b: Numero) -> Numero:
        """
        Calcula o produto de dois números (a * b).

        Args:
            a (Numero): Primeiro fator multiplicativo.
            b (Numero): Segundo fator multiplicativo.

        Returns:
            Numero: O produto resultante.

        Exemplo de uso:
            >>> calc = Calculadora()
            >>> calc.multiplicar(7, 6)
            42
        """
        resultado = a * b
        return self._formatar_resultado(resultado)

    def dividir(self, a: Numero, b: Numero) -> Numero:
        """
        Calcula o quociente da divisão de 'a' por 'b' (a / b).

        Validação de Defesa:
            Em matemática e na computação, dividir por zero é uma operação indefinida.
            Ao invés de deixar o sistema quebrar abruptamente ou retornar NaN não tratado,
            capturamos a condição e lançamos nossa exceção explicativa DivisaoPorZeroError.

        Args:
            a (Numero): O dividendo.
            b (Numero): O divisor.

        Returns:
            Numero: O quociente da divisão.

        Raises:
            DivisaoPorZeroError: Se o divisor (b) for estritamente igual a zero.

        Exemplo de uso:
            >>> calc = Calculadora()
            >>> calc.dividir(20, 4)
            5
            >>> calc.dividir(10, 0)
            Traceback (most recent call last):
            ...
            DivisaoPorZeroError: Divisão por zero não é permitida.
        """
        if b == 0:
            raise DivisaoPorZeroError("Divisão por zero não é permitida em números reais.")

        resultado = a / b
        return self._formatar_resultado(resultado)

    def calcular(self, operacao: str, a: Numero, b: Numero) -> Numero:
        """
        Método despachante de conveniência (Dispatcher Pattern).
        Recebe o símbolo da operação e direciona para o método específico correspondente.

        Args:
            operacao (str): O símbolo da operação ('+', '-', '*', 'x', '×', '/', '÷').
            a (Numero): Primeiro valor numérico.
            b (Numero): Segundo valor numérico.

        Returns:
            Numero: O resultado da operação solicitada.

        Raises:
            ValueError: Se o símbolo de operação fornecido não for suportado.
            DivisaoPorZeroError: Se for solicitada divisão por zero.
        """
        # Mapeamento do operador para a função correspondente
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


# Bloco de execução direta (Entrypoint para testes manuais no terminal)
# O bloco abaixo só roda se o script for executado diretamente: `python3 calculator.py`
# Se for importado como módulo (`import calculator`), este trecho não é executado.
if __name__ == "__main__":
    print("==================================================")
    print("  Calculadora em Python - Modo de Demonstração   ")
    print("==================================================")
    calc = Calculadora()

    # Demonstração das 4 operações
    soma = calc.adicionar(15, 27)
    sub = calc.subtrair(100, 37.5)
    mult = calc.multiplicar(8, 9)
    div = calc.dividir(50, 4)

    print(f"Adição:       15 + 27      = {soma}")
    print(f"Subtração:    100 - 37.5   = {sub}")
    print(f"Multiplicação: 8 * 9       = {mult}")
    print(f"Divisão:      50 / 4       = {div}")

    # Demonstração do tratamento da divisão por zero
    try:
        calc.dividir(42, 0)
    except DivisaoPorZeroError as erro:
        print(f"\nTeste de Exceção Capturada com Sucesso: {erro}")

    print("\nExecução concluída com sucesso!")
