import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  HelpCircle,
  ListChecks,
  AlignLeft,
  CheckCircle2,
} from 'lucide-react';
import { QuizQuestion } from '../QuizComponent';

interface QuizQuestionsEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const QUESTION_TYPES = [
  {
    value: 'multiple-choice' as const,
    label: 'Multiple Choice',
    description: 'One correct answer from a list of options',
    icon: CheckCircle2,
    color: 'blue',
  },
  {
    value: 'multi-select' as const,
    label: 'Multi-Select',
    description: 'One or more correct answers',
    icon: ListChecks,
    color: 'purple',
  },
  {
    value: 'text-input' as const,
    label: 'Open-Ended',
    description: 'Learner writes a free-text answer',
    icon: AlignLeft,
    color: 'teal',
  },
];

const TYPE_COLORS: Record<string, string> = {
  blue: 'border-blue-300 bg-blue-50 text-blue-800',
  purple: 'border-purple-300 bg-purple-50 text-purple-800',
  teal: 'border-teal-300 bg-teal-50 text-teal-800',
};

const TYPE_ICON_COLORS: Record<string, string> = {
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  teal: 'text-teal-600',
};

const OPTION_LABELS = 'ABCDEFGHIJ'.split('');

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  onChange: (updates: Partial<QuizQuestion>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question, index, total, onChange, onDelete, onMoveUp, onMoveDown,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const typeConfig = QUESTION_TYPES.find(t => t.value === question.type) || QUESTION_TYPES[0];

  const addOption = () => {
    onChange({ options: [...(question.options || []), ''] });
  };

  const updateOption = (i: number, val: string) => {
    const updated = [...(question.options || [])];
    updated[i] = val;
    onChange({ options: updated });
  };

  const removeOption = (i: number) => {
    if ((question.options || []).length <= 2) return;
    const updated = (question.options || []).filter((_, idx) => idx !== i);
    // If the removed option was the correct answer, clear it
    const newCorrect = question.type === 'multiple-choice'
      ? (question.correctAnswer === question.options![i] ? '' : question.correctAnswer)
      : Array.isArray(question.correctAnswer)
        ? question.correctAnswer.filter(a => a !== question.options![i])
        : question.correctAnswer;
    onChange({ options: updated, correctAnswer: newCorrect });
  };

  const toggleMultiCorrect = (opt: string) => {
    const current = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
    const updated = current.includes(opt)
      ? current.filter(a => a !== opt)
      : [...current, opt];
    onChange({ correctAnswer: updated });
  };

  const handleTypeChange = (newType: QuizQuestion['type']) => {
    onChange({
      type: newType,
      options: newType === 'text-input' ? undefined : (question.options || ['', '']),
      correctAnswer: newType === 'multi-select' ? [] : '',
    });
  };

  const isCorrect = (opt: string) => {
    if (question.type === 'multiple-choice') return question.correctAnswer === opt;
    if (question.type === 'multi-select') return Array.isArray(question.correctAnswer) && question.correctAnswer.includes(opt);
    return false;
  };

  const hasQuestion = question.question.trim().length > 0;
  const hasCorrect = question.type === 'text-input'
    ? true
    : question.type === 'multiple-choice'
      ? !!question.correctAnswer
      : Array.isArray(question.correctAnswer) && question.correctAnswer.length > 0;

  return (
    <div className={`rounded-2xl border-2 transition-all ${
      collapsed ? 'border-gray-200 bg-white' : 'border-gray-200 bg-white shadow-sm'
    }`}>
      {/* Card Header */}
      <div className="flex items-center gap-3 p-4">
        {/* Drag / order */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-0 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <GripVertical className="w-4 h-4 text-gray-300" />
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-0 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Number badge */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          hasQuestion && hasCorrect ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {index + 1}
        </div>

        {/* Question summary */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${hasQuestion ? 'text-gray-900' : 'text-gray-400 italic'}`}>
            {hasQuestion ? question.question : 'Enter your question…'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${TYPE_COLORS[typeConfig.color]}`}>
              {typeConfig.label}
            </span>
            {!hasQuestion && <span className="text-xs text-amber-600">Needs question text</span>}
            {!hasCorrect && hasQuestion && <span className="text-xs text-amber-600">Needs correct answer</span>}
            {hasQuestion && hasCorrect && <span className="text-xs text-green-600">Ready</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setCollapsed(v => !v)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-5 border-t border-gray-100 pt-4">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Question Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {QUESTION_TYPES.map(({ value, label, description, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value)}
                  className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                    question.type === value
                      ? `border-2 ${TYPE_COLORS[color]} shadow-sm`
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${question.type === value ? TYPE_ICON_COLORS[color] : 'text-gray-400'}`} />
                  <span className="text-xs font-semibold leading-tight">{label}</span>
                  <span className="text-xs text-gray-400 leading-tight mt-0.5 hidden sm:block">{description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question text */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Question
            </label>
            <textarea
              value={question.question}
              onChange={e => onChange({ question: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
              rows={2}
              placeholder="What would you do first when assessing this patient?"
            />
          </div>

          {/* Options + correct answer (for choice-based types) */}
          {question.type !== 'text-input' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Answer Options
                  <span className="text-gray-400 font-normal ml-1 normal-case">
                    — {question.type === 'multiple-choice' ? 'click radio to mark correct' : 'check all correct answers'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  Add option
                </button>
              </div>
              <div className="space-y-2">
                {(question.options || []).map((opt, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                    isCorrect(opt) ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    {/* Correct answer selector */}
                    {question.type === 'multiple-choice' ? (
                      <button
                        type="button"
                        onClick={() => onChange({ correctAnswer: isCorrect(opt) ? '' : opt })}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center ${
                          isCorrect(opt) ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'
                        }`}
                        title="Mark as correct answer"
                      >
                        {isCorrect(opt) && <div className="w-2 h-2 rounded-full bg-white" />}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleMultiCorrect(opt)}
                        className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-all flex items-center justify-center ${
                          isCorrect(opt) ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'
                        }`}
                        title="Mark as correct answer"
                      >
                        {isCorrect(opt) && (
                        <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-none stroke-current stroke-2">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      )}
                      </button>
                    )}
                    {/* Option label */}
                    <span className={`text-xs font-bold w-5 text-center flex-shrink-0 ${isCorrect(opt) ? 'text-green-700' : 'text-gray-400'}`}>
                      {OPTION_LABELS[i]}
                    </span>
                    {/* Option text */}
                    <input
                      type="text"
                      value={opt}
                      onChange={e => updateOption(i, e.target.value)}
                      className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                      placeholder={`Option ${OPTION_LABELS[i]}`}
                    />
                    {/* Remove */}
                    {(question.options || []).length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="text-gray-300 hover:text-red-500 p-0.5 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {/* Correct answer hint */}
              {!hasCorrect && (question.options || []).some(o => o.trim()) && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  {question.type === 'multiple-choice' ? 'Click the circle on an option to mark it as correct.' : 'Check one or more options to mark them as correct.'}
                </p>
              )}
            </div>
          )}

          {/* Correct answer for text-input */}
          {question.type === 'text-input' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Expected Answer / Keywords
              </label>
              <input
                type="text"
                value={question.correctAnswer as string}
                onChange={e => onChange({ correctAnswer: e.target.value })}
                className="w-full p-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-green-50 placeholder-gray-400"
                placeholder="e.g., IV access, pain assessment, oxygen therapy"
              />
              <p className="text-xs text-gray-400 mt-1">Open-ended responses are accepted — this is used for debrief guidance.</p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Feedback / Explanation
              <span className="text-gray-400 font-normal ml-1 normal-case">— shown after answering</span>
            </label>
            <textarea
              value={question.explanation || ''}
              onChange={e => onChange({ explanation: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
              rows={2}
              placeholder="Explain why this is the correct answer and what learners should take away…"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const QuizQuestionsEditor: React.FC<QuizQuestionsEditorProps> = ({ questions, onChange }) => {
  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: 'multiple-choice',
      question: '',
      options: ['', '', ''],
      correctAnswer: '',
      explanation: '',
    };
    onChange([...questions, newQ]);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const deleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newArr = [...questions];
    const target = direction === 'up' ? index - 1 : index + 1;
    [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
    onChange(newArr);
  };

  const readyCount = questions.filter(q => {
    if (!q.question.trim()) return false;
    if (q.type === 'multiple-choice') return !!q.correctAnswer;
    if (q.type === 'multi-select') return Array.isArray(q.correctAnswer) && q.correctAnswer.length > 0;
    return true;
  }).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {questions.length > 0 && (
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{readyCount}/{questions.length}</span> questions ready
          </p>
        )}
        <button
          type="button"
          onClick={addQuestion}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Empty state */}
      {questions.length === 0 && (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">No quiz questions yet</h4>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">
            Add multiple-choice, multi-select, or open-ended questions. Learners get instant feedback after answering.
          </p>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add First Question
          </button>
        </div>
      )}

      {/* Question cards */}
      <div className="space-y-3">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            total={questions.length}
            onChange={updates => updateQuestion(i, updates)}
            onDelete={() => deleteQuestion(i)}
            onMoveUp={() => moveQuestion(i, 'up')}
            onMoveDown={() => moveQuestion(i, 'down')}
          />
        ))}
      </div>

      {/* Add another button (if questions exist) */}
      {questions.length > 0 && (
        <button
          type="button"
          onClick={addQuestion}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add another question
        </button>
      )}
    </div>
  );
};

export default QuizQuestionsEditor;
