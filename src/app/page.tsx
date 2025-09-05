"use client";
import { useState } from "react";

export default function ResizableColumns() {
  const [leftWidth, setLeftWidth] = useState(30); // initial % for left
  const [isDragging, setIsDragging] = useState(false);

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
      <div className="absolute top-0 left-0 bg-gray-950 size-[100%] z-0 w-screen h-screen">
        {/** KEEP IFRAME HERE */}
      </div>
      <div
        className="flex w-screen h-screen select-none z-10 relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Left panel */}
        <div className={`bg-amber-100`} style={{ width: `${leftWidth}%` }}>
          <div className="h-full flex flex-col">
            <div className={`bg-fuchsia-200 flex-1`}></div>
            <div className={`bg-red-200 flex-6`}></div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-1 bg-gray-400 cursor-col-resize"
          onMouseDown={() => setIsDragging(true)}
        ></div>

        {/* Middle panel */}
        <div
          className="bg-blue-300 flex-1 "
          style={{ width: `${100 - leftWidth - 30}%` }}
        ></div>

        {/* Right panel */}
        <div className="w-[22%] bg-green-200"></div>
      </div>
    </div>
  );
}
