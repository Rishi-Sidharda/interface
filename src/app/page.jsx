"use client";

import React, { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HtmlCanvasRenderer() {
  const [html, setHtml] = useState(`
        <div 
        style="
          width: 50%; 
          min-width: 300px; 
          max-width: 600px; 
          background: white; 
          border-radius: 12px; 
          box-shadow: 0 6px 18px rgba(0,0,0,0.15); 
          overflow: hidden; 
          font-family: sans-serif;
        "
      >
        <!-- Image -->
        <div style="width: 100%; height: 180px; overflow: hidden;">
          <img 
            src="https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=800" 
            alt="Card image" 
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        </div>

        <!-- Content -->
        <div style="padding: 16px;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #111;">
            Card Title
          </h3>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #555; line-height: 1.4;">
            This is a simple card component with inline styles only. It contains an image, some text, and actions at the bottom.
          </p>

          <!-- Actions -->
          <div style="display: flex; gap: 8px;">
            <button 
              style="
                flex: 1;
                padding: 10px 0; 
                background: #7c3aed; 
                color: white; 
                border: none; 
                border-radius: 8px; 
                font-size: 14px; 
                font-weight: 600; 
                cursor: pointer;
              "
            >
              Primary
            </button>
            <button 
              style="
                flex: 1;
                padding: 10px 0; 
                background: #f3f4f6; 
                color: #111; 
                border: none; 
                border-radius: 8px; 
                font-size: 14px; 
                font-weight: 600; 
                cursor: pointer;
              "
            >
              Secondary
            </button>
          </div>
        </div>
      </div>

  `);

  const containerRef = useRef(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [highlightRect, setHighlightRect] = useState(null);
  const [scale, setScale] = useState(1);

  // --- build unique selector for any element ---
  function getUniqueSelector(el, wrapper) {
    if (el === wrapper) return "";
    const parent = el.parentElement;
    if (!parent || parent === wrapper) {
      return el.tagName.toLowerCase();
    }

    const children = Array.from(parent.children);
    const index = children.indexOf(el) + 1; // nth-child is 1-based
    return (
      getUniqueSelector(parent, wrapper) +
      " > " +
      el.tagName.toLowerCase() +
      `:nth-child(${index})`
    );
  }

  // --- recompute bounding rect ---
  function updateHighlightRect(container, selector) {
    const wrapper = container.querySelector(".render-wrapper");
    if (!wrapper) return null;

    const el = wrapper.querySelector(selector);
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      top: rect.top - containerRect.top + container.scrollTop,
      left: rect.left - containerRect.left + container.scrollLeft,
      width: rect.width,
      height: rect.height,
    };
  }

  // --- click: select element ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onClick(e) {
      if (!container.contains(e.target)) return;

      const wrapper = container.querySelector(".render-wrapper");
      if (!wrapper) return;

      const target = e.target;
      if (target === container || target === wrapper) {
        setSelectedPath(null);
        setHighlightRect(null);
        return;
      }

      const selector = getUniqueSelector(target, wrapper);
      setSelectedPath(selector);

      const rect = updateHighlightRect(container, selector);
      if (rect) setHighlightRect(rect);

      e.stopPropagation();
    }

    container.addEventListener("click", onClick, true);
    return () => container.removeEventListener("click", onClick, true);
  }, []);

  // --- zoom with wheel ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(e) {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.min(Math.max(prev + delta, 0.2), 5));
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // --- keep highlight synced on scroll/resize/scale ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !selectedPath) return;

    function syncRect() {
      const rect = updateHighlightRect(container, selectedPath);
      if (rect) setHighlightRect(rect);
    }

    container.addEventListener("scroll", syncRect);
    window.addEventListener("resize", syncRect);

    syncRect(); // run immediately

    return () => {
      container.removeEventListener("scroll", syncRect);
      window.removeEventListener("resize", syncRect);
    };
  }, [selectedPath, scale]);

  // --- reset when HTML changes ---
  useEffect(() => {
    setSelectedPath(null);
    setHighlightRect(null);
  }, [html]);

  // --- delete selected element ---
  useEffect(() => {
    function onKey(e) {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedPath) {
        const container = containerRef.current;
        if (!container) return;
        const wrapper = container.querySelector(".render-wrapper");
        if (!wrapper) return;
        try {
          const el = wrapper.querySelector(selectedPath);
          if (el) {
            el.remove();
            setSelectedPath(null);
            setHighlightRect(null);
          }
        } catch {}
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedPath]);

  return (
    <div className="bg-gray-950">
      <div className="flex h-screen w-full">
        {/* Left Container box */}
        <div
          className="
          shadow-md bg-gray-900 absolute left-0 top-0 h-full
          w-[4%] hover:w-[20%] transition-all duration-300 ease-in-out
          z-50 group overflow-hidden
        "
        >
          {/* Collapsed content (visible by default) */}
          <div
            className="
            flex mt-5 justify-center h-full text-white
            transition-all duration-200 ease-in-out
            group-hover:opacity-0 group-hover:scale-95
          "
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>

          {/* Expanded content (appears on hover) */}
          <div
            className="
            absolute inset-0 px-4 py-6 flex flex-col justify-start gap-3
            text-white
            opacity-0 translate-x-2 scale-95
            group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
            transition-all duration-300
            pointer-events-none group-hover:pointer-events-auto
          "
          >
            <h3 className="text-lg font-semibold">Expanded menu</h3>
            <p className="text-sm text-gray-300">
              Links, settings, or whatever you want.
            </p>
            {/* add buttons/links here */}
          </div>
        </div>

        {/* Middle Container box */}
        <div
          ref={containerRef}
          className="shadow-md relative flex overflow-auto items-center justify-center hide-scrollbar"
          style={{ width: "75%", minHeight: "calc(100vh - 3rem)" }}
        >
          {/* Rendered HTML */}
          <div
            className="render-wrapper cursor-pointer flex items-center justify-center"
            style={{
              overflow: "auto",
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Highlight overlay */}
          {highlightRect && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                pointerEvents: "none",
                top: highlightRect.top + "px",
                left: highlightRect.left - 0.5 + "px",
                width: highlightRect.width + "px",
                height: highlightRect.height + "px",
                outline: "3px solid rgba(124,58,237,0.9)",
                outlineOffset: "-2px",
                borderRadius: 0,
                zIndex: 40,
              }}
            />
          )}
        </div>

        {/* Right container box */}
        <div className="shadow-md bg-gray-900" style={{ width: "25%" }}>
          {/* Your right content */}
        </div>
      </div>
    </div>
  );
}
