import React, { createContext, ReactNode } from 'react';
import { useDiagramState } from './hooks/useDiagramState';
import { DiagramContextProps } from './types';

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
    deleteSelectedNodes,
    duplicateSelectedNodes,
    createBehaviorGroup,
    updateNodeLabel
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
      deleteSelectedNodes,
      duplicateSelectedNodes,
      createBehaviorGroup,
      updateNodeLabel
    }}>
      {children}
    </DiagramContext.Provider>
  );
}

// Hook được di chuyển sang useDiagramContext.ts
export { DiagramContext };
export type { DiagramContextProps };
