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
  fetchSamplePresets, 
  predictPropagation 
} from "@/lib/api";
import { 
  EarlyPostAnalysisRequest, 
  PropagationPredictionResponse, 
  ModelMetadataResponse, 
  SamplePreset 
} from "@/types/prediction";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Home() {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<"real_model_inference" | "synthetic_demo_mode" | "uninitialized">("uninitialized");
  const [metadata, setMetadata] = useState<ModelMetadataResponse | null>(null);
  const [presets, setPresets] = useState<SamplePreset[]>([]);
  const [prediction, setPrediction] = useState<PropagationPredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isResponsibleUseOpen, setIsResponsibleUseOpen] = useState<boolean>(false);

  const initData = async () => {
    try {
      setError(null);
      const health = await fetchHealth();
      setBackendOnline(true);
      setModelMode(health.mode as "real_model_inference" | "synthetic_demo_mode");

      const [meta, samplePresets] = await Promise.all([
        fetchModelMetadata().catch(() => null),
        fetchSamplePresets().catch(() => [])
      ]);

      if (meta) setMetadata(meta);
      if (samplePresets) setPresets(samplePresets);

      // Auto-run initial prediction with the first preset to display immediately
      if (samplePresets && samplePresets.length > 0) {
        const defaultPreset = samplePresets[0];
        setLoading(true);
        const initialPred = await predictPropagation(defaultPreset.data);
        setPrediction(initialPred);
        setLoading(false);
      }
    } catch (err: any) {
      setBackendOnline(false);
      setModelMode("synthetic_demo_mode");
      setError(
        "Could not connect to FastAPI backend on http://localhost:8001. Start the backend with 'uvicorn app.main:app --port 8001 --reload'."
      );
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
      setError(err.message || "Prediction error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header
        onOpenResponsibleUse={() => setIsResponsibleUseOpen(true)}
        backendOnline={backendOnline}
        modelMode={modelMode}
      />

      <DemoModeBanner
        mode={modelMode}
        datasetProvenance={metadata?.source_repository}
        totalThreads={metadata?.total_threads_analyzed}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert if backend offline */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={initData}
              className="flex items-center space-x-1 px-3 py-1 bg-rose-900/60 hover:bg-rose-800 rounded-lg text-rose-200 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Early Prediction of Hate Speech Propagation
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Forecasting downstream conversation hostility and viral cascade volume from early engagement signals (T_obs &le; 15 replies). Grounded in the DRAGNET and HEAR research benchmarks.
          </p>
        </div>

        {/* Primary Workspace: Form on Left, Results on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6">
            <PredictionForm
              onSubmit={handlePredict}
              loading={loading}
              presets={presets}
            />
          </div>

          <div className="lg:col-span-6">
            <ResultsDashboard
              prediction={prediction}
              loading={loading}
            />
          </div>
        </div>

        {/* Section 2: Recharts Dynamic Projection */}
        {prediction && (
          <PropagationCharts
            timeline={prediction.timeline_projection}
            featureImportances={metadata?.feature_importances}
          />
        )}

        {/* Section 3: Empirical Model Performance Table */}
        <ModelPerformanceSection metadata={metadata} />

        {/* Section 4: Dataset Research & Methodology */}
        <DatasetMethodology />
      </main>

      <ResponsibleUseModal
        isOpen={isResponsibleUseOpen}
        onClose={() => setIsResponsibleUseOpen(false)}
      />

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>
            Hate Speech Propagation Prediction System • Full-Stack ML Architecture (Next.js 14 + FastAPI + scikit-learn)
          </p>
          <p className="text-[11px] text-slate-600">
            Research reference: DRAGNET++ (Knowledge-Based Systems 2023) & HEAR Framework (IEEE ICDMW).
          </p>
        </div>
      </footer>
    </div>
  );
}
