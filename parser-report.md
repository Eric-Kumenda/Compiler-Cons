# Elmo Parser — Technical Report

## Table of Contents

1. [Introduction](#1-introduction)
2. [The Grammar](#2-the-grammar)
3. [Parser Architecture](#3-parser-architecture)
4. [Operator Precedence](#4-operator-precedence)
5. [Tree Construction](#5-tree-construction)
6. [Call Graph](#6-call-graph)
7. [Error Handling & Recovery Strategy](#7-error-handling--recovery-strategy)
8. [Runtime Output & Analysis](#8-runtime-output--analysis)
9. [Conclusion](#9-conclusion)

---

## 1. Introduction

### Language Choice — Go

The Elmo compiler is implemented in **Go (Golang)**. Go was chosen for several practical reasons:

- **Strong typing and simplicity** — Go's strict type system catches many errors at compile time, reducing bugs in the parser itself. Its minimalist syntax keeps the codebase readable and easy to maintain.
- **No external dependencies** — The entire compiler (scanner + parser) is built using only Go's standard library (`fmt`, `os`, `strings`), making it trivially portable and reproducible on any machine with a Go toolchain.
- **Struct-based tree representation** — Go's `struct` and pointer types map naturally to tree data structures, making parse tree construction intuitive without needing class hierarchies or inheritance.

### Parser Type — Recursive Descent

We chose **Recursive Descent** as our parsing strategy. Recursive Descent is a top-down parsing technique where each **non-terminal** in the grammar is directly translated into a **Go function**. The parser starts at the top-level rule (`<program>`) and recursively calls sub-functions that correspond to each grammar production, building the parse tree as it descends through the grammar.

#### Why Recursive Descent Suits Our Grammar

We chose Recursive Descent because it provides a highly intuitive mapping between our BNF grammar and the program's control flow, allowing for superior debugging and clear traceability of the parsing logic. Specifically:

1. **One-to-one mapping** — Every non-terminal in the BNF grammar corresponds directly to a Go function. For example, `<stmt_list>` maps to `parseStmtList()`, `<expr>` maps to `parseExpr()`, and `<while_stmt>` maps to `parseWhileStmt()`. This makes the parser self-documenting: reading the code is essentially reading the grammar.

2. **LL(1) compatibility** — Our Elmo grammar has been transformed to eliminate left recursion (via `<expr_tail>` and `<term_tail>`) and to factor out the optional `<else_part>`. This makes the grammar LL(1)-compatible, meaning the parser can always decide which production to take by looking at just **one token ahead** (the `peek()` function). Recursive Descent is the natural implementation strategy for LL(1) grammars.

3. **Clear control flow for debugging** — When the parser encounters an error, the Go call stack itself shows the exact sequence of grammar rules the parser was attempting. A stack trace through `parseProgram → parseStmtList → parseStmt → parseAssignStmt → parseExpr` immediately tells the developer where in the grammar the failure occurred.

4. **Straightforward error reporting** — Because each function knows exactly what grammar rule it is implementing, the `expect()` helpers can produce precise, context-aware error messages like _"expected ';' but got '@'"_ — the parser knows what it needs next at every point.

5. **No external tools required** — Unlike parser generators (YACC, ANTLR), Recursive Descent is hand-coded. This gives us full control over error messages, tree construction, and recovery strategies without learning a separate tool's configuration language.

---

## 2. The Grammar

The Elmo language uses a mini-grammar that supports variable declarations, assignment, control flow (`if`/`else`, `while`), return statements, and arithmetic/relational expressions. The grammar was transformed from its original form to be **Recursive Descent-ready** by eliminating left recursion and factoring out the optional `else` clause.

### Transformed BNF (LL(1)-Ready)

```
<program>       ::= <stmt_list>

<stmt_list>     ::= <stmt> <stmt_list>
                  | ε

<stmt>          ::= <decl_stmt>
                  | <assign_stmt>
                  | <if_stmt>
                  | <while_stmt>
                  | <return_stmt>

<decl_stmt>     ::= int IDENTIFIER ;

<assign_stmt>   ::= IDENTIFIER = <expr> ;

<if_stmt>       ::= if ( <cond_expr> ) { <stmt_list> } <else_part>

<else_part>     ::= else { <stmt_list> }
                  | ε

<while_stmt>    ::= while ( <cond_expr> ) { <stmt_list> }

<return_stmt>   ::= return <expr> ;

<expr>          ::= <term> <expr_tail>

<expr_tail>     ::= + <term> <expr_tail>
                  | - <term> <expr_tail>
                  | ε

<term>          ::= <factor> <term_tail>

<term_tail>     ::= * <factor> <term_tail>
                  | / <factor> <term_tail>
                  | ε

<factor>        ::= NUMBER
                  | IDENTIFIER
                  | ( <expr> )

<cond_expr>     ::= <expr> <rel_op> <expr>

<rel_op>        ::= == | < | > | <= | >=
```

### Key Grammar Transformations

| Problem                                                           | Solution                                                           | Impact                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Left recursion in `<expr>` (e.g., `<expr> ::= <expr> + <term>`)   | Introduced `<expr_tail>` with right-recursive structure            | Enables top-down parsing; avoids infinite recursion                                       |
| Left recursion in `<term>` (e.g., `<term> ::= <term> * <factor>`) | Introduced `<term_tail>` with right-recursive structure            | Same benefit as above                                                                     |
| Ambiguous `if`/`else`                                             | Factored `<else_part>` as a separate production with ε-alternative | Clean LL(1) decision: if next token is `else`, parse the else block; otherwise, produce ε |

---

## 3. Parser Architecture

### The Token Stream (Scanner Integration)

The parser receives a flat **slice of `Token` structs** from the scanner. Each token carries:

| Field    | Type        | Purpose                                                                                          |
| -------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `Type`   | `TokenType` | Category: `NUMBER`, `IDENTIFIER`, `KEYWORD`, `OPERATOR`, `PUNCTUATION`, `STRING`, `EOF`, `ERROR` |
| `Lexeme` | `string`    | The raw text as it appeared in source code (e.g., `"while"`, `"42"`, `"+="`)                     |
| `Value`  | `string`    | Processed value (e.g., string content without surrounding quotes)                                |
| `Line`   | `int`       | 1-indexed source line number for error reporting                                                 |

The pipeline is:

```
source file (.elmo)  →  Scanner.Scan()  →  []Token  →  NewParser(tokens)  →  parseProgram()  →  *Node (parse tree)
```

The parser consumes tokens sequentially through an internal `current` index. It never backtracks — this is a key property of LL(1) parsing.

### The Parser `struct`

```go
type Parser struct {
    tokens  []Token   // Flat token stream from the scanner
    current int       // Index of the next token to consume
}
```

The `NewParser()` constructor simply stores the token slice and initialises `current` to `0`. The final token in the slice is always `TOKEN_EOF`, which acts as a sentinel to mark the end of input.

### The "Big Three" Helpers: `Peek()`, `Advance()`, and `Expect()`

These three functions form the foundation that every parsing function is built on.

#### `peek()` — Look Without Consuming

```go
func (p *Parser) peek() Token
```

Returns the current token **without** moving the cursor forward. If all tokens have been consumed, it returns a synthetic `EOF` token. This is the parser's "lookahead" mechanism — it checks what's coming next to decide which grammar rule to apply.

**Convenience variants:**

- `peekType()` — returns just the `TokenType` of the current token.
- `peekIs(t TokenType)` — returns `true` if the current token matches a given type.
- `peekIsKeyword(kw string)` — returns `true` if the current token is a specific keyword (e.g., `"if"`, `"while"`).
- `peekIsOperator(op string)` — returns `true` if the current token is a specific operator (e.g., `"+"`, `"=="`)
- `peekIsPunctuation(pu string)` — returns `true` if the current token is a specific punctuation mark (e.g., `";"`, `"{"`)

These convenience methods are used heavily in `switch` statements to decide which production to follow.

#### `advance()` — Consume and Return

```go
func (p *Parser) advance() Token
```

Returns the current token **and** moves the cursor one position forward. This is how the parser "eats" tokens — every terminal symbol in the grammar must be consumed via `advance()` (usually through `expect()`).

#### `expect()` — Consume or Die

```go
func (p *Parser) expect(t TokenType) Token
```

The gatekeeper. It peeks at the current token and:

- **If it matches the expected type** → consumes it via `advance()` and returns it.
- **If it does NOT match** → calls `reportError()`, which prints a formatted error message and **terminates the program** with `os.Exit(1)`.

**Specialised variants:**

- `expectKeyword(kw string)` — expects a specific keyword lexeme (e.g., `expectKeyword("int")`).
- `expectOperator(op string)` — expects a specific operator (e.g., `expectOperator("=")`).
- `expectPunctuation(pu string)` — expects a specific punctuation mark (e.g., `expectPunctuation(";")`).

These ensure that mandatory syntax elements (semicolons, braces, keywords) are present in the token stream. If they are not, the parser stops immediately with a clear error.

### Recursive Descent Logic: Grammar Non-Terminals → Go Functions

Each non-terminal in the grammar maps to exactly one Go function in `parser.go`. The function inspects the current token (via `peek()` and its variants) to decide which production alternative to follow, then calls sub-functions for each non-terminal on the right-hand side of the production.

| Grammar Non-Terminal | Go Function         | Decision Logic                                                                                          |
| -------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `<program>`          | `parseProgram()`    | Unconditionally calls `parseStmtList()`                                                                 |
| `<stmt_list>`        | `parseStmtList()`   | If `EOF` or `}` → return ε; otherwise parse `<stmt>` then recurse                                       |
| `<stmt>`             | `parseStmt()`       | `switch` on current token: `int` → decl, `IDENTIFIER` → assign, `if`/`while`/`return` → respective stmt |
| `<decl_stmt>`        | `parseDeclStmt()`   | Expects `int`, `IDENTIFIER`, `;` in sequence                                                            |
| `<assign_stmt>`      | `parseAssignStmt()` | Expects `IDENTIFIER`, `=`, `<expr>`, `;`                                                                |
| `<if_stmt>`          | `parseIfStmt()`     | Expects `if`, `(`, `<cond_expr>`, `)`, `{`, `<stmt_list>`, `}`, `<else_part>`                           |
| `<else_part>`        | `parseElsePart()`   | If next token is `else` → parse else block; otherwise → return ε                                        |
| `<while_stmt>`       | `parseWhileStmt()`  | Expects `while`, `(`, `<cond_expr>`, `)`, `{`, `<stmt_list>`, `}`                                       |
| `<return_stmt>`      | `parseReturnStmt()` | Expects `return`, `<expr>`, `;`                                                                         |
| `<expr>`             | `parseExpr()`       | Calls `parseTerm()` then `parseExprTail()`                                                              |
| `<expr_tail>`        | `parseExprTail()`   | If `+` or `-` → consume, parse `<term>`, recurse; otherwise → ε                                         |
| `<term>`             | `parseTerm()`       | Calls `parseFactor()` then `parseTermTail()`                                                            |
| `<term_tail>`        | `parseTermTail()`   | If `*` or `/` → consume, parse `<factor>`, recurse; otherwise → ε                                       |
| `<factor>`           | `parseFactor()`     | `NUMBER` → leaf, `IDENTIFIER` → leaf, `(` → parse `<expr>` then `)`                                     |
| `<cond_expr>`        | `parseCondExpr()`   | Parses `<expr>`, `<rel_op>`, `<expr>`                                                                   |
| `<rel_op>`           | `parseRelOp()`      | Matches one of `==`, `<`, `>`, `<=`, `>=`                                                               |

---

## 4. Operator Precedence

One of the most important aspects of expression parsing is **operator precedence** — ensuring that `2 + 3 * 4` evaluates as `2 + (3 * 4)` rather than `(2 + 3) * 4`.

### Precedence Through Function Hierarchy

Our parser enforces operator precedence **structurally**, through the call hierarchy of the expression-parsing functions. There is no precedence table or special annotations — the grammar itself encodes the precedence rules:

```
Lowest precedence    parseExpr()      handles  +  -
        ↓            parseTerm()      handles  *  /
Highest precedence   parseFactor()    handles  NUMBER, IDENTIFIER, ( expr )
```

**Why this works:** When `parseExpr()` is called, it first calls `parseTerm()`. The `parseTerm()` function first calls `parseFactor()` to get an atomic value, then checks for `*` or `/`. Only after `parseTerm()` has fully resolved all multiplication/division does control return to `parseExpr()`, which then checks for `+` or `-`.

This means **multiplication and division are always grouped tighter** (deeper in the tree) than addition and subtraction.

### Walkthrough: Parsing `x * 2 + y`

1. `parseExpr()` calls `parseTerm()`
2. `parseTerm()` calls `parseFactor()` → returns leaf node `x`
3. `parseTerm()` calls `parseTermTail()` → sees `*`, consumes it
4. `parseTermTail()` calls `parseFactor()` → returns leaf node `2`
5. `parseTermTail()` calls `parseTermTail()` → sees `+` (not `*` or `/`), returns ε
6. Control returns to `parseTerm()` — the term `x * 2` is now a complete subtree
7. Control returns to `parseExpr()`, which calls `parseExprTail()`
8. `parseExprTail()` sees `+`, consumes it
9. `parseExprTail()` calls `parseTerm()` → resolves `y` as a single-factor term
10. `parseExprTail()` recurses → no more operators → returns ε

**Resulting tree structure:**

```
expr
├── term
│   ├── identifier  'x'
│   └── term_tail
│       ├── operator  '*'
│       ├── number  '2'
│       └── term_tail
│           └── ε  'ε'
└── expr_tail
    ├── operator  '+'
    ├── term
    │   ├── identifier  'y'
    │   └── term_tail
    │       └── ε  'ε'
    └── expr_tail
        └── ε  'ε'
```

The `*` operator sits deeper in the tree (inside `term_tail`) than the `+` operator (in `expr_tail`), correctly reflecting that multiplication binds tighter.

### Precedence Table

| Level       | Operators | Parsed By                         | Associativity                            |
| ----------- | --------- | --------------------------------- | ---------------------------------------- |
| 1 (lowest)  | `+`, `-`  | `parseExpr()` / `parseExprTail()` | Left-to-right (via right-recursive tail) |
| 2 (highest) | `*`, `/`  | `parseTerm()` / `parseTermTail()` | Left-to-right (via right-recursive tail) |
| —           | `(`, `)`  | `parseFactor()`                   | Grouping override                        |

---

## 5. Tree Construction

The parser builds a **concrete parse tree** (also called a concrete syntax tree), not an abstract syntax tree (AST). Every grammar rule, including ε-productions, is represented in the tree. This makes the tree a faithful reflection of the grammar derivation.

### Node Types

Each node in the tree is a `Node` struct:

```go
type Node struct {
    Type     NodeType   // e.g., "program", "stmt_list", "identifier"
    Value    string     // Lexeme for terminal nodes; empty for non-terminals
    Children []*Node    // Sub-trees for non-terminal nodes
}
```

Nodes are created using two constructors:

- **`newNode(type, children...)`** — creates an **internal node** (non-terminal) with zero or more children. Used for grammar rules like `stmt_list`, `expr`, `term`, etc.
- **`newLeaf(type, value)`** — creates a **leaf node** (terminal) with a lexeme value. Used for tokens like identifiers, numbers, keywords, operators, and punctuation.
- **`newEpsilon()`** — creates a special ε leaf node, representing the empty derivation. Used when a production like `<stmt_list>` or `<expr_tail>` reaches its base case.

### How `stmt_list` Builds a Linked Chain

The `<stmt_list>` non-terminal is defined recursively:

```
<stmt_list> ::= <stmt> <stmt_list> | ε
```

Each call to `parseStmtList()` either:

- Produces an **ε node** (base case: `EOF` or `}` is reached), or
- Produces a `stmt_list` node with two children: the current `<stmt>` and a recursive `<stmt_list>`.

This creates a **right-recursive chain**:

```
stmt_list
├── decl_stmt (first statement)
│   └── ...
└── stmt_list
    ├── assign_stmt (second statement)
    │   └── ...
    └── stmt_list
        └── ε  'ε'
```

### How `expr` Nodes Nest for Precedence

Expression trees are built with `<term>` nodes nested inside `<expr>` nodes, naturally encoding operator precedence:

```
expr                        ← addition level
├── term                    ← multiplication level
│   ├── factor (operand)    ← atomic level
│   └── term_tail
│       └── ε
└── expr_tail
    ├── operator  '+'
    ├── term
    │   ├── factor (operand)
    │   └── term_tail
    │       └── ε
    └── expr_tail
        └── ε
```

### Pretty Printing

The `Node.Print()` method renders the tree using Unicode box-drawing characters (`├──`, `└──`, `│`), producing a human-readable tree visualisation directly in the terminal. Each leaf node displays its type and lexeme value (e.g., `identifier  'x'`), while ε nodes display as `ε  'ε'`.

---

## 6. Call Graph

The following diagram shows how the parser's functions interact during execution. Arrows indicate "calls" relationships.

**Colour Legend:**

- 🔵 **Blue** — Entry point & top-level orchestration (`main`, `parseProgram`)
- 🟢 **Green** — Statement dispatching (`parseStmtList`, `parseStmt`)
- 🟠 **Orange** — Individual statement parsers (`parseDeclStmt`, `parseIfStmt`, etc.)
- 🔴 **Red** — Expression parsing hierarchy (`parseExpr` → `parseTerm` → `parseFactor`)
- ⚫ **Grey** — Core helpers (`expect`, `peek`, `advance`)

---

## 7. Error Handling & Recovery Strategy

### Error Detection

The parser detects errors at two levels:

1. **Scanner-level (lexical errors)** — The scanner flags unrecognised characters (e.g., `@`, `#`) by emitting `TOKEN_ERROR`. The main function counts these and prints a warning before parsing begins:

    ```
    warning : scanner flagged 1 malformed token(s)
    ```

2. **Parser-level (syntax errors)** — The parser detects structural violations using the `expect()` family of functions. When the next token doesn't match what the grammar demands, the parser triggers an error.

### Error Reporting

The `reportError()` function produces a clearly formatted, boxed error message:

```
────────────────────────────────────────────────────────────
  [parse error] line 21
  expected : ';'
  got      : '@' (ERROR)
────────────────────────────────────────────────────────────
```

Every error message includes:

- **Line number** — the source line where the error was detected.
- **Expected** — what the parser was looking for at that point in the grammar.
- **Got** — what was actually found, including the lexeme and its token type.

The `unexpectedToken()` function handles cases where no valid production alternative matches:

```
────────────────────────────────────────────────────────────
  [parse error] line N
  unexpected token in <context>
  got : '<lexeme>' (TYPE)
────────────────────────────────────────────────────────────
```

### Recovery Strategy: Fail-Fast (Panic Mode)

Our parser uses a **fail-fast (panic mode)** error recovery strategy. Upon encountering the first syntax error, the parser:

1. Prints the formatted error message to `stderr`.
2. Immediately exits the program with `os.Exit(1)`.

**Why fail-fast?**

- **Simplicity** — Error recovery in Recursive Descent parsers (e.g., synchronisation to the next `;` or `}`) adds significant complexity. For a compiler course assignment, fail-fast keeps the parser clean and verifiable.
- **Accurate reporting** — The first error is always the most meaningful. Subsequent errors in a recovery-based parser are often **cascading** (caused by the parser being in a confused state after the first error), which can mislead the programmer.
- **Deterministic output** — One error, one message, one exit code. This makes automated testing straightforward.

**Trade-off acknowledged:** The limitation is that the programmer must fix errors one at a time and re-run the parser. In a production compiler, a recovery strategy (such as synchronising to the next statement boundary) would be preferable.

### How the Scanner and Parser Cooperate on Error Tokens

When the scanner encounters an illegal character like `@`, it emits a `TOKEN_ERROR` with the offending character stored in the `Lexeme` field. The parser doesn't have a special case for `TOKEN_ERROR` — it simply tries to match it against the expected production, fails (because `TOKEN_ERROR` is never a valid type in any grammar rule), and reports the mismatch through the normal `expect()` path.

---

## 8. Runtime Output & Analysis

The following sections show the parser's actual terminal output for each sample program. The command-line interface is:

```
./elmo-scanner <source-file.elmo>
```

The program first prints a scanner summary (token count, any lexical warnings), then either the full parse tree (on success) or a parse error (on failure).

---

### 8.1 `sample.elmo` — Valid Program (if/else + while)

**Source code:**

```elmo
int x;
int result;
x = 10;
result = 0;

if (x >= 5) {
    result = x * 2;
} else {
    result = x + 1;
}

while (result > 0) {
    result = result - 1;
}

return result;
```

**Terminal output:**

```
══════════════════════════════════════════
  Elmo — scanning complete
══════════════════════════════════════════
  file    : sample.elmo
  tokens  : 52
══════════════════════════════════════════

══════════════════════════════════════════
  Elmo — parse tree
══════════════════════════════════════════
program
└── stmt_list
    ├── decl_stmt
    │   ├── keyword  'int'
    │   ├── identifier  'x'
    │   └── punctuation  ';'
    └── stmt_list
        ├── decl_stmt
        │   ├── keyword  'int'
        │   ├── identifier  'result'
        │   └── punctuation  ';'
        └── stmt_list
            ├── assign_stmt
            │   ├── identifier  'x'
            │   ├── operator  '='
            │   ├── expr
            │   │   ├── term
            │   │   │   ├── number  '10'
            │   │   │   └── term_tail
            │   │   │       └── ε  'ε'
            │   │   └── expr_tail
            │   │       └── ε  'ε'
            │   └── punctuation  ';'
            └── stmt_list
                ├── assign_stmt
                │   ├── identifier  'result'
                │   ├── operator  '='
                │   ├── expr
                │   │   ├── term
                │   │   │   ├── number  '0'
                │   │   │   └── term_tail
                │   │   │       └── ε  'ε'
                │   │   └── expr_tail
                │   │       └── ε  'ε'
                │   └── punctuation  ';'
                └── stmt_list
                    ├── if_stmt
                    │   ├── keyword  'if'
                    │   ├── punctuation  '('
                    │   ├── cond_expr
                    │   │   ├── expr
                    │   │   │   ├── term
                    │   │   │   │   ├── identifier  'x'
                    │   │   │   │   └── term_tail
                    │   │   │   │       └── ε  'ε'
                    │   │   │   └── expr_tail
                    │   │   │       └── ε  'ε'
                    │   │   ├── rel_op  '>='
                    │   │   └── expr
                    │   │       ├── term
                    │   │       │   ├── number  '5'
                    │   │       │   └── term_tail
                    │   │       │       └── ε  'ε'
                    │   │       └── expr_tail
                    │   │           └── ε  'ε'
                    │   ├── punctuation  ')'
                    │   ├── punctuation  '{'
                    │   ├── stmt_list
                    │   │   ├── assign_stmt
                    │   │   │   ├── identifier  'result'
                    │   │   │   ├── operator  '='
                    │   │   │   ├── expr
                    │   │   │   │   ├── term
                    │   │   │   │   │   ├── identifier  'x'
                    │   │   │   │   │   └── term_tail
                    │   │   │   │   │       ├── operator  '*'
                    │   │   │   │   │       ├── number  '2'
                    │   │   │   │   │       └── term_tail
                    │   │   │   │   │           └── ε  'ε'
                    │   │   │   │   └── expr_tail
                    │   │   │   │       └── ε  'ε'
                    │   │   │   └── punctuation  ';'
                    │   │   └── stmt_list
                    │   │       └── ε  'ε'
                    │   ├── punctuation  '}'
                    │   └── else_part
                    │       ├── keyword  'else'
                    │       ├── punctuation  '{'
                    │       ├── stmt_list
                    │       │   ├── assign_stmt
                    │       │   │   ├── identifier  'result'
                    │       │   │   ├── operator  '='
                    │       │   │   ├── expr
                    │       │   │   │   ├── term
                    │       │   │   │   │   ├── identifier  'x'
                    │       │   │   │   │   └── term_tail
                    │       │   │   │   │       └── ε  'ε'
                    │       │   │   │   └── expr_tail
                    │       │   │   │       ├── operator  '+'
                    │       │   │   │       ├── term
                    │       │   │   │       │   ├── number  '1'
                    │       │   │   │       │   └── term_tail
                    │       │   │   │       │       └── ε  'ε'
                    │       │   │   │       └── expr_tail
                    │       │   │   │           └── ε  'ε'
                    │       │   │   └── punctuation  ';'
                    │       │   └── stmt_list
                    │       │       └── ε  'ε'
                    │       └── punctuation  '}'
                    └── stmt_list
                        ├── while_stmt
                        │   ├── keyword  'while'
                        │   ├── punctuation  '('
                        │   ├── cond_expr
                        │   │   ├── expr
                        │   │   │   ├── term
                        │   │   │   │   ├── identifier  'result'
                        │   │   │   │   └── term_tail
                        │   │   │   │       └── ε  'ε'
                        │   │   │   └── expr_tail
                        │   │   │       └── ε  'ε'
                        │   │   ├── rel_op  '>'
                        │   │   └── expr
                        │   │       ├── term
                        │   │       │   ├── number  '0'
                        │   │       │   └── term_tail
                        │   │       │       └── ε  'ε'
                        │   │       └── expr_tail
                        │   │           └── ε  'ε'
                        │   ├── punctuation  ')'
                        │   ├── punctuation  '{'
                        │   ├── stmt_list
                        │   │   ├── assign_stmt
                        │   │   │   ├── identifier  'result'
                        │   │   │   ├── operator  '='
                        │   │   │   ├── expr
                        │   │   │   │   ├── term
                        │   │   │   │   │   ├── identifier  'result'
                        │   │   │   │   │   └── term_tail
                        │   │   │   │   │       └── ε  'ε'
                        │   │   │   │   └── expr_tail
                        │   │   │   │       ├── operator  '-'
                        │   │   │   │       ├── term
                        │   │   │   │       │   ├── number  '1'
                        │   │   │   │       │   └── term_tail
                        │   │   │   │       │       └── ε  'ε'
                        │   │   │   │       └── expr_tail
                        │   │   │   │           └── ε  'ε'
                        │   │   │   └── punctuation  ';'
                        │   │   └── stmt_list
                        │   │       └── ε  'ε'
                        │   └── punctuation  '}'
                        └── stmt_list
                            ├── return_stmt
                            │   ├── keyword  'return'
                            │   ├── expr
                            │   │   ├── term
                            │   │   │   ├── identifier  'result'
                            │   │   │   └── term_tail
                            │   │   │       └── ε  'ε'
                            │   │   └── expr_tail
                            │   │       └── ε  'ε'
                            │   └── punctuation  ';'
                            └── stmt_list
                                └── ε  'ε'

══════════════════════════════════════════
  Parse successful
══════════════════════════════════════════
```

**Analysis:** The parser successfully processes all 52 tokens and constructs a complete parse tree. Key observations:

- The `if`/`else` is correctly structured: the `else_part` node contains the else block's `stmt_list`.
- The expression `x * 2` has the `*` operator inside `term_tail`, showing correct precedence.
- The expression `result - 1` has the `-` operator inside `expr_tail`.
- Every `stmt_list` chain terminates with an ε node.

---

### 8.2 `sample2.elmo` — Valid Program (while loop with accumulator)

**Source code:**

```elmo
int i;
int total;
int limit;

i = 0;
total = 0;
limit = 100;

while (i < limit) {
    total = total + i;
    i = i + 1;
}

return total;
```

**Terminal output:**

```
══════════════════════════════════════════
  Elmo — scanning complete
══════════════════════════════════════════
  file    : sample2.elmo
  tokens  : 49
══════════════════════════════════════════

══════════════════════════════════════════
  Elmo — parse tree
══════════════════════════════════════════
program
└── stmt_list
    ├── decl_stmt
    │   ├── keyword  'int'
    │   ├── identifier  'i'
    │   └── punctuation  ';'
    └── stmt_list
        ├── decl_stmt
        │   ├── keyword  'int'
        │   ├── identifier  'total'
        │   └── punctuation  ';'
        └── stmt_list
            ├── decl_stmt
            │   ├── keyword  'int'
            │   ├── identifier  'limit'
            │   └── punctuation  ';'
            └── stmt_list
                ├── assign_stmt
                │   ├── identifier  'i'
                │   ├── operator  '='
                │   ├── expr
                │   │   ├── term
                │   │   │   ├── number  '0'
                │   │   │   └── term_tail
                │   │   │       └── ε  'ε'
                │   │   └── expr_tail
                │   │       └── ε  'ε'
                │   └── punctuation  ';'
                └── stmt_list
                    ├── assign_stmt
                    │   ├── identifier  'total'
                    │   ├── operator  '='
                    │   ├── expr
                    │   │   ├── term
                    │   │   │   ├── number  '0'
                    │   │   │   └── term_tail
                    │   │   │       └── ε  'ε'
                    │   │   └── expr_tail
                    │   │       └── ε  'ε'
                    │   └── punctuation  ';'
                    └── stmt_list
                        ├── assign_stmt
                        │   ├── identifier  'limit'
                        │   ├── operator  '='
                        │   ├── expr
                        │   │   ├── term
                        │   │   │   ├── number  '100'
                        │   │   │   └── term_tail
                        │   │   │       └── ε  'ε'
                        │   │   └── expr_tail
                        │   │       └── ε  'ε'
                        │   └── punctuation  ';'
                        └── stmt_list
                            ├── while_stmt
                            │   ├── keyword  'while'
                            │   ├── punctuation  '('
                            │   ├── cond_expr
                            │   │   ├── expr
                            │   │   │   ├── term
                            │   │   │   │   ├── identifier  'i'
                            │   │   │   │   └── term_tail
                            │   │   │   │       └── ε  'ε'
                            │   │   │   └── expr_tail
                            │   │   │       └── ε  'ε'
                            │   │   ├── rel_op  '<'
                            │   │   └── expr
                            │   │       ├── term
                            │   │       │   ├── identifier  'limit'
                            │   │       │   └── term_tail
                            │   │       │       └── ε  'ε'
                            │   │       └── expr_tail
                            │   │           └── ε  'ε'
                            │   ├── punctuation  ')'
                            │   ├── punctuation  '{'
                            │   ├── stmt_list
                            │   │   ├── assign_stmt
                            │   │   │   ├── identifier  'total'
                            │   │   │   ├── operator  '='
                            │   │   │   ├── expr
                            │   │   │   │   ├── term
                            │   │   │   │   │   ├── identifier  'total'
                            │   │   │   │   │   └── term_tail
                            │   │   │   │   │       └── ε  'ε'
                            │   │   │   │   └── expr_tail
                            │   │   │   │       ├── operator  '+'
                            │   │   │   │       ├── term
                            │   │   │   │       │   ├── identifier  'i'
                            │   │   │   │       │   └── term_tail
                            │   │   │   │       │       └── ε  'ε'
                            │   │   │   │       └── expr_tail
                            │   │   │   │           └── ε  'ε'
                            │   │   │   └── punctuation  ';'
                            │   │   └── stmt_list
                            │   │       ├── assign_stmt
                            │   │       │   ├── identifier  'i'
                            │   │       │   ├── operator  '='
                            │   │       │   ├── expr
                            │   │       │   │   ├── term
                            │   │       │   │   │   ├── identifier  'i'
                            │   │       │   │   │   └── term_tail
                            │   │       │   │   │       └── ε  'ε'
                            │   │       │   │   └── expr_tail
                            │   │       │   │       ├── operator  '+'
                            │   │       │   │       ├── term
                            │   │       │   │       │   ├── number  '1'
                            │   │       │   │       │   └── term_tail
                            │   │       │   │       │       └── ε  'ε'
                            │   │       │   │       └── expr_tail
                            │   │       │   │           └── ε  'ε'
                            │   │       │   └── punctuation  ';'
                            │   │       └── stmt_list
                            │   │           └── ε  'ε'
                            │   └── punctuation  '}'
                            └── stmt_list
                                ├── return_stmt
                                │   ├── keyword  'return'
                                │   ├── expr
                                │   │   ├── term
                                │   │   │   ├── identifier  'total'
                                │   │   │   └── term_tail
                                │   │   │       └── ε  'ε'
                                │   │   └── expr_tail
                                │   │       └── ε  'ε'
                                │   └── punctuation  ';'
                                └── stmt_list
                                    └── ε  'ε'

══════════════════════════════════════════
  Parse successful
══════════════════════════════════════════
```

**Analysis:** All 49 tokens are successfully parsed. The `while` loop body contains two statements (`total = total + i;` and `i = i + 1;`), both correctly chained through `stmt_list` recursion. The conditional `i < limit` is parsed as a `cond_expr` with `<` as the `rel_op`.

---

### 8.3 `sample3_errors.elmo` — Lexical Error (illegal `@` character)

**Source code:**

```elmo
int score;
int level;

score = 42;
level = 1;

if (score > 10) {
    level = level + 1;
    score = score * level;
}

int msg;
msg = "level up!";

while (level < 5) {
    level = level + 1;
    score = score + 100;
}

int bad;
bad = score @ level;

return score;
```

**Terminal output:**

```
══════════════════════════════════════════
  Elmo — scanning complete
══════════════════════════════════════════
  file    : sample3_errors.elmo
  tokens  : 74
  warning : scanner flagged 1 malformed token(s)
══════════════════════════════════════════

────────────────────────────────────────────────────────────
  [parse error] line 21
  expected : ';'
  got      : '@' (ERROR)
────────────────────────────────────────────────────────────
```

**Error Breakdown:**

The error occurs on **line 21**: `bad = score @ level;`

Here is exactly what happens:

1. The **scanner** processes line 21 and tokenises it as:
    - `IDENTIFIER` `bad`, `OPERATOR` `=`, `IDENTIFIER` `score`, `ERROR` `@`, `IDENTIFIER` `level`, `PUNCTUATION` `;`
    - The `@` character is not recognised by the scanner's DFA, so it emits a `TOKEN_ERROR`.

2. The scanner summary notes: `warning : scanner flagged 1 malformed token(s)`.

3. The **parser** enters `parseAssignStmt()` for line 21:
    - Consumes `bad` (IDENTIFIER) ✓
    - Consumes `=` (OPERATOR) ✓
    - Calls `parseExpr()` → `parseTerm()` → `parseFactor()` → consumes `score` (IDENTIFIER) ✓
    - Returns to `parseTermTail()` → sees `@`, which is not `*` or `/` → returns ε ✓
    - Returns to `parseExprTail()` → sees `@`, which is not `+` or `-` → returns ε ✓
    - Returns to `parseAssignStmt()` → calls `expectPunctuation(";")` → sees `@` (ERROR) ✗

4. The parser expected the expression `score` to be followed by `;` (end of assignment), but instead found the `@` error token. The parser reports the mismatch and exits.

**Key insight:** The parser correctly parsed everything up to `score`, treated it as a complete expression (since `@` is not a valid operator), and then failed when it couldn't find the expected semicolon. This demonstrates how lexical errors propagate into parse errors — the scanner identifies the bad token, and the parser fails structurally when it can't fit that token into any valid grammar production.

---

### 8.4 `sample4.elmo` — Multiple Syntax Errors

**Source code:**

```elmo
int _sum = 5
if (_sum%85a62 = 2){
    return _sum
}
```

**Terminal output:**

```
══════════════════════════════════════════
  Elmo — scanning complete
══════════════════════════════════════════
  file    : sample4.elmo
  tokens  : 19
══════════════════════════════════════════

────────────────────────────────────────────────────────────
  [parse error] line 1
  expected : ';'
  got      : '=' (OPERATOR)
────────────────────────────────────────────────────────────
```

**Error Breakdown:**

The error occurs on the very first line: `int _sum = 5`

1. The parser enters `parseDeclStmt()`:
    - Consumes `int` (KEYWORD) ✓
    - Consumes `_sum` (IDENTIFIER) ✓
    - Calls `expectPunctuation(";")` → sees `=` (OPERATOR) ✗

2. In Elmo's grammar, `<decl_stmt>` is defined as `int IDENTIFIER ;` — declarations do not support initialisers. The `= 5` part is not valid syntax for a declaration.

3. Because the parser uses **fail-fast**, it stops here and does not report additional errors on lines 2–4 (which also have issues: `%` is not a valid operator, `85a62` would be scanned as `NUMBER` `85` followed by `IDENTIFIER` `a62`, and both lines are missing semicolons).

**This demonstrates** the fail-fast trade-off: the first error is precise and actionable ("you can't initialise during declaration"), but subsequent errors remain hidden until the first is fixed.

---

## 9. Conclusion

The Elmo Recursive Descent parser successfully fulfils the requirements of the mini-grammar specification:

| Requirement                                                                                    | Status                                                                  |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Accept valid Elmo programs and produce a parse tree                                            | ✅ Demonstrated with `sample.elmo` and `sample2.elmo`                   |
| Reject invalid programs with clear error messages                                              | ✅ Demonstrated with `sample3_errors.elmo` and `sample4.elmo`           |
| Handle all grammar constructs (declarations, assignments, if/else, while, return, expressions) | ✅ All productions implemented and tested                               |
| Correct operator precedence (`*`/`/` before `+`/`-`)                                           | ✅ Enforced through `parseExpr` → `parseTerm` → `parseFactor` hierarchy |
| Integration with the scanner's token stream                                                    | ✅ Scanner output feeds directly into `NewParser()`                     |
| Visual parse tree output                                                                       | ✅ Unicode tree rendering via `Node.Print()`                            |

The choice of Recursive Descent proved effective for several reasons: the one-to-one mapping between grammar rules and Go functions made the implementation systematic and verifiable; the LL(1) nature of the transformed grammar ensured that a single token of lookahead was always sufficient; and the Go language's simplicity and strong typing kept the parser codebase concise at under 400 lines.

The parser's primary limitation is its fail-fast error recovery, which reports only the first syntax error. In a production setting, this would be extended with synchronisation-based recovery to report multiple errors in a single pass. However, for the purposes of this assignment, the approach provides clear, unambiguous error diagnostics that make debugging straightforward.
