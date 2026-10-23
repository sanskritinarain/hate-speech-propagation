"use client";

import React from "react";
import { ShieldAlert, BookOpen, Scale, Terminal } from "lucide-react";

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
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-white tracking-tight">
                Hate Speech Propagation Predictor
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                DRAGNET & HEAR Framework
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Proactive forecasting of conversation thread toxicity and cascade escalation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Backend Status indicator */}
          <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
              }`}
            />
            <span className="text-slate-300 font-medium">
              {backendOnline
                ? modelMode === "real_model_inference"
                  ? "ML Engine: DRAGNET Trained"
                  : "ML Engine: Demo Mode"
                : "Backend Offline"}
            </span>
          </div>

          {/* Responsible Use Modal Trigger */}
          <button
            onClick={onOpenResponsibleUse}
            className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Responsible Use</span>
          </button>
        </div>
      </div>
    </header>
  );
};
