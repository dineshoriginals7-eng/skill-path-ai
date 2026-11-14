import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Brain,
  Sparkles,
  Zap,
  Award,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Code2,
  FileCheck2,
  Check,
  Terminal,
} from 'lucide-react';
import api, { AssessmentQuestion, AssessmentSession } from '../../services/api';

type AssessmentMode = 'select' | 'in_progress' | 'summary';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<AssessmentMode>('select');
  const [assessmentType, setAssessmentType] = useState<'diagnostic' | 'practice' | 'mastery'>('diagnostic');
  const [assessment, setAssessment] = useState<AssessmentSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(15 * 60); // 15 mins default
  const [timerActive, setTimerActive] = useState(false);

  // Instant drill feedback state (for Practice Drill mode)
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{ isCorrect: boolean; explanation: string; correctAnswer?: string } | null>(null);

  const [isStarting, setIsStarting] = useState(false);

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining]);

  const handleAutoSubmitOnTimeout = () => {
    toast.error('Assessment time has elapsed. Submitting responses now.');
    handleFinishAssessment();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Launch assessment session
  const handleStart = async (type: 'diagnostic' | 'practice' | 'mastery') => {
    setIsStarting(true);
    setAssessmentType(type);
    try {
      const data = await api.startAssessment({ assessment_type: type });
      setAssessment(data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setTextAnswers({});
      setTimeRemaining(data.time_limit_minutes ? data.time_limit_minutes * 60 : 15 * 60);
      setTimerActive(true);
      setMode('in_progress');
    } catch {
      toast.error('Failed to initialize assessment. Loading demo session.');
    } finally {
      setIsStarting(false);
    }
  };

  const currentQuestion: AssessmentQuestion | undefined = assessment?.questions?.[currentIndex];
  const qType = currentQuestion?.question_type || 'mcq';
  const isCoding = qType === 'coding_challenge';
  const hasOptions = currentQuestion?.options && currentQuestion.options.length > 0;

  // Select Option
  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionId,
    });
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !assessment) return;

    const answerVal = isCoding || !hasOptions
      ? textAnswers[currentQuestion.id] || ''
      : selectedAnswers[currentQuestion.id] || '';

    try {
      const result = await api.submitAnswer(assessment.id, {
        question_id: currentQuestion.id,
        answer: answerVal,
        time_spent_seconds: 30,
      });

      // If in practice drill mode, show instant feedback briefly
      if (assessmentType === 'practice' && result.evaluation) {
        setFeedbackData({
          isCorrect: Boolean(result.evaluation.is_correct),
          explanation: result.evaluation.feedback || 'Answer recorded.',
          correctAnswer: result.evaluation.correct_answer,
        });
        setShowFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
          setFeedbackData(null);
          advanceToNext();
        }, 1800);
        return;
      }

      advanceToNext();
    } catch {
      advanceToNext();
    }
  };

  const advanceToNext = () => {
    if (!assessment) return;
    if (currentIndex < (assessment.questions?.length || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setMode('summary');
      setTimerActive(false);
    }
  };

  const handleSkipQuestion = () => {
    advanceToNext();
  };

  const handleFinishAssessment = async () => {
    setTimerActive(false);
    try {
      if (assessment?.id) {
        await api.completeAssessment(assessment.id);
        toast.success('Assessment evaluated! Calibrated score matrix updated.');
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
      <div className="min-h-screen bg-[#090909] text-white p-6 sm:p-10 font-body relative">
        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Evaluation-First Learning Engine
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
              Evaluate Your Technical Mastery
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-2.5">
              Select an assessment mode. Our adaptive engine calibrates questions dynamically across MCQ, output prediction, debugging, coding, and real-world scenarios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Mode 1: Initial Diagnostic Assessment */}
            <div className="p-6 rounded-3xl bg-[#141414] border-2 border-white shadow-sm flex flex-col justify-between relative group transition-all">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-white text-black font-bold text-[10px] tracking-wide uppercase shadow-sm">
                Recommended
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#171717] border border-[#292929] text-white flex items-center justify-center mb-5">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-heading text-white mb-2">Initial Diagnostic</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                  Holistic diagnostic based on your selected interests and career goal. Calibrates baseline radar chart and unlocks your learning roadmap.
                </p>

                <div className="space-y-1.5 pt-3 border-t border-[#292929]">
                  <p className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    Assessed Dimensions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['Python', 'JavaScript', 'React', 'SQL', 'Git'].map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-[#171717] border border-[#292929] text-white text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#292929]">
                <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-white" /> ~15-20 Mins
                  </span>
                  <span>Baseline Calibration</span>
                </div>
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => handleStart('diagnostic')}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>Start Diagnostic</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode 2: Targeted Practice Assessment */}
            <div className="p-6 rounded-3xl bg-[#141414] border border-[#292929] hover:border-neutral-500 shadow-sm flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#171717] border border-[#292929] text-white flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-heading text-white mb-2">Practice Drill</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                  Fast-paced drill with immediate answers to test retention and prepare for module exams without altering original baseline scores.
                </p>

                <div className="space-y-1.5 pt-3 border-t border-[#292929]">
                  <p className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    Pedagogical Focus:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['Debugging', 'Output Prediction', 'Code Fixes'].map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-[#171717] border border-[#292929] text-white text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#292929]">
                <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-white" /> ~10 Mins
                  </span>
                  <span>Instant Feedback</span>
                </div>
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => handleStart('practice')}
                  className="w-full py-3 px-4 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#292929] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Start Practice Drill</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode 3: Mastery Test-Out Assessment */}
            <div className="p-6 rounded-3xl bg-[#141414] border border-[#292929] hover:border-neutral-500 shadow-sm flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#171717] border border-[#292929] text-white flex items-center justify-center mb-5">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-heading text-white mb-2">Mastery Test-Out</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                  Rigorous examination with coding challenges and scenarios. Achieving ≥75% score verifies competency and automatically unlocks advanced modules.
                </p>

                <div className="space-y-1.5 pt-3 border-t border-[#292929]">
                  <p className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    Advancement Standard:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['Coding Challenges', 'Architecture Scenarios', '≥75% Required'].map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-[#171717] border border-[#292929] text-white text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#292929]">
                <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-white" /> ~20 Mins
                  </span>
                  <span>Module Unlock</span>
                </div>
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => handleStart('mastery')}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
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

    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center p-6 font-body">
        <div className="max-w-md w-full bg-[#141414] border border-[#292929] rounded-3xl p-8 text-center shadow-2xl relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#171717] border border-[#292929] text-white flex items-center justify-center mb-5">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold font-heading text-white">Assessment Complete!</h2>
          <p className="text-xs text-[#A1A1AA] mt-2">
            You successfully submitted responses for all questions. Our evaluation engine is compiling your reproducible evidence report.
          </p>

          <div className="grid grid-cols-2 gap-3 my-6 p-4 rounded-2xl bg-[#171717] border border-[#292929] text-left">
            <div>
              <p className="text-[11px] text-[#A1A1AA] uppercase font-semibold">Total Assessed</p>
              <p className="text-xl font-bold font-heading text-white mt-0.5">{total} Problems</p>
            </div>
            <div>
              <p className="text-[11px] text-[#A1A1AA] uppercase font-semibold">Time Remaining</p>
              <p className="text-xl font-bold font-heading text-white mt-0.5">{formatTimer(timeRemaining)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishAssessment}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-body select-none relative">
      {/* Top Banner Navigation */}
      <header className="border-b border-[#292929] bg-[#141414]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black font-bold text-xs">
              Q{currentIndex + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold font-heading text-white uppercase tracking-wider">
                  {currentQuestion?.skill_name || 'Competency Drill'}
                </h4>
                <span className="text-[10px] px-2 py-0.2 rounded bg-white/10 text-white font-mono border border-white/20">
                  {qType.replace('_', ' ')}
                </span>
                {currentQuestion?.difficulty && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#171717] border border-[#292929] text-[#A1A1AA] capitalize">
                    {currentQuestion.difficulty}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#A1A1AA]">
                Question {currentIndex + 1} of {totalQuestions} • {assessment?.title}
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171717] border border-[#292929] text-xs font-mono font-semibold text-white">
            <Clock className="w-3.5 h-3.5 text-white" />
            <span>{formatTimer(timeRemaining)}</span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-[#171717] h-1 border-t border-[#292929]">
          <div
            className="bg-white h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Assessment Body: Question + Navigator */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left / Center: Question Card */}
        <div className="flex-1 flex flex-col justify-between bg-[#141414] border border-[#292929] rounded-3xl p-6 sm:p-8 shadow-sm relative">
          {/* Brief Feedback Overlay */}
          {showFeedback && feedbackData && (
            <div className="absolute inset-0 z-30 bg-[#141414]/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              {feedbackData.isCorrect ? (
                <div className="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center mb-3 border border-white/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center mb-3 border border-white/20">
                  <XCircle className="w-8 h-8" />
                </div>
              )}
              <h3 className="text-xl font-bold font-heading text-white mb-2">
                {feedbackData.isCorrect ? 'Correct Answer!' : 'Pedagogical Review'}
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mb-2 leading-relaxed">
                {feedbackData.explanation}
              </p>
              {feedbackData.correctAnswer && !feedbackData.isCorrect && (
                <div className="mt-2 text-xs font-mono text-white bg-[#171717] px-3 py-1.5 rounded-lg border border-[#292929]">
                  Target solution: {feedbackData.correctAnswer}
                </div>
              )}
            </div>
          )}

          <div>
            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold font-heading text-white leading-relaxed mb-4">
              {currentQuestion?.question_text}
            </h2>

            {/* Code Snippet Box if available */}
            {currentQuestion?.code_snippet && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-[#292929] bg-[#171717] font-mono text-xs">
                <div className="px-4 py-2 bg-[#141414] border-b border-[#292929] flex items-center gap-2 text-[#A1A1AA]">
                  <Code2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-[11px] uppercase tracking-wider">
                    {isCoding ? 'Starter Code Template' : 'Code Snippet'}
                  </span>
                </div>
                <pre className="p-4 text-neutral-200 overflow-x-auto leading-relaxed">
                  <code>{currentQuestion.code_snippet}</code>
                </pre>
              </div>
            )}

            {/* Coding Challenge Mode */}
            {isCoding ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-white" />
                      Write Solution Code
                    </label>
                    <span className="text-[10px] text-[#A1A1AA] font-mono">Python / JavaScript</span>
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
                    className="w-full p-4 bg-[#171717] border border-[#292929] rounded-xl font-mono text-xs text-neutral-200 placeholder-[#71717A] focus:outline-none focus:border-white leading-relaxed"
                  />
                </div>

                {/* Visible Test Cases Table */}
                {currentQuestion?.test_cases && currentQuestion.test_cases.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#171717] border border-[#292929]">
                    <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold block mb-2">
                      Deterministic Test Cases:
                    </span>
                    <div className="space-y-1.5">
                      {currentQuestion.test_cases.map((tc: any, tcIdx: number) => (
                        <div
                          key={tcIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#141414] border border-[#292929] text-[11px]"
                        >
                          <span className="text-[#A1A1AA] font-mono text-[10px]">
                            {tc.description || `Case ${tcIdx + 1}`}: {tc.input}
                          </span>
                          <span className="text-white font-mono text-[10px]">
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
                          ? 'border-white bg-[#171717] shadow-sm ring-1 ring-white'
                          : 'border-[#292929] bg-[#171717] hover:border-neutral-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                            isSelected ? 'bg-white text-black' : 'bg-[#292929] text-[#A1A1AA]'
                          }`}
                        >
                          {option.id}
                        </span>
                        <span className="text-xs sm:text-sm text-neutral-200">{option.text}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Conceptual Textarea Response with Rubric hints */
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
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
                  className="w-full p-4 bg-[#171717] border border-[#292929] rounded-xl text-xs sm:text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-white leading-relaxed"
                />
                <p className="text-[10px] text-[#A1A1AA] mt-2">
                  Evaluated using transparent rubric standards: definitions, trade-offs, and practical implications.
                </p>
              </div>
            )}
          </div>

          {/* Action Toolbar Bottom */}
          <div className="pt-6 mt-8 border-t border-[#292929] flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl border border-[#292929] hover:bg-[#171717] text-[#A1A1AA] hover:text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="px-4 py-2 rounded-xl text-[#A1A1AA] hover:text-white text-xs font-semibold"
              >
                Skip Question
              </button>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <span>Submit Answer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Question Navigator */}
        <aside className="w-full lg:w-64 bg-[#141414] border border-[#292929] rounded-3xl p-5 shadow-sm flex flex-col justify-between shrink-0">
          <div>
            <h4 className="text-xs font-bold font-heading text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-white" /> Assessment Navigator
            </h4>

            <div className="grid grid-cols-5 gap-2">
              {(assessment?.questions || []).map((q: any, idx: number) => {
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
                        ? 'bg-white text-black ring-2 ring-neutral-400'
                        : isAnswered
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-[#171717] text-[#A1A1AA] border border-[#292929] hover:border-neutral-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-[#292929] space-y-2 text-[11px] text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/40" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#171717] border border-[#292929]" />
                <span>Pending</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#292929]">
            <button
              type="button"
              onClick={handleFinishAssessment}
              className="w-full py-2.5 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#292929] text-white text-xs font-semibold transition-colors"
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
