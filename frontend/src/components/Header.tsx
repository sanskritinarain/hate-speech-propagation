"use client";

import React from "react";
import { ShieldAlert, Scale } from "lucide-react";

interface HeaderProps {
  onOpenResponsibleUse: () => void;
  backendOnline: boolean;
  modelMode?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenResponsibleUse,
  backendOnline,
  modelMode
}) => {
  return (
    <header className="border-b border-amber-200/80 bg-amber-50/80 backdrop-blur-md sticky top-0 z-40 shadow-sm shadow-amber-100/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-600 text-white shadow-sm shadow-amber-600/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base text-stone-800 tracking-tight">
              Propagation Predictor
            </span>
            <span className="text-[10px] text-amber-600 font-medium block leading-none -mt-0.5">
              Hate Speech Early Warning
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-white/80 border border-amber-200 shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? "bg-emerald-500 shadow-sm shadow-emerald-400/50" : "bg-rose-400"
              }`}
            />
            <span className="text-stone-600 font-medium text-[11px]">
              {backendOnline
                ? modelMode === "real_model_inference"
                  ? "Model Ready"
                  : "Demo Mode"
                : "Offline"}
            </span>
          </div>

          <button
            onClick={onOpenResponsibleUse}
            className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full bg-white/80 hover:bg-amber-50 text-stone-600 hover:text-amber-700 border border-amber-200 transition font-medium shadow-xs"
          >
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>Guidelines</span>
          </button>
        </div>
      </div>
    </header>
  );
};
