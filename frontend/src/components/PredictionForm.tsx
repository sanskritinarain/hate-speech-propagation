"use client";

import React, { useState, useEffect } from "react";
import { EarlyPostAnalysisRequest } from "@/types/prediction";
import { 
  Play, 
  RotateCcw, 
  Clock, 
  Zap, 
  Users, 
  Share2,
  SlidersHorizontal,
  Sparkles
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

const TOXIC_WORDS = new Set([
  "hate", "scum", "trash", "illegal", "filth", "vermin", "invaders", 
  "disgusting", "terrorist", "deport", "enemy", "destroy", "traitor",
  "corrupt", "kill", "attack", "racist", "clowns", "idiot", "shame",
  "stupid", "evil", "die", "bastard", "pappu", "liar", "fraud"
]);

// Real-time text hostility analyzer
function analyzeTextHostility(text: string): { toxicity: number; platform?: string } {
  const lower = text.toLowerCase();
  
  // Platform auto-detection
  let detectedPlatform: string | undefined = undefined;
  if (lower.includes("reddit.com") || lower.includes("r/") || lower.includes("u/")) {
    detectedPlatform = "reddit";
  } else if (lower.includes("twitter.com") || lower.includes("x.com") || lower.includes("retweet")) {
    detectedPlatform = "twitter";
  } else if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    detectedPlatform = "youtube";
  } else if (lower.includes("instagram.com")) {
    detectedPlatform = "instagram";
  }

  // Tokenize words
  const words = lower.match(/\b[a-z0-9]+\b/g) || [];
  if (words.length === 0) return { toxicity: 0.05, platform: detectedPlatform };

  let toxicMatches = 0;
  for (const w of words) {
    if (TOXIC_WORDS.has(w)) {
      toxicMatches++;
    }
  }

  let calculatedScore = 0.02;
  if (toxicMatches > 0) {
    calculatedScore = Math.min(0.20 + (toxicMatches * 0.25), 0.95);
  }

  // If exclamation marks or all caps are present with toxic words
  if (text.includes("!") && toxicMatches > 0) {
    calculatedScore = Math.min(calculatedScore + 0.10, 0.98);
  }

  return { toxicity: Math.round(calculatedScore * 100) / 100, platform: detectedPlatform };
}

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

  // When text changes, intelligently adjust sliders to match the content
  const handleTextChange = (text: string) => {
    setRootText(text);
    const { toxicity, platform: detectedPlat } = analyzeTextHostility(text);
    if (detectedPlat) {
      setPlatform(detectedPlat);
    }

    setRootHateScore(toxicity);

    // If text is wholesome/benign (low toxicity), adjust audience reaction sliders down automatically!
    if (toxicity < 0.20) {
      setMeanHate(Math.max(0.02, Math.round(toxicity * 0.8 * 100) / 100));
      setMaxHate(Math.max(0.08, Math.round(toxicity * 1.5 * 100) / 100));
      setHateRatio(0.0);
      setTimeSpanMins(45);
      setUserDiversity(0.90);
    } else {
      // If text is aggressive or toxic, adjust audience reaction sliders up
      setMeanHate(Math.min(0.85, Math.round((toxicity * 0.75 + 0.1) * 100) / 100));
      setMaxHate(Math.min(0.95, Math.round((toxicity + 0.15) * 100) / 100));
      setHateRatio(Math.min(0.60, Math.round(toxicity * 0.5 * 100) / 100));
      setTimeSpanMins(15);
      setUserDiversity(0.75);
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
    setRootHateScore(0.02);
    setReplyCount(15);
    setTimeSpanMins(45);
    setMeanHate(0.04);
    setMaxHate(0.08);
    setHateRatio(0.0);
    setUserDiversity(0.90);
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

        {/* 3. Early Activity Parameters (Auto-calibrated to text) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> Early Signals (Auto-Calibrated to Text)
            </span>
            <span className="text-[10px] text-indigo-400 font-normal lowercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> auto-syncs with text
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Root Toxicity */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Post Toxicity</span>
                <span className={`font-mono font-bold ${rootHateScore >= 0.4 ? "text-rose-400" : "text-emerald-400"}`}>
                  {rootHateScore.toFixed(2)}
                </span>
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
                <span className={`font-mono font-bold ${meanHate >= 0.3 ? "text-rose-400" : "text-emerald-400"}`}>
                  {meanHate.toFixed(2)}
                </span>
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
                <span className={`font-mono font-bold ${hateRatio >= 0.2 ? "text-rose-400" : "text-emerald-400"}`}>
                  {(hateRatio * 100).toFixed(0)}%
                </span>
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
                <span className={`font-mono font-bold ${maxHate >= 0.5 ? "text-rose-400" : "text-emerald-400"}`}>
                  {maxHate.toFixed(2)}
                </span>
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
            <RotateCcw className="w-3.5 h-3.5" /> Clear
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
