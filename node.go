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
	n.print("", true)
}

func (n *Node) print(prefix string, isLast bool) {
	connector := "└── "
	if !isLast {
		connector = "├── "
	}

	label := string(n.Type)
	if n.Value != "" {
		label += fmt.Sprintf("  '%s'", n.Value)
	}

	if prefix == "" {
		fmt.Println(label)
	} else {
		fmt.Println(prefix + connector + label)
	}

	childPrefix := prefix
	if prefix == "" {
		childPrefix = ""
	} else if isLast {
		childPrefix += "    "
	} else {
		childPrefix += "│   "
	}

	for i, child := range n.Children {
		child.print(childPrefix, i == len(n.Children)-1)
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
