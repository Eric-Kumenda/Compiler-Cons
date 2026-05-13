const fs = require("fs");
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    Header,
    Footer,
    AlignmentType,
    PageOrientation,
    LevelFormat,
    HeadingLevel,
    BorderStyle,
    WidthType,
    ShadingType,
    PageNumber,
    PageBreak
} = require("docx");

// ── Colors & Aesthetics ───────────────────────────────────────────────────
// Applying frontend-design principles: an editorial/technical aesthetic.
// Deep navy for primary headings, slate for text, crimson for highlights/instructions.
const PRIMARY = "0F172A"; // Slate 900 (Deep Navy)
const SECONDARY = "334155"; // Slate 700 (Body text)
const ACCENT = "0284C7"; // Light Blue for sub-elements
const LIGHT_BG = "F8FAFC"; // Slate 50 (Code blocks)
const CODE_BG = "F1F5F9"; // Slate 100
const LINE = "CBD5E1"; // Slate 300
const INSTRUCT_RED = "DC2626"; // Red 600 (For instructions)

const HEADING_FONT = "Georgia";
const BODY_FONT = "Segoe UI";
const MONO_FONT = "Courier New";

// ── Helpers ───────────────────────────────────────────────────────────────

function cell(text, widthDXA, { header = false, mono = false, red = false } = {}) {
    return new TableCell({
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: LINE },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: LINE },
            left: { style: BorderStyle.SINGLE, size: 1, color: LINE },
            right: { style: BorderStyle.SINGLE, size: 1, color: LINE },
        },
        width: { size: widthDXA, type: WidthType.DXA },
        shading: header
            ? { fill: CODE_BG, type: ShadingType.CLEAR }
            : { fill: "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text,
                        bold: header,
                        font: mono ? MONO_FONT : BODY_FONT,
                        size: mono ? 18 : 22,
                        color: red ? INSTRUCT_RED : (header ? PRIMARY : SECONDARY),
                    }),
                ],
            }),
        ],
    });
}

function table(rows, widths) {
    const total = widths.reduce((a, b) => a + b, 0);
    return new Table({
        width: { size: total, type: WidthType.DXA },
        columnWidths: widths,
        rows: rows.map(
            ({ data, isHeader }) =>
                new TableRow({
                    tableHeader: !!isHeader,
                    children: data.map((text, i) =>
                        cell(text, widths[i], { header: !!isHeader }),
                    ),
                }),
        ),
    });
}

function h1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        children: [
            new TextRun({
                text,
                bold: true,
                font: HEADING_FONT,
                size: 40,
                color: PRIMARY,
            }),
        ],
    });
}

function h2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 120 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 4 },
        },
        children: [
            new TextRun({
                text,
                bold: true,
                font: HEADING_FONT,
                size: 32,
                color: PRIMARY,
            }),
        ],
    });
}

function h3(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 80 },
        children: [
            new TextRun({
                text,
                bold: true,
                font: HEADING_FONT,
                size: 26,
                color: SECONDARY,
            }),
        ],
    });
}

function body(text, { bold = false, italic = false, color = SECONDARY } = {}) {
    return new Paragraph({
        spacing: { after: 120, line: 320 },
        children: [
            new TextRun({
                text,
                bold,
                italic,
                font: BODY_FONT,
                size: 22,
                color: color,
            }),
        ],
    });
}

function instruction(text) {
    return new Paragraph({
        spacing: { before: 160, after: 160 },
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text: text,
                bold: true,
                font: BODY_FONT,
                size: 24,
                color: INSTRUCT_RED,
            }),
        ],
    });
}

function bullet(text, level = 0) {
    return new Paragraph({
        numbering: { reference: "bullets", level },
        spacing: { after: 80, line: 300 },
        children: [
            new TextRun({
                text,
                font: BODY_FONT,
                size: 22,
                color: SECONDARY,
            }),
        ],
    });
}

function numbered(text, level = 0) {
    return new Paragraph({
        numbering: { reference: "numbers", level },
        spacing: { after: 80, line: 300 },
        children: [
            new TextRun({ text, font: BODY_FONT, size: 22, color: SECONDARY }),
        ],
    });
}

function codeBlock(str) {
    return str.split("\n").map(line => {
        return new Paragraph({
            spacing: { before: 40, after: 40 },
            shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
            indent: { left: 240 },
            border: {
                left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 12 },
            },
            children: [
                new TextRun({
                    text: line.replace(/\t/g, "    "), // replace tabs with spaces
                    font: MONO_FONT,
                    size: 18,
                    color: PRIMARY,
                }),
            ],
        });
    });
}

function spacer(pts = 240) {
    return new Paragraph({ spacing: { after: pts } });
}

// ── Document Content Construction ─────────────────────────────────────────

const children = [
    // --- Cover Page ---
    spacer(1440),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
            new TextRun({
                text: "ELMO COMPILER",
                font: HEADING_FONT,
                size: 72,
                bold: true,
                color: PRIMARY,
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 720 },
        children: [
            new TextRun({
                text: "Intermediate Code Generation (ICG) Report",
                font: HEADING_FONT,
                size: 40,
                color: ACCENT,
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
            new TextRun({
                text: "Compiler Construction | Group 3",
                font: BODY_FONT,
                size: 28,
                bold: true,
                color: SECONDARY,
            }),
        ],
    }),
    spacer(480),
    table(
        [
            { isHeader: true, data: ["Assigned Task", "Group Member"] },
            { data: ["Task 1: ICG Architecture & Quadruples Design", "Karuga Leo Munene (SCS3/146815/2023)"] },
            { data: ["Task 2: Expressions & Temporary Variable Gen", "Koech Sandra Cherop (SCS3/146544/2023)"] },
            { data: ["Task 3: Control Flow & Label Generation", "Wangari Morris Ngumo (P15/1906/2022)"] },
            { data: ["Task 4: Compilation Pipeline & Reporting", "Ochanda Eric Kumenda (SCS3/6959/2023)"] },
        ],
        [4680, 4680]
    ),
    new Paragraph({ children: [new PageBreak()] }),

    // --- Technical Deep Dive ---
    h1("Technical Deep Dive: How icg.go Works"),
    body("The Intermediate Code Generator (ICG) acts as Phase 3 of the compiler. It receives the concrete syntax tree generated by the parser and translates it into Three-Address Code (3AC) represented as a flat list of Quadruples."),
    instruction("<<< ADD DIAGRAM 1 HERE: Compiler Pipeline Architecture >>>"),

    h2("1. The Quadruple Representation"),
    body("At the core of the ICG is the Quad data structure. A quadruple consists of four main fields:"),
    bullet("Op: The operator or instruction (e.g., ADD, MUL, COPY, IFF, GOTO, LABEL, DECL)."),
    bullet("Arg1: The first operand (can be a variable, literal, or a temporary)."),
    bullet("Arg2: The second operand."),
    bullet("Result: The destination where the output is stored, or the target label for jumps."),
    body("The ICG struct maintains the global state: a slice of Quad structs, a tempNum counter for generating fresh temporary variables (t1, t2, ...), and a labelNum counter for generating unique jump labels (L1, L2, ...)."),

    h2("2. AST Traversal & Transformation Strategy"),
    body("The transformation algorithm performs a Depth-First, Post-Order Traversal of the syntax tree. The entry point is Generate(node *Node), which recursively dispatches to specific handler functions based on the Node.Type (e.g., genAssignStmt, genIfStmt, genExpr)."),
    body("By evaluating the children of a node before the parent, the generator ensures that inner expressions (like multiplication) are converted into quadruples before outer expressions (like addition). This naturally preserves the operator precedence already encoded in the parse tree structure."),

    h2("3. Expression Evaluation (Temporary Variables)"),
    body("When translating expressions like result = x * 2, the ICG delegates to genExpr and genTerm."),
    numbered("Leaf Nodes: Variables and numbers are returned as-is (x, 2).", 0),
    numbered("Operators: When genTermTail encounters the * operator, it generates a fresh temporary variable (e.g., t1) and emits: (MUL, x, 2, t1).", 0),
    numbered("Assignment: The genAssignStmt function takes the result of the expression evaluation (t1) and emits a copy instruction: (COPY, t1, _, result).", 0),
    instruction("<<< ADD DIAGRAM 4 HERE: AST to Quadruple Transformation (result = x * 2) >>>"),

    h2("4. Control Flow (Jumps and Labels)"),
    body("Control structures (if/else and while) require translating nested, scoped blocks into a linear sequence of instructions using conditional branches (IFF - If False) and unconditional jumps (GOTO)."),
    
    h3("Translating if-else (genIfStmt):"),
    numbered("The condition expression is evaluated into a temporary variable (e.g., t1).", 1),
    numbered("The ICG emits (IFF, t1, _, L_Else). If the condition is false, execution jumps to the else block.", 1),
    numbered("The then block's statements are traversed and quadruples emitted.", 1),
    numbered("To bypass the else block after the then block finishes, (GOTO, _, _, L_End) is emitted.", 1),
    numbered("The L_Else label is emitted via (LABEL, L_Else, _, _).", 1),
    numbered("The else block's statements are traversed.", 1),
    numbered("Finally, the L_End label is emitted.", 1),
    instruction("<<< ADD DIAGRAM 2 HERE: If/Else Statement ICG Translation >>>"),

    h3("Translating while (genWhileStmt):"),
    numbered("A start label (LABEL, L_Start, _, _) is emitted before evaluating the condition.", 2),
    numbered("The condition is evaluated into a temporary (e.g., t2).", 2),
    numbered("The loop escape branch is emitted: (IFF, t2, _, L_End).", 2),
    numbered("The loop body is traversed and its quadruples are emitted.", 2),
    numbered("At the end of the body, an unconditional jump forces re-evaluation: (GOTO, _, _, L_Start).", 2),
    numbered("The exit label (LABEL, L_End, _, _) is emitted at the very end.", 2),
    instruction("<<< ADD DIAGRAM 3 HERE: While Loop ICG Translation >>>"),
    
    body("This architecture cleanly transforms an arbitrarily complex hierarchical syntax tree into a flattened, assembly-like intermediate representation ready for target code generation or optimization."),
    new Paragraph({ children: [new PageBreak()] }),

    // --- Sections 1 to 5 ---
    h1("1. CFG in BNF format"),
    body("The Context-Free Grammar (CFG) used for our parser and subsequent ICG is LL(1)-compatible, derived by removing left-recursion and factoring."),
    ...codeBlock(
`<program>       ::= <stmt_list>

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

<rel_op>        ::= == | < | > | <= | >=`
    ),
    
    new Paragraph({ children: [new PageBreak()] }),
    h1("2. Source Code"),
    body("This is the sample program (sample.elmo) written in our language, which will be compiled into Intermediate Code."),
    ...codeBlock(
`int x;
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

return result;`
    ),

    new Paragraph({ children: [new PageBreak()] }),
    h1("3. Token List"),
    body("This is the stream of tokens produced by the lexical analyzer (scanner) when processing sample.elmo. It serves as input to the parser."),
    ...codeBlock(
`  TOKEN TYPE       LEXEME           LINE
  ----------------------------------------
  KEYWORD          int              1
  IDENTIFIER       x                1
  PUNCTUATION      ;                1
  KEYWORD          int              2
  IDENTIFIER       result           2
  PUNCTUATION      ;                2
  IDENTIFIER       x                3
  OPERATOR         =                3
  NUMBER           10               3
  PUNCTUATION      ;                3
  IDENTIFIER       result           4
  OPERATOR         =                4
  NUMBER           0                4
  PUNCTUATION      ;                4
  KEYWORD          if               6
  PUNCTUATION      (                6
  IDENTIFIER       x                6
  OPERATOR         >=               6
  NUMBER           5                6
  PUNCTUATION      )                6
  PUNCTUATION      {                6
  IDENTIFIER       result           7
  OPERATOR         =                7
  IDENTIFIER       x                7
  OPERATOR         *                7
  NUMBER           2                7
  PUNCTUATION      ;                7
  PUNCTUATION      }                8
  KEYWORD          else             8
  PUNCTUATION      {                8
  IDENTIFIER       result           9
  OPERATOR         =                9
  IDENTIFIER       x                9
  OPERATOR         +                9
  NUMBER           1                9
  PUNCTUATION      ;                9
  PUNCTUATION      }                10
  KEYWORD          while            12
  PUNCTUATION      (                12
  IDENTIFIER       result           12
  OPERATOR         >                12
  NUMBER           0                12
  PUNCTUATION      )                12
  PUNCTUATION      {                12
  IDENTIFIER       result           13
  OPERATOR         =                13
  IDENTIFIER       result           13
  OPERATOR         -                13
  NUMBER           1                13
  PUNCTUATION      ;                13
  PUNCTUATION      }                14
  KEYWORD          return           16
  IDENTIFIER       result           16
  PUNCTUATION      ;                16
  EOF                               17`
    ),

    new Paragraph({ children: [new PageBreak()] }),
    h1("4. Parse Tree"),
    body("This is the parse tree generated by the Recursive Descent parser. It acts as the input for our Intermediate Code Generator (ICG)."),
    ...codeBlock(
`program
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
                                └── ε  'ε'`
    ),

    new Paragraph({ children: [new PageBreak()] }),
    h1("5. Intermediate Code Generator (Run-Time Output)"),
    body("Below is the text representation of our compiler's runtime output for the ICG phase (showing the generated quadruples)."),
    ...codeBlock(
`══════════════════════════════════════════════════
  Elmo — Phase 3: Intermediate Code (Quadruples)
══════════════════════════════════════════════════

IDX     OP      ARG1        ARG2        RESULT
─────────────────────────────────────────────────────
0       DECL    x           _           _
1       DECL    result      _           _
2       COPY    10          _           x
3       COPY    0           _           result
4       GE      x           5           t1
5       IFF     t1          _           L1
6       MUL     x           2           t2
7       COPY    t2          _           result
8       GOTO    _           _           L2
9       LABEL   L1          _           _
10      ADD     x           1           t3
11      COPY    t3          _           result
12      LABEL   L2          _           _
13      LABEL   L3          _           _
14      GT      result      0           t4
15      IFF     t4          _           L4
16      SUB     result      1           t5
17      COPY    t5          _           result
18      GOTO    _           _           L3
19      LABEL   L4          _           _
20      RET     result      _           _
─────────────────────────────────────────────────────
Total instructions: 21`
    ),
    
    instruction("<<< ADD LEGIBLE SCREENSHOT OF TERMINAL SHOWING THE QUADRUPLES TABLE HERE >>>"),
];

// ── Build Document ────────────────────────────────────────────────────────

const doc = new Document({
    numbering: {
        config: [
            {
                reference: "bullets",
                levels: [
                    {
                        level: 0,
                        format: LevelFormat.BULLET,
                        text: "•",
                        alignment: AlignmentType.LEFT,
                        style: {
                            paragraph: { indent: { left: 720, hanging: 360 } },
                        },
                    },
                ],
            },
            {
                reference: "numbers",
                levels: [
                    {
                        level: 0,
                        format: LevelFormat.DECIMAL,
                        text: "%1.",
                        alignment: AlignmentType.LEFT,
                        style: {
                            paragraph: { indent: { left: 720, hanging: 360 } },
                        },
                    },
                    {
                        level: 1,
                        format: LevelFormat.DECIMAL,
                        text: "%2.",
                        alignment: AlignmentType.LEFT,
                        style: {
                            paragraph: { indent: { left: 720, hanging: 360 } },
                        },
                    },
                    {
                        level: 2,
                        format: LevelFormat.DECIMAL,
                        text: "%3.",
                        alignment: AlignmentType.LEFT,
                        style: {
                            paragraph: { indent: { left: 720, hanging: 360 } },
                        },
                    }
                ],
            },
        ],
    },
    sections: [
        {
            properties: {
                page: {
                    size: { width: 12240, height: 15840 },
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                },
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            border: {
                                bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 },
                            },
                            children: [
                                new TextRun({
                                    text: "Elmo Compiler — ICG Report",
                                    font: BODY_FONT,
                                    size: 18,
                                    color: SECONDARY,
                                }),
                            ],
                        }),
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            border: {
                                top: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 4 },
                            },
                            children: [
                                new TextRun({
                                    text: "Page ",
                                    font: BODY_FONT,
                                    size: 18,
                                    color: SECONDARY,
                                }),
                                new TextRun({
                                    children: [PageNumber.CURRENT],
                                    font: BODY_FONT,
                                    size: 18,
                                    color: SECONDARY,
                                }),
                                new TextRun({
                                    text: " of ",
                                    font: BODY_FONT,
                                    size: 18,
                                    color: SECONDARY,
                                }),
                                new TextRun({
                                    children: [PageNumber.TOTAL_PAGES],
                                    font: BODY_FONT,
                                    size: 18,
                                    color: SECONDARY,
                                }),
                            ],
                        }),
                    ],
                }),
            },
            children,
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("icg-report.docx", buffer);
    console.log("Done: icg-report.docx");
});
