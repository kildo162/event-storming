import { useState, useEffect, useRef, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { saveToLocalStorage, loadFromLocalStorage } from '../../../utils/localStorage';
import { useHistoryState } from './useHistoryState';
import { useNodeOperations } from './useNodeOperations';
import { useGroupOperations } from './useGroupOperations';
import { useGroupNodeSync } from './useGroupNodeSync';

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

  const { syncGroupNodes } = useGroupNodeSync();

  // Sync sau khi undo/redo
  const handleHistoryUpdate = useCallback((newNodes: Node[]) => {
    setNodes(newNodes);
    // Đợi một tick để đảm bảo nodes đã được cập nhật
    setTimeout(() => syncGroupNodes(newNodes, setNodes), 0);
  }, [syncGroupNodes]);

  // Wrap setNodes để tự động sync group nodes
  const wrappedSetNodes = useCallback((updatedNodes: Node[] | ((prev: Node[]) => Node[])) => {
    setNodes(prev => {
      const newNodes = typeof updatedNodes === 'function' ? updatedNodes(prev) : updatedNodes;
      // Chỉ sync khi không phải là thao tác history
      if (!isHistoryActionRef.current) {
        setTimeout(() => syncGroupNodes(newNodes, setNodes), 0);
      }
      return newNodes;
    });
  }, [syncGroupNodes]);

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
    nodes,
    setNodes: wrappedSetNodes,
    edges,
    setEdges,
    nodeIdCounter,
    setNodeIdCounter,
    isHistoryActionRef,
    isDraggingRef,
    pushHistory,
    history,
    canUndo,
    canRedo,
    undoHistory,
    redoHistory,
    resetHistory
  });

  // Group operations
  const groupOps = useGroupOperations({
    nodes,
    setNodes: wrappedSetNodes,
    nodeIdCounter,
    setNodeIdCounter,
    pushHistory
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

  // Override history operations to handle group syncing
  const historyOperations = {
    undo: useCallback(() => {
      isHistoryActionRef.current = true;
      undoHistory();
      const newState = history.past[history.past.length - 1];
      if (newState) {
        handleHistoryUpdate(newState.nodes);
      }
      isHistoryActionRef.current = false;
    }, [undoHistory, history, handleHistoryUpdate]),

    redo: useCallback(() => {
      isHistoryActionRef.current = true;
      redoHistory();
      const newState = history.future[0];
      if (newState) {
        handleHistoryUpdate(newState.nodes);
      }
      isHistoryActionRef.current = false;
    }, [redoHistory, history, handleHistoryUpdate]),

    reset: useCallback((newState: DiagramState) => {
      isHistoryActionRef.current = true;
      resetHistory(newState);
      handleHistoryUpdate(newState.nodes);
      isHistoryActionRef.current = false;
    }, [resetHistory, handleHistoryUpdate])
  };

  return {
    nodes,
    edges,
    ...nodeOps,
    ...groupOps,
    saveDiagram,
    canUndo,
    canRedo,
    history,
    ...historyOperations
  };
}
