# ICG Diagrams

Here are the supplementary diagrams that explain the inner workings of our Intermediate Code Generator. Copy the code blocks below and paste them into Draw.io (by going to Arrange > Insert > Advanced > Mermaid) to generate the visual diagrams.

## 1. Compiler Pipeline Architecture
This diagram shows how the ICG fits into the overall compiler pipeline.

```mermaid
flowchart LR
    A[Source Code:\nsample.elmo] -->|Character Stream| B[Lexical Analyzer\nScanner]
    B -->|Token Stream| C[Syntax Analyzer\nParser]
    C -->|Parse Tree / CST| D[Intermediate Code\nGenerator]
    D -->|Three-Address Code\nQuadruples| E[Optimization /\nTarget Code Gen]

    style A fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#fff
    style B fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    style C fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff
    style D fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style E fill:#64748b,stroke:#475569,stroke-width:2px,color:#fff,stroke-dasharray: 5 5
```

## 2. If/Else Statement ICG Translation
This flowchart illustrates the logic of how our `genIfStmt` function translates an If/Else statement into quadruples with jumps (`IFF` and `GOTO`).

```mermaid
flowchart TD
    Start([Start if-else block]) --> EvalCond[Evaluate Condition:\nt1 = x >= 5]
    EvalCond --> IFF{IFF t1 _ L1}
    IFF -->|True| ThenBlock[Then Body:\nresult = x * 2]
    IFF -->|False| LabelL1[LABEL L1]
    ThenBlock --> GotoL2[GOTO _ _ L2]
    GotoL2 --> LabelL2[LABEL L2]
    LabelL1 --> ElseBlock[Else Body:\nresult = x + 1]
    ElseBlock --> LabelL2
    LabelL2 --> End([Next Statement])

    style Start fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
    style EvalCond fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    style IFF fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff
    style ThenBlock fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style ElseBlock fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style GotoL2 fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff
    style LabelL1 fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#fff
    style LabelL2 fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#fff
    style End fill:#64748b,stroke:#475569,stroke-width:2px,color:#fff
```

## 3. While Loop ICG Translation
This flowchart demonstrates the quadruple layout generated for a `while` loop, particularly focusing on the return branch (`GOTO L_Start`) and conditional escape (`IFF`).

```mermaid
flowchart TD
    Start([Start while loop]) --> LabelLStart[LABEL L3]
    LabelLStart --> EvalCond[Evaluate Condition:\nt4 = result > 0]
    EvalCond --> IFF{IFF t4 _ L4}
    IFF -->|False| LabelLEnd[LABEL L4]
    IFF -->|True| Body[Loop Body:\nresult = result - 1]
    Body --> GotoLStart[GOTO _ _ L3]
    GotoLStart --> LabelLStart
    LabelLEnd --> End([Next Statement])

    style Start fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
    style LabelLStart fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#fff
    style EvalCond fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    style IFF fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff
    style Body fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style GotoLStart fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff
    style LabelLEnd fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#fff
    style End fill:#64748b,stroke:#475569,stroke-width:2px,color:#fff
```

## 4. AST to Quadruple Transformation (result = x * 2)
This diagram details how a specific assignment expression is traversed bottom-up to emit quadruples correctly preserving precedence.

```mermaid
flowchart TD
    AST_Assign(assign_stmt)
    AST_Result(identifier: result)
    AST_Op(=)
    AST_Expr(expr)
    AST_Term(term)
    AST_TermTail(term_tail)
    AST_OpMul(*)
    AST_Num(number: 2)
    AST_X(identifier: x)

    AST_Assign --> AST_Result
    AST_Assign --> AST_Op
    AST_Assign --> AST_Expr
    AST_Expr --> AST_Term
    AST_Term --> AST_X
    AST_Term --> AST_TermTail
    AST_TermTail --> AST_OpMul
    AST_TermTail --> AST_Num

    Emit1[1. Emit MUL: t1 = x * 2]
    Emit2[2. Emit COPY: result = t1]

    AST_TermTail -.-> Emit1
    AST_Assign -.-> Emit2

    style AST_Assign fill:#1e293b,stroke:#0f172a,color:#fff
    style AST_Result fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style AST_Expr fill:#1e293b,stroke:#0f172a,color:#fff
    style AST_Term fill:#1e293b,stroke:#0f172a,color:#fff
    style AST_TermTail fill:#1e293b,stroke:#0f172a,color:#fff
    style AST_X fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style AST_Num fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style AST_Op fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style AST_OpMul fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style Emit1 fill:#10b981,stroke:#047857,color:#fff
    style Emit2 fill:#10b981,stroke:#047857,color:#fff
```
