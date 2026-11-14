import { BrainCircuit, Zap, Target, TrendingUp, ChevronRight, Star, Users, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "AI-Powered Assessment",
    description: "Adaptive examinations that evaluate your real knowledge — not just what you think you know.",
    color: "text-brand-400",
    bg: "bg-brand-500/10",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Skill Gap Analysis",
    description: "Precise identification of strengths, weaknesses, and missing skills for your career goals.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Adaptive Roadmap",
    description: "A personalized learning path that evolves with your progress and actual performance.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "10 Specialized AI Agents",
    description: "A multi-agent system coordinating assessment, evaluation, mentoring, and intelligence.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const steps = [
  { step: "01", title: "Build Your Profile", desc: "Tell us about your background, skills, and goals." },
  { step: "02", title: "Get Evaluated", desc: "Complete an adaptive assessment across your target skills." },
  { step: "03", title: "See Your Gaps", desc: "Understand exactly where you stand with evidence-backed analysis." },
  { step: "04", title: "Follow Your Roadmap", desc: "Learn what you actually need — nothing more, nothing less." },
  { step: "05", title: "Track Growth", desc: "Watch your skills improve through continuous reassessment." },
];

const stats = [
  { label: "Learning Paths", value: "50+" },
  { label: "Skills Tracked", value: "100+" },
  { label: "AI Agents", value: "10" },
  { label: "Career Roles", value: "15+" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT text-gray-100 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-soft" />
            Evaluation-First Learning Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight animate-slide-up">
            Learn What You{' '}
            <span className="gradient-text">Actually Need</span>
            <br />to Reach Your Goals
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up">
            SkillPath AI evaluates your existing knowledge, identifies real skill gaps, and creates 
            a personalized learning journey — powered by 10 specialized AI agents that understand 
            you as an individual learner.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
              Start Your Free Journey
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/how-it-works" className="btn-secondary text-lg px-8 py-4 inline-flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              How It Works
            </Link>
          </div>

          {/* Demo note */}
          <p className="text-sm text-gray-500 mt-6">
            No credit card required · Full demo mode available · Start in 2 minutes
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-surface-border py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-display font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Built for <span className="gradient-text">Intelligent Learning</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every feature is designed around one principle: understand the learner first, then guide them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card-hover p-6 rounded-2xl">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center ${f.color} mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-surface-100/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Your Learning <span className="gradient-text">Journey</span>
            </h2>
          </div>

          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center font-display font-bold text-white text-lg group-hover:shadow-glow-sm transition-shadow">
                  {s.step}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-gray-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Callout */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl border border-brand-500/20 bg-gradient-card p-10 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <BrainCircuit className="w-8 h-8 text-brand-400" />
                <span className="text-brand-300 font-semibold">Multi-Agent AI Architecture</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                10 Specialized AI Agents<br />Working For You
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl">
                From interest discovery to document analysis, skill assessment to career matching — 
                each agent has a defined role and communicates through structured data, not generic chat.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {["Interest Discovery", "Document Analysis", "Assessment Generation", "Evaluation", 
                  "Skill Gap Analysis", "Career Matching", "Roadmap Builder", "AI Mentor", 
                  "Progress Analysis", "Learner Intelligence"].map((agent) => (
                  <span key={agent} className="px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/25 text-brand-300 text-sm">
                    {agent}
                  </span>
                ))}
              </div>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                Experience It Now
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Ready to Understand<br />
            <span className="gradient-text">Your True Skill Level?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join SkillPath AI and get an honest, evidence-based picture of where you are — 
            and a clear path to where you want to go.
          </p>
          <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
            <Award className="w-5 h-5" />
            Start Free Assessment
          </Link>
        </div>
      </section>
    </div>
  );
}
