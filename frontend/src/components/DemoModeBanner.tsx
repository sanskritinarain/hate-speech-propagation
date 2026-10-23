"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface DemoModeBannerProps {
  mode: "real_model_inference" | "synthetic_demo_mode" | "uninitialized";
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ mode }) => {
  if (mode === "real_model_inference") return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-[11px] text-amber-700">
      <div className="max-w-6xl mx-auto flex items-center justify-center space-x-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="font-medium">
          Demo Fallback Mode active — real model file not found on disk. Results are illustrative.
        </span>
      </div>
    </div>
  );
};
