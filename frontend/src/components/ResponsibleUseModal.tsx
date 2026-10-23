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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl shadow-amber-900/10 space-y-5 text-stone-700">
        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Scale className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-800">Responsible Use & Ethical Guidelines</h3>
              <p className="text-xs text-stone-400">Governance framework for proactive moderation tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-amber-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
          {[
            {
              icon: <AlertTriangle className="w-4 h-4" />,
              color: "text-rose-700 bg-rose-50 border-rose-200",
              iconColor: "text-rose-600",
              title: "1. No Autonomous Deplatforming or Pre-emptive Censorship",
              body: "This system forecasts statistical likelihoods based on early conversation momentum. It must never be used to autonomously delete user accounts or pre-emptively silence users based on forecasts alone."
            },
            {
              icon: <Eye className="w-4 h-4" />,
              color: "text-amber-700 bg-amber-50 border-amber-200",
              iconColor: "text-amber-600",
              title: "2. Human-in-the-Loop Content Moderation",
              body: "High-risk flags should trigger human review queues or passive counter-measures (such as inserting verified context, rate-limiting spam accounts, or prompting users for civil discourse) rather than automated speech suppression."
            },
            {
              icon: <ShieldCheck className="w-4 h-4" />,
              color: "text-blue-700 bg-blue-50 border-blue-200",
              iconColor: "text-blue-600",
              title: "3. Accounting for Counter-Speech & Reclaimed Slang",
              body: "Early intense debate frequently involves well-intentioned users pushing back against toxic behavior (counter-speech) or marginalized communities reclaiming identity terms. Lexicon and statistical models can generate false positives if context is ignored."
            },
            {
              icon: <HelpCircle className="w-4 h-4" />,
              color: "text-stone-600 bg-stone-50 border-stone-200",
              iconColor: "text-stone-400",
              title: "4. Non-Generalization Across Non-English Platforms",
              body: "The underlying DRAGNET benchmark reflects historical conversational samples from Twitter/X. Cross-platform diffusion dynamics on Reddit, TikTok, or multi-lingual forums may exhibit different cascade patterns and require retuning."
            }
          ].map(({ icon, color, title, body }, i) => (
            <div key={i} className={`p-4 rounded-xl border space-y-1.5 ${color}`}>
              <h4 className="font-semibold flex items-center gap-1.5">
                {icon} {title}
              </h4>
              <p className="opacity-80">{body}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-md shadow-amber-200"
          >
            I Acknowledge & Understand
          </button>
        </div>
      </div>
    </div>
  );
};
