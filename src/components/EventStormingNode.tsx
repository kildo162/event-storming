import React, { memo, useEffect, useRef } from 'react';
import { NodeProps } from 'reactflow';

interface EventStormingNodeData {
  label: string;
  icon: string;
  color: string;
  textColor: string;
  nodeType?: string;
}

function EventStormingNode({ data, isConnectable, selected, id }: NodeProps<EventStormingNodeData>) {
  // Reference to the node element
  const nodeRef = useRef<HTMLDivElement>(null);
  
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

  // Determine if this is a Consistent Business Rule node
  const isWideNode = data.label === "Consistent Business Rule" || 
                    data.nodeType === "consistent-business-rule";
  
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

      <div style={{ fontSize: '26px', marginBottom: '5px' }}>{data.icon}</div>
      <div style={{ 
        textAlign: 'center', 
        fontWeight: 500,
        wordWrap: 'break-word',
        maxWidth: isWideNode ? '220px' : '100px' 
      }}>
        {data.label}
      </div>
    </div>
  );
}

export default memo(EventStormingNode);
