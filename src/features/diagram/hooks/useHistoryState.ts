import { useCallback, useReducer } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type HistoryAction<T> = 
  | { type: 'PUSH'; newPresent: T }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; newPresent: T }
  | { type: 'CLEAR' };

function historyReducer<T>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
  const { past, present, future } = state;

  switch (action.type) {
    case 'PUSH':
      return {
        past: [...past, present],
        present: action.newPresent,
        future: []
      };
    case 'UNDO':
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      };
    case 'REDO':
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture
      };
    case 'RESET':
      return {
        past: [],
        present: action.newPresent,
        future: []
      };
    case 'CLEAR':
      return {
        past: [],
        present,
        future: []
      };
    default:
      return state;
  }
}

export function useHistoryState<T>(initialPresent: T) {
  const [state, dispatch] = useReducer(historyReducer<T>, {
    past: [],
    present: initialPresent,
    future: []
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: 'UNDO' });
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: 'REDO' });
    }
  }, [canRedo]);

  const push = useCallback((newPresent: T) => {
    dispatch({ type: 'PUSH', newPresent });
  }, []);

  const reset = useCallback((newPresent: T) => {
    dispatch({ type: 'RESET', newPresent });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return {
    state: state.present,
    push,
    undo,
    redo,
    reset,
    clear,
    canUndo,
    canRedo,
    history: state
  };
}
