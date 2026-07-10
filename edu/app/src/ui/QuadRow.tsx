import React from 'react';
import type { Quad } from '../data/quads';
import { OpChip } from './OpChip';

interface QuadRowProps {
  quad: Partial<Quad>;
  isActive?: boolean;
  className?: string;
}

export const QuadRow: React.FC<QuadRowProps> = ({ quad, isActive = false, className = "" }) => {
  return (
    <div 
      className={`group flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-300 ${
        isActive 
          ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-lg scale-[1.02] z-10' 
          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/60'
      } ${className}`}
    >
      <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-4">{quad.index}</span>
      <div className="flex-1 grid grid-cols-4 gap-2 text-center">
        <div className="flex justify-center">
          <OpChip category={quad.category || 'arith'} size="sm" variant={isActive ? "primary" : "soft"}>
            {quad.op}
          </OpChip>
        </div>
        <span className="font-mono text-sm text-slate-800 dark:text-slate-200">{quad.arg1 === '_' ? '-' : quad.arg1}</span>
        <span className="font-mono text-sm text-slate-800 dark:text-slate-200">{quad.arg2 === '_' ? '-' : quad.arg2}</span>
        <span className="font-mono text-sm font-bold text-indigo-500 dark:text-indigo-400">
          {quad.result === '_' ? '-' : quad.result}
        </span>
      </div>
    </div>
  );
};
