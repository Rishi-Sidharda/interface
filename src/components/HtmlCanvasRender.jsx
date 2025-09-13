"use client";

import React, { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HtmlCanvasRenderer({ html, setHtml }) {
  const containerRef = useRef(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState({});
  const [highlightRect, setHighlightRect] = useState(null);
  const [scale, setScale] = useState(1);

  // --- build unique selector ---
  function getUniqueSelector(el, wrapper) {
    if (el === wrapper) return "";
    const parent = el.parentElement;
    if (!parent || parent === wrapper) {
      return el.tagName.toLowerCase();
    }
    const children = Array.from(parent.children);
    const index = children.indexOf(el) + 1;
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

  // --- click handler ---
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
        setSelectedStyles({});
        setHighlightRect(null);
        return;
      }

      const selector = getUniqueSelector(target, wrapper);
      setSelectedPath(selector);

      // grab inline styles
      const styleObj = {};
      for (let i = 0; i < target.style.length; i++) {
        const prop = target.style[i];
        styleObj[prop] = target.style.getPropertyValue(prop);
      }
      setSelectedStyles(styleObj);

      const rect = updateHighlightRect(container, selector);
      if (rect) setHighlightRect(rect);

      e.stopPropagation();
    }

    container.addEventListener("click", onClick, true);
    return () => container.removeEventListener("click", onClick, true);
  }, [html]);

  // --- zoom ---
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

  // --- sync highlight ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !selectedPath) return;

    function syncRect() {
      const rect = updateHighlightRect(container, selectedPath);
      if (rect) setHighlightRect(rect);
    }

    container.addEventListener("scroll", syncRect);
    window.addEventListener("resize", syncRect);
    syncRect();

    return () => {
      container.removeEventListener("scroll", syncRect);
      window.removeEventListener("resize", syncRect);
    };
  }, [selectedPath, scale]);

  // --- edit styles ---
  function handleStyleChange(prop, value) {
    if (!selectedPath) return;

    // Parse HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const wrapper = doc.body;
    const target = wrapper.querySelector(selectedPath);
    if (!target) return;

    target.style[prop] = value; // apply change

    // rebuild HTML
    let newHtml = "";
    for (let child of wrapper.children) {
      newHtml += child.outerHTML;
    }

    setHtml(newHtml);
    setSelectedStyles((prev) => ({ ...prev, [prop]: value }));
  }

  // --- copy updated html ---
  function copyHtmlToClipboard() {
    navigator.clipboard.writeText(html).then(() => {
      alert("Updated HTML copied to clipboard!");
    });
  }

  return (
    <div className="bg-gray-950">
      <div className="flex h-screen w-full">
        {/* Left menu */}
        <div
          className="
            shadow-md bg-gray-900 absolute left-0 top-0 h-full
            w-[4%] hover:w-[20%] transition-all duration-300 ease-in-out
            z-50 group overflow-hidden
          "
        >
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
            <p className="text-sm text-gray-300">Links, settings, etc.</p>
          </div>
        </div>

        {/* Middle container */}
        <div
          ref={containerRef}
          className="shadow-md relative flex overflow-auto items-center justify-center hide-scrollbar"
          style={{ width: "75%", minHeight: "calc(100vh - 3rem)" }}
        >
          <div
            className="render-wrapper cursor-pointer flex items-center justify-center"
            style={{
              overflow: "auto",
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
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

        {/* Right panel */}
        <div
          className="shadow-md bg-gray-900 text-white p-4 overflow-auto"
          style={{ width: "25%" }}
        >
          {selectedPath ? (
            <>
              <h3 className="text-lg font-semibold mb-2">Edit Styles</h3>
              <div className="text-sm space-y-2 max-h-[70vh] overflow-y-auto">
                {Object.entries(selectedStyles).map(([prop, value]) => (
                  <div key={prop} className="flex flex-col">
                    <label className="text-gray-400 text-xs">{prop}</label>
                    <input
                      className="bg-gray-800 text-white text-sm rounded p-1"
                      value={value}
                      onChange={(e) => handleStyleChange(prop, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* ✅ New button */}
              <button
                onClick={copyHtmlToClipboard}
                className="absolute bottom-4 max-w-fit right-4 mt-4 w-full bg-cyan-800 hover:bg-cyan-700 cursor-pointer text-white py-2 px-4 transition-colors"
              >
                Copy code
              </button>
            </>
          ) : (
            <p className="text-gray-400">Click an element to edit styles</p>
          )}
        </div>
      </div>
    </div>
  );
}
