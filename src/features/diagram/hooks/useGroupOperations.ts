import { useCallback } from 'react';
import { Node } from 'reactflow';

export function useGroupOperations({
  nodes, setNodes, nodeIdCounter, setNodeIdCounter, pushHistory
}: {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  nodeIdCounter: number;
  setNodeIdCounter: React.Dispatch<React.SetStateAction<number>>;
  pushHistory: (state: any) => void;
}) {
  // Create behavior group
  const createBehaviorGroup = useCallback(() => {
    // Find selected nodes
    const selectedNodes = nodes.filter((n: Node) => n.selected);
    if (selectedNodes.length < 2) {
      console.warn("Need at least 2 nodes to create a behavior group");
      return null;
    }
    // Calculate bounding box of selected nodes
    const nodePositions = selectedNodes.map(node => {
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
    const minX = Math.min(...nodePositions.map(pos => pos.x));
    const minY = Math.min(...nodePositions.map(pos => pos.y));
    const maxX = Math.max(...nodePositions.map(pos => pos.x + pos.width));
    const maxY = Math.max(...nodePositions.map(pos => pos.y + pos.height));
    const padding = 16;
    const groupX = minX - padding;
    const groupY = minY - padding - 24; // More space for header/title
    const groupWidth = (maxX - minX) + padding * 2;
    const groupHeight = (maxY - minY) + padding * 2 + 24; // Add space for header

    const id = `group_${nodeIdCounter}`;
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
        x: groupX,
        y: groupY,
      },
      style: {
        width: groupWidth,
        height: groupHeight,
      },
      selected: true,
      zIndex: -1,
    };
    setNodes((prevNodes: Node[]) => [...prevNodes, newGroup]);
    setNodeIdCounter((prev: number) => prev + 1);
    setTimeout(() => {
      pushHistory({
        nodes: [...nodes, newGroup],
        edges: [], // edges không thay đổi ở đây
        nodeIdCounter: nodeIdCounter + 1
      });
    }, 0);
    return id;
  }, [nodes, setNodes, nodeIdCounter, setNodeIdCounter, pushHistory]);

  return {
    createBehaviorGroup,
  };
}
