# Elmo — FIRST & FOLLOW Sets

## Transformed Grammar Summary

Left recursion was removed from `<expr>` and `<term>` by introducing
`<expr_tail>` and `<term_tail>`. The `<else_part>` rule was factored out
to keep the if/else production clean for recursive descent.

## Transformed Grammar (Recursive Descent-ready BNF)

```
<program>       ::= <stmt_list>

<stmt_list>     ::= <stmt> <stmt_list>
                  | ε

<stmt>          ::= <decl_stmt>
                  | <assign_stmt>
                  | <if_stmt>
                  | <while_stmt>
                  | <return_stmt>

<decl_stmt>     ::= int IDENTIFIER ;

<assign_stmt>   ::= IDENTIFIER = <expr> ;

<if_stmt>       ::= if ( <cond_expr> ) { <stmt_list> } <else_part>

<else_part>     ::= else { <stmt_list> }
                  | ε

<while_stmt>    ::= while ( <cond_expr> ) { <stmt_list> }

<return_stmt>   ::= return <expr> ;

<expr>          ::= <term> <expr_tail>

<expr_tail>     ::= + <term> <expr_tail>
                  | - <term> <expr_tail>
                  | ε

<term>          ::= <factor> <term_tail>

<term_tail>     ::= * <factor> <term_tail>
                  | / <factor> <term_tail>
                  | ε

<factor>        ::= NUMBER
                  | IDENTIFIER
                  | ( <expr> )

<cond_expr>     ::= <expr> <rel_op> <expr>

<rel_op>        ::= ==
                  | <
                  | >
                  | <=
                  | >=
```

---
