import React from 'react';
import { Button, Card, Chip } from '@heroui/react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import { compileSource } from '../api/compile';
import type { CompileResponse, Token, Quad } from '../types/compiler';
import { QuadRow } from '../ui/QuadRow';
import { AstVisualizer } from '../ui/AstVisualizer';

// Define the custom Elmo syntax for Prism
Prism.languages.elmo = {
  'keyword': /\b(int|if|else|while|return)\b/,
  'number': /\b\d+\b/,
  'operator': /[+\-*/=<>!]+/,
  'punctuation': /[();{}]/,
  'identifier': /\b[a-zA-Z_]\w*\b/
};

const SAMPLE = 'int x;\nx = 10;\n';

const ELMO_GRAMMAR = `<program>       ::= <stmt_list>
<stmt_list>     ::= <statement> | <stmt_list> <statement>
<statement>     ::= <decl_stmt> | <assign_stmt> | <if_stmt> | <while_stmt> | <return_stmt>
<decl_stmt>     ::= 'int' IDENTIFIER ';' | 'int' IDENTIFIER '=' <expr> ';'
<assign_stmt>   ::= IDENTIFIER '=' <expr> ';'
<if_stmt>       ::= 'if' '(' <cond_expr> ')' '{' <stmt_list> '}'
                  | 'if' '(' <cond_expr> ')' '{' <stmt_list> '}' 'else' '{' <stmt_list> '}'
<while_stmt>    ::= 'while' '(' <cond_expr> ')' '{' <stmt_list> '}'
<return_stmt>   ::= 'return' <expr> ';'
<expr>          ::= <arith_expr> | STRING_LITERAL
<arith_expr>    ::= <arith_expr> '+' <term> | <arith_expr> '-' <term> | <term>
<term>          ::= <term> '*' <factor> | <term> '/' <factor> | <factor>
<factor>        ::= '(' <arith_expr> ')' | IDENTIFIER | NUMBER
<cond_expr>     ::= <arith_expr> <relop> <arith_expr> | <cond_expr> '&&' <cond_expr>
                  | <cond_expr> '||' <cond_expr> | '!' <cond_expr>
<relop>         ::= '==' | '!=' | '<' | '>' | '<=' | '>='`;

export const Playground: React.FC = () => {
  const [source, setSource] = React.useState(SAMPLE);
  const [data, setData] = React.useState<CompileResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await compileSource(source);
      setData(resp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const renderTokens = (tokens?: Token[]) => {
    if (!tokens || tokens.length === 0) return <p className="text-slate-500 text-sm italic">No tokens generated.</p>;
    return (
      <div className="flex flex-wrap gap-2">
        {tokens.map((t, i) => (
          <div key={i} className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 min-w-[60px] shadow-sm">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">{t.type}</span>
            <span className="text-sm font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-black/50 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/60">
              {t.lexeme || 'EOF'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderQuads = (quads?: Quad[]) => {
    if (!quads || quads.length === 0) return <p className="text-slate-500 text-sm italic">No quadruples generated.</p>;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-8">#</div>
          <div className="flex-1 grid grid-cols-4 text-center gap-2">
            <div>OP</div>
            <div>ARG1</div>
            <div>ARG2</div>
            <div>RESULT</div>
          </div>
        </div>
        {quads.map((q, i) => (
          <QuadRow key={i} quad={{...q, category: 'arith'} as any} isActive={false} />
        ))}
      </div>
    );
  };

  const renderErrors = (errors?: CompileResponse['errors']) => {
    if (!errors || errors.length === 0) {
      return (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
          <span className="text-lg">✓</span>
          <span className="font-medium text-sm">Compilation successful. No errors detected.</span>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-3">
        {errors.map((err, i) => (
          <div key={i} className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/50">
            <span className="text-rose-500 text-lg mt-0.5">✕</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Chip size="sm" color="danger" variant="soft" className="uppercase text-[10px] font-bold tracking-wider">
                  {err.stage} Error
                </Chip>
                {(err.line || err.col) && (
                  <span className="text-xs text-rose-500 dark:text-rose-400 font-mono">
                    {err.line && `Line ${err.line}`} {err.col && `Col ${err.col}`}
                  </span>
                )}
              </div>
              <p className="text-sm text-rose-800 dark:text-rose-200 font-medium">
                {err.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen px-6 pt-32 pb-24 bg-slate-50 dark:bg-slate-950 transition-colors">
      <style>{`
        .token.keyword { color: #8b5cf6; font-weight: bold; }
        .token.number { color: #10b981; }
        .token.operator { color: #f43f5e; }
        .token.punctuation { color: #94a3b8; }
        .token.identifier { color: #3b82f6; }
        .dark .token.keyword { color: #a78bfa; }
        .dark .token.number { color: #34d399; }
        .dark .token.operator { color: #fb7185; }
        .dark .token.punctuation { color: #64748b; }
        .dark .token.identifier { color: #60a5fa; }
        .editor-container textarea { outline: none !important; }
      `}</style>
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">
            Compiler Playground
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Write Elmo source code on the left and instantly explore the compilation pipeline stages on the right.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col sticky top-28 self-start">
            <Card className="p-1 shadow-md border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-3 font-mono text-xs font-bold text-slate-500 tracking-wider">source.elmo</span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden editor-container">
                <Editor
                  value={source}
                  onValueChange={code => setSource(code)}
                  highlight={code => Prism.highlight(code, Prism.languages.elmo, 'elmo')}
                  padding={10}
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    minHeight: '200px',
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Local Go Compiler Ready
                </span>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="font-bold shadow-lg shadow-indigo-500/30 px-8"
                  isPending={loading}
                  onPress={run}                >
                  Compile
                </Button>
              </div>
            </Card>
            {error && (
              <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900 font-medium text-sm">
                Network Error: {error}
              </div>
            )}

            <Card className="mt-6 p-1 shadow-md border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Elmo Grammar Reference</h3>
                <p className="text-xs text-slate-500 mt-1">The accepted syntax for the Elmo compiler</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre">
                {ELMO_GRAMMAR}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-rose-500">0.</span> Diagnostics
              </h3>
              {renderErrors(data?.errors)}
            </Card>

            <Card className="p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-indigo-500">1.</span> Scanner
                </h3>
                <Chip size="sm" variant="soft" color="default">Tokens</Chip>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
                {renderTokens(data?.tokens)}
              </div>
            </Card>

            <Card className="p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-teal-500">2.</span> Parser
                </h3>
                <Chip size="sm" variant="soft" color="success">AST</Chip>
              </div>
              <AstVisualizer parseTree={data?.parseTree} />
            </Card>

            <Card className="p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-fuchsia-500">3.</span> Intermediate Code
                </h3>
                <Chip size="sm" variant="soft" color="warning">Quadruples</Chip>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
                {renderQuads(data?.quads)}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};
;
