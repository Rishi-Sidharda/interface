"use client";

import React, { useState } from "react";
import HtmlCanvasRenderer from "@/components/HtmlCanvasRender";

export default function HomePage() {
  const [html, setHtml] = useState(`
    <div style="width: 300px; border: 1px solid #ccc; border-radius: 8px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); font-family: Arial, sans-serif; color: white";>
    <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px; ">
      Card Title
    </div>
    <div style="font-size: 14px; color: white; margin-bottom: 12px; border-radius: 4px;">
      This is a simple description inside the card. You can add text, links, or buttons here.
    </div>
    <div style="text-align: right;">
      <button style="padding: 8px 12px; background-color: #007BFF; border: none; border-radius: 4px; color: white; cursor: pointer;">
        Action
      </button>
    </div>
  </div>


  `);
  return (
    <main>
      <HtmlCanvasRenderer html={html} setHtml={setHtml} />
    </main>
  );
}
