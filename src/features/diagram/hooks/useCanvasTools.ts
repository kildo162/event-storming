import { useState, useCallback, useEffect } from 'react';
import { SelectionMode, PanOnScrollMode } from 'reactflow';

export type CanvasTool = 'select' | 'hand';

interface CanvasToolConfig {
  selectionOnDrag: boolean;
  panOnDrag: boolean;
  panOnScroll: boolean;
  panOnScrollMode: PanOnScrollMode | undefined;
  selectionMode: SelectionMode;
  selectionKeyCode: string | null;
  multiSelectionKeyCode: string;
  deleteKeyCode: string;
}

export function useCanvasTools() {
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');

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

  // Determine configuration for ReactFlow based on active tool
  const getToolConfig = useCallback((): CanvasToolConfig => {
    if (activeTool === 'select') {
      return {
        selectionOnDrag: true,
        panOnDrag: false,
        panOnScroll: false,
        panOnScrollMode: undefined,
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
        panOnScrollMode: PanOnScrollMode.Free,
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

  return {
    activeTool,
    setActiveTool,
    getToolConfig,
    toggleTool
  };
}