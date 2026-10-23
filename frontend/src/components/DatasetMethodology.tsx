"use client";

import React from "react";
import { BookOpen, FileText, CheckCircle2, AlertOctagon, Lock } from "lucide-react";

export const DatasetMethodology: React.FC = () => {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Research Methodology & Dataset Formulation
        </h3>
        <p className="text-xs text-slate-400">
          Proactive Hate Speech Propagation in Online Conversation Trees
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300">
        {/* Research Papers Cited */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <h4 className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" /> Foundational Research Frameworks
          </h4>
          <ul className="space-y-2.5">
            <li className="border-l-2 border-indigo-500/50 pl-2.5">
              <strong className="text-white block">DRAGNET & DRAGNET++ (KBS 2023)</strong>
              <span className="text-slate-400 text-[11px]">
                <em>"Predicting Hate Intensity of Twitter Conversation Threads"</em> (Qing Meng, Tharun Suresh, Roy Ka-Wei Lee, Tanmoy Chakraborty). Models conversation cascade trees and reply arrival dynamics.
              </span>
            </li>
            <li className="border-l-2 border-violet-500/50 pl-2.5">
              <strong className="text-white block">HEAR Framework (IEEE ICDMW)</strong>
              <span className="text-slate-400 text-[11px]">
                <em>"Early Prediction of Hate Speech Propagation"</em> (Ken-Yu Lin, Roy Ka-Wei Lee, Wei Gao, Wen-Chih Peng). Demonstrated that observing the first 15 minutes of propagation provides critical predictive signals for final hate volume.
              </span>
            </li>
          </ul>
        </div>

        {/* Prediction Task & Observation Horizon */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <h4 className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Early Observation Horizon (T_obs)
          </h4>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Content moderators cannot wait for a conversation thread to conclude before intervening. By locking the early observation cutoff at the first <strong>15 replies ($K=15$)</strong>, the model forecasts:
          </p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span><strong>Future Toxicity Escalation (Classification):</strong> Will future replies experience severe hate escalation (top quartile intensity)?</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span><strong>Future Volume Diffusion (Regression):</strong> How many replies will accumulate after the observation cutoff?</span>
            </div>
          </div>
        </div>

        {/* Leakage Prevention */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <h4 className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-amber-400" /> Anti-Leakage Protocol
          </h4>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Standard random train/test splits cause severe data leakage because replies from the same thread share conversational context and user graph edges. Our pipeline enforces strict <strong>Grouped Splitting by Thread ID</strong> (70% Train, 15% Validation, 15% Test) to ensure evaluation tests out-of-sample generalization.
          </p>
        </div>

        {/* Privacy & Dataset Provenance */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <h4 className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-400" /> Privacy & Platform Terms Compliance
          </h4>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            In accordance with social platform developer agreements (X/Twitter Terms Clause 2.a), personally identifiable information (PII) and full raw tweet corpora are excluded from source control. Features and aggregated thread dynamics are extracted and serialized into anonymized inference pipelines.
          </p>
        </div>
      </div>
    </div>
  );
};
