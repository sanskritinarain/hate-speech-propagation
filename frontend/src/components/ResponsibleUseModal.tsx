"use client";

import React from "react";
import { X, Scale, AlertTriangle, Eye, ShieldCheck, HelpCircle } from "lucide-react";

interface ResponsibleUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResponsibleUseModal: React.FC<ResponsibleUseModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Responsible Use & Ethical Guidelines</h3>
              <p className="text-xs text-slate-400">Governance framework for proactive moderation tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          {/* Section 1 */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-semibold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> 1. No Autonomous Deplatforming or Pre-emptive Censorship
            </h4>
            <p className="text-slate-400">
              This system forecasts statistical likelihoods based on early conversation momentum. It must <strong>never</strong> be used to autonomously delete user accounts or pre-emptively silence users based on forecasts alone.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> 2. Human-in-the-Loop Content Moderation
            </h4>
            <p className="text-slate-400">
              High-risk flags should trigger human review queues or passive counter-measures (such as inserting verified context, rate-limiting spam accounts, or prompting users for civil discourse) rather than automated speech suppression.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-semibold text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 3. Accounting for Counter-Speech & Reclaimed Slang
            </h4>
            <p className="text-slate-400">
              Early intense debate frequently involves well-intentioned users pushing back against toxic behavior (counter-speech) or marginalized communities reclaiming identity terms. Lexicon and statistical models can generate false positives if context is ignored.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" /> 4. Non-Generalization Across Non-English Platforms
            </h4>
            <p className="text-slate-400">
              The underlying DRAGNET benchmark reflects historical conversational samples from Twitter/X. Cross-platform diffusion dynamics on Reddit, TikTok, or multi-lingual forums may exhibit different cascade patterns and require retuning.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
          >
            I Acknowledge & Understand
          </button>
        </div>
      </div>
    </div>
  );
};
