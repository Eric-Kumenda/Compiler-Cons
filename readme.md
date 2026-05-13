<div align="center">
  <img src="./elmo-transparent.png" alt="Compile Me Elmo" width="160" />
  <h1>The Elmo Compiler</h1>
  <i><b>"Compile Me Elmo: Syntactic tickles to binary miracles." 🚀</b></i>
  <br/><br/>

[![Go](https://img.shields.io/badge/Language-Go-00ADD8?style=flat-square&logo=go)](https://go.dev/)
[![Status](https://img.shields.io/badge/Status-Actively_Compiling-brightgreen?style=flat-square)](#)
[![Pipeline](https://img.shields.io/badge/Pipeline-Scanner_→_Parser_→_ICG-blue?style=flat-square)](#)

</div>

## Overview

Welcome to the **Elmo Compiler Construction** project—an academic exploration into the profound art of translating human-readable logic into machine-executable precision. Built from the ground up in **Go**, this project distills the complexity of compiler design into an elegant, highly readable pipeline.

Designed with scholarly rigor for Compiler Construction coursework, Elmo is currently capable of reading source code, understanding its underlying structural grammar, and translating it into a refined intermediate representation.

---

## 🏗️ The Compilation Pipeline

Elmo is being engineered in deliberate, methodical stages. As of our current milestone, we have successfully orchestrated the first three critical phases of compilation:

### 1. Lexical Analysis (The Scanner)

The vanguard of the compiler. The Scanner employs a hand-crafted Deterministic Finite Automaton (DFA) to systematically consume raw character streams. It strips away whitespace and comments, distilling the source text into a clean stream of meaningful **Tokens** (Keywords, Identifiers, Literals, Operators, and Punctuation).

### 2. Syntactic Analysis (The Parser)

The architect of structure. Leveraging a **Recursive Descent** parsing strategy, our Parser consumes the token stream and rigorously verifies it against an LL(1)-transformed BNF grammar. It flawlessly enforces operator precedence and constructs a comprehensive **Concrete Syntax Tree**, failing fast with precise diagnostics upon encountering any structural anomalies.

### 3. Intermediate Code Generation (ICG)

The universal translator. In this phase, the Parse Tree is traversed and semantically mapped to a platform-agnostic intermediate representation. This essential bridge decouples the high-level syntax from the hardware, setting a robust foundation for future optimizations.

---

## 🚀 The Final Frontier: What's Next?

### 4. Target Code Generation

The grand finale. Our next and final evolutionary stage is **Target Code Generation**. We will take the intermediate representation produced by the ICG phase and translate it directly into raw, executable machine code or assembly. This final synthesis will breathe true life into Elmo, transforming it from a theoretical analysis pipeline into a fully-fledged, operational compiler.

---

## ⚙️ Build & Execution

The Elmo compiler is written in pure Go, ensuring zero external dependencies and seamless cross-platform compilation.

### Prerequisites

- [Go](https://go.dev/) installed on your machine.

### Unix / Linux / macOS

```bash
# 1. Compile the toolchain
go build -o elmo-compiler

# 2. Execute against a sample program
./elmo-compiler sample.elmo
```

### Windows

```powershell
# 1. Compile the toolchain
go build -o elmo-compiler.exe

# 2. Execute against a sample program
.\elmo-compiler.exe sample.elmo
```

---

_Compiling the chaos of thought into the order of logic._
