"use client";
import { useState } from "react";

export default function ResizableColumns() {
  const [leftWidth, setLeftWidth] = useState(30); // initial % for left
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;

    const screenWidth = window.innerWidth;
    let newLeftWidth = (e.clientX / screenWidth) * 100;

    // Keep within 15% - 45% to avoid breaking layout
    if (newLeftWidth < 15) newLeftWidth = 15;
    if (newLeftWidth > 30) newLeftWidth = 30;

    setLeftWidth(newLeftWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="flex w-screen h-screen select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Left panel */}
      <div className={`bg-amber-100`} style={{ width: `${leftWidth}%` }}></div>

      {/* Divider */}
      <div
        className="w-1 bg-gray-400 cursor-col-resize"
        onMouseDown={() => setIsDragging(true)}
      ></div>

      {/* Middle panel */}
      <div
        className="bg-blue-300 flex-1"
        style={{ width: `${100 - leftWidth - 30}%` }}
      ></div>

      {/* Right panel */}
      <div className="w-[22%] bg-green-200"></div>
    </div>
  );
}
