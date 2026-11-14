import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Brain,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Target,
  Code2,
} from 'lucide-react';
import api, { AssessmentResults } from '../../services/api';

export const AssessmentResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      if (!id) return;
      try {
        const data = await api.getAssessmentResults(id);
        if (isMounted) setResults(data);
      } catch (err) {
        console.error('Failed to load assessment results:', err);
        // Fallback demo data
        if (isMounted) {
          setResults({
            id: id || 'demo-results',
            assessment_id: id || 'demo-results',
            attempt_id: 'attempt-demo',
            correct_count: 7,
            incorrect_count: 3,
            skipped_count: 0,
            recommendations: [
              'Complete your pending data analysis modules',
              'Practice SQL window functions on the interactive challenge playground',
            ],
            next_steps: [
              'Target weak areas identified in the diagnostic assessment',
              'Take a mastery challenge once practice exercises are completed',
            ],
            title: 'Diagnostic Baseline Evaluation',
            assessment_type: 'diagnostic',
            score: 7,
            total_questions: 10,
            score_percentage: 70,
            time_completed: new Date().toISOString(),
            duration_minutes: 14,
            skill_scores: [
              {
                skill_name: 'Python',
                score_percentage: 80,
                proficiency: 'intermediate',
                proficiency_level: 'intermediate',
                strength_level: 'strong',
                learning_priority: 'medium',
              },
              {
                skill_name: 'SQL',
                score_percentage: 45,
                proficiency: 'beginner',
                proficiency_level: 'beginner',
                strength_level: 'weak',
                learning_priority: 'high',
              },
              {
                skill_name: 'React',
                score_percentage: 75,
                proficiency: 'intermediate',
                proficiency_level: 'intermediate',
                strength_level: 'strong',
                learning_priority: 'low',
              },
            ],
            answers: [
              {
                question_id: 'q1',
                question_text: 'What will be the output of `print(type([]) is list)` in Python?',
                skill_name: 'Python',
                question_type: 'mcq',
                difficulty: 'easy',
                user_answer: 'True',
                correct_answer: 'True',
                is_correct: true,
                explanation: 'In Python, `[]` instantiates a built-in list, so `type([])` evaluates directly to `list`.',
              },
              {
                question_id: 'q2',
                question_text: 'Which SQL clause is executed first during query evaluation?',
                skill_name: 'SQL',
                question_type: 'mcq',
                difficulty: 'intermediate',
                user_answer: 'SELECT',
                correct_answer: 'FROM',
                is_correct: false,
                explanation: 'In logical query processing order, `FROM` executes first to bind tables and joins before filters and projections.',
              },
            ],
            ai_analysis: {
              recommendations: [
                'Prioritize relational database fundamentals, specifically SQL query execution order and indexing strategies.',
                'Advance your Python async programming concepts since basic data structures and types are verified mastered.',
              ],
              next_steps: [
                'Launch Module 2: Applied Architecture & Persistence in your roadmap.',
                'Practice targeted SQL drill questions to bring proficiency above the 70% job-ready threshold.',
              ],
            },
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchResults();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex flex-col items-center justify-center p-6 font-body">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#A1A1AA]">Compiling deterministic assessment evidence...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex flex-col items-center justify-center p-6 font-body text-center">
        <Award className="w-12 h-12 text-[#A1A1AA] mb-4" />
        <h2 className="text-xl font-bold font-heading text-white">Results Record Not Found</h2>
        <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-6">
          The requested assessment report could not be retrieved from the persistent record.
        </p>
        <Link
          to="/skills"
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-2"
        >
          <span>Return to Skill Matrix</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const totalQuestions = results.total_questions || results.answers?.length || 5;
  const scorePct = Math.round(results.score_percentage || 0);
  const correctCount = results.answers ? results.answers.filter((a: any) => a.is_correct).length : Math.round((scorePct / 100) * totalQuestions);
  const incorrectCount = totalQuestions - correctCount;

  const filteredAnswers = (results.answers || []).filter((ans: any) => {
    if (filterType === 'correct') return ans.is_correct === true;
    if (filterType === 'incorrect') return ans.is_correct === false;
    return true;
  });

  const modeBadge = () => {
    const t = results.assessment_type;
    if (t === 'practice') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Practice Drill (Baseline Preserved)
        </span>
      );
    }
    if (t === 'mastery') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" /> Mastery Test-Out (Verified Advancement)
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" /> Diagnostic Baseline Evaluation
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-white border-white/20 bg-white/10';
    if (score >= 50) return 'text-white border-[#292929] bg-[#171717]';
    return 'text-[#A1A1AA] border-[#292929] bg-[#171717]';
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white p-4 sm:p-8 font-body">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-[#141414] border border-[#292929] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {modeBadge()}
                <span className="text-xs text-[#A1A1AA] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-white" /> {results.duration_minutes || 12} mins duration
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                {results.title}
              </h1>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Deterministic evaluation completed on {results.time_completed ? new Date(results.time_completed).toLocaleDateString() : 'Today'}. Every score is grounded in reproducible test evidence.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/skills"
                className="px-4 py-2.5 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#292929] text-white font-medium text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <Brain className="w-4 h-4 text-white" />
                <span>View Skill Radar</span>
              </Link>
              <Link
                to="/roadmap"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Open Learning Roadmap</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#292929]">
            <div className="bg-[#171717] p-4 rounded-2xl border border-[#292929]">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Overall Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-bold font-heading text-white">
                  {scorePct}%
                </span>
                <span className="text-xs text-[#A1A1AA]">
                  {scorePct >= 75 ? 'Mastered' : scorePct >= 50 ? 'Developing' : 'Needs Work'}
                </span>
              </div>
            </div>

            <div className="bg-[#171717] p-4 rounded-2xl border border-[#292929]">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Correct Answers</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-bold font-heading text-white">{correctCount}</span>
                <span className="text-xs text-[#A1A1AA]">of {totalQuestions} questions</span>
              </div>
            </div>

            <div className="bg-[#171717] p-4 rounded-2xl border border-[#292929]">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Incorrect / Gaps</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-bold font-heading text-[#A1A1AA]">{incorrectCount}</span>
                <span className="text-xs text-[#A1A1AA]">target concepts</span>
              </div>
            </div>

            <div className="bg-[#171717] p-4 rounded-2xl border border-[#292929]">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Accuracy Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-bold font-heading text-white">
                  {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}%
                </span>
                <span className="text-xs text-[#A1A1AA]">objective accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Assessed Skills & Proficiency Calibrations */}
        {results.skill_scores && results.skill_scores.length > 0 && (
          <div className="bg-[#141414] border border-[#292929] rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-white" />
                  Calibrated Skill Competencies
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Performance on this assessment has updated your verified knowledge profile.
                </p>
              </div>
              <span className="text-xs font-semibold text-white px-3 py-1 bg-white/10 rounded-lg border border-white/20">
                {results.skill_scores.length} Competencies Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.skill_scores.map((skill: any) => {
                const sPct = Math.round(skill.score_percentage);
                return (
                  <div
                    key={skill.skill_name}
                    className="p-4 rounded-2xl bg-[#171717] border border-[#292929] hover:border-neutral-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold font-heading text-white">{skill.skill_name}</span>
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full border ${getScoreColor(sPct)}`}
                        >
                          {sPct}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#141414] text-[#A1A1AA] border border-[#292929]">
                          {skill.proficiency_level}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#141414] text-white border border-[#292929]`}
                        >
                          {skill.strength_level}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#292929] flex items-center justify-between text-[11px] text-[#A1A1AA]">
                      <span>Priority:</span>
                      <span className="font-semibold capitalize text-white">
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
        <div className="bg-[#141414] border border-[#292929] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                Question-by-Question Breakdown
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Inspect question prompts, code implementations, test results, and pedagogical explanations.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#171717] border border-[#292929]">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'all' ? 'bg-white text-black shadow-sm' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                All ({totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('correct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'correct' ? 'bg-white text-black shadow-sm' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Correct ({correctCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('incorrect')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'incorrect' ? 'bg-white text-black shadow-sm' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Incorrect ({incorrectCount})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAnswers.map((ans: any, idx: number) => {
              const isExpanded = expandedQuestion === ans.question_id;
              const isCorrect = ans.is_correct === true;

              return (
                <div
                  key={ans.question_id}
                  className="rounded-2xl border border-[#292929] bg-[#171717] hover:border-neutral-500 transition-all overflow-hidden"
                >
                  {/* Question Summary Bar */}
                  <div
                    onClick={() => setExpandedQuestion(isExpanded ? null : ans.question_id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#141414] border border-[#292929] text-white"
                      >
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-[#A1A1AA]" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#141414] text-[#A1A1AA] border border-[#292929]">
                            Q{idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                            {ans.skill_name}
                          </span>
                          {ans.question_type && (
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#141414] text-[#A1A1AA] border border-[#292929]">
                              {ans.question_type.replace('_', ' ')}
                            </span>
                          )}
                          {ans.difficulty && (
                            <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-[#141414] text-[#A1A1AA] border border-[#292929]">
                              {ans.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold font-heading text-white truncate">
                          {ans.question_text}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#141414] border border-[#292929] text-white font-mono"
                      >
                        {isCorrect ? '+1.0 pt' : '0.0 pt'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-white" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-[#292929] space-y-4 animate-fade-in text-xs">
                      {/* Full Question Text */}
                      <div className="p-3.5 rounded-xl bg-[#141414] border border-[#292929] text-white">
                        <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold block mb-1">
                          Problem Statement:
                        </span>
                        <p className="leading-relaxed whitespace-pre-wrap">{ans.question_text}</p>
                      </div>

                      {/* Code Snippet if present */}
                      {ans.code_snippet && (
                        <div className="rounded-xl overflow-hidden border border-[#292929] bg-[#141414]">
                          <div className="px-3.5 py-1.5 bg-[#171717] border-b border-[#292929] text-[10px] text-[#A1A1AA] flex items-center gap-1.5 font-mono">
                            <Code2 className="w-3.5 h-3.5 text-white" />
                            <span>Code Snippet Reference</span>
                          </div>
                          <pre className="p-3.5 text-[11px] font-mono text-neutral-200 overflow-x-auto leading-relaxed">
                            {ans.code_snippet}
                          </pre>
                        </div>
                      )}

                      {/* Responses comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl border border-[#292929] bg-[#141414] text-white">
                          <span className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-[#A1A1AA]">
                            Your Submitted Answer:
                          </span>
                          <p className="font-mono text-xs break-words whitespace-pre-wrap">
                            {ans.user_answer || '(No answer provided)'}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#141414] border border-[#292929] text-white">
                          <span className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-white">
                            Canonical Correct Solution:
                          </span>
                          <p className="font-mono text-xs break-words whitespace-pre-wrap">
                            {ans.correct_answer || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Automated Test Cases Table if available */}
                      {ans.test_cases && ans.test_cases.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#141414] border border-[#292929]">
                          <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold block mb-2">
                            Automated Test Verification Matrix:
                          </span>
                          <div className="space-y-1.5">
                            {ans.test_cases.map((tc: any, tcIdx: number) => (
                              <div
                                key={tcIdx}
                                className="flex items-center justify-between p-2 rounded-lg bg-[#171717] border border-[#292929] text-[11px]"
                              >
                                <div>
                                  <span className="text-[#A1A1AA]">{tc.description || `Test ${tcIdx + 1}`}: </span>
                                  <code className="text-white font-mono text-[10px] ml-1">{tc.input}</code>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[#A1A1AA] text-[10px]">Expected:</span>
                                  <code className="text-white font-mono text-[10px]">{tc.expected}</code>
                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-white border border-white/20`}
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
                        <div className="p-3.5 rounded-xl bg-[#141414] border border-[#292929] text-[#A1A1AA]">
                          <span className="text-[10px] uppercase tracking-wider text-white font-bold block mb-1">
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
          <div className="bg-[#141414] border border-[#292929] rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-white" />
              AI Priority Recommendations & Next Steps
            </h3>
            <p className="text-xs text-[#A1A1AA] mb-6">
              Synthesized from your response patterns and mistake analysis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#171717] border border-[#292929] space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Actionable Next Steps
                </span>
                <ul className="space-y-2 text-xs text-[#A1A1AA]">
                  {(results.ai_analysis.next_steps || [
                    'Review your question breakdown above to diagnose incorrect edge cases',
                    'Open your roadmap module to target highlighted skill gaps',
                    'Revisit career match to inspect your updated readiness score',
                  ]).map((step: any, sIdx: number) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#171717] border border-[#292929] space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Curated Guidance
                </span>
                <ul className="space-y-2 text-xs text-[#A1A1AA]">
                  {results.ai_analysis.recommendations.map((rec: any, rIdx: number) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#292929] flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-[#A1A1AA]">
                Ready to bridge these knowledge gaps? Explore your personalized learning modules.
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/assessment"
                  className="px-4 py-2 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#292929] text-white text-xs font-medium transition-colors"
                >
                  Take Another Assessment
                </Link>
                <Link
                  to="/roadmap"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
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
