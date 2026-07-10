import React, { useRef, useState } from 'react';
import { Button, Card } from '@heroui/react';
import { Play, Zap, Layers, RefreshCw, ListTree } from 'lucide-react';
import { CodeBlock } from '../ui/CodeBlock';
import { QuadRow } from '../ui/QuadRow';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const exampleCode = `result = x * 2 + 1;`;
const exampleQuads = [
  { index: 0, op: 'MUL', arg1: 'x', arg2: '2', result: 't1', category: 'arith' as const, note: 'Multiply x by 2' },
  { index: 1, op: 'ADD', arg1: 't1', arg2: '1', result: 't2', category: 'arith' as const, note: 'Add 1 to result of multiplication' },
  { index: 2, op: 'COPY', arg1: 't2', arg2: '_', result: 'result', category: 'assign' as const, note: 'Store final value in result' },
];

const reasons = [
  { icon: Layers, title: 'Break complex ops', desc: 'Turns nested math like x*2+1 into a flat sequence of atomic steps.' },
  { icon: Zap, title: 'Create temps', desc: 'Invents "temporary variables" (t1, t2) to hold intermediate calculation results.' },
  { icon: RefreshCw, title: 'Simplify logic', desc: 'Standardizes operations so optimizations can be applied more easily.' },
  { icon: ListTree, title: 'Flat list', desc: 'Moves away from hierarchical trees to a linear list of instructions.' },
];

export const WhatIsICG: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { contextSafe } = useGSAP({ scope: containerRef });

  const runAnimation = contextSafe(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        setActiveStep(null);
      }
    });

    exampleQuads.forEach((_, i) => {
      tl.add(() => setActiveStep(i), i * 1.2)
        .from(`.quad-example-${i}`, {
          x: 20,
          opacity: 0,
          duration: 0.4,
          ease: "back.out"
        }, i * 1.2);
    });
  });

  return (
    <section ref={containerRef} className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">What does ICG actually do?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            It transforms the "shapes" of code into a flat, simple instruction set.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            <Card.Content className="p-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Elmo Source</span>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="font-bold"
                  onPress={runAnimation}
                  isPending={isAnimating}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch it happen
                </Button>
              </div>
              <CodeBlock code={exampleCode} className="mb-0" />
              
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">ICG transformation</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
                
                <div className="flex flex-col gap-2">
                  {exampleQuads.map((quad, i) => (
                    <div key={i} className={`quad-example-${i}`}>
                      <QuadRow 
                        quad={quad} 
                        isActive={activeStep === i} 
                        className={activeStep !== null && activeStep !== i ? 'opacity-20' : ''}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reasons.map((reason, i) => (
              <Card key={i} className="border border-slate-200/60 dark:border-slate-800/60 shadow-lg hover:shadow-xl transition-shadow !bg-white dark:!bg-slate-900 !text-slate-900 dark:!text-white">
                <Card.Content className="p-6">
                  <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <reason.icon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 !text-slate-900 dark:!text-white">{reason.title}</h3>
                  <p className="text-sm !text-slate-600 dark:!text-slate-400 leading-relaxed">{reason.desc}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
