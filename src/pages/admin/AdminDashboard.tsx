import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  TrendingUp,
  Users,
  MessageSquare,
  Eye,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { fetchAllProjects } from '../../utils/projectsApi';
import type { Project } from '../../data/projectsData';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: FolderOpen,
      color: 'cyan',
      link: '/admin/projects'
    },
    {
      label: 'Published',
      value: projects.filter((p) => p.featured).length,
      icon: Eye,
      color: 'green',
      link: '/admin/projects'
    },
    {
      label: 'In Progress',
      value: projects.filter((p) => p.status === 'in-progress').length,
      icon: Clock,
      color: 'amber',
      link: '/admin/projects'
    },
    {
      label: 'Completed',
      value: projects.filter((p) => p.status === 'completed').length,
      icon: CheckCircle,
      color: 'blue',
      link: '/admin/projects'
    }
  ];

  const recentProjects = projects.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-slate-400">
          Here's what's happening with your portfolio today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <TrendingUp className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/projects/new"
          className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl p-6 text-white hover:shadow-xl hover:shadow-cyan-500/50 transition-all"
        >
          <FolderOpen className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">Add New Project</h3>
          <p className="text-cyan-100 text-sm">Create a new portfolio project</p>
        </Link>

        <Link
          to="/admin/inquiries"
          className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl p-6 text-white hover:shadow-xl hover:shadow-purple-500/50 transition-all"
        >
          <MessageSquare className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">View Inquiries</h3>
          <p className="text-purple-100 text-sm">Check client messages</p>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-6 text-white hover:shadow-xl hover:shadow-green-500/50 transition-all"
        >
          <TrendingUp className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">View Analytics</h3>
          <p className="text-green-100 text-sm">Track your performance</p>
        </Link>
      </div>

      {/* Recent Projects */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Projects</h2>
            <Link
              to="/admin/projects"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-700">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/admin/projects/edit/${project.id}`}
                className="block p-6 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold mb-1 truncate">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-1">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        project.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : project.status === 'in-progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {project.status}
                    </span>
                    {project.featured && (
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-medium">
                        Published
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No projects yet</p>
              <Link
                to="/admin/projects/new"
                className="inline-block px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Create Your First Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
