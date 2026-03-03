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

// Color mapping utility — maps named colors to Tailwind classes
const colorMap: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    glow: 'shadow-cyan-500/20',
  },
  green: {
    text: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    glow: 'shadow-green-500/20',
  },
  yellow: {
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    glow: 'shadow-yellow-500/20',
  },
  red: {
    text: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    glow: 'shadow-red-500/20',
  },
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    glow: 'shadow-purple-500/20',
  },
  blue: {
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    glow: 'shadow-blue-500/20',
  },
  orange: {
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    glow: 'shadow-orange-500/20',
  },
  pink: {
    text: 'text-pink-400',
    border: 'border-pink-500/30',
    bg: 'bg-pink-500/10',
    glow: 'shadow-pink-500/20',
  },
};

const getColor = (colorName?: string) => colorMap[colorName || 'cyan'] || colorMap.cyan;

const VitalsMonitor: React.FC<VitalsMonitorProps> = ({
  vitalsData,
  displayConfig,
  className = '',
}) => {
  const [time, setTime] = useState(new Date());
  const config = displayConfig || defaultVitalsDisplayConfig;
  const { visibility, colors, alertThresholds } = config;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      .toUpperCase();
  };

  // Determine if values are alerting based on thresholds
  const isHRAlert =
    alertThresholds &&
    ((alertThresholds.heartRateHigh && vitalsData.heartRate > alertThresholds.heartRateHigh) ||
      (alertThresholds.heartRateLow && vitalsData.heartRate < alertThresholds.heartRateLow));

  const isBPAlert =
    alertThresholds &&
    ((alertThresholds.systolicHigh && vitalsData.systolic > alertThresholds.systolicHigh) ||
      (alertThresholds.diastolicHigh && vitalsData.diastolic > alertThresholds.diastolicHigh));

  const isRRAlert =
    alertThresholds &&
    alertThresholds.respiratoryRateHigh &&
    vitalsData.respiratoryRate > alertThresholds.respiratoryRateHigh;

  const isSpO2Alert =
    alertThresholds &&
    alertThresholds.oxygenSaturationLow &&
    vitalsData.oxygenSaturation < alertThresholds.oxygenSaturationLow;

  const isTempAlert =
    alertThresholds &&
    alertThresholds.temperatureHigh &&
    vitalsData.temperature > alertThresholds.temperatureHigh;

  const isPainAlert =
    alertThresholds &&
    alertThresholds.painLevelHigh &&
    vitalsData.painLevel !== undefined &&
    vitalsData.painLevel >= alertThresholds.painLevelHigh;

  // Color configurations
  const hrColor = getColor(colors?.heartRate);
  const bpColor = getColor(colors?.bloodPressure);
  const rrColor = getColor(colors?.respiratoryRate);
  const spo2Color = getColor(colors?.oxygenSaturation);
  const tempColor = getColor(colors?.temperature);
  const painColor = getColor(colors?.painLevel);

  // Count visible grid items (HR, BP, RR, SpO2) to determine grid layout
  const gridItems = [
    visibility.heartRate,
    visibility.bloodPressure,
    visibility.respiratoryRate,
    visibility.oxygenSaturation,
  ].filter(Boolean).length;

  const gridCols = gridItems <= 2 ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <div
      className={`w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 text-white font-mono h-full flex flex-col ${className}`}
    >
      {/* Header — always visible */}
      <div className="flex justify-between items-start mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold tracking-wider">MONITOR</span>
          </div>
          {vitalsData.isAlarmOn && (
            <div className="flex items-center gap-1 text-red-400 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-bold">ALERT</span>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm font-bold text-cyan-400">{formatTime(time)}</div>
          <div className="text-xs text-gray-400">{formatDate(time)}</div>
        </div>
      </div>

      {/* Patient Info */}
      {visibility.patientInfo && (
        <div className="text-right mb-2 border-b border-white/10 pb-2 flex-shrink-0">
          <div className="text-cyan-400 font-bold text-sm truncate">{vitalsData.patientName}</div>
          <div className="flex justify-end gap-3 text-xs text-gray-300">
            <span>{vitalsData.age}y</span>
            <span>Bed {vitalsData.bedNumber}</span>
            <span>MRN: {vitalsData.mrn}</span>
          </div>
        </div>
      )}

      {/* Pain Card — Full Width, grows to fill space */}
      {visibility.painLevel && vitalsData.painLevel !== undefined && (
        <div
          className={`p-3 rounded-lg bg-white/5 backdrop-blur-sm border-2 mb-1.5 flex-grow flex flex-col justify-center
            transition-all duration-700 ease-in-out
            ${painColor.border}
            ${isPainAlert ? `animate-pulse border-red-400 ${painColor.bg} shadow-lg ${painColor.glow}` : ''}`}
        >
          <div className={`flex items-center justify-between`}>
            <div>
              <div className={`flex items-center gap-2 ${painColor.text} text-base mb-0.5`}>
                <span className="font-semibold tracking-wide">PAIN</span>
                {isPainAlert && <AlertTriangle className="w-4 h-4" />}
              </div>
              <div className="text-gray-300 text-xs">pain scale</div>
            </div>
            <div className={`text-4xl font-bold ${painColor.text} leading-none`}>
              {vitalsData.painLevel}/10
            </div>
          </div>
          {/* Pain bar visualization */}
          <div className="mt-2 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-in-out ${vitalsData.painLevel >= 7
                ? 'bg-red-500'
                : vitalsData.painLevel >= 4
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
                }`}
              style={{ width: `${(vitalsData.painLevel / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Vitals Grid — Squarish cards with centered data */}
      {gridItems > 0 && (
        <div className={`grid ${gridCols} gap-1.5 mb-1.5`}>
          {/* Heart Rate */}
          {visibility.heartRate && (
            <div
              className={`aspect-square p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border flex flex-col items-center justify-center text-center
                transition-all duration-700 ease-in-out
                ${hrColor.border}
                ${isHRAlert ? `animate-pulse ${hrColor.bg} shadow-lg ${hrColor.glow}` : ''}`}
            >
              <div className={`${hrColor.text} text-sm font-semibold tracking-wide`}>
                HR
              </div>
              <div className={`text-3xl font-bold ${hrColor.text} leading-none my-1`}>
                {vitalsData.heartRate}
              </div>
              <div className="text-gray-300 text-[10px]">bpm</div>
            </div>
          )}

          {/* Blood Pressure */}
          {visibility.bloodPressure && (
            <div
              className={`aspect-square p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border flex flex-col items-center justify-center text-center
                transition-all duration-700 ease-in-out
                ${bpColor.border}
                ${isBPAlert ? `animate-pulse ${bpColor.bg} shadow-lg ${bpColor.glow}` : ''}`}
            >
              <div className={`${bpColor.text} text-sm font-semibold tracking-wide`}>
                BP
              </div>
              <div className={`text-2xl font-bold ${bpColor.text} leading-none my-1`}>
                {vitalsData.systolic}/{vitalsData.diastolic}
              </div>
              <div className="text-gray-300 text-[10px]">mmHg</div>
            </div>
          )}

          {/* Respiratory Rate */}
          {visibility.respiratoryRate && (
            <div
              className={`aspect-square p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border flex flex-col items-center justify-center text-center
                transition-all duration-700 ease-in-out
                ${rrColor.border}
                ${isRRAlert ? `animate-pulse ${rrColor.bg} shadow-lg ${rrColor.glow}` : ''}`}
            >
              <div className={`${rrColor.text} text-sm font-semibold tracking-wide`}>
                RR
              </div>
              <div className={`text-3xl font-bold ${rrColor.text} leading-none my-1`}>
                {vitalsData.respiratoryRate}
              </div>
              <div className="text-gray-300 text-[10px]">rpm</div>
            </div>
          )}

          {/* Oxygen Saturation */}
          {visibility.oxygenSaturation && (
            <div
              className={`aspect-square p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border flex flex-col items-center justify-center text-center
                transition-all duration-700 ease-in-out
                ${spo2Color.border}
                ${isSpO2Alert ? `animate-pulse ${spo2Color.bg} shadow-lg ${spo2Color.glow}` : ''}`}
            >
              <div className={`${spo2Color.text} text-sm font-semibold tracking-wide`}>
                SpO2
              </div>
              <div className={`text-3xl font-bold ${spo2Color.text} leading-none my-1`}>
                {vitalsData.oxygenSaturation}%
              </div>
              <div className="text-gray-300 text-[10px]">oxygen</div>
            </div>
          )}
        </div>
      )}

      {/* Temperature — Full Width, grows to fill remaining space */}
      {visibility.temperature && (
        <div
          className={`p-3 rounded-lg bg-white/5 backdrop-blur-sm border flex-grow flex flex-col justify-center
            transition-all duration-700 ease-in-out
            ${tempColor.border}
            ${isTempAlert ? `animate-pulse ${tempColor.bg} shadow-lg ${tempColor.glow}` : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className={`flex items-center gap-2 ${tempColor.text} text-base mb-0.5`}>
                <span className="font-semibold tracking-wide">TEMP</span>
                {isTempAlert && <AlertTriangle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="text-gray-300 text-xs">body temp</div>
            </div>
            <div className={`text-4xl font-bold ${tempColor.text} leading-none`}>
              {vitalsData.temperature.toFixed(1)}°C
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsMonitor;