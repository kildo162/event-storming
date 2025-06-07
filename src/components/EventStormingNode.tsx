import React, { memo, useEffect, useRef, useState } from 'react';
import { NodeProps } from 'reactflow';
import AutoSizeLabel from './AutoSizeLabel';
import AutoSizeTextarea from './AutoSizeTextarea';
import { useDiagram } from '../features/diagram';

interface EventStormingNodeData {
  label: string;
  defaultLabel?: string; // Lưu tên mặc định của node
  icon: string;
  color: string;
  textColor: string;
  nodeType?: string;
  onLabelChange?: (id: string, newLabel: string) => void;
  isEdited?: boolean; // Đánh dấu node đã được chỉnh sửa
}

function EventStormingNode({ data, isConnectable, selected, id }: NodeProps<EventStormingNodeData>) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { updateNodeLabel } = useDiagram();

  // Determine if this is a Consistent Business Rule node
  const isWideNode = data.nodeType === "consistent-business-rule" ||
                    data.defaultLabel === "Consistent Business Rule";

  
  // Scroll into view when a new node is created and selected
  useEffect(() => {
    if (selected && nodeRef.current) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        nodeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 50);
    }
  }, [selected]);
  
  return (
    <div
      ref={nodeRef}
      className={`event-storming-node ${isWideNode ? 'wide-node' : ''} ${selected ? 'selected' : ''}`}
      style={{
        background: data.color,
        color: data.textColor,
        padding: '10px',
        borderRadius: '5px',
        minWidth: isWideNode ? '240px' : '120px',
        width: isWideNode ? '240px' : '120px',
        height: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: selected 
          ? '0 0 0 2px #2196f3, 0 2px 5px rgba(0,0,0,0.15)'
          : '0 2px 5px rgba(0,0,0,0.15)',
        position: 'relative', // For absolute positioned selection indicators
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Selection indicators - only show when selected */}
      {selected && (
        <>
          {/* Top-left corner */}
          <div className="selection-indicator top-left"></div>
          {/* Top-right corner */}
          <div className="selection-indicator top-right"></div>
          {/* Bottom-left corner */}
          <div className="selection-indicator bottom-left"></div>
          {/* Bottom-right corner */}
          <div className="selection-indicator bottom-right"></div>
        </>
      )}

      {isEditing ? (
        <AutoSizeTextarea
          value={editValue}
          maxWidth={isWideNode ? 220 : 100}
          maxHeight={100}
          textColor={data.textColor}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            const trimmedValue = editValue.trim();
            setIsEditing(false);

            // Always update the label when exiting edit mode
            if (!trimmedValue) {
              const defaultValue = data.defaultLabel || data.label;
              setEditValue(defaultValue);
              updateNodeLabel(id, defaultValue);
            } else {
              // Update even if text hasn't changed, to ensure saving
              updateNodeLabel(id, trimmedValue);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const trimmedValue = editValue.trim();
              setIsEditing(false);
              
              // Always save on Enter
              if (!trimmedValue) {
                const defaultValue = data.defaultLabel || data.label;
                setEditValue(defaultValue);
                updateNodeLabel(id, defaultValue);
              } else {
                updateNodeLabel(id, trimmedValue);
              }
            }
            if (e.key === 'Escape') {
              // Revert changes on Escape
              setEditValue(data.label);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <>
          {!data.isEdited && <div style={{ fontSize: '26px', marginBottom: '5px' }}>{data.icon}</div>}
          <AutoSizeLabel
            text={data.label}
            maxWidth={isWideNode ? 220 : 100}
            maxHeight={data.isEdited ? 110 : 80}
            onDoubleClick={() => {
              setIsEditing(true);
              setEditValue(data.label);
            }}
          />
        </>
      )}
    </div>
  );
}

export default memo(EventStormingNode);
