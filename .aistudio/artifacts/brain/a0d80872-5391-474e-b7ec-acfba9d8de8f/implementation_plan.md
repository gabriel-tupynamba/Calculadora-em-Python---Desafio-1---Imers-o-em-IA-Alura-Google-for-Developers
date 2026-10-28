# Calculadora Python - Engenharia & Estudos

Calculadora aritmética focada no aprendizado de desenvolvimento de software e boas práticas em Python, combinando uma experiência de usuário tátil em Dark Mode com um motor modular em Python 3 executado via WebAssembly (Pyodide).

## Decisões Críticas e Preferências do Usuário

> [!IMPORTANT]
> As seguintes escolhas de arquitetura e UX foram consolidadas com base no alinhamento inicial:

- **Execução Real em Python**: A calculadora utiliza um motor legítimo em Python (`calculator.py`) executado diretamente no ambiente via Pyodide (Python 3.12 WebAssembly), garantindo que os cálculos, exceções e arredondamentos sigam a especificação do interpretador Python oficial.
- **Experiência Visual da Calculadora**: Interface normal, elegante e fluida em Dark Mode, com feedback tátil aprimorado, transições suaves e tipografia com numerais tabulares.
- **Foco Didático no Código-Fonte**: O código Python é mantido rigorosamente documentado com docstrings (PEP 257), type hints (`typing`), tratamento defensivo de erros (`ZeroDivisionError`) e comentários arquiteturais. O usuário pode inspecionar e copiar o código em uma gaveta lateral de estudos sem interferir na ergonomia da calculadora.
- **Histórico de Operações**: Registro persistente na sessão de cálculos realizados com timestamp e capacidade de reutilização de resultados.

---

## 1. Visão Geral e Conceito do Produto

- **O que faz**: Oferece uma calculadora aritmética moderna para as quatro operações fundamentais (+, -, ×, ÷), executando a lógica em Python e exibindo visualmente o histórico de cálculos e a base de código comentada para estudos.
- **Público-alvo**: O usuário que está iniciando nos estudos de desenvolvimento de software e fundamentos de computação/inteligência artificial, precisando de um exemplo de código limpo, modular e de fácil assimilação.
- **Valor Principal**: Demonstra na prática como separar a lógica de negócio (modelo de domínio em Python) da interface visual (apresentação), aplicando princípios sólidos de programação orientada a objetos (POO), funções puras e tratamento de exceções.

---

## 2. Experiência do Usuário e Design Visual

### Fluxos Principais
1. **Operação Básica**:
   - O usuário digita valores via teclado físico ou clicando nos botões táteis.
   - O display exibe a expressão atual e o operando de forma imediata.
   - Ao pressionar `=`, o motor Python processa a operação e retorna o resultado ou captura exceções amigáveis (ex: divisão por zero).
2. **Histórico de Cálculos**:
   - Cada operação bem-sucedida é adicionada ao histórico com a fórmula e resultado.
   - O usuário pode tocar em qualquer cálculo anterior para reinserir o valor no visor atual.
3. **Inspeção de Código para Estudos**:
   - Um botão discreto no topo permite abrir a gaveta de código Python comentado.
   - O código apresenta sintaxe colorida, explicações sobre type hints, docstrings e tratamento de casos de borda.

### Identidade Visual & Tema
- **Paleta de Cores**:
  - Fundo principal: `slate-950` com textura de grade ultra-sutil.
  - Chassi da calculadora: `slate-900` com bordas sutis `slate-800` e elevação suave.
  - Teclas numéricas: Superfície `slate-800/90` com iluminação interna e texto `slate-100`.
  - Operadores aritméticos: Âmbar/Laranja elegante (`amber-500` / `orange-500`) com alto contraste para identificação rápida.
  - Teclas de ação (AC, Backspace): `slate-700` com acento neutro.
- **Tipografia**:
  - Visor da calculadora: Tipografia monoespaçada tabular (`JetBrains Mono` / `Space Mono` via Tailwind `font-mono tabular-nums`) para prevenir deslocamento de dígitos.
  - Títulos e rótulos: Neo-Grotesque limpa (`Plus Jakarta Sans` ou sans moderno).
- **Feedback Tátil & Micro-interações**:
  - Efeito de compressão física ao clique (`active:scale-[0.96]` com curva de transição `150ms`).
  - Suporte completo a atalhos de teclado (0-9, +, -, *, /, Enter, Backspace, Escape, c).

---

## 3. Decisões de Produto & Arquitetura de Software

### Decisão 1: Execução do Python
- **Abordagem Escolhida**: Motor em Python 3 via Pyodide WebAssembly no cliente, com arquivo `calculator.py` acessível no repositório.
- **Por que**: Permite que a aplicação execute código Python real com latência zero e sem depender de requisições de rede contínuas, mantendo 100% de conformidade com o Python padrão.
- **Alternativas Consideradas**: Executar via servidor Express chamando subprocessos Python. Rejeitada por introduzir latência desnecessária a cada clique de botão e criar complexidade de concorrência.

### Decisão 2: Arquitetura do Código Python (`calculator.py`)
- **Abordagem Escolhida**: Classe `Calculadora` em estilo POO canônico, com métodos estáticos ou de instância para cada uma das quatro operações, tipagem estática com `float | int`, e exceção customizada para erros matemáticos.
- **Por que**: Fornece ao estudante a estrutura ideal recomendada pelas melhores práticas da comunidade Python (PEP 8, Clean Code).

---

## 4. Arquitetura Técnica & Estrutura de Componentes

### Diagrama de Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                      Navegador Web                           │
│                                                              │
│  ┌───────────────────────┐        ┌───────────────────────┐  │
│  │   Interface Visual    │        │  Gaveta de Código     │  │
│  │   (Calculadora UI)    │        │  (Estudo & Docs)      │  │
│  │  - Visor Tabular      │        │  - calculator.py      │  │
│  │  - Teclado Tátil      │        │  - Explicações POO    │  │
│  │  - Histórico Recente  │        │  - Testes Unitários   │  │
│  └───────────┬───────────┘        └───────────────────────┘  │
│              │ Ações do usuário                              │
│              ▼                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Adaptador da Calculadora (React Hook)        │  │
│  │       Validação de entrada, estados e histórico        │  │
│  └───────────────────────────┬────────────────────────────┘  │
│                              │ Chamada direta                │
│                              ▼                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Pyodide Runtime / Motor Python 3             │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │                calculator.py                     │  │  │
│  │  │  class Calculadora:                              │  │  │
│  │  │      def somar(self, a: float, b: float) -> float│  │  │
│  │  │      def subtrair(...)                           │  │  │
│  │  │      def multiplicar(...)                        │  │  │
│  │  │      def dividir(...)  # ZeroDivisionError       │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Arquivos Principais a Construir
1. `src/python/calculator.py`: Módulo Python completo, com classe `Calculadora`, métodos para as 4 operações, docstrings explicativas, comentários didáticos para cada linha-chave e exemplos de testes unitários com `unittest`.
2. `src/services/pythonRunner.ts`: Inicializador e executor do Pyodide WebAssembly, executando o script Python nativamente.
3. `src/components/Calculator.tsx`: Componente da calculadora com layout ergonômico, botões com feedback tátil e animações suaves.
4. `src/components/HistoryPanel.tsx`: Painel lateral/inferior de histórico de operações.
5. `src/components/CodeViewerModal.tsx`: Visualizador do código Python com abas para o código principal (`calculator.py`) e para os testes (`test_calculator.py`).
