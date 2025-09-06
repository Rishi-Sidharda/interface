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
      <div className="absolute top-0 left-0 bg-neutral-950 w-screen h-screen flex items-center justify-center z-0">
        {/** KEEP IFRAME HERE */}
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
            <div className={`bg-[rgb(27,27,28)] flex-8`}></div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-1.5  cursor-col-resize"
          onMouseDown={() => setIsDragging(true)}
        ></div>

        {/* Middle panel */}
        <div
          className="bg-blue-300 flex-1 opacity-0"
          style={{ width: `${100 - leftWidth - 30}%` }}
        ></div>

        {/* Right panel */}
        <div className="w-[22%] bg-[rgb(27,27,28)] shadow-2xl shadow-black"></div>
      </div>
    </div>
  );
}
