import { useState, useCallback, useEffect } from 'react';
import {
  Node, Edge, Connection, XYPosition, NodeChange, EdgeChange,
  addEdge, applyNodeChanges, applyEdgeChanges
} from 'reactflow';
import { NodeConfig } from './useDiagramState';

export function useNodeOperations({
  nodes, setNodes, edges, setEdges, nodeIdCounter, setNodeIdCounter,
  isHistoryActionRef, isDraggingRef, pushHistory, history, canUndo, canRedo, undoHistory, redoHistory, resetHistory
}: any) {
  // Track selected nodes
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  // Record history helper
  const recordHistory = useCallback((force = false) => {
    if (!isHistoryActionRef.current && (!isDraggingRef.current || force)) {
      pushHistory({
        nodes,
        edges,
        nodeIdCounter
      });
    }
  }, [nodes, edges, nodeIdCounter, pushHistory, isHistoryActionRef, isDraggingRef]);

  // History effect
  useEffect(() => {
    if (!isDraggingRef.current && (nodes.length > 0 || edges.length > 0)) {
      const historyLength = history.past.length;
      if (historyLength > 0) {
        const prevState = history.past[historyLength - 1];
        if (
          prevState.nodes.length !== nodes.length ||
          prevState.edges.length !== edges.length ||
          nodeIdCounter !== prevState.nodeIdCounter
        ) {
          recordHistory(true);
        }
      } else if (nodes.length > 0 || edges.length > 0) {
        recordHistory(true);
      }
    }
  }, [nodes.length, edges.length, nodeIdCounter, recordHistory, history.past, isDraggingRef]);

  // onNodesChange
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'select') {
        setSelectedNodes(prevSelected => {
          const currentNodes = nodes.filter((node: { id: string; }) => change.id === node.id);
          if (change.selected) {
            return [...prevSelected.filter(n => n.id !== change.id), ...currentNodes];
          } else {
            return prevSelected.filter(node => node.id !== change.id);
          }
        });
      }
    });

    const dragStart = changes.some(
      change => change.type === 'select' || (change.type === 'position' && change.dragging === true)
    );
    const dragEnd = changes.some(
      change => change.type === 'position' && change.dragging === false
    );

    if (dragStart && !isDraggingRef.current) {
      isDraggingRef.current = true;
    }

    setNodes((nds: Node<any>[]) => applyNodeChanges(changes, nds));

    if (dragEnd && isDraggingRef.current) {
      isDraggingRef.current = false;
      recordHistory(true);
    }
  }, [nodes, recordHistory, setNodes, isDraggingRef]);

  // onEdgesChange
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((prevEdges: Edge[]) => applyEdgeChanges(changes, prevEdges));
  }, [setEdges]);

  // onConnect
  const onConnect = useCallback((connection: Connection) => {
    setEdges((prevEdges: Edge[]) => addEdge(connection, prevEdges));
  }, [setEdges]);

  // addNode
  const addNode = useCallback(
    (nodeConfig: NodeConfig, position?: XYPosition) => {
      const id = `node_${nodeIdCounter}`;
      const nodeType = nodeConfig.nodeType || nodeConfig.name.toLowerCase().replace(/ /g, '-');
      let newPosition: XYPosition;

      if (selectedNodes.length > 0) {
        const selectedNode = selectedNodes[selectedNodes.length - 1];
        const isWideNode = selectedNode.type === 'eventStormingNode' &&
          (selectedNode.data?.nodeType === 'consistent-business-rule' ||
            selectedNode.data?.label === 'Consistent Business Rule');
        const selectedNodeWidth = isWideNode ? 240 : 120;
        newPosition = {
          x: selectedNode.position.x + selectedNodeWidth,
          y: selectedNode.position.y
        };
      } else if (position) {
        newPosition = position;
      } else {
        const viewportWidth = window.innerWidth - 270;
        const viewportHeight = window.innerHeight - 84;
        const centerX = viewportWidth / 2 + 135;
        const centerY = viewportHeight / 2 + 27;
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
          defaultLabel: nodeConfig.name,  // Lưu tên mặc định
          icon: nodeConfig.icon,
          color: nodeConfig.color,
          textColor: nodeConfig.textColor,
          nodeType: nodeType,
          onLabelChange: updateNodeLabel,
          isEdited: false,  // Khởi tạo chưa chỉnh sửa
        },
        position: newPosition,
        style: {
          background: nodeConfig.color,
          color: nodeConfig.textColor,
        },
        selected: true,
      };

      setNodes((prevNodes: Node[]) => {
        const deselectNodes = prevNodes.map(n => ({
          ...n,
          selected: false
        }));
        return [...deselectNodes, newNode];
      });
      setSelectedNodes([newNode]);
      setNodeIdCounter((prev: number) => prev + 1);

      setTimeout(() => {
        recordHistory(true);
      }, 0);

      return id;
    },
    [nodeIdCounter, recordHistory, selectedNodes, setNodes, setNodeIdCounter]
  );

  // duplicateSelectedNodes
  const duplicateSelectedNodes = useCallback((nodesToDuplicate: Node[]) => {
    if (nodesToDuplicate.length === 0) return;
    const newNodes: Node[] = [];
    const offset = { x: 30, y: 30 };
    nodesToDuplicate.forEach(node => {
      const newId = `node_${nodeIdCounter + newNodes.length}`;
      const duplicatedNode: Node = {
        ...node,
        id: newId,
        selected: true,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y
        },
        data: {
          ...node.data,
          onLabelChange: updateNodeLabel,
          // Giữ nguyên defaultLabel và isEdited từ node gốc
          defaultLabel: node.data?.defaultLabel,
          isEdited: node.data?.isEdited
        }
      };
      newNodes.push(duplicatedNode);
    });
    setNodes((prevNodes: Node[]) => {
      const deselectNodes = prevNodes.map(n => ({
        ...n,
        selected: false
      }));
      return [...deselectNodes, ...newNodes];
    });
    setSelectedNodes(newNodes);
    setNodeIdCounter((prev: number) => prev + newNodes.length);
    setTimeout(() => {
      recordHistory(true);
    }, 0);
    return newNodes.map(n => n.id);
  }, [nodeIdCounter, recordHistory, setNodes, setNodeIdCounter]);

  // deleteSelectedNodes
  const deleteSelectedNodes = useCallback((nodesToDelete: Node[]) => {
    if (nodesToDelete.length === 0) return;
    const nodeIdsToDelete = nodesToDelete.map(node => node.id);
    setNodes((prevNodes: Node[]) => prevNodes.filter(node => !nodeIdsToDelete.includes(node.id)));
    setEdges((prevEdges: Edge[]) =>
      prevEdges.filter(edge =>
        !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target)
      )
    );
    setSelectedNodes([]);
    setTimeout(() => {
      recordHistory(true);
    }, 0);
  }, [setNodes, setEdges, recordHistory]);

  // updateNodeLabel
  const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes((prevNodes: Node[]) => {
      const newNodes = prevNodes.map(node => {
        if (node.id === nodeId) {
          // Kiểm tra xem có phải đang reset về giá trị mặc định không
          const isResettingToDefault = newLabel === node.data?.defaultLabel;
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
              isEdited: !isResettingToDefault // Cập nhật trạng thái đã edit
            }
          };
        }
        return node;
      });

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
  }, [edges, nodeIdCounter, pushHistory, isHistoryActionRef]);

  // updateNodePositions
  const updateNodePositions = useCallback((updates: { id: string; position: { x: number; y: number } }[]) => {
    setNodes((nds: Node[]) => {
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
  }, [edges, nodeIdCounter, pushHistory, setNodes, isHistoryActionRef]);

  // Undo
  const undo = useCallback(() => {
    if (canUndo) {
      isHistoryActionRef.current = true;
      undoHistory();
      const previousState = history.past[history.past.length - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setNodeIdCounter(previousState.nodeIdCounter);
      setTimeout(() => {
        isHistoryActionRef.current = false;
      }, 0);
    }
  }, [canUndo, undoHistory, history, setNodes, setEdges, setNodeIdCounter, isHistoryActionRef]);

  // Redo
  const redo = useCallback(() => {
    if (canRedo) {
      isHistoryActionRef.current = true;
      redoHistory();
      const nextState = history.future[0];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setNodeIdCounter(nextState.nodeIdCounter);
      setTimeout(() => {
        isHistoryActionRef.current = false;
      }, 0);
    }
  }, [canRedo, redoHistory, history, setNodes, setEdges, setNodeIdCounter, isHistoryActionRef]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeIdCounter(1);
    resetHistory({ nodes: [], edges: [], nodeIdCounter: 1 });
  }, [setNodes, setEdges, setNodeIdCounter, resetHistory]);

  // Keyboard delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedNodes.length > 0) {
        deleteSelectedNodes(selectedNodes);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, deleteSelectedNodes]);

  return {
    selectedNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    duplicateSelectedNodes,
    deleteSelectedNodes,
    updateNodePositions,
    undo,
    redo,
    clearCanvas,
    updateNodeLabel,
  };
}
