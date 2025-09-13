"use client";

import React, { useState } from "react";
import HtmlCanvasRenderer from "@/components/HtmlCanvasRender";

export default function HomePage() {
  const [html, setHtml] = useState(`
    <div style="display:flex; gap:8px; max-width:400px; margin:20px auto;">
      <input 
        type="search" 
        placeholder="Search..." 
        style="
          flex:1; 
          padding:8px 12px; 
          border:1px solid #ccc; 
          border-radius:6px; 
          font-size:14px;
        "
      />
      <button 
        style="
          padding:8px 14px; 
          background:#6366f1; 
          color:white; 
          border:none; 
          border-radius:6px; 
          font-weight:600; 
          cursor:pointer;
        "
      >
        Search
      </button>
  </div>

  `);
  return (
    <main>
      <HtmlCanvasRenderer html={html} setHtml={setHtml} />
    </main>
  );
}
