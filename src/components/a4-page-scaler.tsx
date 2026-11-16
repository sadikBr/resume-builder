"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// A4 at 96 DPI (CSS px): 210mm x 297mm
export const A4_WIDTH_PX = 793.7;
export const A4_HEIGHT_PX = 1122.5;

/**
 * Renders its child (one or more 210mm-wide pages) scaled down to fit the
 * available width, without ever changing the pages' real layout. The PDF
 * export removes the transform (see `data-a4-scaler`) so it captures each page
 * at full size.
 */
export default function A4PageScaler({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT_PX);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const update = () => {
      const width = container.clientWidth;
      if (width > 0) setScale(Math.min(1, width / A4_WIDTH_PX));
      // offsetHeight ignores the transform, so this is the unscaled height.
      setContentHeight(content.offsetHeight || A4_HEIGHT_PX);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="relative mx-auto overflow-hidden"
        style={{ width: A4_WIDTH_PX * scale, height: contentHeight * scale }}
      >
        <div
          ref={contentRef}
          data-a4-scaler
          className="absolute top-0 left-0 origin-top-left"
          style={
            {
              transform: `scale(${scale})`,
              // Keeps hairlines one screen pixel thick at any scale (see resume-preview).
              "--hairline": `${1 / scale}px`,
            } as CSSProperties
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
