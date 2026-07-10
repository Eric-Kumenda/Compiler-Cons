import React, { useState } from 'react';
import { Card } from '@heroui/react';
import { ShieldCheck, Zap, Scissors, Globe, ChevronDown } from 'lucide-react';

const reasons = [
  {
    key: "portable",
    title: "Portability across CPUs",
    icon: Globe,
    content: "Machine code is specific to a chip (like Intel or ARM). By generating an 'Intermediate' version first, we can write one ICG phase and then create many different backends for every computer on earth. It's the universal language of the compiler."
  },
  {
    key: "optimise",
    title: "Easier to optimize",
    icon: Zap,
    content: "Flat, linear instructions (like our quads) are much easier for a computer to analyze than a complex, nested tree. We can easily spot redundant calculations, delete code that never runs, and move math out of loops to make the final program faster."
  },
  {
    key: "separation",
    title: "Clean separation of concerns",
    icon: Scissors,
    content: "The frontend (Scanner/Parser) handles human language rules. The backend handles machine physics. ICG is the clean boundary between them. This modularity means we can fix a bug in the parser without ever touching the code that generates assembly."
  },
  {
    key: "debug",
    title: "Simplified debugging",
    icon: ShieldCheck,
    content: "Quadruples are trivially easy to 'execute' in a simulation (like the one above). This allows developers to verify that their logic is correct in a safe, high-level environment before dealing with the complexity of real hardware registers and stack pointers."
  }
];

const grammarRules = [
  { rule: 'stmt → assign_stmt', output: 'COPY t1 _ result' },
  { rule: 'expr → term expr_tail', output: 'ADD t1 t2 t3' },
  { rule: 'term → factor term_tail', output: 'MUL t1 t2 t3' },
  { rule: 'selection_stmt → if (expr) { ... }', output: 'GT x y t1 + IFF t1 _ L1' },
  { rule: 'iteration_stmt → while (expr) { ... }', output: 'LABEL L1 + IFF t1 _ L2 + GOTO _ _ L1' },
  { rule: 'jump_stmt → return expr', output: 'RET result' },
  { rule: 'decl_stmt → int id', output: 'DECL id _ _' },
];

export const WhyICG: React.FC = () => {
  const [openKey, setOpenKey] = useState<string | null>("portable");

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Why not skip straight to machine code?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Intermediate code isn't just a detour — it's where the most important decisions are made.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-20 space-y-4">
          {reasons.map((reason) => (
            <div 
              key={reason.key} 
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => setOpenKey(openKey === reason.key ? null : reason.key)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-500/10 p-2 rounded-xl">
                    <reason.icon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="font-bold text-lg">{reason.title}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openKey === reason.key ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-300 ease-in-out ${openKey === reason.key ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-6 pb-6 pt-0 text-slate-500 dark:text-slate-400 leading-relaxed">
                  {reason.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Card className="max-w-4xl mx-auto border-none shadow-2xl bg-white dark:bg-slate-900">
          <Card.Content className="p-8">
            <h3 className="text-xl font-black mb-6">Grammar to Instruction Mapping</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Grammar Rule (BNF)</th>
                    <th className="pb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Emitted Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {grammarRules.map((row, i) => (
                    <tr key={i} className="group">
                      <td className="py-4 font-mono text-sm group-hover:text-indigo-500 transition-colors">{row.rule}</td>
                      <td className="py-4 font-mono text-sm text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                        {row.output}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      </div>
    </section>
  );
};
