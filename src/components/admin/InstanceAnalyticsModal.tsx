import React, { useState } from 'react';
import { X, Download, RefreshCw, TrendingUp, Users, Clock, Award, Filter } from 'lucide-react';
import { SimulationInstance } from '../../hooks/useSimulationInstances';
import { useAnalytics } from '../../hooks/useAnalytics';

interface InstanceAnalyticsModalProps {
  instance: SimulationInstance;
  onClose: () => void;
}



const InstanceAnalyticsModal: React.FC<InstanceAnalyticsModalProps> = ({ instance, onClose }) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'demographics' | 'trends'>('overview');

  // Use the useAnalytics hook with the specific instanceId
  const analyticsInstanceId = instance.id === 'base-instance' ? undefined : instance.id;
  const {
    analyticsData,
    summary,
    loading,
    error,
    getPerformanceByEducationLevel,
    getPerformanceByField,
    refetch
  } = useAnalytics(analyticsInstanceId);

  // You can still apply dateRange filtering on the frontend if needed, 
  // or use getAnalyticsByDateRange from the hook instead.
  // For now, we'll just use the fetched data (defaults to 100 recent sessions).
  // Ideally, dateRange logic should trigger refetch with specific parameters if supported by the hook.

  const exportData = () => {
    if (!summary || !analyticsData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Sessions', summary.totalUsers.toString()],
      ['Average Score', summary.averageScore.toFixed(1)],
      ['Average Completion Time (min)', (summary.averageCompletionTime / 60000).toFixed(1)],
      ['Average Completed Scenes', summary.averageCompletedScenes.toString()],
      ['', ''],
      ['Category', 'Average Score'],
      ['Timely Pain Management', summary.categoryAverages.timelyPainManagement.toFixed(1)],
      ['Clinical Judgment', summary.categoryAverages.clinicalJudgment.toFixed(1)],
      ['Communication', summary.categoryAverages.communication.toFixed(1)],
      ['Cultural Safety', summary.categoryAverages.culturalSafety.toFixed(1)],
      ['Bias Mitigation', summary.categoryAverages.biasMitigation.toFixed(1)]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${instance.name}-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Instance Analytics</h2>
              <p className="text-green-100 mt-1">{instance.name} - {instance.institution_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                <Filter className="w-4 h-4" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="bg-transparent text-white text-sm focus:outline-none"
                >
                  <option value="7d" className="text-gray-900">Last 7 days</option>
                  <option value="30d" className="text-gray-900">Last 30 days</option>
                  <option value="90d" className="text-gray-900">Last 90 days</option>
                  <option value="all" className="text-gray-900">All time</option>
                </select>
              </div>
              <button
                onClick={exportData}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                title="Export Data"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 p-4">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'performance', label: 'Performance', icon: '🎯' },
              { id: 'demographics', label: 'Demographics', icon: '👥' },
              { id: 'trends', label: 'Trends', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {summary && (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
                          <p className="text-2xl font-bold text-blue-900">{summary.totalUsers}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-green-600 font-medium">Average Score</p>
                          <p className="text-2xl font-bold text-green-900">{summary.averageScore.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Avg. Time</p>
                          <p className="text-2xl font-bold text-purple-900">{(summary.averageCompletionTime / 60000).toFixed(1)}m</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-orange-600 font-medium">Avg Scenes Completed</p>
                          <p className="text-2xl font-bold text-orange-900">{summary.averageCompletedScenes}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
                    <div className="space-y-3">
                      {analyticsData.slice(0, 5).map((session, index) => (
                        <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{new Date(session.submission_timestamp).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-500">Completed {session.completed_scenes.length} scenes</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{session.final_score.toFixed(1)}%</p>
                            <p className="text-sm text-gray-500">score</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
                    <div className="space-y-4">
                      {Object.entries({
                        'Timely Pain Management': summary.categoryAverages.timelyPainManagement,
                        'Clinical Judgment': summary.categoryAverages.clinicalJudgment,
                        'Communication': summary.categoryAverages.communication,
                        'Cultural Safety': summary.categoryAverages.culturalSafety,
                        'Bias Mitigation': summary.categoryAverages.biasMitigation
                      }).map(([category, average]) => (
                        <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{category}</h4>
                              <span className="text-sm text-gray-600">{summary.totalUsers} sessions</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${average}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Average: {average.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Demographics Tab */}
              {activeTab === 'demographics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Level</h3>
                      <div className="space-y-3">
                        {Object.entries(getPerformanceByEducationLevel()).map(([level, data]) => (
                          <div key={level} className="flex items-center justify-between">
                            <span className="text-gray-700">{level}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(data.count / summary.totalUsers) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8 text-right">{data.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Field of Work</h3>
                      <div className="space-y-3">
                        {Object.entries(getPerformanceByField()).map(([field, data]) => (
                          <div key={field} className="flex items-center justify-between">
                            <span className="text-gray-700">{field}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${(data.count / summary.totalUsers) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8 text-right">{data.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trends Tab */}
              {activeTab === 'trends' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions Performance</h3>
                    <div className="space-y-4">
                      {analyticsData.slice(0, 10).map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 text-sm text-gray-600">
                            {new Date(session.submission_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">{session.final_score.toFixed(1)}% Score</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${session.final_score}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Data updated {new Date().toLocaleString()}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstanceAnalyticsModal;