import React, { createContext, useContext, ReactNode } from 'react';
import { useDiagramState, NodeConfig } from '../diagram/hooks/useDiagramState';
import { XYPosition, Node, Edge } from 'reactflow';

interface DiagramContextProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  addNode: (nodeConfig: NodeConfig, position?: XYPosition) => string;
  clearCanvas: () => void;
  saveDiagram: () => { nodes: Node[], edges: Edge[], nodeIdCounter: number };
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  updateNodePositions: (updates: { id: string; position: { x: number; y: number } }[]) => void;
  selectedNodes: Node[];
  deleteSelectedNodes: (nodes: Node[]) => void;
}

const DiagramContext = createContext<DiagramContextProps | undefined>(undefined);

interface DiagramProviderProps {
  children: ReactNode;
}

export function DiagramProvider({ children }: DiagramProviderProps) {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    addNode, 
    clearCanvas,
    saveDiagram,
    undo,
    redo,
    canUndo,
    canRedo,
    updateNodePositions,
    selectedNodes,
    deleteSelectedNodes
  } = useDiagramState();
  
  return (
    <DiagramContext.Provider value={{ 
      nodes, 
      edges, 
      onNodesChange, 
      onEdgesChange, 
      onConnect, 
      addNode,
      clearCanvas,
      saveDiagram,
      undo,
      redo,
      canUndo,
      canRedo,
      updateNodePositions,
      selectedNodes,
      deleteSelectedNodes
    }}>
      {children}
    </DiagramContext.Provider>
  );
}

export function useDiagram(): DiagramContextProps {
  const context = useContext(DiagramContext);
  if (context === undefined) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }
  return context;
}
