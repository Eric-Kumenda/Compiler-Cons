package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "Usage: elmo-scanner <source-file>")
		os.Exit(1)
	}

	filename := os.Args[1]
	src, err := os.ReadFile(filename)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading file: %v\n", err)
		os.Exit(1)
	}

	scanner := NewScanner(string(src), filename)
	tokens := scanner.Scan()

	printTokens(tokens)
}

func printTokens(tokens []Token) {
	fmt.Println("══════════════════════════════════════════════════════════")
	fmt.Printf("  Elmo Scanner — Token List\n")
	fmt.Println("══════════════════════════════════════════════════════════")
	fmt.Printf("  %-6s  %-14s  %-20s  %s\n", "LINE", "TYPE", "LEXEME", "VALUE")
	fmt.Println("──────────────────────────────────────────────────────────")

	hasError := false
	for _, tok := range tokens {
		if tok.Type == TOKEN_ERROR {
			hasError = true
		}
		fmt.Printf("  %-6d  %-14s  %-20q  %s\n",
			tok.Line,
			tok.Type.String(),
			tok.Lexeme,
			tok.Value,
		)
	}

	fmt.Println("══════════════════════════════════════════════════════════")
	fmt.Printf("  Total tokens: %d\n", len(tokens))
	if hasError {
		fmt.Println("  ⚠  Lexical errors detected (see ERROR tokens above)")
	} else {
		fmt.Println("  ✓  Scan complete — no lexical errors")
	}
	fmt.Println("══════════════════════════════════════════════════════════")
}
