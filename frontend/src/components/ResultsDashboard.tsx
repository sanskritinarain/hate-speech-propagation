"use client";

import React from "react";
import { PropagationPredictionResponse } from "@/types/prediction";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  Target, 
  Zap,
  Users,
  Clock,
  ExternalLink
} from "lucide-react";

interface ResultsDashboardProps {
  prediction: PropagationPredictionResponse | null;
  loading: boolean;
}

const PLATFORM_ICONS: Record<string, string> = {
  twitter: "𝕏",
  reddit: "🔴",
  youtube: "▶️",
  instagram: "📸",
  facebook: "👥",
  other: "🌐",
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  prediction,
  loading
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[380px] text-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-semibold text-white">Analyzing Propagation Potential...</h3>
        <p className="text-xs text-slate-500 mt-1">Evaluating viral momentum and audience escalation risk</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[380px] text-center border-dashed">
        <div className="p-3 bg-slate-800/80 rounded-2xl text-slate-400 mb-2">
          <Target className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Awaiting Input</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Enter a post on the left and click <strong>Predict Propagation</strong> to see its source, risk tier, and viral forecast.
        </p>
      </div>
    );
  }

  const isHigh = prediction.escalation_risk === "HIGH";
  const isModerate = prediction.escalation_risk === "MODERATE";

  const riskBadgeStyles = isHigh
    ? "bg-rose-500/15 text-rose-400 border-rose-500/40"
    : isModerate
    ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/40";

  const riskIcon = isHigh ? (
    <ShieldAlert className="w-6 h-6 text-rose-400" />
  ) : isModerate ? (
    <AlertTriangle className="w-6 h-6 text-amber-400" />
  ) : (
    <ShieldCheck className="w-6 h-6 text-emerald-400" />
  );

  const platformKey = prediction.platform || "twitter";
  const platformEmoji = PLATFORM_ICONS[platformKey] || "🌐";

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm space-y-4">
      
      {/* 1. SOURCE PLATFORM HEADER (Prominently displayed first) */}
      <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="text-2xl">{platformEmoji}</span>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
              Post Origin Source
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              {prediction.platform_label || "Social Platform"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">Diffusion Style</span>
          <span className="text-[11px] text-indigo-300 font-medium">
            {platformKey === "twitter"
              ? "Quote-Retweets & Retweet Chains"
              : platformKey === "reddit"
              ? "Nested Comment Trees"
              : platformKey === "instagram"
              ? "Direct Comments & Mentions"
              : platformKey === "youtube"
              ? "Pinned & Top Comment Clusters"
              : "Discussion Threads"}
          </span>
        </div>
      </div>

      {/* 2. RISK LEVEL & ESCALATION PROBABILITY */}
      <div className={`p-4 rounded-xl border ${riskBadgeStyles} space-y-2.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {riskIcon}
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-80 block">
                Propagation Escalation Risk
              </span>
              <h3 className="text-lg font-extrabold text-white">
                {prediction.escalation_risk} RISK
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] opacity-80 block font-medium">Escalation Likelihood</span>
            <span className="text-xl font-black font-mono text-white">
              {(prediction.escalation_probability * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Probability Progress Bar */}
        <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isHigh ? "bg-rose-500" : isModerate ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${prediction.escalation_probability * 100}%` }}
          />
        </div>
      </div>

      {/* 3. ONLY IMPORTANT FEATURES FOR PROPAGATION */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Key Propagation Forecast Signals
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Feature 1: Future Volume */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Future Volume
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              +{prediction.predicted_future_reply_volume}{" "}
              <span className="text-xs font-normal text-slate-400">replies</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              CI: [{prediction.confidence_interval.lower_bound} - {prediction.confidence_interval.upper_bound}]
            </div>
          </div>

          {/* Feature 2: Total Cascade Size */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Total Thread Reach
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {prediction.estimated_total_cascade_size}{" "}
              <span className="text-xs font-normal text-slate-400">posts</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium truncate">
              {prediction.cascade_reach_tier}
            </div>
          </div>
        </div>

        {/* Feature 3 & 4: Diagnostic Summary Chips */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {prediction.contributing_factors.slice(0, 4).map((f, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                f.impact === "high_risk"
                  ? "bg-rose-950/20 border-rose-800/30 text-rose-300"
                  : f.impact === "moderate_risk"
                  ? "bg-amber-950/20 border-amber-800/30 text-amber-300"
                  : "bg-emerald-950/20 border-emerald-800/30 text-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[11px] truncate">{f.label}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-950/40">
                  {f.impact === "high_risk" ? "High" : f.impact === "moderate_risk" ? "Mid" : "Low"}
                </span>
              </div>
              <span className="text-[10px] opacity-80 leading-tight line-clamp-1">{f.description}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
