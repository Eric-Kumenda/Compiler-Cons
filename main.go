package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func main() {
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

	// Phase 1: Scan
	scanner := NewScanner(string(src), filename)
	tokens := scanner.Scan()
	scanErrs := countScanErrors(tokens)

	banner("Elmo — Phase 1: Scanning")
	fmt.Printf("  file    : %s\n", filename)
	fmt.Printf("  tokens  : %d\n", len(tokens))
	if scanErrs > 0 {
		fmt.Printf("  warning : scanner flagged %d malformed token(s)\n", scanErrs)
	}
	fmt.Println(strings.Repeat("═", 50))
	fmt.Printf("  %-15s  %-15s  %s\n", "TOKEN TYPE", "LEXEME", "LINE")
	fmt.Println("  " + strings.Repeat("-", 40))
	for _, t := range tokens {
		fmt.Printf("  %-15s  %-15s  %d\n", t.Type.String(), t.Lexeme, t.Line)
	}
	fmt.Println(strings.Repeat("═", 50))

	// Phase 2: Parse
	parser := NewParser(tokens)
	tree := parser.parseProgram()
	fmt.Println()
	banner("Elmo — Phase 2: Parse Tree")
	tree.PrettyPrint()
	fmt.Println(strings.Repeat("═", 50))

	// Phase 3: ICG
	fmt.Println()
	banner("Elmo — Phase 3: Intermediate Code (Quadruples)")
	icg := NewICG()
	icg.Generate(tree)
	icg.Print()
	fmt.Println()
	banner("Compilation complete")
}

func banner(title string) {
	bar := strings.Repeat("═", 50)
	fmt.Println(bar)
	fmt.Printf("  %s\n", title)
	fmt.Println(bar)
}

func countScanErrors(tokens []Token) int {
	n := 0
	for _, t := range tokens {
		if t.Type == TOKEN_ERROR {
			n++
		}
	}
	return n
}