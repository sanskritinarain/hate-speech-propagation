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
  Share2
} from "lucide-react";

interface ResultsDashboardProps {
  prediction: PropagationPredictionResponse | null;
  loading: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  prediction,
  loading
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[360px] text-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-semibold text-white">Evaluating Early Activity Dynamics...</h3>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[360px] text-center border-dashed">
        <div className="p-3 bg-slate-800/80 rounded-2xl text-slate-400 mb-2">
          <Target className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No Prediction Yet</h3>
        <p className="text-xs text-slate-500 mt-1">
          Pick a preset or adjust sliders, then click <strong>Predict Propagation</strong>.
        </p>
      </div>
    );
  }

  const isHigh = prediction.escalation_risk === "HIGH";
  const isModerate = prediction.escalation_risk === "MODERATE";

  const riskBadgeStyles = isHigh
    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
    : isModerate
    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

  const riskIcon = isHigh ? (
    <ShieldAlert className="w-5 h-5 text-rose-400" />
  ) : isModerate ? (
    <AlertTriangle className="w-5 h-5 text-amber-400" />
  ) : (
    <ShieldCheck className="w-5 h-5 text-emerald-400" />
  );

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm space-y-4">
      {/* Platform Badge & Risk Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2.5 rounded-xl border ${riskBadgeStyles}`}>
            {riskIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadgeStyles}`}>
                {prediction.escalation_risk} RISK
              </span>
              {/* Social Media Platform Pill */}
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1">
                <Share2 className="w-3 h-3 text-indigo-400" />
                {prediction.platform_label || "Social Post"}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              {isHigh ? "High Escalation Forecast" : isModerate ? "Moderate Escalation" : "Contained Discussion"}
            </h3>
          </div>
        </div>

        {/* Probability Gauge */}
        <div className="w-32 text-right">
          <div className="text-xs text-slate-400 mb-0.5">
            Prob: <strong className="text-white font-mono font-bold">{(prediction.escalation_probability * 100).toFixed(0)}%</strong>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isHigh ? "bg-rose-500" : isModerate ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${prediction.escalation_probability * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Platform Diffusion Context Box */}
      {prediction.platform_context && (
        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <span className="text-indigo-400 font-medium shrink-0">Platform Dynamics:</span>
          <span className="truncate">{prediction.platform_context}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-indigo-400" /> Future Volume
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white">
              +{prediction.predicted_future_reply_volume}
            </span>
            <span className="text-[11px] text-slate-500">replies</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            CI: [{prediction.confidence_interval.lower_bound} - {prediction.confidence_interval.upper_bound}]
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" /> Final Projected Size
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white">
              {prediction.estimated_total_cascade_size}
            </span>
            <span className="text-[11px] text-slate-500">posts</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {prediction.cascade_reach_tier}
          </span>
        </div>
      </div>

      {/* Diagnostic Signals (Clean, minimal chips) */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Key Diagnostic Signals
        </span>
        <div className="grid grid-cols-2 gap-2">
          {prediction.contributing_factors.map((f, i) => (
            <div
              key={i}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between ${
                f.impact === "high_risk"
                  ? "bg-rose-950/20 border-rose-800/30 text-rose-300"
                  : f.impact === "moderate_risk"
                  ? "bg-amber-950/20 border-amber-800/30 text-amber-300"
                  : "bg-emerald-950/20 border-emerald-800/30 text-emerald-300"
              }`}
            >
              <span className="font-medium truncate">{f.label}</span>
              <span className="text-[10px] font-mono opacity-80 shrink-0 ml-1">
                {f.impact === "high_risk" ? "High" : f.impact === "moderate_risk" ? "Mid" : "Low"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
