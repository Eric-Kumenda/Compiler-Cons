package main

import "fmt"

// ── Quadruple ────────────────────────────────────────────────────────────────
// A quadruple has the form: (op, arg1, arg2, result)
// Examples:
//   (ADD,  t1,  t2,  t3)   → t3 = t1 + t2
//   (COPY, x,   _,   t1)   → t1 = x
//   (LT,   t1,  t2,  t3)   → t3 = t1 < t2
//   (IFF,  t3,  _,   L1)   → if false t3 goto L1
//   (GOTO, _,   _,   L2)   → goto L2
//   (LABEL,L1,  _,   _  )  → L1:

type Quad struct {
	Index  int    // instruction number
	Op     string // operation
	Arg1   string // first operand
	Arg2   string // second operand
	Result string // destination
}

func (q Quad) String() string {
	return fmt.Sprintf("(%d)\t%-6s\t%-10s\t%-10s\t%s",
		q.Index, q.Op, q.Arg1, q.Arg2, q.Result)
}

// ── ICG ─────────────────────────────────────────────────────────────────────

type ICG struct {
	quads   []Quad
	tempNum int // counter for temp variables: t1, t2, ...
	labelNum int // counter for labels: L1, L2, ...
}

func NewICG() *ICG {
	return &ICG{}
}

// newTemp generates a new unique temporary variable name.
func (g *ICG) newTemp() string {
	g.tempNum++
	return fmt.Sprintf("t%d", g.tempNum)
}

// newLabel generates a new unique label name.
func (g *ICG) newLabel() string {
	g.labelNum++
	return fmt.Sprintf("L%d", g.labelNum)
}

// emit appends a quadruple to the instruction list.
func (g *ICG) emit(op, arg1, arg2, result string) {
	q := Quad{
		Index:  len(g.quads),
		Op:     op,
		Arg1:   arg1,
		Arg2:   arg2,
		Result: result,
	}
	g.quads = append(g.quads, q)
}

// Quads returns the complete list of generated quadruples.
func (g *ICG) Quads() []Quad {
	return g.quads
}

// ── Entry point ──────────────────────────────────────────────────────────────

// Generate walks the parse tree rooted at node and emits quadruples.
func (g *ICG) Generate(node *Node) {
	if node == nil {
		return
	}
	g.genNode(node)
}

// ── Node dispatch ────────────────────────────────────────────────────────────

func (g *ICG) genNode(n *Node) string {
	if n == nil {
		return ""
	}
	switch n.Type {
	case NODE_PROGRAM:
		return g.genProgram(n)
	case NODE_STMT_LIST:
		return g.genStmtList(n)
	case NODE_DECL_STMT:
		return g.genDeclStmt(n)
	case NODE_ASSIGN_STMT:
		return g.genAssignStmt(n)
	case NODE_IF_STMT:
		return g.genIfStmt(n)
	case NODE_WHILE_STMT:
		return g.genWhileStmt(n)
	case NODE_RETURN_STMT:
		return g.genReturnStmt(n)
	case NODE_EXPR:
		return g.genExpr(n)
	case NODE_TERM:
		return g.genTerm(n)
	case NODE_FACTOR:
		return g.genFactor(n)
	case NODE_COND_EXPR:
		return g.genCondExpr(n)
	case NODE_NUMBER:
		return n.Value
	case NODE_IDENTIFIER:
		return n.Value
	case NODE_EPSILON:
		return ""
	}
	return ""
}

// ── Program and statement list ───────────────────────────────────────────────

func (g *ICG) genProgram(n *Node) string {
	for _, child := range n.Children {
		g.genNode(child)
	}
	return ""
}

func (g *ICG) genStmtList(n *Node) string {
	for _, child := range n.Children {
		if child.Type != NODE_EPSILON {
			g.genNode(child)
		}
	}
	return ""
}

// ── Declaration ──────────────────────────────────────────────────────────────
// <decl_stmt> ::= int IDENTIFIER ;
// Emit: DECL  IDENTIFIER  _  _
func (g *ICG) genDeclStmt(n *Node) string {
	// find the IDENTIFIER child
	for _, child := range n.Children {
		if child.Type == NODE_IDENTIFIER {
			g.emit("DECL", child.Value, "_", "_")
			return ""
		}
	}
	return ""
}

// ── Assignment ───────────────────────────────────────────────────────────────
// <assign_stmt> ::= IDENTIFIER = <expr> ;
// Emit: COPY  <expr_result>  _  IDENTIFIER
func (g *ICG) genAssignStmt(n *Node) string {
	var ident string
	var exprNode *Node

	for _, child := range n.Children {
		switch child.Type {
		case NODE_IDENTIFIER:
			ident = child.Value
		case NODE_EXPR:
			exprNode = child
		}
	}

	result := g.genNode(exprNode)
	g.emit("COPY", result, "_", ident)
	return ident
}

// ── If / else ────────────────────────────────────────────────────────────────
// <if_stmt> ::= if ( <cond_expr> ) { <stmt_list> } <else_part>
//
// Generated quadruples:
//   <evaluate condition into t>
//   IFF   t   _   LElse        ← if false, jump to else/end
//   <then body>
//   GOTO  _   _   LEnd         ← skip else
//   LABEL LElse _ _
//   <else body (if any)>
//   LABEL LEnd _ _
func (g *ICG) genIfStmt(n *Node) string {
	var condNode *Node
	var thenList *Node
	var elsePart *Node

	for _, child := range n.Children {
		switch child.Type {
		case NODE_COND_EXPR:
			condNode = child
		case NODE_STMT_LIST:
			if thenList == nil {
				thenList = child
			}
		case NODE_ELSE_PART:
			elsePart = child
		}
	}

	// Evaluate condition
	condResult := g.genNode(condNode)

	lElse := g.newLabel()
	lEnd := g.newLabel()

	// Branch on false
	g.emit("IFF", condResult, "_", lElse)

	// Then body
	g.genNode(thenList)

	// Check if there is a real else body
	hasElse := elsePart != nil && len(elsePart.Children) > 0 &&
		elsePart.Children[0].Type != NODE_EPSILON

	if hasElse {
		g.emit("GOTO", "_", "_", lEnd)
	}

	// Else label
	g.emit("LABEL", lElse, "_", "_")

	if hasElse {
		// generate else body (skip keyword/punctuation, find stmt_list)
		for _, child := range elsePart.Children {
			if child.Type == NODE_STMT_LIST {
				g.genNode(child)
			}
		}
		g.emit("LABEL", lEnd, "_", "_")
	}

	return ""
}

// ── While ────────────────────────────────────────────────────────────────────
// <while_stmt> ::= while ( <cond_expr> ) { <stmt_list> }
//
// Generated quadruples:
//   LABEL LStart _ _
//   <evaluate condition into t>
//   IFF   t   _   LEnd          ← exit loop if false
//   <body>
//   GOTO  _   _   LStart        ← back to top
//   LABEL LEnd _ _
func (g *ICG) genWhileStmt(n *Node) string {
	var condNode *Node
	var bodyList *Node

	for _, child := range n.Children {
		switch child.Type {
		case NODE_COND_EXPR:
			condNode = child
		case NODE_STMT_LIST:
			bodyList = child
		}
	}

	lStart := g.newLabel()
	lEnd := g.newLabel()

	g.emit("LABEL", lStart, "_", "_")

	condResult := g.genNode(condNode)
	g.emit("IFF", condResult, "_", lEnd)

	g.genNode(bodyList)

	g.emit("GOTO", "_", "_", lStart)
	g.emit("LABEL", lEnd, "_", "_")

	return ""
}

// ── Return ───────────────────────────────────────────────────────────────────
// Emit: RET  <expr_result>  _  _
func (g *ICG) genReturnStmt(n *Node) string {
	for _, child := range n.Children {
		if child.Type == NODE_EXPR {
			result := g.genNode(child)
			g.emit("RET", result, "_", "_")
			return ""
		}
	}
	return ""
}

// ── Expressions ──────────────────────────────────────────────────────────────
// <expr> ::= <term> <expr_tail>
// <expr_tail> ::= + <term> <expr_tail> | - <term> <expr_tail> | ε

func (g *ICG) genExpr(n *Node) string {
	if len(n.Children) == 0 {
		return ""
	}

	// First child is always <term>
	result := g.genNode(n.Children[0])

	// Second child is <expr_tail>
	if len(n.Children) > 1 {
		result = g.genExprTail(n.Children[1], result)
	}
	return result
}

func (g *ICG) genExprTail(n *Node, left string) string {
	if n == nil || n.Type == NODE_EPSILON {
		return left
	}
	if len(n.Children) == 0 {
		return left
	}
	// Children: operator, term, expr_tail
	if n.Children[0].Type == NODE_EPSILON {
		return left
	}

	op := n.Children[0].Value // '+' or '-'
	right := g.genNode(n.Children[1])
	temp := g.newTemp()

	var opCode string
	switch op {
	case "+":
		opCode = "ADD"
	case "-":
		opCode = "SUB"
	default:
		opCode = "ADD"
	}

	g.emit(opCode, left, right, temp)

	// recurse into next expr_tail if present
	if len(n.Children) > 2 {
		return g.genExprTail(n.Children[2], temp)
	}
	return temp
}

// ── Terms ────────────────────────────────────────────────────────────────────
// <term> ::= <factor> <term_tail>
// <term_tail> ::= * <factor> <term_tail> | / <factor> <term_tail> | ε

func (g *ICG) genTerm(n *Node) string {
	if len(n.Children) == 0 {
		return ""
	}

	result := g.genNode(n.Children[0]) // factor

	if len(n.Children) > 1 {
		result = g.genTermTail(n.Children[1], result)
	}
	return result
}

func (g *ICG) genTermTail(n *Node, left string) string {
	if n == nil || n.Type == NODE_EPSILON {
		return left
	}
	if len(n.Children) == 0 {
		return left
	}
	if n.Children[0].Type == NODE_EPSILON {
		return left
	}

	op := n.Children[0].Value // '*' or '/'
	right := g.genNode(n.Children[1])
	temp := g.newTemp()

	var opCode string
	switch op {
	case "*":
		opCode = "MUL"
	case "/":
		opCode = "DIV"
	default:
		opCode = "MUL"
	}

	g.emit(opCode, left, right, temp)

	if len(n.Children) > 2 {
		return g.genTermTail(n.Children[2], temp)
	}
	return temp
}

// ── Factor ───────────────────────────────────────────────────────────────────
// <factor> ::= NUMBER | IDENTIFIER | ( <expr> )

func (g *ICG) genFactor(n *Node) string {
	for _, child := range n.Children {
		switch child.Type {
		case NODE_EXPR:
			return g.genNode(child)
		}
	}
	return ""
}

// ── Conditional expression ───────────────────────────────────────────────────
// <cond_expr> ::= <expr> <rel_op> <expr>
// Emit: <op>  left  right  temp

func (g *ICG) genCondExpr(n *Node) string {
	if len(n.Children) < 3 {
		return ""
	}

	left := g.genNode(n.Children[0])   // first expr
	relOp := n.Children[1].Value        // rel_op value: ==, <, >, <=, >=
	right := g.genNode(n.Children[2])  // second expr

	temp := g.newTemp()

	var opCode string
	switch relOp {
	case "==":
		opCode = "EQ"
	case "<":
		opCode = "LT"
	case ">":
		opCode = "GT"
	case "<=":
		opCode = "LE"
	case ">=":
		opCode = "GE"
	default:
		opCode = "EQ"
	}

	g.emit(opCode, left, right, temp)
	return temp
}

// ── Print ────────────────────────────────────────────────────────────────────

func (g *ICG) Print() {
	fmt.Printf("\n%-6s  %-6s  %-10s  %-10s  %s\n", "IDX", "OP", "ARG1", "ARG2", "RESULT")
	fmt.Println("─────────────────────────────────────────────────────")
	for _, q := range g.quads {
		fmt.Printf("%-6d  %-6s  %-10s  %-10s  %s\n",
			q.Index, q.Op, q.Arg1, q.Arg2, q.Result)
	}
	fmt.Println("─────────────────────────────────────────────────────")
	fmt.Printf("Total instructions: %d\n", len(g.quads))
}