import React, { useState, useEffect } from 'react';
import { X, BarChart3, Users, Clock, TrendingUp, Download, RefreshCw } from 'lucide-react';
import { SimulationInstance, useInstanceSessionData } from '../../hooks/useSimulationInstances';

interface InstanceAnalyticsModalProps {
  instance: SimulationInstance;
  onClose: () => void;
}

const InstanceAnalyticsModal: React.FC<InstanceAnalyticsModalProps> = ({ 
  instance, 
  onClose 
}) => {
  const { sessionData, loading, error, fetchSessionData } = useInstanceSessionData(instance.id);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    fetchSessionData();
  }, [instance.id]);

  useEffect(() => {
    if (sessionData.length === 0) {
      setFilteredData([]);
      return;
    }

    const now = new Date();
    const filterDate = (() => {
      switch (timeRange) {
        case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case 'all': return new Date(0);
        default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    })();

    const filtered = sessionData.filter(session => 
      new Date(session.created_at) >= filterDate
    );
    setFilteredData(filtered);
  }, [sessionData, timeRange]);

  const calculateStats = () => {
    if (filteredData.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        averageCompletionTime: 0,
        completionRate: 0,
        webhookSuccessRate: 0
      };
    }

    const totalSessions = filteredData.length;
    const averageScore = filteredData.reduce((sum, session) => sum + (session.final_score || 0), 0) / totalSessions;
    const averageCompletionTime = filteredData.reduce((sum, session) => sum + (session.completion_time || 0), 0) / totalSessions;
    const completedSessions = filteredData.filter(session => session.completion_time).length;
    const completionRate = (completedSessions / totalSessions) * 100;
    const webhookSentSessions = filteredData.filter(session => session.webhook_sent).length;
    const webhookSuccessRate = (webhookSentSessions / totalSessions) * 100;

    return {
      totalSessions,
      averageScore: Math.round(averageScore),
      averageCompletionTime: Math.round(averageCompletionTime / 1000 / 60), // Convert to minutes
      completionRate: Math.round(completionRate),
      webhookSuccessRate: Math.round(webhookSuccessRate)
    };
  };

  const getCategoryScores = () => {
    if (filteredData.length === 0) return {};

    const categoryTotals: { [key: string]: { correct: number; total: number } } = {};
    
    filteredData.forEach(session => {
      if (session.category_scores) {
        Object.entries(session.category_scores).forEach(([category, score]) => {
          if (typeof score === 'number') {
            if (!categoryTotals[category]) {
              categoryTotals[category] = { correct: 0, total: 0 };
            }
            categoryTotals[category].correct += score;
            categoryTotals[category].total += 100; // Assuming max score is 100
          }
        });
      }
    });

    return Object.entries(categoryTotals).map(([category, totals]) => ({
      category,
      averageScore: Math.round((totals.correct / totals.total) * 100),
      totalSessions: filteredData.length
    }));
  };

  const exportData = () => {
    const csvData = filteredData.map(session => ({
      'Session ID': session.session_id,
      'Start Time': new Date(session.start_time).toLocaleString(),
      'Completion Time': session.completion_time ? new Date(session.completion_time).toLocaleString() : 'Incomplete',
      'Final Score': session.final_score,
      'Completion Time (minutes)': session.completion_time ? Math.round(session.completion_time / 1000 / 60) : 'N/A',
      'Webhook Sent': session.webhook_sent ? 'Yes' : 'No',
      'Webhook Attempts': session.webhook_attempts,
      'Education Level': session.user_demographics?.educationLevel || 'N/A',
      'Organization': session.user_demographics?.organization || 'N/A',
      'School': session.user_demographics?.school || 'N/A',
      'Program': session.user_demographics?.program || 'N/A',
      'Field': session.user_demographics?.field || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${instance.institution_name}_analytics_${timeRange}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const stats = calculateStats();
  const categoryScores = getCategoryScores();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
              <p className="text-sm text-gray-600">{instance.institution_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSessionData}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-600">No sessions found for the selected time range</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalSessions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Average Score</p>
                      <p className="text-2xl font-bold text-green-900">{stats.averageScore}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Avg. Completion Time</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.averageCompletionTime}m</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Completion Rate</p>
                      <p className="text-2xl font-bold text-orange-900">{stats.completionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Performance */}
              {categoryScores.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
                  <div className="space-y-3">
                    {categoryScores.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {category.category.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm text-gray-600">{category.averageScore}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${category.averageScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Sessions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-700">Session ID</th>
                        <th className="text-left py-2 font-medium text-gray-700">Start Time</th>
                        <th className="text-left py-2 font-medium text-gray-700">Score</th>
                        <th className="text-left py-2 font-medium text-gray-700">Duration</th>
                        <th className="text-left py-2 font-medium text-gray-700">Webhook</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 10).map((session, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-gray-900 font-mono text-xs">
                            {session.session_id.substring(0, 8)}...
                          </td>
                          <td className="py-2 text-gray-600">
                            {new Date(session.start_time).toLocaleDateString()}
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              session.final_score >= 80 ? 'bg-green-100 text-green-800' :
                              session.final_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {session.final_score}%
                            </span>
                          </td>
                          <td className="py-2 text-gray-600">
                            {session.completion_time ? 
                              `${Math.round(session.completion_time / 1000 / 60)}m` : 
                              'Incomplete'
                            }
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              session.webhook_sent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {session.webhook_sent ? 'Sent' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstanceAnalyticsModal;
