import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Archive,
  Loader2,
  ExternalLink,
  MessageSquare,
  Star
} from 'lucide-react';
import {
  fetchInquiries,
  getInquiryStats,
  getConversionFunnel,
  updateInquiryStatus,
  updateInquiryPriority,
  archiveInquiry,
  deleteInquiry,
  exportInquiriesToCSV,
  subscribeToInquiries,
  type Inquiry,
  type InquiryFunnel
} from '../../utils/inquiriesApi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    won: 0,
    lost: 0,
    conversionRate: 0
  });

  const [funnel, setFunnel] = useState<InquiryFunnel | null>(null);

  // Real-time notifications
  const [newInquiryNotification, setNewInquiryNotification] = useState<Inquiry | null>(null);

  useEffect(() => {
    loadInquiries();
    loadStats();
    loadFunnel();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToInquiries((newInquiry) => {
      setInquiries(prev => [newInquiry, ...prev]);
      setNewInquiryNotification(newInquiry);

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Inquiry Received! 🎉', {
          body: `${newInquiry.name} - ${newInquiry.service}`,
          icon: '/favicon.ico',
          tag: newInquiry.id
        });
      }

      // Play sound (optional)
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {}); // Ignore if sound fails

      // Auto-hide notification after 5 seconds
      setTimeout(() => setNewInquiryNotification(null), 5000);
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = inquiries;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(i => i.service === serviceFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(i => i.priority === priorityFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(search) ||
        i.email.toLowerCase().includes(search) ||
        i.message.toLowerCase().includes(search) ||
        i.phone.includes(search)
      );
    }

    setFilteredInquiries(filtered);
  }, [inquiries, statusFilter, serviceFilter, priorityFilter, searchTerm]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await fetchInquiries();
      setInquiries(data);
    } catch (error) {
      console.error('Error loading inquiries:', error);
      alert('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getInquiryStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadFunnel = async () => {
    try {
      const data = await getConversionFunnel();
      setFunnel(data);
    } catch (error) {
      console.error('Error loading funnel:', error);
    }
  };

  const handleStatusChange = async (id: string, status: Inquiry['status']) => {
    try {
      await updateInquiryStatus(id, status);
      setInquiries(prev =>
        prev.map(i => (i.id === id ? { ...i, status } : i))
      );
      loadStats(); // Refresh stats
      loadFunnel(); // Refresh funnel
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handlePriorityChange = async (id: string, priority: Inquiry['priority']) => {
    try {
      await updateInquiryPriority(id, priority);
      setInquiries(prev =>
        prev.map(i => (i.id === id ? { ...i, priority } : i))
      );
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this inquiry?')) return;

    try {
      await archiveInquiry(id);
      setInquiries(prev =>
        prev.map(i => (i.id === id ? { ...i, status: 'archived' } : i))
      );
    } catch (error) {
      console.error('Error archiving inquiry:', error);
      alert('Failed to archive inquiry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this inquiry? This cannot be undone.')) return;

    try {
      await deleteInquiry(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
      loadStats();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Failed to delete inquiry');
    }
  };

  const handleExport = () => {
    exportInquiriesToCSV(filteredInquiries);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'contacted': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'qualified': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'proposal_sent': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'negotiating': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'won': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'archived': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Notification */}
      <AnimatePresence>
        {newInquiryNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-xl shadow-2xl border-2 border-white/20 max-w-md"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">New Inquiry! 🎉</p>
                <p className="text-sm opacity-90">{newInquiryNotification.name}</p>
                <p className="text-xs opacity-75">{newInquiryNotification.service}</p>
              </div>
              <button
                onClick={() => setNewInquiryNotification(null)}
                className="text-white/80 hover:text-white"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Inquiry Management
          </h1>
          <p className="text-slate-400">
            Track and manage all client inquiries
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-slate-400 text-sm mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-blue-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">New</p>
          <p className="text-2xl font-bold text-blue-400">{stats.new}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-purple-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">Contacted</p>
          <p className="text-2xl font-bold text-purple-400">{stats.contacted}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-green-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">Won</p>
          <p className="text-2xl font-bold text-green-400">{stats.won}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-red-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">Lost</p>
          <p className="text-2xl font-bold text-red-400">{stats.lost}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-cyan-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">Conv. Rate</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.conversionRate?.toFixed(1) || '0.0'}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inquiries..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="negotiating">Negotiating</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="archived">Archived</option>
          </select>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Services</option>
            <option value="Basic Website">Basic Website</option>
            <option value="E-Commerce Site">E-Commerce Site</option>
            <option value="Custom Development">Custom Development</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">No inquiries found</p>
          <p className="text-slate-500 text-sm">
            {searchTerm || statusFilter !== 'all' || serviceFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'New inquiries will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Service</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Budget</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Priority</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-medium">{inquiry.name}</p>
                        <p className="text-slate-400 text-sm">{inquiry.email}</p>
                        <p className="text-slate-500 text-xs">{inquiry.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-300">{inquiry.service}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-300">{inquiry.budget}</span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value as Inquiry['status'])}
                        className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(inquiry.status)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="negotiating">Negotiating</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={inquiry.priority}
                        onChange={(e) => handlePriorityChange(inquiry.id, e.target.value as Inquiry['priority'])}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${getPriorityColor(inquiry.priority)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-400 text-sm">{formatDate(inquiry.created_at)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Send email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleArchive(inquiry.id)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
