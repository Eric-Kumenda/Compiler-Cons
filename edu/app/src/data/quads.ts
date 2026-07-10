export type QuadCategory = 'decl' | 'assign' | 'arith' | 'compare' | 'control' | 'label' | 'ret';

export type Quad = {
  index: number;
  op: string;
  arg1: string;
  arg2: string;
  result: string;
  category: QuadCategory;
  note: string;
};

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
];

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
];
