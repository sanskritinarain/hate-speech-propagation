"use client";

import React, { useState } from "react";
import { EarlyPostAnalysisRequest } from "@/types/prediction";
import { 
  Play, 
  RotateCcw, 
  Clock, 
  Zap, 
  Users, 
  Share2,
  SlidersHorizontal
} from "lucide-react";

interface PredictionFormProps {
  onSubmit: (data: EarlyPostAnalysisRequest) => void;
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
  const [platform, setPlatform] = useState<string>("twitter");
  const [rootText, setRootText] = useState(
    "These illegal foreigners are destroying our nation, why is nobody taking direct action against them?!"
  );
  const [rootHateScore, setRootHateScore] = useState<number>(0.72);
  const [replyCount, setReplyCount] = useState<number>(15);
  const [timeSpanMins, setTimeSpanMins] = useState<number>(20);
  const [meanHate, setMeanHate] = useState<number>(0.42);
  const [maxHate, setMaxHate] = useState<number>(0.85);
  const [hateRatio, setHateRatio] = useState<number>(0.35);
  const [userDiversity, setUserDiversity] = useState<number>(0.80);

  const handleTextChange = (text: string) => {
    setRootText(text);
    const lower = text.toLowerCase();
    if (lower.includes("reddit.com") || lower.includes("r/") || lower.includes("u/")) {
      setPlatform("reddit");
    } else if (lower.includes("twitter.com") || lower.includes("x.com") || lower.includes("retweet")) {
      setPlatform("twitter");
    } else if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      setPlatform("youtube");
    } else if (lower.includes("instagram.com")) {
      setPlatform("instagram");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootText.trim()) return;

    onSubmit({
      root_text: rootText.trim(),
      platform: platform,
      root_hate_score: rootHateScore,
      early_reply_count: replyCount,
      early_time_span_mins: timeSpanMins,
      early_mean_hate: meanHate,
      early_max_hate: maxHate,
      early_std_hate: Math.round(Math.abs(maxHate - meanHate) * 0.45 * 100) / 100,
      early_hate_ratio: hateRatio,
      early_user_diversity: userDiversity,
      observation_cutoff_label: "Cutoff = 15 replies"
    });
  };

  const handleReset = () => {
    setRootText("");
    setPlatform("twitter");
    setRootHateScore(0.10);
    setReplyCount(15);
    setTimeSpanMins(30);
    setMeanHate(0.20);
    setMaxHate(0.50);
    setHateRatio(0.15);
    setUserDiversity(0.85);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm space-y-4">
      {/* 1. Source Platform Select */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Select Source Platform
          </span>
          <span className="text-slate-500 font-normal lowercase">auto-detects from links</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {PLATFORMS.map((p) => {
            const isSelected = platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <span>{p.icon}</span>
                <span className="hidden sm:inline">{p.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* 2. Text Input Box */}
        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <label className="font-semibold text-slate-300">Post Text or Link</label>
            <span className="text-[11px] text-slate-400">
              Active: <strong className="text-indigo-400 capitalize">{platform}</strong>
            </span>
          </div>
          <textarea
            value={rootText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={3}
            required
            placeholder="Paste the post text or URL here (e.g. twitter.com/..., reddit.com/r/..., instagram.com/...)..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* 3. Early Activity Parameters (Sliders) */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> Early Signals (First 15 Comments)
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Root Toxicity */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Post Toxicity</span>
                <span className="font-mono text-indigo-400 font-bold">{rootHateScore.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.02"
                value={rootHateScore}
                onChange={(e) => setRootHateScore(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Early Reply Toxicity */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Audience Hostility</span>
                <span className="font-mono text-indigo-400 font-bold">{meanHate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.02"
                value={meanHate}
                onChange={(e) => setMeanHate(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Window Duration */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> Arrival Speed
                </span>
                <span className="font-mono text-indigo-400 font-bold">{timeSpanMins}m</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={timeSpanMins}
                onChange={(e) => setTimeSpanMins(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Toxic Ratio */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Toxic Ratio
                </span>
                <span className="font-mono text-indigo-400 font-bold">{(hateRatio * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={hateRatio}
                onChange={(e) => setHateRatio(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Peak Toxicity */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Peak Toxicity</span>
                <span className="font-mono text-indigo-400 font-bold">{maxHate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.02"
                value={maxHate}
                onChange={(e) => setMaxHate(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* User Diversity */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-500" /> User Variety
                </span>
                <span className="font-mono text-indigo-400 font-bold">{(userDiversity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={userDiversity}
                onChange={(e) => setUserDiversity(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <button
            type="submit"
            disabled={loading || !rootText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
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
