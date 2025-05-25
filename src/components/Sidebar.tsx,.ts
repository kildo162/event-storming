import React, { useState, useEffect } from 'react';
import COMPONENTS from './components';
import NodeBox from './NodeBox';
const Sidebar = ({
  onDragStart,
  onModeChange
}) => {
  // Bỏ collapse và resize, sidebar luôn rộng 300px
  const width = 300;
  const [mode, setMode] = useState('select'); // 'select' | 'pan'

  // Keyboard shortcut: M to toggle mode
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'm' || e.key === 'M') {
        setMode(prev => {
          const next = prev === 'select' ? 'pan' : 'select';
          if (onModeChange) onModeChange(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onModeChange]);

  // Sidebar width logic
  const sidebarWidth = width;

  // Tách nhóm node
  const MAIN_TYPES = ['event', 'command', 'aggregate', 'actor', 'ui'];
  const mainNodes = COMPONENTS.filter(c => MAIN_TYPES.includes(c.type));
  const supportNodes = COMPONENTS.filter(c => !MAIN_TYPES.includes(c.type));

  // Hàm thêm node vào canvas khi click
  const handleAddNode = component => {
    if (typeof window !== 'undefined') {
      // Tìm node đang được chọn trên canvas
      const selectedNode = document.querySelector('.react-flow__node.selected');
      let clientX, clientY;
      if (selectedNode) {
        // Lấy bounding box của node đang chọn
        const rect = selectedNode.getBoundingClientRect();
        // Đặt node mới bên phải node đang chọn (cách 40px)
        clientX = rect.right + 40;
        clientY = rect.top + rect.height / 2;
      } else {
        // Nếu không có node nào được chọn, đặt node ở giữa canvas hiện tại
        const canvas = document.querySelector('.react-flow__viewport')?.parentElement;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          clientX = rect.left + rect.width / 2;
          clientY = rect.top + rect.height / 2;
        } else {
          // fallback vị trí mặc định
          clientX = 350;
          clientY = 100;
        }
      }
      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY,
        dataTransfer: new DataTransfer()
      });
      event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
      const canvas = document.querySelector('.react-flow__viewport')?.parentElement;
      if (canvas) {
        canvas.dispatchEvent(event);
      }
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: sidebarWidth,
      minWidth: sidebarWidth,
      maxWidth: sidebarWidth,
      background: 'linear-gradient(180deg, #23272f 0%, #2c313a 100%)',
      borderRight: '1.5px solid #222',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      boxShadow: '2px 0 8px #0002',
      transition: 'width 0.15s',
      position: 'relative',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontWeight: 700,
      fontSize: 18,
      letterSpacing: 1,
      padding: '0 0 18px 24px',
      borderBottom: '1px solid #333',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 48,
      userSelect: 'none',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      color: '#FFA500'
    }
  }, "\u26A1"), 'ES IDE'), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMode(prev => {
      const next = prev === 'select' ? 'pan' : 'select';
      if (onModeChange) onModeChange(next);
      return next;
    }),
    style: {
      background: mode === 'pan' ? '#FFA500' : '#23272f',
      color: mode === 'pan' ? '#23272f' : '#FFA500',
      border: '1px solid #FFA500',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 14,
      padding: '4px 12px',
      cursor: 'pointer',
      marginRight: 8,
      transition: 'background 0.2s, color 0.2s',
      outline: 'none'
    },
    title: "Chuy\u1EC3n ch\u1EBF \u0111\u1ED9 (M)"
  }, mode === 'select' ? 'Select' : 'Pan')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#FFA500',
      fontWeight: 700,
      fontSize: 13,
      margin: '0 0 8px 4px',
      letterSpacing: 1
    }
  }, "Ch\xEDnh"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
      gap: '12px'
    }
  }, mainNodes.map(c => /*#__PURE__*/React.createElement(NodeBox, {
    key: c.type,
    icon: c.icon,
    label: c.label,
    color: c.color,
    border: c.border,
    onDragStart: e => onDragStart(e, c),
    onClick: () => handleAddNode(c),
    draggable: true,
    title: c.label
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#888',
      fontWeight: 700,
      fontSize: 13,
      margin: '0 0 8px 4px',
      letterSpacing: 1
    }
  }, "Support"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
      gap: '12px'
    }
  }, supportNodes.map(c => /*#__PURE__*/React.createElement(NodeBox, {
    key: c.type,
    icon: c.icon,
    label: c.label,
    color: c.color,
    border: c.border,
    onDragStart: e => onDragStart(e, c),
    onClick: () => handleAddNode(c),
    draggable: true,
    title: c.label
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid #333',
      margin: '0 0 0 0',
      padding: '12px 0 0 0',
      color: '#888',
      fontSize: 12,
      textAlign: 'center',
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#FFA500',
      fontWeight: 700
    }
  }, "github.com/your-org")));
};
export default Sidebar;