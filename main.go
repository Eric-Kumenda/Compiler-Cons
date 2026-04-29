package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// main wires the Elmo compiler pipeline:
//
//	source file → scanner → tokens → parser → parse tree → print tree
func main() {
	// ── 1. Command-line arguments ────────────────────────────────
	if len(os.Args) < 2 {
		prog := filepath.Base(os.Args[0])
		fmt.Fprintf(os.Stderr, "Usage: %s <source-file.elmo>\n", prog)
		os.Exit(1)
	}
	filename := os.Args[1]

	src, err := os.ReadFile(filename)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading file %q: %v\n", filename, err)
		os.Exit(1)
	}

	// ── 2. Scan: source → tokens ─────────────────────────────────
	scanner := NewScanner(string(src), filename)
	tokens := scanner.Scan()
	scanErrs := countScanErrors(tokens)

	banner("Elmo — scanning complete")
	fmt.Printf("  file    : %s\n", filename)
	fmt.Printf("  tokens  : %d\n", len(tokens))
	if scanErrs > 0 {
		fmt.Printf("  warning : scanner flagged %d malformed token(s)\n", scanErrs)
	}
	fmt.Println(strings.Repeat("═", 42))

	// --- ADD THIS SECTION START ---
	fmt.Printf("%-15s | %-15s | %-5s\n", "TOKEN TYPE", "LEXEME", "LINE")
	fmt.Println(strings.Repeat("-", 42))
	for _, t := range tokens {
		// String() method from token.go is used here for the Type
		fmt.Printf("%-15s | %-15s | %-5d\n", t.Type.String(), t.Lexeme, t.Line)
	}
	fmt.Println(strings.Repeat("═", 42))
	// --- ADD THIS SECTION END ---

	// ── 3–4. Parse: tokens → parse tree ──────────────────────────
	// Parse errors are reported and terminate the process from
	// inside the parser's reportError / unexpectedToken helpers,
	// so a successful return here means the input was accepted.
	parser := NewParser(tokens)
	tree := parser.parseProgram()

	// ── 5. Print the parse tree ──────────────────────────────────
	fmt.Println()
	banner("Elmo — parse tree")
	tree.PrettyPrint()
	fmt.Println()
	banner("Parse successful")
}

// banner prints a double-lined section header.
func banner(title string) {
	bar := strings.Repeat("═", 42)
	fmt.Println(bar)
	fmt.Printf("  %s\n", title)
	fmt.Println(bar)
}

// countScanErrors counts TOKEN_ERROR entries produced by the scanner,
// letting main surface lexical problems before parsing begins.
func countScanErrors(tokens []Token) int {
	n := 0
	for _, t := range tokens {
		if t.Type == TOKEN_ERROR {
			n++
		}
	}
	return n
}
