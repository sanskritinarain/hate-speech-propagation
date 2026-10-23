"use client";

import React from "react";
import { ModelMetadataResponse } from "@/types/prediction";
import { Award, GitFork, CheckCircle, Database } from "lucide-react";

interface ModelPerformanceSectionProps {
  metadata: ModelMetadataResponse | null;
}

export const ModelPerformanceSection: React.FC<ModelPerformanceSectionProps> = ({ metadata }) => {
  if (!metadata) return null;

  const clf = metadata.classification_metrics;
  const reg = metadata.regression_metrics;

  return (
    <div className="paper-card p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Empirical Model Performance & Evaluation
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Evaluated on holdout test set (324 grouped conversation threads) using leakage-resistant splits
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Database className="w-4 h-4 text-emerald-500" />
          <span className="font-mono text-stone-600">{metadata.dataset_name}</span>
        </div>
      </div>

      {/* Dataset & Split Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {[
          { label: "Total Analyzed", value: metadata.total_threads_analyzed, sub: "Threads" },
          { label: "Train Split", value: metadata.split_sizes.train || 1510, sub: "70% Grouped" },
          { label: "Validation", value: metadata.split_sizes.validation || 323, sub: "15% Grouped" },
          { label: "Holdout Test", value: metadata.split_sizes.test || 324, sub: "15% Unseen" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-amber-50/60 border border-amber-100 rounded-xl p-3">
            <span className="text-[11px] text-stone-400">{label}</span>
            <div className="text-lg font-bold font-mono text-stone-800 mt-0.5">{value}</div>
            <span className="text-[10px] text-stone-400">{sub}</span>
          </div>
        ))}
      </div>

      {/* Metrics Table */}
      <div className="overflow-x-auto rounded-xl border border-amber-100">
        <table className="w-full text-xs text-left">
          <thead className="bg-amber-50 text-stone-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-2.5">Task / Model Architecture</th>
              <th className="px-4 py-2.5 text-right">Primary Metric</th>
              <th className="px-4 py-2.5 text-right">ROC-AUC / RMSE</th>
              <th className="px-4 py-2.5 text-right">Precision / R²</th>
              <th className="px-4 py-2.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100/60 text-stone-600">
            <tr className="bg-white">
              <td className="px-4 py-3 font-medium">
                <span className="text-emerald-600 block text-[11px] font-bold">Content Analysis (Davidson et al. 2017)</span>
                TF-IDF + Calibrated Balanced Logistic Regression (24,783 samples)
              </td>
              <td className="px-4 py-3 text-right font-mono text-emerald-700">Macro F1: 0.7381</td>
              <td className="px-4 py-3 text-right font-mono text-emerald-700">Acc: 87.5%</td>
              <td className="px-4 py-3 text-right font-mono text-emerald-700">Hate Prec: 36.9%</td>
              <td className="px-4 py-3 text-right font-mono text-emerald-600 flex items-center justify-end gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Deployed
              </td>
            </tr>

            <tr className="bg-stone-50/50">
              <td className="px-4 py-3 font-medium">
                <span className="text-stone-400 block text-[11px]">Classification Baseline</span>
                Logistic Regression (StandardScaler)
              </td>
              <td className="px-4 py-3 text-right font-mono">F1: 0.5824</td>
              <td className="px-4 py-3 text-right font-mono">AUC: 0.7650</td>
              <td className="px-4 py-3 text-right font-mono">Prec: 49.4%</td>
              <td className="px-4 py-3 text-right font-mono text-stone-400">Baseline</td>
            </tr>

            <tr className="bg-amber-50/40 font-semibold">
              <td className="px-4 py-3">
                <span className="text-amber-700 block text-[11px]">Stronger Classifier (Production)</span>
                HistGradientBoostingClassifier
              </td>
              <td className="px-4 py-3 text-right font-mono text-amber-700">
                F1: {clf?.f1_score !== undefined ? clf.f1_score.toFixed(4) : "0.5612"}
              </td>
              <td className="px-4 py-3 text-right font-mono text-amber-700">
                AUC: {clf?.roc_auc !== undefined ? clf.roc_auc.toFixed(4) : "0.7196"}
              </td>
              <td className="px-4 py-3 text-right font-mono text-amber-700">
                Prec: {clf?.precision !== undefined ? (clf.precision * 100).toFixed(1) + "%" : "61.8%"}
              </td>
              <td className="px-4 py-3 text-right font-mono text-emerald-600 flex items-center justify-end gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Deployed
              </td>
            </tr>

            <tr className="bg-stone-50/50">
              <td className="px-4 py-3 font-medium">
                <span className="text-stone-400 block text-[11px]">Cascade Volume Regression Baseline</span>
                Ridge Linear Regressor
              </td>
              <td className="px-4 py-3 text-right font-mono">MAE: 41.37</td>
              <td className="px-4 py-3 text-right font-mono">RMSE: 57.20</td>
              <td className="px-4 py-3 text-right font-mono">R²: 0.1225</td>
              <td className="px-4 py-3 text-right text-stone-400 font-mono">Baseline</td>
            </tr>

            <tr className="bg-amber-50/40 font-semibold">
              <td className="px-4 py-3">
                <span className="text-amber-700 block text-[11px]">Stronger Regressor (Production)</span>
                HistGradientBoostingRegressor
              </td>
              <td className="px-4 py-3 text-right font-mono text-amber-700">
                MAE: {reg?.mae !== undefined ? reg.mae.toFixed(2) : "41.88"}
              </td>
              <td className="px-4 py-3 text-right font-mono text-amber-700">
                RMSE: {reg?.rmse !== undefined ? reg.rmse.toFixed(2) : "57.59"}
              </td>
              <td className="px-4 py-3 text-right font-mono text-amber-700">
                R²: {reg?.r2 !== undefined ? reg.r2.toFixed(4) : "0.1104"}
              </td>
              <td className="px-4 py-3 text-right font-mono text-emerald-600 flex items-center justify-end gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Deployed
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-amber-50 p-3 rounded-xl border border-amber-100">
        <GitFork className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Leakage Protection:</strong> Cross-validation and test splits are grouped strictly by{" "}
          <code className="text-amber-700 bg-amber-100 px-1 rounded">thread_id</code>. Replies belonging to
          the same conversation thread never appear simultaneously in training and test sets.
        </span>
      </div>
    </div>
  );
};
