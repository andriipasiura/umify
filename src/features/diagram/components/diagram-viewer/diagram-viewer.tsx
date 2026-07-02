'use client';

import '@xyflow/react/dist/style.css';

import { Background, BackgroundVariant, ConnectionMode, MiniMap, ReactFlow } from '@xyflow/react';

import { edgeTypes, nodeTypes } from '@/features/diagram/components/diagram-types';
import { UmlMarkers } from '@/features/diagram/components/uml-markers';
import { layerBoundariesFirst } from '@/features/diagram/lib/diagram-canvas-utils';
import { miniMapNodeColor } from '@/features/diagram/lib/minimap-node-color';
import { type UmlEdge, type UmlNode } from '@/features/diagram/types';

type DiagramViewerProps = {
  nodes: UmlNode[];
  edges: UmlEdge[];
};

export const DiagramViewer = ({ nodes, edges }: DiagramViewerProps) => (
  <div className="h-full w-full [&_.react-flow__handle]:!pointer-events-none [&_.react-flow__node]:!pointer-events-none">
    <UmlMarkers />
    <ReactFlow
      nodes={layerBoundariesFirst(nodes)}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      deleteKeyCode={null}
      connectionMode={ConnectionMode.Loose}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="bg-muted/20" />
      <MiniMap
        pannable
        zoomable
        nodeColor={(node) => miniMapNodeColor(node as UmlNode)}
        className="!bg-background rounded-md border"
        maskColor="var(--muted)"
      />
    </ReactFlow>
  </div>
);
