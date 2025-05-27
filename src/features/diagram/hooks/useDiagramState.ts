import { useState, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { saveToLocalStorage, loadFromLocalStorage } from '../../../utils/localStorage';
import { useHistoryState } from './useHistoryState';
import { useNodeOperations } from '../hooks/useNodeOperations';
import { useGroupOperations } from '../hooks/useGroupOperations';

const STORAGE_KEY = 'event-storming-diagram';

export interface NodeConfig {
  name: string;
  icon: string;
  color: string;
  textColor: string;
  nodeType?: string;
}

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  nodeIdCounter: number;
}

export function useDiagramState() {
  const isHistoryActionRef = useRef(false);
  const isDraggingRef = useRef(false);

  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const {
    state: historyState,
    push: pushHistory,
    undo: undoHistory,
    redo: redoHistory,
    reset: resetHistory,
    canUndo,
    canRedo,
    history
  } = useHistoryState<DiagramState>({
    nodes: [],
    edges: [],
    nodeIdCounter: 1
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedDiagram = loadFromLocalStorage<DiagramState>(
        STORAGE_KEY,
        { nodes: [], edges: [], nodeIdCounter: 1 }
      );
      if (
        savedDiagram &&
        Array.isArray(savedDiagram.nodes) &&
        Array.isArray(savedDiagram.edges)
      ) {
        const highestId = savedDiagram.nodes.reduce((max, node) => {
          const idMatch = node.id.match(/\d+$/);
          if (idMatch) {
            const id = parseInt(idMatch[0]);
            return Math.max(max, id);
          }
          return max;
        }, 0);
        const nextNodeIdCounter = Math.max(highestId + 1, savedDiagram.nodeIdCounter || 1);

        setNodes(savedDiagram.nodes);
        setEdges(savedDiagram.edges);
        setNodeIdCounter(nextNodeIdCounter);

        resetHistory({
          nodes: savedDiagram.nodes,
          edges: savedDiagram.edges,
          nodeIdCounter: nextNodeIdCounter
        });
      }
    } catch (error) {
      console.error("Error loading diagram:", error);
    }
  }, [resetHistory]);

  // Node operations
  const nodeOps = useNodeOperations({
    nodes, setNodes, edges, setEdges, nodeIdCounter, setNodeIdCounter,
    isHistoryActionRef, isDraggingRef, pushHistory, history, canUndo, canRedo, undoHistory, redoHistory, resetHistory
  });

  // Group operations
  const groupOps = useGroupOperations({
    nodes, setNodes, nodeIdCounter, setNodeIdCounter, pushHistory
  });

  // Save diagram
  const saveDiagram = () => {
    try {
      const currentState: DiagramState = {
        nodes,
        edges,
        nodeIdCounter
      };
      saveToLocalStorage(STORAGE_KEY, currentState);
      return currentState;
    } catch (error) {
      console.error("Error saving diagram:", error);
      throw error;
    }
  };

  return {
    nodes,
    edges,
    ...nodeOps,
    ...groupOps,
    saveDiagram,
    canUndo,
    canRedo,
    history
  };
}
