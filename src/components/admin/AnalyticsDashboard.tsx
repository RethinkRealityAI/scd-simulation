import React, { useState, useMemo } from 'react';
import { BarChart3, Users, Clock, TrendingUp, Award, Target, RefreshCw, Grid, List, Search, Filter, GraduationCap, Stethoscope, Radio } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import SessionCard from './SessionCard';
import SessionDetailModal from './SessionDetailModal';

interface AnalyticsDashboardProps {
  instanceId?: string;
}

const PAGE_SIZE_GRID = 12;
const PAGE_SIZE_LIST = 10;

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ instanceId }) => {
  const { analyticsData, summary, loading, error, refetch } = useAnalytics(instanceId);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [educationFilter, setEducationFilter] = useState<string>('all');
  const [fieldFilter, setFieldFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const categoryBarColors: Record<string, string> = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };
  const demographicCardClassMap: Record<string, { container: string; icon: string; label: string; value: string; meta: string }> = {
    blue: {
      container: 'rounded-lg p-4 bg-blue-50 border border-blue-100',
      icon: 'w-4 h-4 text-blue-600',
      label: 'text-sm font-semibold text-blue-800',
      value: 'text-2xl font-bold text-blue-700',
      meta: 'text-xs text-blue-500 mt-0.5',
    },
    purple: {
      container: 'rounded-lg p-4 bg-purple-50 border border-purple-100',
      icon: 'w-4 h-4 text-purple-600',
      label: 'text-sm font-semibold text-purple-800',
      value: 'text-2xl font-bold text-purple-700',
      meta: 'text-xs text-purple-500 mt-0.5',
    },
    gray: {
      container: 'rounded-lg p-4 bg-gray-50 border border-gray-100',
      icon: 'w-4 h-4 text-gray-600',
      label: 'text-sm font-semibold text-gray-800',
      value: 'text-2xl font-bold text-gray-700',
      meta: 'text-xs text-gray-500 mt-0.5',
    },
  };

  // Filter and search logic
  const filteredData = useMemo(() => {
    if (!analyticsData) return [];

    return analyticsData.filter(session => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          session.session_id?.toLowerCase().includes(searchLower) ||
          (session.user_demographics?.educationLevel && String(session.user_demographics.educationLevel).toLowerCase().includes(searchLower)) ||
          (session.user_demographics?.field && String(session.user_demographics.field).toLowerCase().includes(searchLower)) ||
          (session.user_demographics?.organization && String(session.user_demographics.organization).toLowerCase().includes(searchLower)) ||
          (session.user_demographics?.school && String(session.user_demographics.school).toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (scoreFilter !== 'all') {
        if (scoreFilter === 'high' && session.final_score < 80) return false;
        if (scoreFilter === 'medium' && (session.final_score < 60 || session.final_score >= 80)) return false;
        if (scoreFilter === 'low' && session.final_score >= 60) return false;
      }

      if (educationFilter !== 'all' && session.user_demographics?.educationLevel !== educationFilter) {
        return false;
      }

      if (fieldFilter !== 'all' && session.user_demographics?.field !== fieldFilter) {
        return false;
      }

      return true;
    });
  }, [analyticsData, searchTerm, scoreFilter, educationFilter, fieldFilter]);

  // Reset to page 1 whenever filters change
  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, scoreFilter, educationFilter, fieldFilter, viewMode]);

  // Get unique values for filters
  const uniqueEducationLevels = useMemo(() => {
    if (!analyticsData) return [];
    return Array.from(new Set(analyticsData.map(s => s.user_demographics?.educationLevel).filter(Boolean)));
  }, [analyticsData]);

  const uniqueFields = useMemo(() => {
    if (!analyticsData) return [];
    return Array.from(new Set(analyticsData.map(s => s.user_demographics?.field).filter(Boolean)));
  }, [analyticsData]);

  // ── Demographic breakdown computations ──────────────────────────────────────
  const demographics = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return null;

    const countBy = <T extends string>(
      arr: T[],
    ): { label: T; count: number; pct: number }[] => {
      const total = arr.length;
      const map: Record<string, number> = {};
      arr.forEach(v => { map[v] = (map[v] || 0) + 1; });
      return Object.entries(map)
        .sort(([, a], [, b]) => b - a)
        .map(([label, count]) => ({ label: label as T, count, pct: Math.round((count / total) * 100) }));
    };

    const n = analyticsData.length;

    const students = analyticsData.filter(s => s.user_demographics?.userType === 'student');
    const professionals = analyticsData.filter(s => s.user_demographics?.userType === 'professional');
    const unknown = analyticsData.filter(s => !s.user_demographics?.userType);

    const educationLevels = countBy(
      analyticsData.map(s => s.user_demographics?.educationLevel).filter(Boolean) as string[],
    );
    const fields = countBy(
      analyticsData.map(s => s.user_demographics?.field).filter(Boolean) as string[],
    );
    const schools = countBy(
      analyticsData.map(s => s.user_demographics?.school).filter(Boolean) as string[],
    );
    const programs = countBy(
      analyticsData.map(s => s.user_demographics?.program).filter(Boolean) as string[],
    );
    const howHeard = countBy(
      analyticsData.map(s => s.user_demographics?.howHeard).filter(Boolean) as string[],
    );

    return { n, students, professionals, unknown, educationLevels, fields, schools, programs, howHeard };
  }, [analyticsData]);

  // Pagination helpers
  const pageSize = viewMode === 'grid' ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
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
          {/* Total Sessions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-500">Total Sessions</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalUsers}</div>
            <p className="text-sm text-gray-500 mt-1">Simulation completions</p>
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
              {Math.round(summary.averageCompletionTime / 60000)}
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

      {/* Demographic Insights */}
      {demographics && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Learner Demographics
            <span className="ml-auto text-sm font-normal text-gray-400">{demographics.n} session{demographics.n !== 1 ? 's' : ''}</span>
          </h3>

          {/* Student vs Professional */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Students', count: demographics.students.length, color: 'blue', Icon: GraduationCap },
              { label: 'Professionals', count: demographics.professionals.length, color: 'purple', Icon: Stethoscope },
              { label: 'Not specified', count: demographics.unknown.length, color: 'gray', Icon: Users },
            ].map(({ label, count, color, Icon }) => {
              const pct = Math.round((count / demographics.n) * 100);
              const styles = demographicCardClassMap[color];
              return (
                <div key={label} className={styles.container}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={styles.icon} />
                    <span className={styles.label}>{label}</span>
                  </div>
                  <div className={styles.value}>{count}</div>
                  <div className={styles.meta}>{pct}% of sessions</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Education Level breakdown */}
            {demographics.educationLevels.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  Education Level
                </h4>
                <div className="space-y-2">
                  {demographics.educationLevels.map(({ label, count, pct }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-0.5">
                        <span className="truncate max-w-[200px]">{label}</span>
                        <span className="font-medium text-gray-900 ml-2 flex-shrink-0">{count} <span className="text-gray-400">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Field of Work breakdown (professionals) */}
            {demographics.fields.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-purple-500" />
                  Field of Work
                </h4>
                <div className="space-y-2">
                  {demographics.fields.slice(0, 8).map(({ label, count, pct }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-0.5">
                        <span className="truncate max-w-[200px]">{label}</span>
                        <span className="font-medium text-gray-900 ml-2 flex-shrink-0">{count} <span className="text-gray-400">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Programs breakdown (students) */}
            {demographics.programs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-cyan-500" />
                  Programs
                </h4>
                <div className="space-y-2">
                  {demographics.programs.slice(0, 6).map(({ label, count, pct }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-0.5">
                        <span className="truncate max-w-[200px]">{label}</span>
                        <span className="font-medium text-gray-900 ml-2 flex-shrink-0">{count} <span className="text-gray-400">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How They Heard */}
            {demographics.howHeard.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  How They Heard
                </h4>
                <div className="space-y-2">
                  {demographics.howHeard.map(({ label, count, pct }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-0.5">
                        <span className="truncate max-w-[200px]">{label}</span>
                        <span className="font-medium text-gray-900 ml-2 flex-shrink-0">{count} <span className="text-gray-400">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                      className={`h-3 rounded-full ${categoryBarColors[category.color] || 'bg-blue-500'} transition-all duration-500`}
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
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
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
                <option value="low">Low (&lt;60%)</option>
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

              {/* Field Filter */}
              {uniqueFields.length > 0 && (
                <select
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Fields</option>
                  {uniqueFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              )}
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
              {pagedData.map((session) => (
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Field</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Education</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Score</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Time</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Scenes</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(entry.submission_timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.user_demographics?.field || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.user_demographics?.educationLevel || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                        {entry.final_score}%
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600">
                        {Math.round(entry.completion_time / 60000)}m
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} &middot; {filteredData.length} sessions
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const page = totalPages <= 7 ? i + 1 : currentPage <= 4 ? i + 1 : currentPage + i - 3;
                  if (page < 1 || page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
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

