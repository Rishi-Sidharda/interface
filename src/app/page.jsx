"use client";

import React, { useState } from "react";
import HtmlCanvasRenderer from "@/components/HtmlCanvasRender";

export default function HomePage() {
  const [html, setHtml] = useState(`
    <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e5e7eb;">
        
        <!-- Card Header -->
        <div style="padding: 20px 24px 16px; border-bottom: 1px solid #f3f4f6;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <!-- Profile Icon -->
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0;">
                    <circle cx="12" cy="8" r="4" fill="#6366f1"/>
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#6366f1" stroke-width="2" fill="none"/>
                </svg>
                <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Upload Profile</h3>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Add your profile picture and details</p>
        </div>
        
        <!-- Card Body -->
        <div style="padding: 24px;">
            
            <!-- Image Upload Section -->
            <div style="margin-bottom: 24px;">
                <label style="display: block; color: #374151; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
                    Profile Image
                </label>
                <div style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 32px; text-align: center; background-color: #fafafa; transition: border-color 0.2s;">
                    
                    <!-- Upload Icon -->
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 16px; display: block; opacity: 0.5;">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#9ca3af" stroke-width="2"/>
                        <polyline points="17,8 12,3 7,8" stroke="#9ca3af" stroke-width="2"/>
                        <line x1="12" y1="3" x2="12" y2="15" stroke="#9ca3af" stroke-width="2"/>
                    </svg>
                    
                    <input type="file" accept="image/*" style="display: none;" id="imageInput">
                    <label for="imageInput" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background-color 0.2s;">
                        Choose File
                    </label>
                    <p style="margin: 8px 0 0; color: #6b7280; font-size: 12px;">PNG, JPG up to 10MB</p>
                </div>
            </div>
            
            <!-- Text Input Section -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #374151; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
                    Display Name
                </label>
                <input type="text" placeholder="Enter your name" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#d1d5db'">
            </div>
            
        </div>
        
        <!-- Card Footer -->
        <div style="padding: 16px 24px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
            
            <!-- Action Icons -->
            <div style="display: flex; gap: 16px;">
                <!-- Settings Icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="cursor: pointer; opacity: 0.6; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                    <circle cx="12" cy="12" r="3" stroke="#6b7280" stroke-width="2"/>
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="#6b7280" stroke-width="2"/>
                </svg>
                
                <!-- Heart Icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="cursor: pointer; opacity: 0.6; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#6b7280" stroke-width="2"/>
                </svg>
                
                <!-- Share Icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="cursor: pointer; opacity: 0.6; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                    <circle cx="18" cy="5" r="3" stroke="#6b7280" stroke-width="2"/>
                    <circle cx="6" cy="12" r="3" stroke="#6b7280" stroke-width="2"/>
                    <circle cx="18" cy="19" r="3" stroke="#6b7280" stroke-width="2"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#6b7280" stroke-width="2"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#6b7280" stroke-width="2"/>
                </svg>
            </div>
            
            <!-- Save Button -->
            <button style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">
                <!-- Check Icon -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
                </svg>
                Save
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
