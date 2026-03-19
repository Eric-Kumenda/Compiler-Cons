package main

// TokenType identifies the category of a lexical token.
type TokenType int

const (
	// Literals
	TOKEN_NUMBER TokenType = iota
	TOKEN_STRING

	// Identifiers and keywords
	TOKEN_IDENTIFIER
	TOKEN_KEYWORD

	// Operators
	TOKEN_OPERATOR

	// Punctuation
	TOKEN_PUNCTUATION

	// Special
	TOKEN_EOF
	TOKEN_ERROR
)

// String returns the display name of a TokenType.
func (t TokenType) String() string {
	switch t {
	case TOKEN_NUMBER:
		return "NUMBER"
	case TOKEN_STRING:
		return "STRING"
	case TOKEN_IDENTIFIER:
		return "IDENTIFIER"
	case TOKEN_KEYWORD:
		return "KEYWORD"
	case TOKEN_OPERATOR:
		return "OPERATOR"
	case TOKEN_PUNCTUATION:
		return "PUNCTUATION"
	case TOKEN_EOF:
		return "EOF"
	case TOKEN_ERROR:
		return "ERROR"
	}
	return "UNKNOWN"
}

// Token is a single lexical unit produced by the scanner.
type Token struct {
	Type   TokenType
	Lexeme string // Raw text as it appears in source
	Value  string // Processed value (e.g. string content without quotes)
	Line   int    // 1-indexed source line
}

// keywords is the complete set of Elmo reserved words.
var keywords = map[string]bool{
	"int":    true,
	"if":     true,
	"else":   true,
	"while":  true,
	"return": true,
}
