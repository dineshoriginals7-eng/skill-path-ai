import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  Zap,
  ArrowRight,
  Flame,
  BarChart3,
  BookOpen,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import api from '../../services/api';

type TimeRange = '7d' | '30d' | '3m' | 'all';

// Paced data variants for time ranges
const VELOCITY_DATA: Record<TimeRange, Array<{ date: string; score: number; benchmark: number }>> = {
  '7d': [
    { date: 'Mon', score: 72.5, benchmark: 75 },
    { date: 'Tue', score: 74.0, benchmark: 75 },
    { date: 'Wed', score: 76.5, benchmark: 75 },
    { date: 'Thu', score: 79.0, benchmark: 75 },
    { date: 'Fri', score: 81.0, benchmark: 75 },
    { date: 'Sat', score: 84.5, benchmark: 75 },
    { date: 'Sun', score: 86.0, benchmark: 75 },
  ],
  '30d': [
    { date: 'Week 1', score: 70.0, benchmark: 75 },
    { date: 'Week 2', score: 73.5, benchmark: 75 },
    { date: 'Week 3', score: 78.0, benchmark: 75 },
    { date: 'Week 4', score: 84.0, benchmark: 75 },
  ],
  '3m': [
    { date: 'Month 1', score: 62.0, benchmark: 75 },
    { date: 'Month 2', score: 74.5, benchmark: 75 },
    { date: 'Month 3', score: 84.0, benchmark: 75 },
  ],
  'all': [
    { date: 'Diagnostic', score: 72.5, benchmark: 75 },
    { date: 'Module 1 Quiz', score: 76.0, benchmark: 75 },
    { date: 'Practice Drills', score: 81.0, benchmark: 75 },
    { date: 'Midterm Check', score: 84.0, benchmark: 75 },
    { date: 'Mastery Exam', score: 88.5, benchmark: 75 },
  ],
};

const STUDY_HOURS_DATA: Record<TimeRange, Array<{ day: string; hours: number; target: number }>> = {
  '7d': [
    { day: 'Mon', hours: 2.5, target: 2.0 },
    { day: 'Tue', hours: 3.2, target: 2.0 },
    { day: 'Wed', hours: 1.8, target: 2.0 },
    { day: 'Thu', hours: 2.4, target: 2.0 },
    { day: 'Fri', hours: 3.5, target: 2.0 },
    { day: 'Sat', hours: 4.2, target: 2.5 },
    { day: 'Sun', hours: 1.9, target: 2.0 },
  ],
  '30d': [
    { day: 'W1', hours: 16.5, target: 14.0 },
    { day: 'W2', hours: 18.2, target: 14.0 },
    { day: 'W3', hours: 15.8, target: 14.0 },
    { day: 'W4', hours: 19.5, target: 14.0 },
  ],
  '3m': [
    { day: 'Month 1', hours: 64.0, target: 55.0 },
    { day: 'Month 2', hours: 72.5, target: 55.0 },
    { day: 'Month 3', hours: 81.0, target: 55.0 },
  ],
  'all': [
    { day: 'Sprint 1', hours: 42.0, target: 40.0 },
    { day: 'Sprint 2', hours: 55.0, target: 40.0 },
    { day: 'Sprint 3', hours: 68.0, target: 40.0 },
    { day: 'Sprint 4', hours: 79.5, target: 40.0 },
  ],
};

const SKILL_RADAR_DATA = [
  { skill: 'Python', actual: 84, target: 80 },
  { skill: 'HTML', actual: 90, target: 75 },
  { skill: 'CSS', actual: 82, target: 75 },
  { skill: 'Git', actual: 80, target: 70 },
  { skill: 'React', actual: 74, target: 80 },
  { skill: 'SQL', actual: 42, target: 75 },
];

export const ProgressPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unified = await api.getUnifiedIntelligence();
        setProfileData(unified);
      } catch (err) {
        console.error('Failed to load progress telemetry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = profileData?.stats || {
    career_readiness_score: 39.3,
    career_readiness_label: 'Novice / Early Stage',
    roadmap_progress: 33.3,
    modules_completed: 1,
    total_modules: 3,
    estimated_weeks_to_ready: 12,
  };

  const currentVelocity = VELOCITY_DATA[timeRange];
  const currentHours = STUDY_HOURS_DATA[timeRange];

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16 font-sans animate-fade-in text-gray-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white tracking-tight">
                Learning Velocity & Progress Telemetry
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Data-driven tracking of score calibrations, study consistency, and competency growth
              </p>
            </div>
          </div>
        </div>

        {/* Time Range Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121522] border border-gray-800 self-start sm:self-auto">
          {(['7d', '30d', '3m', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Study Streak */}
        <div className="bg-[#121522] border border-gray-800/90 rounded-2xl p-4.5 shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-white flex items-center gap-1">
              14 <span className="text-xs font-medium text-amber-400">Days</span>
            </div>
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Active Learning Streak</div>
          </div>
        </div>

        {/* Study Hours */}
        <div className="bg-[#121522] border border-gray-800/90 rounded-2xl p-4.5 shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-white flex items-center gap-1">
              19.5 <span className="text-xs font-medium text-indigo-400">Hrs</span>
            </div>
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Weekly Active Time</div>
          </div>
        </div>

        {/* Score Velocity */}
        <div className="bg-[#121522] border border-gray-800/90 rounded-2xl p-4.5 shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-emerald-400 flex items-center gap-1">
              +14.2%
            </div>
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Score Calibration Delta</div>
          </div>
        </div>

        {/* Career Readiness */}
        <div className="bg-[#121522] border border-gray-800/90 rounded-2xl p-4.5 shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-white">
              {stats.career_readiness_score}%
            </div>
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide truncate max-w-[130px]">
              {stats.career_readiness_label}
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Assessment Score Progression Velocity */}
        <div className="bg-[#121522] border border-gray-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Assessment Score Velocity
              </h2>
              <p className="text-xs text-gray-400">Score improvement trajectory across verified evaluations</p>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              Steady Gain
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreVelocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2438" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161a2b',
                    borderColor: '#2a314d',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Proficiency Score']}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreVelocityGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Learner Performance
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-emerald-500 inline-block" /> Job Readiness Target (75%)
              </span>
            </div>
            <Link to="/assessment" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>Take Quiz</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* CHART 2: Study Consistency & Daily Hours Logged */}
        <div className="bg-[#121522] border border-gray-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                Study Consistency & Logged Hours
              </h2>
              <p className="text-xs text-gray-400">Time invested in practical coding exercises and modules</p>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
              Above Target
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2438" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161a2b',
                    borderColor: '#2a314d',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${val} hrs`, 'Logged Time']}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
            <span>Average: ~2.8 hrs/day across active study sessions</span>
            <Link to="/roadmap" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>Resume Module</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* CHART 3: Competency Balance Radar Matrix */}
        <div className="bg-[#121522] border border-gray-800/90 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Competency Radar Calibration
              </h2>
              <p className="text-xs text-gray-400">Demonstrated proficiency vs track requirements</p>
            </div>
            <Link to="/skills" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span>Skill Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={SKILL_RADAR_DATA}>
                <PolarGrid stroke="#23293f" />
                <PolarAngleAxis dataKey="skill" stroke="#9ca3af" fontSize={11} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#4b5563" fontSize={10} />
                <Radar name="Evaluated Score" dataKey="actual" stroke="#818cf8" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Target Requirement" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161a2b',
                    borderColor: '#2a314d',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-[11px] text-gray-400 pt-2 border-t border-gray-800/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Evaluated Skill Level
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Required Minimum
            </span>
          </div>
        </div>

        {/* SECTION 4: Roadmap Milestone Velocity & Sprint Stepper */}
        <div className="bg-[#121522] border border-gray-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Roadmap Milestone Velocity
                </h2>
                <p className="text-xs text-gray-400">Paced completion of verified learning modules</p>
              </div>
              <span className="text-xs font-bold text-indigo-400">
                {stats.modules_completed} of {stats.total_modules} Modules
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#171b29] h-2.5 rounded-full overflow-hidden border border-gray-800 mb-5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.roadmap_progress}%` }}
              />
            </div>

            {/* Module Stepper list */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#0e111a] border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Module 1: Modern Component Architecture</h4>
                    <span className="text-[10px] text-gray-400">Verified by Diagnostic (88.5%)</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                  Completed
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0e111a] border border-indigo-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Module 2: Applied Architecture & Persistence</h4>
                    <span className="text-[10px] text-gray-400">In Progress &bull; Estimated: ~24 hours</span>
                  </div>
                </div>
                <Link
                  to="/roadmap"
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                >
                  Continue
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-[#0e111a] border border-gray-800 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-300">Module 3: Production Deployment & Telemetry</h4>
                    <span className="text-[10px] text-gray-500">Locked &bull; Requires Module 2 completion</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-semibold">
                  Locked
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/80 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Estimated runway to complete: ~{stats.estimated_weeks_to_ready} weeks</span>
            <Link to="/career-match" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>Career Readiness</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
