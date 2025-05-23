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
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    handleUndo, handleRedo,
    handleClearCanvas, handleClearLocalStorage,
    onDrop,
  } = useDiagramState();

  const nodeTypes = {
    default: (props) => <EditableNode {...props} setNodes={props.setNodes || (()=>{})} />,
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
  const handleModeChange = (newMode) => setMode(newMode);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <Sidebar onDragStart={onDragStart} onModeChange={handleModeChange} />
      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Canvas color/theme picker + Undo/Redo/Clear */}
        <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 10, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0002', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#222' }}>Canvas:</span>
          <input type="color" value={canvasColor} onChange={e => setCanvasColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }} title="Chọn màu nền canvas" />
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
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
              transition: 'background 0.2s, color 0.2s',
            }}
            title="Chuyển dark/light mode"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          {/* Undo/Redo/Clear buttons */}
          <button onClick={handleUndo} style={{marginLeft:8,background:'#eee',border:'1px solid #FFA500',borderRadius:6,fontWeight:600,fontSize:14,padding:'4px 10px',cursor:'pointer',color:'#FFA500'}} title="Undo (Ctrl+Z)">↶</button>
          <button onClick={handleRedo} style={{background:'#eee',border:'1px solid #FFA500',borderRadius:6,fontWeight:600,fontSize:14,padding:'4px 10px',cursor:'pointer',color:'#FFA500'}} title="Redo (Ctrl+Y)">↷</button>
          <button onClick={handleClearCanvas} style={{background:'#fff0e0',border:'1px solid #FFA500',borderRadius:6,fontWeight:600,fontSize:14,padding:'4px 10px',cursor:'pointer',color:'#FFA500'}} title="Clear canvas & localStorage">🗑</button>
          <button onClick={handleClearLocalStorage} style={{background:'#fff',border:'1px solid #888',borderRadius:6,fontWeight:600,fontSize:14,padding:'4px 10px',cursor:'pointer',color:'#888'}} title="Chỉ xóa localStorage">⎚</button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={params => setEdges(eds => addEdge(params, eds))}
          onDrop={onDrop}
          onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
          fitView
          snapToGrid={true}
          snapGrid={[32, 1]}
          selectionOnDrag={mode === 'select'}
          panOnDrag={mode === 'pan' ? [1, 2] : [2]}
          panOnScroll={true}
          selectionMode="partial"
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { stroke: '#888', strokeWidth: 2 } }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <MiniMap />
          <Controls />
          <Background color={canvasColor} gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;

