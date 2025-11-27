import { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap, AlertTriangle, Activity, Target, TestTube, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  getActivityLogs,
  getConversionFunnels,
  getFunnelAnalytics,
  getActiveExperiments,
  getABTestResults,
  getPerformanceMetrics,
  getAveragePerformance,
  getErrorLogs,
  type ActivityLog,
  type ConversionFunnel,
  type ABTestExperiment,
  type PerformanceMetric,
  type ErrorLog
} from '../../utils/notificationsAnalyticsApi';

type TabType = 'overview' | 'funnels' | 'ab-tests' | 'performance' | 'errors';

export default function AdminAdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [funnels, setFunnels] = useState<ConversionFunnel[]>([]);
  const [experiments, setExperiments] = useState<ABTestExperiment[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetric[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [avgPageLoad, setAvgPageLoad] = useState(0);
  const [avgLCP, setAvgLCP] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logs, funnelsData, experimentsData, perfData, errorsData, pageLoad, lcp] = await Promise.all([
        getActivityLogs(100),
        getConversionFunnels(),
        getActiveExperiments(),
        getPerformanceMetrics(undefined, 100),
        getErrorLogs(50),
        getAveragePerformance('page_load'),
        getAveragePerformance('lcp')
      ]);

      setActivityLogs(logs);
      setFunnels(funnelsData);
      setExperiments(experimentsData);
      setPerformance(perfData);
      setErrors(errorsData);
      setAvgPageLoad(pageLoad);
      setAvgLCP(lcp);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'funnels' as TabType, label: 'Funnels', icon: Target },
    { id: 'ab-tests' as TabType, label: 'A/B Tests', icon: TestTube },
    { id: 'performance' as TabType, label: 'Performance', icon: Zap },
    { id: 'errors' as TabType, label: 'Errors', icon: AlertTriangle, count: errors.filter(e => !e.is_resolved).length }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
          Advanced Analytics
        </h1>
        <p className="text-slate-400">Funnels, A/B tests, performance monitoring, and error tracking</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {tab.count && tab.count > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <Activity className="w-6 h-6 opacity-60" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{activityLogs.length}</h3>
              <p className="text-cyan-100 text-sm">Total Activities</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{funnels.length}</h3>
              <p className="text-purple-100 text-sm">Active Funnels</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{avgPageLoad.toFixed(0)}ms</h3>
              <p className="text-emerald-100 text-sm">Avg Page Load</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{errors.filter(e => !e.is_resolved).length}</h3>
              <p className="text-orange-100 text-sm">Unresolved Errors</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activityLogs.slice(0, 10).map((log, idx) => (
                <div key={log.id} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500">{idx + 1}.</span>
                  <span className="text-slate-300">{log.action_type}</span>
                  <span className="text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'funnels' && (
        <div className="space-y-6">
          {funnels.map(funnel => (
            <FunnelAnalytics key={funnel.id} funnel={funnel} />
          ))}
        </div>
      )}

      {activeTab === 'ab-tests' && (
        <div className="space-y-6">
          {experiments.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
              <TestTube className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No active A/B tests</p>
            </div>
          ) : (
            experiments.map(experiment => (
              <ABTestResults key={experiment.id} experiment={experiment} />
            ))
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-slate-400 text-sm mb-2">Avg Page Load</h3>
              <p className="text-3xl font-bold text-white">{avgPageLoad.toFixed(0)}ms</p>
              <p className={`text-sm mt-2 ${avgPageLoad < 2000 ? 'text-green-400' : avgPageLoad < 4000 ? 'text-yellow-400' : 'text-red-400'}`}>
                {avgPageLoad < 2000 ? 'Excellent' : avgPageLoad < 4000 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-slate-400 text-sm mb-2">Avg LCP</h3>
              <p className="text-3xl font-bold text-white">{avgLCP.toFixed(0)}ms</p>
              <p className={`text-sm mt-2 ${avgLCP < 2500 ? 'text-green-400' : avgLCP < 4000 ? 'text-yellow-400' : 'text-red-400'}`}>
                {avgLCP < 2500 ? 'Good' : avgLCP < 4000 ? 'Needs Improvement' : 'Poor'}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-slate-400 text-sm mb-2">Total Metrics</h3>
              <p className="text-3xl font-bold text-white">{performance.length}</p>
              <p className="text-sm mt-2 text-slate-400">Recorded</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Recent Performance Metrics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700">
                  <tr className="text-left text-sm text-slate-400">
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Value</th>
                    <th className="pb-3">Page</th>
                    <th className="pb-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.slice(0, 20).map(metric => (
                    <tr key={metric.id} className="border-b border-slate-700/50 text-sm">
                      <td className="py-3 text-cyan-400">{metric.metric_type}</td>
                      <td className="py-3 text-white font-semibold">{metric.metric_value.toFixed(0)}ms</td>
                      <td className="py-3 text-slate-400">{metric.page_url?.split('/').pop() || 'N/A'}</td>
                      <td className="py-3 text-slate-500">{new Date(metric.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'errors' && (
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Error Logs</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {errors.map(error => (
              <div key={error.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        error.severity === 'critical' ? 'bg-red-500 text-white' :
                        error.severity === 'error' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {error.severity}
                      </span>
                      <span className="text-white font-semibold">{error.error_type}</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{error.error_message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{error.page_url}</span>
                      <span>{new Date(error.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    error.is_resolved ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {error.is_resolved ? 'Resolved' : 'Open'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function FunnelAnalytics({ funnel }: { funnel: ConversionFunnel }) {
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    getFunnelAnalytics(funnel.id).then(setAnalytics);
  }, [funnel.id]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">{funnel.name}</h3>
      <div className="space-y-3">
        {analytics.map((step, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300">{step.step}</span>
                <span className="text-white font-semibold">{step.sessions} sessions</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  style={{ width: `${(step.sessions / (analytics[0]?.sessions || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ABTestResults({ experiment }: { experiment: ABTestExperiment }) {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    getABTestResults(experiment.id).then(setResults);
  }, [experiment.id]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">{experiment.name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map(result => (
          <div key={result.variant} className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-slate-300 font-semibold mb-2">{result.variant}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Views:</span>
                <span className="text-white">{result.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Conversions:</span>
                <span className="text-white">{result.conversions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rate:</span>
                <span className="text-cyan-400 font-semibold">{result.conversionRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
