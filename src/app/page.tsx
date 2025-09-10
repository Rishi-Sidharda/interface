"use client";
import { useEffect, useRef, useState } from "react";
import createDomTree from "../scripts/domtree";

export default function ResizableColumns() {
  const [leftWidth, setLeftWidth] = useState(20); // initial % for left
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);

  const [html, setHtml] = useState(`
    <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:24px; background:#f6f7fb; min-height:240px;">
      <h1 style="color:#0f172a; margin:0 0 8px 0;">Hello — editable canvas</h1>
      <p style="margin:0 0 12px 0; color:#334155;">Click any element to select it. Inline styles are preserved.</p>
      <button id="cta" style="padding:8px 12px; border-radius:8px; background:#7c3aed; color:white; border:none;">Click me</button>
      <div style="margin-top:16px; display:flex; gap:8px;">
        <div style="width:120px; height:80px; background:#ef4444; border-radius:6px;"></div>
        <div style="width:120px; height:80px; background:#10b981; border-radius:6px;"></div>
        <div style="width:120px; height:80px; background:#10b981; border-radius:6px;"></div>
      </div>
    </div>
  `);

  const minWidth = 15;
  const maxWidth = 30;

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;

    const screenWidth = window.innerWidth;
    let newLeftWidth = (e.clientX / screenWidth) * 100;

    // Keep within 15% - 45% to avoid breaking layout
    if (newLeftWidth < minWidth) newLeftWidth = minWidth;
    if (newLeftWidth > maxWidth) newLeftWidth = maxWidth;

    setLeftWidth(newLeftWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div>
      <div className="absolute top-0 left-0 bg-neutral-950 w-screen h-screen flex items-center justify-center z-0">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div
        className="flex w-screen h-screen select-none z-10 relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Left panel */}
        <div
          className={`bg-amber-100 shadow-2xl shadow-black`}
          style={{ width: `${leftWidth}%` }}
        >
          <div className="h-full flex flex-col">
            <div
              className={`bg-[rgb(27,27,28)] flex-1 border-b-2 border-black`}
            ></div>
            <div
              className={`bg-[rgb(27,27,28)] flex-8 justify-center pt-2 pl-3`}
            >
              <h1 className="text-2xl ">DOM Tree</h1>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-1.5  cursor-col-resize"
          onMouseDown={() => setIsDragging(true)}
        ></div>

        {/* Middle panel */}
        <div
          className="bg-blue-300 opacity-0 flex-1 "
          style={{ width: `${100 - leftWidth - 30}%` }}
        ></div>

        {/* Right panel */}
        <div className="w-[22%] bg-[rgb(27,27,28)] shadow-2xl shadow-black"></div>
      </div>
    </div>
  );
}
