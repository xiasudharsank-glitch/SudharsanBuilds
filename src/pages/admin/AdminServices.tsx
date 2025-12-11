import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Eye, EyeOff, Star, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  fetchAllServices,
  createService,
  updateService,
  deleteService,
  toggleServicePublished,
  toggleServicePopular,
  type Service
} from '../../utils/servicesApi';

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    slug: '',
    icon_name: 'Code2',
    price_inr: 0,
    price_usd: 0,
    price_subtext: '',
    description: '',
    features: [],
    timeline: '',
    cta_text: 'Get Started',
    cta_action: 'book',
    deposit_amount_inr: 0,
    deposit_amount_usd: 0,
    is_popular: false,
    is_published: true,
    display_order: 0
  });

  // Temporary state for adding features
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await fetchAllServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await createService(formData as Omit<Service, 'id' | 'created_at' | 'updated_at'>);
      }

      await loadServices();
      resetForm();
      alert(editingService ? 'Service updated!' : 'Service created!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete service "${name}"? This cannot be undone.`)) return;

    try {
      await deleteService(id);
      await loadServices();
      alert('Service deleted!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleTogglePublished = async (id: string, isPublished: boolean) => {
    try {
      await toggleServicePublished(id, !isPublished);
      await loadServices();
    } catch (error) {
      console.error('Error toggling published:', error);
    }
  };

  const handleTogglePopular = async (id: string, isPopular: boolean) => {
    try {
      await toggleServicePopular(id, !isPopular);
      await loadServices();
    } catch (error) {
      console.error('Error toggling popular:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon_name: 'Code2',
      price_inr: 0,
      price_usd: 0,
      price_subtext: '',
      description: '',
      features: [],
      timeline: '',
      cta_text: 'Get Started',
      cta_action: 'book',
      deposit_amount_inr: 0,
      deposit_amount_usd: 0,
      is_popular: false,
      is_published: true,
      display_order: 0
    });
    setEditingService(null);
    setShowForm(false);
    setNewFeature('');
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData({
      ...formData,
      features: [...(formData.features || []), newFeature.trim()]
    });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || []
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-cyan-400" />
            Services Management
          </h1>
          <p className="text-slate-400 mt-2">Manage your service offerings and pricing</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Services</p>
          <p className="text-2xl font-bold text-white">{services.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Published</p>
          <p className="text-2xl font-bold text-green-400">{services.filter(s => s.is_published).length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Popular</p>
          <p className="text-2xl font-bold text-yellow-400">{services.filter(s => s.is_popular).length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Avg Price (INR)</p>
          <p className="text-2xl font-bold text-cyan-400">
            ₹{services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price_inr, 0) / services.length) : 0}
          </p>
        </div>
      </div>

      {/* Services List or Form */}
      {!showForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-slate-800 rounded-lg p-6 border-2 ${
                service.is_popular ? 'border-yellow-500' : 'border-slate-700'
              } relative overflow-hidden`}
            >
              {service.is_popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-yellow-600 text-white px-4 py-1 text-xs font-bold">
                  POPULAR
                </div>
              )}

              <div className="flex items-start justify-between mb-3 mt-2">
                <h3 className="text-xl font-bold text-white flex-1">{service.name}</h3>
                {service.is_popular && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-2" />}
              </div>

              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{service.description}</p>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  <span className="text-2xl font-bold text-cyan-400">₹{(service.price_inr || 0).toLocaleString()}</span>
                </div>
                {service.price_usd && service.price_usd > 0 && (
                  <span className="text-slate-500">/ ${service.price_usd}</span>
                )}
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{service.timeline}</span>
              </div>

              {/* Features Preview */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Features ({service.features.length})</p>
                <div className="flex flex-wrap gap-1">
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                      {feature.length > 30 ? feature.substring(0, 30) + '...' : feature}
                    </span>
                  ))}
                  {service.features.length > 3 && (
                    <span className="px-2 py-1 text-slate-500 text-xs">+{service.features.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm font-medium"
                >
                  <Edit className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => handleTogglePublished(service.id, service.is_published)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                    service.is_published
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {service.is_published ? <Eye className="w-4 h-4 mx-auto" /> : <EyeOff className="w-4 h-4 mx-auto" />}
                </button>
                <button
                  onClick={() => handleTogglePopular(service.id, service.is_popular)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                    service.is_popular
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  <Star className={`w-4 h-4 mx-auto ${service.is_popular ? 'fill-yellow-400' : ''}`} />
                </button>
                <button
                  onClick={() => handleDelete(service.id, service.name)}
                  className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Service Form */
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {editingService ? 'Edit Service' : 'New Service'}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-white">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  required
                  placeholder="e.g., Landing Page Development"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">URL Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  required
                  placeholder="landing-page-development"
                />
              </div>

              {/* Icon Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Icon Name (Lucide)</label>
                <input
                  type="text"
                  value={formData.icon_name}
                  onChange={e => setFormData({ ...formData, icon_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  placeholder="Code2"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  required
                  placeholder="Describe the service..."
                />
              </div>

              {/* Price INR */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Price (INR) *</label>
                <input
                  type="number"
                  value={formData.price_inr}
                  onChange={e => setFormData({ ...formData, price_inr: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  required
                  min="0"
                />
              </div>

              {/* Price USD */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Price (USD)</label>
                <input
                  type="number"
                  value={formData.price_usd}
                  onChange={e => setFormData({ ...formData, price_usd: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  min="0"
                />
              </div>

              {/* Price Subtext */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Price Subtext</label>
                <input
                  type="text"
                  value={formData.price_subtext}
                  onChange={e => setFormData({ ...formData, price_subtext: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  placeholder="e.g., per project, one-time"
                />
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Timeline *</label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  required
                  placeholder="e.g., 1-2 weeks"
                />
              </div>

              {/* CTA Text */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">CTA Button Text</label>
                <input
                  type="text"
                  value={formData.cta_text}
                  onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  placeholder="Get Started"
                />
              </div>

              {/* CTA Action */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">CTA Action</label>
                <select
                  value={formData.cta_action}
                  onChange={e => setFormData({ ...formData, cta_action: e.target.value as 'book' | 'quote' })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  <option value="book">Book Appointment</option>
                  <option value="quote">Request Quote</option>
                </select>
              </div>

              {/* Deposit INR */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Deposit (INR)</label>
                <input
                  type="number"
                  value={formData.deposit_amount_inr}
                  onChange={e => setFormData({ ...formData, deposit_amount_inr: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  min="0"
                />
              </div>

              {/* Checkboxes */}
              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={e => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="font-semibold">Mark as Popular (Featured)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="font-semibold">Published (Visible on site)</span>
                </label>
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Features</label>
                <div className="space-y-2 mb-3">
                  {formData.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-900 p-3 rounded">
                      <span className="flex-1 text-slate-300">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={e => setNewFeature(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                    placeholder="Add a feature..."
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                {editingService ? 'Update Service' : 'Create Service'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
