package main

import (
	"fmt"
	"strings"
)

// NodeType identifies what kind of parse tree node this is.
type NodeType string

const (
	NODE_PROGRAM     NodeType = "program"
	NODE_STMT_LIST   NodeType = "stmt_list"
	NODE_DECL_STMT   NodeType = "decl_stmt"
	NODE_ASSIGN_STMT NodeType = "assign_stmt"
	NODE_IF_STMT     NodeType = "if_stmt"
	NODE_ELSE_PART   NodeType = "else_part"
	NODE_WHILE_STMT  NodeType = "while_stmt"
	NODE_RETURN_STMT NodeType = "return_stmt"
	NODE_EXPR        NodeType = "expr"
	NODE_EXPR_TAIL   NodeType = "expr_tail"
	NODE_TERM        NodeType = "term"
	NODE_TERM_TAIL   NodeType = "term_tail"
	NODE_FACTOR      NodeType = "factor"
	NODE_COND_EXPR   NodeType = "cond_expr"
	NODE_REL_OP      NodeType = "rel_op"
	NODE_IDENTIFIER  NodeType = "identifier"
	NODE_NUMBER      NodeType = "number"
	NODE_STRING      NodeType = "string"
	NODE_KEYWORD     NodeType = "keyword"
	NODE_OPERATOR    NodeType = "operator"
	NODE_PUNCTUATION NodeType = "punctuation"
	NODE_EPSILON     NodeType = "ε"
)

// Short aliases and generic kinds exposed by the public AST module API.
const (
	NODE_DECL   = NODE_DECL_STMT
	NODE_ASSIGN = NODE_ASSIGN_STMT
	NODE_IF     = NODE_IF_STMT
	NODE_WHILE  = NODE_WHILE_STMT
	NODE_RETURN = NODE_RETURN_STMT

	NODE_LITERAL NodeType = "literal"
)

// Node is a single node in the parse tree.
// Value holds the lexeme for terminal nodes; Children holds sub-trees.
type Node struct {
	Type     NodeType
	Value    string
	Children []*Node
}

// newNode creates an internal (non-terminal) node.
func newNode(t NodeType, children ...*Node) *Node {
	n := &Node{Type: t}
	for _, c := range children {
		if c != nil {
			n.Children = append(n.Children, c)
		}
	}
	return n
}

// newLeaf creates a terminal (leaf) node with a value.
func newLeaf(t NodeType, value string) *Node {
	return &Node{Type: t, Value: value}
}

// newEpsilon creates an ε leaf — used where a rule derives the empty string.
func newEpsilon() *Node {
	return &Node{Type: NODE_EPSILON, Value: "ε"}
}

// ── Pretty printing ──────────────────────────────────────────────────────────

// Print displays the parse tree to stdout with indentation.
// Example output:
//
//	program
//	└── stmt_list
//	    ├── decl_stmt
//	    │   ├── keyword  'int'
//	    │   ├── identifier  'x'
//	    │   └── punctuation  ';'
//	    └── stmt_list  ε
func (n *Node) Print() {
	n.print("", true, true)
}

func (n *Node) print(prefix string, isRoot, isLast bool) {
	label := string(n.Type)
	if n.Value != "" {
		label += fmt.Sprintf("  '%s'", n.Value)
	}

	if isRoot {
		fmt.Println(label)
	} else {
		connector := "└── "
		if !isLast {
			connector = "├── "
		}
		fmt.Println(prefix + connector + label)
	}

	var childPrefix string
	if isRoot {
		childPrefix = ""
	} else if isLast {
		childPrefix = prefix + "    "
	} else {
		childPrefix = prefix + "│   "
	}

	for i, child := range n.Children {
		child.print(childPrefix, false, i == len(n.Children)-1)
	}
}

// Summary returns a one-line description of the node for debugging.
func (n *Node) Summary() string {
	if n.Value != "" {
		return fmt.Sprintf("%s('%s')", n.Type, n.Value)
	}
	return fmt.Sprintf("%s[%s]", n.Type, strings.Join(func() []string {
		var s []string
		for _, c := range n.Children {
			s = append(s, string(c.Type))
		}
		return s
	}(), ", "))
}

// ── Public module API ────────────────────────────────────────────────────────

// NewNode creates a new parse tree node of the given type with an optional value.
// Use an empty value for non-terminal (internal) nodes.
func NewNode(nodeType string, value string) *Node {
	return &Node{Type: NodeType(nodeType), Value: value}
}

// AddChild appends a child node to n. nil children are ignored.
func (n *Node) AddChild(child *Node) {
	if child == nil {
		return
	}
	n.Children = append(n.Children, child)
}

// PrintTree recursively prints the parse tree using plain indentation.
// level is the starting indentation depth (use 0 for the root).
func (n *Node) PrintTree(level int) {
	indent := strings.Repeat("  ", level)
	label := string(n.Type)
	if n.Value != "" {
		label += fmt.Sprintf("  '%s'", n.Value)
	}
	fmt.Println(indent + label)
	for _, child := range n.Children {
		child.PrintTree(level + 1)
	}
}

// PrettyPrint renders the tree with Unicode tree connectors.
// Provided as a descriptive alias for Print.
func (n *Node) PrettyPrint() {
	n.Print()
}
