import { Node, Edge, XYPosition } from 'reactflow';
import { NodeConfig } from './hooks/useDiagramState';

export interface DiagramContextProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  addNode: (nodeConfig: NodeConfig, position?: XYPosition) => string;
  clearCanvas: () => void;
  saveDiagram: () => { nodes: Node[], edges: Edge[], nodeIdCounter: number };
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  updateNodePositions: (updates: { id: string; position: { x: number; y: number } }[]) => void;
  selectedNodes: Node[];
  deleteSelectedNodes: (nodes: Node[]) => void;
  duplicateSelectedNodes: (nodes: Node[]) => string[] | undefined;
  createBehaviorGroup: () => string | null;
  updateNodeLabel: (nodeId: string, newLabel: string) => void;
}