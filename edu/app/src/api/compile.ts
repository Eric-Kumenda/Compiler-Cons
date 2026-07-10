import type { CompileResponse } from '../types/compiler';

export const compileSource = async (source: string): Promise<CompileResponse> => {
  const res = await fetch('/api/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  });

  if (!res.ok) {
    throw new Error(`Compile failed: ${res.status}`);
  }

  return res.json() as Promise<CompileResponse>;
};
