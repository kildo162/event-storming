import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

interface GroupNodeData {
  label: string;
  icon: string;
  color: string;
  textColor: string;
  childNodeIds: string[];
}

function GroupNode({ data, isConnectable, selected, style: nodeStyle }: NodeProps<GroupNodeData> & { style?: React.CSSProperties }) {

  return (
    <div
      className={`group-node ${selected ? 'selected' : ''}`}
      style={{
        background: 'transparent',
        border: `2px dashed ${data.color}`,
        borderRadius: '8px',
        padding: '20px',
        position: 'relative',
        minWidth: '180px',
        minHeight: '140px',
        boxSizing: 'border-box',
        ...nodeStyle, // Áp dụng style từ node props
      }}
    >
      {/* Selection indicators - only show when selected */}
      {selected && (
        <>
          <div className="selection-indicator top-left"></div>
          <div className="selection-indicator top-right"></div>
          <div className="selection-indicator bottom-left"></div>
          <div className="selection-indicator bottom-right"></div>
        </>
      )}
      
      {/* Left connection handle */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{
          background: data.color,
          width: '12px',
          height: '12px',
          border: '2px solid #fff',
          opacity: 0.8,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        isConnectable={isConnectable}
      />
      
      {/* Right connection handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: data.color,
          width: '12px',
          height: '12px',
          border: '2px solid #fff',
          opacity: 0.8,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        isConnectable={isConnectable}
      />
      
      {/* Group title */}
      <div className="group-header"
        style={{
          position: 'absolute',
          top: '-28px',
          left: '10px',
          background: data.color,
          color: data.textColor,
          padding: '4px 12px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          fontSize: '13px',
          lineHeight: '20px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <span style={{ fontSize: '14px' }}>{data.icon}</span>
        <span>{data.label}</span>
      </div>
    </div>
  );
}

export default memo(GroupNode);
