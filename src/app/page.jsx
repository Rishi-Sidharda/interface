"use client";

import React, { useRef, useState, useEffect } from "react";

export default function HtmlCanvasRenderer() {
  const [html, setHtml] = useState(`
  <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:24px; background:#f6f7f3; min-height:600px; width: 600px;">
    <h1 style="color:#0f172a; margin:0 0 8px 0;">Hello — editable canvas</h1>
    <p style="margin:0 0 12px 0; color:#334155;">Click any element to select it. Inline styles are preserved.</p>
    <button id="cta" style="padding:8px 12px; border-radius:8px; background:#7c3aed; color:white; border:none;">Click me</button>
    <div style="margin-top:16px; display:flex; gap:8px;">
      <div style="width:120px; height:80px; background:#ef4444; border-radius:6px;"></div>
      <div style="width:120px; height:80px; background:#10b981; border-radius:6px;"></div>
      <div style="width:120px; height:80px; background:#10b481; border-radius:6px;"></div>
      <div style="width:120px; height:80px; background:#10bf81; border-radius:6px;"></div>
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
    <div className="p-4 min-h-screen bg-[#000814]">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className=" text-white">Canvas preview</h3>
            <div className="text-xs text-slate-500">
              Click elements to select — press Delete to remove
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative border border-blue-950 flex h-96 overflow-auto p-4 bg-[#000e23] items-center justify-center hide-scrollbar"
            style={{ minHeight: 800, minWidth: 1200 }}
          >
            {/* Rendered HTML */}
            <div
              className="render-wrapper"
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
                  top: highlightRect.top - 0.5 + "px",
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
        </div>
      </div>
    </div>
  );
}
