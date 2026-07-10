import React, { useEffect, useRef } from 'react';
import { Card } from '@heroui/react';
import { gsap } from 'gsap';

interface MemoryCellProps {
  name: string;
  value: string | number | null;
  isNew?: boolean;
}

export const MemoryCell: React.FC<MemoryCellProps> = ({ name, value, isNew = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isNew && cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { scale: 0.9, backgroundColor: "rgb(99 102 241 / 0.2)" }, 
        { scale: 1, backgroundColor: "transparent", duration: 0.6, ease: "power2.out" }
      );
      
      if (valueRef.current) {
        gsap.fromTo(valueRef.current,
          { y: 5, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4 }
        );
      }
    }
  }, [value, isNew]);

  const displayValue = value === 'declared' ? '???' : (value ?? '---');

  return (
    <Card 
      ref={cardRef}
      className={`border transition-all duration-500 ${
        isNew 
          ? 'border-indigo-500 shadow-indigo-500/20' 
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <Card.Content className="p-3 flex flex-row justify-between items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider opacity-50 font-bold">{name.startsWith('t') ? 'Temp' : 'Var'}</span>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{name}</span>
        </div>
        <div className="!bg-slate-100 dark:!bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 min-w-[3rem] text-center">
          <span ref={valueRef} className="font-mono font-bold !text-slate-900 dark:!text-slate-100">
            {displayValue}
          </span>
        </div>
      </Card.Content>
    </Card>
  );
};
