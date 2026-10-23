"use client";

import React from "react";
import { BookOpen, FileText, CheckCircle2, AlertOctagon, Lock } from "lucide-react";

export const DatasetMethodology: React.FC = () => {
  return (
    <div className="paper-card p-6 space-y-6">
      <div className="border-b border-amber-100 pb-4">
        <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          Research Methodology & Dataset Formulation
        </h3>
        <p className="text-xs text-stone-400 mt-0.5">
          Proactive Hate Speech Propagation in Online Conversation Trees
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-stone-600">
        {/* Foundational Research */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 space-y-3">
          <h4 className="font-semibold text-stone-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-600" /> Foundational Research Frameworks
          </h4>
          <ul className="space-y-2.5">
            <li className="border-l-2 border-amber-400 pl-2.5">
              <strong className="text-stone-700 block">DRAGNET & DRAGNET++ (KBS 2023)</strong>
              <span className="text-stone-400 text-[11px]">
                <em>"Predicting Hate Intensity of Twitter Conversation Threads"</em> (Qing Meng, Tharun Suresh,
                Roy Ka-Wei Lee, Tanmoy Chakraborty). Models conversation cascade trees and reply arrival dynamics.
              </span>
            </li>
            <li className="border-l-2 border-orange-400 pl-2.5">
              <strong className="text-stone-700 block">HEAR Framework (IEEE ICDMW)</strong>
              <span className="text-stone-400 text-[11px]">
                <em>"Early Prediction of Hate Speech Propagation"</em> (Ken-Yu Lin, Roy Ka-Wei Lee, Wei Gao,
                Wen-Chih Peng). Demonstrated that observing the first 15 minutes provides critical predictive
                signals for final hate volume.
              </span>
            </li>
          </ul>
        </div>

        {/* Observation Horizon */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 space-y-3">
          <h4 className="font-semibold text-stone-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Early Observation Horizon (T_obs)
          </h4>
          <p className="text-stone-400 leading-relaxed text-[11px]">
            Content moderators cannot wait for a conversation thread to conclude before intervening. By locking
            the early observation cutoff at the first <strong className="text-stone-600">15 replies (K=15)</strong>,
            the model forecasts:
          </p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>
                <strong className="text-stone-600">Future Toxicity Escalation (Classification):</strong> Will
                future replies experience severe hate escalation (top quartile intensity)?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
              <span>
                <strong className="text-stone-600">Future Volume Diffusion (Regression):</strong> How many
                replies will accumulate after the observation cutoff?
              </span>
            </div>
          </div>
        </div>

        {/* Leakage Prevention */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 space-y-2">
          <h4 className="font-semibold text-stone-700 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-500" /> Anti-Leakage Protocol
          </h4>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            Standard random train/test splits cause severe data leakage because replies from the same thread
            share conversational context and user graph edges. Our pipeline enforces strict{" "}
            <strong className="text-stone-600">Grouped Splitting by Thread ID</strong> (70% Train, 15%
            Validation, 15% Test) to ensure evaluation tests out-of-sample generalization.
          </p>
        </div>

        {/* Privacy */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 space-y-2">
          <h4 className="font-semibold text-stone-700 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-500" /> Privacy & Platform Terms Compliance
          </h4>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            In accordance with social platform developer agreements (X/Twitter Terms Clause 2.a), personally
            identifiable information (PII) and full raw tweet corpora are excluded from source control.
            Features and aggregated thread dynamics are extracted and serialized into anonymized inference
            pipelines.
          </p>
        </div>
      </div>
    </div>
  );
};
