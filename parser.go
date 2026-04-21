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