import React, { useRef, useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import initialNodes from '../data/initialNodes';
import initialEdges from '../data/initialEdges';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';
import EditableNode from './EditableNode';

const useDiagramState = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const idRef = useRef(9);

  // Save to localStorage and history
  React.useEffect(() => {
    const data = { nodes, edges };
    saveToLocalStorage('es-ide-diagram', data);
    setHistory((prev) => {
      if (prev.length > 0 && JSON.stringify(prev[prev.length-1].nodes) === JSON.stringify(nodes) && JSON.stringify(prev[prev.length-1].edges) === JSON.stringify(edges)) return prev;
      return [...prev, { nodes, edges }];
    });
    setFuture([]);
  }, [nodes, edges]);

  // Restore from localStorage
  React.useEffect(() => {
    const data = loadFromLocalStorage('es-ide-diagram');
    if (data) {
      try {
        const { nodes: n, edges: e } = data;
        if (Array.isArray(n) && Array.isArray(e)) {
          setNodes(n);
          setEdges(e);
        }
      } catch {}
    }
  }, []);

  // Undo/Redo
  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      setFuture((f) => [{ nodes, edges }, ...f]);
      const last = prev[prev.length - 2];
      setNodes(last.nodes);
      setEdges(last.edges);
      return prev.slice(0, -1);
    });
  };
  const handleRedo = () => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistory((h) => [...h, next]);
      return f.slice(1);
    });
  };

  // Clear
  const handleClearCanvas = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setHistory([]);
    setFuture([]);
    saveToLocalStorage('es-ide-diagram', { nodes: initialNodes, edges: initialEdges });
  };
  const handleClearLocalStorage = () => {
    saveToLocalStorage('es-ide-diagram', null);
  };

  // Add node by drop
  const getNodeStyle = (component) => {
    if (component.label === 'Aggregate') {
      return {
        background: component.color,
        border: `2px solid ${component.border}`,
        borderRadius: 4,
        height: 96,
        minWidth: 96,
        width: 192,
        aspectRatio: '2/1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: 16,
        padding: '0 16px',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        color: component.type === 'hotspot' ? '#fff' : '#222',
      };
    }
    return {
      background: component.color,
      border: `2px solid ${component.border}`,
      borderRadius: 4,
      height: 96,
      minWidth: 96,
      width: 96,
      aspectRatio: '1/1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: 16,
      padding: '0 8px',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      color: component.type === 'hotspot' ? '#fff' : '#222',
    };
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = event.target.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;
      const component = JSON.parse(data);
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      };
      const newNode = {
        id: `${idRef.current++}`,
        type: 'default',
        position,
        data: { label: component.label },
        sourcePosition: 'right',
        targetPosition: 'left',
        style: getNodeStyle(component),
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  return {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    handleUndo, handleRedo,
    handleClearCanvas, handleClearLocalStorage,
    onDrop
  };
};

export default useDiagramState;
