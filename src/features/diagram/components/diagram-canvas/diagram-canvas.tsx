'use client';

import '@xyflow/react/dist/style.css';

import { Background, BackgroundVariant, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { edgeTypes, nodeTypes } from '@/features/diagram/components/diagram-types';
import { isValidFlowConnection } from '@/features/diagram/lib/diagram-canvas-utils';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { UML_EDGE_TYPE } from '@/features/diagram/types';

const DiagramCanvasInner = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useDiagramStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect,
    })),
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidFlowConnection}
        defaultEdgeOptions={{ type: UML_EDGE_TYPE }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="bg-muted/20" />
      </ReactFlow>
    </div>
  );
};

export const DiagramCanvas = () => (
  <ReactFlowProvider>
    <DiagramCanvasInner />
  </ReactFlowProvider>
);
