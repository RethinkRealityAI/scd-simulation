import React from 'react';
import { X, Clock, User, Award, Target, CheckCircle, XCircle, Calendar, BookOpen, Brain, MessageCircle, Shield, Users, TrendingUp, Activity } from 'lucide-react';
import { AnalyticsEntry } from '../../hooks/useAnalytics';

interface SessionDetailModalProps {
  session: AnalyticsEntry;
  isOpen: boolean;
  onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'timelyPainManagement': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'clinicalJudgment': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'communication': return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'culturalSafety': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'biasMitigation': return <Users className="w-4 h-4 text-pink-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'timelyPainManagement': return 'Timely Pain Management';
      case 'clinicalJudgment': return 'Clinical Judgment';
      case 'communication': return 'Communication';
      case 'culturalSafety': return 'Cultural Safety';
      case 'biasMitigation': return 'Bias Mitigation';
      default: return category;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 60) return <Target className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const { date, time } = formatTimestamp(session.submission_timestamp);
  const totalQuestions = session.responses.length;
  const correctAnswers = session.responses.filter(r => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Session Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Session ID: {session.session_id.slice(-8)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Session Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-700">Date & Time</span>
                </div>
                <p className="text-sm text-gray-600">{date}</p>
                <p className="text-sm text-gray-600">{time}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-700">Final Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{session.final_score}%</span>
                  {getScoreIcon(session.final_score)}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-700">Completion Time</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatTime(session.completion_time)}
                </p>
              </div>
            </div>

            {/* User Demographics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                User Demographics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Age Group:</span>
                  <p className="text-gray-900">{session.user_demographics.age}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Education Level:</span>
                  <p className="text-gray-900">{session.user_demographics.educationLevel}</p>
                </div>
                {session.user_demographics.organization && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Organization:</span>
                    <p className="text-gray-900">{session.user_demographics.organization}</p>
                  </div>
                )}
                {session.user_demographics.school && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">School:</span>
                    <p className="text-gray-900">{session.user_demographics.school}</p>
                  </div>
                )}
                {session.user_demographics.year && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Year:</span>
                    <p className="text-gray-900">{session.user_demographics.year}</p>
                  </div>
                )}
                {session.user_demographics.program && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Program:</span>
                    <p className="text-gray-900">{session.user_demographics.program}</p>
                  </div>
                )}
                {session.user_demographics.field && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Field:</span>
                    <p className="text-gray-900">{session.user_demographics.field}</p>
                  </div>
                )}
                {session.user_demographics.howHeard && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">How Heard About:</span>
                    <p className="text-gray-900">{session.user_demographics.howHeard}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-600" />
                Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
                  <p className="text-sm text-gray-600">Total Questions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
                  <p className="text-sm text-gray-600">Accuracy Rate</p>
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-600" />
                Competency Domain Scores
              </h3>
              <div className="space-y-3">
                {Object.entries(session.category_scores).map(([category, score]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium text-gray-700">
                        {getCategoryLabel(category)}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
                      {score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Responses */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-600" />
                Question Responses
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {session.responses.map((response, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Question {index + 1} (Scene {response.sceneId})
                          </span>
                          {response.questionType && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {response.questionType}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Time spent: {formatTime(response.timeSpent)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {response.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${
                          response.isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {response.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    </div>
                    
                    {response.questionText && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">Question:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                          {response.questionText}
                        </p>
                      </div>
                    )}

                    {response.options && response.options.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">Options:</p>
                        <div className="space-y-1">
                          {response.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2 text-sm">
                              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className={`${
                                option === response.correctAnswer || 
                                (Array.isArray(response.correctAnswer) && response.correctAnswer.includes(option))
                                  ? 'text-green-700 font-medium' 
                                  : 'text-gray-700'
                              }`}>
                                {option}
                              </span>
                              {option === response.answer && (
                                <span className="text-blue-600 text-xs font-medium">(Selected)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">User Answer:</p>
                        <p className="text-sm text-gray-700 bg-blue-50 rounded p-2">
                          {response.answer}
                        </p>
                      </div>
                      
                      {response.correctAnswer && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Correct Answer:</p>
                          <p className="text-sm text-green-700 bg-green-50 rounded p-2">
                            {Array.isArray(response.correctAnswer) 
                              ? response.correctAnswer.join(', ') 
                              : response.correctAnswer}
                          </p>
                        </div>
                      )}

                      {response.explanation && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Explanation:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                            {response.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                Session Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Completed Scenes:</span>
                  <p className="text-gray-900">{session.completed_scenes.length}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Average Time per Question:</span>
                  <p className="text-gray-900">
                    {formatTime(Math.round(session.completion_time / totalQuestions))}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Session Duration:</span>
                  <p className="text-gray-900">{formatTime(session.completion_time)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Questions per Scene:</span>
                  <p className="text-gray-900">
                    {session.completed_scenes.length > 0 
                      ? Math.round(totalQuestions / session.completed_scenes.length) 
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {session.performance_metrics && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Average Time per Question:</span>
                    <p className="text-gray-900">{formatTime(session.performance_metrics.averageTimePerQuestion)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Longest Question Time:</span>
                    <p className="text-gray-900">{formatTime(session.performance_metrics.longestQuestionTime)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Shortest Question Time:</span>
                    <p className="text-gray-900">{formatTime(session.performance_metrics.shortestQuestionTime)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Questions per Scene:</span>
                    <p className="text-gray-900">{session.performance_metrics.questionsPerScene}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Device Information */}
            {session.device_info && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-600" />
                  Device Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Platform:</span>
                    <p className="text-gray-900">{session.device_info.platform}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Screen Resolution:</span>
                    <p className="text-gray-900">{session.device_info.screenResolution}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">User Agent:</span>
                    <p className="text-gray-900 text-xs break-all">{session.device_info.userAgent}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;
