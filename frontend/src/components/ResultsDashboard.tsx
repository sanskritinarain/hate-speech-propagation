"use client";

import React from "react";
import { PipelineAnalysisResponse } from "@/types/prediction";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Layers,
  Target,
  Link2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  ExternalLink,
  BarChart2,
  Activity,
} from "lucide-react";

interface ResultsDashboardProps {
  pipelineResult?: PipelineAnalysisResponse | null;
  loading: boolean;
}

const PLATFORM_ICONS: Record<string, string> = {
  twitter: "𝕏",
  reddit: "🔴",
  youtube: "▶️",
  instagram: "📸",
  facebook: "👥",
  direct_text: "📝",
  unsupported: "🌐",
  other: "🌐",
};

const DIFFUSION_STYLES: Record<string, string> = {
  twitter: "Quote-Retweets & Retweet Chains",
  reddit: "Nested Comment Trees",
  instagram: "Direct Comments & Mentions",
  youtube: "Pinned & Top Comment Clusters",
  other: "Discussion Threads",
  direct_text: "Direct Text Evaluation",
};

const RETRIEVAL_STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  SUCCESS: { label: "Full Data Retrieved", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
  METADATA_ONLY: { label: "Metadata Only", color: "text-amber-700 bg-amber-50 border-amber-200", icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> },
  CREDENTIALS_REQUIRED: { label: "Credentials Required", color: "text-orange-700 bg-orange-50 border-orange-200", icon: <AlertCircle className="w-3.5 h-3.5 text-orange-500" /> },
  UNSUPPORTED_PLATFORM: { label: "Unsupported Platform", color: "text-rose-700 bg-rose-50 border-rose-200", icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> },
  POST_NOT_FOUND: { label: "Post Not Found", color: "text-rose-700 bg-rose-50 border-rose-200", icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> },
  RATE_LIMITED: { label: "Rate Limited", color: "text-orange-700 bg-orange-50 border-orange-200", icon: <Clock className="w-3.5 h-3.5 text-orange-500" /> },
  ERROR: { label: "Retrieval Error", color: "text-rose-700 bg-rose-50 border-rose-200", icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> },
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  pipelineResult,
  loading
}) => {
  if (loading) {
    return (
      <div className="paper-card p-8 flex flex-col items-center justify-center min-h-[420px] text-center">
        <div className="relative mb-4">
          <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
        </div>
        <h3 className="text-sm font-bold text-stone-700">Analyzing Propagation Potential...</h3>
        <p className="text-xs text-stone-400 mt-1">Evaluating viral momentum and escalation risk</p>
        <div className="mt-4 flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!pipelineResult) {
    return (
      <div className="paper-card p-8 flex flex-col items-center justify-center min-h-[420px] text-center border-dashed border-2 border-amber-200">
        <div className="p-4 bg-amber-50 rounded-2xl mb-3">
          <Target className="w-7 h-7 text-amber-400" />
        </div>
        <h3 className="text-sm font-bold text-stone-600">Awaiting Analysis</h3>
        <p className="text-xs text-stone-400 mt-1.5 max-w-xs leading-relaxed">
          Enter a post URL or text on the left and click{" "}
          <strong className="text-amber-700">Predict Propagation</strong> to see
          source provenance, content risk, and viral forecast.
        </p>
      </div>
    );
  }

  const { source, content_analysis, propagation_forecast } = pipelineResult;
  const platformKey = source.platform.toLowerCase();
  const platformEmoji = PLATFORM_ICONS[platformKey] || "🌐";
  const diffusionStyle = DIFFUSION_STYLES[platformKey] || "Discussion Threads";

  const retrievalInfo = RETRIEVAL_STATUS_LABELS[source.status] || RETRIEVAL_STATUS_LABELS["ERROR"];

  const isHate = content_analysis.primary_category === "hate_speech";
  const isOffensive = content_analysis.primary_category === "offensive_language";

  const forecastAvailable = propagation_forecast.status === "AVAILABLE";
  const isHigh = propagation_forecast.escalation_risk === "HIGH";
  const isModerate = propagation_forecast.escalation_risk === "MODERATE";

  return (
    <div className="paper-card p-5 space-y-4">

      {/* ── 1. SOURCE PROVENANCE PANEL ── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Database className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Source Provenance</span>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-3">
          {/* Platform + Status Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{platformEmoji}</span>
              <div>
                <span className="text-xs font-bold text-stone-800 block">{source.platform_label}</span>
                {source.post_id && (
                  <span className="text-[10px] font-mono text-stone-400">ID: {source.post_id}</span>
                )}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${retrievalInfo.color}`}>
              {retrievalInfo.icon}
              <span>{retrievalInfo.label}</span>
            </div>
          </div>

          {/* Canonical URL */}
          {source.canonical_url && source.canonical_url !== "direct_text" && (
            <div className="flex items-start gap-2">
              <Link2 className="w-3 h-3 text-stone-400 mt-0.5 shrink-0" />
              <a
                href={source.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-amber-700 hover:text-amber-900 font-mono truncate flex-1 flex items-center gap-1 hover:underline"
              >
                {source.canonical_url}
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2">
            {source.author && (
              <div className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2.5 py-1.5 border border-amber-100">
                <User className="w-3 h-3 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-stone-400 uppercase font-semibold block">Author</span>
                  <span className="text-[11px] font-medium text-stone-700 truncate block">{source.author}</span>
                </div>
              </div>
            )}
            {source.published_at && (
              <div className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2.5 py-1.5 border border-amber-100">
                <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-stone-400 uppercase font-semibold block">Published</span>
                  <span className="text-[11px] font-medium text-stone-700 truncate block">
                    {new Date(source.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2.5 py-1.5 border border-amber-100">
              <BarChart2 className="w-3 h-3 text-stone-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] text-stone-400 uppercase font-semibold block">Comments Captured</span>
                <span className="text-[11px] font-medium text-stone-700">
                  {source.observed_comments.length}
                  <span className="text-[9px] text-stone-400 font-normal ml-1">early replies</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2.5 py-1.5 border border-amber-100">
              <Clock className="w-3 h-3 text-stone-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] text-stone-400 uppercase font-semibold block">Retrieved At</span>
                <span className="text-[11px] font-medium text-stone-700 truncate block">
                  {new Date(source.retrieval_timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>

          {/* Platform Diffusion Style */}
          <div className="flex items-center justify-between pt-0.5 border-t border-amber-100">
            <span className="text-[10px] text-stone-400 font-medium">Diffusion Pattern</span>
            <span className="text-[11px] text-amber-700 font-semibold">{diffusionStyle}</span>
          </div>

          {/* Provenance note */}
          {source.provenance && (
            <div className="text-[10px] text-stone-400 italic leading-relaxed bg-white/50 rounded-lg p-2 border border-amber-100">
              {source.provenance}
            </div>
          )}

          {/* Credentials warning */}
          {source.credentials_help && (
            <div className="text-[10px] text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2 leading-relaxed">
              <strong>Setup:</strong> {source.credentials_help}
            </div>
          )}

          {/* Missing fields */}
          {source.missing_fields.length > 0 && (
            <div className="text-[10px] text-stone-400 flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-stone-500">Unavailable fields:</strong>{" "}
                {source.missing_fields.join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. CONTENT TAXONOMY ── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          {isHate ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          ) : isOffensive ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          )}
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Content Classification</span>
        </div>

        <div className={`rounded-xl border p-3.5 space-y-3 ${
          isHate
            ? "bg-rose-50 border-rose-200"
            : isOffensive
            ? "bg-amber-50 border-amber-200"
            : "bg-emerald-50 border-emerald-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-extrabold ${isHate ? "text-rose-800" : isOffensive ? "text-amber-800" : "text-emerald-800"}`}>
                {content_analysis.category_label}
              </h3>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isHate ? "text-rose-500" : isOffensive ? "text-amber-500" : "text-emerald-500"}`}>
                {content_analysis.severity} Severity
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-medium block">Hate Intensity</span>
              <span className={`text-2xl font-black font-mono ${isHate ? "text-rose-700" : isOffensive ? "text-amber-700" : "text-emerald-700"}`}>
                {(content_analysis.hate_intensity_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Probability bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-stone-500 font-medium">
              <span>Hate: {(content_analysis.category_scores.hate_speech * 100).toFixed(0)}%</span>
              <span>Offensive: {(content_analysis.category_scores.offensive_language * 100).toFixed(0)}%</span>
              <span>Neutral: {(content_analysis.category_scores.neither * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden flex">
              <div className="bg-rose-400 h-full transition-all" style={{ width: `${content_analysis.category_scores.hate_speech * 100}%` }} />
              <div className="bg-amber-400 h-full transition-all" style={{ width: `${content_analysis.category_scores.offensive_language * 100}%` }} />
              <div className="bg-emerald-400 h-full transition-all" style={{ width: `${content_analysis.category_scores.neither * 100}%` }} />
            </div>
          </div>

          {/* Model provenance */}
          <div className="text-[10px] text-stone-400 italic">{content_analysis.model_provenance}</div>
        </div>
      </div>

      {/* ── 3. PROPAGATION FORECAST ── */}
      {forecastAvailable && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Propagation Forecast</span>
          </div>

          <div className="space-y-3">
            {/* Escalation Risk */}
            <div className={`rounded-xl border p-3.5 space-y-2.5 ${
              isHigh
                ? "bg-rose-50 border-rose-200"
                : isModerate
                ? "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isHigh ? (
                    <div className="p-2 bg-rose-100 rounded-xl">
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                    </div>
                  ) : isModerate ? (
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                      Escalation Risk
                    </span>
                    <h4 className={`text-lg font-extrabold ${isHigh ? "text-rose-700" : isModerate ? "text-amber-700" : "text-emerald-700"}`}>
                      {propagation_forecast.escalation_risk} RISK
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block font-medium">Escalation Likelihood</span>
                  <span className={`text-2xl font-black font-mono ${isHigh ? "text-rose-700" : isModerate ? "text-amber-700" : "text-emerald-700"}`}>
                    {(propagation_forecast.escalation_probability! * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full bg-white/60 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isHigh ? "bg-rose-500" : isModerate ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${(propagation_forecast.escalation_probability! * 100)}%` }}
                />
              </div>
            </div>

            {/* Volume Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium">Future Volume</span>
                </div>
                <div className="text-xl font-bold font-mono text-stone-800">
                  +{propagation_forecast.predicted_future_reply_volume}
                  <span className="text-xs font-normal text-stone-400 ml-1">replies</span>
                </div>
                {propagation_forecast.prediction_interval && (
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                    CI [{propagation_forecast.prediction_interval.lower_bound}–{propagation_forecast.prediction_interval.upper_bound}]
                  </div>
                )}
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium">Total Cascade</span>
                </div>
                <div className="text-xl font-bold font-mono text-stone-800">
                  {propagation_forecast.estimated_total_cascade_size}
                  <span className="text-xs font-normal text-stone-400 ml-1">posts</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5 font-medium truncate">
                  {propagation_forecast.cascade_reach_tier}
                </div>
              </div>
            </div>

            {/* Diagnostic Signal Factors */}
            {propagation_forecast.diagnostic_factors.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Key Risk Signals
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {propagation_forecast.diagnostic_factors.slice(0, 4).map((f, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                        f.impact === "high_risk"
                          ? "bg-rose-50 border-rose-200"
                          : f.impact === "moderate_risk"
                          ? "bg-amber-50 border-amber-200"
                          : "bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-[11px] truncate ${f.impact === "high_risk" ? "text-rose-700" : f.impact === "moderate_risk" ? "text-amber-700" : "text-emerald-700"}`}>
                          {f.label}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          f.impact === "high_risk" ? "bg-rose-100 text-rose-600" : f.impact === "moderate_risk" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                        }`}>
                          {f.impact === "high_risk" ? "High" : f.impact === "moderate_risk" ? "Mid" : "Low"}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 leading-tight line-clamp-2">{f.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observation window info */}
            <div className="flex items-center gap-2 text-[10px] text-stone-400 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
              <Clock className="w-3 h-3 shrink-0" />
              <span>
                Based on{" "}
                <strong className="text-stone-600">{propagation_forecast.observed_replies_analyzed} early replies</strong>{" "}
                {propagation_forecast.observed_time_span_mins && (
                  <>over <strong className="text-stone-600">{propagation_forecast.observed_time_span_mins.toFixed(0)} min</strong></>
                )}
                {" "}— {propagation_forecast.observation_window_cutoff}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Forecast unavailable notice */}
      {!forecastAvailable && propagation_forecast.unavailability_reason && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-stone-500">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-stone-600 block mb-0.5">Propagation Forecast Unavailable</strong>
            <span className="leading-relaxed">{propagation_forecast.unavailability_reason}</span>
          </div>
        </div>
      )}

    </div>
  );
};
