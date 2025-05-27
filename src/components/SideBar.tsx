import React from "react";
import { useDiagram } from "../features/diagram";

// Các shape theo nhóm như trong overview.md kèm màu sắc
const masterShapes = [
  { name: "Actor", icon: "👤", color: "#ffd100" }, // màu vàng
  { name: "Action", icon: "⚡", color: "#36b4ff" }, // màu xanh da trời
  { name: "Read Model", icon: "📄", color: "#66cc66" }, // màu xanh lá
  { name: "Consistent Business Rule", icon: "✅", color: "#aa55ff" }, // màu tím
  { name: "Domain Event", icon: "📢", color: "#ff8e50" }, // màu cam
];

const supportShapes = [
  { name: "External System", icon: "🌐", color: "#98b0fe" }, // màu xanh nhạt
  { name: "Hotspot", icon: "🔥", color: "#ff5050" }, // màu đỏ
  { name: "Opportunity", icon: "💡", color: "#fce588" }, // màu vàng nhạt
  { name: "UI", icon: "🖥️", color: "#8ce8ff" }, // màu xanh dương nhạt
  { name: "Eventually Consistent Business Rule", icon: "⏳", color: "#d0a8ff" }, // màu tím nhạt
];

const otherShapes = [
  { name: "Behavior (Group Node)", icon: "🗂️", color: "#e0e0e0", isGroup: true }, // Group type flag
  { name: "Pivotal Event", icon: "⭐", color: "#ffdd88" },
  { name: "Arrow", icon: "➡️", color: "#888888" },
];

type SideBarProps = {
  dark: boolean;
  toggleTheme: () => void;
};

function SideBar({ dark, toggleTheme }: SideBarProps) {
  const { addNode, selectedNodes, createBehaviorGroup } = useDiagram();
  
  const handleShapeClick = (shape: { name: string; icon: string; color: string; isGroup?: boolean }) => {
    // Special handling for Behavior Group
    if (shape.isGroup) {
      if (selectedNodes.length >= 2) {
        createBehaviorGroup();
      } else {
        // Show a message that at least 2 nodes must be selected
        alert("Please select at least 2 nodes to create a behavior group");
      }
      return;
    }
    
    // Normal handling for other node types
    const nodeType = shape.name.toLowerCase().replace(/ /g, '-');
    
    addNode({
      name: shape.name,
      icon: shape.icon,
      color: shape.color,
      textColor: getContrastColor(shape.color),
      nodeType: nodeType,
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-title" title="Event Storming Tool">Event Storming Tool</div>

      <div style={{ width: "100%" }}>
        <div className="sidebar-group-label" title="Các node chính trong mô hình">Master</div>
        <div className="sidebar-shape-grid">
          {masterShapes.map((shape) => (
            <button
              key={shape.name}
              title={shape.name}
              className="sidebar-shape-btn"
              aria-label={shape.name}
              style={{ 
                backgroundColor: shape.color,
                color: getContrastColor(shape.color),
              }}
              onClick={() => handleShapeClick(shape)}
            >
              {shape.icon}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", marginTop: 18 }}>
        <div className="sidebar-group-label" title="Các node hỗ trợ, bổ sung">Support</div>
        <div className="sidebar-shape-grid">
          {supportShapes.map((shape) => (
            <button
              key={shape.name}
              title={shape.name}
              className="sidebar-shape-btn"
              aria-label={shape.name}
              style={{ 
                backgroundColor: shape.color,
                color: getContrastColor(shape.color),
              }}
              onClick={() => handleShapeClick(shape)}
            >
              {shape.icon}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", marginTop: 18 }}>
        <div className="sidebar-group-label" title="Các node khác">Other</div>
        <div className="sidebar-shape-grid">
          {otherShapes.map((shape) => (
            <button
              key={shape.name}
              title={shape.name}
              className="sidebar-shape-btn"
              aria-label={shape.name}
              style={{ 
                backgroundColor: shape.color,
                color: getContrastColor(shape.color),
              }}
              onClick={() => handleShapeClick(shape)}
            >
              {shape.icon}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <button
        className="header-icon-btn"
        style={{ marginTop: 16 }}
        title={dark ? "Chuyển sang Light mode" : "Chuyển sang Dark mode"}
        aria-label={dark ? "Chuyển sang Light mode" : "Chuyển sang Dark mode"}
        onClick={toggleTheme}
      >
        {dark ? (
          <span role="img" aria-label="Light mode">
            🌞
          </span>
        ) : (
          <span role="img" aria-label="Dark mode">
            🌙
          </span>
        )}
      </button>
    </aside>
  );
}

// Hàm đổi màu text tùy theo màu nền để đảm bảo độ tương phản
function getContrastColor(hexColor: string): string {
  // Chuyển màu hex sang RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Tính độ sáng (theo công thức YIQ)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Đổi màu chữ: đen nếu nền sáng, trắng nếu nền tối
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

export default SideBar;