import React, { useEffect, useState } from "react";
import { useDiagram } from "../features/diagram/DiagramContext";
import HistoryPanel from "./HistoryPanel";

type StatusType = "ready" | "saving" | "saved";

interface StatusBarProps {
  status?: StatusType;
  setStatus?: (status: StatusType) => void;
}

function StatusBar({ status = "ready", setStatus }: StatusBarProps) {
  const { nodes } = useDiagram();
  const [displayStatus, setDisplayStatus] = useState<StatusType>(status);
  const [showHistory, setShowHistory] = useState(false);

  // Handle automatic transition from "saved" back to "ready" after 3 seconds
  useEffect(() => {
    setDisplayStatus(status);

    if (status === "saved") {
      const timer = setTimeout(() => {
        setDisplayStatus("ready");
        if (setStatus) setStatus("ready");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, setStatus]);

  return (
    <footer className="status-bar">
      <div className="status-left">
        <span className={`status-text status-${displayStatus}`}>
          {displayStatus === "ready" && "Ready"}
          {displayStatus === "saving" && "Saving..."}
          {displayStatus === "saved" && "Saved"}
        </span>
      </div>

      <div className="status-center">
        <span className="status-node-count" title="Total nodes on diagram">
          <span className="node-count-label">Nodes:</span> {nodes.length}
        </span>
      </div>

      <div className="status-right">
        <button
          className="status-history-btn"
          title="View history"
          onClick={() => setShowHistory(!showHistory)}
        >
          <span role="img" aria-label="History">
            📋
          </span>
        </button>
      </div>

      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </footer>
  );
}

export default StatusBar;
