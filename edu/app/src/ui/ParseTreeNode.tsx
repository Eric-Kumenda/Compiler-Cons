import React from 'react';

interface ParseTreeNodeProps {
  x: number;
  y: number;
  label: string;
  isActive?: boolean;
  isVisited?: boolean;
}

export const ParseTreeNode: React.FC<ParseTreeNodeProps> = ({ x, y, label, isActive = false, isVisited = false }) => {
  return (
    <g className="transition-all duration-500">
      {/* Node Circle/Rect */}
      <rect
        x={x - 50}
        y={y - 15}
        width={100}
        height={30}
        rx={8}
        className={`transition-all duration-500 ${
          isActive 
            ? 'fill-indigo-500 stroke-indigo-400 stroke-2 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' 
            : isVisited
              ? 'fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700'
              : 'fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800'
        }`}
      />
      
      {/* Node Label */}
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        className={`text-[10px] font-mono font-bold select-none transition-colors duration-500 ${
          isActive ? 'fill-white' : 'fill-slate-600 dark:fill-slate-400'
        }`}
      >
        {label}
      </text>
    </g>
  );
};
