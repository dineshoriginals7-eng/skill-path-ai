import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Brain,
  Code2,
  FileText,
  AlertCircle,
  RefreshCw,
  Compass,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface AnswerBreakdown {
  question_id: string;
  skill_name: string;
  question_type?: string;
  difficulty?: string;
  question_text: string;
  code_snippet?: string | null;
  options?: any[] | null;
  user_answer?: string | null;
  correct_answer?: string | null;
  is_correct?: boolean | null;
  score?: number;
  feedback?: string | null;
  explanation?: string | null;
  test_cases?: any[] | null;
  tags?: string[] | null;
}

interface SkillScore {
  skill_name: string;
  score_percentage: number;
  proficiency_level: string;
  strength_level: string;
  learning_priority: string;
}

interface AssessmentResultsData {
  assessment_id: string;
  title: string;
  type?: string;
  status: string;
  score_percentage: number;
  duration_minutes?: number;
  time_completed?: string;
  answers: AnswerBreakdown[];
  skill_scores: SkillScore[];
  ai_analysis?: {
    recommendations?: string[];
    next_steps?: string[];
    score_percentage?: number;
  };
}

export const AssessmentResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<AssessmentResultsData | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect'>('all');

  useEffect(() => {
    async function fetchResults() {
      if (!id) return;
      try {
        setLoading(true);
        const data: any = await api.getAssessmentResults(id);
        setResults(data);
        if (data && data.answers && data.answers.length > 0) {
          setExpandedQuestion(data.answers[0].question_id);
        }
      } catch (err) {
        console.error('Failed to load assessment results:', err);
        toast.error('Could not load detailed results for this assessment.');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-gray-300">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white">Synthesizing Pedagogical Analysis...</h3>
        <p className="text-xs text-gray-400 mt-1">Calibrating knowledge frontiers and competency scores</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">No Assessment Records Found</h2>
        <p className="text-sm text-gray-400 max-w-md mb-6">
          We could not locate evaluation data for this session. It may have been completed earlier or cancelled.
        </p>
        <Link
          to="/assessment"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Launch New Assessment</span>
        </Link>
      </div>
    );
  }

  const scorePct = Math.round(results.score_percentage || 0);
  const totalQuestions = results.answers?.length || 0;
  const correctCount = results.answers?.filter((a) => a.is_correct === true).length || 0;
  const incorrectCount = totalQuestions - correctCount;

  const filteredAnswers = (results.answers || []).filter((ans) => {
    if (filterType === 'correct') return ans.is_correct === true;
    if (filterType === 'incorrect') return ans.is_correct === false;
    return true;
  });

  const modeBadge = () => {
    const t = (results.type || 'diagnostic').toLowerCase();
    if (t === 'practice') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Practice Drill (Baseline Preserved)
        </span>
      );
    }
    if (t === 'mastery') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" /> Mastery Test-Out (Verified Advancement)
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" /> Diagnostic Baseline Evaluation
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 50) return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-gray-100 p-4 sm:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-[#121522] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {modeBadge()}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {results.duration_minutes || 12} mins duration
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {results.title}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Deterministic evaluation completed on {results.time_completed ? new Date(results.time_completed).toLocaleDateString() : 'Today'}. Every score is grounded in reproducible test evidence.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/skills"
                className="px-4 py-2.5 rounded-xl bg-[#1a1f30] hover:bg-[#222940] border border-gray-700 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>View Skill Radar</span>
              </Link>
              <Link
                to="/roadmap"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Open Learning Roadmap</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-800/80">
            <div className="bg-[#171b2b] p-4 rounded-2xl border border-gray-800/90">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Overall Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl sm:text-3xl font-black ${scorePct >= 70 ? 'text-emerald-400' : scorePct >= 50 ? 'text-indigo-400' : 'text-rose-400'}`}>
                  {scorePct}%
                </span>
                <span className="text-xs text-gray-500">
                  {scorePct >= 75 ? 'Mastered' : scorePct >= 50 ? 'Developing' : 'Needs Work'}
                </span>
              </div>
            </div>

            <div className="bg-[#171b2b] p-4 rounded-2xl border border-gray-800/90">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Correct Answers</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">{correctCount}</span>
                <span className="text-xs text-gray-500">of {totalQuestions} questions</span>
              </div>
            </div>

            <div className="bg-[#171b2b] p-4 rounded-2xl border border-gray-800/90">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Incorrect / Gaps</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-400">{incorrectCount}</span>
                <span className="text-xs text-gray-500">target concepts</span>
              </div>
            </div>

            <div className="bg-[#171b2b] p-4 rounded-2xl border border-gray-800/90">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Accuracy Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-indigo-400">
                  {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}%
                </span>
                <span className="text-xs text-gray-500">objective accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Assessed Skills & Proficiency Calibrations */}
        {results.skill_scores && results.skill_scores.length > 0 && (
          <div className="bg-[#121522] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  Calibrated Skill Competencies
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Performance on this assessment has updated your verified knowledge profile.
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-300 px-3 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                {results.skill_scores.length} Competencies Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.skill_scores.map((skill) => {
                const sPct = Math.round(skill.score_percentage);
                return (
                  <div
                    key={skill.skill_name}
                    className="p-4 rounded-2xl bg-[#171b2b] border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{skill.skill_name}</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getScoreColor(sPct)}`}
                        >
                          {sPct}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                          {skill.proficiency_level}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                            skill.strength_level === 'strong'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : skill.strength_level === 'weak'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                              : 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/40'
                          }`}
                        >
                          {skill.strength_level}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Priority:</span>
                      <span className={`font-semibold capitalize ${skill.learning_priority === 'critical' ? 'text-rose-400' : 'text-gray-300'}`}>
                        {skill.learning_priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Question by Question Pedagogical Breakdown */}
        <div className="bg-[#121522] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Question-by-Question Breakdown
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Inspect question prompts, code implementations, test results, and pedagogical explanations.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#171b2b] border border-gray-800">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                All ({totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('correct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'correct' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Correct ({correctCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('incorrect')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'incorrect' ? 'bg-rose-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Incorrect ({incorrectCount})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAnswers.map((ans, idx) => {
              const isExpanded = expandedQuestion === ans.question_id;
              const isCorrect = ans.is_correct === true;

              return (
                <div
                  key={ans.question_id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isCorrect
                      ? 'bg-[#151928]/80 border-gray-800 hover:border-emerald-500/40'
                      : 'bg-[#1a1622]/80 border-rose-900/40 hover:border-rose-500/50'
                  }`}
                >
                  {/* Question Summary Bar */}
                  <div
                    onClick={() => setExpandedQuestion(isExpanded ? null : ans.question_id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                            Q{idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/40 text-indigo-300">
                            {ans.skill_name}
                          </span>
                          {ans.question_type && (
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-800/80 text-gray-400">
                              {ans.question_type.replace('_', ' ')}
                            </span>
                          )}
                          {ans.difficulty && (
                            <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-gray-800/80 text-gray-400">
                              {ans.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {ans.question_text}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          isCorrect ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {isCorrect ? '+1.0 pt' : '0.0 pt'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-gray-800/80 space-y-4 animate-fade-in text-xs">
                      {/* Full Question Text */}
                      <div className="p-3.5 rounded-xl bg-[#0e111a] border border-gray-800 text-gray-200">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                          Problem Statement:
                        </span>
                        <p className="leading-relaxed whitespace-pre-wrap">{ans.question_text}</p>
                      </div>

                      {/* Code Snippet if present */}
                      {ans.code_snippet && (
                        <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#090b10]">
                          <div className="px-3.5 py-1.5 bg-[#131622] border-b border-gray-800 text-[10px] text-gray-400 flex items-center gap-1.5 font-mono">
                            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Code Snippet Reference</span>
                          </div>
                          <pre className="p-3.5 text-[11px] font-mono text-indigo-300 overflow-x-auto leading-relaxed">
                            {ans.code_snippet}
                          </pre>
                        </div>
                      )}

                      {/* Responses comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          className={`p-3.5 rounded-xl border ${
                            isCorrect
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                              : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-gray-400">
                            Your Submitted Answer:
                          </span>
                          <p className="font-mono text-xs break-words whitespace-pre-wrap">
                            {ans.user_answer || '(No answer provided)'}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 text-gray-200">
                          <span className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-emerald-400">
                            Canonical Correct Solution:
                          </span>
                          <p className="font-mono text-xs break-words whitespace-pre-wrap">
                            {ans.correct_answer || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Automated Test Cases Table if available */}
                      {ans.test_cases && ans.test_cases.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#0e111a] border border-gray-800">
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-2">
                            Automated Test Verification Matrix:
                          </span>
                          <div className="space-y-1.5">
                            {ans.test_cases.map((tc, tcIdx) => (
                              <div
                                key={tcIdx}
                                className="flex items-center justify-between p-2 rounded-lg bg-[#141824] border border-gray-800 text-[11px]"
                              >
                                <div>
                                  <span className="text-gray-400">{tc.description || `Test ${tcIdx + 1}`}: </span>
                                  <code className="text-indigo-300 font-mono text-[10px] ml-1">{tc.input}</code>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-[10px]">Expected:</span>
                                  <code className="text-emerald-400 font-mono text-[10px]">{tc.expected}</code>
                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                      isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                    }`}
                                  >
                                    {isCorrect ? 'PASSED' : 'CHECK'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Explanation & Pedagogical Feedback */}
                      {(ans.explanation || ans.feedback) && (
                        <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 text-indigo-200">
                          <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold block mb-1">
                            Pedagogical Analysis & Deep Dive:
                          </span>
                          <p className="leading-relaxed">
                            {ans.feedback || ans.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Actionable AI Recommendations */}
        {results.ai_analysis && results.ai_analysis.recommendations && (
          <div className="bg-[#121522] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Priority Recommendations & Next Steps
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Synthesized from your response patterns and mistake analysis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#171b2b] border border-gray-800/90 space-y-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  Actionable Next Steps
                </span>
                <ul className="space-y-2 text-xs text-gray-300">
                  {(results.ai_analysis.next_steps || [
                    'Review your question breakdown above to diagnose incorrect edge cases',
                    'Open your roadmap module to target highlighted skill gaps',
                    'Revisit career match to inspect your updated readiness score',
                  ]).map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#171b2b] border border-gray-800/90 space-y-3">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block">
                  Curated Guidance
                </span>
                <ul className="space-y-2 text-xs text-gray-300">
                  {results.ai_analysis.recommendations.map((rec, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-gray-400">
                Ready to bridge these knowledge gaps? Explore your personalized learning modules.
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/assessment"
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
                >
                  Take Another Assessment
                </Link>
                <Link
                  to="/roadmap"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <span>Go to My Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentResultsPage;
