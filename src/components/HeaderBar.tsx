import React, { useEffect, useState } from "react";
import { useDiagram } from "../features/diagram/DiagramContext";

type StatusType = "ready" | "saving" | "saved";

interface HeaderBarProps {
  setStatus?: (status: StatusType) => void;
}

function HeaderBar({ setStatus }: HeaderBarProps) {
  const { 
    clearCanvas, 
    saveDiagram, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    nodes, 
    updateNodePositions, 
    selectedNodes, 
    deleteSelectedNodes 
  } = useDiagram();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleClearCanvas = () => {
    if (window.confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
      clearCanvas();
      setLastAction("Canvas cleared");
    }
  };

  const handleSave = () => {
    if (setStatus) setStatus("saving");
    
    try {
      // Save immediately instead of with a timeout
      const result = saveDiagram();
      
      // Show feedback message with current node count instead of result count
      const currentNodeCount = nodes.length;
      if (currentNodeCount > 0) {
        setSaveMessage(`Diagram saved! (${currentNodeCount} nodes)`);
      } else {
        setSaveMessage("Nothing to save");
      }
      
      if (setStatus) {
        setStatus("saved");
      }
      
      // Clear message after a short delay
      setTimeout(() => {
        setSaveMessage(null);
      }, 2000);
    } catch (err) {
      console.error("Error saving diagram:", err);
      setSaveMessage("Error saving. Please try again.");
      if (setStatus) setStatus("ready");
      
      // Clear error message
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };
  
  const handleUndo = () => {
    if (canUndo) {
      undo();
      setLastAction("Undo");
      if (setStatus) setStatus("ready");
    }
  };
  
  const handleRedo = () => {
    if (canRedo) {
      redo();
      setLastAction("Redo");
      if (setStatus) setStatus("ready");
    }
  };

  // New function to auto-align overlapping nodes
  const handleAutoAlign = () => {
    if (nodes.length < 2) return;

    // Group nodes by their approximate positions for rows and columns
    const rowGroups: { [key: number]: string[] } = {};
    const colGroups: { [key: number]: string[] } = {};
    const nodePositions = new Map();
    const nodeWidths = new Map();
    const nodeHeights = new Map();
    
    // Grid size for grouping nearby positions
    const gridSize = 40;
    
    // First pass: identify groups
    nodes.forEach(node => {
      // Store node positions and dimensions for reference
      nodePositions.set(node.id, node.position);
      
      // Determine node width (standard or wide)
      const isWideNode = node.type === 'eventStormingNode' && 
        (node.data?.nodeType === 'consistent-business-rule' || 
         node.data?.label === 'Consistent Business Rule');
      
      const width = isWideNode ? 240 : 120;
      const height = 120; // All nodes have the same height
      
      nodeWidths.set(node.id, width);
      nodeHeights.set(node.id, height);
      
      // Group by rows (y position)
      const rowKey = Math.round(node.position.y / gridSize) * gridSize;
      if (!rowGroups[rowKey]) rowGroups[rowKey] = [];
      rowGroups[rowKey].push(node.id);
      
      // Group by columns (x position)
      const colKey = Math.round(node.position.x / gridSize) * gridSize;
      if (!colGroups[colKey]) colGroups[colKey] = [];
      colGroups[colKey].push(node.id);
    });
    
    // Process row groups for horizontal alignment
    const updates: { id: string; position: { x: number, y: number } }[] = [];
    
    // Align nodes in each row
    Object.values(rowGroups).forEach(rowNodeIds => {
      if (rowNodeIds.length > 1) {
        // Sort nodes in the row by x position
        rowNodeIds.sort((a, b) => nodePositions.get(a).x - nodePositions.get(b).x);
        
        // Calculate the aligned y position for the row (average)
        let alignedY = rowNodeIds.reduce(
          (sum, id) => sum + nodePositions.get(id).y, 0
        ) / rowNodeIds.length;
        
        // Align all nodes to the same y position
        let lastRightEdge = -Infinity;
        rowNodeIds.forEach(id => {
          const pos = nodePositions.get(id);
          const width = nodeWidths.get(id);
          
          // Calculate x position ensuring no overlap with appropriate gap
          const newX = Math.max(pos.x, lastRightEdge + 2); // 2px gap
          
          updates.push({
            id,
            position: { 
              x: newX, 
              y: alignedY 
            }
          });
          
          // Update last right edge for next node
          lastRightEdge = newX + width;
        });
      }
    });
    
    // Align nodes in each column
    Object.values(colGroups).forEach(colNodeIds => {
      if (colNodeIds.length > 1) {
        // Sort nodes in the column by y position
        colNodeIds.sort((a, b) => nodePositions.get(a).y - nodePositions.get(b).y);
        
        // Calculate the aligned x position for the column (average)
        let alignedX = colNodeIds.reduce(
          (sum, id) => sum + nodePositions.get(id).x, 0
        ) / colNodeIds.length;
        
        // Align all nodes to the same x position
        let lastBottomEdge = -Infinity;
        colNodeIds.forEach(id => {
          const pos = nodePositions.get(id);
          const height = nodeHeights.get(id);
          
          // Calculate y position ensuring no overlap with appropriate gap
          const newY = Math.max(pos.y, lastBottomEdge + 2); // 2px gap
          
          // Find if this node is already in updates
          const existingUpdate = updates.find(u => u.id === id);
          if (existingUpdate) {
            // Update only the x position, keeping the already aligned y
            existingUpdate.position.x = alignedX;
          } else {
            updates.push({
              id,
              position: { 
                x: alignedX, 
                y: newY 
              }
            });
          }
          
          // Update last bottom edge for next node
          lastBottomEdge = newY + height;
        });
      }
    });
    
    // Apply all the updates
    if (updates.length > 0) {
      updateNodePositions(updates);
      setLastAction("Nodes auto-aligned");
    }
  };

  // Add keyboard event listener for shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+S or Command+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // Prevent browser's save dialog
        handleSave();
      }
      
      // Check for Ctrl+Z or Command+Z (Mac) for Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      }
      
      // Check for Ctrl+Y or Command+Y (Mac) or Ctrl+Shift+Z for Redo
      if ((event.ctrlKey || event.metaKey) && 
          ((event.key === 'y') || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        handleRedo();
      }
      
      // Check for Ctrl+G or Command+G for Auto-Align
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        handleAutoAlign();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, nodes]); // Add nodes as dependency

  // Handle delete button click
  const handleDelete = () => {
    if (selectedNodes.length > 0) {
      deleteSelectedNodes(selectedNodes);
      setLastAction(`Deleted ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''}`);
    }
  };

  return (
    <header className="header-bar">
      <div className="save-message-container">
        {saveMessage && <div className="save-message">{saveMessage}</div>}
        {lastAction && !saveMessage && <div className="action-message">{lastAction}</div>}
      </div>
      <div className="header-actions">
        <button
          className="header-icon-btn"
          title="Save to Local Storage (Ctrl+S)"
          aria-label="Save"
          onClick={handleSave}
        >
          <span role="img" aria-label="Save">💾</span>
        </button>
        <button
          className="header-icon-btn"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          onClick={handleUndo}
          disabled={!canUndo}
          style={!canUndo ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <span role="img" aria-label="Undo">↶</span>
        </button>
        <button
          className="header-icon-btn"
          title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          aria-label="Redo"
          onClick={handleRedo}
          disabled={!canRedo}
          style={!canRedo ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <span role="img" aria-label="Redo">↷</span>
        </button>
        <button
          className="header-icon-btn"
          title="Auto-Align Nodes (Ctrl+G)"
          aria-label="Auto-Align Nodes"
          onClick={handleAutoAlign}
        >
          <span role="img" aria-label="Auto-Align">📐</span>
        </button>
        
        {/* Add delete button */}
        <button
          className="header-icon-btn"
          title="Delete Selected (Delete)"
          aria-label="Delete Selected"
          onClick={handleDelete}
          disabled={selectedNodes.length === 0}
          style={selectedNodes.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <span role="img" aria-label="Delete">🗑️</span>
        </button>
        
        {/* Clear Canvas button */}
        <button
          className="header-icon-btn"
          title="Clear Canvas"
          aria-label="Clear Canvas"
          onClick={handleClearCanvas}
        >
          <span role="img" aria-label="Clear Canvas">🧹</span>
        </button>
      </div>
    </header>
  );
}

export default HeaderBar;
