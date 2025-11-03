import React from 'react';
import { CheckCircle, Plus, Trash2, X } from 'lucide-react';
import { QuizQuestion } from '../QuizComponent';

interface QuizQuestionsEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const QuizQuestionsEditor: React.FC<QuizQuestionsEditorProps> = ({ questions, onChange }) => {
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: 'multiple-choice',
      question: '',
      options: ['', ''],
      correctAnswer: '',
      explanation: ''
    };
    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const deleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    if (question.options) {
      question.options = [...question.options, ''];
      onChange(updated);
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    if (question.options) {
      question.options[optionIndex] = value;
      onChange(updated);
    }
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    if (question.options && question.options.length > 2) {
      question.options.splice(optionIndex, 1);
      onChange(updated);
    }
  };

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          Quiz Questions ({questions.length})
        </h3>
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No questions yet. Click "Add Question" to create one.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white p-5 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-blue-900">Question {qIndex + 1}</h4>
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Question Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <select
                  value={question.type}
                  onChange={(e) => {
                    const newType = e.target.value as QuizQuestion['type'];
                    updateQuestion(qIndex, {
                      type: newType,
                      options: newType === 'text-input' ? undefined : question.options || ['', ''],
                      correctAnswer: newType === 'multi-select' ? [] : ''
                    });
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="multiple-choice">Multiple Choice (Single Answer)</option>
                  <option value="multi-select">Multi-Select (Multiple Answers)</option>
                  <option value="text-input">Text Input (Open-ended)</option>
                </select>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                <textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Enter your question here..."
                />
              </div>

              {/* Options (for choice-based questions) */}
              {question.type !== 'text-input' && question.options && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Answer Options</label>
                    <button
                      onClick={() => addOption(qIndex)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600 w-8">{getOptionLabel(oIndex)}.</span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${getOptionLabel(oIndex)}`}
                        />
                        {question.options!.length > 2 && (
                          <button
                            onClick={() => deleteOption(qIndex, oIndex)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <label className="block text-sm font-medium text-green-800 mb-2">✓ Correct Answer(s)</label>
                
                {question.type === 'multiple-choice' && question.options && (
                  <select
                    value={question.correctAnswer as string}
                    onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                    className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Select correct answer...</option>
                    {question.options.map((opt, i) => (
                      <option key={i} value={opt}>{getOptionLabel(i)}. {opt}</option>
                    ))}
                  </select>
                )}

                {question.type === 'multi-select' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Array.isArray(question.correctAnswer) && question.correctAnswer.includes(opt)}
                          onChange={(e) => {
                            const current = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                            const updated = e.target.checked
                              ? [...current, opt]
                              : current.filter(a => a !== opt);
                            updateQuestion(qIndex, { correctAnswer: updated });
                          }}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm">{getOptionLabel(i)}. {opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'text-input' && (
                  <input
                    type="text"
                    value={question.correctAnswer as string}
                    onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                    className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="Expected answer or keywords..."
                  />
                )}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Explanation / Feedback</label>
                <textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Provide explanation for why this is the correct answer..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizQuestionsEditor;

