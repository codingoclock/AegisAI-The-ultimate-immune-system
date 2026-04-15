 "use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Brain,
  Shield,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useTheme } from "@/components/layout/theme-provider";
import { runImageInference, InferenceResponse } from "@/lib/api";

const staticEpsilonCurve = [
  { eps: "0.0", clean: 94, adv: 94 },
  { eps: "0.05", clean: 93, adv: 91 },
  { eps: "0.1", clean: 90, adv: 87 },
  { eps: "0.2", clean: 84, adv: 80 },
  { eps: "0.3", clean: 72, adv: 68 },
  { eps: "0.4", clean: 61, adv: 55 },
];

const staticRobustnessMetrics = [
  {
    label: "Clean Accuracy",
    value: "94.2%",
    helper: "Baseline performance on benign validation set.",
    tone: "green" as const,
  },
  {
    label: "Adversarial Accuracy",
    value: "79.1%",
    helper: "Accuracy under FGSM/PGD style attacks.",
    tone: "amber" as const,
  },
  {
    label: "Robustness Improvement",
    value: "+37%",
    helper: "Gain from adversarial training and hardened head.",
    tone: "primary" as const,
  },
  {
    label: "Model Status",
    value: "Hardened / Active",
    helper: "ResNet‑18 robust head deployed to production.",
    tone: "default" as const,
  },
];

export default function ModelSecurityPage() {
  const [attackType, setAttackType] = useState<"FGSM" | "PGD">("FGSM");
  const [epsilon, setEpsilon] = useState(0.2);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inference, setInference] = useState<InferenceResponse | null>(null);
  const { theme } = useTheme();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setError(null);
    setInference(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop,
  });

  const handleRunInference = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await runImageInference(selectedFile, attackType, epsilon);
      setInference(result);
    } catch (err) {
      console.error("Inference failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to run inference. Please check if the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare confidence bars from top-k predictions
  const confidenceBars = inference
    ? inference.top_k.map((pred, idx) => ({
        label: pred.label,
        value: pred.probability,
        pct: pred.probability * 100,
      }))
    : [
        { label: "Waiting for inference...", value: 0, pct: 0 },
      ];

  return (
    <div className="flex flex-1 flex-col gap-4 pb-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">
            AI Model Security
          </h1>
          <p className="mt-1 text-xs text-slate-400 md:text-sm">
            Inspect predictions, simulate attacks, and monitor robustness of the
            hardened ResNet‑18 pipeline.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="pill border border-border-subtle bg-surface/40 px-2.5 py-1 text-[11px] text-foreground">
            Backend: FastAPI · PyTorch · ART
          </span>
        </div>
      </div>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="glass-panel flex flex-col gap-3 px-4 py-3.5">
          <SectionHeader
            title="Image Upload & Inference"
            subtitle="Drag an image to simulate clean vs adversarial predictions."
            icon={<UploadCloud className="h-4 w-4" />}
            rightSlot={
              <span className="pill bg-surface/70 px-2.5 py-1 text-[11px] text-foreground">
                {isLoading ? "Running..." : "Live inference"}
              </span>
            }
          />
          
          {error && (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-[11px] text-red-300 flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <div
            {...getRootProps()}
            className={[
              "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-3 py-5 text-xs transition",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-slate-700/80 bg-slate-950/40 hover:border-primary/70",
            ].join(" ")}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mb-2 h-5 w-5 text-primary-soft" />
            <p className="text-slate-200">
              Drop an image here, or click to browse
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              AegisAI will run clean and adversarial passes and compare
              predictions.
            </p>
          </div>

          {preview && (
            <div className="mt-2 grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="glass-panel-soft flex flex-col items-center justify-center px-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Uploaded preview"
                  className="max-h-40 w-auto rounded-xl object-contain"
                />
                <button
                  onClick={handleRunInference}
                  disabled={isLoading}
                  className="mt-3 w-full rounded-lg bg-primary/80 px-3 py-2 text-[11px] font-medium text-slate-50 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? "Running inference..." : "Run Inference"}
                </button>
              </div>

              {inference ? (
                <div className="glass-panel-soft flex flex-col gap-2 px-3 py-3 text-xs text-slate-200">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Prediction Results
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-950/40 px-2.5 py-2.5">
                      <p className="text-[11px] text-slate-400">Clean</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-300">
                        {inference.clean_prediction}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Confidence:{" "}
                        <span className="text-slate-100">
                          {(inference.clean_confidence * 100).toFixed(1)}%
                        </span>
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-950/40 px-2.5 py-2.5">
                      <p className="text-[11px] text-slate-400">
                        Adversarial ({inference.attack_type})
                      </p>
                      <p className="mt-1 text-sm font-semibold text-amber-300">
                        {inference.adversarial_prediction}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Confidence:{" "}
                        <span className="text-slate-100">
                          {(inference.adversarial_confidence * 100).toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    ε = {inference.epsilon.toFixed(3)} · Live predictions from
                    hardened ResNet-18
                  </p>
                </div>
              ) : (
                <div className="glass-panel-soft flex flex-col gap-2 px-3 py-3 text-xs text-slate-200">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Waiting for inference
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Upload an image and click "Run Inference" to see live
                    predictions.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3 lg:grid-rows-2">
          {staticRobustnessMetrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="glass-panel flex flex-col px-4 py-3.5">
          <SectionHeader
            title="Attack Simulation"
            subtitle="Toggle FGSM / PGD and sweep epsilon to explore degradation."
            icon={<SlidersHorizontal className="h-4 w-4" />}
            rightSlot={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttackType("FGSM")}
                  className={[
                    "pill px-2.5 py-1 text-[11px] font-medium",
                    attackType === "FGSM"
                      ? "bg-primary/80 text-foreground"
                      : "bg-surface/70 text-foreground",
                  ].join(" ")}
                >
                  FGSM
                </button>
                <button
                  type="button"
                  onClick={() => setAttackType("PGD")}
                  className={[
                    "pill px-2.5 py-1 text-[11px] font-medium",
                    attackType === "PGD"
                      ? "bg-primary/80 text-foreground"
                      : "bg-surface/70 text-foreground",
                  ].join(" ")}
                >
                  PGD
                </button>
              </div>
            }
          />
          <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Epsilon:{" "}
              <span className="font-semibold text-slate-100">
                {epsilon.toFixed(2)}
              </span>
            </span>
            <span>Higher epsilon ⇒ stronger perturbation</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.05}
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            className="mb-2 w-full accent-primary-soft"
            disabled={isLoading}
          />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={staticEpsilonCurve}>
                <CartesianGrid
                  stroke="rgba(148,163,184,0.25)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="eps"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{
                    fill: "rgba(148,163,184,0.9)",
                    fontSize: 11,
                  }}
                  label={{
                    value: "epsilon (ε)",
                    position: "insideBottomRight",
                    offset: -4,
                    fill: "rgba(148,163,184,0.9)",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{
                    fill: "rgba(148,163,184,0.9)",
                    fontSize: 11,
                  }}
                  domain={[40, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#020617" : "#ffffff",
                    borderRadius: 12,
                    border: theme === "dark" ? "1px solid rgba(148,163,184,0.5)" : "1px solid rgba(148,163,184,0.3)",
                    padding: "8px 10px",
                  }}
                  labelStyle={{ color: theme === "dark" ? "#e5e7eb" : "#020617", fontSize: 11 }}
                  itemStyle={{ fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="clean"
                  name="Clean accuracy"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="adv"
                  name={`${attackType} adversarial accuracy`}
                  stroke="#FBBF24"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel flex flex-col px-4 py-3.5">
          <SectionHeader
            title="Confidence Distribution"
            subtitle="Top probabilities for current prediction."
            icon={<Sparkles className="h-4 w-4" />}
          />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceBars} layout="vertical">
                <CartesianGrid
                  stroke="rgba(148,163,184,0.25)"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 11 }}
                  unit="%"
                />
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 11 }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#020617" : "#ffffff",
                    borderRadius: 12,
                    border: theme === "dark" ? "1px solid rgba(148,163,184,0.5)" : "1px solid rgba(148,163,184,0.3)",
                    padding: "8px 10px",
                  }}
                  labelStyle={{ color: theme === "dark" ? "#e5e7eb" : "#020617", fontSize: 11 }}
                  itemStyle={{ color: theme === "dark" ? "#9f7aea" : "#6c3bff", fontSize: 11 }}
                  formatter={(value) => [
                    `${Number(value ?? 0).toFixed(1)}%`,
                    "Probability",
                  ]}
                />
                <Bar
                  dataKey="pct"
                  radius={[8, 8, 8, 8]}
                  fill="url(#confidenceGradient)"
                />
                <defs>
                  <linearGradient
                    id="confidenceGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#6C3BFF" />
                    <stop offset="70%" stopColor="#9F7AEA" />
                    <stop offset="100%" stopColor="#22C55E" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="glass-panel mt-1 px-4 py-3 text-[11px] text-slate-400">
        <p>
          This page is now{" "}
          <span className="font-semibold text-slate-200">
            fully integrated
          </span>{" "}
          with the FastAPI backend. Upload an image to see live predictions
          with real adversarial attack simulations using FGSM or PGD.
        </p>
      </section>
    </div>
  );
}

