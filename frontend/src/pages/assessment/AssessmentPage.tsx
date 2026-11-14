import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Brain,
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Code2,
  Award,
  Zap,
  Target,
  FileCheck2,
  Check,
  Terminal,
} from 'lucide-react';
import api, { AssessmentData, AssessmentQuestion } from '../../services/api';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();

  // Mode: 'select' | 'in_progress' | 'summary'
  const [mode, setMode] = useState<'select' | 'in_progress' | 'summary'>('select');
  const [assessmentType, setAssessmentType] = useState<'diagnostic' | 'practice' | 'mastery'>('diagnostic');
  const [isStarting, setIsStarting] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);

  // Assessment runtime state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 mins
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    explanation: string;
    correctAnswer?: string;
  } | null>(null);

  const timerRef = useRef<any>(null);

  // Timer Effect
  useEffect(() => {
    if (mode === 'in_progress' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinishAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, timeRemaining]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async (type: 'diagnostic' | 'practice' | 'mastery') => {
    setIsStarting(true);
    setAssessmentType(type);
    try {
      const data = await api.startAssessment({
        type,
        target_skills: ['Python', 'JavaScript', 'React', 'SQL', 'Git', 'Data Structures'],
      });
      setAssessment(data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setTextAnswers({});
      setTimeRemaining(type === 'practice' ? 10 * 60 : 20 * 60);
      setMode('in_progress');
      toast.success(
        type === 'mastery'
          ? 'Mastery exam started! Passing unlocks linked roadmap modules.'
          : type === 'practice'
          ? 'Practice drill started! Instant feedback mode active.'
          : 'Diagnostic assessment started! Good luck.'
      );
    } catch (err) {
      console.error(err);
      toast.error('Could not initialize assessment session.');
    } finally {
      setIsStarting(false);
    }
  };

  const currentQuestion: (AssessmentQuestion & { test_cases?: any[]; options?: any[]; code_snippet?: string; tags?: string[] }) | undefined =
    assessment?.questions?.[currentIndex] as any;

  const qType = (currentQuestion?.type || (currentQuestion as any)?.question_type || 'mcq').toLowerCase();
  const isCoding = qType === 'coding';
  const isConceptual = qType === 'conceptual';
  const hasOptions = currentQuestion?.options && currentQuestion.options.length > 0;

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion || showFeedback) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    let answer = '';
    if (isCoding || isConceptual || !hasOptions) {
      answer = textAnswers[currentQuestion.id] || '';
    } else {
      answer = selectedAnswers[currentQuestion.id] || '';
    }

    if (!answer.trim()) {
      toast.error(isCoding ? 'Please write your code solution first' : 'Please select or enter an answer');
      return;
    }

    try {
      const res = await api.submitAnswer(assessment?.id || 'demo', {
        question_id: currentQuestion.id,
        user_answer: answer,
        time_taken_seconds: 20,
      });

      // Show brief pedagogical feedback
      setFeedbackData({
        isCorrect: res.is_correct ?? true,
        explanation: res.ai_feedback || res.explanation || 'Answer recorded successfully.',
        correctAnswer: res.correct_answer,
      });
      setShowFeedback(true);

      // Auto advance
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackData(null);
        if (currentIndex < (assessment?.questions?.length || 1) - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setMode('summary');
        }
      }, 2200);
    } catch {
      if (currentIndex < (assessment?.questions?.length || 1) - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setMode('summary');
      }
    }
  };

  const handleSkipQuestion = () => {
    if (currentIndex < (assessment?.questions?.length || 1) - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setMode('summary');
    }
  };

  const handleFinishAssessment = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const completeRes = await api.completeAssessment(assessment?.id || 'demo');
      toast.success('Assessment complete! Reviewing evaluation report...');
      if (assessment?.id) {
        navigate(`/assessment/${assessment.id}/results`);
      } else {
        navigate('/skills');
      }
    } catch {
      if (assessment?.id) {
        navigate(`/assessment/${assessment.id}/results`);
      } else {
        navigate('/skills');
      }
    }
  };

  // SCREEN 1: Assessment Selection (3 distinct modes)
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-[#0b0d13] text-gray-100 p-6 sm:p-10 font-sans relative selection:bg-indigo-500/30">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Evaluation-First Learning Engine
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Evaluate Your Technical Mastery
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2.5">
              Select an assessment mode. Our adaptive engine calibrates questions dynamically across MCQ, output prediction, debugging, coding, and real-world scenarios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Mode 1: Initial Diagnostic Assessment */}
            <div className="p-6 rounded-3xl bg-[#121522] border-2 border-indigo-500/60 hover:border-indigo-400 shadow-xl shadow-indigo-950/40 backdrop-blur-xl flex flex-col justify-between relative group transition-all">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-[10px] tracking-wide uppercase shadow-md">
                Recommended
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Initial Diagnostic</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Holistic diagnostic based on your selected interests and career goal. Calibrates baseline radar chart and unlocks your learning roadmap.
                </p>

                <div className="space-y-1.5 pt-3 border-t border-gray-800">
                  <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                    Assessed Dimensions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['Python', 'JavaScript', 'React', 'SQL', 'Git'].map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-800/80">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> ~15-20 Mins
                  </span>
                  <span>Baseline Calibration</span>
                </div>
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => handleStart('diagnostic')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>Start Diagnostic</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode 2: Targeted Practice Assessment */}
            <div className="p-6 rounded-3xl bg-[#121522] border border-gray-800 hover:border-gray-700 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1a1f30] text-amber-400 flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Practice Drill</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Fast-paced drill with immediate answers to test retention and prepare for module exams without altering original baseline scores.
                </p>

                <div className="space-y-1.5 pt-3 border-t border-gray-800">
                  <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                    Pedagogical Focus:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['Debugging', 'Output Prediction', 'Code Fixes'].map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-800/80">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> ~10 Mins
                  </span>
                  <span>Instant Feedback</span>
                </div>
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => handleStart('practice')}
                  className="w-full py-3 px-4 rounded-xl bg-[#181c2b] hover:bg-[#202538] border border-gray-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Start Practice Drill</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode 3: Mastery Test-Out Assessment */}
            <div className="p-6 rounded-3xl bg-[#121522] border border-gray-800 hover:border-emerald-500/50 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mastery Test-Out</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Rigorous examination with coding challenges and scenarios. Achieving ≥75% score verifies competency and automatically unlocks advanced modules.
                </p>

                <div className="space-y-1.5 pt-3 border-t border-gray-800">
                  <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                    Advancement Standard:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['Coding Challenges', 'Architecture Scenarios', '≥75% Required'].map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-800/80">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> ~20 Mins
                  </span>
                  <span>Module Unlock</span>
                </div>
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => handleStart('mastery')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Mastery Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 3: Summary / Results Completion
  if (mode === 'summary') {
    const total = assessment?.questions?.length || 5;
    const answeredCount = Object.keys(selectedAnswers).length + Object.keys(textAnswers).length;

    return (
      <div className="min-h-screen bg-[#0b0d13] text-gray-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#121522] border border-gray-800 rounded-3xl p-8 text-center shadow-2xl relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-white">Assessment Complete!</h2>
          <p className="text-xs text-gray-400 mt-2">
            You successfully submitted responses for all questions. Our evaluation engine is compiling your reproducible evidence report.
          </p>

          <div className="grid grid-cols-2 gap-3 my-6 p-4 rounded-2xl bg-[#171b29] border border-gray-800 text-left">
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-semibold">Total Assessed</p>
              <p className="text-xl font-bold text-white mt-0.5">{total} Problems</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-semibold">Time Remaining</p>
              <p className="text-xl font-bold text-indigo-400 mt-0.5">{formatTimer(timeRemaining)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishAssessment}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>View Detailed Skill Analysis & Results</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 2: IN_PROGRESS Assessment UI
  const totalQuestions = assessment?.questions?.length || 5;
  const currentAnswer = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;

  return (
    <div className="min-h-screen bg-[#0b0d13] text-gray-100 flex flex-col font-sans select-none relative">
      {/* Top Banner Navigation */}
      <header className="border-b border-gray-800/80 bg-[#0e111a]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              Q{currentIndex + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {currentQuestion?.skill_name || 'Competency Drill'}
                </h4>
                <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  {qType.replace('_', ' ')}
                </span>
                {currentQuestion?.difficulty && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 capitalize">
                    {currentQuestion.difficulty}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400">
                Question {currentIndex + 1} of {totalQuestions} • {assessment?.title}
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181c2b] border border-gray-800 text-xs font-mono font-semibold text-indigo-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(timeRemaining)}</span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-gray-800 h-1">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Assessment Body: Question + Navigator */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left / Center: Question Card */}
        <div className="flex-1 flex flex-col justify-between bg-[#121522] border border-gray-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Brief Feedback Overlay */}
          {showFeedback && feedbackData && (
            <div className="absolute inset-0 z-30 bg-[#0d101a]/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              {feedbackData.isCorrect ? (
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                  <XCircle className="w-8 h-8" />
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">
                {feedbackData.isCorrect ? 'Correct Answer!' : 'Pedagogical Review'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md mb-2 leading-relaxed">
                {feedbackData.explanation}
              </p>
              {feedbackData.correctAnswer && !feedbackData.isCorrect && (
                <div className="mt-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40">
                  Target solution: {feedbackData.correctAnswer}
                </div>
              )}
            </div>
          )}

          <div>
            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed mb-4">
              {currentQuestion?.question_text}
            </h2>

            {/* Code Snippet Box if available */}
            {currentQuestion?.code_snippet && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-gray-800 bg-[#090b10] shadow-inner font-mono text-xs">
                <div className="px-4 py-2 bg-[#121520] border-b border-gray-800 flex items-center gap-2 text-gray-400">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] uppercase tracking-wider">
                    {isCoding ? 'Starter Code Template' : 'Code Snippet'}
                  </span>
                </div>
                <pre className="p-4 text-emerald-300 overflow-x-auto leading-relaxed">
                  <code>{currentQuestion.code_snippet}</code>
                </pre>
              </div>
            )}

            {/* Coding Challenge Mode */}
            {isCoding ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      Write Solution Code
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">Python / JavaScript</span>
                  </div>
                  <textarea
                    rows={8}
                    value={currentQuestion ? textAnswers[currentQuestion.id] || currentQuestion.code_snippet || '' : ''}
                    onChange={(e) => {
                      if (currentQuestion) {
                        setTextAnswers({
                          ...textAnswers,
                          [currentQuestion.id]: e.target.value,
                        });
                      }
                    }}
                    placeholder="# Write your implementation here..."
                    className="w-full p-4 bg-[#090b10] border border-gray-800 rounded-xl font-mono text-xs text-emerald-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Visible Test Cases Table */}
                {currentQuestion?.test_cases && currentQuestion.test_cases.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#141824] border border-gray-800">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-2">
                      Deterministic Test Cases:
                    </span>
                    <div className="space-y-1.5">
                      {currentQuestion.test_cases.map((tc: any, tcIdx: number) => (
                        <div
                          key={tcIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#0e111a] border border-gray-800/80 text-[11px]"
                        >
                          <span className="text-gray-300 font-mono text-[10px]">
                            {tc.description || `Case ${tcIdx + 1}`}: {tc.input}
                          </span>
                          <span className="text-emerald-400 font-mono text-[10px]">
                            Expected: {tc.expected}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : hasOptions ? (
              /* MCQ / Output Prediction / Scenario Options */
              <div className="space-y-3">
                {currentQuestion.options!.map((option: any) => {
                  const isSelected = currentAnswer === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/15 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-gray-800 bg-[#161a27] hover:border-gray-700 hover:bg-[#1a1f2e]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {option.id}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-200">{option.text}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Conceptual Textarea Response with Rubric hints */
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Conceptual Response & Trade-off Rationale
                </label>
                <textarea
                  rows={6}
                  value={currentQuestion ? textAnswers[currentQuestion.id] || '' : ''}
                  onChange={(e) => {
                    if (currentQuestion) {
                      setTextAnswers({
                        ...textAnswers,
                        [currentQuestion.id]: e.target.value,
                      });
                    }
                  }}
                  placeholder="Detail your conceptual reasoning, architectural advantages, and potential failure modes..."
                  className="w-full p-4 bg-[#161a27] border border-gray-800 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
                <p className="text-[10px] text-gray-500 mt-2">
                  Evaluated using transparent rubric standards: definitions, trade-offs, and practical implications.
                </p>
              </div>
            )}
          </div>

          {/* Action Toolbar Bottom */}
          <div className="pt-6 mt-8 border-t border-gray-800/80 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-semibold"
              >
                Skip Question
              </button>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <span>Submit Answer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Question Navigator */}
        <aside className="w-full lg:w-64 bg-[#121522] border border-gray-800/90 rounded-3xl p-5 shadow-xl flex flex-col justify-between shrink-0">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-400" /> Assessment Navigator
            </h4>

            <div className="grid grid-cols-5 gap-2">
              {(assessment?.questions || []).map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered =
                  selectedAnswers[q.id] !== undefined || (textAnswers[q.id] && textAnswers[q.id].trim().length > 0);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : isAnswered
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#161a27] text-gray-400 border border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-800 space-y-2 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#161a27] border border-gray-700" />
                <span>Pending</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-800">
            <button
              type="button"
              onClick={handleFinishAssessment}
              className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors"
            >
              Finish Assessment Now
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AssessmentPage;
