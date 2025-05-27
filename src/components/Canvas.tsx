import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  NodeTypes,
  OnSelectionChangeParams,
  BackgroundVariant,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { useDiagram } from "../features/diagram";
import { useNodeSnapping } from "../features/diagram/hooks/useNodeSnapping";
import { useCanvasTools } from "../features/diagram/hooks/useCanvasTools";
import EventStormingNode from "./EventStormingNode";
import GroupNode from "./GroupNode";

// Define custom node types
const nodeTypes: NodeTypes = {
  eventStormingNode: EventStormingNode,
  groupNode: GroupNode,
};

const GRID_SIZE = 20;

function Canvas() {
  const [bgColor, setBgColor] = useState("#f5f7fa");
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, updateNodePositions } = useDiagram();
  
  // Use custom hooks
  const { activeTool, setActiveTool, getToolConfig } = useCanvasTools();
  const { onNodeDragStop } = useNodeSnapping({ nodes, updateNodePositions });

  // Initialize ReactFlow instance
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    setTimeout(() => instance.fitView({ padding: 0.2 }), 50);
  }, []);

  // Handle theme changes
  useEffect(() => {
    const getBg = () =>
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "#23272f"
        : "#f5f7fa";
    
    setBgColor(getBg());

    const observer = new MutationObserver(() => setBgColor(getBg()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, []);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    // Selection change tracking happens in onNodesChange
  }, []);

  const flowConfig = getToolConfig();

  const renderToolInstructions = () => (
    <div className="canvas-instructions">
      <div className="instruction-item tool-indicator">
        <span className="current-tool-icon">
          {activeTool === 'select' ? '🔍' : '✋'}
        </span>
        <span className="current-tool-name">
          {activeTool === 'select' ? 'Selection Tool' : 'Hand Tool'}
        </span>
      </div>
      
      {activeTool === 'select' ? (
        <>
          <div className="instruction-item">
            <span className="instruction-key">🔳 Drag</span> to select nodes
          </div>
          <div className="instruction-item">
            <span className="instruction-key">Shift+🖱️</span> to multi-select
          </div>
        </>
      ) : (
        <>
          <div className="instruction-item">
            <span className="instruction-key">🖱️ Drag</span> to pan canvas
          </div>
          <div className="instruction-item">
            <span className="instruction-key">Shift+Click</span> to select nodes
          </div>
        </>
      )}
    </div>
  );

  const renderToolSwitcher = () => (
    <div className="canvas-tool-switcher">
      <button
        className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
        onClick={() => setActiveTool('select')}
        title="Selection Tool (V)"
      >
        <span role="img" aria-label="Selection Tool">🔍</span>
      </button>
      <button
        className={`tool-btn ${activeTool === 'hand' ? 'active' : ''}`}
        onClick={() => setActiveTool('hand')}
        title="Hand Tool (H)"
      >
        <span role="img" aria-label="Hand Tool">✋</span>
      </button>
    </div>
  );

  return (
    <div className="canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        onInit={onInit}
        fitView
        style={{ width: '100%', height: '100%' }}
        proOptions={{ hideAttribution: true }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        {...flowConfig}
        data-tool={activeTool}
      >
        <Background
          color={bgColor}
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <MiniMap zoomable pannable />
        <Controls
          showInteractive={false}
          position="bottom-right"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none'
          }}
        />
        {renderToolSwitcher()}
        {renderToolInstructions()}
      </ReactFlow>
    </div>
  );
}

export default Canvas;
