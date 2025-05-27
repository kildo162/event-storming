import React, { memo } from 'react';
import { useAutoFontSize } from '../features/diagram/hooks/useAutoFontSize';

interface AutoSizeTextareaProps {
  value: string;
  maxWidth: number;
  maxHeight: number;
  textColor: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const AutoSizeTextarea = memo(({
  value,
  maxWidth,
  maxHeight,
  textColor,
  onChange,
  onBlur,
  onKeyDown
}: AutoSizeTextareaProps) => {
  const { fontSize, measureRef } = useAutoFontSize({
    text: value,
    maxWidth,
    maxHeight,
    maxFontSize: 16,
    minFontSize: 10
  });

  return (
    <>
      <textarea
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        style={{
          width: 'calc(100% - 16px)',
          height: 'calc(100% - 16px)',
          margin: '8px',
          padding: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '4px',
          color: textColor,
          fontFamily: 'inherit',
          fontSize: `${fontSize}px`,
          fontWeight: 500,
          resize: 'none',
          outline: 'none',
          textAlign: 'center',
          lineHeight: '1.2'
        }}
        autoFocus
      />
      <div ref={measureRef} style={{ position: 'absolute', visibility: 'hidden' }} />
    </>
  );
});

AutoSizeTextarea.displayName = 'AutoSizeTextarea';

export default AutoSizeTextarea;