import type { Quad } from './quads';

export type Step = {
  id: number;
  title: string;
  activeNodes: string[];
  emittedQuads: Partial<Quad>[];
  explanation: string;
  elmoHighlight: number[]; // index into "x = 10 + 5 * 2 ;" tokens
};

export const STEP_THROUGH: Step[] = [
  {
    id: 0,
    title: 'Start at assign_stmt',
    activeNodes: ['assign_stmt'],
    emittedQuads: [],
    explanation: 'We start at the assign_stmt node. The parser built this for the line x = 10 + 5 * 2. Before we can assign anything to x, we need to evaluate the right-hand side expression. So we dive into the expr child node.',
    elmoHighlight: [0],
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
];
