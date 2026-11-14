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
    if (pending) return { stroke: '#52525B', text: 'text-[#A1A1AA]', label: 'Diagnostic Pending' };
    if (val >= 70) return { stroke: '#FFFFFF', text: 'text-white', label: 'Strong Fit / Ready' };
    if (val >= 40) return { stroke: '#E4E4E7', text: 'text-white', label: 'Developing Alignment' };
    return { stroke: '#A1A1AA', text: 'text-[#A1A1AA]', label: 'Foundational Gap' };
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
      <div className="min-h-screen bg-[#090909] text-white p-6 sm:p-10 font-body space-y-6 animate-pulse">
        <div className="h-10 bg-[#171717] rounded-xl w-64" />
        <div className="h-64 bg-[#141414] rounded-3xl border border-[#292929]" />
      </div>
    );
  }

  const verifiedCompetencies = readinessData?.verified_competencies || [];
  const inProgressCompetencies = readinessData?.in_progress_competencies || [];
  const unassessedCompetencies = readinessData?.unassessed_competencies || [];

  return (
    <div className="min-h-screen bg-[#090909] text-white p-4 sm:p-6 lg:p-8 font-body">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header & Career Selector Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#292929]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-2">
              <Target className="w-3.5 h-3.5" /> Industry Competency Matrix
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Career Competency Matching
            </h1>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Deterministic comparison of your verified evaluations against predefined industry role standards.
            </p>
          </div>

          {/* 10 Predefined Career Tracks Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedCareerId}
              onChange={(e) => setSelectedCareerId(e.target.value)}
              className="w-full sm:w-72 px-4 py-3 bg-[#171717] border border-[#292929] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-white cursor-pointer shadow-sm"
            >
              {careers.map((career) => (
                <option key={career.id} value={career.id} className="bg-[#141414] text-white">
                  {career.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Diagnostic Pending Alert Callout if learner has 0 assessments */}
        {isDiagnosticPending && (
          <div className="p-5 rounded-2xl bg-[#141414] border border-[#292929] flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold font-heading text-white uppercase tracking-wider">
                Evaluation-First Assessment Required
              </h4>
              <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                SkillPath AI does not fabricate career readiness scores. Because you have not completed your diagnostic assessment yet, your readiness for <strong>{selectedCareer?.name}</strong> is currently uncalibrated. Complete the initial diagnostic to calculate your true weighted score.
              </p>
              <Link
                to="/assessment"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-sm"
              >
                <span>Take Initial Diagnostic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Readiness Score Section (Circular Gauge + Timeline) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-[#292929]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Circular Readiness Gauge */}
            <div className="flex items-center gap-6">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="#292929"
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
                  <span className={`text-3xl font-extrabold font-heading ${scoreTheme.text}`}>
                    {isDiagnosticPending ? '--' : `${score}%`}
                  </span>
                  <span className="block text-[10px] text-[#A1A1AA] uppercase font-semibold mt-0.5">
                    {isDiagnosticPending ? 'Pending' : 'Readiness'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Target Role Readiness
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
                  {selectedCareer?.name || 'Full Stack Developer'}
                </h2>
                <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#171717] border border-[#292929] text-white">
                  {scoreTheme.label}
                </div>
                <p className="text-[11px] text-[#A1A1AA] mt-2 max-w-sm leading-relaxed">
                  Transparent weighted model comparing required competencies against your verified assessment evidence.
                </p>
              </div>
            </div>

            {/* Right: Estimated Timeline Card */}
            <div className="p-5 rounded-2xl bg-[#171717] border border-[#292929] text-center md:text-left shrink-0 w-full md:w-auto">
              <div className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 text-white" /> Estimated Study Workload
              </div>
              <p className="text-2xl font-extrabold font-heading text-white mt-1">
                {readinessData?.estimated_weeks_to_ready || 8} Weeks
              </p>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Calculated from {unassessedCompetencies.length} unassessed and {inProgressCompetencies.length} developing skills
              </p>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateRoadmap}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="p-6 rounded-3xl bg-[#141414] border border-[#292929] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
                <h3 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" /> Verified Mastered
                </h3>
                <span className="text-xs text-white font-semibold">
                  {verifiedCompetencies.length} Competencies
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {verifiedCompetencies.length > 0 ? (
                  verifiedCompetencies.map((sk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{sk.skill_name}</h4>
                        <p className="text-[10px] text-[#A1A1AA] capitalize">{sk.proficiency_level} Proficiency</p>
                      </div>
                      <span className="text-xs font-extrabold text-white font-mono">
                        {Math.round(sk.score_percentage)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#A1A1AA] py-6 text-center">
                    No competencies verified above 70% threshold yet.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#292929] text-[11px] text-[#A1A1AA]">
              Verified through challenge assessments
            </div>
          </div>

          {/* Section 2: In-Progress Competencies (40% - 69%) */}
          <div className="p-6 rounded-3xl bg-[#141414] border border-[#292929] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
                <h3 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" /> In Progress
                </h3>
                <span className="text-xs text-[#A1A1AA] font-semibold">
                  {inProgressCompetencies.length} Developing
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {inProgressCompetencies.length > 0 ? (
                  inProgressCompetencies.map((sk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{sk.skill_name}</h4>
                        <p className="text-[10px] text-[#A1A1AA] capitalize">{sk.proficiency_level} Proficiency</p>
                      </div>
                      <span className="text-xs font-extrabold text-white font-mono">
                        {Math.round(sk.score_percentage)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#A1A1AA] py-6 text-center">
                    No intermediate competencies currently active.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#292929] text-[11px] text-[#A1A1AA]">
              Partial credit applied in readiness model
            </div>
          </div>

          {/* Section 3: Unassessed Competencies (Explicit NOT ASSESSED, Never 0%) */}
          <div className="p-6 rounded-3xl bg-[#141414] border border-[#292929] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
                <h3 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-white" /> Unassessed Skills
                </h3>
                <span className="text-xs text-[#A1A1AA] font-semibold">
                  {unassessedCompetencies.length} Missing
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {unassessedCompetencies.length > 0 ? (
                  unassessedCompetencies.map((sk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{sk.skill_name}</h4>
                        <p className="text-[10px] text-[#A1A1AA]">Required for {selectedCareer?.name}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#292929] text-[#A1A1AA] uppercase tracking-wide">
                        NOT ASSESSED
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#A1A1AA] py-6 text-center">
                    All required competencies for this career track have been evaluated!
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#292929] text-[11px] text-[#A1A1AA]">
              Assigned zero weight until evaluated
            </div>
          </div>
        </div>

        {/* Bottom Navigation CTA */}
        <div className="p-6 rounded-3xl bg-[#141414] border border-[#292929] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold font-heading text-white">Ready to close these competency gaps?</h4>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Launch targeted drills or explore personalized curriculum milestones.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/assessment"
              className="px-4 py-2.5 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#292929] text-white text-xs font-semibold transition-colors"
            >
              Take Practice Drill
            </Link>
            <button
              onClick={handleGenerateRoadmap}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
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
