import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Circle, AlertCircle, TrendingUp, Shield, Zap,
  Search, FileText, Settings, RefreshCw, Trophy, Rocket
} from 'lucide-react';
import {
  getProductionChecklist,
  getProductionReadiness,
  updateChecklistItem,
  getLatestHealthStatus,
  type ProductionChecklistItem,
  type ProductionReadiness,
  getCategoryIcon,
  getPriorityColor
} from '../../utils/finalFeaturesApi';

export default function AdminProductionChecklist() {
  const [checklist, setChecklist] = useState<ProductionChecklistItem[]>([]);
  const [readiness, setReadiness] = useState<ProductionReadiness | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [checklistData, readinessData, health] = await Promise.all([
      getProductionChecklist(),
      getProductionReadiness(),
      getLatestHealthStatus()
    ]);

    setChecklist(checklistData);
    setReadiness(readinessData);
    setHealthStatus(health);
    setLoading(false);
  };

  const handleToggleItem = async (item: ProductionChecklistItem) => {
    const success = await updateChecklistItem(
      item.id,
      !item.is_completed,
      item.notes
    );

    if (success) {
      await loadData();
    }
  };

  const categories = Array.from(new Set(checklist.map(item => item.category)));

  const filteredChecklist = checklist.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (!showCompleted && item.is_completed) return false;
    return true;
  });

  const categoryStats = categories.map(category => {
    const items = checklist.filter(i => i.category === category);
    const completed = items.filter(i => i.is_completed).length;
    return { category, total: items.length, completed };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const isProductionReady = readiness?.is_production_ready || false;
  const score = readiness?.score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="w-12 h-12 text-cyan-500" />
            <h1 className="text-4xl font-bold text-slate-900">
              Production Checklist
            </h1>
          </div>
          <p className="text-slate-600">
            Complete all items to ensure your website is production-ready
          </p>
        </div>

        {/* Readiness Score */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`mb-8 p-8 rounded-2xl shadow-2xl ${
            isProductionReady
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600'
          } text-white relative overflow-hidden`}
        >
          {/* Celebration Animation for 100% */}
          {isProductionReady && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -50, x: Math.random() * 100 + '%', opacity: 1 }}
                  animate={{
                    y: '100vh',
                    opacity: 0,
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="absolute text-3xl"
                >
                  {['<‰', '=€', '(', '<Š', 'P'][i % 5]}
                </motion.div>
              ))}
            </div>
          )}

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {isProductionReady ? (
                    <span className="flex items-center gap-2">
                      <Trophy className="w-8 h-8" />
                      Production Ready!
                    </span>
                  ) : (
                    'Almost There!'
                  )}
                </h2>
                <p className="text-white/90">
                  {readiness?.completed} of {readiness?.total} items completed
                  {readiness?.required_total && (
                    <> " {readiness.required_completed}/{readiness.required_total} required</>
                  )}
                </p>
              </div>

              <div className="text-right">
                <div className="text-6xl font-bold mb-2">{score.toFixed(0)}%</div>
                <div className="text-white/90">Overall Score</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>

            {isProductionReady && (
              <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-lg font-medium">
                  <‰ Congratulations! All required items are complete. Your website is ready to launch!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {categoryStats.map(stat => (
            <button
              key={stat.category}
              onClick={() => setFilterCategory(
                filterCategory === stat.category ? 'all' : stat.category
              )}
              className={`p-4 rounded-lg shadow transition ${
                filterCategory === stat.category
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-white text-slate-900 hover:shadow-lg'
              }`}
            >
              <div className="text-2xl mb-2">{getCategoryIcon(stat.category)}</div>
              <div className="text-sm font-medium capitalize mb-1">
                {stat.category}
              </div>
              <div className="text-xs opacity-75">
                {stat.completed}/{stat.total} done
              </div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <span className="text-sm text-slate-700">Show completed</span>
          </label>

          <button
            onClick={() => {
              setFilterCategory('all');
              setShowCompleted(true);
            }}
            className="text-sm text-cyan-600 hover:text-cyan-700"
          >
            Reset filters
          </button>

          <div className="ml-auto">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Health Status */}
        {Object.keys(healthStatus).length > 0 && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              System Health
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(healthStatus).map(([type, check]: [string, any]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    check.status === 'healthy' ? 'bg-green-500' :
                    check.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium capitalize">{type}</div>
                    <div className="text-xs text-slate-500">{check.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Items */}
        <div className="space-y-3">
          {filteredChecklist.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-lg shadow transition ${
                item.is_completed
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleItem(item)}
                  className="flex-shrink-0 mt-1"
                >
                  {item.is_completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 hover:text-cyan-500 transition" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className={`text-lg font-semibold ${
                        item.is_completed ? 'text-slate-600 line-through' : 'text-slate-900'
                      }`}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-slate-600 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Priority Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getPriorityColor(item.priority)
                      }`}>
                        {item.priority}
                      </span>

                      {/* Required Badge */}
                      {item.is_required && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{getCategoryIcon(item.category)}</span>
                    <span className="capitalize">{item.category}</span>
                  </div>

                  {/* Completion Info */}
                  {item.is_completed && item.completed_at && (
                    <div className="mt-3 text-xs text-slate-500">
                      Completed {new Date(item.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredChecklist.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No items to show
            </h3>
            <p className="text-slate-500">
              Adjust your filters to see more items
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
