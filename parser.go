package main

import (
	"fmt"
	"os"
	"strings"
)

// Parser holds the parsing state.
type Parser struct {
	tokens  []Token
	current int
}

// NewParser creates a Parser from a token slice produced by the scanner.
// It filters out EOF tokens mid-slice so the parse functions only ever
// see real tokens — the single EOF at the end acts as the sentinel.
func NewParser(tokens []Token) *Parser {
	return &Parser{tokens: tokens, current: 0}
}

// ── Core navigation ──────────────────────────────────────────────────────────

// peek returns the current token without consuming it.
func (p *Parser) peek() Token {
	if p.current >= len(p.tokens) {
		return Token{Type: TOKEN_EOF, Lexeme: "$", Line: -1}
	}
	return p.tokens[p.current]
}

// peekType returns just the type of the current token.
func (p *Parser) peekType() TokenType {
	return p.peek().Type
}

// peekIs returns true if the current token matches the given type.
func (p *Parser) peekIs(t TokenType) bool {
	return p.peekType() == t
}

// peekIsKeyword returns true if the current token is a specific keyword lexeme.
func (p *Parser) peekIsKeyword(kw string) bool {
	tok := p.peek()
	return tok.Type == TOKEN_KEYWORD && tok.Lexeme == kw
}

// peekIsOperator returns true if the current token is a specific operator.
func (p *Parser) peekIsOperator(op string) bool {
	tok := p.peek()
	return tok.Type == TOKEN_OPERATOR && tok.Lexeme == op
}

// peekIsPunctuation returns true if the current token is a specific punctuation mark.
func (p *Parser) peekIsPunctuation(p2 string) bool {
	tok := p.peek()
	return tok.Type == TOKEN_PUNCTUATION && tok.Lexeme == p2
}

// advance consumes the current token and returns it.
func (p *Parser) advance() Token {
	tok := p.peek()
	if p.current < len(p.tokens) {
		p.current++
	}
	return tok
}

// ── expect ───────────────────────────────────────────────────────────────────

// expect consumes the current token if it matches the expected type.
// If it does not match, a parse error is reported and the program exits.
func (p *Parser) expect(t TokenType) Token {
	tok := p.peek()
	if tok.Type != t {
		p.errExpectedType(t.String(), tok)
	}
	return p.advance()
}

// expectKeyword consumes the current token if it is the given keyword.
func (p *Parser) expectKeyword(kw string) Token {
	tok := p.peek()
	if tok.Type != TOKEN_KEYWORD || tok.Lexeme != kw {
		p.errExpectedLexeme("'"+kw+"'", tok)
	}
	return p.advance()
}

// expectOperator consumes the current token if it is the given operator.
func (p *Parser) expectOperator(op string) Token {
	tok := p.peek()
	if tok.Type != TOKEN_OPERATOR || tok.Lexeme != op {
		p.errExpectedLexeme("'"+op+"'", tok)
	}
	return p.advance()
}

// expectPunctuation consumes the current token if it is the given punctuation.
func (p *Parser) expectPunctuation(pu string) Token {
	tok := p.peek()
	if tok.Type != TOKEN_PUNCTUATION || tok.Lexeme != pu {
		p.errExpectedLexeme("'"+pu+"'", tok)
	}
	return p.advance()
}

// ── Error reporting ──────────────────────────────────────────────────────────

// errExpectedType reports a mismatch between expected token type and actual token.
func (p *Parser) errExpectedType(expected string, got Token) {
	p.reportError(expected, got)
}

// errExpectedLexeme reports a mismatch between expected lexeme and actual token.
func (p *Parser) errExpectedLexeme(expected string, got Token) {
	p.reportError(expected, got)
}

// reportError prints a formatted parse error and exits.
// Format:
//
//	[parse error] line N: expected <X> but got '<lexeme>' (TYPE)
func (p *Parser) reportError(expected string, got Token) {
	line := got.Line
	var gotDesc string
	if got.Type == TOKEN_EOF {
		gotDesc = "end of file"
	} else {
		gotDesc = fmt.Sprintf("'%s' (%s)", got.Lexeme, got.Type.String())
	}

	fmt.Fprintf(os.Stderr, "\n%s\n", strings.Repeat("─", 60))
	fmt.Fprintf(os.Stderr, "  [parse error] line %d\n", line)
	fmt.Fprintf(os.Stderr, "  expected : %s\n", expected)
	fmt.Fprintf(os.Stderr, "  got      : %s\n", gotDesc)
	fmt.Fprintf(os.Stderr, "%s\n\n", strings.Repeat("─", 60))
	os.Exit(1)
}

// unexpectedToken is used when none of the valid alternatives match.
// Example: parseStmt() sees a token that can't start any statement.
func (p *Parser) unexpectedToken(context string) {
	tok := p.peek()
	var gotDesc string
	if tok.Type == TOKEN_EOF {
		gotDesc = "end of file"
	} else {
		gotDesc = fmt.Sprintf("'%s' (%s)", tok.Lexeme, tok.Type.String())
	}

	fmt.Fprintf(os.Stderr, "\n%s\n", strings.Repeat("─", 60))
	fmt.Fprintf(os.Stderr, "  [parse error] line %d\n", tok.Line)
	fmt.Fprintf(os.Stderr, "  unexpected token in %s\n", context)
	fmt.Fprintf(os.Stderr, "  got : %s\n", gotDesc)
	fmt.Fprintf(os.Stderr, "%s\n\n", strings.Repeat("─", 60))
	os.Exit(1)
}

// isAtEnd returns true when all tokens have been consumed.
func (p *Parser) isAtEnd() bool {
	return p.peek().Type == TOKEN_EOF
}

// ── Statement Parsing ────────────────────────────────────────────────────────

// parseProgram parses <program> ::= <stmt_list>
func (p *Parser) parseProgram() *Node {
	stmtList := p.parseStmtList()
	return newNode(NODE_PROGRAM, stmtList)
}

// parseStmtList parses <stmt_list> ::= <stmt> <stmt_list> | ε
// FIRST(<stmt_list>) = {int, IDENTIFIER, if, while, return, EOF}
// When we see EOF or }, we return ε.
func (p *Parser) parseStmtList() *Node {
	// If we see EOF or }, this is the base case (ε)
	if p.isAtEnd() || p.peekIsPunctuation("}") {
		return newNode(NODE_STMT_LIST, newEpsilon())
	}

	// Try to parse a statement
	stmt := p.parseStmt()
	stmtListTail := p.parseStmtList()

	return newNode(NODE_STMT_LIST, stmt, stmtListTail)
}

// parseStmt parses <stmt> ::= <decl_stmt> | <assign_stmt> | <if_stmt> | <while_stmt> | <return_stmt>
func (p *Parser) parseStmt() *Node {
	switch {
	case p.peekIsKeyword("int"):
		return p.parseDeclStmt()
	case p.peekIs(TOKEN_IDENTIFIER):
		return p.parseAssignStmt()
	case p.peekIsKeyword("if"):
		return p.parseIfStmt()
	case p.peekIsKeyword("while"):
		return p.parseWhileStmt()
	case p.peekIsKeyword("return"):
		return p.parseReturnStmt()
	default:
		p.unexpectedToken("parseStmt")
		return nil
	}
}

// parseDeclStmt parses <decl_stmt> ::= int IDENTIFIER ;
func (p *Parser) parseDeclStmt() *Node {
	kwInt := newLeaf(NODE_KEYWORD, p.expectKeyword("int").Lexeme)
	ident := newLeaf(NODE_IDENTIFIER, p.expect(TOKEN_IDENTIFIER).Lexeme)
	semi := newLeaf(NODE_PUNCTUATION, p.expectPunctuation(";").Lexeme)

	return newNode(NODE_DECL_STMT, kwInt, ident, semi)
}

// parseAssignStmt parses <assign_stmt> ::= IDENTIFIER = <expr> ;
func (p *Parser) parseAssignStmt() *Node {
	ident := newLeaf(NODE_IDENTIFIER, p.expect(TOKEN_IDENTIFIER).Lexeme)
	eq := newLeaf(NODE_OPERATOR, p.expectOperator("=").Lexeme)
	expr := p.parseExpr()
	semi := newLeaf(NODE_PUNCTUATION, p.expectPunctuation(";").Lexeme)

	return newNode(NODE_ASSIGN_STMT, ident, eq, expr, semi)
}

// parseIfStmt parses <if_stmt> ::= if ( <cond_expr> ) { <stmt_list> } <else_part>
func (p *Parser) parseIfStmt() *Node {
	kwIf := newLeaf(NODE_KEYWORD, p.expectKeyword("if").Lexeme)
	lparen := newLeaf(NODE_PUNCTUATION, p.expectPunctuation("(").Lexeme)
	condExpr := p.parseCondExpr()
	rparen := newLeaf(NODE_PUNCTUATION, p.expectPunctuation(")").Lexeme)
	lbrace := newLeaf(NODE_PUNCTUATION, p.expectPunctuation("{").Lexeme)
	stmtList := p.parseStmtList()
	rbrace := newLeaf(NODE_PUNCTUATION, p.expectPunctuation("}").Lexeme)
	elsePart := p.parseElsePart()

	return newNode(NODE_IF_STMT, kwIf, lparen, condExpr, rparen, lbrace, stmtList, rbrace, elsePart)
}

// parseElsePart parses <else_part> ::= else { <stmt_list> } | ε
func (p *Parser) parseElsePart() *Node {
	if !p.peekIsKeyword("else") {
		return newNode(NODE_ELSE_PART, newEpsilon())
	}

	kwElse := newLeaf(NODE_KEYWORD, p.expectKeyword("else").Lexeme)
	lbrace := newLeaf(NODE_PUNCTUATION, p.expectPunctuation("{").Lexeme)
	stmtList := p.parseStmtList()
	rbrace := newLeaf(NODE_PUNCTUATION, p.expectPunctuation("}").Lexeme)

	return newNode(NODE_ELSE_PART, kwElse, lbrace, stmtList, rbrace)
}

// parseWhileStmt parses <while_stmt> ::= while ( <cond_expr> ) { <stmt_list> }
func (p *Parser) parseWhileStmt() *Node {
	kwWhile := newLeaf(NODE_KEYWORD, p.expectKeyword("while").Lexeme)
	lparen := newLeaf(NODE_PUNCTUATION, p.expectPunctuation("(").Lexeme)
	condExpr := p.parseCondExpr()
	rparen := newLeaf(NODE_PUNCTUATION, p.expectPunctuation(")").Lexeme)
	lbrace := newLeaf(NODE_PUNCTUATION, p.expectPunctuation("{").Lexeme)
	stmtList := p.parseStmtList()
	rbrace := newLeaf(NODE_PUNCTUATION, p.expectPunctuation("}").Lexeme)

	return newNode(NODE_WHILE_STMT, kwWhile, lparen, condExpr, rparen, lbrace, stmtList, rbrace)
}

// parseReturnStmt parses <return_stmt> ::= return <expr> ;
func (p *Parser) parseReturnStmt() *Node {
	kwReturn := newLeaf(NODE_KEYWORD, p.expectKeyword("return").Lexeme)
	expr := p.parseExpr()
	semi := newLeaf(NODE_PUNCTUATION, p.expectPunctuation(";").Lexeme)

	return newNode(NODE_RETURN_STMT, kwReturn, expr, semi)
}

// ── Expression Parsing ───────────────────────────────────────────────────────

// parseExpr parses <expr> ::= <term> <expr_tail>
func (p *Parser) parseExpr() *Node {
	term := p.parseTerm()
	exprTail := p.parseExprTail()

	return newNode(NODE_EXPR, term, exprTail)
}

// parseExprTail parses <expr_tail> ::= + <term> <expr_tail> | - <term> <expr_tail> | ε
func (p *Parser) parseExprTail() *Node {
	if p.peekIsOperator("+") {
		op := newLeaf(NODE_OPERATOR, p.expectOperator("+").Lexeme)
		term := p.parseTerm()
		tail := p.parseExprTail()
		return newNode(NODE_EXPR_TAIL, op, term, tail)
	} else if p.peekIsOperator("-") {
		op := newLeaf(NODE_OPERATOR, p.expectOperator("-").Lexeme)
		term := p.parseTerm()
		tail := p.parseExprTail()
		return newNode(NODE_EXPR_TAIL, op, term, tail)
	}
	// ε case
	return newNode(NODE_EXPR_TAIL, newEpsilon())
}

// parseTerm parses <term> ::= <factor> <term_tail>
func (p *Parser) parseTerm() *Node {
	factor := p.parseFactor()
	termTail := p.parseTermTail()

	return newNode(NODE_TERM, factor, termTail)
}

// parseTermTail parses <term_tail> ::= * <factor> <term_tail> | / <factor> <term_tail> | ε
func (p *Parser) parseTermTail() *Node {
	if p.peekIsOperator("*") {
		op := newLeaf(NODE_OPERATOR, p.expectOperator("*").Lexeme)
		factor := p.parseFactor()
		tail := p.parseTermTail()
		return newNode(NODE_TERM_TAIL, op, factor, tail)
	} else if p.peekIsOperator("/") {
		op := newLeaf(NODE_OPERATOR, p.expectOperator("/").Lexeme)
		factor := p.parseFactor()
		tail := p.parseTermTail()
		return newNode(NODE_TERM_TAIL, op, factor, tail)
	}
	// ε case
	return newNode(NODE_TERM_TAIL, newEpsilon())
}

// parseFactor parses <factor> ::= NUMBER | IDENTIFIER | ( <expr> )
func (p *Parser) parseFactor() *Node {
	switch {
	case p.peekIs(TOKEN_NUMBER):
		return newLeaf(NODE_NUMBER, p.expect(TOKEN_NUMBER).Lexeme)
	case p.peekIs(TOKEN_IDENTIFIER):
		return newLeaf(NODE_IDENTIFIER, p.expect(TOKEN_IDENTIFIER).Lexeme)
	case p.peekIs(TOKEN_STRING):
		return newLeaf(NODE_STRING, p.expect(TOKEN_STRING).Lexeme)
	case p.peekIsPunctuation("("):
		lparen := newLeaf(NODE_PUNCTUATION, p.expectPunctuation("(").Lexeme)
		expr := p.parseExpr()
		rparen := newLeaf(NODE_PUNCTUATION, p.expectPunctuation(")").Lexeme)
		return newNode(NODE_FACTOR, lparen, expr, rparen)
	default:
		p.unexpectedToken("parseFactor")
		return nil
	}
}

// parseCondExpr parses <cond_expr> ::= <expr> <rel_op> <expr>
func (p *Parser) parseCondExpr() *Node {
	expr1 := p.parseExpr()
	relOp := p.parseRelOp()
	expr2 := p.parseExpr()

	return newNode(NODE_COND_EXPR, expr1, relOp, expr2)
}

// parseRelOp parses <rel_op> ::= == | < | > | <= | >=
func (p *Parser) parseRelOp() *Node {
	tok := p.peek()
	switch {
	case p.peekIsOperator("=="):
		return newLeaf(NODE_REL_OP, p.expectOperator("==").Lexeme)
	case p.peekIsOperator("<"):
		return newLeaf(NODE_REL_OP, p.expectOperator("<").Lexeme)
	case p.peekIsOperator(">"):
		return newLeaf(NODE_REL_OP, p.expectOperator(">").Lexeme)
	case p.peekIsOperator("<="):
		return newLeaf(NODE_REL_OP, p.expectOperator("<=").Lexeme)
	case p.peekIsOperator(">="):
		return newLeaf(NODE_REL_OP, p.expectOperator(">=").Lexeme)
	default:
		p.errExpectedLexeme("relational operator (==, <, >, <=, >=)", tok)
		return nil
	}
}
