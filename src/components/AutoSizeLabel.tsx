import React, { memo } from 'react';
import { useAutoFontSize } from '../features/diagram/hooks/useAutoFontSize';

interface AutoSizeLabelProps {
  text: string;
  maxWidth: number;
  maxHeight: number;
  onDoubleClick?: () => void;
}

const AutoSizeLabel = memo(({ text, maxWidth, maxHeight, onDoubleClick }: AutoSizeLabelProps) => {
  const { fontSize, measureRef } = useAutoFontSize({
    text,
    maxWidth,
    maxHeight,
    maxFontSize: 16,
    minFontSize: 10
  });

  return (
    <div
      style={{
        textAlign: 'center',
        fontWeight: 500,
        wordWrap: 'break-word',
        fontSize: `${fontSize}px`,
        width: '100%',
        cursor: 'text',
        transition: 'font-size 0.2s ease'
      }}
      onDoubleClick={onDoubleClick}
    >
      {text}
      <div ref={measureRef} style={{ position: 'absolute', visibility: 'hidden' }} />
    </div>
  );
});

AutoSizeLabel.displayName = 'AutoSizeLabel';

export default AutoSizeLabel;