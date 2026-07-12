'use client';

import '@xyflow/react/dist/style.css';

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { DiagramToolbar } from '@/features/diagram/components/diagram-toolbar';
import { edgeTypes, nodeTypes } from '@/features/diagram/components/diagram-types';
import { UmlMarkers } from '@/features/diagram/components/uml-markers';
import { useDiagramInteractions } from '@/features/diagram/hooks/use-diagram-interactions';
import {
  isValidFlowConnection,
  layerBoundariesFirst,
} from '@/features/diagram/lib/diagram-canvas-utils';
import { miniMapNodeColor } from '@/features/diagram/lib/minimap-node-color';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { useEditorStore } from '@/features/diagram/store/editor-store';
import { UML_EDGE_TYPE, type UmlNode } from '@/features/diagram/types';

type DiagramCanvasProps = {
  topLeftPanel?: React.ReactNode;
  topCenterPanel?: React.ReactNode;
  topRightPanel?: React.ReactNode;
  bottomLeftPanel?: React.ReactNode;
};

const DiagramCanvasInner = ({
  topLeftPanel,
  topCenterPanel,
  topRightPanel,
  bottomLeftPanel,
}: DiagramCanvasProps) => {
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

  const layeredNodes = layerBoundariesFirst(nodes);

  return (
    <div className="h-full w-full" data-diagram-capture-root>
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
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="bg-muted/20" />
        <Panel position="center-left" className="max-md:hidden">
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
        <Panel
          position="bottom-left"
          className="!inset-x-[15px] !bottom-[15px] !mx-auto !my-0 !w-fit md:hidden"
        >
          <DiagramToolbar
            orientation="horizontal"
            className="nopan max-w-[calc(100vw-30px)] touch-pan-x [scrollbar-width:none] overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]"
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
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => miniMapNodeColor(node as UmlNode)}
          className="!bg-background rounded-md border max-md:hidden"
          maskColor="var(--muted)"
        />
        {topLeftPanel && <Panel position="top-left">{topLeftPanel}</Panel>}
        {topCenterPanel && <Panel position="top-center">{topCenterPanel}</Panel>}
        {topRightPanel && <Panel position="top-right">{topRightPanel}</Panel>}
        {bottomLeftPanel && (
          <Panel position="bottom-left" className="max-md:hidden">
            {bottomLeftPanel}
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export const DiagramCanvas = (props: DiagramCanvasProps) => (
  <ReactFlowProvider>
    <DiagramCanvasInner {...props} />
  </ReactFlowProvider>
);
