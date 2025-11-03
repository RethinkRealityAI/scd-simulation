import React from 'react';
import { Clipboard, Plus, Trash2 } from 'lucide-react';

interface ClinicalFindingsEditorProps {
  findings: string[];
  onChange: (findings: string[]) => void;
}

const ClinicalFindingsEditor: React.FC<ClinicalFindingsEditorProps> = ({ findings, onChange }) => {
  const addFinding = () => {
    onChange([...findings, '']);
  };

  const updateFinding = (index: number, value: string) => {
    const updated = [...findings];
    updated[index] = value;
    onChange(updated);
  };

  const deleteFinding = (index: number) => {
    onChange(findings.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-teal-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clipboard className="w-5 h-5 text-teal-600" />
          Clinical Findings ({findings.length})
        </h3>
        <button
          onClick={addFinding}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Finding
        </button>
      </div>

      {findings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clipboard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No clinical findings yet. Click "Add Finding" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {findings.map((finding, index) => (
            <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-teal-200">
              <span className="text-teal-600">•</span>
              <input
                type="text"
                value={finding}
                onChange={(e) => updateFinding(index, e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Dry mucous membranes"
              />
              <button
                onClick={() => deleteFinding(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-teal-100 border border-teal-200 rounded-lg">
        <p className="text-sm text-teal-800">
          💡 <strong>Tip:</strong> List objective clinical observations that learners should identify. Keep findings concise and medically accurate.
        </p>
      </div>
    </div>
  );
};

export default ClinicalFindingsEditor;

