"use client";

import React, { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";

export default function HtmlCanvasRenderer({ html, setHtml }) {
  const containerRef = useRef(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState({});
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [highlightRect, setHighlightRect] = useState(null);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const scrollTimeout = useRef(null);

  const [newProp, setNewProp] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValue, setNewAttrValue] = useState("");
  const [contentValue, setContentValue] = useState("");
  const [contentType, setContentType] = useState(null); // "text" | "img" | "input" | null

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

  function recalcHighlight() {
    const container = containerRef.current;
    if (container && selectedPath) {
      const rect = updateHighlightRect(container, selectedPath);
      if (rect) setHighlightRect(rect);
    }
  }

  // --- helper: get direct text only ---
  function getDirectText(el) {
    let text = "";
    for (let node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.nodeValue;
      }
    }
    return text.trim();
  }

  // --- helper: get all attributes ---
  function getAllAttributes(el) {
    const attrs = {};
    for (let attr of el.attributes) {
      // Skip style attribute as it's handled separately
      if (attr.name !== "style") {
        attrs[attr.name] = attr.value;
      }
    }
    return attrs;
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
        setSelectedAttributes({});
        setHighlightRect(null);
        setContentValue("");
        setContentType(null);
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

      // grab attributes
      const attributeObj = getAllAttributes(target);
      setSelectedAttributes(attributeObj);

      // grab content based on type
      if (target.tagName.toLowerCase() === "img") {
        setContentValue(target.getAttribute("src") || "");
        setContentType("img");
      } else if (target.tagName.toLowerCase() === "input") {
        setContentValue(target.getAttribute("value") || "");
        setContentType("input");
      } else {
        const directText = getDirectText(target);
        if (directText) {
          setContentValue(directText);
          setContentType("text");
        } else {
          setContentValue("");
          setContentType(null);
        }
      }

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
      triggerGrid();
    }
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // --- show grid on scroll ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function onScroll() {
      triggerGrid();
    }
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  function triggerGrid() {
    setShowGrid(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setShowGrid(false), 500);
  }

  // --- sync highlight on scroll/resize ---
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

  // --- keep highlight in sync with edits ---
  useEffect(() => {
    recalcHighlight();
  }, [html, selectedPath, scale, contentValue]);

  // --- edit styles ---
  function handleStyleChange(prop, value) {
    if (!selectedPath) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const wrapper = doc.body;
    const target = wrapper.querySelector(selectedPath);
    if (!target) return;

    target.style[prop] = value;

    let newHtml = "";
    for (let child of wrapper.children) {
      newHtml += child.outerHTML;
    }

    setHtml(newHtml);
    setSelectedStyles((prev) => ({ ...prev, [prop]: value }));
    recalcHighlight();
  }

  // --- delete styles ---
  function handleStyleDelete(prop) {
    if (!selectedPath) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const wrapper = doc.body;
    const target = wrapper.querySelector(selectedPath);
    if (!target) return;

    target.style.removeProperty(prop);

    let newHtml = "";
    for (let child of wrapper.children) {
      newHtml += child.outerHTML;
    }

    setHtml(newHtml);

    setSelectedStyles((prev) => {
      const newStyles = { ...prev };
      delete newStyles[prop];
      return newStyles;
    });
    recalcHighlight();
  }

  // --- add new style ---
  function handleAddStyle() {
    if (!newProp.trim() || !newValue.trim()) return;
    handleStyleChange(newProp.trim(), newValue.trim());
    setNewProp("");
    setNewValue("");
  }

  // --- edit attributes ---
  function handleAttributeChange(attrName, value) {
    if (!selectedPath) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const wrapper = doc.body;
    const target = wrapper.querySelector(selectedPath);
    if (!target) return;

    if (value.trim() === "") {
      target.removeAttribute(attrName);
    } else {
      target.setAttribute(attrName, value);
    }

    let newHtml = "";
    for (let child of wrapper.children) {
      newHtml += child.outerHTML;
    }

    setHtml(newHtml);

    if (value.trim() === "") {
      setSelectedAttributes((prev) => {
        const newAttrs = { ...prev };
        delete newAttrs[attrName];
        return newAttrs;
      });
    } else {
      setSelectedAttributes((prev) => ({ ...prev, [attrName]: value }));
    }
    recalcHighlight();
  }

  // --- delete attribute ---
  function handleAttributeDelete(attrName) {
    handleAttributeChange(attrName, "");
  }

  // --- add new attribute ---
  function handleAddAttribute() {
    if (!newAttrName.trim()) return;
    handleAttributeChange(newAttrName.trim(), newAttrValue.trim());
    setNewAttrName("");
    setNewAttrValue("");
  }

  // --- edit content ---
  function handleContentChange(newContent) {
    setContentValue(newContent);
    if (!selectedPath) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const wrapper = doc.body;
    const target = wrapper.querySelector(selectedPath);
    if (!target) return;

    if (contentType === "img") {
      target.setAttribute("src", newContent);
    } else if (contentType === "input") {
      target.setAttribute("value", newContent);
    } else if (contentType === "text") {
      for (let node of Array.from(target.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
          node.nodeValue = newContent;
        }
      }
    }

    let newHtml = "";
    for (let child of wrapper.children) {
      newHtml += child.outerHTML;
    }

    setHtml(newHtml);
    recalcHighlight();
  }

  // --- copy updated html ---
  function copyHtmlToClipboard() {
    navigator.clipboard.writeText(html).then(() => {
      alert("Updated HTML copied to clipboard!");
    });
  }

  // --- zoom style helper ---
  function getZoomStyle(scale) {
    const isFirefox =
      typeof navigator !== "undefined" &&
      navigator.userAgent.toLowerCase().includes("firefox");

    if (isFirefox) {
      return {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
      };
    } else {
      return {
        zoom: scale,
      };
    }
  }

  return (
    <div className="bg-[#131313]">
      <div className="flex h-screen w-full">
        {/* Middle container - FIXED */}
        <div
          ref={containerRef}
          className="shadow-md relative flex overflow-auto items-center justify-center hide-scrollbar"
          style={{
            width: "75%",
            minHeight: "calc(100vh - 3rem)",
            marginLeft: "4%", // Add left margin to account for sidebar
            position: "relative",
            zIndex: 10, // Ensure it's below the sidebar
          }}
        >
          {/* Content wrapper with proper clipping */}
          <div
            className="w-full h-full relative"
            style={{
              overflow: "hidden", // Prevent content from overflowing
              clipPath: "inset(0)", // Clip any overflow
            }}
          >
            {/* Rendered HTML */}
            <div
              className="render-wrapper cursor-pointer flex items-center justify-center w-full h-full"
              style={{
                ...getZoomStyle(scale),
                minWidth: "100%",
                minHeight: "100%",
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

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

          {/* Zoom indicator */}
          <div className="absolute bottom-5 right-5 flex flex-col items-center text-white z-50">
            <div className="flex items-center">
              <div
                style={{
                  width: `110px`,
                  height: "2px",
                  backgroundColor: "white",
                }}
              />
            </div>
            <span className="text-xs mt-1">{Math.round(scale * 100)}%</span>
          </div>
        </div>

        {/* Copy button */}
        <div className="absolute right-[27%] top-5 z-40">
          <Button
            onClick={copyHtmlToClipboard}
            className="max-w-fit w-full bg-cyan-800 hover:bg-cyan-700 cursor-pointer text-white py-2 px-4 transition-colors"
          >
            Copy code
          </Button>
        </div>

        {/* Right panel */}
        <div
          className="shadow-md bg-[#121212] text-white p-4 flex flex-col justify-between border-2 border-[#1e1e1e] overflow-hidden"
          style={{ width: "25%" }}
        >
          <div className="overflow-auto flex-1">
            {selectedPath ? (
              <>
                {/* Edit Content */}
                {contentType && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Edit Content</h3>
                    {contentType === "img" && (
                      <input
                        type="text"
                        className="bg-gray-800 text-white text-sm rounded p-1 w-full"
                        placeholder="Image URL"
                        value={contentValue}
                        onChange={(e) => handleContentChange(e.target.value)}
                      />
                    )}
                    {contentType === "input" && (
                      <input
                        type="text"
                        className="bg-gray-800 text-white text-sm rounded p-1 w-full"
                        placeholder="Input value"
                        value={contentValue}
                        onChange={(e) => handleContentChange(e.target.value)}
                      />
                    )}
                    {contentType === "text" && (
                      <textarea
                        className="bg-gray-800 text-white text-sm rounded p-2 w-full min-h-[80px]"
                        placeholder="Edit text"
                        value={contentValue}
                        onChange={(e) => handleContentChange(e.target.value)}
                      />
                    )}
                  </div>
                )}

                {/* Edit Attributes */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Edit Attributes
                  </h3>
                  <div className="text-sm space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(selectedAttributes).map(
                      ([attrName, value]) => (
                        <div key={attrName} className="flex items-center gap-2">
                          <div className="flex flex-col flex-1">
                            <label className="text-gray-400 text-xs">
                              {attrName}
                            </label>
                            <input
                              className="bg-gray-800 text-white text-sm rounded p-1"
                              value={value}
                              onChange={(e) =>
                                handleAttributeChange(attrName, e.target.value)
                              }
                              placeholder={`Enter ${attrName} value`}
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAttributeDelete(attrName)}
                            className="px-2 py-1 text-xs"
                          >
                            ✕
                          </Button>
                        </div>
                      )
                    )}
                  </div>

                  {/* Add new attribute */}
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <h4 className="text-sm font-semibold mb-2">
                      Add new attribute
                    </h4>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="name"
                        className="bg-gray-800 text-white text-sm rounded p-1 flex-1"
                        value={newAttrName}
                        onChange={(e) => setNewAttrName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="value"
                        className="bg-gray-800 text-white text-sm rounded p-1 flex-1"
                        value={newAttrValue}
                        onChange={(e) => setNewAttrValue(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleAddAttribute}
                      className="w-full bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 text-sm"
                    >
                      Add Attribute
                    </Button>
                  </div>
                </div>

                {/* Edit Styles */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Edit Styles</h3>
                  <div className="text-sm space-y-2  overflow-y-auto">
                    {Object.entries(selectedStyles).map(([prop, value]) => (
                      <div key={prop} className="flex items-center gap-2">
                        <div className="flex flex-col flex-1">
                          <label className="text-gray-400 text-xs">
                            {prop}
                          </label>
                          <input
                            className="bg-gray-800 text-white text-sm rounded p-1"
                            value={value}
                            onChange={(e) =>
                              handleStyleChange(prop, e.target.value)
                            }
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStyleDelete(prop)}
                          className="px-2 py-1 text-xs"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add new style */}
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <h4 className="text-sm font-semibold mb-2">
                      Add new style
                    </h4>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="property"
                        className="bg-gray-800 text-white text-sm rounded p-1 flex-1"
                        value={newProp}
                        onChange={(e) => setNewProp(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="value"
                        className="bg-gray-800 text-white text-sm rounded p-1 flex-1"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleAddStyle}
                      className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-2 px-4 text-sm"
                    >
                      Add Style
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400 grid justify-center items-center">
                Click an element to edit content, attributes & styles
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
