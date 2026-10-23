"use client";

import React, { useState } from "react";
import { EarlyPostAnalysisRequest, SamplePreset } from "@/types/prediction";
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  Zap, 
  Users, 
  ShieldAlert, 
  Share2 
} from "lucide-react";

interface PredictionFormProps {
  onSubmit: (data: EarlyPostAnalysisRequest) => void;
  loading: boolean;
  presets: SamplePreset[];
}

const PLATFORMS = [
  { id: "twitter", label: "X / Twitter", icon: "𝕏", color: "hover:border-sky-500" },
  { id: "reddit", label: "Reddit", icon: "🔴", color: "hover:border-orange-500" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "hover:border-red-500" },
  { id: "instagram", label: "Instagram", icon: "📸", color: "hover:border-pink-500" },
  { id: "other", label: "Other", icon: "🌐", color: "hover:border-slate-500" },
];

export const PredictionForm: React.FC<PredictionFormProps> = ({
  onSubmit,
  loading,
  presets
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
  const [activePresetId, setActivePresetId] = useState<string>("severe-escalation");

  const velocity = (replyCount / Math.max(timeSpanMins, 0.1)).toFixed(1);

  // Auto-detect platform if user pastes a link or platform-specific syntax
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

  const applyPreset = (preset: SamplePreset) => {
    setActivePresetId(preset.id);
    setRootText(preset.data.root_text);
    if (preset.platform) {
      setPlatform(preset.platform);
    } else if (preset.data.platform) {
      setPlatform(preset.data.platform);
    }
    if (preset.data.root_hate_score !== undefined) {
      setRootHateScore(preset.data.root_hate_score);
    }
    setReplyCount(preset.data.early_reply_count);
    setTimeSpanMins(preset.data.early_time_span_mins);
    setMeanHate(preset.data.early_mean_hate);
    setMaxHate(preset.data.early_max_hate);
    setHateRatio(preset.data.early_hate_ratio);
    setUserDiversity(preset.data.early_user_diversity);
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
      observation_cutoff_label: `Cutoff = 15 replies`
    });
  };

  const handleReset = () => {
    setActivePresetId("");
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
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm">
      {/* Platform Selector Bar */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Source Platform
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

      {/* Quick Presets */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-3 border-b border-slate-800/80">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`text-xs px-2.5 py-1 rounded-md transition font-medium ${
                activePresetId === preset.id
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {preset.title.split(" ")[0]}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post Text Input */}
        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <label className="font-medium text-slate-300">Root Post Content</label>
            <span className="text-[11px] text-slate-500">
              Platform: <strong className="text-indigo-400 capitalize">{platform}</strong>
            </span>
          </div>
          <textarea
            value={rootText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={3}
            required
            placeholder="Type or paste post text..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Simplified Sliders Grid (Clean, low text) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Root Toxicity */}
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/70">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Root Toxicity</span>
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

          {/* Early Mean Toxicity */}
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/70">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Early Reply Toxicity</span>
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

          {/* Time Window & Velocity */}
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/70">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> Window Duration
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

          {/* Toxic Reply Ratio */}
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/70">
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

          {/* Early Peak Toxicity */}
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/70">
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

          {/* Participant Diversity */}
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/70">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-500" /> User Diversity
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

        {/* Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>

          <button
            type="submit"
            disabled={loading || !rootText.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
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
