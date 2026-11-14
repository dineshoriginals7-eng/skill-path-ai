import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Brain,
  Compass,
  Layers,
  ChevronRight,
} from 'lucide-react';
import api, { CareerRole } from '../../services/api';

export const CareerMatchPage: React.FC = () => {
  const navigate = useNavigate();

  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [readinessData, setReadinessData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load careers
  useEffect(() => {
    let isMounted = true;
    const fetchCareers = async () => {
      try {
        const roles = await api.getCareers();
        if (isMounted && roles && roles.length > 0) {
          setCareers(roles);
          setSelectedCareerId(roles[0].id);
        }
      } catch (err) {
        console.error('Failed to load careers:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchCareers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load readiness data whenever selectedCareerId changes
  useEffect(() => {
    let isMounted = true;
    const fetchReadiness = async () => {
      if (!selectedCareerId) return;
      try {
        const data = await api.getCareerReadiness(selectedCareerId);
        if (isMounted) setReadinessData(data);
      } catch (err) {
        console.error('Failed to load career readiness:', err);
      }
    };
    fetchReadiness();
    return () => {
      isMounted = false;
    };
  }, [selectedCareerId]);

  const selectedCareer = careers.find((c) => c.id === selectedCareerId);
  const isDiagnosticPending = Boolean(readinessData?.is_diagnostic_pending);
  const score = isDiagnosticPending ? 0 : Math.round(readinessData?.readiness_score ?? 0);

  const getScoreColor = (val: number, pending: boolean) => {
    if (pending) return { stroke: '#4b5563', text: 'text-gray-400', label: 'Diagnostic Pending' };
    if (val >= 70) return { stroke: '#10b981', text: 'text-emerald-400', label: 'Strong Fit / Ready' };
    if (val >= 40) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'Developing Alignment' };
    return { stroke: '#ef4444', text: 'text-rose-400', label: 'Foundational Gap' };
  };

  const scoreTheme = getScoreColor(score, isDiagnosticPending);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = isDiagnosticPending
    ? circumference
    : circumference - (score / 100) * circumference;

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    try {
      await api.generateRoadmap(selectedCareerId);
      toast.success(`Generated personalized roadmap for ${selectedCareer?.name || 'this track'}!`);
      navigate('/roadmap');
    } catch {
      navigate('/roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0d13] text-gray-100 p-6 sm:p-10 font-sans space-y-6 animate-pulse">
        <div className="h-10 bg-gray-800/60 rounded-xl w-64" />
        <div className="h-64 bg-[#121522] rounded-3xl border border-gray-800" />
      </div>
    );
  }

  const verifiedCompetencies = readinessData?.verified_competencies || [];
  const inProgressCompetencies = readinessData?.in_progress_competencies || [];
  const unassessedCompetencies = readinessData?.unassessed_competencies || [];

  return (
    <div className="min-h-screen bg-[#0b0d13] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header & Career Selector Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Target className="w-3.5 h-3.5" /> Industry Competency Matrix
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Career Competency Matching
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Deterministic comparison of your verified evaluations against predefined industry role standards.
            </p>
          </div>

          {/* 10 Predefined Career Tracks Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedCareerId}
              onChange={(e) => setSelectedCareerId(e.target.value)}
              className="w-full sm:w-72 px-4 py-3 bg-[#171b29] border border-gray-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer shadow-lg"
            >
              {careers.map((career) => (
                <option key={career.id} value={career.id}>
                  {career.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Diagnostic Pending Alert Callout if learner has 0 assessments */}
        {isDiagnosticPending && (
          <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Evaluation-First Assessment Required
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                SkillPath AI does not fabricate career readiness scores. Because you have not completed your diagnostic assessment yet, your readiness for <strong>{selectedCareer?.name}</strong> is currently uncalibrated. Complete the initial diagnostic to calculate your true weighted score.
              </p>
              <Link
                to="/assessment"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold transition-all shadow-md"
              >
                <span>Take Initial Diagnostic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Readiness Score Section (Circular Gauge + Timeline) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#141829] via-[#121524] to-[#181930] border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Circular Readiness Gauge */}
            <div className="flex items-center gap-6">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="#1f2438"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke={scoreTheme.stroke}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className={`text-3xl font-extrabold ${scoreTheme.text}`}>
                    {isDiagnosticPending ? '--' : `${score}%`}
                  </span>
                  <span className="block text-[10px] text-gray-400 uppercase font-semibold mt-0.5">
                    {isDiagnosticPending ? 'Pending' : 'Readiness'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Target Role Readiness
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {selectedCareer?.name || 'Full Stack Developer'}
                </h2>
                <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-indigo-300">
                  {scoreTheme.label}
                </div>
                <p className="text-[11px] text-gray-400 mt-2 max-w-sm leading-relaxed">
                  Transparent weighted model comparing required competencies against your verified assessment evidence.
                </p>
              </div>
            </div>

            {/* Right: Estimated Timeline Card */}
            <div className="p-5 rounded-2xl bg-[#171b29]/90 border border-gray-800 text-center md:text-left shrink-0 w-full md:w-auto">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Estimated Study Workload
              </div>
              <p className="text-2xl font-extrabold text-white mt-1">
                {readinessData?.estimated_weeks_to_ready || 8} Weeks
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Calculated from {unassessedCompetencies.length} unassessed and {inProgressCompetencies.length} developing skills
              </p>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateRoadmap}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Synthesizing...' : 'Generate Roadmap For This Role'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Clear Competency Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: Verified Competencies (Mastered >= 70%) */}
          <div className="p-6 rounded-3xl bg-[#121522] border border-gray-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified Mastered
                </h3>
                <span className="text-xs text-emerald-400 font-semibold">
                  {verifiedCompetencies.length} Competencies
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {verifiedCompetencies.length > 0 ? (
                  verifiedCompetencies.map((sk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#171b29] border border-gray-800/80 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{sk.skill_name}</h4>
                        <p className="text-[10px] text-gray-400 capitalize">{sk.proficiency_level} Proficiency</p>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-400 font-mono">
                        {Math.round(sk.score_percentage)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">
                    No competencies verified above 70% threshold yet.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 text-[11px] text-gray-500">
              Verified through challenge assessments
            </div>
          </div>

          {/* Section 2: In-Progress Competencies (40% - 69%) */}
          <div className="p-6 rounded-3xl bg-[#121522] border border-gray-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> In Progress
                </h3>
                <span className="text-xs text-amber-400 font-semibold">
                  {inProgressCompetencies.length} Developing
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {inProgressCompetencies.length > 0 ? (
                  inProgressCompetencies.map((sk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#171b29] border border-gray-800/80 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{sk.skill_name}</h4>
                        <p className="text-[10px] text-gray-400 capitalize">{sk.proficiency_level} Proficiency</p>
                      </div>
                      <span className="text-xs font-extrabold text-amber-400 font-mono">
                        {Math.round(sk.score_percentage)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">
                    No intermediate competencies currently active.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 text-[11px] text-gray-500">
              Partial credit applied in readiness model
            </div>
          </div>

          {/* Section 3: Unassessed Competencies (Explicit NOT ASSESSED, Never 0%) */}
          <div className="p-6 rounded-3xl bg-[#121522] border border-gray-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-gray-400" /> Unassessed Skills
                </h3>
                <span className="text-xs text-gray-400 font-semibold">
                  {unassessedCompetencies.length} Missing
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {unassessedCompetencies.length > 0 ? (
                  unassessedCompetencies.map((sk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#171b29] border border-gray-800/80 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{sk.skill_name}</h4>
                        <p className="text-[10px] text-gray-500">Required for {selectedCareer?.name}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 uppercase tracking-wide">
                        NOT ASSESSED
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">
                    All required competencies for this career track have been evaluated!
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 text-[11px] text-gray-500">
              Assigned zero weight until evaluated
            </div>
          </div>
        </div>

        {/* Bottom Navigation CTA */}
        <div className="p-6 rounded-3xl bg-[#121522] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Ready to close these competency gaps?</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Launch targeted drills or explore personalized curriculum milestones.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/assessment"
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-colors"
            >
              Take Practice Drill
            </Link>
            <button
              onClick={handleGenerateRoadmap}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>View Aligned Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerMatchPage;
