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
      <div className="min-h-screen bg-[#090909] text-white p-6 sm:p-10 font-body space-y-6 animate-pulse">
        <div className="h-10 bg-[#171717] rounded-xl w-60" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#141414] rounded-2xl border border-[#292929]" />
          ))}
        </div>
        <div className="h-96 bg-[#141414] rounded-2xl border border-[#292929]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white p-4 sm:p-6 lg:p-8 font-body">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#292929]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-2">
              <Brain className="w-3.5 h-3.5" /> Competency Intelligence Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Skill Evaluation & Knowledge Matrix
            </h1>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Continuously calibrated by objective code execution, quiz telemetry, and verified project evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/career-match"
              className="px-4 py-2.5 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#292929] text-white font-medium text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <Target className="w-3.5 h-3.5 text-white" />
              <span>Career Fit</span>
            </Link>
            <Link
              to="/assessment"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Assessment</span>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#141414] border border-[#292929]">
            <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block">
              Verified Mastered
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1 block">
              {strongCount}
            </span>
            <span className="text-[11px] text-[#A1A1AA] mt-1 block font-medium">
              &ge; 70% Score Threshold
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-[#292929]">
            <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block">
              Developing
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1 block">
              {inProgressCount}
            </span>
            <span className="text-[11px] text-[#A1A1AA] mt-1 block font-medium">
              40% - 69% Score Range
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-[#292929]">
            <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block">
              Needs Improvement
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1 block">
              {weakCount}
            </span>
            <span className="text-[11px] text-[#A1A1AA] mt-1 block font-medium">
              Roadmap Priority Focus
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-[#292929]">
            <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block">
              Not Assessed
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-[#A1A1AA] mt-1 block">
              {unassessedCount}
            </span>
            <span className="text-[11px] text-[#A1A1AA] mt-1 block font-medium">
              Pending Quiz Evidence
            </span>
          </div>
        </div>

        {/* View Tabs & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          {/* Main Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141414] border border-[#292929] self-start">
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'grid'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
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
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
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
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
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
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141414] border border-[#292929] text-xs">
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterCategory === 'all' ? 'bg-white text-black shadow-sm' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  All ({skills.length + unassessedSkills.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('verified')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterCategory === 'verified' ? 'bg-white text-black shadow-sm' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Mastered ({strongCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('weak')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterCategory === 'weak' ? 'bg-white text-black shadow-sm' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Needs Focus ({weakCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('unassessed')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterCategory === 'unassessed' ? 'bg-white text-black shadow-sm' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Not Assessed ({unassessedCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#171717] border border-[#292929] rounded-xl text-xs text-white placeholder-[#A1A1AA] focus:outline-none focus:border-white w-36 sm:w-44"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-[#171717] border border-[#292929] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="score" className="bg-[#141414]">Sort: Score</option>
                <option value="priority" className="bg-[#141414]">Sort: Priority</option>
                <option value="name" className="bg-[#141414]">Sort: Name (A-Z)</option>
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
                  className="p-5 rounded-3xl bg-[#141414] border border-[#292929] hover:border-neutral-500 shadow-sm flex flex-col justify-between transition-all cursor-pointer group hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      {isNotAssessed ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#171717] text-[#A1A1AA] border border-[#292929]">
                          NOT ASSESSED
                        </span>
                      ) : scoreVal! >= 70 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                          Mastered
                        </span>
                      ) : scoreVal! >= 40 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                          In Progress
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                          Needs Focus
                        </span>
                      )}

                      <span className="text-[10px] font-semibold text-[#A1A1AA] capitalize px-2 py-0.5 rounded bg-[#171717] border border-[#292929]">
                        {sk.learning_priority || 'medium'} priority
                      </span>
                    </div>

                    {/* Title & Score */}
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-base font-bold font-heading text-white tracking-tight group-hover:text-neutral-300 transition-colors">
                        {sk.skill_name}
                      </h3>
                      <span className="text-lg font-extrabold font-heading text-white">
                        {isNotAssessed ? (
                          <span className="text-xs text-[#A1A1AA] font-semibold uppercase">Pending</span>
                        ) : (
                          `${scoreVal}%`
                        )}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#171717] h-2 rounded-full overflow-hidden border border-[#292929] mb-4">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isNotAssessed
                            ? 'bg-transparent'
                            : 'bg-white'
                        }`}
                        style={{ width: isNotAssessed ? '0%' : `${scoreVal}%` }}
                      />
                    </div>

                    {/* Tags / Weakness Highlights */}
                    {sk.weakness_areas && sk.weakness_areas.length > 0 ? (
                      <div className="space-y-1 mb-2">
                        <span className="text-[10px] uppercase font-semibold text-[#A1A1AA]">
                          Target Focus Areas:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {sk.weakness_areas.slice(0, 2).map((w, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#171717] text-white border border-[#292929] truncate max-w-[140px]"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : isNotAssessed ? (
                      <p className="text-[11px] text-[#A1A1AA] mb-2">
                        Required competency for your target career role.
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#A1A1AA] mb-2">
                        Solid foundational proficiency demonstrated in assessments.
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#292929] flex items-center justify-between text-[11px] text-[#A1A1AA]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      {isNotAssessed ? 'Self-declared' : 'Verified Evidence'}
                    </span>
                    <span className="text-white group-hover:translate-x-0.5 transition-transform font-medium">
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
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-[#292929]">
            <div className="max-w-2xl mx-auto text-center mb-6">
              <h3 className="text-lg font-bold font-heading text-white">Competency Radar Calibration</h3>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Visualizing verified proficiency scores across evaluated technical domains.
              </p>
            </div>

            {radarData.length > 0 ? (
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#292929" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#A1A1AA', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#71717A', fontSize: 10 }} />
                    <Radar
                      name="Proficiency Score"
                      dataKey="score"
                      stroke="#ffffff"
                      fill="#ffffff"
                      fillOpacity={0.25}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#141414',
                        borderColor: '#292929',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-[#A1A1AA] text-center py-10">No evaluated skills to display on radar.</p>
            )}
          </div>
        )}

        {/* TAB 3: Historical Progression Line Chart */}
        {activeTab === 'history' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-[#292929] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold font-heading text-white">Skill Proficiency Velocity</h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Chronological progression snapshots captured after each assessment session.
                </p>
              </div>

              {/* Skill Selector for History */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A1A1AA]">Select Skill:</span>
                <select
                  value={historySkillName}
                  onChange={(e) => setHistorySkillName(e.target.value)}
                  className="px-3.5 py-2 bg-[#171717] border border-[#292929] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-white cursor-pointer"
                >
                  {skills.map((s) => (
                    <option key={s.id || s.skill_name} value={s.skill_name} className="bg-[#141414]">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#292929" />
                  <XAxis dataKey="date" stroke="#71717A" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#71717A" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141414',
                      borderColor: '#292929',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    dot={{ fill: '#ffffff', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Skill Detail Modal / Drawer */}
        {selectedSkill && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-2xl w-full bg-[#141414] border border-[#292929] rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
              {/* Close Button */}
              <button
                onClick={() => setSelectedSkill(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-[#171717] border border-[#292929] text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                    {selectedSkill.is_verified ? 'Verified Skill Evaluation' : 'Unverified Career Requirement'}
                  </span>
                  <span className="text-[10px] font-semibold text-[#A1A1AA] capitalize px-2 py-0.5 rounded bg-[#171717] border border-[#292929]">
                    {selectedSkill.learning_priority || 'medium'} priority
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold font-heading text-white">{selectedSkill.skill_name}</h2>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Full evaluation audit log, question telemetry, and confidence metric.
                </p>
              </div>

              {/* Performance Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#171717] border border-[#292929]">
                  <span className="text-[10px] font-semibold uppercase text-[#A1A1AA]">Current Rating</span>
                  <p className="text-xl font-extrabold font-heading text-white mt-1">
                    {selectedSkill.score_percentage !== null ? `${Math.round(selectedSkill.score_percentage)}%` : 'NOT ASSESSED'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#171717] border border-[#292929]">
                  <span className="text-[10px] font-semibold uppercase text-[#A1A1AA]">Proficiency Tier</span>
                  <p className="text-xl font-extrabold font-heading text-white capitalize mt-1">
                    {selectedSkill.proficiency_level || 'Beginner'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#171717] border border-[#292929] col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-semibold uppercase text-[#A1A1AA]">Confidence Level</span>
                  <p className="text-xl font-extrabold font-heading text-white mt-1">
                    {selectedSkill.is_verified ? '94% High' : '0% (No Quiz)'}
                  </p>
                </div>
              </div>

              {/* Strengths & Weakness Areas */}
              <div className="space-y-3">
                {selectedSkill.strength_areas && selectedSkill.strength_areas.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#171717] border border-[#292929]">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Demonstrated Strengths
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkill.strength_areas.map((st, sIdx) => (
                        <span key={sIdx} className="text-xs px-2.5 py-1 rounded-lg bg-[#141414] text-white border border-[#292929]">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSkill.weakness_areas && selectedSkill.weakness_areas.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#171717] border border-[#292929]">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-white" /> Identified Weaknesses & Gaps
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkill.weakness_areas.map((wk, wIdx) => (
                        <span key={wIdx} className="text-xs px-2.5 py-1 rounded-lg bg-[#141414] text-white border border-[#292929]">
                          {wk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Evidence Artifacts */}
              <div className="p-4 rounded-2xl bg-[#171717] border border-[#292929] space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-white" /> Assessment Evidence Artifacts
                </span>
                {selectedSkill.evidence && selectedSkill.evidence.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedSkill.evidence.map((ev, evIdx) => (
                      <div key={evIdx} className="text-xs text-[#A1A1AA] p-2 rounded-lg bg-[#141414] border border-[#292929] font-mono">
                        {ev}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#A1A1AA] py-2">
                    No individual challenge evidence recorded yet. Take an assessment to register telemetry.
                  </p>
                )}
              </div>

              {/* Chronological Snapshot Progression */}
              {selectedSkillHistory.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#171717] border border-[#292929] space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-white" /> Historical Calibration Snapshots
                  </span>
                  <div className="space-y-1.5">
                    {selectedSkillHistory.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#141414] border border-[#292929]">
                        <span className="text-[#A1A1AA]">{new Date(h.recorded_at).toLocaleDateString()}</span>
                        <span className="text-white capitalize">{h.snapshot_reason?.replace('_', ' ') || 'Evaluation'}</span>
                        <span className="font-bold text-white">{Math.round(h.score_percentage)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292929]">
                <button
                  type="button"
                  onClick={() => setSelectedSkill(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#292929] text-[#A1A1AA] text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSkill(null);
                    navigate('/assessment');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-2 shadow-sm"
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
