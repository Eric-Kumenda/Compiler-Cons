import React from 'react';
import { Chip } from '@heroui/react';
import { Terminal, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black">Elmo <span className="text-indigo-500">ICG</span></span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed mb-6">
              An interactive educational project for the Compiler Construction course, 2026. 
              Designed to make abstract concepts honest and approachable.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full hover:bg-indigo-500 hover:text-white transition-all">
                <Terminal className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-4 uppercase tracking-widest text-[10px] text-slate-400">The Team</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>Leo (Scanner & Parser)</li>
                <li>Sandra (ICG Logic)</li>
                <li>Morris (Symbol Table)</li>
                <li>Eric (Visual Design)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase tracking-widest text-[10px] text-slate-400">Powered By</h4>
              <div className="flex flex-col gap-3 items-start">
                 <Chip size="sm" variant="soft" color="accent">
                   <Chip.Label>React 18</Chip.Label>
                 </Chip>
                 <Chip size="sm" variant="soft" color="default">
                   <Chip.Label>GSAP 3</Chip.Label>
                 </Chip>
                 <Chip size="sm" variant="soft" color="success">
                   <Chip.Label>Tailwind v4</Chip.Label>
                 </Chip>
              </div>
            </div>
          </div>
        </div>
        
        <div className="my-12 border-t border-slate-200 dark:border-slate-800 opacity-50" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          <p>© 2026 Group 3 — Compiler Construction</p>
          <div className="flex items-center gap-2">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-current" /> by Leo
          </div>
        </div>
      </div>
    </footer>
  );
};
