import React from 'react';
import { Card, Chip } from '@heroui/react';
import { HelpCircle, Info } from 'lucide-react';
import { OP_DEFS } from '../data/quads';
import type { QuadCategory } from '../data/quads';
import { OpChip } from '../ui/OpChip';

import { useElmoStore } from '../store/elmoStore';

export const QuadruplesExplorer: React.FC = () => {
  const { activeOp, setActiveOp } = useElmoStore();
  
  // Default to COPY if nothing selected
  const currentOp = OP_DEFS.find(o => o.op === activeOp) || OP_DEFS.find(o => o.op === 'COPY')!;

  const categories: QuadCategory[] = ['arith', 'assign', 'compare', 'control', 'label', 'ret'];

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">The instruction set</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Every operation your Elmo ICG can emit. Click one to explore how it works.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Operation Grid */}
          <div className="lg:col-span-5 space-y-8">
            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">{cat}</h3>
                <div className="flex flex-wrap gap-3">
                  {OP_DEFS.filter(o => o.category === cat).map((op) => (
                    <button 
                      key={op.op}
                      onClick={() => setActiveOp(op.op)}
                      className="transition-transform hover:scale-105 active:scale-95"
                    >
                      <OpChip 
                        category={op.category as QuadCategory} 
                        variant={currentOp.op === op.op ? 'primary' : 'soft'}
                        className="cursor-pointer h-10 px-6 text-base"
                      >
                        {op.op}
                      </OpChip>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel: Detail View */}
          <div className="lg:col-span-7">
            <Card className="h-full border-none shadow-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r from-indigo-500 to-purple-500`} />
              <Card.Content className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-4xl font-black">{currentOp.op}</h3>
                      <Chip variant="soft" size="sm" color="default" className="font-mono">
                        <Chip.Label>{currentOp.label}</Chip.Label>
                      </Chip>
                    </div>
                    <p className="text-lg text-slate-500 dark:text-slate-400 italic">
                      {currentOp.signature}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <Info className="w-6 h-6 text-indigo-500" />
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Explanation</h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                      {currentOp.explanation}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Elmo Code</h4>
                      <div className="!bg-white dark:!bg-slate-950 !text-slate-800 dark:!text-slate-200 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-sm">
                        {currentOp.example_elmo}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Quadruple</h4>
                      <div className="bg-slate-900 text-indigo-400 p-4 rounded-xl border border-slate-800 font-mono text-sm flex justify-between items-center">
                        <code>{currentOp.example_quad}</code>
                        <Chip size="sm" variant="soft" color="accent">
                          <Chip.Label>Result: {currentOp.example_quad.split(' ').pop()}</Chip.Label>
                        </Chip>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-indigo-500/5 border-none shadow-none mt-8">
                    <Card.Content className="p-6 flex flex-row gap-4 items-start">
                      <HelpCircle className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-bold text-sm mb-1">What about the _ ?</h5>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          The underscore <code>_</code> in a quadruple means that argument is unused for this specific operation. 
                          {currentOp.op === 'DECL' ? ' Since DECL just registers a name, it doesn\'t need arg2 or a separate result slot.' : ''}
                          {currentOp.op === 'COPY' ? ' Since COPY only needs one value, arg2 is ignored.' : ''}
                        </p>
                      </div>
                    </Card.Content>
                  </Card>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
