import { useCallback } from 'react';
import { Node } from 'reactflow';

// Snap grid settings
const GRID_SIZE = 20;
const SNAP_DISTANCE = 15; // Maximum distance for magnetic snapping

export function useNodeSnapping({
  nodes,
  updateNodePositions
}: {
  nodes: Node[];
  updateNodePositions: (updates: { id: string; position: { x: number; y: number } }[]) => void;
}) {
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
      
      // Check horizontal snapping
      [
        { edge: nodeLeft, otherEdge: otherLeft, type: 'left-left' },
        { edge: nodeRight, otherEdge: otherRight, type: 'right-right' },
        { edge: nodeLeft, otherEdge: otherRight, type: 'left-right' },
        { edge: nodeRight, otherEdge: otherLeft, type: 'right-left' },
        { edge: nodeCenterX, otherEdge: otherCenterX, type: 'center-center-x' }
      ].forEach(({ edge, otherEdge }) => {
        const distance = Math.abs(edge - otherEdge);
        if (distance < bestSnapDistanceX) {
          bestSnapDistanceX = distance;
          snappedX = newX + (otherEdge - edge);
        }
      });
      
      // Check vertical snapping
      [
        { edge: nodeTop, otherEdge: otherTop, type: 'top-top' },
        { edge: nodeBottom, otherEdge: otherBottom, type: 'bottom-bottom' },
        { edge: nodeTop, otherEdge: otherBottom, type: 'top-bottom' },
        { edge: nodeBottom, otherEdge: otherTop, type: 'bottom-top' },
        { edge: nodeCenterY, otherEdge: otherCenterY, type: 'center-center-y' }
      ].forEach(({ edge, otherEdge }) => {
        const distance = Math.abs(edge - otherEdge);
        if (distance < bestSnapDistanceY) {
          bestSnapDistanceY = distance;
          snappedY = newY + (otherEdge - edge);
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

  return { onNodeDragStop };
}