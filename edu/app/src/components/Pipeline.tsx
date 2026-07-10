import React, { useRef } from 'react';
import { Card } from '@heroui/react';
import { Search, FileCode, Cpu, Terminal } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const stages = [
  {
    name: 'Scanner',
    icon: Search,
    desc: 'Turns source text into tokens.',
    color: 'bg-blue-500',
  },
  {
    name: 'Parser',
    icon: FileCode,
    desc: 'Builds a tree of meaning.',
    color: 'bg-emerald-500',
  },
  {
    name: 'ICG',
    icon: Terminal,
    desc: 'Flattens the tree into quads.',
    color: 'bg-indigo-600',
    highlight: true,
  },
  {
    name: 'Code Gen',
    icon: Cpu,
    desc: 'Emits target assembly code.',
    color: 'bg-rose-500',
  },
];

export const Pipeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    // Line drawing animation
    gsap.fromTo(lineRef.current, 
      { strokeDasharray: "1000", strokeDashoffset: "1000" },
      { 
        strokeDashoffset: "0", 
        duration: 2, 
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          end: "bottom bottom",
          scrub: 1,
        }
      }
    );

    // Staggered card entrance
    gsap.from(".pipeline-card", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Where does ICG fit?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Intermediate Code Generation is the bridge between the human-friendly world of parsing 
            and the machine-friendly world of assembly.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (SVG) */}
          <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 hidden md:block">
            <svg width="100%" height="20" className="overflow-visible">
              <path 
                ref={lineRef}
                d="M 50 10 L 1200 10" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="8 8"
                className="text-slate-200 dark:text-slate-800"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {stages.map((stage, i) => (
              <div key={i} className="pipeline-card flex flex-col items-center">
                <Card 
                  className={`w-full max-w-[280px] h-full border-2 transition-all duration-500 hover:-translate-y-2 ${
                    stage.highlight 
                      ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 bg-indigo-50/50 dark:bg-indigo-900/10' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <Card.Content className="p-8 text-center flex flex-col items-center">
                    <div className={`${stage.color} p-4 rounded-2xl shadow-lg mb-6`}>
                      <stage.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black mb-3">{stage.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {stage.desc}
                    </p>
                    {stage.highlight && (
                      <div className="mt-4 px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                        You are here
                      </div>
                    )}
                  </Card.Content>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-20 opacity-60 italic text-slate-500">
          "The parse tree goes in. A flat list of simple instructions comes out."
        </div>
      </div>
    </section>
  );
};
