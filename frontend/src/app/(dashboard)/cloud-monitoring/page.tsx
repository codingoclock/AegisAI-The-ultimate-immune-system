'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { TimeSeriesCard } from "@/components/charts/time-series-card";
import { PieCard } from "@/components/charts/pie-card";
import { RadialRiskCard } from "@/components/charts/radial-risk-card";
import { LiveEventFeed, SecurityEvent } from "@/components/layout/live-event-feed";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Globe2 } from "lucide-react";
import { predictAnomaly, AnomalyFeatures } from "@/lib/api";

// --- HELPER: Generate realistic anomaly features for cloud monitoring samples ---
function generateAnomalySample(): AnomalyFeatures & { metadata: { actor: string; location: string; threatType: string; timestamp: Date } } {
  // Generate realistic feature values
  // Normal ranges: impossible_travel_speed (0-1), login_frequency (0-10), ip_change_count (0-3)
  // Anomalous ranges: higher values
  
  const isAnomalyPattern = Math.random() < 0.3; // 30% chance of anomaly pattern
  
  const impossible_travel_speed = isAnomalyPattern
    ? 2 + Math.random() * 3  // 2-5 km/h (geographically improbable)
    : Math.random() * 0.5;   // 0-0.5 km/h (normal)
  
  const login_frequency_1hr = isAnomalyPattern
    ? 8 + Math.random() * 12  // 8-20 logins/hr (suspicious spike)
    : Math.random() * 4;      // 0-4 logins/hr (normal)
  
  const ip_change_count_24hr = isAnomalyPattern
    ? 5 + Math.random() * 5   // 5-10 IP changes (unusual)
    : Math.random() * 2;      // 0-2 IP changes (normal)
  
  // Metadata for mapping to security events
  const threatPatterns = [
    { type: "Impossible Travel", actor: `user-${Math.random().toString(36).substring(7)}`, location: ["Tokyo", "Paris", "Moscow", "Sydney", "Dubai"][Math.floor(Math.random() * 5)] },
    { type: "Brute Force", actor: `service-${Math.random().toString(36).substring(7)}`, location: ["unknown-ip", "compromised-endpoint", "external-gateway"][Math.floor(Math.random() * 3)] },
    { type: "Unusual Login Time", actor: `admin-${Math.random().toString(36).substring(7)}`, location: ["Off-hours", "Weekend", "Midnight"][Math.floor(Math.random() * 3)] },
    { type: "High‑Risk IP", actor: `gateway-${Math.random().toString(36).substring(7)}`, location: ["High-risk region", "VPN exit", "Datacenter"][Math.floor(Math.random() * 3)] },
  ];
  
  const patternIndex = Math.floor(Math.random() * threatPatterns.length);
  const pattern = threatPatterns[patternIndex];
  
  return {
    impossible_travel_speed,
    login_frequency_1hr,
    ip_change_count_24hr,
    metadata: {
      actor: pattern.actor,
      location: pattern.location,
      threatType: pattern.type,
      timestamp: new Date(),
    },
  };
}

// --- HELPER: Map backend anomaly prediction to SecurityEvent ---
function anomalyToSecurityEvent(
  prediction: { is_anomaly: boolean; model_score: number },
  sample: ReturnType<typeof generateAnomalySample>
): SecurityEvent {
  const { actor, location, threatType, timestamp } = sample.metadata;
  const severity = prediction.is_anomaly ? "anomaly" : "normal";
  
  // Build threat-specific descriptions
  const descriptionMap: Record<string, string> = {
    "Impossible Travel": `User detected at ${sample.impossible_travel_speed.toFixed(2)} km/h across regions within minutes; geographically improbable location change detected.`,
    "Brute Force": `${Math.round(sample.login_frequency_1hr)} failed login attempts detected in 1 hour; account security may be compromised.`,
    "Unusual Login Time": `Login detected outside normal user activity window; pattern differs from historical baseline.`,
    "High‑Risk IP": `Login from ${location} (high-risk jurisdiction); IP associated with credential abuse campaigns.`,
  };
  
  const timeAgoMs = Date.now() - timestamp.getTime();
  const seconds = Math.floor(timeAgoMs / 1000);
  let timeAgo = "now";
  if (seconds < 60) timeAgo = `${seconds}s ago`;
  else if (seconds < 3600) timeAgo = `${Math.floor(seconds / 60)}m ago`;
  else timeAgo = `${Math.floor(seconds / 3600)}h ago`;
  
  return {
    id: `${Date.now()}-${Math.random()}`,
    type: threatType,
    severity: severity === "anomaly" ? "anomaly" : severity === "suspicious" ? "suspicious" : "normal",
    actor,
    location,
    timeAgo,
    description: descriptionMap[threatType] || `${threatType} detected.`,
  };
}

export default function CloudMonitoringPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{ timestamp: string; value: number }>>([]);
  const [threatDistribution, setThreatDistribution] = useState<Array<{ name: string; value: number }>>([]);
  const [riskScore, setRiskScore] = useState(50);
  const [totalAnomalies, setTotalAnomalies] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("now");
  
  // Keep a sliding window of anomalies for time series (last 60 minutes)
  const [anomalyHistory, setAnomalyHistory] = useState<Array<{ time: Date; isAnomaly: boolean }>>([]);

  // --- CORE: Fetch real anomaly predictions and update state ---
  const fetchAndUpdateAnomalies = useCallback(async () => {
    try {
      // Generate multiple samples to simulate real event stream
      const samples = Array(5).fill(null).map(() => generateAnomalySample());
      
      const predictions = await Promise.all(
        samples.map(sample => 
          predictAnomaly({
            impossible_travel_speed: sample.impossible_travel_speed,
            login_frequency_1hr: sample.login_frequency_1hr,
            ip_change_count_24hr: sample.ip_change_count_24hr,
          })
        )
      );
      
      // Map predictions to security events
      const newEvents = predictions.map((pred, idx) =>
        anomalyToSecurityEvent(pred, samples[idx])
      );
      
      // Update events (keep last 50)
      setEvents(prev => [
        ...newEvents,
        ...prev.slice(0, Math.max(0, 50 - newEvents.length))
      ]);
      
      // Update history for time series
      const newHistory = predictions.map((pred, idx) => ({
        time: samples[idx].metadata.timestamp,
        isAnomaly: pred.is_anomaly,
      }));
      
      setAnomalyHistory(prev => {
        const combined = [...newHistory, ...prev];
        // Keep only last hour of data
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        return combined.filter(item => item.time.getTime() > oneHourAgo);
      });
      
      // Calculate time series data (bucketed by 5-min intervals)
      const now = Date.now();
      const buckets: Map<number, number> = new Map();
      
      for (let i = 0; i < 12; i++) {
        const bucketTime = now - (11 - i) * 5 * 60 * 1000;
        buckets.set(bucketTime, 0);
      }
      
      anomalyHistory.forEach(item => {
        if (item.isAnomaly) {
          const bucketTime = Math.floor(item.time.getTime() / (5 * 60 * 1000)) * 5 * 60 * 1000;
          buckets.set(bucketTime, (buckets.get(bucketTime) || 0) + 1);
        }
      });
      
      const timeSeriesArray = Array.from(buckets.entries())
        .map(([time, count]) => ({
          timestamp: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: count,
        }))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      
      setTimeSeriesData(timeSeriesArray);
      
      // Calculate threat distribution
      const threatCounts: Record<string, number> = {};
      newEvents.forEach(event => {
        threatCounts[event.type] = (threatCounts[event.type] || 0) + 1;
      });
      
      const threatDist = Object.entries(threatCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      
      setThreatDistribution(threatDist);
      
      // Calculate metrics
      const anomalyCount = newEvents.filter(e => e.severity === "anomaly").length;
      const totalCount = newEvents.length;
      
      setTotalAnomalies(prev => prev + anomalyCount);
      setActiveSessions(prev => Math.max(1800, Math.min(2100, prev + Math.random() * 200 - 100)));
      
      // Calculate risk score (0-100) based on anomaly ratio
      const anomalyRatio = totalCount > 0 ? anomalyCount / totalCount : 0;
      const newRiskScore = Math.round(anomalyRatio * 80 + 20); // Base 20, up to 100
      setRiskScore(newRiskScore);
      
      // Update last update time
      setLastUpdateTime(new Date().toLocaleTimeString());
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to fetch anomalies:", error);
      setIsConnected(false);
      // Keep showing previous data on error
    }
  }, []);

  // --- POLLING: Set up polling interval for real-time updates ---
  useEffect(() => {
    // Fetch immediately on mount
    fetchAndUpdateAnomalies();
    
    // Set up polling every 4 seconds
    const interval = setInterval(fetchAndUpdateAnomalies, 4000);
    
    return () => clearInterval(interval);
  }, [fetchAndUpdateAnomalies]);

  // Compute risk level text based on score
  const riskLevelText = useMemo(() => {
    if (riskScore >= 70) return "Critical";
    if (riskScore >= 50) return "High";
    if (riskScore >= 30) return "Medium";
    return "Low";
  }, [riskScore]);

  // Geo activity snapshot data (derived from recent events)
  const geoSnapshot = useMemo(() => {
    const recentEvents = events.slice(0, 3);
    return recentEvents.map(event => ({
      location: event.location,
      count: Math.floor(Math.random() * 50 + 100),
      anomalies: Math.floor(Math.random() * 15),
    }));
  }, [events]);

  return (
    <div className="flex flex-1 flex-col gap-4 pb-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">
            Cloud & Identity Monitoring
          </h1>
          <p className="mt-1 text-xs text-slate-400 md:text-sm">
            Real‑time view into login anomalies, identity risk, and geo‑based signalsacross your cloud perimeter.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="pill border border-border-subtle bg-surface/40 px-2.5 py-1 text-[11px] text-foreground">
            Backed by IsolationForest anomaly engine
          </span>
          <span className={`pill px-2.5 py-1 text-[11px] font-medium ${
            isConnected
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-rose-500/15 text-rose-300'
          }`}>
            {isConnected ? '● Live' : '○ Offline'}
          </span>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard
          label="Active Sessions"
          value={activeSessions.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          helper="Across web, mobile, and service principals."
          tone="default"
        />
        <StatCard
          label="Anomalies (Session)"
          value={totalAnomalies.toString()}
          helper="Identity outliers from IsolationForest model."
          tone="amber"
        />
        <StatCard
          label="Risk Level"
          value={riskLevelText}
          helper={`Risk score: ${riskScore}/100 • Updated ${lastUpdateTime}`}
          tone={riskScore >= 70 ? "primary" : riskScore >= 50 ? "amber" : "default"}
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <TimeSeriesCard
          title="Anomalies Over Time"
          subtitle="Real predictions from backend IsolationForest model."
          data={timeSeriesData.length > 0 ? timeSeriesData : [{ timestamp: "Loading...", value: 0 }]}
          metricLabel="anomalies"
        />
        <div className="space-y-3">
          <RadialRiskCard score={riskScore} />
          <PieCard
            title="Threat Distribution"
            subtitle={threatDistribution.length > 0 ? "Current threat patterns detected." : "Analyzing patterns..."}
            data={threatDistribution.length > 0 ? threatDistribution : [{ name: "Analyzing", value: 1 }]}
          />
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          <LiveEventFeed events={events.length > 0 ? events : []} />
        </div>
        <div className="glass-panel flex h-80 flex-col px-4 py-3.5">
          <SectionHeader
            title="Geo Activity Snapshot"
            subtitle="Top regions from detected events."
            icon={<Globe2 className="h-4 w-4" />}
          />
          <div className="relative mt-1 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/40 text-xs text-slate-400">
            <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-primary/5 via-sky-500/5 to-emerald-400/5 blur-[4px]" />
            <p className="relative text-center">
              Geo visualization goes here.
              <br />
              Wire this block to your map provider or internal geo‑IP service.
            </p>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
            {geoSnapshot.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-slate-950/40 px-2.5 py-1.5"
              >
                <p className="font-medium text-slate-200">{item.location}</p>
                <p>Logins: {item.count}</p>
                <p>Anomalies: {item.anomalies}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

