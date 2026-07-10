export type CompilerError = {
  stage: 'scanner' | 'lexer' | 'parser' | 'icg';
  message: string;
  line?: number;
  col?: number;
};

export type Token = {
  type: string;
  lexeme: string;
  line: number;
  col?: number;
};

export type ParseTreeNode = {
  id: string;
  label: string;
};

export type ParseTreeEdge = {
  from: number;
  to: number;
};

export type Quad = {
  index: number;
  op: string;
  arg1: string;
  arg2: string;
  result: string;
};

export type CompileResponse = {
  tokens: Token[];
  lexer?: Token[];
  parseTree?: {
    nodes: ParseTreeNode[];
    edges: ParseTreeEdge[];
  };
  quads?: Quad[];
  errors: CompilerError[];
};
