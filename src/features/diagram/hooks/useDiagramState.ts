import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Node, 
  Edge,
  addEdge, 
  Connection,
  XYPosition,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from 'reactflow';
import { saveToLocalStorage, loadFromLocalStorage } from '../../../utils/localStorage';
import { useHistoryState } from './useHistoryState';

const STORAGE_KEY = 'event-storming-diagram';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

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
  // Track if we're currently handling an undo/redo operation
  const isHistoryActionRef = useRef(false);
  
  // Track if we're currently dragging a node
  const isDraggingRef = useRef(false);
  
  // Track the state before dragging started
  const preDropStateRef = useRef<DiagramState | null>(null);
  
  // Basic node counter state
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  
  // Regular state for nodes and edges (not from history)
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  // History state
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

  // Load saved diagram from localStorage on initial load - FIX THE LOADING PROCESS
  useEffect(() => {
    try {
      const savedDiagram = loadFromLocalStorage<DiagramState>(
        STORAGE_KEY, 
        { nodes: [], edges: [], nodeIdCounter: 1 }
      );
      
      // Ensure we're loading with valid data
      if (savedDiagram && 
          savedDiagram.nodes && Array.isArray(savedDiagram.nodes) && 
          savedDiagram.edges && Array.isArray(savedDiagram.edges)) {
            
        console.log("Loading saved diagram:", savedDiagram);
        
        // Set the current state directly
        setNodes(savedDiagram.nodes);
        setEdges(savedDiagram.edges);
        
        // Make sure nodeIdCounter is higher than any existing node
        const highestId = savedDiagram.nodes.reduce((max, node) => {
          const idMatch = node.id.match(/\d+$/);
          if (idMatch) {
            const id = parseInt(idMatch[0]);
            return Math.max(max, id);
          }
          return max;
        }, 0);
        
        setNodeIdCounter(Math.max(highestId + 1, savedDiagram.nodeIdCounter || 1));
        
        // Reset history with the loaded state
        resetHistory(savedDiagram);
        
        console.log("Diagram loaded successfully");
      } else {
        console.log("No saved diagram found or invalid format");
      }
    } catch (error) {
      console.error("Error loading diagram:", error);
    }
  }, []); // Only run once on component mount

  // This function actually pushes current state to history
  const recordHistory = useCallback((force = false) => {
    // Only record if it's not an undo/redo operation and not during a drag operation
    if (!isHistoryActionRef.current && (!isDraggingRef.current || force)) {
      pushHistory({
        nodes,
        edges,
        nodeIdCounter
      });
    }
  }, [nodes, edges, nodeIdCounter, pushHistory]);

  // Modified effect to record history only on meaningful changes
  useEffect(() => {
    // Don't record during drags or when empty
    if (!isDraggingRef.current && (nodes.length > 0 || edges.length > 0)) {
      // Compare with previous state in history if possible
      const historyLength = history.past.length;
      if (historyLength > 0) {
        const prevState = history.past[historyLength - 1];
        
        // Only push new state if node/edge count changed (add/remove operations)
        // This avoids recording every position change during drag
        if (
          prevState.nodes.length !== nodes.length || 
          prevState.edges.length !== edges.length ||
          nodeIdCounter !== prevState.nodeIdCounter
        ) {
          recordHistory(true);
        }
      } else if (nodes.length > 0 || edges.length > 0) {
        // First item in history
        recordHistory(true);
      }
    }
  }, [nodes.length, edges.length, nodeIdCounter, recordHistory, history.past]);

  // Add a state to track selected nodes
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  
  // Update the onNodesChange to track selected nodes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Update selected nodes based on selection changes
    changes.forEach(change => {
      if (change.type === 'select') {
        setSelectedNodes(prevSelected => {
          const currentNodes = nodes.filter(node => 
            change.id === node.id
          );
          
          if (change.selected) {
            // Add to selection if not already there
            return [...prevSelected.filter(n => n.id !== change.id), ...currentNodes];
          } else {
            // Remove from selection
            return prevSelected.filter(node => node.id !== change.id);
          }
        });
      }
    });
    
    // Check if this is the start of a drag operation
    const dragStart = changes.some(
      change => change.type === 'select' || (change.type === 'position' && change.dragging === true)
    );
    
    // Check if this is the end of a drag operation
    const dragEnd = changes.some(
      change => change.type === 'position' && change.dragging === false
    );
    
    if (dragStart && !isDraggingRef.current) {
      // Start of dragging - save the current state
      isDraggingRef.current = true;
      preDropStateRef.current = { nodes, edges, nodeIdCounter };
    }
    
    // Apply the changes
    setNodes(nds => applyNodeChanges(changes, nds));
    
    // If this is the end of a drag, record history
    if (dragEnd && isDraggingRef.current) {
      // End of dragging - push the state change
      isDraggingRef.current = false;
      recordHistory(true);
      preDropStateRef.current = null;
    }
  }, [nodes, edges, nodeIdCounter, recordHistory]);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(prevEdges => applyEdgeChanges(changes, prevEdges));
  }, []);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    setEdges(prevEdges => addEdge(connection, prevEdges));
  }, []);

  // Enhanced addNode function to place new nodes next to selected nodes
  const addNode = useCallback(
    (nodeConfig: NodeConfig, position?: XYPosition) => {
      const id = `node_${nodeIdCounter}`;
      
      // Convert the name to a kebab-case nodeType if not provided
      const nodeType = nodeConfig.nodeType || nodeConfig.name.toLowerCase().replace(/ /g, '-');
      
      let newPosition: XYPosition;
      
      // If there's a selected node, place the new node exactly to its right
      if (selectedNodes.length > 0) {
        // Get the last selected node
        const selectedNode = selectedNodes[selectedNodes.length - 1];
        
        // Determine the width of the selected node
        const isWideNode = selectedNode.type === 'eventStormingNode' && 
                          (selectedNode.data?.nodeType === 'consistent-business-rule' || 
                           selectedNode.data?.label === 'Consistent Business Rule');
        const selectedNodeWidth = isWideNode ? 240 : 120;
        
        // Calculate position exactly at the right edge of the selected node
        newPosition = {
          x: selectedNode.position.x + selectedNodeWidth,
          y: selectedNode.position.y // Same vertical position
        };
        
        console.log("Adding node next to selected node:", {
          selectedNodeId: selectedNode.id,
          selectedNodePos: selectedNode.position,
          selectedNodeWidth,
          newNodePos: newPosition
        });
      } else if (position) {
        // Use provided position if available
        newPosition = position;
      } else {
        // Default center positioning with random offset
        const viewportWidth = window.innerWidth - 270;
        const viewportHeight = window.innerHeight - 84;
        
        const centerX = viewportWidth / 2 + 135;
        const centerY = viewportHeight / 2 + 27;
        
        // Add a small random offset
        const randomOffset = {
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50,
        };
        
        newPosition = {
          x: centerX + randomOffset.x,
          y: centerY + randomOffset.y,
        };
      }

      const newNode: Node = {
        id,
        type: 'eventStormingNode',
        data: { 
          label: nodeConfig.name,
          icon: nodeConfig.icon,
          color: nodeConfig.color,
          textColor: nodeConfig.textColor,
          nodeType: nodeType,
        },
        position: newPosition,
        style: {
          background: nodeConfig.color,
          color: nodeConfig.textColor,
        },
        selected: true, // Set new node as selected
      };

      // Create new nodes array with new node selected and all others deselected
      setNodes(prevNodes => {
        // Deselect all existing nodes
        const deselectNodes = prevNodes.map(n => ({
          ...n,
          selected: false
        }));
        
        // Add new selected node
        return [...deselectNodes, newNode];
      });
      
      // Also update selectedNodes state to only include the new node
      setSelectedNodes([newNode]);
      
      setNodeIdCounter(prev => prev + 1);
      
      // Push to history after node is added
      setTimeout(() => {
        recordHistory(true);
      }, 0);
      
      return id;
    },
    [nodeIdCounter, recordHistory, selectedNodes],
  );

  // Add a function to duplicate selected nodes
  const duplicateSelectedNodes = useCallback((nodesToDuplicate: Node[]) => {
    if (nodesToDuplicate.length === 0) return;

    // Create new node IDs for duplicated nodes
    const newNodes: Node[] = [];
    const offset = { x: 30, y: 30 }; // Offset for duplicated nodes

    // Create duplicates with new IDs
    nodesToDuplicate.forEach(node => {
      const newId = `node_${nodeIdCounter + newNodes.length}`;
      
      // Create a deep copy of the node with new ID and offset position
      const duplicatedNode: Node = {
        ...node,
        id: newId,
        selected: true, // Select the duplicated node
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y
        }
      };
      
      // Push to new nodes array
      newNodes.push(duplicatedNode);
    });

    // Update nodes state - deselect current nodes and add new ones
    setNodes(prevNodes => {
      // Deselect all existing nodes
      const deselectNodes = prevNodes.map(n => ({
        ...n,
        selected: false
      }));
      
      // Return array with all existing nodes (deselected) + new duplicated nodes (selected)
      return [...deselectNodes, ...newNodes];
    });
    
    // Update selected nodes state
    setSelectedNodes(newNodes);
    
    // Increment the node counter
    setNodeIdCounter(prev => prev + newNodes.length);
    
    // Record this operation in history
    setTimeout(() => {
      recordHistory(true);
    }, 0);
    
    return newNodes.map(n => n.id);
  }, [nodeIdCounter, recordHistory]);

  // Undo function
  const undo = useCallback(() => {
    if (canUndo) {
      isHistoryActionRef.current = true;
      undoHistory();
      
      // Apply the previous state from history
      const previousState = history.past[history.past.length - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setNodeIdCounter(previousState.nodeIdCounter);
      
      // Reset the flag after state has been applied
      setTimeout(() => {
        isHistoryActionRef.current = false;
      }, 0);
    }
  }, [canUndo, undoHistory, history]);

  // Redo function
  const redo = useCallback(() => {
    if (canRedo) {
      isHistoryActionRef.current = true;
      redoHistory();
      
      // Apply the next state from history
      const nextState = history.future[0];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setNodeIdCounter(nextState.nodeIdCounter);
      
      // Reset the flag after state has been applied
      setTimeout(() => {
        isHistoryActionRef.current = false;
      }, 0);
    }
  }, [canRedo, redoHistory, history]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeIdCounter(1);
    resetHistory({ nodes: [], edges: [], nodeIdCounter: 1 });
  }, [resetHistory]);

  // Save to local storage - Fix the possible discrepancy
  const saveDiagram = useCallback(() => {
    try {
      // Ensure we're saving the current state
      const currentState: DiagramState = {
        nodes,  // This should be the up-to-date nodes array
        edges,  // This should be the up-to-date edges array
        nodeIdCounter
      };
      
      console.log(`Saving ${nodes.length} nodes and ${edges.length} edges to localStorage`);
      
      // Save to localStorage
      saveToLocalStorage(STORAGE_KEY, currentState);
      
      console.log("Diagram saved successfully");
      return currentState;
    } catch (error) {
      console.error("Error saving diagram:", error);
      throw error;
    }
  }, [nodes, edges, nodeIdCounter]);

  // Expose the history for the history panel
  useEffect(() => {
    // This is a simplified approach - in a real app, you'd use context or proper state management
    // to make history available to the history panel
    (window as any).__DIAGRAM_HISTORY__ = {
      history: history
    };
  }, [history]);

  // Add a function to update node positions directly (for snapping)
  const updateNodePositions = useCallback((updates: { id: string; position: { x: number; y: number } }[]) => {
    setNodes(nds => {
      const newNodes = [...nds];
      
      updates.forEach(update => {
        const index = newNodes.findIndex(node => node.id === update.id);
        if (index !== -1) {
          newNodes[index] = {
            ...newNodes[index],
            position: update.position
          };
        }
      });

      // Record history after manual position update
      if (!isHistoryActionRef.current) {
        setTimeout(() => {
          pushHistory({
            nodes: newNodes,
            edges,
            nodeIdCounter
          });
        }, 0);
      }
      
      return newNodes;
    });
  }, [edges, nodeIdCounter, pushHistory]);

  // Add a function to delete selected nodes
  const deleteSelectedNodes = useCallback((nodesToDelete: Node[]) => {
    if (nodesToDelete.length === 0) return;

    // Get IDs of nodes to delete
    const nodeIdsToDelete = nodesToDelete.map(node => node.id);
    
    // Filter out the nodes to delete
    setNodes(prevNodes => prevNodes.filter(node => !nodeIdsToDelete.includes(node.id)));
    
    // Filter out edges connected to deleted nodes
    setEdges(prevEdges => prevEdges.filter(edge => 
      !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target)
    ));
    
    // Clear the selection state
    setSelectedNodes([]);
    
    // Record this operation in history
    setTimeout(() => {
      recordHistory(true);
    }, 0);

  }, [edges, recordHistory]);

  // Add a keyboard event handler for Delete key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete selected nodes when Delete key is pressed
      if (event.key === 'Delete' && selectedNodes.length > 0) {
        deleteSelectedNodes(selectedNodes);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, deleteSelectedNodes]);

  // Add a function to create a behavior group from selected nodes
  const createBehaviorGroup = useCallback(() => {
    if (selectedNodes.length < 2) {
      console.warn("Need at least 2 nodes to create a behavior group");
      return null;
    }

    // Create a group ID
    const id = `group_${nodeIdCounter}`;

    // Get positions of all selected nodes to calculate group dimensions
    const nodePositions = selectedNodes.map(node => ({
      x: node.position.x,
      y: node.position.y,
      width: node.type === 'eventStormingNode' && 
        (node.data?.nodeType === 'consistent-business-rule' || 
          node.data?.label === 'Consistent Business Rule') ? 240 : 120,
      height: 120
    }));

    // Calculate min/max coordinates to determine group dimensions
    const minX = Math.min(...nodePositions.map(pos => pos.x));
    const minY = Math.min(...nodePositions.map(pos => pos.y));
    const maxX = Math.max(...nodePositions.map(pos => pos.x + pos.width));
    const maxY = Math.max(...nodePositions.map(pos => pos.y + pos.height));

    // Create group node with extra padding (8px) around the contained nodes
    const padding = 16; // 8px padding on each side, for a total of 16px
    const newGroup = {
      id,
      type: 'groupNode',
      data: { 
        label: 'Behavior',
        icon: '🗂️',
        color: '#e0e0e0',
        textColor: '#000000',
        childNodeIds: selectedNodes.map(node => node.id)
      },
      position: {
        x: minX - padding,
        y: minY - padding - 8, // Extra space for the title
      },
      style: {
        width: (maxX - minX) + padding * 2,  // Add padding on both sides
        height: (maxY - minY) + padding * 2, // Add padding on both sides
      },
      selected: true,
      zIndex: -1, // Ensure groups are behind regular nodes
    };

    // Don't deselect the nodes when creating a group - keep everything selected
    setNodes(prevNodes => {
      return [...prevNodes, newGroup];
    });
    
    // Add group to selected nodes while keeping existing selections
    setSelectedNodes(prev => [...prev, newGroup as Node]);
    
    setNodeIdCounter(prev => prev + 1);
    
    // Record this operation in history
    setTimeout(() => {
      recordHistory(true);
    }, 0);
    
    return id;
  }, [selectedNodes, nodeIdCounter, recordHistory]);

  // Return the public API
  return {
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
    createBehaviorGroup // Add this to the returned object
  };
}
