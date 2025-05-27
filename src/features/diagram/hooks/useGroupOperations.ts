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
         node.data?.defaultLabel === 'Consistent Business Rule') ? 240 : 120;
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
    const outerPadding = 40; // Padding lớn hơn để group không chạm vào node
    const headerHeight = 8; // Chiều cao của header

    // Thêm padding vào kích thước group
    const groupX = minX - outerPadding;
    const groupY = minY - outerPadding - headerHeight;
    const groupWidth = (maxX - minX) + (outerPadding * 2.5); // Thêm padding nhiều hơn ở bên phải
    const groupHeight = (maxY - minY) + (outerPadding * 2) + headerHeight;

    const id = `group_${nodeIdCounter}`;
    const newGroup = {
      id,
      type: 'groupNode',
      data: {
        label: 'Behavior',
        icon: '🗂️',
        color: '#585858',
        textColor: '#ffffff',
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
