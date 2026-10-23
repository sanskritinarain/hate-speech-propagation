"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface DemoModeBannerProps {
  mode: "real_model_inference" | "synthetic_demo_mode" | "uninitialized";
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ mode }) => {
  // In real model mode, keep the interface clean and uncluttered
  if (mode === "real_model_inference") return null;

  return (
    <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-1.5 text-[11px] text-amber-300">
      <div className="max-w-6xl mx-auto flex items-center justify-center space-x-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Demo Fallback Mode active. Real model file not found on disk.</span>
      </div>
    </div>
  );
};
