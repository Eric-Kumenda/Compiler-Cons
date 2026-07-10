import React from 'react';
import { Card, Chip } from '@heroui/react';
import { BookOpen, Code2, Cpu, Settings, Zap, ArrowRight, Box, Layers, ListTree } from 'lucide-react';

export const Notes: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 pt-32 pb-24 font-sans text-slate-800 dark:text-slate-200">
      <div className="mx-auto max-w-4xl">
        <header className="mb-14 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-6">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
            Intermediate Code Generation
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The bridge between human-readable source code and machine-executable instructions.
          </p>
        </header>

        <div className="space-y-12">
          {/* Section: What is ICG? */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Code2 className="text-blue-500 w-7 h-7" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">What is ICG?</h2>
            </div>
            <Card className="p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 leading-relaxed text-lg rounded-3xl">
              <p className="mb-6">
                Intermediate Code Generation (ICG) is the phase in a compiler that translates an Abstract Syntax Tree (AST) into an intermediate representation (IR). Think of it as a <span className="font-semibold text-slate-900 dark:text-slate-100">"universal language"</span> that sits exactly halfway between the high-level source code (like Python or Elmo) and the low-level target machine code (like x86 or ARM).
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Chip color="default" variant="soft" size="lg" className="font-medium">Source Code</Chip>
                <ArrowRight className="text-slate-400 hidden sm:block" />
                <Chip color="accent" variant="soft" size="lg" className="font-bold">Intermediate Code</Chip>
                <ArrowRight className="text-slate-400 hidden sm:block" />
                <Chip color="success" variant="soft" size="lg" className="font-medium">Machine Code</Chip>
              </div>
            </Card>
          </section>

          {/* Section: Why it exists */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-amber-500 w-7 h-7" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Does ICG Exist?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold">The M × N Problem</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  If there are <strong className="text-slate-800 dark:text-slate-200">M</strong> programming languages and <strong className="text-slate-800 dark:text-slate-200">N</strong> machine architectures, writing direct compilers requires <strong className="text-amber-600 dark:text-amber-400">M × N</strong> different compilers. With an intermediate representation, we only need <strong className="text-green-600 dark:text-green-400">M + N</strong> compilers: M frontends to IR, and N backends from IR.
                </p>
              </Card>

              <Card className="p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold">Universal Optimization</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  By standardizing the code format, optimization algorithms (like dead code elimination or constant folding) only need to be written <em>once</em>. These optimizations apply to all source languages because they run entirely on the shared IR.
                </p>
              </Card>
            </div>
          </section>

          {/* Section: Quadruples & TAC */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Box className="text-indigo-500 w-7 h-7" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Three-Address Code & Quadruples</h2>
            </div>
            <Card className="p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl">
              <p className="text-lg leading-relaxed mb-6">
                <strong>Three-Address Code (TAC)</strong> simplifies expressions so that each instruction has at most three operands. Because it is not as expressive as high-level languages, complex statements must be broken down. This perfectly mirrors the way CPUs actually process data (e.g., <code>add reg1, reg2, reg3</code>).
              </p>
              
              <h3 className="text-xl font-bold mb-4">Operands in ICG</h3>
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                In TAC, operands can only be one of four things:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 ml-4 text-slate-700 dark:text-slate-300">
                <li><strong>Program Variables:</strong> E.g., <code>x</code>, <code>y</code>.</li>
                <li><strong>Memory Locations:</strong> Values at an address, e.g., <code>[v]</code>.</li>
                <li><strong>Constants/Literals:</strong> Hardcoded numbers, e.g., <code>42</code>.</li>
                <li><strong className="text-indigo-600 dark:text-indigo-400">Temporary Variables:</strong> New storage locations (e.g., <code>t1</code>, <code>t2</code>) invented by the compiler to hold intermediate values.</li>
              </ul>

              <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl mb-6 font-mono text-sm leading-8 border border-slate-200 dark:border-slate-700/50">
                <div className="text-slate-500 mb-2">// Source expression</div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-4">result = a + b * c</div>
                
                <div className="text-slate-500 mb-2">// Converted to Three-Address Code</div>
                <div className="text-slate-800 dark:text-slate-200">
                  <span className="text-indigo-500">t1</span> = b * c<br/>
                  <span className="text-indigo-500">t2</span> = a + <span className="text-indigo-500">t1</span><br/>
                  result = <span className="text-indigo-500">t2</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-4 mt-8">The Quadruple Format</h3>
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                A <strong>Quadruple</strong> is a data structure used to implement TAC. It consists of exactly four fields. Breaking code into quads makes it effortlessly easy for the compiler to process. For example, <code>t1 = b * c</code> becomes <code>(MUL, t1, b, c)</code>.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/50">
                  <div className="font-bold text-rose-700 dark:text-rose-400 mb-1">Operator</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">The action to perform (e.g., ADD, MUL).</div>
                </div>
                <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-sky-900/50">
                  <div className="font-bold text-sky-700 dark:text-sky-400 mb-1">Argument 1</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">The first operand.</div>
                </div>
                <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-sky-900/50">
                  <div className="font-bold text-sky-700 dark:text-sky-400 mb-1">Argument 2</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">The second operand (optional).</div>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl border border-violet-100 dark:border-violet-900/50">
                  <div className="font-bold text-violet-700 dark:text-violet-400 mb-1">Result</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Where the output is stored (usually a temporary).</div>
                </div>
              </div>
            </Card>
          </section>

          {/* Section: From AST to ICG */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <ListTree className="text-teal-500 w-7 h-7" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">From Parse Tree to Linear Code</h2>
            </div>
            <Card className="p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl">
              <p className="mb-4 text-lg leading-relaxed">
                If you understand parsers, you know they output a hierarchical structure called an Abstract Syntax Tree (AST) or Parse Tree. But CPUs don't execute trees; they execute linear sequences of instructions. How do we flatten the tree?
              </p>
              <p className="mb-6 text-lg leading-relaxed">
                Compilers use a technique called <strong>Syntax-Directed Translation</strong>. They perform a <strong>post-order traversal</strong> of the tree, meaning they recursively visit the children (operands) before acting on the parent (operator).
              </p>
              <div className="bg-teal-50 dark:bg-teal-900/10 p-6 rounded-2xl border border-teal-100 dark:border-teal-900/30 text-slate-700 dark:text-slate-300">
                <ul className="list-disc list-inside space-y-3 ml-4">
                  <li><strong>Bottom-up evaluation:</strong> To calculate <code>a + (b * c)</code>, the compiler goes deep into the tree and evaluates the <code>*</code> node first.</li>
                  <li><strong>Temporaries:</strong> It generates a quad for <code>b * c</code> and saves the result in a freshly invented temporary variable (e.g., <code>t1</code>).</li>
                  <li><strong>Passing up:</strong> It then moves up to the <code>+</code> node, generating a quad that adds <code>a</code> and the new temporary <code>t1</code>.</li>
                </ul>
              </div>
            </Card>
          </section>

          {/* Section: Control Flow */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <ArrowRight className="text-orange-500 w-7 h-7" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Flattening Control Flow (Ifs & Loops)</h2>
            </div>
            <Card className="p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl">
              <p className="mb-6 text-lg leading-relaxed">
                In a syntax tree, an <code>if</code> statement or a <code>while</code> loop is a parent node with a "condition" child and a "body" child block. In ICG, there are no nested blocks. Furthermore, <strong>there is no "else" statement in Three-Address Code!</strong> Everything is flattened into a single list using uniquely generated <strong>Labels</strong> and <strong>Conditional Jumps (Gotos)</strong>.
              </p>
              
              <h3 className="text-xl font-bold mb-4 mt-8">Standard Translation of a While Loop</h3>
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                To translate <code>while E do S2</code>, the compiler generates a starting label, evaluates the test expression <code>E</code> into a temporary, jumps to the end if false, executes the body <code>S2</code>, and unconditionally jumps back to the start.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl font-mono text-sm leading-8 border border-slate-200 dark:border-slate-700/50 overflow-x-auto">
                  <div className="text-slate-500 mb-2">// Source code tree</div>
                  <div className="text-indigo-600 dark:text-indigo-400">
                    while (x &lt; 10) {'{'}<br/>
                    &nbsp;&nbsp;x = x + 1;<br/>
                    {'}'}
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl font-mono text-sm leading-8 border border-slate-200 dark:border-slate-700/50 overflow-x-auto">
                  <div className="text-slate-500 mb-2">// Quadruples with jumps</div>
                  <div className="text-slate-800 dark:text-slate-200">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">LABEL L1</span><br/>
                    t1 = x &lt; 10<br/>
                    t2 = !t1 &nbsp;&nbsp;<span className="text-slate-500 text-xs">// Or directly check false</span><br/>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">IF t2 GOTO L2</span><br/>
                    t3 = x + 1<br/>
                    x = t3<br/>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">GOTO L1</span><br/>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">LABEL L2</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Section: Mapping to Final Code */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="text-purple-500 w-7 h-7" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Mapping to Machine Code</h2>
            </div>
            
            <Card className="p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl">
              <p className="mb-8 text-lg leading-relaxed">
                Once the intermediate code is fully generated and optimized, the compiler's <strong>Back End</strong> takes over to translate the generic quadruples into actual executable machine code for a specific target architecture (like x86, ARM, or MIPS).
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-4 font-bold">1</div>
                  <h3 className="text-lg font-bold mb-2">Register Allocation</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    CPUs have a limited number of incredibly fast slots called registers. The code generator analyzes the variables and temporaries (like <code>t1</code>) in the quadruples, mapping the most actively used ones to physical CPU registers to boost execution speed.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 mb-4 font-bold">2</div>
                  <h3 className="text-lg font-bold mb-2">Instruction Selection</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Each architecture has a unique syntax. An intermediate <code>ADD</code> quadruple might translate into <code>add eax, ebx</code> on x86, or <code>ADD R1, R2, R3</code> on ARM. The backend maps the generic quadruples into these platform-specific machine instructions.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 mb-4 font-bold">3</div>
                  <h3 className="text-lg font-bold mb-2">Memory Management</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Variables that don't fit into registers, or need to outlive a specific function, are allocated memory addresses on the Stack or Heap. The Code Generator calculates the necessary byte offsets and inserts loads/stores to move data back and forth.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
};
