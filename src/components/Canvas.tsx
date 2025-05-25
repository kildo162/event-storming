import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  NodeTypes,
  OnSelectionChangeParams,
  Panel,
  BackgroundVariant,
  useReactFlow,
  Node,
  SelectionMode,
  ReactFlowInstance,
  PanOnScrollMode
} from "reactflow";
import "reactflow/dist/style.css";
import { useDiagram } from "../features/diagram/DiagramContext";
import EventStormingNode from "./EventStormingNode";
import GroupNode from "./GroupNode";

// Define custom node types
const nodeTypes: NodeTypes = {
  eventStormingNode: EventStormingNode,
  groupNode: GroupNode,
};

// Snap grid settings
const GRID_SIZE = 20;
const SNAP_DISTANCE = 15; // Maximum distance for magnetic snapping

// Define toolbar types
type CanvasTool = 'select' | 'hand';

function Canvas() {
  const [bgColor, setBgColor] = useState("#f5f7fa");
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, updateNodePositions } = useDiagram();
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');

  // Initialize the ReactFlow instance
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    // Auto-fit the view initially
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 50);
  }, []);

  useEffect(() => {
    const getBg = () =>
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "#23272f"
        : "#f5f7fa";
    setBgColor(getBg());

    const observer = new MutationObserver(() => {
      setBgColor(getBg());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  // Add keyboard shortcut for toggling tools
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 'V' key for select tool, 'H' key for hand tool
      if (event.key === 'v' || event.key === 'V') {
        setActiveTool('select');
      } else if (event.key === 'h' || event.key === 'H') {
        setActiveTool('hand');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle selection changes to determine start/end of node interactions
  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    // Selection change helps track when user is interacting with nodes
    // The actual history tracking happens in onNodesChange
  }, []);

  // Custom node drag behavior with snap
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    // Original non-snapped node position
    const { x, y } = node.position;
    let newX = x;
    let newY = y;

    // Snap to grid first (coarse adjustment)
    newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
    newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

    // Fine-tune with magnetic snapping to other nodes
    const otherNodes = nodes.filter(n => n.id !== node.id);
    
    // The width and height of the current node
    const nodeWidth = node.type === 'eventStormingNode' && 
                    (node.data?.nodeType === 'consistent-business-rule' || 
                     node.data?.label === 'Consistent Business Rule') 
                    ? 240 : 120;
    const nodeHeight = 120;

    // Values to check for horizontal alignment (top and bottom edges)
    const nodeTop = newY;
    const nodeBottom = newY + nodeHeight;
    const nodeCenterY = newY + nodeHeight / 2;

    // Values to check for vertical alignment (left and right edges)
    const nodeLeft = newX;
    const nodeRight = newX + nodeWidth;
    const nodeCenterX = newX + nodeWidth / 2;

    let bestSnapDistanceX = SNAP_DISTANCE;
    let bestSnapDistanceY = SNAP_DISTANCE;
    let snappedX = null;
    let snappedY = null;
    
    // Track which edge was snapped to apply the gap
    let snappedEdge = '';

    // Check each other node to find potential snap points
    otherNodes.forEach(otherNode => {
      // Determine the other node's dimensions
      const otherWidth = otherNode.type === 'eventStormingNode' && 
                        (otherNode.data?.nodeType === 'consistent-business-rule' || 
                         otherNode.data?.label === 'Consistent Business Rule') 
                        ? 240 : 120;
      const otherHeight = 120;
      
      // Calculate the other node's edges and center
      const otherLeft = otherNode.position.x;
      const otherRight = otherNode.position.x + otherWidth;
      const otherCenterX = otherNode.position.x + otherWidth / 2;
      
      const otherTop = otherNode.position.y;
      const otherBottom = otherNode.position.y + otherHeight;
      const otherCenterY = otherNode.position.y + otherHeight / 2;
      
      // Check horizontal snapping (left to left, right to right, left to right, etc.)
      [
        { edge: nodeLeft, otherEdge: otherLeft, type: 'left-left' },     // Left to Left
        { edge: nodeRight, otherEdge: otherRight, type: 'right-right' },   // Right to Right
        { edge: nodeLeft, otherEdge: otherRight, type: 'left-right' },    // Left to Right
        { edge: nodeRight, otherEdge: otherLeft, type: 'right-left' },    // Right to Left
        { edge: nodeCenterX, otherEdge: otherCenterX, type: 'center-center-x' } // Center to Center
      ].forEach(({ edge, otherEdge, type }) => {
        const distance = Math.abs(edge - otherEdge);
        if (distance < bestSnapDistanceX) {
          bestSnapDistanceX = distance;
          
          // Calculate the position without the gap
          let adjustedPosition;
          if (type === 'left-right') {
            // Left edge of current node to right edge of other node
            adjustedPosition = otherEdge; // Removed gap
          } else if (type === 'right-left') {
            // Right edge of current node to left edge of other node
            adjustedPosition = otherEdge - nodeWidth; // Removed gap
          } else {
            // For same-edge alignments (left-left, right-right, center-center)
            adjustedPosition = newX + (otherEdge - edge);
          }
          
          snappedX = adjustedPosition;
          snappedEdge = type;
        }
      });
      
      // Check vertical snapping (top to top, bottom to bottom, etc.)
      [
        { edge: nodeTop, otherEdge: otherTop, type: 'top-top' },       // Top to Top
        { edge: nodeBottom, otherEdge: otherBottom, type: 'bottom-bottom' }, // Bottom to Bottom
        { edge: nodeTop, otherEdge: otherBottom, type: 'top-bottom' },    // Top to Bottom
        { edge: nodeBottom, otherEdge: otherTop, type: 'bottom-top' },    // Bottom to Top
        { edge: nodeCenterY, otherEdge: otherCenterY, type: 'center-center-y' } // Center to Center
      ].forEach(({ edge, otherEdge, type }) => {
        const distance = Math.abs(edge - otherEdge);
        if (distance < bestSnapDistanceY) {
          bestSnapDistanceY = distance;
          
          // Calculate the position without the gap
          let adjustedPosition;
          if (type === 'top-bottom') {
            // Top edge of current node to bottom edge of other node
            adjustedPosition = otherEdge; // Removed gap
          } else if (type === 'bottom-top') {
            // Bottom edge of current node to top edge of other node
            adjustedPosition = otherEdge - nodeHeight; // Removed gap
          } else {
            // For same-edge alignments (top-top, bottom-bottom, center-center)
            adjustedPosition = newY + (otherEdge - edge);
          }
          
          snappedY = adjustedPosition;
          snappedEdge = type;
        }
      });
    });
    
    // Apply snapped position if available
    const finalPosition = {
      x: snappedX !== null ? snappedX : newX,
      y: snappedY !== null ? snappedY : newY
    };
    
    // Update the node position with the snapped values
    updateNodePositions([{ id: node.id, position: finalPosition }]);
    
  }, [nodes, updateNodePositions]);

  // Determine configuration for ReactFlow based on active tool
  const getReactFlowConfig = useCallback(() => {
    if (activeTool === 'select') {
      return {
        selectionOnDrag: true,
        panOnDrag: false,
        panOnScroll: false,
        panOnScrollMode: undefined as PanOnScrollMode | undefined,
        selectionMode: SelectionMode.Partial,
        selectionKeyCode: null,
        multiSelectionKeyCode: 'Shift',
        deleteKeyCode: 'Delete'
      };
    } else {  // hand tool
      return {
        selectionOnDrag: false,
        panOnDrag: true,
        panOnScroll: true,
        panOnScrollMode: PanOnScrollMode.Free as PanOnScrollMode,
        selectionMode: SelectionMode.Partial,
        selectionKeyCode: 'Shift',  // Require shift to select when in hand mode
        multiSelectionKeyCode: 'Shift',
        deleteKeyCode: 'Delete'
      };
    }
  }, [activeTool]);

  // Toggle between hand and selection tool
  const toggleTool = useCallback(() => {
    setActiveTool(prev => prev === 'select' ? 'hand' : 'select');
  }, []);

  // ReactFlow configuration
  const flowConfig = getReactFlowConfig();

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
        // Use the configuration based on active tool
        selectionMode={flowConfig.selectionMode}
        selectionOnDrag={flowConfig.selectionOnDrag}
        panOnDrag={flowConfig.panOnDrag}
        panOnScroll={flowConfig.panOnScroll}
        panOnScrollMode={flowConfig.panOnScrollMode}
        selectionKeyCode={flowConfig.selectionKeyCode}
        multiSelectionKeyCode={flowConfig.multiSelectionKeyCode}
        deleteKeyCode={flowConfig.deleteKeyCode}
        data-tool={activeTool} // Add data attribute for CSS selection
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

        {/* Tool switcher button */}
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

        {/* Canvas instructions based on current tool */}
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
      </ReactFlow>
    </div>
  );
}

export default Canvas;
