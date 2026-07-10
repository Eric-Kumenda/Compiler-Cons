export type MemState = {
  step: number;
  quad: number;     // which QUADS[n] is executing
  memory: Record<string, string | number | null>;
  newlyWritten: string | null;
  jumped: boolean;
  explanation: string;
  programCounter: number;
};

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
    explanation:'IFF t4 _ L4. t4=1, so no jump. we enter the loop body.' },
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
];
