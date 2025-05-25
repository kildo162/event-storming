import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

interface GroupNodeData {
  label: string;
  icon: string;
  color: string;
  textColor: string;
  childNodeIds: string[]; // IDs of nodes contained within this group
}

function GroupNode({ data, isConnectable, selected }: NodeProps<GroupNodeData>) {
  return (
    <div
      className={`group-node ${selected ? 'selected' : ''}`}
      style={{
        background: 'transparent',
        border: `2px dashed ${data.color}`,
        borderRadius: '8px',
        padding: '8px', // 8px padding around contained nodes
        position: 'relative',
        minWidth: '150px',
        minHeight: '150px',
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
          border: '2px solid #fff'
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
          border: '2px solid #fff'
        }}
        isConnectable={isConnectable}
      />
      
      {/* Group title */}
      <div className="group-header"
        style={{
          position: 'absolute',
          top: '-22px',
          left: '10px',
          background: data.color,
          color: data.textColor,
          padding: '0 8px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          fontSize: '12px',
          lineHeight: '20px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span style={{ fontSize: '14px' }}>{data.icon}</span>
        <span>{data.label}</span>
      </div>
    </div>
  );
}

export default memo(GroupNode);
