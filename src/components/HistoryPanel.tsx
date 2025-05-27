import React from 'react';
import { useDiagram } from '../features/diagram';

interface HistoryPanelProps {
  onClose: () => void;
}

function HistoryPanel({ onClose }: HistoryPanelProps) {
  const { canUndo, canRedo, undo, redo } = useDiagram();
  // We'll use the global variable to get history info
  const historyContext = (window as any).__DIAGRAM_HISTORY__;
  
  const getActionDescription = (index: number, isPast: boolean) => {
    // In a real implementation, you'd have more detailed action descriptions
    return `Action ${index + 1}: ${isPast ? "Completed" : "Undone"}`;
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <div 
      className="history-panel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="history-panel-header">
        <h3>History</h3>
        <button 
          className="history-close-btn"
          onClick={onClose}
          aria-label="Close history panel"
        >
          ✕
        </button>
      </div>
      
      <div className="history-panel-content">
        {historyContext && historyContext.history && (
          <>
            <div className="history-section">
              <h4>Past Actions</h4>
              <ul className="history-list">
                {historyContext.history.past.length === 0 ? (
                  <li className="history-item-empty">No past actions</li>
                ) : (
                  historyContext.history.past.map((_: any, index: number) => (
                    <li key={`past-${index}`} className="history-item">
                      {getActionDescription(index, true)}
                    </li>
                  ))
                )}
              </ul>
            </div>
            
            <div className="history-section">
              <h4>Current State</h4>
              <div className="history-current">
                <span>Nodes: {(historyContext.history.present?.nodes || []).length}</span>
              </div>
            </div>
            
            <div className="history-section">
              <h4>Future Actions (Undone)</h4>
              <ul className="history-list">
                {historyContext.history.future.length === 0 ? (
                  <li className="history-item-empty">No future actions</li>
                ) : (
                  historyContext.history.future.map((_: any, index: number) => (
                    <li key={`future-${index}`} className="history-item">
                      {getActionDescription(index, false)}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
        
        {(!historyContext || !historyContext.history) && (
          <p className="history-no-data">History data not available</p>
        )}
      </div>
      
      <div className="history-panel-footer">
        <button 
          className="history-btn" 
          onClick={undo}
          disabled={!canUndo}
        >
          Undo
        </button>
        <button 
          className="history-btn"
          onClick={redo}
          disabled={!canRedo}
        >
          Redo
        </button>
      </div>
    </div>
  );
}

export default HistoryPanel;
