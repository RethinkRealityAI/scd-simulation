import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { VitalsDisplayConfig, defaultVitalsDisplayConfig } from '../data/scenesData';

interface VitalsData {
  heartRate: number;
  systolic: number;
  diastolic: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  temperature: number;
  painLevel?: number;
  isAlarmOn: boolean;
  patientName: string;
  age: number;
  bedNumber: string;
  mrn: string;
}

interface VitalsMonitorProps {
  vitalsData: VitalsData;
  displayConfig?: VitalsDisplayConfig;
  className?: string;
  sceneId?: string;
}

const colorMap: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  cyan: { text: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', glow: 'shadow-cyan-500/20' },
  green: { text: 'text-green-400', border: 'border-green-500/40', bg: 'bg-green-500/10', glow: 'shadow-green-500/20' },
  yellow: { text: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', glow: 'shadow-yellow-500/20' },
  red: { text: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/10', glow: 'shadow-red-500/20' },
  purple: { text: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' },
  blue: { text: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' },
  orange: { text: 'text-orange-400', border: 'border-orange-500/40', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/20' },
  pink: { text: 'text-pink-400', border: 'border-pink-500/40', bg: 'bg-pink-500/10', glow: 'shadow-pink-500/20' },
};
const getColor = (name?: string) => colorMap[name || 'cyan'] || colorMap.cyan;

const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ vitalsData, displayConfig, className = '' }) => {
  const [time, setTime] = useState(new Date());
  const config = displayConfig || defaultVitalsDisplayConfig;
  const { visibility, colors, alertThresholds } = config;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

  const isHRAlert = alertThresholds && ((alertThresholds.heartRateHigh && vitalsData.heartRate > alertThresholds.heartRateHigh) || (alertThresholds.heartRateLow && vitalsData.heartRate < alertThresholds.heartRateLow));
  const isBPAlert = alertThresholds && ((alertThresholds.systolicHigh && vitalsData.systolic > alertThresholds.systolicHigh) || (alertThresholds.diastolicHigh && vitalsData.diastolic > alertThresholds.diastolicHigh));
  const isRRAlert = alertThresholds && alertThresholds.respiratoryRateHigh && vitalsData.respiratoryRate > alertThresholds.respiratoryRateHigh;
  const isSpO2Alert = alertThresholds && alertThresholds.oxygenSaturationLow && vitalsData.oxygenSaturation < alertThresholds.oxygenSaturationLow;
  const isTempAlert = alertThresholds && alertThresholds.temperatureHigh && vitalsData.temperature > alertThresholds.temperatureHigh;
  const isPainAlert = alertThresholds && alertThresholds.painLevelHigh && vitalsData.painLevel !== undefined && vitalsData.painLevel >= alertThresholds.painLevelHigh;

  const hrColor = getColor(colors?.heartRate);
  const bpColor = getColor(colors?.bloodPressure);
  const rrColor = getColor(colors?.respiratoryRate);
  const spo2Color = getColor(colors?.oxygenSaturation);
  const tempColor = getColor(colors?.temperature);
  const painColor = getColor(colors?.painLevel);

  const gridVitals = [
    visibility.heartRate && { key: 'hr', label: 'HR', value: String(vitalsData.heartRate), unit: 'bpm', color: hrColor, alert: isHRAlert },
    visibility.bloodPressure && { key: 'bp', label: 'BP', value: `${vitalsData.systolic}/${vitalsData.diastolic}`, unit: 'mmHg', color: bpColor, alert: isBPAlert },
    visibility.respiratoryRate && { key: 'rr', label: 'RR', value: String(vitalsData.respiratoryRate), unit: 'rpm', color: rrColor, alert: isRRAlert },
    visibility.oxygenSaturation && { key: 'spo2', label: 'SpO₂', value: `${vitalsData.oxygenSaturation}%`, unit: 'oxygen', color: spo2Color, alert: isSpO2Alert },
  ].filter(Boolean) as { key: string; label: string; value: string; unit: string; color: typeof hrColor; alert: boolean | undefined }[];

  const numCols = gridVitals.length <= 2 ? 1 : 2;

  return (
    // p-2 on root + gap-1.5 between sections = predictable flex sizing with no margin surprises
    <div className={`w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white font-mono flex flex-col min-h-0 overflow-hidden p-2 gap-1.5 ${className}`}>

      {/* ── Header ── */}
      <div className="flex justify-between items-center pb-1.5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest">MONITOR</span>
          </div>
          {vitalsData.isAlarmOn && (
            <div className="flex items-center gap-1 text-red-400 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[11px] font-bold">ALERT</span>
            </div>
          )}
        </div>
        <div className="text-right leading-tight">
          <div className="text-sm font-bold text-cyan-400">{fmt(time)}</div>
          <div className="text-[10px] text-gray-500">{fmtDate(time)}</div>
        </div>
      </div>

      {/* ── Patient Info ── */}
      {visibility.patientInfo && (
        <div className="border-b border-white/10 pb-1.5 flex-shrink-0">
          <div className="text-cyan-400 font-bold text-sm truncate">{vitalsData.patientName}</div>
          <div className="flex gap-3 text-[11px] text-gray-400 mt-0.5">
            <span>{vitalsData.age}y</span>
            <span>Bed {vitalsData.bedNumber}</span>
            <span>MRN: {vitalsData.mrn}</span>
          </div>
        </div>
      )}

      {/* ── Pain ── */}
      {visibility.painLevel && vitalsData.painLevel !== undefined && (
        <div className={`rounded-lg border-2 px-3 py-2 flex-shrink-0 transition-all duration-700 ${painColor.border} ${isPainAlert ? `animate-pulse ${painColor.bg} shadow-lg ${painColor.glow}` : 'bg-white/5'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`flex items-center gap-1.5 ${painColor.text}`}>
                <span className="text-xs font-bold tracking-widest">PAIN</span>
                {isPainAlert && <AlertTriangle className="w-3.5 h-3.5" />}
              </div>
              <div className="text-gray-400 text-[10px]">pain scale</div>
            </div>
            <div className={`text-3xl font-black ${painColor.text} leading-none`}>{vitalsData.painLevel}/10</div>
          </div>
          <div className="mt-1.5 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${vitalsData.painLevel >= 7 ? 'bg-red-500' : vitalsData.painLevel >= 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${(vitalsData.painLevel / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Vitals Grid — 2×2, fills remaining space ── */}
      {gridVitals.length > 0 && (
        <div
          className="flex-1 min-h-0 overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${numCols}, 1fr)`,
            gridTemplateRows: `repeat(${Math.ceil(gridVitals.length / numCols)}, 1fr)`,
            gap: '6px',
          }}
        >
          {gridVitals.map(v => (
            <div
              key={v.key}
              className={`rounded-lg bg-white/5 border flex flex-col items-center justify-center text-center p-2 transition-all duration-700 min-h-0 overflow-hidden ${v.color.border} ${v.alert ? `animate-pulse ${v.color.bg} shadow-lg ${v.color.glow}` : ''}`}
            >
              <div className={`text-[10px] font-bold tracking-widest ${v.color.text}`}>{v.label}</div>
              <div className={`font-black leading-none mt-1 ${v.color.text} ${v.key === 'bp' ? 'text-xl' : 'text-2xl'}`}>{v.value}</div>
              <div className="text-gray-500 text-[9px] mt-0.5">{v.unit}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Temperature ── */}
      {visibility.temperature && (
        <div className={`rounded-lg border px-3 py-2 flex-shrink-0 transition-all duration-700 ${tempColor.border} ${isTempAlert ? `animate-pulse ${tempColor.bg} shadow-lg ${tempColor.glow}` : 'bg-white/5'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`flex items-center gap-1.5 ${tempColor.text}`}>
                <span className="text-xs font-bold tracking-widest">TEMP</span>
                {isTempAlert && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              </div>
              <div className="text-gray-400 text-[10px]">body temp</div>
            </div>
            <div className={`text-3xl font-black ${tempColor.text} leading-none`}>{vitalsData.temperature.toFixed(1)}°C</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsMonitor;