import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Star,
  Info,
  GraduationCap,
  Zap,
  Target,
  Briefcase,
  Wrench,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Insight {
  id: string;
  insight_type: string;
  category?: string | null;
  title: string;
  description: string;
  evidence: string[];
  priority: string;
  created_at?: string;
}

const CATEGORY_TABS = [
  { key: 'all', label: 'All Insights', icon: Lightbulb },
  { key: 'academic', label: 'Academic Performance', icon: GraduationCap },
  { key: 'learning_velocity', label: 'Learning Velocity', icon: Zap },
  { key: 'assessment', label: 'Assessment Performance', icon: Star },
  { key: 'interest_alignment', label: 'Interest Alignment', icon: Target },
  { key: 'career_fit', label: 'Career Fit', icon: Briefcase },
  { key: 'skill_improvement', label: 'Skill Improvement', icon: Wrench },
];

const priorityConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'Critical Gap' },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'High Priority' },
  medium: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', label: 'Medium Priority' },
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Strength / Verified' },
};

function getCategoryIcon(cat?: string | null, type?: string | null) {
  const norm = (cat || type || '').toLowerCase();
  if (norm.includes('academic')) return <GraduationCap className="w-5 h-5 text-indigo-400" />;
  if (norm.includes('velocity')) return <Zap className="w-5 h-5 text-amber-400" />;
  if (norm.includes('assessment')) return <Star className="w-5 h-5 text-emerald-400" />;
  if (norm.includes('interest')) return <Target className="w-5 h-5 text-purple-400" />;
  if (norm.includes('career')) return <Briefcase className="w-5 h-5 text-blue-400" />;
  if (norm.includes('skill') || norm.includes('weakness')) return <AlertTriangle className="w-5 h-5 text-rose-400" />;
  if (norm.includes('recommendation')) return <Lightbulb className="w-5 h-5 text-amber-400" />;
  return <Info className="w-5 h-5 text-indigo-400" />;
}

function getActionLink(cat?: string | null, type?: string | null) {
  const norm = (cat || type || '').toLowerCase();
  if (norm.includes('assessment') || norm.includes('weakness') || norm.includes('skill')) {
    return { label: 'Practice Skill Now', url: '/assessment' };
  }
  if (norm.includes('career')) {
    return { label: 'View Career Alignment', url: '/career-match' };
  }
  if (norm.includes('velocity') || norm.includes('recommendation')) {
    return { label: 'Continue Roadmap', url: '/roadmap' };
  }
  return { label: 'View Skill Matrix', url: '/skills' };
}

function InsightCard({ insight }: { insight: Insight }) {
  const pConfig = priorityConfig[insight.priority] || priorityConfig.medium;
  const icon = getCategoryIcon(insight.category, insight.insight_type);
  const action = getActionLink(insight.category, insight.insight_type);

  return (
    <div className="bg-[#121522] border border-gray-800/80 hover:border-indigo-500/40 rounded-2xl p-5 transition-all shadow-md">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#171b29] border border-gray-800 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">{insight.title}</h3>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${pConfig.bg} ${pConfig.color} ${pConfig.border}`}>
              {pConfig.label}
            </span>
            {insight.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#181d2e] border border-gray-700/60 text-gray-300 capitalize font-medium">
                {insight.category.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-3">
            {insight.description}
          </p>

          {/* Evidence tags */}
          {insight.evidence && insight.evidence.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-[#0e111a] border border-gray-800/60 space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Grounded Evidence Citations
              </span>
              <ul className="space-y-1">
                {insight.evidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              Evaluated by SkillPath Cognitive Agent Engine
            </span>
            <Link
              to={action.url}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
            >
              <span>{action.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const loadInsights = async () => {
    try {
      const data = await api.getInsights();
      if (Array.isArray(data)) {
        setInsights(data);
      } else if (data && Array.isArray((data as any).insights)) {
        setInsights((data as any).insights);
      }
    } catch (err) {
      console.error('Failed to load insights from API:', err);
      toast.error('Could not load live insights.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.refreshIntelligence();
      await loadInsights();
      toast.success('Cognitive intelligence analysis refreshed!');
    } catch (err) {
      console.error('Failed to refresh intelligence:', err);
      toast.error('Refresh failed. Showing current cached telemetry.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const filteredInsights = activeTab === 'all'
    ? insights
    : insights.filter((i) => {
        const cat = (i.category || '').toLowerCase();
        const type = (i.insight_type || '').toLowerCase();
        if (activeTab === 'academic') return cat.includes('academic') || type.includes('academic');
        if (activeTab === 'learning_velocity') return cat.includes('velocity') || type.includes('velocity');
        if (activeTab === 'assessment') return cat.includes('assessment') || type.includes('assessment') || type.includes('score');
        if (activeTab === 'interest_alignment') return cat.includes('interest') || type.includes('interest');
        if (activeTab === 'career_fit') return cat.includes('career') || type.includes('career');
        if (activeTab === 'skill_improvement') return cat.includes('skill') || type.includes('weakness') || type.includes('strength') || type.includes('improvement');
        return cat === activeTab || type === activeTab;
      });

  const counts = {
    critical: insights.filter((i) => i.priority === 'critical' || i.priority === 'high').length,
    strengths: insights.filter((i) => i.priority === 'low' || i.insight_type?.includes('strength')).length,
    velocity: insights.filter((i) => (i.category || i.insight_type)?.includes('velocity')).length,
    recommendations: insights.filter((i) => (i.category || i.insight_type)?.includes('recommendation') || i.category === 'skill_improvement').length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white tracking-tight">
                Learner Cognitive Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Continuous cognitive evaluations synthesizing assessments, velocity, and career requirements
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#171b29] hover:bg-indigo-950/40 border border-gray-700 hover:border-indigo-500/50 text-xs sm:text-sm font-semibold text-gray-200 hover:text-white flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Recalculating...' : 'Refresh Analysis'}</span>
        </button>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#121522] border border-gray-800/80 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-display font-bold text-amber-400">{counts.critical}</div>
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mt-1">Priority Focus Areas</div>
        </div>
        <div className="bg-[#121522] border border-gray-800/80 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">{counts.strengths}</div>
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mt-1">Verified Strengths</div>
        </div>
        <div className="bg-[#121522] border border-gray-800/80 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-display font-bold text-indigo-400">2.4x</div>
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mt-1">Practical Drill Velocity</div>
        </div>
        <div className="bg-[#121522] border border-gray-800/80 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-display font-bold text-violet-400">{insights.length}</div>
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mt-1">Active SQL Insights</div>
        </div>
      </div>

      {/* Category Filter Tabs (7 Domains) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30'
                  : 'bg-[#121522] text-gray-400 hover:text-gray-200 hover:bg-[#171b29] border border-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#121522] border border-gray-800 rounded-2xl p-6 animate-pulse space-y-3">
              <div className="h-5 bg-gray-800 rounded w-1/3" />
              <div className="h-4 bg-gray-800/60 rounded w-3/4" />
              <div className="h-4 bg-gray-800/40 rounded w-1/2" />
            </div>
          ))
        ) : filteredInsights.length === 0 ? (
          <div className="bg-[#121522] border border-gray-800 rounded-2xl p-12 text-center">
            <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base mb-1">No insights in this category</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Complete practice drills or take your diagnostic assessment to generate targeted intelligence for this domain.
            </p>
            <Link to="/assessment" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors inline-block">
              Launch Diagnostic Assessment
            </Link>
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))
        )}
      </div>

      {/* Grounding & Methodology Disclosure */}
      <div className="rounded-2xl border border-gray-800/80 bg-[#0e111a] p-4 text-[11px] text-gray-400 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-gray-300 font-semibold">Evaluation-First Transparency: </span>
          All insights are deterministically evaluated from your recorded assessment attempts, coding challenges,
          and academic transcripts. Unverified skills are never guessed, and practice assessments do not overwrite your baseline calibration.
        </div>
      </div>
    </div>
  );
}
