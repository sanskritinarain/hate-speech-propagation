"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Database } from "lucide-react";

interface DemoModeBannerProps {
  mode: "real_model_inference" | "synthetic_demo_mode" | "uninitialized";
  datasetProvenance?: string;
  totalThreads?: number;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  mode,
  datasetProvenance,
  totalThreads
}) => {
  if (mode === "real_model_inference") {
    return (
      <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-2 text-xs text-emerald-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="font-semibold text-emerald-200">Verified Model Mode Active:</strong>{" "}
              Inference is driven by the HistGradientBoosting pipeline trained on {totalThreads ?? 2157} real conversation threads from the DRAGNET benchmark.
            </span>
          </div>
          <div className="flex items-center space-x-1 text-emerald-400/80">
            <Database className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">{datasetProvenance || "LCS2-IIITD/Predicting-Hate-Intensity"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 text-xs text-amber-300">
      <div className="max-w-7xl mx-auto flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold text-amber-200">Illustrative Demo Mode:</strong>{" "}
          Backend is running in fallback simulation mode. Predictions and performance metrics are illustrative demonstrations.
        </span>
      </div>
    </div>
  );
};
