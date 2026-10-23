"use client";

import React, { useState } from "react";
import { EarlyPostAnalysisRequest, SamplePreset } from "@/types/prediction";
import { Sparkles, Play, RotateCcw, Activity, Clock, Users, Zap, AlertCircle } from "lucide-react";

interface PredictionFormProps {
  onSubmit: (data: EarlyPostAnalysisRequest) => void;
  loading: boolean;
  presets: SamplePreset[];
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  onSubmit,
  loading,
  presets
}) => {
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

  const velocity = (replyCount / Math.max(timeSpanMins, 0.1)).toFixed(2);

  const applyPreset = (preset: SamplePreset) => {
    setActivePresetId(preset.id);
    setRootText(preset.data.root_text);
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
      root_hate_score: rootHateScore,
      early_reply_count: replyCount,
      early_time_span_mins: timeSpanMins,
      early_mean_hate: meanHate,
      early_max_hate: maxHate,
      early_std_hate: Math.round(Math.abs(maxHate - meanHate) * 0.45 * 100) / 100,
      early_hate_ratio: hateRatio,
      early_user_diversity: userDiversity,
      observation_cutoff_label: `Cutoff = ${replyCount} replies / ${timeSpanMins} min`
    });
  };

  const handleReset = () => {
    setActivePresetId("");
    setRootText("");
    setRootHateScore(0.10);
    setReplyCount(15);
    setTimeSpanMins(30);
    setMeanHate(0.20);
    setMaxHate(0.50);
    setHateRatio(0.15);
    setUserDiversity(0.85);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Early Activity Analysis Form
          </h2>
          <p className="text-xs text-slate-400">
            Observation window cutoff (T_cutoff = first 15 replies)
          </p>
        </div>

        {/* Preset Selector */}
        {presets.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
            </span>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`text-xs px-2.5 py-1 rounded-md transition font-medium ${
                  activePresetId === preset.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {preset.title.split(" ")[0]} ({preset.category})
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Post Text Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Initial Root Post Text
          </label>
          <textarea
            value={rootText}
            onChange={(e) => setRootText(e.target.value)}
            rows={3}
            required
            placeholder="Paste the root tweet or thread parent post here..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Feature Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Root Toxicity Pre-Score */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Root Post Toxicity</span>
              <span className="font-mono text-indigo-400 font-semibold">{rootHateScore.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.02"
              value={rootHateScore}
              onChange={(e) => setRootHateScore(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.0 (Benign)</span>
              <span>1.0 (Severe Toxicity)</span>
            </div>
          </div>

          {/* Early Mean Toxicity */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Early Mean Toxicity</span>
              <span className="font-mono text-indigo-400 font-semibold">{meanHate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.02"
              value={meanHate}
              onChange={(e) => setMeanHate(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Average toxicity in first 15 replies</span>
              <span>Threshold = 0.40</span>
            </div>
          </div>

          {/* Time Span & Velocity */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Early Window Duration
              </span>
              <span className="font-mono text-indigo-400 font-semibold">{timeSpanMins} min</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={timeSpanMins}
              onChange={(e) => setTimeSpanMins(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Velocity: <strong className="text-slate-300 font-mono">{velocity} replies/min</strong></span>
              <span>Cutoff Horizon</span>
            </div>
          </div>

          {/* Toxic Reply Ratio */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Toxic Reply Ratio
              </span>
              <span className="font-mono text-indigo-400 font-semibold">{(hateRatio * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={hateRatio}
              onChange={(e) => setHateRatio(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>% of early comments with toxicity &gt; 0.40</span>
              <span>Severe &gt; 25%</span>
            </div>
          </div>

          {/* Early Max Hate */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Early Peak Toxicity</span>
              <span className="font-mono text-indigo-400 font-semibold">{maxHate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.02"
              value={maxHate}
              onChange={(e) => setMaxHate(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Highest toxic score in early window</span>
              <span>Peak toxicity</span>
            </div>
          </div>

          {/* Participant Diversity */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> User Network Diversity
              </span>
              <span className="font-mono text-indigo-400 font-semibold">{(userDiversity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={userDiversity}
              onChange={(e) => setUserDiversity(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Low = Coordinated spam / bots</span>
              <span>High = Broad public crowd</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Form
          </button>

          <button
            type="submit"
            disabled={loading || !rootText.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Inference...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Predict Propagation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
