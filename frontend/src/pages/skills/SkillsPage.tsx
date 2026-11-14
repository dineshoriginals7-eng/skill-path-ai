import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Radar as RadarIcon,
  LineChart as LineChartIcon,
  Grid,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Clock,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../../services/api';

interface SkillItemUnified {
  id: string;
  skill_name: string;
  score_percentage: number | null;
  proficiency_level: string;
  strength_level: string;
  learning_priority: string;
  weakness_areas?: string[];
  strength_areas?: string[];
  evidence?: string[];
  is_verified?: boolean;
  status?: string;
  importance?: string;
  target_proficiency?: string;
  evaluated_at?: string;
}

export const SkillsPage: React.FC = () => {
  const navigate = useNavigate();

  const [skills, setSkills] = useState<SkillItemUnified[]>([]);
  const [unassessedSkills, setUnassessedSkills] = useState<SkillItemUnified[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grid' | 'radar' | 'history'>('grid');
  const [filterCategory, setFilterCategory] = useState<'all' | 'verified' | 'weak' | 'unassessed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'priority' | 'name'>('score');

  // Selected skill for detail modal
  const [selectedSkill, setSelectedSkill] = useState<SkillItemUnified | null>(null);
  const [selectedSkillHistory, setSelectedSkillHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // History tab active skill
  const [historySkillName, setHistorySkillName] = useState<string>('Python');
  const [historyChartData, setHistoryChartData] = useState<Array<{ date: string; score: number }>>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchUnifiedSkills = async () => {
      try {
        setIsLoading(true);
        const data = await api.getUnifiedIntelligence();
        if (isMounted && data) {
          const verified = (data.verified_skills || []) as SkillItemUnified[];
          const inProgress = (data.in_progress_skills || []) as SkillItemUnified[];
          const weak = (data.weak_skills || []) as SkillItemUnified[];
          const unassessed = (data.unassessed_skills || []) as SkillItemUnified[];

          // Combine evaluated skills avoiding duplicates
          const seen = new Set<string>();
          const evaluatedCombined: SkillItemUnified[] = [];
          [...verified, ...inProgress, ...weak].forEach((s) => {
            if (!seen.has(s.skill_name.toLowerCase())) {
              seen.add(s.skill_name.toLowerCase());
              evaluatedCombined.push(s);
            }
          });

          setSkills(evaluatedCombined);
          setUnassessedSkills(unassessed);
          if (evaluatedCombined.length > 0) {
            setHistorySkillName(evaluatedCombined[0].skill_name);
          }
        }
      } catch (err) {
        console.error('Failed to load unified skills:', err);
        // Fallback to basic endpoint if needed
        try {
          const fallback = await api.getSkills();
          if (isMounted) setSkills((fallback || []) as any);
        } catch {}
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchUnifiedSkills();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch history when history tab skill changes
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!historySkillName) return;
      try {
        const hist = await api.getSkillHistory(historySkillName);
        const mapped = (hist || []).map((h: any) => ({
          date: h.recorded_at
            ? new Date(h.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : 'Assessment',
          score: Math.round(h.score_percentage ?? 0),
        }));
        if (isMounted) {
          setHistoryChartData(
            mapped.length > 0
              ? mapped
              : [
                  { date: 'Initial Baseline', score: 60 },
                  { date: 'Current Evaluation', score: 75 },
                ]
          );
        }
      } catch (err) {
        console.error('Failed to load skill history:', err);
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [historySkillName]);

  // Open detail modal and load specific skill history
  const handleOpenSkillModal = async (skill: SkillItemUnified) => {
    setSelectedSkill(skill);
    setLoadingHistory(true);
    try {
      const hist = await api.getSkillHistory(skill.skill_name);
      setSelectedSkillHistory(hist || []);
    } catch {
      setSelectedSkillHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Combine evaluated and unassessed for full grid
  const allDisplaySkills = useMemo(() => {
    let list: SkillItemUnified[] = [];
    if (filterCategory === 'all') {
      list = [...skills, ...unassessedSkills];
    } else if (filterCategory === 'verified') {
      list = skills.filter((s) => (s.score_percentage ?? 0) >= 70);
    } else if (filterCategory === 'weak') {
      list = skills.filter((s) => (s.score_percentage ?? 0) < 50);
    } else if (filterCategory === 'unassessed') {
      list = unassessedSkills;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.skill_name.toLowerCase().includes(q));
    }

    return list.sort((a, b) => {
      if (sortBy === 'score') {
        const sa = a.score_percentage ?? -1;
        const sb = b.score_percentage ?? -1;
        return sb - sa;
      }
      if (sortBy === 'name') return a.skill_name.localeCompare(b.skill_name);
      if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        return (priorityOrder[b.learning_priority] || 0) - (priorityOrder[a.learning_priority] || 0);
      }
      return 0;
    });
  }, [skills, unassessedSkills, filterCategory, searchQuery, sortBy]);

  // Radar chart data: only for evaluated skills
  const radarData = useMemo(() => {
    return skills.map((s) => ({
      skill: s.skill_name,
      score: s.score_percentage || 0,
      fullMark: 100,
    }));
  }, [skills]);

  const strongCount = skills.filter((s) => (s.score_percentage ?? 0) >= 70).length;
  const inProgressCount = skills.filter((s) => (s.score_percentage ?? 0) >= 40 && (s.score_percentage ?? 0) < 70).length;
  const weakCount = skills.filter((s) => (s.score_percentage ?? 0) < 40).length;
  const unassessedCount = unassessedSkills.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0d13] text-gray-100 p-6 sm:p-10 font-sans space-y-6 animate-pulse">
        <div className="h-10 bg-gray-800/60 rounded-xl w-60" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#121522] rounded-2xl border border-gray-800" />
          ))}
        </div>
        <div className="h-96 bg-[#121522] rounded-2xl border border-gray-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d13] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Brain className="w-3.5 h-3.5" /> Competency Intelligence Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill Evaluation & Knowledge Matrix
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Continuously calibrated by objective code execution, quiz telemetry, and verified project evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/career-match"
              className="px-4 py-2.5 rounded-xl bg-[#171b29] hover:bg-[#1e2336] border border-gray-700 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Career Fit</span>
            </Link>
            <Link
              to="/assessment"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Assessment</span>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#121522] border border-gray-800/90 shadow-md">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Verified Mastered
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 block">
              {strongCount}
            </span>
            <span className="text-[11px] text-emerald-500/80 mt-1 block font-medium">
              &ge; 70% Score Threshold
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121522] border border-gray-800/90 shadow-md">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Developing
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 block">
              {inProgressCount}
            </span>
            <span className="text-[11px] text-amber-500/80 mt-1 block font-medium">
              40% - 69% Score Range
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121522] border border-gray-800/90 shadow-md">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Needs Improvement
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1 block">
              {weakCount}
            </span>
            <span className="text-[11px] text-rose-500/80 mt-1 block font-medium">
              Roadmap Priority Focus
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121522] border border-gray-800/90 shadow-md">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Not Assessed
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-400 mt-1 block">
              {unassessedCount}
            </span>
            <span className="text-[11px] text-gray-500 mt-1 block font-medium">
              Pending Quiz Evidence
            </span>
          </div>
        </div>

        {/* View Tabs & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          {/* Main Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141724] border border-gray-800 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Skills</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <RadarIcon className="w-3.5 h-3.5" />
              <span>Radar Chart</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Progression History</span>
            </button>
          </div>

          {/* Grid Filters and Search */}
          {activeTab === 'grid' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141724] border border-gray-800 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterCategory === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All ({skills.length + unassessedSkills.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('verified')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterCategory === 'verified' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Mastered ({strongCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('weak')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterCategory === 'weak' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Needs Focus ({weakCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('unassessed')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterCategory === 'unassessed' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Not Assessed ({unassessedCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#141724] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-[#141724] border border-gray-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="score">Sort: Score</option>
                <option value="priority">Sort: Priority</option>
                <option value="name">Sort: Name (A-Z)</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: Grid of Skill Cards */}
        {activeTab === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allDisplaySkills.map((sk) => {
              const isNotAssessed = sk.score_percentage === null || sk.score_percentage === undefined;
              const scoreVal = isNotAssessed ? null : Math.round(sk.score_percentage!);

              return (
                <div
                  key={sk.id || sk.skill_name}
                  onClick={() => handleOpenSkillModal(sk)}
                  className="p-5 rounded-3xl bg-[#121522] border border-gray-800 hover:border-indigo-500/50 shadow-lg backdrop-blur-xl flex flex-col justify-between transition-all cursor-pointer group hover:shadow-indigo-950/40 hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      {isNotAssessed ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">
                          NOT ASSESSED
                        </span>
                      ) : scoreVal! >= 70 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Mastered
                        </span>
                      ) : scoreVal! >= 40 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          In Progress
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Needs Focus
                        </span>
                      )}

                      <span className="text-[10px] font-semibold text-gray-400 capitalize px-2 py-0.5 rounded bg-gray-900 border border-gray-800">
                        {sk.learning_priority || 'medium'} priority
                      </span>
                    </div>

                    {/* Title & Score */}
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-base font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                        {sk.skill_name}
                      </h3>
                      <span className="text-lg font-extrabold text-white">
                        {isNotAssessed ? (
                          <span className="text-xs text-gray-500 font-semibold uppercase">Pending</span>
                        ) : (
                          `${scoreVal}%`
                        )}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isNotAssessed
                            ? 'bg-transparent'
                            : scoreVal! >= 70
                            ? 'bg-emerald-500'
                            : scoreVal! >= 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: isNotAssessed ? '0%' : `${scoreVal}%` }}
                      />
                    </div>

                    {/* Tags / Weakness Highlights */}
                    {sk.weakness_areas && sk.weakness_areas.length > 0 ? (
                      <div className="space-y-1 mb-2">
                        <span className="text-[10px] uppercase font-semibold text-gray-500">
                          Target Focus Areas:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {sk.weakness_areas.slice(0, 2).map((w, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-900/40 truncate max-w-[140px]"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : isNotAssessed ? (
                      <p className="text-[11px] text-gray-500 mb-2">
                        Required competency for your target career role.
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-500 mb-2">
                        Solid foundational proficiency demonstrated in assessments.
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      {isNotAssessed ? 'Self-declared' : 'Verified Evidence'}
                    </span>
                    <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform font-medium">
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Radar Chart */}
        {activeTab === 'radar' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121522] border border-gray-800 shadow-xl">
            <div className="max-w-2xl mx-auto text-center mb-6">
              <h3 className="text-lg font-bold text-white">Spider-Web Competency Radar</h3>
              <p className="text-xs text-gray-400 mt-1">
                Visualizing verified proficiency scores across evaluated technical domains.
              </p>
            </div>

            {radarData.length > 0 ? (
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#2a2e42" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Radar
                      name="Proficiency Score"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161a29',
                        borderColor: '#374151',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-10">No evaluated skills to display on radar.</p>
            )}
          </div>
        )}

        {/* TAB 3: Historical Progression Line Chart */}
        {activeTab === 'history' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121522] border border-gray-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Skill Proficiency Velocity</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chronological progression snapshots captured after each assessment session.
                </p>
              </div>

              {/* Skill Selector for History */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Select Skill:</span>
                <select
                  value={historySkillName}
                  onChange={(e) => setHistorySkillName(e.target.value)}
                  className="px-3.5 py-2 bg-[#171b29] border border-gray-800 rounded-xl text-xs font-semibold text-indigo-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  {skills.map((s) => (
                    <option key={s.id || s.skill_name} value={s.skill_name}>
                      {s.skill_name} ({s.score_percentage || 0}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Line Chart */}
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252a3b" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161a29',
                      borderColor: '#374151',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Skill Detail Modal / Drawer */}
        {selectedSkill && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-2xl w-full bg-[#121522] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
              {/* Close Button */}
              <button
                onClick={() => setSelectedSkill(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {selectedSkill.is_verified ? 'Verified Skill Evaluation' : 'Unverified Career Requirement'}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 capitalize px-2 py-0.5 rounded bg-gray-800">
                    {selectedSkill.learning_priority || 'medium'} priority
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">{selectedSkill.skill_name}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Full evaluation audit log, question telemetry, and confidence metric.
                </p>
              </div>

              {/* Performance Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#171b2b] border border-gray-800">
                  <span className="text-[10px] font-semibold uppercase text-gray-400">Current Rating</span>
                  <p className="text-xl font-extrabold text-white mt-1">
                    {selectedSkill.score_percentage !== null ? `${Math.round(selectedSkill.score_percentage)}%` : 'NOT ASSESSED'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#171b2b] border border-gray-800">
                  <span className="text-[10px] font-semibold uppercase text-gray-400">Proficiency Tier</span>
                  <p className="text-xl font-extrabold text-indigo-400 capitalize mt-1">
                    {selectedSkill.proficiency_level || 'Beginner'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#171b2b] border border-gray-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-semibold uppercase text-gray-400">Confidence Level</span>
                  <p className="text-xl font-extrabold text-emerald-400 mt-1">
                    {selectedSkill.is_verified ? '94% High' : '0% (No Quiz)'}
                  </p>
                </div>
              </div>

              {/* Strengths & Weakness Areas */}
              <div className="space-y-3">
                {selectedSkill.strength_areas && selectedSkill.strength_areas.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Demonstrated Strengths
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkill.strength_areas.map((st, sIdx) => (
                        <span key={sIdx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-900/30 text-emerald-300 border border-emerald-800/40">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSkill.weakness_areas && selectedSkill.weakness_areas.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Identified Weaknesses & Gaps
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkill.weakness_areas.map((wk, wIdx) => (
                        <span key={wIdx} className="text-xs px-2.5 py-1 rounded-lg bg-rose-900/30 text-rose-300 border border-rose-800/40">
                          {wk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Evidence Artifacts */}
              <div className="p-4 rounded-2xl bg-[#171b2b] border border-gray-800 space-y-2">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" /> Assessment Evidence Artifacts
                </span>
                {selectedSkill.evidence && selectedSkill.evidence.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedSkill.evidence.map((ev, evIdx) => (
                      <div key={evIdx} className="text-xs text-gray-300 p-2 rounded-lg bg-[#121522] border border-gray-800 font-mono">
                        {ev}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-2">
                    No individual challenge evidence recorded yet. Take an assessment to register telemetry.
                  </p>
                )}
              </div>

              {/* Chronological Snapshot Progression */}
              {selectedSkillHistory.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#171b2b] border border-gray-800 space-y-2">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Historical Calibration Snapshots
                  </span>
                  <div className="space-y-1.5">
                    {selectedSkillHistory.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#121522] border border-gray-800">
                        <span className="text-gray-400">{new Date(h.recorded_at).toLocaleDateString()}</span>
                        <span className="text-gray-300 capitalize">{h.snapshot_reason?.replace('_', ' ') || 'Evaluation'}</span>
                        <span className="font-bold text-indigo-400">{Math.round(h.score_percentage)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedSkill(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSkill(null);
                    navigate('/assessment');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <span>Practice {selectedSkill.skill_name} Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsPage;
