package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "Usage: elmo <source-file>")
		os.Exit(1)
	}

	filename := os.Args[1]
	src, err := os.ReadFile(filename)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading file: %v\n", err)
		os.Exit(1)
	}

	// ── Phase 1: scan ────────────────────────────────────────────
	scanner := NewScanner(string(src), filename)
	tokens := scanner.Scan()

	fmt.Println("══════════════════════════════════════════")
	fmt.Println("  Elmo — scanning complete")
	fmt.Printf("  %d tokens produced\n", len(tokens))
	fmt.Println("══════════════════════════════════════════")

	// ── Phase 2: parse ───────────────────────────────────────────
	parser := NewParser(tokens)
	tree := parser.parseProgram()

	fmt.Println("\n══════════════════════════════════════════")
	fmt.Println("  Elmo — parse tree")
	fmt.Println("══════════════════════════════════════════")
	tree.Print()
	fmt.Println("\n  Parse successful")
	fmt.Println("══════════════════════════════════════════")
}