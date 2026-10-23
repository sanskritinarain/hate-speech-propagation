"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { PredictionForm } from "@/components/PredictionForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { ModelPerformanceSection } from "@/components/ModelPerformanceSection";
import { DatasetMethodology } from "@/components/DatasetMethodology";
import { ResponsibleUseModal } from "@/components/ResponsibleUseModal";

import {
  fetchHealth,
  fetchModelMetadata,
  analyzeSource
} from "@/lib/api";
import {
  PipelineAnalysisResponse,
  ModelMetadataResponse
} from "@/types/prediction";
import { AlertCircle, Award, BookOpen, RefreshCw } from "lucide-react";

export default function Home() {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<"real_model_inference" | "synthetic_demo_mode" | "uninitialized">("uninitialized");
  const [metadata, setMetadata] = useState<ModelMetadataResponse | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isResponsibleUseOpen, setIsResponsibleUseOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "methodology" | "none">("none");

  const initData = async () => {
    try {
      setError(null);
      const health = await fetchHealth();
      setBackendOnline(true);
      setModelMode(health.mode as "real_model_inference" | "synthetic_demo_mode");

      const meta = await fetchModelMetadata().catch(() => null);
      if (meta) setMetadata(meta);
    } catch {
      setBackendOnline(false);
      setModelMode("synthetic_demo_mode");
      setError("Cannot reach backend server on port 8001.");
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handlePredict = async (inputSource: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeSource(inputSource);
      setPipelineResult(res);
    } catch (err: any) {
      setError(err.message || "Prediction error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onOpenResponsibleUse={() => setIsResponsibleUseOpen(true)}
        backendOnline={backendOnline}
        modelMode={modelMode}
      />

      <DemoModeBanner mode={modelMode} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-rose-700">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={initData}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-medium underline"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Primary Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <PredictionForm
              onSubmit={handlePredict}
              loading={loading}
            />
          </div>

          <div className="lg:col-span-7">
            <ResultsDashboard
              pipelineResult={pipelineResult}
              loading={loading}
            />
          </div>
        </div>

        {/* Secondary Tabs */}
        <div className="pt-2">
          <div className="flex items-center justify-center gap-2 border-b border-amber-100 pb-3">
            <button
              onClick={() => setActiveTab(activeTab === "metrics" ? "none" : "metrics")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
                activeTab === "metrics"
                  ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200"
                  : "bg-white text-stone-500 border-stone-200 hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Model Evaluation</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === "methodology" ? "none" : "methodology")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
                activeTab === "methodology"
                  ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200"
                  : "bg-white text-stone-500 border-stone-200 hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Research Dataset</span>
            </button>
          </div>

          <div className="mt-4">
            {activeTab === "metrics" && (
              <ModelPerformanceSection metadata={metadata} />
            )}
            {activeTab === "methodology" && (
              <DatasetMethodology />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-100 bg-amber-50/40 py-4 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <span>Propagation Predictor — Research Prototype</span>
          <span>Based on DRAGNET & HEAR frameworks · Davidson et al. 2017 benchmark</span>
        </div>
      </footer>

      <ResponsibleUseModal
        isOpen={isResponsibleUseOpen}
        onClose={() => setIsResponsibleUseOpen(false)}
      />
    </div>
  );
}
