import React from 'react';

interface CodeBlockProps {
  code: string;
  highlightedLines?: number[];
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, highlightedLines = [], className = "" }) => {
  const keywords = ['int', 'if', 'else', 'while', 'return'];
  
  const renderLine = (line: string, index: number) => {
    const isHighlighted = highlightedLines.includes(index + 1);
    
    // Split by tokens but keep the delimiters
    const parts = line.split(/(\b\w+\b|[^\w\s]|\s+)/g);
    
    return (
      <div 
        key={index} 
        className={`px-4 py-0.5 font-mono text-sm leading-relaxed transition-colors duration-300 ${
          isHighlighted ? 'bg-amber-500/20 border-l-4 border-amber-500' : 'border-l-4 border-transparent'
        }`}
      >
        <span className="inline-block w-6 opacity-30 select-none text-xs">{index + 1}</span>
        {parts.map((part, i) => {
          if (keywords.includes(part)) {
            return <span key={i} className="text-indigo-500 dark:text-indigo-400 font-bold">{part}</span>;
          }
          if (/^\d+$/.test(part)) {
            return <span key={i} className="text-emerald-500 dark:text-emerald-400">{part}</span>;
          }
          if (/[{}();,]/.test(part)) {
            return <span key={i} className="text-slate-400 dark:text-slate-500">{part}</span>;
          }
          if (/[><=+\-*/]/.test(part)) {
            return <span key={i} className="text-rose-500 dark:text-rose-400">{part}</span>;
          }
          if (/^[a-zA-Z_]\w*$/.test(part)) {
            return <span key={i} className="text-slate-700 dark:text-slate-200">{part}</span>;
          }
          return <span key={i} className="text-slate-900 dark:text-slate-100">{part}</span>;
        })}
      </div>
    );
  };

  return (
    <pre className={`rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 ${className}`}>
      <code>
        {code.split('\n').map(renderLine)}
      </code>
    </pre>
  );
};
