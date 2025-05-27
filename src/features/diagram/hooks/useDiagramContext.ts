import { useContext } from 'react';
import { DiagramContext } from '../DiagramContext';
import type { DiagramContextProps } from '../types';

export function useDiagram(): DiagramContextProps {
  const context = useContext(DiagramContext);
  
  if (context === undefined) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }
  
  return context;
}