import SideBar from "./components/SideBar";
import Canvas from "./components/Canvas";
import HeaderBar from "./components/HeaderBar";
import StatusBar from "./components/StatusBar";
import React, { useState } from "react";
import { useTheme } from "./features/theme/useTheme";
import { DiagramProvider } from "./features/diagram/DiagramContext";
import { ReactFlowProvider } from "reactflow";

type StatusType = "ready" | "saving" | "saved";

function App() {
  const { dark, toggleTheme } = useTheme();
  const [status, setStatus] = useState<StatusType>("ready");

  return (
    <ReactFlowProvider>
      <DiagramProvider>
        <div className="App">
          <SideBar dark={dark} toggleTheme={toggleTheme} />
          <div className="main-area">
            <HeaderBar setStatus={setStatus} />
            <div className="canvas-area">
              <Canvas />
            </div>
            <StatusBar status={status} setStatus={setStatus} />
          </div>
        </div>
      </DiagramProvider>
    </ReactFlowProvider>
  );
}

export default App;