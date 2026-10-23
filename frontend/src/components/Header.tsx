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
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-md">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-white tracking-tight">
            Propagation Predictor
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-medium border border-slate-700">
            DRAGNET ML
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <span className="text-slate-300 font-medium text-[11px]">
              {backendOnline
                ? modelMode === "real_model_inference"
                  ? "Model Ready"
                  : "Demo Mode"
                : "Offline"}
            </span>
          </div>

          <button
            onClick={onOpenResponsibleUse}
            className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Guidelines</span>
          </button>
        </div>
      </div>
    </header>
  );
};
