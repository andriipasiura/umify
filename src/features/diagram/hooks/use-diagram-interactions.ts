'use client';

import { type Edge, type Node, useReactFlow } from '@xyflow/react';
import { type DragEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { createUmlNode } from '../lib/create-uml-node';
import { useDiagramStore } from '../store/diagram-store';
import {
  isNodeTool,
  TOOL_ERASER,
  TOOL_PAN,
  TOOL_SELECT,
  useEditorStore,
} from '../store/editor-store';
import {
  UML_DND_MIME,
  UML_NODE_KINDS,
  type UmlEdge,
  type UmlNode,
  type UmlNodeKind,
} from '../types';

type InteractionProps = {
  onPaneClick: (e: ReactMouseEvent) => void;
  onNodeClick: (e: ReactMouseEvent, node: Node) => void;
  onEdgeClick: (e: ReactMouseEvent, edge: Edge) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  panOnDrag: boolean;
  nodesDraggable: boolean;
  selectionOnDrag: boolean;
};

export const useDiagramInteractions = (): InteractionProps => {
  const { screenToFlowPosition } = useReactFlow();
  const tool = useEditorStore((s) => s.tool);
  const setTool = useEditorStore((s) => s.setTool);
  const { addNode, deleteNode, deleteEdge } = useDiagramStore(
    useShallow((s) => ({
      addNode: s.addNode,
      deleteNode: s.deleteNode,
      deleteEdge: s.deleteEdge,
    })),
  );

  const onPaneClick = (e: ReactMouseEvent) => {
    if (!isNodeTool(tool)) return;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(createUmlNode(tool as UmlNodeKind, pos));
    setTool(TOOL_SELECT);
  };

  const onNodeClick = (_e: ReactMouseEvent, node: Node) => {
    if (tool !== TOOL_ERASER) return;
    deleteNode((node as UmlNode).id);
  };

  const onEdgeClick = (_e: ReactMouseEvent, edge: Edge) => {
    if (tool !== TOOL_ERASER) return;
    deleteEdge((edge as UmlEdge).id);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData(UML_DND_MIME) as UmlNodeKind;
    if (!kind || !(UML_NODE_KINDS as readonly string[]).includes(kind)) return;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(createUmlNode(kind, pos));
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const panOnDrag = tool === TOOL_PAN;
  const nodesDraggable = tool === TOOL_SELECT || tool === TOOL_PAN;
  const selectionOnDrag = tool === TOOL_SELECT;

  return {
    onPaneClick,
    onNodeClick,
    onEdgeClick,
    onDrop,
    onDragOver,
    panOnDrag,
    nodesDraggable,
    selectionOnDrag,
  };
};
