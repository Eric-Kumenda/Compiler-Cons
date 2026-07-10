# PRD — Elmo ICG Interactive Explainer
## "How Compilers Think: An Interactive Guide to Intermediate Code Generation"

---

## 1. Project overview

A **single-page React application** that teaches Intermediate Code Generation (ICG)
from first principles, designed for a compiler construction student audience.
The tone is friendly, playful, and honest — like a smart friend explaining
something over coffee. The site doubles as a reference and a demo tool for
the Elmo compiler project (a small C-like teaching language).

The primary audience is **two people**: a CS student (Leo) who built the
compiler, and a non-CS reader (his girlfriend) who should be able to follow
along and genuinely understand what is happening. Every concept must be
approachable without prior compiler knowledge.

---

## 2. Tech stack — exact versions matter

```
React 18
Vite 5 (bundler)
TypeScript (strict mode)
Tailwind CSS v4
HeroUI v3  (@heroui/react)  — primary component library or any other good component library if heroUIv3 is missing something. Or just create custom components.
GSAP  + ScrollTrigger plugin — all animations (NOT Framer Motion)
Lenis for smooth scrolling but i think GSAP might have this feature too. Check it.
Zustand 4 — global state (active tab, step index, simulation state)
React Router v6 — hash router for section deep-linking
Lucide React — icons only
a question; Is there any svg library for getting svgs for react websites? I need some svg icons for the website. so if there is one, feel free to abuse them for my benefit.
```

**Why GSAP over Framer Motion here:** the step-through animations require
timeline sequencing (highlight node → draw arrow → emit quad row, all in
precise order). GSAP timelines handle this cleanly. Framer Motion springs
are great for layout transitions but awkward for sequenced multi-element
choreography.

**Why HeroUI:** pre-built accessible components (Tabs, Card, Chip, Button,
Slider, Switch, Tooltip, Progress) that look polished without custom CSS.
Pair with Tailwind for layout and spacing only — never override HeroUI
internals with Tailwind classes.

---

## 3. Site structure

Can be a single page with deep-links or multiple pages. Have a sticky top navbar for navigation which appears fixed when page is at the top but detaches (with an animation) to become a floating navbar with glassmorphism

```
/
├── Hero
├── Pipeline        (where ICG sits in the compiler)
├── WhatIsICG       (concept explanation)
├── Quadruples      (interactive operation explorer)
├── StepThrough     (animated parse tree → quads walkthrough)
├── MemorySim       (virtual machine simulation)
├── WhyICG          (rationale section)
└── Footer
```

---

## 4. Global state (Zustand store)

```typescript
interface ElmoStore {
  // Step-through section
  stepIndex: number
  setStepIndex: (n: number) => void

  // Memory simulation section
  memStep: number
  setMemStep: (n: number) => void

  // Quadruple explorer
  activeOp: string | null
  setActiveOp: (op: string | null) => void

  // UI
  activeSection: string
  setActiveSection: (s: string) => void
}
```

---

## 5. Data layer — hardcode all of this exactly

### 5.1 The Elmo sample program

```elmo
int x;
int result;
x = 10;
result = 0;

if (x > 5) {
    result = x * 2;
} else {
    result = x + 1;
}

while (result > 0) {
    result = result - 1;
}

return result;
```

### 5.2 Token list (scanner output for sample program)

```typescript
export const TOKEN_LIST = [
  { line: 1,  type: 'KEYWORD',     lexeme: 'int' },
  { line: 1,  type: 'IDENTIFIER',  lexeme: 'x' },
  { line: 1,  type: 'PUNCTUATION', lexeme: ';' },
  { line: 2,  type: 'KEYWORD',     lexeme: 'int' },
  { line: 2,  type: 'IDENTIFIER',  lexeme: 'result' },
  { line: 2,  type: 'PUNCTUATION', lexeme: ';' },
  { line: 3,  type: 'IDENTIFIER',  lexeme: 'x' },
  { line: 3,  type: 'OPERATOR',    lexeme: '=' },
  { line: 3,  type: 'NUMBER',      lexeme: '10' },
  { line: 3,  type: 'PUNCTUATION', lexeme: ';' },
  { line: 4,  type: 'IDENTIFIER',  lexeme: 'result' },
  { line: 4,  type: 'OPERATOR',    lexeme: '=' },
  { line: 4,  type: 'NUMBER',      lexeme: '0' },
  { line: 4,  type: 'PUNCTUATION', lexeme: ';' },
  { line: 6,  type: 'KEYWORD',     lexeme: 'if' },
  { line: 6,  type: 'PUNCTUATION', lexeme: '(' },
  { line: 6,  type: 'IDENTIFIER',  lexeme: 'x' },
  { line: 6,  type: 'OPERATOR',    lexeme: '>' },
  { line: 6,  type: 'NUMBER',      lexeme: '5' },
  { line: 6,  type: 'PUNCTUATION', lexeme: ')' },
  { line: 6,  type: 'PUNCTUATION', lexeme: '{' },
  { line: 7,  type: 'IDENTIFIER',  lexeme: 'result' },
  { line: 7,  type: 'OPERATOR',    lexeme: '=' },
  { line: 7,  type: 'IDENTIFIER',  lexeme: 'x' },
  { line: 7,  type: 'OPERATOR',    lexeme: '*' },
  { line: 7,  type: 'NUMBER',      lexeme: '2' },
  { line: 7,  type: 'PUNCTUATION', lexeme: ';' },
  { line: 8,  type: 'PUNCTUATION', lexeme: '}' },
  { line: 8,  type: 'KEYWORD',     lexeme: 'else' },
  { line: 8,  type: 'PUNCTUATION', lexeme: '{' },
  { line: 9,  type: 'IDENTIFIER',  lexeme: 'result' },
  { line: 9,  type: 'OPERATOR',    lexeme: '=' },
  { line: 9,  type: 'IDENTIFIER',  lexeme: 'x' },
  { line: 9,  type: 'OPERATOR',    lexeme: '+' },
  { line: 9,  type: 'NUMBER',      lexeme: '1' },
  { line: 9,  type: 'PUNCTUATION', lexeme: ';' },
  { line: 10, type: 'PUNCTUATION', lexeme: '}' },
  { line: 12, type: 'KEYWORD',     lexeme: 'while' },
  { line: 12, type: 'PUNCTUATION', lexeme: '(' },
  { line: 12, type: 'IDENTIFIER',  lexeme: 'result' },
  { line: 12, type: 'OPERATOR',    lexeme: '>' },
  { line: 12, type: 'NUMBER',      lexeme: '0' },
  { line: 12, type: 'PUNCTUATION', lexeme: ')' },
  { line: 12, type: 'PUNCTUATION', lexeme: '{' },
  { line: 13, type: 'IDENTIFIER',  lexeme: 'result' },
  { line: 13, type: 'OPERATOR',    lexeme: '=' },
  { line: 13, type: 'IDENTIFIER',  lexeme: 'result' },
  { line: 13, type: 'OPERATOR',    lexeme: '-' },
  { line: 13, type: 'NUMBER',      lexeme: '1' },
  { line: 13, type: 'PUNCTUATION', lexeme: ';' },
  { line: 14, type: 'PUNCTUATION', lexeme: '}' },
  { line: 16, type: 'KEYWORD',     lexeme: 'return' },
  { line: 16, type: 'IDENTIFIER',  lexeme: 'result' },
  { line: 16, type: 'PUNCTUATION', lexeme: ';' },
  { line: 16, type: 'EOF',         lexeme: '' },
]
```

### 5.3 Full quadruple list (ICG output for sample program)

```typescript
export type Quad = {
  index: number
  op: string
  arg1: string
  arg2: string
  result: string
  category: 'decl' | 'assign' | 'arith' | 'compare' | 'control' | 'label' | 'ret'
  note: string  // human-readable explanation shown in UI
}

export const QUADS: Quad[] = [
  { index:0,  op:'DECL',  arg1:'x',      arg2:'_', result:'_',      category:'decl',    note:'Declare variable x — registers the name, no value yet' },
  { index:1,  op:'DECL',  arg1:'result', arg2:'_', result:'_',      category:'decl',    note:'Declare variable result' },
  { index:2,  op:'COPY',  arg1:'10',     arg2:'_', result:'x',      category:'assign',  note:'x = 10 — copy the literal 10 into x' },
  { index:3,  op:'COPY',  arg1:'0',      arg2:'_', result:'result', category:'assign',  note:'result = 0' },
  { index:4,  op:'GT',    arg1:'x',      arg2:'5', result:'t1',     category:'compare', note:'Is x > 5? Store 1 (true) or 0 (false) in t1' },
  { index:5,  op:'IFF',   arg1:'t1',     arg2:'_', result:'L1',     category:'control', note:'If t1 is false (0), jump to L1 (the else branch)' },
  { index:6,  op:'MUL',   arg1:'x',      arg2:'2', result:'t2',     category:'arith',   note:'t2 = x * 2 — then-branch body' },
  { index:7,  op:'COPY',  arg1:'t2',     arg2:'_', result:'result', category:'assign',  note:'result = t2' },
  { index:8,  op:'GOTO',  arg1:'_',      arg2:'_', result:'L2',     category:'control', note:'Jump to L2 — skip the else branch' },
  { index:9,  op:'LABEL', arg1:'L1',     arg2:'_', result:'_',      category:'label',   note:'L1: start of else branch' },
  { index:10, op:'ADD',   arg1:'x',      arg2:'1', result:'t3',     category:'arith',   note:'t3 = x + 1 — else-branch body' },
  { index:11, op:'COPY',  arg1:'t3',     arg2:'_', result:'result', category:'assign',  note:'result = t3' },
  { index:12, op:'LABEL', arg1:'L2',     arg2:'_', result:'_',      category:'label',   note:'L2: end of if/else block' },
  { index:13, op:'LABEL', arg1:'L3',     arg2:'_', result:'_',      category:'label',   note:'L3: top of while loop' },
  { index:14, op:'GT',    arg1:'result', arg2:'0', result:'t4',     category:'compare', note:'Is result > 0? t4 = 1 or 0' },
  { index:15, op:'IFF',   arg1:'t4',     arg2:'_', result:'L4',     category:'control', note:'If false, exit loop — jump to L4' },
  { index:16, op:'SUB',   arg1:'result', arg2:'1', result:'t5',     category:'arith',   note:'t5 = result - 1' },
  { index:17, op:'COPY',  arg1:'t5',     arg2:'_', result:'result', category:'assign',  note:'result = t5' },
  { index:18, op:'GOTO',  arg1:'_',      arg2:'_', result:'L3',     category:'control', note:'Jump back to loop top (L3)' },
  { index:19, op:'LABEL', arg1:'L4',     arg2:'_', result:'_',      category:'label',   note:'L4: loop exit point' },
  { index:20, op:'RET',   arg1:'result', arg2:'_', result:'_',      category:'ret',     note:'Return the value of result' },
]
```

### 5.4 Operation definitions (for Quadruples explorer)

```typescript
export const OP_DEFS = [
  {
    op: 'ADD', category: 'arith', label: 'Addition',
    signature: 'result = arg1 + arg2',
    example_elmo: 'result = x + 1;',
    example_quad: 'ADD  x    1    t1',
    explanation: 'Adds arg1 and arg2 together. Stores in result (always a temp variable). The original variables are unchanged.',
  },
  {
    op: 'SUB', category: 'arith', label: 'Subtraction',
    signature: 'result = arg1 - arg2',
    example_elmo: 'result = result - 1;',
    example_quad: 'SUB  result  1  t5',
    explanation: 'Subtracts arg2 from arg1. Note that "result" is the destination temp, not the Elmo variable called result.',
  },
  {
    op: 'MUL', category: 'arith', label: 'Multiplication',
    signature: 'result = arg1 * arg2',
    example_elmo: 'result = x * 2;',
    example_quad: 'MUL  x    2    t2',
    explanation: 'Multiplies arg1 by arg2. Stores in a fresh temporary so neither original operand is modified.',
  },
  {
    op: 'DIV', category: 'arith', label: 'Division',
    signature: 'result = arg1 / arg2',
    example_elmo: 'result = total / count;',
    example_quad: 'DIV  total  count  t1',
    explanation: 'Divides arg1 by arg2. In Elmo this is integer division.',
  },
  {
    op: 'COPY', category: 'assign', label: 'Assignment',
    signature: 'result = arg1  (arg2 unused)',
    example_elmo: 'x = 10;',
    example_quad: 'COPY  10  _  x',
    explanation: 'Copies arg1 into the destination. arg2 is always _ (unused). This is how every assignment statement ends up — even complex ones reduce to a COPY at the end.',
  },
  {
    op: 'DECL', category: 'decl', label: 'Declaration',
    signature: 'declare arg1  (arg2, result unused)',
    example_elmo: 'int x;',
    example_quad: 'DECL  x  _  _',
    explanation: 'Registers a variable name with the runtime. Does not assign a value. Both arg2 and result are _ because declaration needs no operands and produces no result.',
  },
  {
    op: 'GT', category: 'compare', label: 'Greater than',
    signature: 'result = (arg1 > arg2) ? 1 : 0',
    example_elmo: 'if (x > 5)',
    example_quad: 'GT  x  5  t1',
    explanation: 'Compares arg1 and arg2. Stores 1 in result if arg1 > arg2, stores 0 otherwise. The result is always a temp variable used immediately by an IFF instruction.',
  },
  {
    op: 'LT', category: 'compare', label: 'Less than',
    signature: 'result = (arg1 < arg2) ? 1 : 0',
    example_elmo: 'while (i < limit)',
    example_quad: 'LT  i  limit  t1',
    explanation: 'Same as GT but checks arg1 < arg2.',
  },
  {
    op: 'EQ', category: 'compare', label: 'Equal to',
    signature: 'result = (arg1 == arg2) ? 1 : 0',
    example_elmo: 'if (x == 0)',
    example_quad: 'EQ  x  0  t1',
    explanation: 'Checks equality. Stores 1 if equal, 0 otherwise.',
  },
  {
    op: 'LE', category: 'compare', label: 'Less than or equal',
    signature: 'result = (arg1 <= arg2) ? 1 : 0',
    example_elmo: 'if (sum <= 6)',
    example_quad: 'LE  sum  6  t1',
    explanation: 'Checks arg1 <= arg2.',
  },
  {
    op: 'GE', category: 'compare', label: 'Greater than or equal',
    signature: 'result = (arg1 >= arg2) ? 1 : 0',
    example_elmo: 'if (score >= 10)',
    example_quad: 'GE  score  10  t1',
    explanation: 'Checks arg1 >= arg2.',
  },
  {
    op: 'IFF', category: 'control', label: 'Conditional jump',
    signature: 'if arg1 == 0, goto result',
    example_elmo: 'if (x > 5) { ... }',
    example_quad: 'IFF  t1  _  L1',
    explanation: 'If false — jumps to the label in result ONLY if arg1 is 0 (false). If arg1 is 1 (true), execution continues to the next instruction. This is how if/while conditions work.',
  },
  {
    op: 'GOTO', category: 'control', label: 'Unconditional jump',
    signature: 'always jump to result',
    example_elmo: '} else {  (end of then-branch)',
    example_quad: 'GOTO  _  _  L2',
    explanation: 'Always jumps to the label in result, no condition. Used to skip the else branch after executing the then-branch, and to loop back to the top of a while loop.',
  },
  {
    op: 'LABEL', category: 'label', label: 'Label marker',
    signature: 'mark position arg1',
    example_elmo: '(not in source — compiler-generated)',
    example_quad: 'LABEL  L1  _  _',
    explanation: 'Marks a position in the instruction list that GOTO or IFF can jump to. Not an actual operation — just a named position. The label name is in arg1.',
  },
  {
    op: 'RET', category: 'ret', label: 'Return',
    signature: 'return arg1',
    example_elmo: 'return result;',
    example_quad: 'RET  result  _  _',
    explanation: 'Ends execution and returns the value of arg1. arg2 and result are both _ because return takes one value and produces nothing.',
  },
]
```

### 5.5 Step-through data (expression: x = 10 + 5 * 2)

```typescript
export const STEP_THROUGH = [
  {
    id: 0,
    title: 'Start at assign_stmt',
    activeNodes: ['assign_stmt'],
    emittedQuads: [],
    explanation: 'We start at the assign_stmt node. The parser built this for the line x = 10 + 5 * 2. Before we can assign anything to x, we need to evaluate the right-hand side expression. So we dive into the expr child node.',
    elmoHighlight: [0], // index into "x = 10 + 5 * 2 ;" tokens
  },
  {
    id: 1,
    title: 'Enter expr → visit term first',
    activeNodes: ['assign_stmt', 'expr', 'term'],
    emittedQuads: [],
    explanation: 'Inside expr, the grammar says: expr = term expr_tail. We must evaluate the term first — it holds the left side of any + or - operations. We descend into term.',
    elmoHighlight: [2, 3, 4],
  },
  {
    id: 2,
    title: 'factor returns 10',
    activeNodes: ['assign_stmt', 'expr', 'term', 'factor:10'],
    emittedQuads: [],
    explanation: 'term visits its factor child. The factor is just the number literal 10. Leaf nodes like numbers and identifiers return their value directly — no instruction emitted yet, we just know the left side of the multiplication is 10.',
    elmoHighlight: [2],
  },
  {
    id: 3,
    title: 'term_tail sees * 5 — emits MUL',
    activeNodes: ['assign_stmt', 'expr', 'term', 'term_tail'],
    emittedQuads: [
      { index:0, op:'MUL', arg1:'10', arg2:'5', result:'t1', category:'arith', note:'10 * 5 stored in t1' }
    ],
    explanation: 'term_tail looks ahead and sees * then 5. It consumes both, generates a fresh temporary t1, and emits MUL 10 5 → t1. Now t1 holds 50. The temporary t1 was invented by the compiler — it does not exist in your Elmo code.',
    elmoHighlight: [3, 4],
  },
  {
    id: 4,
    title: 'term returns t1, expr_tail sees +',
    activeNodes: ['assign_stmt', 'expr', 'expr_tail'],
    emittedQuads: [
      { index:0, op:'MUL', arg1:'10', arg2:'5', result:'t1', category:'arith', note:'10 * 5 = 50 in t1' }
    ],
    explanation: 'term is done and passes t1 back to expr. Now expr_tail runs. It looks ahead and sees + then 2. So it will do an addition with t1 as the left operand.',
    elmoHighlight: [5, 6],
  },
  {
    id: 5,
    title: 'expr_tail emits ADD',
    activeNodes: ['assign_stmt', 'expr', 'expr_tail'],
    emittedQuads: [
      { index:0, op:'MUL', arg1:'10', arg2:'5', result:'t1', category:'arith', note:'10 * 5 = 50 in t1' },
      { index:1, op:'ADD', arg1:'t1',  arg2:'2', result:'t2', category:'arith', note:'t1 + 2 stored in t2' }
    ],
    explanation: 'expr_tail emits ADD with t1 (left) and 2 (right) into a new temporary t2. Notice how t1 from the previous step feeds directly into this one — temporaries chain naturally. t2 now holds 52. Operator precedence (* before +) was handled automatically by the grammar structure — term processed the * before expr_tail got to the +.',
    elmoHighlight: [5, 6],
  },
  {
    id: 6,
    title: 'expr returns t2',
    activeNodes: ['assign_stmt', 'expr'],
    emittedQuads: [
      { index:0, op:'MUL', arg1:'10', arg2:'5', result:'t1', category:'arith', note:'10 * 5 = 50' },
      { index:1, op:'ADD', arg1:'t1',  arg2:'2', result:'t2', category:'arith', note:'50 + 2 = 52' }
    ],
    explanation: 'expr_tail is done. expr returns t2 to its parent (assign_stmt). The full expression 10 + 5 * 2 has been reduced to a single name: t2.',
    elmoHighlight: [],
  },
  {
    id: 7,
    title: 'assign_stmt emits COPY',
    activeNodes: ['assign_stmt'],
    emittedQuads: [
      { index:0, op:'MUL', arg1:'10', arg2:'5', result:'t1', category:'arith', note:'10 * 5 = 50' },
      { index:1, op:'ADD', arg1:'t1',  arg2:'2', result:'t2', category:'arith', note:'50 + 2 = 52' },
      { index:2, op:'COPY', arg1:'t2', arg2:'_', result:'x',  category:'assign', note:'x = t2 (52)' }
    ],
    explanation: 'assign_stmt now has everything: the variable name x and the expression result t2. It emits COPY t2 → x. Done. Three instructions for one line of Elmo. This is intermediate code generation.',
    elmoHighlight: [0],
  },
]
```

### 5.6 Memory simulation states

```typescript
export type MemState = {
  step: number
  quad: number     // which QUADS[n] is executing
  memory: Record<string, string | number | null>
  newlyWritten: string | null
  jumped: boolean
  explanation: string
  programCounter: number
}

export const MEM_STATES: MemState[] = [
  { step:0,  quad:0,  memory:{ x:null, result:null }, newlyWritten:null, jumped:false, programCounter:0,
    explanation:'Starting execution. Memory is empty — no variables exist yet.' },
  { step:1,  quad:0,  memory:{ x:'declared', result:null }, newlyWritten:'x', jumped:false, programCounter:1,
    explanation:'DECL x — variable x is registered. Value is still undefined.' },
  { step:2,  quad:1,  memory:{ x:'declared', result:'declared' }, newlyWritten:'result', jumped:false, programCounter:2,
    explanation:'DECL result — result is registered.' },
  { step:3,  quad:2,  memory:{ x:10, result:'declared' }, newlyWritten:'x', jumped:false, programCounter:3,
    explanation:'COPY 10 → x. The literal 10 is written into x.' },
  { step:4,  quad:3,  memory:{ x:10, result:0 }, newlyWritten:'result', jumped:false, programCounter:4,
    explanation:'COPY 0 → result. result is now 0.' },
  { step:5,  quad:4,  memory:{ x:10, result:0, t1:1 }, newlyWritten:'t1', jumped:false, programCounter:5,
    explanation:'GT x 5 → t1. x is 10, which is > 5, so t1 = 1 (true).' },
  { step:6,  quad:5,  memory:{ x:10, result:0, t1:1 }, newlyWritten:null, jumped:false, programCounter:6,
    explanation:'IFF t1 _ L1. t1 is 1 (true), so we do NOT jump. Continue to line 6 (then-branch).' },
  { step:7,  quad:6,  memory:{ x:10, result:0, t1:1, t2:20 }, newlyWritten:'t2', jumped:false, programCounter:7,
    explanation:'MUL x 2 → t2. x=10, so 10 * 2 = 20. t2 = 20.' },
  { step:8,  quad:7,  memory:{ x:10, result:20, t1:1, t2:20 }, newlyWritten:'result', jumped:false, programCounter:8,
    explanation:'COPY t2 → result. result is now 20.' },
  { step:9,  quad:8,  memory:{ x:10, result:20, t1:1, t2:20 }, newlyWritten:null, jumped:true, programCounter:12,
    explanation:'GOTO L2. We always jump to L2 — the else branch (lines 9-11) is completely skipped.' },
  { step:10, quad:12, memory:{ x:10, result:20, t1:1, t2:20 }, newlyWritten:null, jumped:false, programCounter:13,
    explanation:'LABEL L2 — we landed here from GOTO. This marks the end of the if/else block.' },
  { step:11, quad:13, memory:{ x:10, result:20, t1:1, t2:20 }, newlyWritten:null, jumped:false, programCounter:14,
    explanation:'LABEL L3 — top of the while loop. Execution reaches here for the first time.' },
  { step:12, quad:14, memory:{ x:10, result:20, t1:1, t2:20, t4:1 }, newlyWritten:'t4', jumped:false, programCounter:15,
    explanation:'GT result 0 → t4. result=20, 20 > 0, so t4 = 1 (true). Loop condition holds.' },
  { step:13, quad:15, memory:{ x:10, result:20, t1:1, t2:20, t4:1 }, newlyWritten:null, jumped:false, programCounter:16,
    explanation:'IFF t4 _ L4. t4=1, so no jump. We enter the loop body.' },
  { step:14, quad:16, memory:{ x:10, result:20, t1:1, t2:20, t4:1, t5:19 }, newlyWritten:'t5', jumped:false, programCounter:17,
    explanation:'SUB result 1 → t5. 20 - 1 = 19. t5 = 19.' },
  { step:15, quad:17, memory:{ x:10, result:19, t1:1, t2:20, t4:1, t5:19 }, newlyWritten:'result', jumped:false, programCounter:18,
    explanation:'COPY t5 → result. result = 19.' },
  { step:16, quad:18, memory:{ x:10, result:19, t1:1, t2:20, t4:1, t5:19 }, newlyWritten:null, jumped:true, programCounter:13,
    explanation:'GOTO L3 — jump back to top of loop. The loop will continue until result reaches 0 (20 iterations total).' },
  { step:17, quad:19, memory:{ x:10, result:0, t1:1, t2:20, t4:0, t5:1 }, newlyWritten:'t4', jumped:false, programCounter:20,
    explanation:'(After 20 loop iterations) GT result 0 → t4. result is now 0, which is NOT > 0. t4 = 0 (false).' },
  { step:18, quad:20, memory:{ x:10, result:0, t1:1, t2:20, t4:0, t5:1 }, newlyWritten:null, jumped:true, programCounter:19,
    explanation:'IFF t4 _ L4. t4=0 (false) — this time we DO jump to L4. The loop exits!' },
  { step:19, quad:19, memory:{ x:10, result:0, t1:1, t2:20, t4:0, t5:1 }, newlyWritten:null, jumped:false, programCounter:20,
    explanation:'LABEL L4 — we landed here. The loop is over.' },
  { step:20, quad:20, memory:{ x:10, result:0, t1:1, t2:20, t4:0, t5:1 }, newlyWritten:null, jumped:false, programCounter:-1,
    explanation:'RET result. Execution ends. The final value returned is 0 (result after 20 decrements).' },
]
```

---

## 6. Section specifications

### 6.1 Hero section

- Full viewport height
- Bold headline: "How Compilers Think"
- Subtitle: "An interactive guide to Intermediate Code Generation — built for Elmo, explained for everyone"
- Animated text: cycle through "source code" → "tokens" → "parse tree" → "quadruples" with a typing animation (GSAP TextPlugin or manual char-by-char)
- CTA button: "Start learning ↓" — smooth scrolls to Pipeline section
- Background: subtle animated grid or particle effect (keep it tasteful — not distracting)
- Small badge: "Built for Elmo — a teaching compiler" with a tiny chip

### 6.2 Pipeline section

- Heading: "Where does ICG fit?"
- Horizontal pipeline diagram: Scanner → Parser → ICG → Code Gen
- Each stage is a card with icon, name, and one-line description
- ICG card is highlighted/elevated (this is what we're teaching)
- On mobile: stack vertically
- Arrow connectors between cards with subtle animation on scroll (GSAP ScrollTrigger)
- Below the diagram: "The parse tree goes in. A flat list of simple instructions comes out."

### 6.3 WhatIsICG section

- Heading: "What does ICG actually do?"
- Side-by-side comparison card:
  - Left: Elmo source `result = x * 2 + 1;` (syntax highlighted)
  - Arrow in the middle labeled "ICG transforms this"
  - Right: The three resulting quadruples (MUL, ADD, COPY) in a styled table
- Below: four "why" cards (break complex ops, create temps, handle control flow, emit flat list) — each with icon and short description
- Animation: the left code highlights each token as the corresponding quad lights up on the right. Triggered by a "Watch it happen" button. Use GSAP timeline.

### 6.4 Quadruples section

- Heading: "The instruction set"
- Subtitle: "Every operation your Elmo ICG can emit. Click one to explore it."
- Left panel: grid of operation chips, grouped by category (arith, assign, control, label, ret). Use HeroUI Chip components with category-based colors.
- Right panel: detail view for selected op:
  - Op name as large heading
  - Signature (e.g. `result = arg1 + arg2`)
  - Elmo example (syntax highlighted)
  - Quadruple example (mono, styled)
  - Plain-English explanation
  - A "what about the _ ?" callout that explains unused fields
- Default selection: COPY (most fundamental)
- Categories: arith (green), assign (blue), compare (amber), control (purple), label (gray), ret (red)

### 6.5 StepThrough section

- Heading: "Watch the magic happen"
- Subtitle: "Parsing x = 10 + 5 * 2; step by step"
- Three-panel layout:
  - Panel A (left): Parse tree diagram — SVG or React-drawn. Nodes that are "active" glow/pulse. Visited nodes dim. Use GSAP for the highlight transitions.
  - Panel B (middle): The Elmo source line, with tokens highlighting as they're consumed
  - Panel C (right): Quadruples list. Each new quad animates in with a slide+fade. Emitted quads stay visible but dim slightly.
- Bottom: explanation text box (changes per step, animates in)
- Controls: Prev / Next buttons + a step progress indicator (HeroUI Progress)
- Auto-play toggle: runs through all steps with 1.5s delay between them
- Keyboard support: left/right arrow keys

### 6.6 MemorySim section

- Heading: "Run it yourself"
- Subtitle: "Step through the full sample program. Watch variables change in real time."
- Layout:
  - Top left: current instruction highlighted in the full quadruples list (scrollable, auto-scrolls to active)
  - Top right: memory cells grid — each variable/temp is a card. When a value is written, the card flashes and updates (GSAP flash animation).
  - Bottom left: program counter display + "jumped to L3" indicator when a GOTO fires
  - Bottom right: plain-English explanation for the current step
- Controls: Prev / Next / Reset / Auto-play (1s per step)
- Speed slider: controls auto-play speed (0.5x to 3x)
- When GOTO/IFF jumps: animate an arrow from the current instruction to the destination label in the quad list

### 6.7 WhyICG section

- Heading: "Why not skip straight to machine code?"
- Four reason cards, each expandable (HeroUI Accordion):
  1. Machine code is CPU-specific — ICG is portable
  2. Flat instructions are easier to optimise
  3. Clean separation of compiler phases
  4. Quadruples are trivially interpretable
- Grammar → instruction mapping table at the bottom:
  - Two columns: Grammar rule | ICG instruction(s) emitted
  - All 8 grammar rules from Elmo's BNF

### 6.8 Footer

- "Built by Group 3 — Compiler Construction, 2026"
- Members: Leo, Sandra, Morris, Eric
- "Powered by Elmo — a teaching compiler"
- Link to GitHub if applicable

---

## 7. Design system

### Colors (use Tailwind + HeroUI theme)

```
Primary:   indigo/violet family (compiler = abstract/mathematical)
Success:   emerald (correct, emitted, done)
Warning:   amber (active, current, highlighted)
Danger:    rose (errors, jumps)
Neutral:   slate (backgrounds, borders, inactive)

Category colors for op chips:
  arith:   emerald
  assign:  sky
  compare: amber
  control: violet
  label:   slate
  ret:     rose
```

### Typography
- Headings: bold, large (text-4xl to text-6xl for hero)
- Body: text-base, line-height relaxed
- Code/mono: font-mono, rounded background pill
- All section headings follow sentence case (not Title Case)

### Tone rules (enforce in copy)
- No jargon without immediate explanation
- Use "we" when describing what the compiler does (inclusive)
- Use analogies: "think of it like..." before formal definitions
- Short sentences. Real examples first, theory second.
- OK to be slightly playful: a light emoji here and there, a pun if it fits

### Animation principles (GSAP)
- Durations: 0.3s for micro (highlights, flashes), 0.6s for transitions, 1.2s for reveals
- Easing: power2.out for most things, elastic.out(1, 0.5) for "pop" moments (new quad appearing)
- Never animate more than 3 elements simultaneously — stagger if needed
- Respect prefers-reduced-motion: wrap all GSAP animations in a motion check

---

## 8. File structure

```
src/
├── main.tsx
├── App.tsx
├── store/
│   └── elmoStore.ts          (Zustand)
├── data/
│   ├── tokens.ts             (TOKEN_LIST)
│   ├── quads.ts              (QUADS, OP_DEFS)
│   ├── stepThrough.ts        (STEP_THROUGH)
│   └── memSim.ts             (MEM_STATES)
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Pipeline.tsx
│   ├── WhatIsICG.tsx
│   ├── QuadruplesExplorer.tsx
│   ├── StepThrough.tsx
│   ├── MemorySim.tsx
│   ├── WhyICG.tsx
│   └── Footer.tsx
├── ui/
│   ├── CodeBlock.tsx         (syntax-highlighted code display)
│   ├── QuadRow.tsx           (single quad display row)
│   ├── MemoryCell.tsx        (variable/temp display card)
│   ├── ParseTreeNode.tsx     (SVG/React node for tree display)
│   └── OpChip.tsx            (operation category chip)
└── hooks/
    ├── useAutoPlay.ts        (shared auto-play logic)
    └── useKeyboardNav.ts     (arrow key step navigation)
```

---

## 9. Critical implementation notes for the agent

1. **All data is in `src/data/`** — never hardcode strings in components. Import from the data files.

2. **GSAP must be imported correctly** — use `gsap` and register plugins at the top of App.tsx:
   ```typescript
   import { gsap } from 'gsap'
   import { ScrollTrigger } from 'gsap/ScrollTrigger'
   gsap.registerPlugin(ScrollTrigger)
   ```

3. **HeroUI setup** — wrap the app in `<HeroUIProvider>` in main.tsx. Import components from `@heroui/react`.

4. **The parse tree in StepThrough** — draw it as an SVG with React. Nodes are `<rect>` + `<text>`. Active nodes get a glow filter (SVG `<feGaussianBlur>` drop shadow or just a colored stroke). Do not use a third-party tree library — hand-draw the 7-node tree for `x = 10 + 5 * 2`.

5. **The parse tree structure** for `x = 10 + 5 * 2` is:
   ```
   assign_stmt
   ├── identifier: x
   ├── operator: =
   ├── expr
   │   ├── term
   │   │   ├── factor: 10
   │   │   └── term_tail (* 5)
   │   └── expr_tail (+ 2)
   └── punctuation: ;
   ```

6. **MemorySim auto-scroll** — the quadruples list in MemorySim must auto-scroll to keep the active instruction visible. Use a ref array and `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`.

7. **GOTO jump animation** — when a jump occurs (jumped: true in MEM_STATES), draw a temporary SVG arrow from the current quad row to the destination row in the list. Animate it with GSAP (drawSVG plugin or manual stroke-dashoffset animation). Remove it after 800ms.

8. **Keyboard navigation** — in StepThrough and MemorySim, ArrowRight = next, ArrowLeft = prev. Add and remove the event listener in a useEffect with proper cleanup.

9. **Mobile** — the site must be usable on mobile. StepThrough and MemorySim panels should stack vertically on screens < 768px. The parse tree SVG should scale down gracefully.

10. **No lorem ipsum** — every piece of text in the site must be real content from this PRD. The explanations are pre-written in the data layer above — use them verbatim.

11. **Syntax highlighting** — for Elmo code blocks, use a simple hand-rolled highlighter (no Prism or Shiki needed — just color keywords, identifiers, numbers, operators with different text colors using spans). The keyword list is: int, if, else, while, return.

12. **HeroUI + Tailwind conflict** — do not use Tailwind classes on HeroUI internals. Wrap HeroUI components in plain divs and style the wrappers with Tailwind. Never `className` prop on `<Button>` etc. with Tailwind utility classes — use HeroUI's own variant/color props.

---

## 10. Acceptance criteria

- [ ] All 6 data sections render without errors
- [ ] StepThrough: 8 steps navigate correctly with Prev/Next and arrow keys
- [ ] StepThrough: auto-play completes all steps and stops
- [ ] MemorySim: 21 steps match the QUADS list exactly
- [ ] MemorySim: GOTO jumps show visual animation
- [ ] QuadruplesExplorer: all 15 ops selectable, detail panel updates correctly
- [ ] WhatIsICG: "Watch it happen" animation runs and is re-triggerable
- [ ] Pipeline diagram: scroll animation fires on first scroll into view
- [ ] Responsive: usable at 375px (iPhone SE) and 1440px
- [ ] prefers-reduced-motion: all GSAP animations disabled when set
- [ ] No TypeScript errors in strict mode
- [ ] No console errors or warnings in production build