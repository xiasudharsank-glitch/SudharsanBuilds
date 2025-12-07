import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
  Upload,
  X,
  Loader2,
  Save,
  StarIcon,
  User,
  Briefcase,
  MapPin,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialPublished,
  toggleTestimonialFeatured,
  uploadTestimonialAvatar,
  deleteTestimonialAvatar,
  getTestimonialStats,
  type Testimonial
} from '../../utils/testimonialsApi';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    location: '',
    company: '',
    rating: 5,
    text: '',
    service_provided: '',
    project_url: '',
    is_featured: false,
    is_published: true,
    display_order: 0,
    avatar_url: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Stats
  const [stats, setStats] = useState({
    total_count: 0,
    published_count: 0,
    featured_count: 0,
    average_rating: 0,
    five_star_count: 0,
    recent_count: 0
  });

  useEffect(() => {
    loadTestimonials();
    loadStats();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await fetchAllTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      alert('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getTestimonialStats();
      if (data) setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        location: testimonial.location || '',
        company: testimonial.company || '',
        rating: testimonial.rating,
        text: testimonial.text,
        service_provided: testimonial.service_provided || '',
        project_url: testimonial.project_url || '',
        is_featured: testimonial.is_featured,
        is_published: testimonial.is_published,
        display_order: testimonial.display_order,
        avatar_url: testimonial.avatar_url || ''
      });
      setAvatarPreview(testimonial.avatar_url || '');
    } else {
      setEditingTestimonial(null);
      setFormData({
        name: '',
        role: '',
        location: '',
        company: '',
        rating: 5,
        text: '',
        service_provided: '',
        project_url: '',
        is_featured: false,
        is_published: true,
        display_order: testimonials.length,
        avatar_url: ''
      });
      setAvatarPreview('');
    }
    setAvatarFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
    setAvatarFile(null);
    setAvatarPreview('');
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.role || !formData.text) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      let avatarUrl = formData.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        const tempId = editingTestimonial?.id || 'temp';
        avatarUrl = await uploadTestimonialAvatar(avatarFile, tempId) || '';
      }

      if (editingTestimonial) {
        // Update existing
        await updateTestimonial(editingTestimonial.id, {
          ...formData,
          avatar_url: avatarUrl
        });
        alert('Testimonial updated successfully!');
      } else {
        // Create new
        await createTestimonial({
          ...formData,
          avatar_url: avatarUrl
        });
        alert('Testimonial created successfully!');
      }

      await loadTestimonials();
      await loadStats();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;

    try {
      await deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      await loadStats();
      alert('Testimonial deleted successfully!');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      await toggleTestimonialPublished(id, !currentStatus);
      setTestimonials(prev =>
        prev.map(t => (t.id === id ? { ...t, is_published: !currentStatus } : t))
      );
      await loadStats();
    } catch (error) {
      console.error('Error toggling published:', error);
      alert('Failed to update testimonial');
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await toggleTestimonialFeatured(id, !currentStatus);
      setTestimonials(prev =>
        prev.map(t => (t.id === id ? { ...t, is_featured: !currentStatus } : t))
      );
      await loadStats();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Failed to update testimonial');
    }
  };

  const filteredTestimonials = testimonials.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Manage Testimonials
          </h1>
          <p className="text-slate-400">
            Add, edit, and showcase client testimonials
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-slate-400 text-sm mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total_count}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-green-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">Published</p>
          <p className="text-2xl font-bold text-green-400">{stats.published_count}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-yellow-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">Featured</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.featured_count}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-amber-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">Avg Rating</p>
          <p className="text-2xl font-bold text-amber-400">{stats.average_rating?.toFixed(1) || '0.0'} ⭐</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-orange-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">5 Stars</p>
          <p className="text-2xl font-bold text-orange-400">{stats.five_star_count}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-cyan-500/50 p-4">
          <p className="text-slate-400 text-sm mb-1">Recent</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.recent_count}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search testimonials..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">No testimonials yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all overflow-hidden"
            >
              <div className="p-6">
                {/* Avatar & Rating */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                    {testimonial.avatar_url ? (
                      <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      testimonial.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{testimonial.name}</h3>
                    <p className="text-slate-400 text-sm mb-2">{testimonial.role}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-300 text-sm line-clamp-3 mb-4">
                  "{testimonial.text}"
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {testimonial.is_published && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Published
                    </span>
                  )}
                  {testimonial.is_featured && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublished(testimonial.id, testimonial.is_published)}
                    className={`p-2 rounded-lg transition-colors ${
                      testimonial.is_published
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                    title={testimonial.is_published ? 'Published' : 'Unpublished'}
                  >
                    {testimonial.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                    className={`p-2 rounded-lg transition-colors ${
                      testimonial.is_featured
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                    title={testimonial.is_featured ? 'Featured' : 'Not Featured'}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(testimonial)}
                    className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id, testimonial.name)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-white">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Client Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-slate-500" />
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </span>
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="John Smith"
                  />
                </div>

                {/* Role & Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Role/Title *
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      placeholder="CEO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                {/* Location & Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      placeholder="Mumbai, India"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Rating *
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
                      <option value={3}>⭐⭐⭐ (3 stars)</option>
                      <option value={2}>⭐⭐ (2 stars)</option>
                      <option value={1}>⭐ (1 star)</option>
                    </select>
                  </div>
                </div>

                {/* Testimonial Text */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Testimonial Text *
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="What the client said about your work..."
                  />
                </div>

                {/* Service & Project URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Service Provided
                    </label>
                    <input
                      type="text"
                      value={formData.service_provided}
                      onChange={(e) => setFormData({ ...formData, service_provided: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      placeholder="E-Commerce Website"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project URL
                    </label>
                    <input
                      type="url"
                      value={formData.project_url}
                      onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-slate-300">Featured (show on homepage)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-slate-300">Published (visible on site)</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
