import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface VitalsData {
  heartRate: number;
  systolic: number;
  diastolic: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  temperature: number;
  isAlarmOn: boolean;
  patientName: string;
  age: number;
  bedNumber: string;
  mrn: string;
}

interface VitalsMonitorProps {
  vitalsData: VitalsData;
  className?: string;
}

const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ vitalsData, className = '' }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className={`w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 text-white font-mono h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {vitalsData.isAlarmOn && (
            <div className="flex items-center gap-1 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold">ALARM</span>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-sm font-bold text-cyan-400">{formatTime(time)}</div>
          <div className="text-xs text-gray-400">{formatDate(time)}</div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="text-right mb-3 border-b border-white/10 pb-2">
        <div className="text-cyan-400 font-bold text-sm">{vitalsData.patientName}</div>
        <div className="text-gray-300 text-xs">{vitalsData.age} years</div>
        <div className="text-gray-400 text-xs">Bed {vitalsData.bedNumber}</div>
        <div className="text-gray-400 text-xs">MRN: {vitalsData.mrn}</div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 flex-1 min-h-0">
        {/* Heart Rate */}
        <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/30 flex flex-col justify-center min-h-0">
          <div className="text-cyan-400 text-sm mb-1 font-semibold">HR</div>
          <div className="text-xl font-bold text-cyan-400">{vitalsData.heartRate}</div>
          <div className="text-gray-300 text-xs">bpm</div>
        </div>

        {/* Blood Pressure */}
        <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/30 flex flex-col justify-center min-h-0">
          <div className="text-cyan-400 text-sm mb-1 font-semibold">BP</div>
          <div className="text-xl font-bold text-cyan-400">
            {vitalsData.systolic}/{vitalsData.diastolic}
          </div>
          <div className="text-gray-300 text-xs">mmHg</div>
        </div>

        {/* Respiratory Rate */}
        <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/30 flex flex-col justify-center min-h-0">
          <div className="text-cyan-400 text-sm mb-1 font-semibold">RR</div>
          <div className="text-xl font-bold text-cyan-400">{vitalsData.respiratoryRate}</div>
          <div className="text-gray-300 text-xs">rpm</div>
        </div>

        {/* Oxygen Saturation */}
        <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-green-500/30 flex flex-col justify-center min-h-0">
          <div className="text-green-400 text-sm mb-1 font-semibold">SpO2</div>
          <div className="text-xl font-bold text-green-400">{vitalsData.oxygenSaturation}%</div>
          <div className="text-gray-300 text-xs">oxygen</div>
        </div>
      </div>

      {/* Temperature - Full Width */}
      <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-yellow-500/30 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-yellow-400 text-sm mb-2">
          <span className="font-semibold">TEMP</span>
          {vitalsData.temperature > 37.2 && <AlertTriangle className="w-4 h-4 text-red-400" />}
        </div>
        <div className="text-2xl font-bold text-yellow-400">
          {vitalsData.temperature.toFixed(1)}°C
        </div>
        <div className="text-gray-300 text-sm">body temp</div>
      </div>

      {/* Status */}
      <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/30 flex-shrink-0">
        <div className="text-cyan-400 text-sm mb-2 font-semibold">STATUS</div>
        <div className="text-sm font-bold text-green-400">MONITORING</div>
        <div className="text-gray-300 text-sm">All systems active</div>
      </div>
    </div>
  );
};

export default VitalsMonitor;