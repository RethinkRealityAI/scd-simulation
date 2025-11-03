import React from 'react';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';

interface DiscussionPromptsEditorProps {
  prompts: string[];
  onChange: (prompts: string[]) => void;
}

const DiscussionPromptsEditor: React.FC<DiscussionPromptsEditorProps> = ({ prompts, onChange }) => {
  const addPrompt = () => {
    onChange([...prompts, '']);
  };

  const updatePrompt = (index: number, value: string) => {
    const updated = [...prompts];
    updated[index] = value;
    onChange(updated);
  };

  const deletePrompt = (index: number) => {
    onChange(prompts.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-yellow-600" />
          Discussion Prompts ({prompts.length})
        </h3>
        <button
          onClick={addPrompt}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Prompt
        </button>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No discussion prompts yet. Click "Add Prompt" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt, index) => (
            <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-yellow-200">
              <span className="text-sm font-bold text-yellow-700 mt-2">#{index + 1}</span>
              <textarea
                value={prompt}
                onChange={(e) => updatePrompt(index, e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                rows={2}
                placeholder="Enter discussion prompt..."
              />
              <button
                onClick={() => deletePrompt(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 <strong>Tip:</strong> Discussion prompts encourage reflection and critical thinking. Ask open-ended questions about bias, cultural safety, and clinical decision-making.
        </p>
      </div>
    </div>
  );
};

export default DiscussionPromptsEditor;

