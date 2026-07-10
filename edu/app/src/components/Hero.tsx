import React, { useRef } from 'react';
import { Button, Chip } from '@heroui/react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { useGSAP } from '@gsap/react';

import { CanvasText } from './ui/canvas-text';

gsap.registerPlugin(TextPlugin);

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const typeTargetRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    // Typing animation
    const words = ["source code", "tokens", "parse trees", "quadruples"];
    const tl = gsap.timeline({ repeat: -1 });

    words.forEach((word) => {
      tl.to(typeTargetRef.current, {
        duration: Math.max(0.6, word.length * 0.08),
        text: word,
        ease: "none",
      })
        .to({}, { duration: 1.4 })
        .to(typeTargetRef.current, {
          duration: Math.max(0.4, word.length * 0.05),
          text: "",
          ease: "none",
        })
        .to({}, { duration: 0.4 });
    });

    // Floating animation for decorative SVGs - smoother and more subtle
    gsap.to(".floating-svg", {
      y: -15,
      rotation: 8,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        each: 0.8,
        from: "random"
      }
    });

    // Initial entrance
    gsap.from(".hero-content", {
      y: 30,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.15
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
      {/* Decorative SVGs (GSAP-style) */}
      <img src="/geometric/Group 13.svg" alt="" className="absolute top-[20%] left-[10%] floating-svg w-32 opacity-20 dark:opacity-40" />
      <img src="/geometric/path30.svg" alt="" className="absolute bottom-[20%] left-[15%] floating-svg w-24 opacity-20 dark:opacity-40" />
      <img src="/geometric/path50.svg" alt="" className="absolute top-[15%] right-[15%] floating-svg w-32 opacity-20 dark:opacity-40" />
      <img src="/geometric/Group 8.svg" alt="" className="absolute bottom-[25%] right-[10%] floating-svg w-20 opacity-20 dark:opacity-40" />
      <img src="/geometric/path90.svg" alt="" className="absolute top-[45%] right-[5%] floating-svg w-28 opacity-10 dark:opacity-20" />

      <div className="container mx-auto px-6 text-center z-10">
        <div className="hero-content mb-6">
          <Chip 
            variant="soft" 
            color="accent" 
            className="font-bold border border-indigo-500/20 px-4 py-1"
          >
            <Chip.Label>Built for Elmo — a teaching compiler</Chip.Label>
          </Chip>
        </div>

        <h1 className="hero-content text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
          How Compilers <br />
          <CanvasText 
            text="Think."
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 pb-2"
            colors={['#6366f1', '#a855f7', '#f43f5e', '#818cf8', '#c084fc', '#fb7185']}
          />
        </h1>

        <p className="hero-content text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          An interactive guide to Intermediate Code Generation. <br className="hidden md:block" />
          Transforming <span className="inline-block min-w-[11ch] text-left"><span ref={typeTargetRef} className="border-r-2 border-current pr-[2px] font-mono text-indigo-500 font-bold whitespace-pre"></span></span> <br className="hidden md:block" />
          into reality.
        </p>

        <div className="hero-content flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            variant="primary"
            className="font-bold rounded-full h-14 px-10 text-lg group shadow-xl shadow-indigo-500/20"
            onPress={() => document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start learning
            <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="font-bold rounded-full h-14 px-10 text-lg border-2"
            onPress={() => document.getElementById('step-through')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Watch Demo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
        <ChevronDown className="w-6 h-6" />
      </div>
    </section>
  );
};
