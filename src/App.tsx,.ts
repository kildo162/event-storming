function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import COMPONENTS from './components/components';
import useDiagramState from './components/useDiagramState';
import ReactFlow, { addEdge, MiniMap, Controls, Background } from 'reactflow';
import EditableNode from './components/EditableNode';
function App() {
  const [mode, setMode] = useState('select');
  const [theme, setTheme] = useState('light');
  const [canvasColor, setCanvasColor] = useState('#f4f4f4');
  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    handleUndo,
    handleRedo,
    handleClearCanvas,
    handleClearLocalStorage,
    onDrop
  } = useDiagramState();
  const nodeTypes = {
    default: props => /*#__PURE__*/React.createElement(EditableNode, _extends({}, props, {
      setNodes: props.setNodes || (() => {})
    }))
  };

  // Auto change canvas color when theme changes
  React.useEffect(() => {
    setCanvasColor(theme === 'dark' ? '#23272f' : '#f4f4f4');
  }, [theme]);

  // Drag & Drop handlers
  const onDragStart = (event, component) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Listen to mode change from Sidebar
  const handleModeChange = newMode => setMode(newMode);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      width: '100vw',
      height: '100vh'
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    onDragStart: onDragStart,
    onModeChange: handleModeChange
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 16,
      right: 24,
      zIndex: 10,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px #0002',
      padding: '6px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: '#222'
    }
  }, "Canvas:"), /*#__PURE__*/React.createElement("input", {
    type: "color",
    value: canvasColor,
    onChange: e => setCanvasColor(e.target.value),
    style: {
      width: 28,
      height: 28,
      border: 'none',
      background: 'none',
      cursor: 'pointer'
    },
    title: "Ch\u1ECDn m\xE0u n\u1EC1n canvas"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    style: {
      marginLeft: 8,
      background: theme === 'dark' ? '#23272f' : '#f4f4f4',
      color: theme === 'dark' ? '#FFA500' : '#23272f',
      border: '1px solid #FFA500',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 14,
      padding: '4px 10px',
      cursor: 'pointer',
      outline: 'none',
      transition: 'background 0.2s, color 0.2s'
    },
    title: "Chuy\u1EC3n dark/light mode"
  }, theme === 'dark' ? 'Light' : 'Dark'), /*#__PURE__*/React.createElement("button", {
    onClick: handleUndo,
    style: {
      marginLeft: 8,
      background: '#eee',
      border: '1px solid #FFA500',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 14,
      padding: '4px 10px',
      cursor: 'pointer',
      color: '#FFA500'
    },
    title: "Undo (Ctrl+Z)"
  }, "\u21B6"), /*#__PURE__*/React.createElement("button", {
    onClick: handleRedo,
    style: {
      background: '#eee',
      border: '1px solid #FFA500',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 14,
      padding: '4px 10px',
      cursor: 'pointer',
      color: '#FFA500'
    },
    title: "Redo (Ctrl+Y)"
  }, "\u21B7"), /*#__PURE__*/React.createElement("button", {
    onClick: handleClearCanvas,
    style: {
      background: '#fff0e0',
      border: '1px solid #FFA500',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 14,
      padding: '4px 10px',
      cursor: 'pointer',
      color: '#FFA500'
    },
    title: "Clear canvas & localStorage"
  }, "\uD83D\uDDD1"), /*#__PURE__*/React.createElement("button", {
    onClick: handleClearLocalStorage,
    style: {
      background: '#fff',
      border: '1px solid #888',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 14,
      padding: '4px 10px',
      cursor: 'pointer',
      color: '#888'
    },
    title: "Ch\u1EC9 x\xF3a localStorage"
  }, "\u239A")), /*#__PURE__*/React.createElement(ReactFlow, {
    nodes: nodes,
    edges: edges,
    onNodesChange: onNodesChange,
    onEdgesChange: onEdgesChange,
    onConnect: params => setEdges(eds => addEdge(params, eds)),
    onDrop: onDrop,
    onDragOver: event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    fitView: true,
    snapToGrid: true,
    snapGrid: [32, 1],
    selectionOnDrag: mode === 'select',
    panOnDrag: mode === 'pan' ? [1, 2] : [2],
    panOnScroll: true,
    selectionMode: "partial",
    nodeTypes: nodeTypes,
    defaultEdgeOptions: {
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#888',
        strokeWidth: 2
      }
    },
    defaultViewport: {
      x: 0,
      y: 0,
      zoom: 1
    }
  }, /*#__PURE__*/React.createElement(MiniMap, null), /*#__PURE__*/React.createElement(Controls, null), /*#__PURE__*/React.createElement(Background, {
    color: canvasColor,
    gap: 16
  }))));
}
export default App;