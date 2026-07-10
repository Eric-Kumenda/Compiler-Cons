import React, { useMemo } from 'react';
import { ReactFlow, Controls, Background, BackgroundVariant, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import type { CompileResponse } from '../types/compiler';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 100;
const nodeHeight = 40;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { initialNodes: newNodes, initialEdges: edges };
};

interface AstVisualizerProps {
  parseTree?: CompileResponse['parseTree'];
}

export const AstVisualizer: React.FC<AstVisualizerProps> = ({ parseTree }) => {
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!parseTree || !parseTree.nodes.length) {
      return { initialNodes: [], initialEdges: [] };
    }

    const flowNodes: Node[] = parseTree.nodes.map((n) => ({
      id: String(n.id),
      data: { label: n.label },
      position: { x: 0, y: 0 },
      type: 'default',
      style: {
        background: 'var(--color-slate-100)',
        color: 'var(--color-slate-900)',
        border: '1px solid var(--color-slate-300)',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'monospace',
      },
    }));

    const flowEdges: Edge[] = parseTree.edges.map((e, idx) => ({
      id: `e${e.from}-${e.to}-${idx}`,
      source: String(e.from),
      target: String(e.to),
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: '#94a3b8',
      },
      style: {
        strokeWidth: 2,
        stroke: '#94a3b8',
      },
    }));

    return getLayoutedElements(flowNodes, flowEdges);
  }, [parseTree]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);

  // Update layout when tree changes
  React.useEffect(() => {
    setNodes(initialNodes as Node[]);
    setEdges(initialEdges as Edge[]);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (!parseTree || !parseTree.nodes.length) {
    return <p className="text-slate-500 text-sm italic">No parse tree generated.</p>;
  }

  return (
    <div className="w-full h-[400px] overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
        className="dark:bg-slate-950"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} className="dark:bg-slate-950" />
      </ReactFlow>
    </div>
  );
};