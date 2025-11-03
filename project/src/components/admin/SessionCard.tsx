import React from 'react';
import { Clock, User, Award, Target, Calendar, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { AnalyticsEntry } from '../../hooks/useAnalytics';

interface SessionCardProps {
  session: AnalyticsEntry;
  onClick: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onClick }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 60) return <Target className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const { date, time } = formatDate(session.submission_timestamp);
  const totalQuestions = session.responses.length;
  const correctAnswers = session.responses.filter(r => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{date}</span>
            <span className="text-xs text-gray-500">{time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-3 h-3" />
            <span>{session.user_demographics.age} • {session.user_demographics.educationLevel}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Award className="w-4 h-4 text-blue-500" />
            <span className="text-lg font-bold text-gray-900">{session.final_score}%</span>
            {getScoreIcon(session.final_score)}
          </div>
          <p className="text-xs text-gray-500">Final Score</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-lg font-bold text-gray-900">{formatTime(session.completion_time)}</span>
          </div>
          <p className="text-xs text-gray-500">Duration</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-gray-500" />
            <span className="text-gray-600">{session.completed_scenes.length} scenes</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-gray-600">{correctAnswers}/{totalQuestions}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(accuracy)}`}>
          {accuracy}% accuracy
        </div>
      </div>
    </div>
  );
};

export default SessionCard;

