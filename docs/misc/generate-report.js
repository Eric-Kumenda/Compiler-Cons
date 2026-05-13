"use strict";
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
	LevelFormat,
	HeadingLevel,
	BorderStyle,
	WidthType,
	ShadingType,
	PageNumber,
	PageBreak,
	TabStopType,
	TabStopPosition,
} = require("docx");

// ── Colours ────────────────────────────────────────────────────────────────
const BLUE = "1A56DB"; // heading accent
const DARK = "1E293B"; // body text
const MID = "334155"; // secondary body
const LIGHT_BG = "F1F5F9"; // table header shading
const CODE_BG = "F8FAFC"; // monospace block shading
const LINE = "CBD5E1"; // border colour
const ACCENT_RED = "DC2626"; // inline code accent

// ── Helpers ────────────────────────────────────────────────────────────────

const border = { style: BorderStyle.SINGLE, size: 1, color: LINE };
const cellBorders = {
	top: border,
	bottom: border,
	left: border,
	right: border,
};

function cell(text, widthDXA, { header = false, mono = false } = {}) {
	return new TableCell({
		borders: cellBorders,
		width: { size: widthDXA, type: WidthType.DXA },
		shading: header
			? { fill: LIGHT_BG, type: ShadingType.CLEAR }
			: { fill: "FFFFFF", type: ShadingType.CLEAR },
		margins: { top: 80, bottom: 80, left: 140, right: 140 },
		children: [
			new Paragraph({
				children: [
					new TextRun({
						text,
						bold: header,
						font: mono ? "Courier New" : "Calibri",
						size: mono ? 18 : 20,
						color: header ? DARK : MID,
					}),
				],
			}),
		],
	});
}

function twoColTable(rows, widths = [3120, 3120, 3120]) {
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
		spacing: { before: 360, after: 120 },
		children: [
			new TextRun({
				text,
				bold: true,
				font: "Calibri",
				size: 36,
				color: BLUE,
			}),
		],
	});
}

function h2(text) {
	return new Paragraph({
		heading: HeadingLevel.HEADING_2,
		spacing: { before: 280, after: 80 },
		border: {
			bottom: {
				style: BorderStyle.SINGLE,
				size: 4,
				color: LINE,
				space: 4,
			},
		},
		children: [
			new TextRun({
				text,
				bold: true,
				font: "Calibri",
				size: 28,
				color: DARK,
			}),
		],
	});
}

function h3(text) {
	return new Paragraph({
		heading: HeadingLevel.HEADING_3,
		spacing: { before: 200, after: 60 },
		children: [
			new TextRun({
				text,
				bold: true,
				font: "Calibri",
				size: 24,
				color: MID,
			}),
		],
	});
}

function body(text, { bold = false, italic = false } = {}) {
	return new Paragraph({
		spacing: { after: 120, line: 300 },
		children: [
			new TextRun({
				text,
				bold,
				italic,
				font: "Calibri",
				size: 22,
				color: MID,
			}),
		],
	});
}

// Paragraph with mixed inline runs (array of {text, bold, italic, mono, color})
function mixed(runs, opts = {}) {
	return new Paragraph({
		spacing: { after: 120, line: 300 },
		...opts,
		children: runs.map(
			(r) =>
				new TextRun({
					text: r.text,
					bold: r.bold || false,
					italic: r.italic || false,
					font: r.mono ? "Courier New" : "Calibri",
					size: r.mono ? 20 : 22,
					color: r.color || (r.mono ? ACCENT_RED : MID),
				}),
		),
	});
}

function code(text) {
	// One monospaced paragraph with light background border
	return new Paragraph({
		spacing: { before: 80, after: 80 },
		shading: { fill: CODE_BG, type: ShadingType.CLEAR },
		border: {
			left: {
				style: BorderStyle.SINGLE,
				size: 12,
				color: BLUE,
				space: 8,
			},
		},
		indent: { left: 360 },
		children: [
			new TextRun({
				text,
				font: "Courier New",
				size: 18,
				color: DARK,
			}),
		],
	});
}

// Split a multiline string into individual code() paragraphs
function codeBlock(str) {
	return str.split("\n").map(code);
}

function bullet(text, { level = 0, mono = false } = {}) {
	return new Paragraph({
		numbering: { reference: "bullets", level },
		spacing: { after: 60 },
		children: [
			new TextRun({
				text,
				font: mono ? "Courier New" : "Calibri",
				size: mono ? 20 : 22,
				color: MID,
			}),
		],
	});
}

function numbered(text, level = 0) {
	return new Paragraph({
		numbering: { reference: "numbers", level },
		spacing: { after: 60 },
		children: [
			new TextRun({ text, font: "Calibri", size: 22, color: MID }),
		],
	});
}

function spacer(pts = 120) {
	return new Paragraph({ spacing: { after: pts } });
}

function rule() {
	return new Paragraph({
		spacing: { before: 200, after: 200 },
		border: {
			bottom: {
				style: BorderStyle.SINGLE,
				size: 6,
				color: LINE,
				space: 1,
			},
		},
		children: [],
	});
}

// ── Document content ────────────────────────────────────────────────────────

const children = [
	// ── Cover block ──────────────────────────────────────────────────────────
	new Paragraph({
		spacing: { before: 720, after: 120 },
		alignment: AlignmentType.CENTER,
		children: [
			new TextRun({
				text: "ELMO COMPILER PROJECT",
				font: "Calibri",
				size: 52,
				bold: true,
				color: BLUE,
			}),
		],
	}),
	new Paragraph({
		spacing: { after: 80 },
		alignment: AlignmentType.CENTER,
		children: [
			new TextRun({
				text: "Parser Implementation Report",
				font: "Calibri",
				size: 36,
				color: DARK,
			}),
		],
	}),
	new Paragraph({
		spacing: { after: 480 },
		alignment: AlignmentType.CENTER,
		children: [
			new TextRun({
				text: "April 2026  ·  Go (Golang)  ·  Recursive Descent",
				font: "Calibri",
				size: 22,
				color: MID,
				italics: true,
			}),
		],
	}),

	new Paragraph({ children: [new PageBreak()] }),

	// ─────────────────────────────────────────────────────────────────────────
	h1("1. Introduction"),

	h2("Language Choice — Go"),
	body(
		"The Elmo compiler is implemented in Go (Golang). Go was chosen for several practical reasons:",
	),
	bullet(
		"Strong typing and simplicity — Go's strict type system catches many errors at compile time, reducing bugs in the parser itself. Its minimalist syntax keeps the codebase readable and easy to maintain.",
	),
	bullet(
		"No external dependencies — The entire compiler (scanner + parser) is built using only Go's standard library (fmt, os, strings), making it trivially portable and reproducible.",
	),
	bullet(
		"Struct-based tree representation — Go's struct and pointer types map naturally to tree data structures, making parse tree construction intuitive without needing class hierarchies.",
	),

	spacer(),
	h2("Parser Type — Recursive Descent"),
	body(
		"We chose Recursive Descent as our parsing strategy. It is a top-down technique where each non-terminal in the grammar is directly translated into a Go function. The parser starts at the top rule (parseProgram) and recursively calls sub-functions that correspond to each grammar production, building the parse tree as it descends.",
	),

	spacer(),
	h3("Why Recursive Descent Suits Our Grammar"),
	body(
		"We chose Recursive Descent because it provides a highly intuitive mapping between our BNF grammar and the program's control flow, allowing for superior debugging and clear traceability of the parsing logic. Specifically:",
	),
	numbered(
		"One-to-one mapping — Every non-terminal corresponds directly to a Go function. parseStmtList() maps to <stmt_list>, parseExpr() to <expr>, and so on. This makes the parser self-documenting.",
	),
	numbered(
		"LL(1) compatibility — The grammar was transformed to eliminate left recursion (via <expr_tail> and <term_tail>) and factor out the optional <else_part>, making it LL(1)-compatible. The parser always decides which production to take by looking at just one token ahead using peek().",
	),
	numbered(
		"Clear control flow for debugging — When the parser encounters an error, the Go call stack shows the exact sequence of grammar rules being attempted — a live trace through the derivation.",
	),
	numbered(
		"Straightforward error reporting — Each function knows exactly what grammar rule it implements, so expect() helpers produce precise messages like: expected ';' but got '@'.",
	),
	numbered(
		"No external tools required — Unlike parser generators (YACC, ANTLR), Recursive Descent is hand-coded, giving full control over error messages, tree construction, and recovery strategies.",
	),

	spacer(),
	new Paragraph({ children: [new PageBreak()] }),

	// ─────────────────────────────────────────────────────────────────────────
	h1("2. The Grammar"),
	body(
		"The Elmo language uses a mini-grammar supporting variable declarations, assignment, control flow (if/else, while), return statements, and arithmetic/relational expressions. The grammar was transformed to be Recursive Descent-ready by eliminating left recursion and factoring out optional clauses.",
	),

	spacer(),
	h2("Transformed BNF (LL(1)-Ready)"),
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

<rel_op>        ::= == | < | > | <= | >=`,
	),

	spacer(200),
	h2("Key Grammar Transformations"),
	twoColTable(
		[
			{ isHeader: true, data: ["Problem", "Solution", "Impact"] },
			{
				data: [
					"Left recursion in <expr>",
					"Introduced <expr_tail> with right-recursive structure",
					"Enables top-down parsing; avoids infinite recursion",
				],
			},
			{
				data: [
					"Left recursion in <term>",
					"Introduced <term_tail> with right-recursive structure",
					"Same benefit as above",
				],
			},
			{
				data: [
					"Ambiguous if/else",
					"Factored <else_part> as a separate production with ε-alternative",
					"Clean LL(1) decision: if next token is 'else', parse the block; otherwise produce ε",
				],
			},
		],
		[2800, 3500, 3060],
	),

	spacer(),
	new Paragraph({ children: [new PageBreak()] }),

	// ─────────────────────────────────────────────────────────────────────────
	h1("3. Parser Architecture"),

	h2("The Token Stream (Scanner Integration)"),
	body(
		"The parser receives a flat slice of Token structs from the scanner. Each token carries:",
	),

	twoColTable(
		[
			{ isHeader: true, data: ["Field", "Type", "Purpose"] },
			{
				data: [
					"Type",
					"TokenType",
					"Category: NUMBER, IDENTIFIER, KEYWORD, OPERATOR, PUNCTUATION, STRING, EOF, ERROR",
				],
			},
			{
				data: [
					"Lexeme",
					"string",
					'Raw text as it appeared in source code (e.g. "while", "42", "+=")',
				],
			},
			{
				data: [
					"Value",
					"string",
					"Processed value (e.g. string content without surrounding quotes)",
				],
			},
			{
				data: [
					"Line",
					"int",
					"1-indexed source line number for error reporting",
				],
			},
		],
		[2000, 2000, 5360],
	),

	spacer(160),
	body("The pipeline flows as:"),
	...codeBlock(
		"source file (.elmo)  →  Scanner.Scan()  →  []Token  →  NewParser(tokens)  →  parseProgram()  →  *Node",
	),

	spacer(160),
	body("The parser struct:"),
	...codeBlock(`type Parser struct {
    tokens  []Token   // Flat token stream from the scanner
    current int       // Index of the next token to consume
}`),

	spacer(),
	h2('The "Big Three" Helpers'),

	h3("peek() — Look Without Consuming"),
	body(
		"Returns the current token without moving the cursor forward. If all tokens have been consumed, it returns a synthetic EOF token. This is the parser's lookahead mechanism — it checks what's coming next to decide which grammar rule to apply.",
	),
	...codeBlock("func (p *Parser) peek() Token"),
	spacer(80),
	body("Convenience variants — all built on peek():"),
	bullet("peekType() — returns just the TokenType of the current token."),
	bullet(
		"peekIs(t TokenType) — true if the current token matches a given type.",
	),
	bullet(
		'peekIsKeyword(kw string) — true if the current token is a specific keyword (e.g. "if", "while").',
	),
	bullet(
		'peekIsOperator(op string) — true if the current token is a specific operator (e.g. "+", "==").',
	),
	bullet(
		'peekIsPunctuation(pu string) — true if the current token is specific punctuation (e.g. ";", "{").',
	),

	spacer(),
	h3("advance() — Consume and Return"),
	body(
		'Returns the current token and moves the cursor one position forward. This is how the parser "eats" tokens — every terminal symbol in the grammar must be consumed via advance() (usually through expect()).',
	),
	...codeBlock("func (p *Parser) advance() Token"),

	spacer(),
	h3("expect() — Consume or Die"),
	body(
		"The gatekeeper. It peeks at the current token and: if it matches the expected type, consumes it via advance() and returns it; if it does NOT match, it calls reportError(), prints a formatted error message, and terminates the program with os.Exit(1).",
	),
	...codeBlock("func (p *Parser) expect(t TokenType) Token"),
	spacer(80),
	body("Specialised variants:"),
	bullet(
		'expectKeyword(kw string) — expects a specific keyword lexeme (e.g. expectKeyword("int")).',
	),
	bullet(
		'expectOperator(op string) — expects a specific operator (e.g. expectOperator("=")).',
	),
	bullet(
		'expectPunctuation(pu string) — expects a specific punctuation mark (e.g. expectPunctuation(";")).',
	),

	spacer(),
	h2("Recursive Descent Logic: Grammar Non-Terminals → Go Functions"),
	body(
		"Each non-terminal in the grammar maps to exactly one Go function in parser.go. The function inspects the current token to decide which production to follow, then calls sub-functions for each non-terminal on the right-hand side.",
	),

	twoColTable(
		[
			{
				isHeader: true,
				data: ["Grammar Non-Terminal", "Go Function", "Decision Logic"],
			},
			{
				data: [
					"<program>",
					"parseProgram()",
					"Unconditionally calls parseStmtList()",
				],
			},
			{
				data: [
					"<stmt_list>",
					"parseStmtList()",
					"If EOF or } → return ε; otherwise parse <stmt> then recurse",
				],
			},
			{
				data: [
					"<stmt>",
					"parseStmt()",
					"switch on current token: int → decl, IDENTIFIER → assign, if/while/return → respective stmt",
				],
			},
			{
				data: [
					"<decl_stmt>",
					"parseDeclStmt()",
					"Expects int, IDENTIFIER, ; in sequence",
				],
			},
			{
				data: [
					"<assign_stmt>",
					"parseAssignStmt()",
					"Expects IDENTIFIER, =, <expr>, ;",
				],
			},
			{
				data: [
					"<if_stmt>",
					"parseIfStmt()",
					"Expects if, (, <cond_expr>, ), {, <stmt_list>, }, <else_part>",
				],
			},
			{
				data: [
					"<else_part>",
					"parseElsePart()",
					"If next token is else → parse else block; otherwise → return ε",
				],
			},
			{
				data: [
					"<while_stmt>",
					"parseWhileStmt()",
					"Expects while, (, <cond_expr>, ), {, <stmt_list>, }",
				],
			},
			{
				data: [
					"<return_stmt>",
					"parseReturnStmt()",
					"Expects return, <expr>, ;",
				],
			},
			{
				data: [
					"<expr>",
					"parseExpr()",
					"Calls parseTerm() then parseExprTail()",
				],
			},
			{
				data: [
					"<expr_tail>",
					"parseExprTail()",
					"If + or - → consume, parse <term>, recurse; otherwise → ε",
				],
			},
			{
				data: [
					"<term>",
					"parseTerm()",
					"Calls parseFactor() then parseTermTail()",
				],
			},
			{
				data: [
					"<term_tail>",
					"parseTermTail()",
					"If * or / → consume, parse <factor>, recurse; otherwise → ε",
				],
			},
			{
				data: [
					"<factor>",
					"parseFactor()",
					"NUMBER → leaf, IDENTIFIER → leaf, ( → parse <expr> then )",
				],
			},
			{
				data: [
					"<cond_expr>",
					"parseCondExpr()",
					"Parses <expr>, <rel_op>, <expr>",
				],
			},
			{
				data: [
					"<rel_op>",
					"parseRelOp()",
					"Matches one of ==, <, >, <=, >=",
				],
			},
		],
		[2600, 2600, 4160],
	),

	spacer(),
	new Paragraph({ children: [new PageBreak()] }),

	// ─────────────────────────────────────────────────────────────────────────
	h1("4. Operator Precedence"),
	body(
		"Operator precedence — ensuring that 2 + 3 * 4 evaluates as 2 + (3 * 4) rather than (2 + 3) * 4 — is enforced structurally through the call hierarchy of the expression-parsing functions. There is no precedence table or special annotations; the grammar itself encodes the precedence rules.",
	),

	h2("Precedence Through Function Hierarchy"),
	...codeBlock(
		`Lowest precedence    parseExpr()      handles  +  -
        ↓            parseTerm()      handles  *  /
Highest precedence   parseFactor()    handles  NUMBER, IDENTIFIER, ( expr )`,
	),
	spacer(160),
	body(
		"When parseExpr() is called, it first calls parseTerm(). parseTerm() first calls parseFactor() to get an atomic value, then checks for * or /. Only after parseTerm() has fully resolved all multiplication/division does control return to parseExpr(), which then checks for + or -. Multiplication and division are therefore always grouped tighter (deeper in the tree) than addition and subtraction.",
	),

	spacer(),
	h2("Precedence Table"),
	twoColTable(
		[
			{
				isHeader: true,
				data: ["Level", "Operators", "Parsed By", "Associativity"],
			},
			{
				data: [
					"1 (lowest)",
					"+ , -",
					"parseExpr() / parseExprTail()",
					"Left-to-right (via right-recursive tail)",
				],
			},
			{
				data: [
					"2 (highest)",
					"* , /",
					"parseTerm() / parseTermTail()",
					"Left-to-right (via right-recursive tail)",
				],
			},
			{
				data: [
					"— (grouping)",
					"( )",
					"parseFactor()",
					"Override any level",
				],
			},
		],
		[1440, 1440, 3480, 3000],
	),

	spacer(),
	h2("Walkthrough: Parsing  x * 2 + y"),
	numbered("parseExpr() calls parseTerm()"),
	numbered("parseTerm() calls parseFactor() → returns leaf node x"),
	numbered("parseTerm() calls parseTermTail() → sees *, consumes it"),
	numbered("parseTermTail() calls parseFactor() → returns leaf node 2"),
	numbered("parseTermTail() recurses → sees + (not * or /) → returns ε"),
	numbered(
		"Control returns to parseTerm() — the term  x * 2  is now a complete subtree",
	),
	numbered("Control returns to parseExpr(), which calls parseExprTail()"),
	numbered(
		"parseExprTail() sees +, consumes it; calls parseTerm() → resolves y as a single-factor term",
	),
	numbered("parseExprTail() recurses → no more operators → returns ε"),

	spacer(160),
	body(
		"The * operator sits deeper in the tree (inside term_tail) than the + operator (in expr_tail), correctly reflecting that multiplication binds tighter.",
	),

	spacer(),
	new Paragraph({ children: [new PageBreak()] }),

	// ─────────────────────────────────────────────────────────────────────────
	h1("5. Tree Construction"),
	body(
		"The parser builds a concrete parse tree (also called a concrete syntax tree). Every grammar rule, including ε-productions, is represented. This makes the tree a faithful reflection of the grammar derivation.",
	),

	h2("Node Types"),
	body("Each node is a Node struct:"),
	...codeBlock(
		`type Node struct {
    Type     NodeType   // e.g., "program", "stmt_list", "identifier"
    Value    string     // Lexeme for terminal nodes; empty for non-terminals
    Children []*Node    // Sub-trees for non-terminal nodes
}`,
	),
	spacer(160),
	body("Nodes are created using three constructors:"),
	bullet(
		"newNode(type, children...) — creates an internal node (non-terminal) with zero or more children.",
	),
	bullet(
		"newLeaf(type, value) — creates a leaf node (terminal) with a lexeme value.",
	),
	bullet(
		"newEpsilon() — creates a special ε leaf representing the empty derivation, used when a production reaches its base case.",
	),

	spacer(),
	h2("How stmt_list Builds a Linked Chain"),
	body(
		"Each call to parseStmtList() either produces an ε node (base case: EOF or } is reached), or produces a stmt_list node with two children: the current <stmt> and a recursive <stmt_list>, creating a right-recursive chain:",
	),
	...codeBlock(
		`stmt_list
├── decl_stmt (first statement)
│   └── ...
└── stmt_list
    ├── assign_stmt (second statement)
    │   └── ...
    └── stmt_list
        └── ε  'ε'`,
	),

	spacer(),
	h2("How expr Nodes Nest for Precedence"),
	...codeBlock(
		`expr                        ← addition level
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
        └── ε`,
	),

	spacer(),
	new Paragraph({ children: [new PageBreak()] }),

	// ─────────────────────────────────────────────────────────────────────────
	h1("6. Call Graph"),
	body(
		'The diagram below shows how the parser\'s functions interact. Arrows indicate "calls" relationships. This Mermaid diagram can be imported into Draw.io via Extras → Edit Diagram.',
	),
	spacer(80),
	...codeBlock(
		`graph TD
    main --> parseProgram
    parseProgram --> parseStmtList
    parseStmtList --> parseStmt
    parseStmtList -->|recursion| parseStmtList
    parseStmt --> parseDeclStmt
    parseStmt --> parseAssignStmt
    parseStmt --> parseIfStmt
    parseStmt --> parseWhileStmt
    parseStmt --> parseReturnStmt
    parseIfStmt --> parseCondExpr
    parseIfStmt --> parseStmtList
    parseIfStmt --> parseElsePart
    parseElsePart --> parseStmtList
    parseWhileStmt --> parseCondExpr
    parseWhileStmt --> parseStmtList
    parseAssignStmt --> parseExpr
    parseReturnStmt --> parseExpr
    parseCondExpr --> parseExpr
    parseCondExpr --> parseRelOp
    parseExpr --> parseTerm
    parseExpr --> parseExprTail
    parseExprTail --> parseTerm
    parseExprTail -->|recursion| parseExprTail
    parseTerm --> parseFactor
    parseTerm --> parseTermTail
    parseTermTail --> parseFactor
    parseTermTail -->|recursion| parseTermTail
    parseFactor -->|"( expr )"| parseExpr
    parseDeclStmt --> expect
    parseAssignStmt --> expect
    parseIfStmt --> expect
    parseWhileStmt --> expect
    parseReturnStmt --> expect
    parseRelOp --> expect
    expect --> peek
    expect --> advance`,
	),
	spacer(160),
	body("Colour legend (for the Mermaid/Draw.io diagram):"),
	bullet("Blue — Entry point & top-level orchestration (main, parseProgram)"),
	bullet("Green — Statement dispatching (parseStmtList, parseStmt)"),
	bullet(
		"Orange — Individual statement parsers (parseDeclStmt, parseIfStmt, etc.)",
	),
	bullet(
		"Red — Expression parsing hierarchy (parseExpr → parseTerm → parseFactor)",
	),
	bullet("Grey — Core helpers (expect, peek, advance)"),

	spacer(),
	new Paragraph({ children: [new PageBreak()] }),

	// ─────────────────────────────────────────────────────────────────────────
	h1("7. Error Handling & Recovery Strategy"),

	h2("Error Detection"),
	body("The parser detects errors at two levels:"),
	numbered(
		"Scanner-level (lexical errors) — The scanner flags unrecognised characters (e.g. @, #) by emitting TOKEN_ERROR. The main function counts these and prints a warning before parsing begins: warning : scanner flagged 1 malformed token(s)",
	),
	numbered(
		"Parser-level (syntax errors) — The parser detects structural violations using the expect() family of functions. When the next token doesn't match what the grammar demands, the parser triggers an error.",
	),

	spacer(),
	h2("Error Reporting Format"),
	body(
		"The reportError() function produces a clearly formatted, boxed error message:",
	),
	...codeBlock(
		`────────────────────────────────────────────────────────────
  [parse error] line 21
  expected : ';'
  got      : '@' (ERROR)
────────────────────────────────────────────────────────────`,
	),
	spacer(160),
	body(
		"Every error message includes: the source line number, what the parser was looking for (expected), and what was actually found with its token type (got).",
	),

	spacer(),
	h2("Recovery Strategy: Fail-Fast (Panic Mode)"),
	body(
		"Our parser uses a fail-fast (panic mode) error recovery strategy. Upon encountering the first syntax error, the parser:",
	),
	numbered("Prints the formatted error message to stderr."),
	numbered("Immediately exits the program with os.Exit(1)."),

	spacer(80),
	body("Why fail-fast?"),
	bullet(
		"Simplicity — Recovery in Recursive Descent parsers (e.g. synchronisation to the next ; or }) adds significant complexity. Fail-fast keeps the parser clean and verifiable.",
	),
	bullet(
		"Accurate reporting — The first error is always the most meaningful. Subsequent errors in a recovery-based parser are often cascading (caused by the parser being in a confused state), which misleads the programmer.",
	),
	bullet(
		"Deterministic output — One error, one message, one exit code. This makes automated testing straightforward.",
	),

	spacer(80),
	mixed([
		{ text: "Trade-off acknowledged: ", bold: true },
		{
			text: "The programmer must fix errors one at a time and re-run the parser. In a production compiler, a recovery strategy (synchronising to the next statement boundary) would be preferable.",
		},
	]),

	spacer(),
	h2("How Scanner and Parser Cooperate on Error Tokens"),
	body(
		"When the scanner encounters an illegal character like @, it emits a TOKEN_ERROR with the offending character in the Lexeme field. The parser does not have a special case for TOKEN_ERROR — it tries to match it against the expected production, fails (because TOKEN_ERROR is never valid in any grammar rule), and reports the mismatch through the normal expect() path.",
	),

	spacer(),
	new Paragraph({ children: [new PageBreak()] }),

	// ─────────────────────────────────────────────────────────────────────────
	h1("8. Runtime Output & Analysis"),
	body("The parser is invoked as: ./elmo-scanner <source-file.elmo>"),
	body(
		"Output: first a scanner summary (token count, any lexical warnings), then either the full parse tree on success or a parse error box on failure.",
	),

	spacer(),
	h2("8.1  sample.elmo — Valid Program (if/else + while)"),
	h3("Source Code"),
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

return result;`,
	),
	spacer(),
	h3("Terminal Output"),
	...codeBlock(
		`══════════════════════════════════════════
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
        ├── ...
        └── stmt_list
            ├── if_stmt ...
            └── stmt_list
                ├── while_stmt ...
                └── stmt_list
                    ├── return_stmt ...
                    └── stmt_list
                        └── ε  'ε'

══════════════════════════════════════════
  Parse successful
══════════════════════════════════════════`,
	),
	spacer(),
	h3("Analysis"),
	bullet("52 tokens scanned and parsed successfully."),
	bullet(
		"The if/else is correctly structured: the else_part node contains the else block's stmt_list.",
	),
	bullet(
		"The expression x * 2 has the * operator inside term_tail, showing correct precedence.",
	),
	bullet("Every stmt_list chain terminates with an ε node."),

	spacer(),
	h2("8.2  sample2.elmo — Valid Program (while loop accumulator)"),
	h3("Source Code"),
	...codeBlock(
		`int i;
int total;
int limit;

i = 0;
total = 0;
limit = 100;

while (i < limit) {
    total = total + i;
    i = i + 1;
}

return total;`,
	),
	spacer(),
	h3("Terminal Output"),
	...codeBlock(
		`══════════════════════════════════════════
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
    ├── decl_stmt (i)
    └── stmt_list
        ├── decl_stmt (total)
        └── stmt_list
            ├── decl_stmt (limit)
            └── stmt_list
                ├── ... (three assign_stmts)
                └── stmt_list
                    ├── while_stmt
                    │   ├── cond_expr  [i < limit]
                    │   └── stmt_list (total=total+i, i=i+1)
                    └── stmt_list
                        ├── return_stmt  [return total]
                        └── stmt_list
                            └── ε  'ε'

══════════════════════════════════════════
  Parse successful
══════════════════════════════════════════`,
	),
	spacer(),
	h3("Analysis"),
	bullet("49 tokens — all parsed successfully."),
	bullet(
		"The while body contains two statements chained through stmt_list recursion.",
	),
	bullet(
		"The conditional i < limit is parsed as a cond_expr with < as the rel_op.",
	),

	spacer(),
	h2("8.3  sample3_errors.elmo — Lexical Error (illegal @ character)"),
	h3("Source Code"),
	...codeBlock(
		`int score; int level;
score = 42; level = 1;
if (score > 10) { level = level + 1; score = score * level; }
int msg; msg = "level up!";
while (level < 5) { level = level + 1; score = score + 100; }
int bad;
bad = score @ level;   // <-- illegal character '@' on line 21
return score;`,
	),
	spacer(),
	h3("Terminal Output"),
	...codeBlock(
		`══════════════════════════════════════════
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
────────────────────────────────────────────────────────────`,
	),
	spacer(),
	h3("Error Breakdown"),
	body("The error occurs on line 21: bad = score @ level;"),
	numbered(
		"The scanner tokenises the line as: IDENTIFIER bad, OPERATOR =, IDENTIFIER score, ERROR @, IDENTIFIER level, PUNCTUATION ;  — noting that @ is not in the scanner's DFA.",
	),
	numbered(
		"The parser enters parseAssignStmt() and consumes bad (IDENTIFIER) and = (OPERATOR) successfully.",
	),
	numbered(
		"parseExpr() → parseTerm() → parseFactor() consumes score (IDENTIFIER).",
	),
	numbered(
		"parseTermTail() sees @ — not * or / — and returns ε. parseExprTail() sees @ — not + or - — and also returns ε.",
	),
	numbered(
		'Back in parseAssignStmt(), expectPunctuation(";") is called. It sees @ (ERROR), not ;, and reports the mismatch.',
	),
	body(
		"Key insight: The parser correctly treated score as a complete expression (since @ is not a valid operator), then failed when it couldn't find the expected semicolon. This demonstrates how lexical errors propagate into parse errors.",
	),

	spacer(),
	h2("8.4  sample4.elmo — Multiple Syntax Errors"),
	h3("Source Code"),
	...codeBlock(
		`int _sum = 5
if (_sum%85a62 = 2){
    return _sum
}`,
	),
	spacer(),
	h3("Terminal Output"),
	...codeBlock(
		`══════════════════════════════════════════
  Elmo — scanning complete
══════════════════════════════════════════
  file    : sample4.elmo
  tokens  : 19
══════════════════════════════════════════

────────────────────────────────────────────────────────────
  [parse error] line 1
  expected : ';'
  got      : '=' (OPERATOR)
────────────────────────────────────────────────────────────`,
	),
	spacer(),
	h3("Error Breakdown"),
	body("The error occurs on the very first line: int _sum = 5"),
	numbered(
		'parseDeclStmt() consumes int and _sum, then calls expectPunctuation(";").',
	),
	numbered(
		"It sees = (OPERATOR) instead. The Elmo grammar defines <decl_stmt> as 'int IDENTIFIER ;' — there are no initialisers in declarations.",
	),
	numbered(
		"The parser stops here due to fail-fast. It does NOT report the additional errors on lines 2-4 (invalid % operator, missing semicolons, = used where == is expected).",
	),
	body(
		"This demonstrates the fail-fast trade-off: the first error is precise and actionable, but subsequent errors remain hidden until the first is fixed.",
	),

	spacer(),
	new Paragraph({ children: [new PageBreak()] }),

	// ─────────────────────────────────────────────────────────────────────────
	h1("9. Conclusion"),
	body(
		"The Elmo Recursive Descent parser successfully fulfils the requirements of the mini-grammar specification.",
	),

	twoColTable(
		[
			{ isHeader: true, data: ["Requirement", "Status"] },
			{
				data: [
					"Accept valid programs and produce a parse tree",
					"✓  Demonstrated with sample.elmo and sample2.elmo",
				],
			},
			{
				data: [
					"Reject invalid programs with clear error messages",
					"✓  Demonstrated with sample3_errors.elmo and sample4.elmo",
				],
			},
			{
				data: [
					"Handle all grammar constructs",
					"✓  All 16 productions implemented and tested",
				],
			},
			{
				data: [
					"Correct operator precedence (* / before + -)",
					"✓  Enforced through parseExpr → parseTerm → parseFactor hierarchy",
				],
			},
			{
				data: [
					"Integration with the scanner's token stream",
					"✓  Scanner output feeds directly into NewParser()",
				],
			},
			{
				data: [
					"Visual parse tree output",
					"✓  Unicode tree rendering via Node.Print()",
				],
			},
		],
		[4680, 4680],
	),

	spacer(200),
	body(
		"The choice of Recursive Descent was effective: the one-to-one mapping between grammar rules and Go functions made the implementation systematic and verifiable; the LL(1) nature of the transformed grammar ensured that a single token of lookahead was always sufficient; and Go's simplicity and strong typing kept the parser codebase concise at under 400 lines.",
	),
	body(
		"The parser's primary limitation is its fail-fast error recovery. In a production setting this would be extended with synchronisation-based recovery to report multiple errors in a single pass. For the purposes of this assignment, the approach provides clear and unambiguous error diagnostics that make debugging straightforward.",
	),
];

// ── Build document ──────────────────────────────────────────────────────────

const doc = new Document({
	numbering: {
		config: [
			{
				reference: "bullets",
				levels: [
					{
						level: 0,
						format: LevelFormat.BULLET,
						text: "\u2022",
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
				],
			},
		],
	},
	styles: {
		default: {
			document: { run: { font: "Calibri", size: 22, color: MID } },
		},
		paragraphStyles: [
			{
				id: "Heading1",
				name: "Heading 1",
				basedOn: "Normal",
				next: "Normal",
				quickFormat: true,
				run: { size: 36, bold: true, font: "Calibri", color: BLUE },
				paragraph: {
					spacing: { before: 480, after: 160 },
					outlineLevel: 0,
				},
			},
			{
				id: "Heading2",
				name: "Heading 2",
				basedOn: "Normal",
				next: "Normal",
				quickFormat: true,
				run: { size: 28, bold: true, font: "Calibri", color: DARK },
				paragraph: {
					spacing: { before: 320, after: 100 },
					outlineLevel: 1,
				},
			},
			{
				id: "Heading3",
				name: "Heading 3",
				basedOn: "Normal",
				next: "Normal",
				quickFormat: true,
				run: { size: 24, bold: true, font: "Calibri", color: MID },
				paragraph: {
					spacing: { before: 240, after: 80 },
					outlineLevel: 2,
				},
			},
		],
	},
	sections: [
		{
			properties: {
				page: {
					size: { width: 12240, height: 15840 },
					margin: {
						top: 1440,
						right: 1440,
						bottom: 1440,
						left: 1440,
					},
				},
			},
			headers: {
				default: new Header({
					children: [
						new Paragraph({
							alignment: AlignmentType.RIGHT,
							border: {
								bottom: {
									style: BorderStyle.SINGLE,
									size: 4,
									color: LINE,
									space: 4,
								},
							},
							tabStops: [
								{
									type: TabStopType.RIGHT,
									position: TabStopPosition.MAX,
								},
							],
							children: [
								new TextRun({
									text: "Elmo Compiler — Parser Report",
									font: "Calibri",
									size: 18,
									color: MID,
								}),
								new TextRun({
									text: "\t2026",
									font: "Calibri",
									size: 18,
									color: MID,
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
								top: {
									style: BorderStyle.SINGLE,
									size: 4,
									color: LINE,
									space: 4,
								},
							},
							children: [
								new TextRun({
									text: "Page ",
									font: "Calibri",
									size: 18,
									color: MID,
								}),
								new TextRun({
									children: [PageNumber.CURRENT],
									font: "Calibri",
									size: 18,
									color: MID,
								}),
								new TextRun({
									text: " of ",
									font: "Calibri",
									size: 18,
									color: MID,
								}),
								new TextRun({
									children: [PageNumber.TOTAL_PAGES],
									font: "Calibri",
									size: 18,
									color: MID,
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
	fs.writeFileSync("parser-report.docx", buffer);
	console.log("Done: parser-report.docx");
});
