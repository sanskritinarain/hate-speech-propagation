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
  Info,
  CheckCircle,
  HelpCircle
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
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[350px] text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <h3 className="text-base font-semibold text-white">Evaluating Early Activity Dynamics...</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Feeding temporal acceleration, participant diversity, and early toxicity profiles into the trained HistGradientBoosting model.
        </p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[350px] text-center border-dashed">
        <div className="p-3 bg-slate-800/80 rounded-2xl text-slate-400 mb-3">
          <Target className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No Prediction Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Adjust the early observation metrics or click one of the quick presets above, then click <strong>Predict Propagation</strong> to generate future cascade estimates.
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
    <ShieldAlert className="w-6 h-6 text-rose-400" />
  ) : isModerate ? (
    <AlertTriangle className="w-6 h-6 text-amber-400" />
  ) : (
    <ShieldCheck className="w-6 h-6 text-emerald-400" />
  );

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm space-y-6">
      {/* Top Banner: Risk Status & Probability */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-2xl border ${riskBadgeStyles}`}>
            {riskIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${riskBadgeStyles}`}>
                {prediction.escalation_risk} RISK
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {prediction.cascade_reach_tier}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Future Hate Escalation: {isHigh ? "Severe Cascade Likely" : isModerate ? "Moderate Escalation" : "Low Propagation Risk"}
            </h3>
          </div>
        </div>

        {/* Probability Gauge */}
        <div className="w-full sm:w-44 text-right">
          <div className="flex justify-between sm:justify-end gap-2 text-xs text-slate-400 mb-1">
            <span>Escalation Prob:</span>
            <span className="font-mono font-bold text-white">
              {(prediction.escalation_probability * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isHigh ? "bg-rose-500" : isModerate ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${prediction.escalation_probability * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Numerical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Future Reply Volume */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Future Post-Cutoff Volume
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              +{prediction.predicted_future_reply_volume}
            </span>
            <span className="text-xs text-slate-400">replies</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            CI 80%: [{prediction.confidence_interval.lower_bound} - {prediction.confidence_interval.upper_bound}]
          </p>
        </div>

        {/* Estimated Total Cascade */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Final Projected Thread Size
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {prediction.estimated_total_cascade_size}
            </span>
            <span className="text-xs text-slate-400">total posts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {prediction.cascade_reach_tier}
          </p>
        </div>

        {/* Observation Model Source */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" /> Active Model
          </span>
          <div className="mt-2 text-xs font-semibold text-slate-200">
            {prediction.model_source}
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 shrink-0" /> Verified DRAGNET Benchmark
          </p>
        </div>
      </div>

      {/* Contributing Factors Diagnosis */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" /> Primary Diagnostic Signals
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {prediction.contributing_factors.map((factor, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                factor.impact === "high_risk"
                  ? "bg-rose-950/20 border-rose-800/40 text-rose-200"
                  : factor.impact === "moderate_risk"
                  ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                  : "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
              }`}
            >
              <div className="mt-0.5">
                {factor.impact === "high_risk" ? (
                  <span className="w-2 h-2 rounded-full bg-rose-400 block" />
                ) : factor.impact === "moderate_risk" ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 block" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                )}
              </div>
              <div>
                <strong className="font-semibold block">{factor.label}</strong>
                <span className="text-[11px] opacity-80">{factor.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Caveat Box */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>{prediction.caveats_and_responsible_use}</p>
      </div>
    </div>
  );
};
