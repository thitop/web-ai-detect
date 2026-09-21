// frontend/src/App.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import confetti from "canvas-confetti";

type Result = {
  label: string;
  score: number;
  confidence: number;
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files ? e.target.files[0] : null;
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch {
        // ignore
      }
    }
    setFile(f);
    setResult(null);
    setProgress(0);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const burstConfetti = (isReal = true) => {
    const colors = isReal
      ? ["#50E3C2", "#4A90E2", "#FF6B6B", "#FFD166", "#8E44AD"]
      : ["#FF6B6B", "#FF9E9E", "#FFCACA"];
    confetti({
      particleCount: 120,
      spread: 160,
      startVelocity: 40,
      ticks: 300,
      origin: { y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 40,
      origin: { x: 0.25, y: 1.1 },
      scalar: 1.5,
      colors,
    });
  };

  const screenShake = () => {
    if (!containerRef.current) return;
    containerRef.current.classList.remove("shake");
    void containerRef.current.offsetWidth;
    containerRef.current.classList.add("shake");
    setTimeout(() => {
      if (containerRef.current) containerRef.current.classList.remove("shake");
    }, 600);
  };

  const animateProgressTo = (targetPercent: number) => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    let current = progress;
    const durationMs = 700;
    const fps = 60;
    const steps = Math.max(1, Math.round((durationMs / 1000) * fps));
    const delta = (targetPercent - current) / steps;
    let step = 0;
    progressIntervalRef.current = window.setInterval(() => {
      step += 1;
      current = Math.min(targetPercent, current + delta);
      setProgress(Math.round(current));
      if (step >= steps) {
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(Math.round(targetPercent));
      }
    }, Math.round(1000 / fps));
  };

  const upload = async () => {
    if (!file) return alert("Please select an image first.");
    setLoading(true);
    setResult(null);
    setProgress(6);
    try {
      const form = new FormData();
      form.append("file", file);

      const resp = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        body: form,
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`API error: ${resp.status} ${txt}`);
      }
      const data: Result = await resp.json();

      const percent = Math.min(100, Math.round(data.confidence));
      animateProgressTo(percent);

      if (data.label.toLowerCase().includes("real")) {
        setTimeout(() => burstConfetti(true), 600);
      } else {
        setTimeout(() => screenShake(), 200);
        setTimeout(() => burstConfetti(false), 700);
      }

      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 700);
    } catch (err) {
      setLoading(false);
      screenShake();
      try {
        burstConfetti(false);
      } catch {
        // ignore
      }

      let message = "An error occurred";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      alert("Error: " + message);
    }
  };

  return (
    <div className="page-bg" ref={containerRef}>
      <div className="card">
        <header className="hero">
          <h1 className="title">AI Image Detector</h1>
          <p className="subtitle">Upload an image to detect if it's Real or AI-Generated.</p>
        </header>

        <div className="content-grid">
          <div className="left">

            {/* Fixed Size Image Frame */}
            <div 
              className={`image-frame ${!preview ? 'clickable' : ''} ${loading ? 'scanning' : ''}`}
              onClick={() => {
                if (!preview && !loading) {
                  fileInputRef.current?.click();
                }
              }}
            >
              {loading && <div className="scan-line"></div>}
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.img
                    key={preview}
                    src={preview}
                    alt="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="preview-img"
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="placeholder"
                  >
                    <div className="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <div className="upload-text">Click to browse or drag image here</div>
                    <div className="note">Supports JPG, PNG, WebP</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="controls">
              <input
                id="file"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />

              <button
                className="btn primary"
                onClick={upload}
                disabled={loading || !file}
              >
                {loading ? "Analyzing..." : "Analyze Image"}
              </button>

              {(file || preview || result) && (
                <button
                  className="btn neutral"
                  onClick={() => {
                    if (preview) {
                      try { URL.revokeObjectURL(preview); } catch { }
                    }
                    setFile(null);
                    setPreview(null);
                    setResult(null);
                    setProgress(0);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={loading}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="right">
            <div className="result-card">
              <div className="result-header">
                <h3>Analysis Result</h3>
                <div
                  className={`badge ${result
                      ? result.label.toLowerCase().includes("real")
                        ? "real"
                        : "fake"
                      : ""
                    }`}
                >
                  {result ? result.label : "Waiting..."}
                </div>
              </div>

              <div className="meter">
                <div className="meter-bar">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${progress}%`,
                      background: result
                        ? result.label.toLowerCase().includes("real")
                          ? "linear-gradient(90deg,#50E3C2,#4A90E2)"
                          : "linear-gradient(90deg,#FF8A80,#FF5252)"
                        : "linear-gradient(90deg,#cfd9ff,#e2f0ff)",
                    }}
                  />
                </div>
                <div className="meter-text">
                  {result
                    ? `${result.confidence.toFixed(2)}% Confidence`
                    : `${progress}% Processing`}
                </div>
              </div>

              <div className="raw">
                <pre>
                  {result
                    ? JSON.stringify(result, null, 2)
                    : "Raw data will appear here..."}
                </pre>
              </div>
            </div>

            <motion.div
              className="fun-panel"
              animate={{
                y: result && result.label.toLowerCase().includes("fake") ? [0, -6, 6, -4, 0] : 0,
              }}
              transition={{ duration: 0.6 }}
            >
              <div className="fun-title">How to use</div>
              <div className="fun-body">
                <div>1. Click <strong>"Choose File"</strong> to select an image.</div>
                <div>2. Click <strong>"Analyze Image"</strong> to start.</div>
                <div>3. Wait for the result: <strong>Real</strong> or <strong>Fake</strong>.</div>
              </div>
            </motion.div>
          </div>
        </div>

        <footer className="foot">
          <small>AI Artifact Scanner V2.0</small>
        </footer>
      </div>
    </div>
  );
}