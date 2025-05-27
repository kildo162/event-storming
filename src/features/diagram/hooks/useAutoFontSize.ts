import { useState, useEffect, useRef } from 'react';

interface AutoFontSizeOptions {
  text: string;
  maxWidth: number;
  maxHeight: number;
  maxFontSize: number;
  minFontSize: number;
}

export function useAutoFontSize({
  text,
  maxWidth,
  maxHeight,
  maxFontSize = 16,
  minFontSize = 8
}: AutoFontSizeOptions) {
  const [fontSize, setFontSize] = useState(maxFontSize);
  const measureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!measureRef.current) return;

    // Tạo element tạm để đo kích thước text
    const measure = measureRef.current;
    measure.style.visibility = 'hidden';
    measure.style.position = 'absolute';
    measure.style.width = 'auto';
    measure.style.height = 'auto';
    measure.style.whiteSpace = 'pre-wrap';
    measure.style.wordBreak = 'break-word';
    measure.textContent = text;

    // Binary search để tìm fontSize phù hợp
    let low = minFontSize;
    let high = maxFontSize;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      measure.style.fontSize = `${mid}px`;

      const fits = measure.scrollWidth <= maxWidth && measure.scrollHeight <= maxHeight;
      
      if (fits) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // High là fontSize lớn nhất mà vẫn fit
    setFontSize(Math.max(minFontSize, high));

  }, [text, maxWidth, maxHeight, maxFontSize, minFontSize]);

  return { fontSize, measureRef };
}