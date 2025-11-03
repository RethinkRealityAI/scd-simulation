import React, { useState, useMemo } from 'react';
import { BarChart3, Users, Clock, TrendingUp, Award, Target, RefreshCw, Grid, List, Search, Filter, Download } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import SessionCard from './SessionCard';
import SessionDetailModal from './SessionDetailModal';

const AnalyticsDashboard: React.FC = () => {
  const { analyticsData, summary, loading, error, refetch } = useAnalytics();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [educationFilter, setEducationFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');

  // Filter and search logic
  const filteredData = useMemo(() => {
    if (!analyticsData) return [];

    return analyticsData.filter(session => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          session.session_id.toLowerCase().includes(searchLower) ||
          session.user_demographics.age.toLowerCase().includes(searchLower) ||
          session.user_demographics.educationLevel.toLowerCase().includes(searchLower) ||
          (session.user_demographics.organization && session.user_demographics.organization.toLowerCase().includes(searchLower)) ||
          (session.user_demographics.school && session.user_demographics.school.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Score filter
      if (scoreFilter !== 'all') {
        if (scoreFilter === 'high' && session.final_score < 80) return false;
        if (scoreFilter === 'medium' && (session.final_score < 60 || session.final_score >= 80)) return false;
        if (scoreFilter === 'low' && session.final_score >= 60) return false;
      }

      // Education filter
      if (educationFilter !== 'all' && session.user_demographics.educationLevel !== educationFilter) {
        return false;
      }

      // Age filter
      if (ageFilter !== 'all' && session.user_demographics.age !== ageFilter) {
        return false;
      }

      return true;
    });
  }, [analyticsData, searchTerm, scoreFilter, educationFilter, ageFilter]);

  // Get unique values for filters
  const uniqueEducationLevels = useMemo(() => {
    if (!analyticsData) return [];
    return Array.from(new Set(analyticsData.map(s => s.user_demographics.educationLevel)));
  }, [analyticsData]);

  const uniqueAgeGroups = useMemo(() => {
    if (!analyticsData) return [];
    return Array.from(new Set(analyticsData.map(s => s.user_demographics.age)));
  }, [analyticsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium">Error loading analytics: {error}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Analytics Dashboard
            </h2>
            <p className="text-gray-600">Monitor learner performance and simulation effectiveness</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-500">Total Users</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalUsers}</div>
            <p className="text-sm text-gray-500 mt-1">Completed simulations</p>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-gray-500">Avg Score</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.averageScore}%</div>
            <p className="text-sm text-gray-500 mt-1">Overall performance</p>
          </div>

          {/* Average Completion Time */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">Avg Time</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(summary.averageCompletionTime / 60)}
              <span className="text-lg text-gray-500 ml-1">min</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">To complete simulation</p>
          </div>

          {/* Average Scenes Completed */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-gray-500">Avg Scenes</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.averageCompletedScenes}</div>
            <p className="text-sm text-gray-500 mt-1">Scenes completed</p>
          </div>
        </div>
      )}

      {/* Category Performance */}
      {summary && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Performance by Competency Domain
          </h3>
          
          <div className="space-y-4">
            {[
              { key: 'timelyPainManagement', label: 'Timely Pain Management', color: 'orange' },
              { key: 'clinicalJudgment', label: 'Clinical Judgment', color: 'blue' },
              { key: 'communication', label: 'Communication', color: 'green' },
              { key: 'culturalSafety', label: 'Cultural Safety', color: 'purple' },
              { key: 'biasMitigation', label: 'Bias Mitigation', color: 'pink' }
            ].map(category => {
              const score = summary.categoryAverages[category.key as keyof typeof summary.categoryAverages];
              return (
                <div key={category.key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{category.label}</span>
                    <span className="font-bold text-gray-900">{score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r from-${category.color}-400 to-${category.color}-600 transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {analyticsData && analyticsData.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Recent Sessions ({filteredData.length} of {analyticsData.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Score Filter */}
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Scores</option>
                <option value="high">High (80%+)</option>
                <option value="medium">Medium (60-79%)</option>
                <option value="low">Low (<60%)</option>
              </select>

              {/* Education Filter */}
              <select
                value={educationFilter}
                onChange={(e) => setEducationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Education Levels</option>
                {uniqueEducationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              {/* Age Filter */}
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Age Groups</option>
                {uniqueAgeGroups.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
          </div>
          
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Sessions Found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.slice(0, 12).map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedSession(session)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Age Group</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Education</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Score</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Time</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Scenes</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 10).map((entry, index) => (
                    <tr 
                      key={entry.id} 
                      className={`${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(entry.submission_timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.user_demographics.age}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.user_demographics.educationLevel}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                        {entry.final_score}%
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600">
                        {Math.round(entry.completion_time / 60)}m
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600">
                        {entry.completed_scenes.length}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedSession(entry)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {(!analyticsData || analyticsData.length === 0) && !loading && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Analytics Data Yet</h3>
          <p className="text-gray-500">
            Analytics data will appear here once learners complete the simulation.
          </p>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;

