"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { PredictionForm } from "@/components/PredictionForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { PropagationCharts } from "@/components/PropagationCharts";
import { ModelPerformanceSection } from "@/components/ModelPerformanceSection";
import { DatasetMethodology } from "@/components/DatasetMethodology";
import { ResponsibleUseModal } from "@/components/ResponsibleUseModal";

import { 
  fetchHealth, 
  fetchModelMetadata, 
  predictPropagation 
} from "@/lib/api";
import { 
  EarlyPostAnalysisRequest, 
  PropagationPredictionResponse, 
  ModelMetadataResponse 
} from "@/types/prediction";
import { AlertCircle, LineChart, Award, BookOpen } from "lucide-react";

export default function Home() {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<"real_model_inference" | "synthetic_demo_mode" | "uninitialized">("uninitialized");
  const [metadata, setMetadata] = useState<ModelMetadataResponse | null>(null);
  const [prediction, setPrediction] = useState<PropagationPredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isResponsibleUseOpen, setIsResponsibleUseOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"charts" | "metrics" | "methodology">("charts");

  const initData = async () => {
    try {
      setError(null);
      const health = await fetchHealth();
      setBackendOnline(true);
      setModelMode(health.mode as "real_model_inference" | "synthetic_demo_mode");

      const meta = await fetchModelMetadata().catch(() => null);
      if (meta) setMetadata(meta);

      setLoading(true);
      const initialPred = await predictPropagation({
        root_text: "These illegal foreigners are destroying our nation, why is nobody taking direct action against them?!",
        platform: "twitter",
        root_hate_score: 0.72,
        early_reply_count: 15,
        early_time_span_mins: 20.0,
        early_mean_hate: 0.42,
        early_max_hate: 0.85,
        early_std_hate: 0.19,
        early_hate_ratio: 0.35,
        early_user_diversity: 0.80,
      });
      setPrediction(initialPred);
    } catch {
      setBackendOnline(false);
      setModelMode("synthetic_demo_mode");
      setError("Cannot reach backend on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handlePredict = async (data: EarlyPostAnalysisRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictPropagation(data);
      setPrediction(res);
      setModelMode(res.mode);
    } catch (err: any) {
      setError(err.message || "Prediction error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500">
      <Header
        onOpenResponsibleUse={() => setIsResponsibleUseOpen(true)}
        backendOnline={backendOnline}
        modelMode={modelMode}
      />

      <DemoModeBanner mode={modelMode} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 px-4 py-2 rounded-xl flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={initData} className="underline hover:text-white">Retry</button>
          </div>
        )}

        {/* Primary Interactive Workspace: Form on Left, Output on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6">
            <PredictionForm
              onSubmit={handlePredict}
              loading={loading}
            />
          </div>

          <div className="lg:col-span-6">
            <ResultsDashboard
              prediction={prediction}
              loading={loading}
            />
          </div>
        </div>

        {/* Clean Secondary Navigation Tabs (Keeps page uncluttered) */}
        <div className="pt-2">
          <div className="flex items-center justify-center space-x-2 border-b border-slate-800/80 pb-3">
            <button
              onClick={() => setActiveTab("charts")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "charts"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Cascade Dynamics & Projections</span>
            </button>

            <button
              onClick={() => setActiveTab("metrics")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "metrics"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Model Evaluation</span>
            </button>

            <button
              onClick={() => setActiveTab("methodology")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "methodology"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Research Dataset</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="mt-4">
            {activeTab === "charts" && prediction && (
              <PropagationCharts
                timeline={prediction.timeline_projection}
                featureImportances={metadata?.feature_importances}
              />
            )}

            {activeTab === "metrics" && (
              <ModelPerformanceSection metadata={metadata} />
            )}

            {activeTab === "methodology" && (
              <DatasetMethodology />
            )}
          </div>
        </div>
      </main>

      <ResponsibleUseModal
        isOpen={isResponsibleUseOpen}
        onClose={() => setIsResponsibleUseOpen(false)}
      />
    </div>
  );
}
