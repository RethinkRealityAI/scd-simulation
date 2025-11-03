import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

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
  className?: string;
  sceneId?: string;
}

const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ vitalsData, className = '', sceneId }) => {
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
          <div className="flex items-center gap-1 text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-bold">STATUS</span>
          </div>
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

      {/* Pain Card - Full Width */}
      {vitalsData.painLevel !== undefined && (
        <div className={`p-2 rounded-lg bg-white/5 backdrop-blur-sm border-2 border-red-500/30 mb-1 flex-shrink-0 transition-all duration-1000 ${
          sceneId === '5' ? 'animate-pulse border-4 border-red-400 bg-red-500/10 shadow-lg shadow-red-500/50' : ''
        }`}>
          <div className="flex items-center gap-2 text-red-400 text-lg mb-1">
            <span className="font-semibold">PAIN</span>
          </div>
          <div className="text-4xl font-bold text-red-400 leading-none">
            {vitalsData.painLevel}/10
          </div>
          <div className="text-gray-300 text-sm">pain scale</div>
        </div>
      )}

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 gap-1 mb-1 flex-1 min-h-0">
        {/* Heart Rate */}
        <div className={`p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/30 flex flex-col justify-center aspect-square transition-all duration-1000 ${
          sceneId === '5' ? 'animate-pulse border-cyan-400 bg-cyan-500/10' : ''
        }`}>
          <div className="text-cyan-400 text-lg mb-1 font-semibold">HR</div>
          <div className="text-4xl font-bold text-cyan-400 leading-none">{vitalsData.heartRate}</div>
          <div className="text-gray-300 text-sm">bpm</div>
        </div>

        {/* Blood Pressure */}
        <div className={`p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/30 flex flex-col justify-center aspect-square transition-all duration-1000 ${
          sceneId === '5' ? 'animate-pulse border-cyan-400 bg-cyan-500/10' : ''
        }`}>
          <div className="text-cyan-400 text-lg mb-1 font-semibold">BP</div>
          <div className="text-3xl font-bold text-cyan-400 leading-none">
            {vitalsData.systolic}/{vitalsData.diastolic}
          </div>
          <div className="text-gray-300 text-sm">mmHg</div>
        </div>

        {/* Respiratory Rate */}
        <div className="p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/30 flex flex-col justify-center aspect-square">
          <div className="text-cyan-400 text-lg mb-1 font-semibold">RR</div>
          <div className="text-4xl font-bold text-cyan-400 leading-none">{vitalsData.respiratoryRate}</div>
          <div className="text-gray-300 text-sm">rpm</div>
        </div>

        {/* Oxygen Saturation */}
        <div className="p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-green-500/30 flex flex-col justify-center aspect-square">
          <div className="text-green-400 text-lg mb-1 font-semibold">SpO2</div>
          <div className="text-4xl font-bold text-green-400 leading-none">{vitalsData.oxygenSaturation}%</div>
          <div className="text-gray-300 text-sm">oxygen</div>
        </div>
      </div>

      {/* Temperature - Full Width */}
      <div className="p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-yellow-500/30 flex-shrink-0">
        <div className="flex items-center gap-2 text-yellow-400 text-lg mb-1">
          <span className="font-semibold">TEMP</span>
          {vitalsData.temperature > 37.2 && <AlertTriangle className="w-5 h-5 text-red-400" />}
        </div>
        <div className="text-4xl font-bold text-yellow-400 leading-none">
          {vitalsData.temperature.toFixed(1)}°C
        </div>
        <div className="text-gray-300 text-sm">body temp</div>
      </div>

    </div>
  );
};

export default VitalsMonitor;