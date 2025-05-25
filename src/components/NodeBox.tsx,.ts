// src/components/NodeBox.jsx
import React from 'react';
const NodeBox = ({
  icon,
  label,
  color,
  border,
  onDragStart,
  onClick,
  draggable = true,
  title,
  style = {},
  children
}) => /*#__PURE__*/React.createElement("div", {
  onDragStart: onDragStart,
  onClick: onClick,
  draggable: draggable,
  style: {
    background: color,
    border: `2px solid ${border}`,
    borderRadius: 6,
    height: 64,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'grab',
    userSelect: 'none',
    boxShadow: '0 1px 6px #0002',
    padding: '6px 4px',
    whiteSpace: 'nowrap',
    color: border === '#fff' ? '#fff' : '#222',
    transition: 'all 0.2s',
    gap: 4,
    ...style
  },
  title: title || label
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 28,
    marginBottom: 4
  }
}, icon), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 1.2
  }
}, label), children);
export default NodeBox;