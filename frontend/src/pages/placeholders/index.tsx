import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  LogIn,
  UserPlus,
  KeyRound,
  LayoutDashboard,
  Compass,
  CheckCircle2,
  BarChart3,
  Target,
  BrainCircuit,
  Lightbulb,
  TrendingUp,
  Settings,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';

interface PlaceholderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionLink?: string;
}

export function PagePlaceholder({
  title,
  subtitle,
  icon,
  actionText = 'Go to Dashboard',
  actionLink = '/dashboard',
}: PlaceholderProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 animate-fade-in">
      <div className="card max-w-lg w-full text-center relative overflow-hidden p-8 border-brand-500/20 shadow-glow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mx-auto flex items-center justify-center mb-5">
          {icon || <Sparkles className="w-7 h-7" />}
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-2">{title}</h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
          {subtitle}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to={actionLink} className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Public & Info Placeholders
export const AboutPage = () => (
  <PagePlaceholder
    title="About SkillPath AI"
    subtitle="SkillPath AI is an evaluation-first platform built with 10 autonomous AI agents to diagnose knowledge gaps and generate personalized learning journeys."
    icon={<BookOpen className="w-7 h-7" />}
    actionText="Back to Home"
    actionLink="/"
  />
);

export const HowItWorksPage = () => (
  <PagePlaceholder
    title="How It Works"
    subtitle="Learn about our 5-step journey: Profile onboarding, adaptive skill evaluation, gap analysis, dynamic roadmaps, and continuous AI mentorship."
    icon={<HelpCircle className="w-7 h-7" />}
    actionText="Get Started"
    actionLink="/register"
  />
);

// Auth Placeholders (used until specialized auth pages are loaded)
export const LoginPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center p-6">
    <div className="card max-w-md w-full p-8 border-surface-border">
      <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
        <LogIn className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold font-display text-center text-white mb-2">Sign In</h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Sign in to access your personalized learning journey and AI mentor.
      </p>
      <div className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <input type="email" placeholder="learner@example.com" className="input-field" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" placeholder="••••••••" className="input-field" />
        </div>
        <div className="flex items-center justify-between text-xs">
          <Link to="/forgot-password" className="text-brand-400 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Link to="/dashboard" className="btn-primary w-full justify-center">
          Sign In
        </Link>
      </div>
      <p className="text-center text-xs text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:underline">
          Create account
        </Link>
      </p>
    </div>
  </div>
);

export const RegisterPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center p-6">
    <div className="card max-w-md w-full p-8 border-surface-border">
      <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
        <UserPlus className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold font-display text-center text-white mb-2">Create Account</h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Join SkillPath AI to start your evaluation-first learning experience.
      </p>
      <div className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input type="text" placeholder="Ada Lovelace" className="input-field" />
        </div>
        <div>
          <label className="label">Email Address</label>
          <input type="email" placeholder="ada@example.com" className="input-field" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" placeholder="••••••••" className="input-field" />
        </div>
        <Link to="/onboarding" className="btn-primary w-full justify-center">
          Get Started Free
        </Link>
      </div>
      <p className="text-center text-xs text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  </div>
);

export const ForgotPasswordPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center p-6">
    <div className="card max-w-md w-full p-8 border-surface-border">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
        <KeyRound className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold font-display text-center text-white mb-2">Reset Password</h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Enter your email address and we&apos;ll send you instructions to reset your password.
      </p>
      <div className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <input type="email" placeholder="learner@example.com" className="input-field" />
        </div>
        <button type="button" className="btn-primary w-full justify-center">
          Send Reset Link
        </button>
      </div>
      <p className="text-center text-xs text-gray-500 mt-6">
        Remembered your password?{' '}
        <Link to="/login" className="text-brand-400 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  </div>
);

// Protected App Placeholders
export const DashboardPage = () => (
  <PagePlaceholder
    title="Learner Dashboard"
    subtitle="Overview of your skill proficiency, current streak, active roadmap modules, and real-time AI recommendations."
    icon={<LayoutDashboard className="w-7 h-7" />}
    actionText="Explore Roadmap"
    actionLink="/roadmap"
  />
);

export const OnboardingPage = () => (
  <PagePlaceholder
    title="Learner Onboarding"
    subtitle="Configure your academic background, technical skills, and career aspirations to initialize your AI learner profile."
    icon={<Compass className="w-7 h-7" />}
    actionText="Continue Setup"
    actionLink="/interests"
  />
);

export const ProfilePage = () => (
  <PagePlaceholder
    title="Learner Profile"
    subtitle="Manage your education, projects, certifications, work experience, and primary career goals."
    icon={<CheckCircle2 className="w-7 h-7" />}
    actionText="Edit Profile"
    actionLink="/onboarding"
  />
);

export const InterestsPage = () => (
  <PagePlaceholder
    title="Skill Interests & Categories"
    subtitle="Select the technical domains, languages, and frameworks you want to master."
    icon={<Target className="w-7 h-7" />}
    actionText="Take Assessment"
    actionLink="/assessment"
  />
);

export const AssessmentPage = () => (
  <PagePlaceholder
    title="Skill Assessment"
    subtitle="Adaptive tests evaluating your practical knowledge, debugging, and problem solving."
    icon={<ClipboardList className="w-7 h-7" />}
    actionText="Start Diagnostic"
    actionLink="/assessment/initial"
  />
);

export const AssessmentResultsPage = () => (
  <PagePlaceholder
    title="Assessment Results"
    subtitle="Comprehensive evaluation breakdown with strength level, evidence tags, and recommended next steps."
    icon={<BarChart3 className="w-7 h-7" />}
    actionText="View Skill Gap"
    actionLink="/skills"
  />
);

export const SkillsPage = () => (
  <PagePlaceholder
    title="Skill Analysis & Gap Matrix"
    subtitle="Detailed view of verified skills, proficiency levels, critical weaknesses, and growth trajectories."
    icon={<BarChart3 className="w-7 h-7" />}
    actionText="Career Match"
    actionLink="/career-match"
  />
);

export const CareerMatchPage = () => (
  <PagePlaceholder
    title="Career Role Match & Readiness"
    subtitle="Match percentages and requirements for roles like Full Stack Engineer, ML Engineer, and Cloud Architect."
    icon={<Target className="w-7 h-7" />}
    actionText="Generate Roadmap"
    actionLink="/roadmap"
  />
);

export const RoadmapPage = () => (
  <PagePlaceholder
    title="Personalized Learning Roadmap"
    subtitle="Adaptive, multi-agent generated learning path tailored precisely to fill your verified skill gaps."
    icon={<Compass className="w-7 h-7" />}
    actionText="Start Next Module"
    actionLink="/dashboard"
  />
);

export const ModulePage = () => (
  <PagePlaceholder
    title="Learning Module"
    subtitle="Interactive learning materials, exercises, reading resources, and mini-projects."
    icon={<BookOpen className="w-7 h-7" />}
    actionText="Back to Roadmap"
    actionLink="/roadmap"
  />
);

export const MentorPage = () => (
  <PagePlaceholder
    title="AI Mentor Chat"
    subtitle="Personalized mentoring agent with full awareness of your skill evaluations and learning roadmap."
    icon={<BrainCircuit className="w-7 h-7" />}
    actionText="Ask a Question"
    actionLink="/mentor"
  />
);

export const InsightsPage = () => (
  <PagePlaceholder
    title="Agent Insights & Intelligence"
    subtitle="Continuous feedback generated by our 10 specialized agents monitoring your learning behavior and velocity."
    icon={<Lightbulb className="w-7 h-7" />}
    actionText="Review Dashboard"
    actionLink="/dashboard"
  />
);

export const ProgressPage = () => (
  <PagePlaceholder
    title="Learning Progress & Velocity"
    subtitle="Track historical score improvements, completed modules, hours spent, and consistency streaks."
    icon={<TrendingUp className="w-7 h-7" />}
    actionText="View Skills"
    actionLink="/skills"
  />
);

export const SettingsPage = () => (
  <PagePlaceholder
    title="Account & Preference Settings"
    subtitle="Configure notification preferences, AI agent settings, security keys, and data export options."
    icon={<Settings className="w-7 h-7" />}
    actionText="Go to Dashboard"
    actionLink="/dashboard"
  />
);

export const AdminDashboard = () => (
  <PagePlaceholder
    title="Admin & System Dashboard"
    subtitle="Platform-wide learner metrics, question bank management, agent execution logs, and role configurations."
    icon={<ShieldAlert className="w-7 h-7" />}
    actionText="Return to App"
    actionLink="/dashboard"
  />
);
