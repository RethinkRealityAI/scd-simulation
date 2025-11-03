import React from 'react';
import { Heart, Activity } from 'lucide-react';

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
  procedureTime: string;
}

interface PatientVitalsEditorProps {
  vitals: VitalsData;
  onChange: (vitals: VitalsData) => void;
}

const PatientVitalsEditor: React.FC<PatientVitalsEditorProps> = ({ vitals, onChange }) => {
  const updateVital = (key: keyof VitalsData, value: any) => {
    onChange({ ...vitals, [key]: value });
  };

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-500" />
        Patient Vitals & Biometrics
      </h3>
      
      {/* Demographics */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Patient Demographics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
            <input
              type="text"
              value={vitals.patientName}
              onChange={(e) => updateVital('patientName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Last, First"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <input
              type="number"
              value={vitals.age}
              onChange={(e) => updateVital('age', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              min="0"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bed Number</label>
            <input
              type="text"
              value={vitals.bedNumber}
              onChange={(e) => updateVital('bedNumber', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="e.g., 008"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">MRN</label>
            <input
              type="text"
              value={vitals.mrn}
              onChange={(e) => updateVital('mrn', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Medical Record Number"
            />
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Vital Signs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
            <input
              type="number"
              value={vitals.heartRate}
              onChange={(e) => updateVital('heartRate', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              min="0"
              max="300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BP Systolic (mmHg)</label>
            <input
              type="number"
              value={vitals.systolic}
              onChange={(e) => updateVital('systolic', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              min="0"
              max="300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BP Diastolic (mmHg)</label>
            <input
              type="number"
              value={vitals.diastolic}
              onChange={(e) => updateVital('diastolic', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              min="0"
              max="200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate (breaths/min)</label>
            <input
              type="number"
              value={vitals.respiratoryRate}
              onChange={(e) => updateVital('respiratoryRate', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              min="0"
              max="60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">O₂ Saturation (%)</label>
            <input
              type="number"
              value={vitals.oxygenSaturation}
              onChange={(e) => updateVital('oxygenSaturation', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              value={vitals.temperature}
              onChange={(e) => updateVital('temperature', parseFloat(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              min="30"
              max="45"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pain Level (0-10)</label>
            <input
              type="number"
              value={vitals.painLevel || ''}
              onChange={(e) => updateVital('painLevel', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              min="0"
              max="10"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Procedure Time</label>
            <input
              type="text"
              value={vitals.procedureTime}
              onChange={(e) => updateVital('procedureTime', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="e.g., 2:30 PM"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={vitals.isAlarmOn}
                onChange={(e) => updateVital('isAlarmOn', e.target.checked)}
                className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700">Alarm Active</span>
                <p className="text-xs text-gray-500">Monitor alarm status</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">
          💡 <strong>Tip:</strong> Ensure vital signs are realistic for the clinical scenario. 
          Reference normal ranges: HR 60-100, BP 120/80, RR 12-20, O₂ 95-100%, Temp 36.5-37.5°C
        </p>
      </div>
    </div>
  );
};

export default PatientVitalsEditor;

