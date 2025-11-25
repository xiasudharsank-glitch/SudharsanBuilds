import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Clock, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  fetchConversionFunnel,
  fetchPerformanceMetrics,
  fetchFormErrors,
  fetchFieldAnalytics,
  formatCompletionTime,
  getConversionRateColor,
  type ConversionFunnel,
  type PerformanceMetrics,
  type FormError,
  type FieldAnalytics
} from '../../utils/formAnalytics';

export default function AdminAnalytics() {
  const [funnelData, setFunnelData] = useState<ConversionFunnel[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);
  const [errorsData, setErrorsData] = useState<FormError[]>([]);
  const [fieldData, setFieldData] = useState<FieldAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<string>('all');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [funnel, performance, errors, fields] = await Promise.all([
        fetchConversionFunnel(),
        fetchPerformanceMetrics(),
        fetchFormErrors(),
        fetchFieldAnalytics()
      ]);

      setFunnelData(funnel);
      setPerformanceData(performance);
      setErrorsData(errors);
      setFieldData(fields);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get overall stats
  const totalViews = funnelData.reduce((sum, f) => sum + f.views, 0);
  const totalStarts = funnelData.reduce((sum, f) => sum + f.starts, 0);
  const totalConversions = funnelData.reduce((sum, f) => sum + f.successes, 0);
  const avgConversionRate = totalStarts > 0 ? ((totalConversions / totalStarts) * 100).toFixed(2) : '0';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
          Form Analytics
        </h1>
        <p className="text-slate-400 mt-2">Track form performance and user behavior</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Views</p>
              <p className="text-3xl font-bold text-white mt-1">{totalViews.toLocaleString()}</p>
            </div>
            <Users className="w-12 h-12 text-blue-400 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Form Starts</p>
              <p className="text-3xl font-bold text-white mt-1">{totalStarts.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-cyan-400 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Conversions</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{totalConversions.toLocaleString()}</p>
            </div>
            <Target className="w-12 h-12 text-green-400 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg. Conversion Rate</p>
              <p className={`text-3xl font-bold mt-1 ${getConversionRateColor(parseFloat(avgConversionRate))}`}>
                {avgConversionRate}%
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-400 opacity-20" />
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-cyan-400" />
          Conversion Funnel
        </h2>

        <div className="space-y-6">
          {funnelData.map((funnel, index) => (
            <motion.div
              key={funnel.form_name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white capitalize">
                  {funnel.form_name.replace('_', ' ')} Form
                </h3>
                <span className={`text-sm font-semibold ${getConversionRateColor(funnel.conversion_rate)}`}>
                  {funnel.conversion_rate}% conversion
                </span>
              </div>

              <div className="space-y-3">
                {/* Views */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Views</span>
                    <span className="text-white font-semibold">{funnel.views}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Starts */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Starts</span>
                    <span className="text-white font-semibold">
                      {funnel.starts} ({funnel.view_to_start_rate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${(funnel.starts / funnel.views) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Submissions */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Submissions</span>
                    <span className="text-white font-semibold">{funnel.submits}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${(funnel.submits / funnel.views) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Success */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Success</span>
                    <span className="text-green-400 font-semibold">{funnel.successes}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(funnel.successes / funnel.views) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Abandonment */}
                {funnel.abandonment_rate > 0 && (
                  <div className="pt-2 border-t border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-400">Abandonment Rate</span>
                      <span className="text-red-400 font-semibold">{funnel.abandonment_rate}%</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-cyan-400" />
          Performance Metrics
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Form</th>
                <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm">Sessions</th>
                <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm">Conversions</th>
                <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm">Rate</th>
                <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm">Avg. Time</th>
                <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm">Device Split</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((metric, index) => (
                <tr key={metric.form_name} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 text-white font-medium capitalize">
                    {metric.form_name.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {metric.total_sessions}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400 font-semibold">
                    {metric.conversions}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${getConversionRateColor(metric.conversion_rate)}`}>
                    {metric.conversion_rate}%
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    {formatCompletionTime(metric.avg_completion_time_seconds)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-xs">
                      <span className="text-blue-400">📱 {metric.mobile_sessions}</span>
                      <span className="text-purple-400">💻 {metric.desktop_sessions}</span>
                      <span className="text-cyan-400">🖥️ {metric.tablet_sessions}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Errors */}
      {errorsData.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            Top Form Errors
          </h2>

          <div className="space-y-3">
            {errorsData.slice(0, 10).map((error, index) => (
              <motion.div
                key={`${error.form_name}-${error.field_name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900 rounded-lg p-4 border border-red-500/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                        {error.form_name}
                      </span>
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded">
                        {error.field_name}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{error.error_message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 text-2xl font-bold">{error.error_count}</p>
                    <p className="text-slate-500 text-xs">occurrences</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Field Analytics */}
      {fieldData.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6">Field-Level Analytics</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Form</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Field</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm">Interactions</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm">Errors</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm">Error Rate</th>
                </tr>
              </thead>
              <tbody>
                {fieldData.slice(0, 20).map((field, index) => (
                  <tr key={`${field.form_name}-${field.field_name}`} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-slate-300 text-sm capitalize">
                      {field.form_name.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {field.field_name}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {field.interactions}
                    </td>
                    <td className="py-3 px-4 text-right text-red-400 font-semibold">
                      {field.errors}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${
                        field.error_rate > 10 ? 'text-red-400' :
                        field.error_rate > 5 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {field.error_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
