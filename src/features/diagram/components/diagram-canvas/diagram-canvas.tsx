'use client';

import '@xyflow/react/dist/style.css';

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { edgeTypes, nodeTypes } from '@/features/diagram/components/diagram-types';
import { useDiagramInteractions } from '@/features/diagram/hooks/use-diagram-interactions';
import { isValidFlowConnection } from '@/features/diagram/lib/diagram-canvas-utils';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { useEditorStore } from '@/features/diagram/store/editor-store';
import { UML_EDGE_TYPE } from '@/features/diagram/types';

import { DiagramToolbar } from '../diagram-toolbar';
import { UmlMarkers } from '../uml-markers';

const DiagramCanvasInner = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    undo,
    redo,
    activeRelation,
    setActiveRelation,
    past,
    future,
  } = useDiagramStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect,
      undo: s.undo,
      redo: s.redo,
      activeRelation: s.activeRelation,
      setActiveRelation: s.setActiveRelation,
      past: s.past,
      future: s.future,
    })),
  );

  const { tool, setTool } = useEditorStore(
    useShallow((s) => ({ tool: s.tool, setTool: s.setTool })),
  );

  const {
    onPaneClick,
    onNodeClick,
    onEdgeClick,
    onDrop,
    onDragOver,
    panOnDrag,
    nodesDraggable,
    selectionOnDrag,
  } = useDiagramInteractions();

  const layeredNodes = [...nodes].sort((a, b) =>
    a.data.kind === 'boundary' ? -1 : b.data.kind === 'boundary' ? 1 : 0,
  );

  return (
    <div className="h-full w-full">
      <UmlMarkers />
      <ReactFlow
        nodes={layeredNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        panOnDrag={panOnDrag}
        nodesDraggable={nodesDraggable}
        selectionOnDrag={selectionOnDrag}
        deleteKeyCode={['Delete', 'Backspace']}
        connectionMode={ConnectionMode.Loose}
        isValidConnection={isValidFlowConnection}
        defaultEdgeOptions={{ type: UML_EDGE_TYPE }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="bg-muted/20" />
        <Panel position="center-left">
          <DiagramToolbar
            tool={tool}
            onSelectTool={setTool}
            activeRelation={activeRelation}
            onSelectRelation={setActiveRelation}
            onUndo={undo}
            onRedo={redo}
            canUndo={past.length > 0}
            canRedo={future.length > 0}
          />
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const DiagramCanvas = () => (
  <ReactFlowProvider>
    <DiagramCanvasInner />
  </ReactFlowProvider>
);
