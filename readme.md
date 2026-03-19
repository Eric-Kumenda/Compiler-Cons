# Elmo Mini-Grammar Lexical Analyzer

This project is a manual implementation of a Lexical Analyzer (Scanner) for the **Elmos** programming language. It is designed as part of the Compiler Construction coursework to demonstrate the conversion of source code into a stream of tokens based on a formal lexical specification.

## Project Overview
The scanner is built in **Go** and follows the Deterministic Finite Automaton (DFA) transitions defined in the group's technical reports. It supports five primary token types and handles common programming constructs like comments and escape sequences.

### Supported Tokens
* **Keywords**: `int`, `if`, `else`, `while`, `return`.
* **Identifiers**: Sequences of letters, digits, and underscores starting with a letter or underscore.
* **Integer Literals (NUMBER)**: Decimal digits with no leading zeros (except for `0`).
* **String Literals**: Enclosed in double quotes with support for `\n`, `\t`, and `\\` escape sequences.
* **Operators**: `+`, `-`, `*`, `/`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `&&`, `||`, `!`, `=`.
* **Punctuation**: `;`, `(`, `)`, `{`, `}`.

## Build and Run
The project includes a `go.mod` for automated compilation 

### Prerequisites
* Go 

### Instructions
1. **Compile the program**:
   ```bash
   go build -o elmo-scanner
   ```
2. **Run the scanner (uses the sample.elmo file)**:
   ```bash
   ./elmo-scanner sample.elmo
   ```
