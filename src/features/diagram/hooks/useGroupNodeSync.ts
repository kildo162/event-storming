import { useCallback } from 'react';
import { Node } from 'reactflow';

export function useGroupNodeSync() {
  const updateGroupBounds = useCallback((
    nodes: Node[],
    groupNode: Node,
    childNodeIds: string[]
  ) => {
    // Lọc ra các node con thuộc group
    const childNodes = nodes.filter(node => childNodeIds.includes(node.id));
    
    if (childNodes.length === 0) return null;

    // Tính toán kích thước và vị trí dựa trên các node con
    const nodePositions = childNodes.map(node => {
      const width = node.type === 'eventStormingNode' &&
        (node.data?.nodeType === 'consistent-business-rule' ||
         node.data?.label === 'Consistent Business Rule') ? 240 : 120;
      const height = 120;
      
      return {
        x: node.position.x,
        y: node.position.y,
        width,
        height
      };
    });

    // Tính toán bounds
    const minX = Math.min(...nodePositions.map(pos => pos.x));
    const minY = Math.min(...nodePositions.map(pos => pos.y));
    const maxX = Math.max(...nodePositions.map(pos => pos.x + pos.width));
    const maxY = Math.max(...nodePositions.map(pos => pos.y + pos.height));

    // Tính toán kích thước và vị trí
    const horizontalPadding = 40;
    const verticalPadding = 32;
    const headerOffset = 28; // Chiều cao của header

    return {
      position: {
        x: minX - horizontalPadding,
        y: minY - verticalPadding - headerOffset / 2, // Chỉ dịch lên một nửa headerOffset
      },
      style: {
        width: (maxX - minX) + (horizontalPadding * 2),
        height: (maxY - minY) + (verticalPadding * 2),
      }
    };
  }, []);

  const syncGroupNodes = useCallback((
    nodes: Node[],
    setNodes: (nodes: Node[]) => void
  ) => {
    const updatedNodes = [...nodes];
    let hasUpdates = false;

    // Tìm và cập nhật tất cả các group nodes
    nodes.forEach((node, index) => {
      if (node.type === 'groupNode' && node.data?.childNodeIds) {
        const newBounds = updateGroupBounds(nodes, node, node.data.childNodeIds);
        if (newBounds) {
          updatedNodes[index] = {
            ...node,
            position: newBounds.position,
            style: {
              ...node.style,
              ...newBounds.style,
            }
          };
          hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
      setNodes(updatedNodes);
    }
  }, [updateGroupBounds]);

  return {
    syncGroupNodes,
    updateGroupBounds
  };
}