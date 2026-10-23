"use client";

import React, { useState } from "react";
import { Play, RotateCcw, Share2 } from "lucide-react";

interface PredictionFormProps {
  onSubmit: (inputSource: string, platform?: string) => void;
  loading: boolean;
}

const PLATFORMS = [
  { id: "twitter", label: "X / Twitter", icon: "𝕏" },
  { id: "reddit", label: "Reddit", icon: "🔴" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
  { id: "other", label: "Other", icon: "🌐" },
];

export const PredictionForm: React.FC<PredictionFormProps> = ({
  onSubmit,
  loading
}) => {
  const [platform, setPlatform] = useState<string>("youtube");
  const [inputSource, setInputSource] = useState<string>("");

  const handleInputChange = (text: string) => {
    setInputSource(text);
    const lower = text.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      setPlatform("youtube");
    } else if (lower.includes("reddit.com") || lower.includes("redd.it") || lower.includes("r/")) {
      setPlatform("reddit");
    } else if (lower.includes("twitter.com") || lower.includes("x.com")) {
      setPlatform("twitter");
    } else if (lower.includes("instagram.com")) {
      setPlatform("instagram");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSource.trim()) return;
    onSubmit(inputSource.trim(), platform);
  };

  const handleReset = () => {
    setInputSource("");
    setPlatform("youtube");
  };

  return (
    <div className="paper-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
        <div className="p-1.5 bg-amber-100 rounded-lg">
          <Share2 className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-stone-800">Analyze Post</h2>
          <p className="text-[11px] text-stone-400">Paste a URL or post text to predict propagation</p>
        </div>
      </div>

      {/* 1. Source Platform Select */}
      <div>
        <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Source Platform</span>
          <span className="text-stone-400 font-normal lowercase">auto-detects from links</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {PLATFORMS.map((p) => {
            const isSelected = platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl text-xs font-medium border transition ${
                  isSelected
                    ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200"
                    : "bg-white text-stone-500 border-stone-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50"
                }`}
              >
                <span className="text-base">{p.icon}</span>
                <span className="text-[9px] leading-tight text-center truncate w-full px-0.5">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 2. Text or URL Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <label className="font-semibold text-stone-600">Post Text or URL</label>
            <span className="text-[11px] text-stone-400">
              Detecting: <strong className="text-amber-700 capitalize">{platform}</strong>
            </span>
          </div>
          <textarea
            value={inputSource}
            onChange={(e) => handleInputChange(e.target.value)}
            rows={6}
            required
            placeholder="Paste a YouTube, Reddit, or Twitter/X post link — or enter raw text to analyze directly..."
            className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
          />
        </div>

        {/* 3. Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>

          <button
            type="submit"
            disabled={loading || !inputSource.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Predicting...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Predict Propagation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
