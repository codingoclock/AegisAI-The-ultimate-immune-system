"use client";

import { useEffect, useRef, useState } from "react";

type LogRecord = {
  timestamp: string;
  level: string;
  service: string;
  message: string;
  meta?: any;
};

const DEFAULT_WS = (typeof window !== "undefined" &&
  (process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:8000/ws/logs")) as string;

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [paused, setPaused] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = () => {
      try {
        const url = DEFAULT_WS;
        if (!url) {
          console.warn("WebSocket URL not configured");
          return;
        }

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.info("Logs WS connected");
          if (mounted) {
            setWsConnected(true);
            reconnectRef.current = 0;
          }
        };

        ws.onmessage = (ev) => {
          if (!mounted) return;
          try {
            const payload = JSON.parse(ev.data);
            if (payload.type === "recent") {
              const items: LogRecord[] = payload.logs || [];
              setLogs((s) => {
                const merged = [...s, ...items];
                return merged.slice(-500);
              });
            } else if (payload.type === "log") {
              const item: LogRecord = payload.log;
              setLogs((s) => {
                const next = [...s, item].slice(-500);
                return next;
              });
            }
          } catch (e) {
            console.warn("Invalid log payload", e);
          }
        };

        ws.onclose = () => {
          console.warn("Logs WS closed, reconnecting...");
          if (mounted) {
            setWsConnected(false);
          }
          if (!mounted) return;
          // exponential backoff capped
          reconnectRef.current = Math.min(reconnectRef.current + 1, 6);
          const wait = 1000 * Math.pow(2, reconnectRef.current);
          setTimeout(connect, wait);
        };

        ws.onerror = (e) => {
          console.error("Logs WS error details:", {
            type: e.type,
            message: (e as any).message || "Unknown error",
            readyState: ws.readyState,
            url: ws.url,
          });
          if (mounted) {
            setWsConnected(false);
          }
          ws.close();
        };
      } catch (err) {
        console.error("Failed to create WebSocket:", err);
        if (mounted) {
          setWsConnected(false);
          reconnectRef.current = Math.min(reconnectRef.current + 1, 6);
          const wait = 1000 * Math.pow(2, reconnectRef.current);
          setTimeout(connect, wait);
        }
      }
    };

    // Add small delay to ensure page is mounted before connecting
    const timer = setTimeout(connect, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    // auto-scroll on new logs
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs, paused]);

  const clearLogs = () => setLogs([]);
  const togglePause = () => setPaused((p) => !p);

  const levels = ["ALL", "ERROR", "WARNING", "INFO", "DEBUG"];

  const colorFor = (level?: string) => {
    switch ((level || "").toUpperCase()) {
      case "ERROR":
        return "text-red-400";
      case "WARNING":
        return "text-yellow-300";
      case "INFO":
        return "text-green-300";
      default:
        return "text-slate-300";
    }
  };

  const visible = logs.filter((l) => levelFilter === "ALL" || l.level === levelFilter);

  return (
    <div className="flex flex-1 flex-col gap-4 pb-2">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">Logs</h1>
        <p className="mt-1 text-xs text-slate-400 md:text-sm">Real-time application logs streamed from backend.</p>
      </div>

      <div className="glass-panel flex flex-col gap-3 px-4 py-3 text-xs text-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={clearLogs} className="btn-sm">Clear</button>
            <button onClick={togglePause} className="btn-sm">{paused ? "Resume" : "Pause"}</button>
            <label className="ml-2 text-slate-300">Level:</label>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="ml-1 bg-slate-800 text-slate-200 text-xs p-1 rounded">
              {levels.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded pill ${wsConnected ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
              {wsConnected ? '● Connected' : '○ Connecting...'}
            </span>
            <span className="text-slate-400">{logs.length} logs</span>
          </div>
        </div>

        {!wsConnected && logs.length === 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300 text-xs">
            ⚠️ WebSocket connecting... Logs will appear once connected.
          </div>
        )}

        <div ref={containerRef} className="h-96 overflow-y-auto bg-surface p-3 rounded text-sm">
          {visible.length === 0 && (
            <div className="text-foreground/50">
              {logs.length === 0 ? 'Waiting for logs...' : 'No logs match filter.'}
            </div>
          )}
          {visible.map((rec, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-start gap-3">
                <div className={`w-2.5 mt-1 h-2.5 rounded-full ${colorFor(rec.level)}`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">{new Date(rec.timestamp).toLocaleString()}</div>
                    <div className="text-xs text-slate-500">{rec.service} • <span className={`font-medium ${colorFor(rec.level)}`}>{rec.level}</span></div>
                  </div>
                  <div className="text-sm text-slate-200">{rec.message}</div>
                  {rec.meta && <pre className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">{JSON.stringify(rec.meta)}</pre>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

