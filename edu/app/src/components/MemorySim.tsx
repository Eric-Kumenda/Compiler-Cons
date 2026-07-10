import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Slider, Chip } from '@heroui/react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Activity, Database } from 'lucide-react';
import gsap from 'gsap';
import { MEM_STATES } from '../data/memSim';
import { QUADS } from '../data/quads';
import { QuadRow } from '../ui/QuadRow';
import { MemoryCell } from '../ui/MemoryCell';
import { useElmoStore } from '../store/elmoStore';


export const MemorySim: React.FC = () => {
  const { memStep, setMemStep } = useElmoStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<any>(null);
  const quadListRef = useRef<HTMLDivElement>(null);
  const quadRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setStep = (step: number) => {
    if (step < 0 || step >= MEM_STATES.length) return;
    setMemStep(step);
    
    // Auto-scroll logic with defensive check
    const state = MEM_STATES[step];
    if (state) {
      const activeIndex = state.quad;
      const activeEl = quadRefs.current[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const currentState = MEM_STATES[memStep] || MEM_STATES[0];
  const activeQuadIndex = currentState.quad;

  const nextStep = () => setStep(Math.min(memStep + 1, MEM_STATES.length - 1));
  const prevStep = () => setStep(Math.max(memStep - 1, 0));
  const reset = () => setStep(0);

  useEffect(() => {
    if (isPlaying) {
      if (memStep === MEM_STATES.length - 1) {
        setIsPlaying(false);
      } else {
        timerRef.current = setTimeout(nextStep, 2000 / speed);
      }
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, memStep, speed]);

  // Jump animation
  useEffect(() => {
    if (currentState?.jumped && activeQuadIndex !== undefined) {
      // Small delay to ensure DOM is ready
      const ctx = gsap.context(() => {
        gsap.to(`.quad-row-${activeQuadIndex}`, {
          outline: "4px solid #f43f5e",
          outlineOffset: "4px",
          duration: 0.2,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            gsap.set(`.quad-row-${activeQuadIndex}`, { outline: "none" });
          }
        });
      });
      return () => ctx.revert();
    }
  }, [memStep, activeQuadIndex]);

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Run it yourself</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Watch variables change as the ICG instructions execute.</p>
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Button isIconOnly aria-label="Reset simulation" variant="ghost" onPress={reset} className="rounded-xl"><RotateCcw className="w-4 h-4" /></Button>
              <Button isIconOnly aria-label="Previous step" variant="ghost" onPress={prevStep} isDisabled={memStep === 0} className="rounded-xl"><ChevronLeft className="w-5 h-5" /></Button>
              <Button 
                isIconOnly 
                aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
                variant="primary" 
                onPress={() => setIsPlaying(!isPlaying)} 
                className="rounded-xl w-12 h-12 shadow-lg shadow-indigo-500/30"
              >
                {isPlaying ? <Pause /> : <Play className="ml-1" />}
              </Button>
              <Button isIconOnly aria-label="Next step" variant="ghost" onPress={nextStep} isDisabled={memStep === MEM_STATES.length - 1} className="rounded-xl"><ChevronRight className="w-5 h-5" /></Button>
            </div>
            <Slider 
              aria-label="Simulation Progress"
              maxValue={MEM_STATES.length - 1} 
              minValue={0} 
              value={[memStep]} 
              onChange={(v) => setMemStep(v[0])}
              className="px-2"
            >
              <Slider.Track className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full">
                <Slider.Fill className="bg-indigo-500 rounded-full" />
                <Slider.Thumb className="w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-md" />
              </Slider.Track>
            </Slider>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Instruction List */}
          <Card className="lg:col-span-5 h-[500px] border-none shadow-xl bg-slate-50 dark:bg-slate-900">
            <Card.Content className="p-6 overflow-hidden flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Instruction Sequence
              </h3>
              <div ref={quadListRef} className="flex-1 overflow-y-auto pr-10 space-y-2 custom-scrollbar">
                {QUADS.map((quad, i) => (
                  <div key={i} ref={el => { quadRefs.current[i] = el; }}>
                    <QuadRow 
                      quad={quad} 
                      isActive={i === activeQuadIndex} 
                      className={`quad-row-${i} ${i < activeQuadIndex ? 'opacity-30' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Memory Grid + Explanation */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
              <Card.Content className="p-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Virtual Memory
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(currentState.memory).map(([name, value]) => (
                    <MemoryCell 
                      key={name} 
                      name={name} 
                      value={value} 
                      isNew={currentState.newlyWritten === name}
                    />
                  ))}
                </div>
              </Card.Content>
            </Card>

            <Card className="flex-1 border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <Card.Content className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <Chip variant="soft" color="warning" className="font-bold">
                       <Chip.Label>Step {memStep + 1}</Chip.Label>
                    </Chip>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Step Explanation</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Playback Speed ({speed}x)</span>
                    <div className="w-32">
                      <Slider 
                        aria-label="Playback Speed"
                        maxValue={3} 
                        minValue={0.5} 
                        step={0.5}
                        value={[speed]}
                        onChange={(v) => setSpeed(v[0])}
                      >
                        <Slider.Track className="h-1 bg-white/20 rounded-full">
                          <Slider.Fill className="bg-amber-400 rounded-full" />
                          <Slider.Thumb className="w-3 h-3 bg-white border border-amber-400 rounded-full" />
                        </Slider.Track>
                      </Slider>
                    </div>
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-medium leading-relaxed italic">
                  "{currentState.explanation}"
                </p>
                
                {currentState.jumped && (
                  <div className="mt-6 flex items-center gap-3 bg-rose-500/30 p-3 rounded-xl border border-rose-400/30 animate-pulse">
                    <ChevronRight className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Jump detected! Moving to Program Counter {currentState.programCounter}</span>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
