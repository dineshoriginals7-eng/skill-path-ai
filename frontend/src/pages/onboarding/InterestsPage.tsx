import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Brain,
  Cpu,
  BarChart3,
  Layers,
  Monitor,
  Server,
  Smartphone,
  Shield,
  Cloud,
  PenTool,
  Plus,
  Check,
  Sparkles,
  ArrowRight,
  Compass,
  X,
  Bot,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

interface InterestCard {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgActive: string;
}

const INTERESTS: InterestCard[] = [
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    description: 'LLMs, AI agents, neural network architectures, and cognitive systems.',
    icon: Brain,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgActive: 'bg-purple-500/10',
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    description: 'Predictive modeling, supervised & unsupervised learning, and ML pipelines.',
    icon: Cpu,
    color: 'text-violet-400',
    borderColor: 'border-violet-500/40',
    bgActive: 'bg-violet-500/10',
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Statistical analytics, big data transformation, exploratory visualization, and insights.',
    icon: BarChart3,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgActive: 'bg-blue-500/10',
  },
  {
    id: 'full-stack',
    name: 'Full Stack Development',
    description: 'End-to-end web apps combining modern frontends with resilient APIs and databases.',
    icon: Layers,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
    bgActive: 'bg-indigo-500/10',
  },
  {
    id: 'frontend',
    name: 'Frontend Development',
    description: 'High-performance interactive UIs, React 19, Tailwind, state models, and design systems.',
    icon: Monitor,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgActive: 'bg-cyan-500/10',
  },
  {
    id: 'backend',
    name: 'Backend Development',
    description: 'Fast asynchronous APIs, microservices, distributed caching, and DB indexing.',
    icon: Server,
    color: 'text-teal-400',
    borderColor: 'border-teal-500/40',
    bgActive: 'bg-teal-500/10',
  },
  {
    id: 'mobile',
    name: 'App Development',
    description: 'Cross-platform native iOS & Android applications with React Native and Flutter.',
    icon: Smartphone,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgActive: 'bg-emerald-500/10',
  },
  {
    id: 'security',
    name: 'Cybersecurity',
    description: 'Threat hunting, vulnerability auditing, secure code analysis, and infrastructure defense.',
    icon: Shield,
    color: 'text-red-400',
    borderColor: 'border-red-500/40',
    bgActive: 'bg-red-500/10',
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    description: 'Kubernetes orchestration, AWS/GCP serverless, Terraform, and DevOps deployment.',
    icon: Cloud,
    color: 'text-sky-400',
    borderColor: 'border-sky-500/40',
    bgActive: 'bg-sky-500/10',
  },
  {
    id: 'uiux',
    name: 'UI/UX Design',
    description: 'Product design, usability testing, Figma component systems, and design tokens.',
    icon: PenTool,
    color: 'text-pink-400',
    borderColor: 'border-pink-500/40',
    bgActive: 'bg-pink-500/10',
  },
  {
    id: 'other',
    name: 'Other Emerging Tech',
    description: 'WebAssembly, quantum computing algorithms, embedded systems, and robotics.',
    icon: Plus,
    color: 'text-gray-400',
    borderColor: 'border-gray-500/40',
    bgActive: 'bg-gray-500/10',
  },
];

interface QuestionItem {
  id: number;
  question: string;
  options: { emoji: string; text: string; recommended: string }[];
}

const AI_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    question: 'Do you prefer building things from scratch or analyzing data for patterns?',
    options: [
      { emoji: '🛠️', text: 'Building user-facing tools & apps', recommended: 'full-stack' },
      { emoji: '📊', text: 'Analyzing complex data & discovering patterns', recommended: 'data-science' },
      { emoji: '🤖', text: 'Teaching autonomous algorithms to think', recommended: 'ai' },
      { emoji: '🛡️', text: 'Securing systems and finding loopholes', recommended: 'security' },
    ],
  },
  {
    id: 2,
    question: 'Are you more drawn to visual interfaces or backend logic?',
    options: [
      { emoji: '🎨', text: 'Visual design, animations, and typography', recommended: 'frontend' },
      { emoji: '⚡', text: 'Distributed concurrency and high-speed databases', recommended: 'backend' },
      { emoji: '🌐', text: 'Connecting frontend to backend end-to-end', recommended: 'full-stack' },
      { emoji: '☁️', text: 'Cloud infrastructure and multi-region deploys', recommended: 'cloud' },
    ],
  },
  {
    id: 3,
    question: 'What kind of problems excite you most?',
    options: [
      { emoji: '🧠', text: 'Generating content with LLMs and agents', recommended: 'ai' },
      { emoji: '📈', text: 'Predicting trends and training neural weights', recommended: 'ml' },
      { emoji: '📱', text: 'Crafting slick mobile gestures on smartphones', recommended: 'mobile' },
      { emoji: '✨', text: 'Designing seamless user experiences in Figma', recommended: 'uiux' },
    ],
  },
  {
    id: 4,
    question: 'How do you like to write code?',
    options: [
      { emoji: '💻', text: 'Fast iteration in React & modern web standards', recommended: 'frontend' },
      { emoji: '🐍', text: 'Writing Python scripts with scientific libraries', recommended: 'data-science' },
      { emoji: '🔒', text: 'Inspecting protocols, packets, and API keys', recommended: 'security' },
      { emoji: '⚙️', text: 'Orchestrating containers and CI/CD pipelines', recommended: 'cloud' },
    ],
  },
  {
    id: 5,
    question: 'What is your ultimate dream project to launch?',
    options: [
      { emoji: '🚀', text: 'An autonomous multi-agent engineering assistant', recommended: 'ai' },
      { emoji: '🦄', text: 'A viral SaaS web platform with thousands of users', recommended: 'full-stack' },
      { emoji: '🎯', text: 'A high-accuracy predictive ML diagnosis platform', recommended: 'ml' },
      { emoji: '🌐', text: 'A zero-trust cloud infrastructure supporting millions', recommended: 'cloud' },
    ],
  },
];

export const InterestsPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<string[]>(['ai', 'full-stack', 'frontend']);
  const [primaryInterest, setPrimaryInterest] = useState('ai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Questionnaire Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<{
    role: string;
    targetId: string;
    reasoning: string;
  } | null>(null);

  const toggleInterest = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) {
        toast.error('Select at least one interest area');
        return;
      }
      const updated = selectedIds.filter((item) => item !== id);
      setSelectedIds(updated);
      if (primaryInterest === id) {
        setPrimaryInterest(updated[0]);
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSaveAndStart = async () => {
    setIsSubmitting(true);
    try {
      const selectedNames = INTERESTS.filter((i) => selectedIds.includes(i.id)).map((i) => i.name);
      const primaryName = INTERESTS.find((i) => i.id === primaryInterest)?.name || selectedNames[0];

      await api.saveInterests({
        categories: selectedNames,
        primary_category: primaryName,
      });

      toast.success('Preferences saved! Preparing your diagnostic assessment...');
      navigate('/assessment');
    } catch {
      navigate('/assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Questionnaire Handlers
  const handleAnswerQuestion = (recommendedId: string) => {
    const updated = [...answers, recommendedId];
    setAnswers(updated);

    if (quizStep < AI_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate most frequent recommendation
      const counts: Record<string, number> = {};
      updated.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
      let bestId = 'ai';
      let maxCount = 0;
      Object.entries(counts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestId = id;
        }
      });

      const matchedCard = INTERESTS.find((c) => c.id === bestId) || INTERESTS[0];

      setAiRecommendation({
        role: matchedCard.name,
        targetId: bestId,
        reasoning:
          'Your answers indicate a strong desire for building intelligent agent pipelines, combined with scalable modern UI frameworks and production engineering.',
      });
    }
  };

  const handleApplyRecommendation = () => {
    if (aiRecommendation) {
      if (!selectedIds.includes(aiRecommendation.targetId)) {
        setSelectedIds([...selectedIds, aiRecommendation.targetId]);
      }
      setPrimaryInterest(aiRecommendation.targetId);
      setIsModalOpen(false);
      toast.success(`Set ${aiRecommendation.role} as your primary path!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-gray-100 flex flex-col font-sans relative selection:bg-indigo-500/30">
      {/* Background glow highlights */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-gray-800/80 bg-[#0e111a]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">
                SkillPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
              </span>
              <span className="block text-[10px] text-gray-400 font-mono">DOMAIN DISCOVERY</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:inline">
              Selected: <span className="text-white font-semibold">{selectedIds.length}</span> categories
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Headings */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Curate Your Focus
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What would you like to learn?
          </h1>
          <p className="text-sm text-gray-400 mt-2.5">
            Select all that interest you. You can change these anytime or let AI suggest tracks based on your strengths.
          </p>
        </div>

        {/* Primary Interest Picker Banner */}
        {selectedIds.length > 0 && (
          <div className="max-w-xl mx-auto mb-8 p-3.5 sm:p-4 rounded-2xl bg-[#141724]/90 border border-indigo-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-indigo-950/20">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Set as primary focus:</span>
            </div>
            <select
              value={primaryInterest}
              onChange={(e) => setPrimaryInterest(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-[#1b1f2e] border border-gray-700 rounded-xl text-xs font-semibold text-indigo-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {selectedIds.map((id) => {
                const item = INTERESTS.find((i) => i.id === id);
                return (
                  <option key={id} value={id}>
                    {item?.name}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {INTERESTS.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedIds.includes(card.id);
            const isPrimary = primaryInterest === card.id;

            return (
              <div
                key={card.id}
                onClick={() => toggleInterest(card.id)}
                className={`relative p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer select-none group ${
                  isSelected
                    ? `${card.borderColor} ${card.bgActive} shadow-lg shadow-indigo-950/30 scale-[1.01]`
                    : 'border-gray-800/80 bg-[#121522]/80 hover:border-gray-700 hover:bg-[#151827]'
                }`}
              >
                {/* Active Checkmark Pill */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {isPrimary && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                        Primary
                      </span>
                    )}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                {/* Card Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
                    isSelected ? 'bg-indigo-500/20 ' + card.color : 'bg-[#181c2b] text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-white mb-1.5 tracking-tight">
                  {card.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action Toolbar */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={handleSaveAndStart}
            disabled={isSubmitting || selectedIds.length === 0}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>Start Learning ({selectedIds.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/career-match')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#141724] hover:bg-[#191d2d] border border-gray-800 text-gray-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Choose a Career Goal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setQuizStep(0);
              setAnswers([]);
              setAiRecommendation(null);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-violet-950/40 hover:bg-violet-900/40 border border-violet-800/50 text-violet-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4 text-violet-400" />
            <span>Discover My Interests with AI</span>
          </button>
        </div>
      </main>

      {/* AI Questionnaire Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="bg-[#121522] border border-gray-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {!aiRecommendation ? (
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
                  <Bot className="w-4 h-4" /> AI Persona Calibrator &bull; Question {quizStep + 1} of 5
                </div>

                <div className="w-full bg-gray-800 h-1.5 rounded-full mb-6">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((quizStep + 1) / AI_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                <h3 className="text-lg font-bold text-white mb-5 leading-snug">
                  {AI_QUESTIONS[quizStep].question}
                </h3>

                <div className="space-y-3">
                  {AI_QUESTIONS[quizStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAnswerQuestion(opt.recommended)}
                      className="w-full p-4 rounded-xl bg-[#171b29] hover:bg-violet-950/30 border border-gray-800 hover:border-violet-500/40 text-left transition-all flex items-center gap-3.5 group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {opt.emoji}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-gray-200 group-hover:text-white">
                        {opt.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Recommendation</h3>
                <div className="inline-block my-3 px-4 py-1.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 font-bold text-sm">
                  {aiRecommendation.role}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-6">
                  {aiRecommendation.reasoning}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleApplyRecommendation}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply & Set as Primary</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-3 rounded-xl border border-gray-800 hover:bg-gray-800/50 text-gray-400 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestsPage;
