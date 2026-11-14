import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  Target,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Lock,
  ChevronRight,
  Zap,
  Layers,
  BarChart2,
  GraduationCap,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isDemo } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      try {
        const data = await api.getDashboardData();
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getSkillColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) {
      return { bar: 'bg-gray-700', text: 'text-gray-400', badge: 'Not Assessed' };
    }
    if (score >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'Mastered' };
    if (score >= 40) return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'In Progress' };
    return { bar: 'bg-rose-500', text: 'text-rose-400', badge: 'Needs Work' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0d13] text-gray-100 p-6 sm:p-10 font-sans space-y-6 animate-pulse">
        <div className="h-10 bg-gray-800/50 rounded-xl w-64" />
        <div className="h-44 bg-[#121522]/80 rounded-2xl border border-gray-800/80" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-48 bg-[#121522]/80 rounded-2xl border border-gray-800/80" />
          <div className="h-48 bg-[#121522]/80 rounded-2xl border border-gray-800/80" />
          <div className="h-48 bg-[#121522]/80 rounded-2xl border border-gray-800/80" />
        </div>
      </div>
    );
  }

  const isDiagnosticPending = Boolean(dashboardData?.is_diagnostic_pending);
  const stats = dashboardData?.stats || {
    roadmap_progress: 0,
    skills_assessed: 0,
    assessments_completed: 0,
    readiness_score: 0,
    modules_completed: 0,
    total_modules: 0,
  };

  const careerAlignment = dashboardData?.career_alignment || {};
  const readinessScore = isDiagnosticPending ? 0 : Math.round(stats.readiness_score ?? 0);
  const readinessCircumference = 2 * Math.PI * 40;
  const readinessStrokeDashoffset =
    readinessCircumference - (readinessScore / 100) * readinessCircumference;

  const academic = dashboardData?.academic_metrics;

  return (
    <div className="min-h-screen bg-[#090909] text-white p-4 sm:p-6 lg:p-8 font-sans selection:bg-white selection:text-black">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="max-w-7xl mx-auto mb-6 p-3 sm:p-3.5 rounded-xl bg-[#141414] border border-[#292929] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="font-semibold text-white">Demonstration Profile Active</span>
            <span className="text-[#A1A1AA] hidden sm:inline">&bull; Calibrated multi-source learner intelligence telemetry</span>
          </div>
          <Link
            to="/assessment"
            className="text-white hover:underline font-medium flex items-center gap-1 group"
          >
            Launch Live Diagnostic <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ROW 1: Welcome Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#141414] border border-[#292929] p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] border border-[#292929] text-[#A1A1AA] text-xs font-mono font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5 text-white" /> Unified Learner Intelligence Cockpit
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-2">
                {getGreeting()}, {user?.full_name || 'Learner'}!
              </h1>
              <div className="flex items-center gap-2 text-sm text-[#A1A1AA] mt-1.5 flex-wrap">
                <span>Target Career Track:</span>
                <Link
                  to="/career-match"
                  className="text-white font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <span>{dashboardData?.primary_goal || 'Full Stack Developer'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                {academic && academic.gpa && (
                  <>
                    <span className="text-[#525252]">•</span>
                    <span className="text-xs text-[#A1A1AA] flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-white" />
                      Academic GPA: {academic.gpa} ({academic.verified_courses_count || 4} verified courses)
                    </span>
                  </>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 mt-5 pt-4 border-t border-[#292929]">
                <Link to="/roadmap" className="hover:opacity-80 transition-opacity">
                  <p className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-mono">Roadmap Progress</p>
                  <p className="text-xl font-heading font-extrabold text-white mt-0.5">{stats.roadmap_progress}%</p>
                </Link>
                <div className="h-8 w-px bg-[#292929] hidden sm:block" />
                <Link to="/skills" className="hover:opacity-80 transition-opacity">
                  <p className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-mono">Skills Evaluated</p>
                  <p className="text-xl font-heading font-extrabold text-white mt-0.5">
                    {stats.skills_assessed} {stats.skills_assessed === 1 ? 'Skill' : 'Skills'}
                  </p>
                </Link>
                <div className="h-8 w-px bg-[#292929] hidden sm:block" />
                <Link to="/assessment" className="hover:opacity-80 transition-opacity">
                  <p className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-mono">Assessments Completed</p>
                  <p className="text-xl font-heading font-extrabold text-white mt-0.5">{stats.assessments_completed}</p>
                </Link>
                <div className="h-8 w-px bg-[#292929] hidden sm:block" />
                <Link to="/career-match" className="hover:opacity-80 transition-opacity">
                  <p className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-mono">Career Readiness</p>
                  <p className={`text-xl font-heading font-extrabold mt-0.5 ${isDiagnosticPending ? 'text-amber-400 text-sm' : 'text-white'}`}>
                    {isDiagnosticPending ? 'Diagnostic Pending' : `${readinessScore}%`}
                  </p>
                </Link>
              </div>
            </div>

            {/* CTA Button */}
            <div className="shrink-0 w-full sm:w-auto">
              {!isDiagnosticPending ? (
                <button
                  type="button"
                  onClick={() => navigate('/roadmap')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2.5 group"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Continue Roadmap</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/assessment')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2.5 group"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Initial Diagnostic</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Diagnostic Pending Notification Banner */}
        {isDiagnosticPending && (
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#292929] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#292929] text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-heading font-bold text-white">Diagnostic Assessment Required</h3>
                <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
                  SkillPath AI follows an <strong>evaluation-first</strong> principle. We never recommend a fixed roadmap or fabricate skill proficiencies before assessing your baseline knowledge. Complete your initial diagnostic to unlock your personalized roadmap and career match analysis.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/assessment')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shrink-0 shadow-sm transition-all flex items-center gap-2"
            >
              <span>Take Diagnostic Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ROW 2: 3 Overview Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Career Readiness Gauge */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#292929] flex flex-col justify-between shadow-sm hover:border-neutral-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-[#A1A1AA] uppercase tracking-wider">
                Career Readiness
              </span>
              <Target className="w-4 h-4 text-white" />
            </div>

            <div className="flex items-center gap-5 my-4">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-[#202020]"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className={`${
                      isDiagnosticPending
                        ? 'text-[#525252]'
                        : 'text-white'
                    } transition-all duration-1000 ease-out`}
                    fill="transparent"
                    strokeDasharray={readinessCircumference}
                    strokeDashoffset={isDiagnosticPending ? readinessCircumference : readinessStrokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-heading font-extrabold text-white">
                    {isDiagnosticPending ? '--' : `${readinessScore}%`}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-heading font-bold text-white line-clamp-1">
                  {dashboardData?.primary_goal || 'Full Stack Developer'}
                </h4>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  {isDiagnosticPending
                    ? 'Pending diagnostic evaluation'
                    : `${careerAlignment.verified_competencies_count ?? 0} of ${careerAlignment.required_competencies_count ?? 8} competencies verified`}
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-[#171717] border border-[#292929] text-[#A1A1AA]">
                  {isDiagnosticPending ? 'Not Assessed' : careerAlignment.readiness_tier || 'Developing'}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/career-match')}
              className="w-full py-2 px-3 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#292929] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Inspect Gap Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Roadmap Milestones */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#292929] flex flex-col justify-between shadow-sm hover:border-neutral-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-[#A1A1AA] uppercase tracking-wider">
                Roadmap Milestones
              </span>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>

            <div className="my-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-heading font-extrabold text-white">
                  {stats.modules_completed}{' '}
                  <span className="text-sm text-[#71717A] font-normal">/ {stats.total_modules || 3} modules</span>
                </span>
                <span className="text-xs font-mono text-white">
                  {stats.roadmap_progress}% Finished
                </span>
              </div>
              <div className="w-full bg-[#171717] h-2 rounded-full overflow-hidden border border-[#292929]">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.roadmap_progress}%` }}
                />
              </div>
              <p className="text-xs text-[#A1A1AA] mt-3">
                {isDiagnosticPending
                  ? 'Complete diagnostic to generate tailored modules'
                  : `Estimated ${careerAlignment.estimated_study_weeks || 6} weeks to target readiness`}
              </p>
            </div>

            <button
              onClick={() => navigate('/roadmap')}
              className="w-full py-2 px-3 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#292929] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Open Learning Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: AI Priority Focus */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#292929] flex flex-col justify-between shadow-sm hover:border-neutral-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-white" /> Next Priority
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#171717] text-[#A1A1AA] font-mono border border-[#292929]">
                AI Guided
              </span>
            </div>

            <div className="my-4">
              <h4 className="text-sm font-heading font-bold text-white line-clamp-2">
                {dashboardData?.next_action?.title || 'Initial Diagnostic Assessment'}
              </h4>
              <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {dashboardData?.next_action?.estimated_time || '20 mins'}
                </span>
                <span>&bull;</span>
                <span>{dashboardData?.next_action?.type || 'Diagnostic'}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(dashboardData?.next_action?.target || '/assessment')}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{isDiagnosticPending ? 'Launch Diagnostic' : 'Resume Module'}</span>
            </button>
          </div>
        </div>

        {/* ROW 3: AI Insights & Assessed Competencies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* AI Insights Panel */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#292929] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-[#292929] text-white">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                    Learner Intelligence Insights
                  </h3>
                </div>
                <Link to="/insights" className="text-xs text-[#A1A1AA] hover:text-white font-medium">
                  All Insights &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {(dashboardData?.insights || []).slice(0, 3).map((ins: any, idx: number) => (
                  <div
                    key={ins.id || idx}
                    className="p-3.5 rounded-xl bg-[#171717] border border-[#292929] flex items-start gap-3 hover:border-neutral-500 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        ins.type === 'skill_strength' || ins.insight_type === 'skill_strength'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ins.type === 'skill_weakness' || ins.insight_type === 'skill_weakness'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-white/5 text-white border border-[#292929]'
                      }`}
                    >
                      {ins.type === 'skill_strength' || ins.insight_type === 'skill_strength' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : ins.type === 'skill_weakness' || ins.insight_type === 'skill_weakness' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-white">{ins.title}</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#141414] border border-[#292929] text-[#A1A1AA] capitalize font-mono">
                          {ins.category || ins.type || 'Telemetry'}
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">{ins.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#292929] flex items-center justify-between text-xs text-[#71717A]">
              <span>Multi-source cognitive telemetry</span>
              <Link to="/insights" className="text-xs text-white hover:underline">
                Explore 7 Insight Domains &rarr;
              </Link>
            </div>
          </div>

          {/* Skill Overview Panel */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#292929] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-[#292929] text-white">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                    Verified Competencies
                  </h3>
                </div>
                <Link to="/skills" className="text-xs text-[#A1A1AA] hover:text-white font-medium">
                  View Full Radar &rarr;
                </Link>
              </div>

              {isDiagnosticPending ? (
                <div className="p-8 text-center bg-[#171717] rounded-xl border border-[#292929]">
                  <Brain className="w-8 h-8 text-[#525252] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">No Verified Skills Yet</p>
                  <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs mx-auto">
                    Skills will be verified and calibrated after you complete your initial diagnostic assessment.
                  </p>
                  <Link
                    to="/assessment"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs text-white hover:underline font-semibold"
                  >
                    Start Diagnostic Assessment &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {(dashboardData?.top_skills || []).slice(0, 5).map((sk: any) => {
                    const style = getSkillColor(sk.score_percentage);
                    return (
                      <div key={sk.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-white">{sk.skill_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-white">
                              {sk.score_percentage}%
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#171717] border border-[#292929] text-[#A1A1AA] font-mono">
                              {style.badge}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-[#171717] h-1.5 rounded-full overflow-hidden border border-[#292929]">
                          <div
                            className="h-full rounded-full bg-white transition-all duration-500"
                            style={{ width: `${sk.score_percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#292929] flex items-center justify-between text-xs text-[#71717A]">
              <span>Verified through objective challenge testing</span>
              <Link to="/skills" className="text-xs text-white hover:underline">
                Inspect Skill Matrix &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 4: Recent Assessments, Roadmap Modules & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Col 1: Recent Assessments */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#292929] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-white" /> Assessment History
                </h3>
                <Link to="/assessment" className="text-xs text-[#A1A1AA] hover:text-white">
                  New Quiz
                </Link>
              </div>

              <div className="space-y-2.5">
                {(dashboardData?.recent_assessments || []).length > 0 ? (
                  (dashboardData.recent_assessments || []).map((item: any) => (
                    <Link
                      key={item.id}
                      to={`/assessment/${item.id}/results`}
                      className="p-3 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-between hover:border-neutral-500 transition-colors block"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-white truncate max-w-[160px]">{item.title}</h4>
                        <span className="text-[10px] text-[#A1A1AA] capitalize font-mono">{item.type || 'diagnostic'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#141414] border border-[#292929] text-white">
                          {Math.round(item.score_percentage ?? item.score ?? 0)}%
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-[#71717A] py-4 text-center">No completed assessments recorded.</p>
                )}
              </div>
            </div>

            <Link
              to="/assessment"
              className="pt-4 mt-4 border-t border-[#292929] text-xs text-[#A1A1AA] hover:text-white block text-center"
            >
              Take Practice or Mastery Assessment &rarr;
            </Link>
          </div>

          {/* Col 2: Active Modules */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#292929] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-white" /> Active Roadmap Modules
                </h3>
                <Link to="/roadmap" className="text-xs text-[#A1A1AA] hover:text-white">
                  Full Roadmap
                </Link>
              </div>

              <div className="space-y-2.5">
                {(dashboardData?.current_modules || []).slice(0, 3).map((mod: any) => (
                  <Link
                    key={mod.id}
                    to={`/roadmap/module/${mod.id}`}
                    className="p-3 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-between hover:border-neutral-500 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {mod.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : mod.status === 'available' || mod.status === 'in_progress' ? (
                        <PlayCircle className="w-4 h-4 text-white shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-[#525252] shrink-0" />
                      )}
                      <h4 className="text-xs font-medium text-white truncate max-w-[160px]">
                        {mod.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#A1A1AA] capitalize shrink-0 font-mono">{mod.difficulty || 'beginner'}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/roadmap"
              className="pt-4 mt-4 border-t border-[#292929] text-xs text-[#A1A1AA] hover:text-white block text-center"
            >
              View Full Module Curriculum &rarr;
            </Link>
          </div>

          {/* Col 3: AI Recommendations */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#292929] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-white" /> Recommended Actions
                </h3>
                <Link to="/mentor" className="text-xs text-[#A1A1AA] hover:text-white">
                  Ask Mentor
                </Link>
              </div>

              <div className="space-y-2.5">
                {(dashboardData?.recommendations || []).slice(0, 3).map((rec: any, idx: number) => (
                  <div
                    key={rec.id || idx}
                    className="p-3 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-between gap-2 hover:border-neutral-500 transition-all"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-medium text-white truncate">
                        {rec.title || rec.action_label || 'Strengthen Core Fundamentals'}
                      </h4>
                      <p className="text-[10px] text-[#A1A1AA] truncate">
                        {rec.reason || rec.description || 'Target identified concept gap'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(rec.action_target || '/assessment')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-200 text-black text-[11px] font-semibold transition-colors shrink-0 shadow-sm"
                    >
                      {rec.action_label || 'Practice'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/mentor"
              className="pt-4 mt-4 border-t border-[#292929] text-xs text-[#A1A1AA] hover:text-white block text-center"
            >
              Consult AI Career Mentor &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
