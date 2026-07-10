import React, { useEffect, useRef } from 'react';
import { Button, Card, ProgressBar, Chip } from '@heroui/react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { STEP_THROUGH } from '../data/stepThrough';
import { TOKEN_LIST } from '../data/tokens';
import { ParseTreeNode } from '../ui/ParseTreeNode';
import { QuadRow } from '../ui/QuadRow';
import { useElmoStore } from '../store/elmoStore';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


// Node positions for the parse tree
const NODES = [
  { id: 'assign_stmt', label: 'assign_stmt', x: 400, y: 50 },
  { id: 'identifier:x', label: 'id: x', x: 150, y: 150, parent: 'assign_stmt' },
  { id: 'operator:=', label: 'op: =', x: 300, y: 150, parent: 'assign_stmt' },
  { id: 'expr', label: 'expr', x: 500, y: 150, parent: 'assign_stmt' },
  { id: 'punctuation:;', label: 'punc: ;', x: 650, y: 150, parent: 'assign_stmt' },
  { id: 'term', label: 'term', x: 400, y: 250, parent: 'expr' },
  { id: 'expr_tail', label: 'expr_tail', x: 600, y: 250, parent: 'expr' },
  { id: 'factor:10', label: 'factor: 10', x: 300, y: 350, parent: 'term' },
  { id: 'term_tail', label: 'term_tail', x: 500, y: 350, parent: 'term' },
];

export const StepThrough: React.FC = () => {
  const { stepIndex, setStepIndex } = useElmoStore();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const timerRef = useRef<any>(null);

  const currentStep = STEP_THROUGH[stepIndex];
  const progress = ((stepIndex + 1) / STEP_THROUGH.length) * 100;

  const nextStep = () => setStepIndex(Math.min(stepIndex + 1, STEP_THROUGH.length - 1));
  const prevStep = () => setStepIndex(Math.max(stepIndex - 1, 0));

  useEffect(() => {
    if (isPlaying) {
      if (stepIndex === STEP_THROUGH.length - 1) {
        setIsPlaying(false);
      } else {
        timerRef.current = setTimeout(nextStep, 2500);
      }
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, stepIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepIndex]);

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Watch the magic happen</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Parsing <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded">x = 10 + 5 * 2;</code> step by step</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 min-h-[600px]">
          {/* Panel A: Parse Tree (SVG) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 relative z-20">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              Parse Tree State
            </h3>
            
            <div className="absolute inset-0 top-16">
              <TransformWrapper
                initialScale={0.8}
                minScale={0.3}
                maxScale={3}
                centerOnInit={true}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button isIconOnly size="sm" variant="secondary" onPress={() => zoomIn()}>+</Button>
                      <Button isIconOnly size="sm" variant="secondary" onPress={() => zoomOut()}>-</Button>
                      <Button isIconOnly size="sm" variant="secondary" onPress={() => resetTransform()}>↺</Button>
                    </div>
                    <TransformComponent wrapperClass="w-full h-full cursor-grab active:cursor-grabbing" contentClass="w-full h-full">
                      <svg viewBox="0 0 800 450" className="w-[800px] h-[450px]">
                        <defs>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* Lines first */}
                        {NODES.map(node => {
                          const parentNode = NODES.find(n => n.id === node.parent);
                          if (!parentNode) return null;
                          const isActive = currentStep.activeNodes.includes(node.id) && currentStep.activeNodes.includes(parentNode.id);
                          return (
                            <line 
                              key={`line-${node.id}`}
                              x1={node.x} y1={node.y}
                              x2={parentNode.x} y2={parentNode.y}
                              stroke="currentColor"
                              strokeWidth={isActive ? 3 : 1}
                              className={`transition-all duration-500 ${isActive ? 'text-indigo-500' : 'text-slate-200 dark:text-slate-800'}`}
                            />
                          );
                        })}

                        {/* Nodes */}
                        {NODES.map(node => (
                          <ParseTreeNode 
                            key={node.id}
                            x={node.x} y={node.y}
                            label={node.label}
                            isActive={currentStep.activeNodes.includes(node.id)}
                            isVisited={false} // Can add visited logic if needed
                          />
                        ))}
                      </svg>
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>

          {/* Panel B: Source + Quads */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Tokens View */}
            <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-xl !bg-white dark:!bg-slate-900">
              <Card.Content className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Token Consumption</h3>
                <div className="flex flex-wrap gap-2 font-mono">
                  {TOKEN_LIST.slice(6, 14).map((token, i) => {
                    const isHighlighted = currentStep.elmoHighlight.includes(i);
                    return (
                      <div 
                        key={i}
                        className={`px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                          isHighlighted 
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/30 scale-110' 
                            : '!bg-slate-50 dark:!bg-slate-800 border-slate-200 dark:border-slate-800 opacity-40 !text-slate-800 dark:!text-slate-200'
                        }`}
                      >
                        {token.lexeme || (token.type === 'EOF' ? 'EOF' : '')}
                      </div>
                    );
                  })}
                </div>
              </Card.Content>
            </Card>

            {/* Quads Emitter */}
            <Card className="flex-1 border border-slate-200/60 dark:border-slate-800/60 shadow-xl !bg-white dark:!bg-slate-900 overflow-hidden">
              <Card.Content className="p-6 flex flex-col">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Emitted Quadruples</h3>
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-10 custom-scrollbar">
                  {currentStep.emittedQuads.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      Waiting for instructions...
                    </div>
                  ) : (
                    currentStep.emittedQuads.map((quad, i) => (
                      <QuadRow 
                        key={i} 
                        quad={quad} 
                        isActive={i === currentStep.emittedQuads.length - 1} 
                        className="animate-in fade-in slide-in-from-right duration-500"
                      />
                    ))
                  )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-500 p-2 rounded-lg mt-1">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1 !text-slate-900 dark:!text-white">{currentStep.title}</h4>
                      <p className="text-sm !text-slate-600 dark:!text-slate-400 leading-relaxed">{currentStep.explanation}</p>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-full p-2 flex items-center shadow-2xl">
          <div className="flex gap-1 ml-2">
            <Button isIconOnly aria-label="Restart from step one" variant="ghost" className="rounded-full" onPress={() => setStepIndex(0)}><RotateCcw className="w-4 h-4" /></Button>
            <Button isIconOnly aria-label="Previous step" variant="ghost" className="rounded-full" onPress={prevStep} isDisabled={stepIndex === 0}><ChevronLeft className="w-6 h-6" /></Button>
            <Button 
              isIconOnly 
              aria-label={isPlaying ? "Pause playback" : "Play step-through"}
              variant="primary"
              className="rounded-full w-12 h-12 shadow-lg shadow-indigo-500/30"
              onPress={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
            </Button>
            <Button isIconOnly aria-label="Next step" variant="ghost" className="rounded-full" onPress={nextStep} isDisabled={stepIndex === STEP_THROUGH.length - 1}><ChevronRight className="w-6 h-6" /></Button>
          </div>
          
          <div className="flex-1 mx-6">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              <span>Step {stepIndex + 1} of {STEP_THROUGH.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <ProgressBar aria-label="Step Progress" value={progress} className="h-1.5">
              <ProgressBar.Track className="h-full bg-slate-200 dark:bg-slate-800 rounded-full">
                <ProgressBar.Fill className="bg-indigo-500 rounded-full" />
              </ProgressBar.Track>
            </ProgressBar>
          </div>

          <div className="mr-6 hidden sm:block">
             <Chip variant="soft" color="warning" size="sm" className="font-bold uppercase tracking-wider">
               <Chip.Label>{isPlaying ? 'Auto-playing' : 'Paused'}</Chip.Label>
             </Chip>
          </div>
        </div>
      </div>
    </section>
  );
};
