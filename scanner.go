package main

import "fmt"

// Scanner holds the scanning state.
type Scanner struct {
	source   string
	filename string
	start    int // start of current lexeme
	current  int // current read position
	line     int // current line number (1-indexed)
	tokens   []Token
}

// NewScanner creates a Scanner for the given source string.
func NewScanner(source, filename string) *Scanner {
	return &Scanner{
		source:   source,
		filename: filename,
		start:    0,
		current:  0,
		line:     1,
	}
}

// Scan runs the scanner over the entire source and returns all tokens.
// It implements the MiniC DFA directly: each call to nextToken() advances
// the scanner by one token using maximal munch.
func (s *Scanner) Scan() []Token {
	for !s.isAtEnd() {
		s.start = s.current
		s.nextToken()
	}

	s.tokens = append(s.tokens, Token{
		Type:   TOKEN_EOF,
		Lexeme: "",
		Value:  "",
		Line:   s.line,
	})
	return s.tokens
}

// nextToken reads one token from the current position.
// This is the top-level DFA dispatch — equivalent to leaving state D0.
func (s *Scanner) nextToken() {
	c := s.advance()

	switch {
	// ── Whitespace (skip silently) ──────────────────────────────
	case isWhitespace(c):
		if c == '\n' {
			s.line++
		}
		// consume any additional whitespace
		for !s.isAtEnd() && isWhitespace(s.peek()) {
			if s.advance() == '\n' {
				s.line++
			}
		}
		// whitespace is not emitted as a token

	// ── Numbers: DFA path D0 → D3 → (D3 self-loop) ─────────────
	case isDigit(c):
		s.scanNumber()

	// ── Identifiers / Keywords: DFA path D0 → D1 → (D1 self-loop)
	case isLetter(c):
		s.scanIdentifier()

	// ── String literals: DFA path D0 → D7 → (D7 self-loop) → D9
	case c == '"':
		s.scanString()

	// ── Operators ───────────────────────────────────────────────
	// '==' takes priority over '=' — maximal munch:
	// DFA: D0 →'='→ D6, then D6 →'='→ D8
	case c == '=':
		if !s.isAtEnd() && s.peek() == '=' {
			s.advance() // consume second '='
			s.emit(TOKEN_OPERATOR, "==")
		} else {
			s.emit(TOKEN_OPERATOR, "=")
		}

	// Single-character arithmetic operators (DFA: D0 → D5)
	case c == '+':
		s.emit(TOKEN_OPERATOR, "+")
	case c == '-':
		s.emit(TOKEN_OPERATOR, "-")
	case c == '*':
		s.emit(TOKEN_OPERATOR, "*")
	case c == '/':
		s.emit(TOKEN_OPERATOR, "/")

	// Relational operators — peek ahead for >= and <=
	// DFA: D0 →'<'→ D5, then D5 →'='→ D10 (<=)
	case c == '<':
		if !s.isAtEnd() && s.peek() == '=' {
			s.advance()
			s.emit(TOKEN_OPERATOR, "<=")
		} else {
			s.emit(TOKEN_OPERATOR, "<")
		}
	// DFA: D0 →'>'→ D5, then D5 →'='→ D11 (>=)
	case c == '>':
		if !s.isAtEnd() && s.peek() == '=' {
			s.advance()
			s.emit(TOKEN_OPERATOR, ">=")
		} else {
			s.emit(TOKEN_OPERATOR, ">")
		}

	// ── Punctuation ─────────────────────────────────────────────
	case c == '(':
		s.emit(TOKEN_PUNCTUATION, "(")
	case c == ')':
		s.emit(TOKEN_PUNCTUATION, ")")
	case c == '{':
		s.emit(TOKEN_PUNCTUATION, "{")
	case c == '}':
		s.emit(TOKEN_PUNCTUATION, "}")
	case c == ';':
		s.emit(TOKEN_PUNCTUATION, ";")

	// ── Unrecognised character → ERROR ──────────────────────────
	default:
		s.addToken(Token{
			Type:   TOKEN_ERROR,
			Lexeme: string(c),
			Value:  fmt.Sprintf("unexpected character '%c' at line %d", c, s.line),
			Line:   s.line,
		})
	}
}

// ── scanNumber ──────────────────────────────────────────────────────────────
// DFA states D3 self-loop: consume digits until a non-digit is seen.
func (s *Scanner) scanNumber() {
	for !s.isAtEnd() && isDigit(s.peek()) {
		s.advance()
	}
	lexeme := s.source[s.start:s.current]
	s.addToken(Token{
		Type:   TOKEN_NUMBER,
		Lexeme: lexeme,
		Value:  lexeme,
		Line:   s.line,
	})
}

// ── scanIdentifier ──────────────────────────────────────────────────────────
// DFA state D1 self-loop: consume [a-zA-Z0-9_] until not matched.
// Post-process: if lexeme is a keyword → TOKEN_KEYWORD, else TOKEN_IDENTIFIER.
func (s *Scanner) scanIdentifier() {
	for !s.isAtEnd() && isAlphaNumeric(s.peek()) {
		s.advance()
	}
	lexeme := s.source[s.start:s.current]
	tokType := TOKEN_IDENTIFIER
	if keywords[lexeme] {
		tokType = TOKEN_KEYWORD
	}
	s.addToken(Token{
		Type:   tokType,
		Lexeme: lexeme,
		Value:  lexeme,
		Line:   s.line,
	})
}

// ── scanString ──────────────────────────────────────────────────────────────
// DFA states D7 self-loop → D9:
// Consume characters until closing '"' or end-of-line/end-of-file.
func (s *Scanner) scanString() {
	for !s.isAtEnd() && s.peek() != '"' && s.peek() != '\n' {
		s.advance()
	}

	if s.isAtEnd() || s.peek() == '\n' {
		s.addToken(Token{
			Type:   TOKEN_ERROR,
			Lexeme: s.source[s.start:s.current],
			Value:  fmt.Sprintf("unterminated string at line %d", s.line),
			Line:   s.line,
		})
		return
	}

	s.advance() // consume closing '"'
	lexeme := s.source[s.start:s.current]
	value := s.source[s.start+1 : s.current-1] // strip surrounding quotes
	s.addToken(Token{
		Type:   TOKEN_STRING,
		Lexeme: lexeme,
		Value:  value,
		Line:   s.line,
	})
}

// ── emit is a shorthand for single-character/fixed-value tokens ─────────────
func (s *Scanner) emit(t TokenType, value string) {
	s.addToken(Token{
		Type:   t,
		Lexeme: s.source[s.start:s.current],
		Value:  value,
		Line:   s.line,
	})
}

// ── addToken appends a fully constructed token to the list ──────────────────
func (s *Scanner) addToken(tok Token) {
	s.tokens = append(s.tokens, tok)
}

// ── Character helpers ────────────────────────────────────────────────────────

func (s *Scanner) advance() rune {
	c := rune(s.source[s.current])
	s.current++
	return c
}

func (s *Scanner) peek() rune {
	if s.isAtEnd() {
		return 0
	}
	return rune(s.source[s.current])
}

func (s *Scanner) isAtEnd() bool {
	return s.current >= len(s.source)
}

func isWhitespace(c rune) bool {
	return c == ' ' || c == '\t' || c == '\r' || c == '\n'
}

func isDigit(c rune) bool {
	return c >= '0' && c <= '9'
}

func isLetter(c rune) bool {
	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'
}

func isAlphaNumeric(c rune) bool {
	return isLetter(c) || isDigit(c)
}