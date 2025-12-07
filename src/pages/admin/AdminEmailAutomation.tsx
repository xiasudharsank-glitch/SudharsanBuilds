import { useState, useEffect } from 'react';
import { Mail, Send, Clock, CheckCircle, XCircle, Plus, Edit, Trash2, Play, Pause, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchAllEmailTemplates,
  fetchAllEmailSequences,
  fetchPendingEmails,
  fetchEmailLogs,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  createEmailSequence,
  updateEmailSequence,
  deleteEmailSequence,
  cancelScheduledEmail,
  type EmailTemplate,
  type EmailSequence,
  type EmailQueueItem,
  type EmailLog
} from '../../utils/emailAutomationApi';
import LoadingButton, { SaveButton, DeleteButton, CancelButton } from '../../components/LoadingButton';

type TabType = 'templates' | 'sequences' | 'queue' | 'logs';

export default function AdminEmailAutomation() {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [queueItems, setQueueItems] = useState<EmailQueueItem[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingSequence, setEditingSequence] = useState<EmailSequence | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [canceling, setCanceling] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'templates':
          const templatesData = await fetchAllEmailTemplates();
          setTemplates(templatesData);
          break;
        case 'sequences':
          const sequencesData = await fetchAllEmailSequences();
          setSequences(sequencesData);
          break;
        case 'queue':
          const queueData = await fetchPendingEmails(100);
          setQueueItems(queueData);
          break;
        case 'logs':
          const logsData = await fetchEmailLogs(100);
          setLogs(logsData);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Template handlers
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;

    setDeleting(id);
    try {
      await deleteEmailTemplate(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleSequence = async (sequence: EmailSequence) => {
    setSaving(true);
    try {
      await updateEmailSequence(sequence.id, { is_active: !sequence.is_active });
      await loadData();
    } catch (error) {
      console.error('Error toggling sequence:', error);
      alert('Failed to update sequence');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEmail = async (id: string) => {
    if (!confirm('Cancel this scheduled email?')) return;

    setCanceling(id);
    try {
      await cancelScheduledEmail(id);
      await loadData();
    } catch (error) {
      console.error('Error canceling email:', error);
      alert('Failed to cancel email');
    } finally {
      setCanceling(null);
    }
  };

  const tabs = [
    { id: 'templates' as TabType, label: 'Templates', icon: Mail, count: templates.length },
    { id: 'sequences' as TabType, label: 'Sequences', icon: Send, count: sequences.length },
    { id: 'queue' as TabType, label: 'Queue', icon: Clock, count: queueItems.length },
    { id: 'logs' as TabType, label: 'Logs', icon: CheckCircle, count: logs.length }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading email automation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Mail className="w-8 h-8 text-cyan-400" />
          Email Automation
        </h1>
        <p className="text-slate-400">Manage automated email workflows, templates, and sequences</p>
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
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Email Templates</h2>
            <LoadingButton
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }}
              icon={<Plus className="w-5 h-5" />}
            >
              New Template
            </LoadingButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{template.name}</h3>
                    <p className="text-sm text-slate-400">{template.slug}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    template.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-300 font-semibold mb-1">Subject:</p>
                  <p className="text-sm text-slate-400">{template.subject}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                    {template.category}
                  </span>
                  {template.variables.map((variable, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded font-mono">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTemplate(template);
                      setShowTemplateModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm font-medium transition"
                  >
                    <Edit className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    disabled={deleting === template.id}
                    className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm font-medium transition disabled:opacity-50"
                  >
                    {deleting === template.id ? (
                      <div className="w-4 h-4 mx-auto border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mx-auto" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sequences' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Email Sequences</h2>
            <LoadingButton
              onClick={() => {
                setEditingSequence(null);
                setShowSequenceModal(true);
              }}
              icon={<Plus className="w-5 h-5" />}
            >
              New Sequence
            </LoadingButton>
          </div>

          <div className="space-y-4">
            {sequences.map((sequence, index) => (
              <motion.div
                key={sequence.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {sequence.name}
                      {sequence.is_active && (
                        <Play className="w-4 h-4 text-green-400 fill-green-400" />
                      )}
                    </h3>
                    {sequence.description && (
                      <p className="text-sm text-slate-400 mt-1">{sequence.description}</p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
                    {sequence.trigger_event.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingSequence(sequence);
                      setShowSequenceModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Steps
                  </button>
                  <button
                    onClick={() => handleToggleSequence(sequence)}
                    disabled={saving}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                      sequence.is_active
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : sequence.is_active ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {!saving && (sequence.is_active ? 'Pause' : 'Activate')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Email Queue</h2>
            <p className="text-slate-400">Scheduled and pending emails</p>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Recipient</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Scheduled</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queueItems.map(item => (
                  <tr key={item.id} className="border-t border-slate-700">
                    <td className="px-4 py-3 text-sm text-slate-300">
                      <div>
                        <p className="font-semibold">{item.recipient_name || 'N/A'}</p>
                        <p className="text-slate-500">{item.recipient_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{item.subject}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(item.scheduled_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        item.status === 'sending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCancelEmail(item.id)}
                        disabled={canceling === item.id}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs font-medium transition disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {canceling === item.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Email Logs</h2>
            <p className="text-slate-400">Historical record of sent emails</p>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Recipient</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Sent At</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t border-slate-700">
                    <td className="px-4 py-3 text-sm text-slate-300">{log.recipient_email}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{log.subject}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.status === 'sent' || log.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        log.status === 'opened' ? 'bg-blue-500/20 text-blue-400' :
                        log.status === 'clicked' ? 'bg-purple-500/20 text-purple-400' :
                        log.status === 'bounced' || log.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {log.status}
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
