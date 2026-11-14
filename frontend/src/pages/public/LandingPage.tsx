import { BrainCircuit, Zap, Target, TrendingUp, ChevronRight, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <BrainCircuit className="w-5 h-5 text-white" />,
    title: "AI-Powered Assessment",
    description: "Adaptive examinations that evaluate your real knowledge — not just what you think you know.",
  },
  {
    icon: <Target className="w-5 h-5 text-white" />,
    title: "Skill Gap Analysis",
    description: "Precise identification of strengths, weaknesses, and missing skills for your career goals.",
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-white" />,
    title: "Adaptive Roadmap",
    description: "A personalized learning path that evolves with your progress and actual performance.",
  },
  {
    icon: <Zap className="w-5 h-5 text-white" />,
    title: "10 Specialized AI Agents",
    description: "A multi-agent system coordinating assessment, evaluation, mentoring, and intelligence.",
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
    <div className="min-h-screen bg-[#090909] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle monochrome radial mask */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#292929] bg-[#141414] text-[#A1A1AA] text-xs font-mono mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-white" />
            Evaluation-First Learning Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 tracking-tight leading-tight animate-slide-up">
            Learn What You{' '}
            <span className="gradient-text">Actually Need</span>
            <br />to Reach Your Goals
          </h1>

          <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            SkillPath AI evaluates your existing knowledge, identifies real skill gaps, and creates 
            a personalized learning journey — powered by 10 specialized AI agents that understand 
            you as an individual learner.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2">
              Start Your Free Journey
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/how-it-works" className="btn-secondary text-base px-8 py-3.5 inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              How It Works
            </Link>
          </div>

          {/* Demo note */}
          <p className="text-xs text-[#71717A] mt-6 font-mono">
            No credit card required · Full demo mode available · Start in 2 minutes
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#292929] bg-[#090909] py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-heading font-extrabold text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 tracking-tight">
              Built for <span className="gradient-text">Intelligent Learning</span>
            </h2>
            <p className="text-[#A1A1AA] text-base max-w-xl mx-auto">
              Every feature is designed around one principle: understand the learner first, then guide them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card p-7 card-hover">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#292929] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#141414] border-y border-[#292929]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 tracking-tight">
              Your Learning <span className="gradient-text">Journey</span>
            </h2>
          </div>

          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-6 items-start p-6 rounded-2xl bg-[#171717] border border-[#292929] hover:border-neutral-500 transition-all">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center font-heading font-extrabold text-sm shadow-sm">
                  {s.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-heading font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-[#A1A1AA]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Callout */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl border border-[#292929] bg-[#141414] p-10 md:p-16 overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <BrainCircuit className="w-5 h-5 text-white" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">Multi-Agent AI Architecture</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 tracking-tight">
                10 Specialized AI Agents<br />Working For You
              </h2>
              <p className="text-[#A1A1AA] text-base mb-8 max-w-2xl leading-relaxed">
                From interest discovery to document analysis, skill assessment to career matching — 
                each agent has a defined role and communicates through structured data, not generic chat.
              </p>
              <div className="flex flex-wrap gap-2.5 mb-10">
                {["Interest Discovery", "Document Analysis", "Assessment Generation", "Evaluation", 
                  "Skill Gap Analysis", "Career Matching", "Roadmap Builder", "AI Mentor", 
                  "Progress Analysis", "Learner Intelligence"].map((agent) => (
                  <span key={agent} className="px-3 py-1 rounded-full bg-[#171717] border border-[#292929] text-[#A1A1AA] text-xs font-mono">
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
      <section className="py-24 px-6 text-center border-t border-[#292929]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 tracking-tight">
            Ready to Understand<br />
            <span className="gradient-text">Your True Skill Level?</span>
          </h2>
          <p className="text-[#A1A1AA] text-base mb-8 leading-relaxed">
            Join SkillPath AI and get an honest, evidence-based picture of where you are — 
            and a clear path to where you want to go.
          </p>
          <Link to="/register" className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2">
            <Award className="w-4 h-4" />
            Start Free Assessment
          </Link>
        </div>
      </section>
    </div>
  );
}
