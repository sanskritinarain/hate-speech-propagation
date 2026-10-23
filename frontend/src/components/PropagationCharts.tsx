"use client";

import React from "react";
import { TimelinePoint } from "@/types/prediction";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { LineChart as ChartIcon, Zap, BarChart3 } from "lucide-react";

interface PropagationChartsProps {
  timeline: TimelinePoint[];
  featureImportances?: Array<{ feature: string; importance: number; direction: "positive" | "negative" }>;
}

export const PropagationCharts: React.FC<PropagationChartsProps> = ({
  timeline,
  featureImportances = []
}) => {
  if (!timeline || timeline.length === 0) return null;

  const topFeatures = featureImportances.slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Cumulative Cascade Growth Curve */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <ChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Cumulative Cascade Volume Curve</h3>
              <p className="text-[11px] text-slate-400">Observed activity (solid) vs Projected future diffusion</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cascadeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time_marker" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  color: "#f8fafc"
                }}
                formatter={(val: number) => [`${val} replies`, "Cumulative Replies"]}
              />
              <ReferenceLine x={timeline[2]?.time_marker} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Cutoff", fill: "#f59e0b", fontSize: 10, position: "top" }} />
              <Area
                type="monotone"
                dataKey="cumulative_replies"
                stroke="#818cf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cascadeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Toxicity Intensity Trajectory */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Mean Toxicity Intensity Profile</h3>
              <p className="text-[11px] text-slate-400">Evolution of thread toxicity over the conversation lifecycle</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time_marker" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 1]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  color: "#f8fafc"
                }}
                formatter={(val: number) => [val.toFixed(2), "Mean Toxicity Score"]}
              />
              <ReferenceLine y={0.40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Toxicity Threshold (0.40)", fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }} />
              <Line
                type="monotone"
                dataKey="estimated_toxicity_mean"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ fill: "#f43f5e", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Feature Importance Ranking (if available) */}
      {topFeatures.length > 0 && (
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Primary Feature Importances (DRAGNET Model)</h3>
              <p className="text-[11px] text-slate-400">Standardized coefficient magnitudes driving the classification model</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {topFeatures.map((f, i) => (
              <div key={i} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5">
                  <span className="font-mono text-[11px]">{f.feature}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${f.direction === "positive" ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {f.direction === "positive" ? "+ Escalates" : "- Suppresses"}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${Math.min(f.importance * 70, 100)}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono mt-1">
                  Weight: {f.importance.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
