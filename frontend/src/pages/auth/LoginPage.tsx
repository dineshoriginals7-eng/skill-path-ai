import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Brain,
  Code2,
  Cpu,
  Compass,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { authStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authStore.login(data.email, data.password);
      toast.success('Welcome back to SkillPath AI!');
      if (result?.onboarding_complete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'demo@skillpath.ai');
    setValue('password', 'Demo@1234');
    toast.success('Demo credentials loaded!');
  };

  return (
    <div className="min-h-screen w-full bg-[#090909] text-white flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Left Column - 60% Login Form */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between p-6 sm:p-10 lg:p-16 z-10">
        {/* Header / Brand */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-black group-hover:scale-105 transition-transform shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-heading font-extrabold tracking-tight text-white flex items-center gap-1">
                SkillPath <span className="text-[#A1A1AA]">AI</span>
              </span>
              <span className="block text-[11px] text-[#A1A1AA] -mt-1 font-mono tracking-wider">LEARNER INTELLIGENCE</span>
            </div>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#141414] text-[#A1A1AA] border border-[#292929]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Next-Gen Adaptive Learning
          </span>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-6">
          {/* Demo Credentials Banner */}
          <div
            onClick={handleFillDemo}
            className="mb-8 p-4 rounded-xl border border-[#292929] bg-[#141414] hover:border-neutral-500 cursor-pointer transition-all duration-200 group shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/5 border border-[#292929] text-white group-hover:bg-white/10 transition-colors">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-mono font-semibold text-white tracking-wide uppercase flex items-center gap-1.5">
                    Fast Demo Access
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#171717] border border-[#292929] text-[#A1A1AA] normal-case">Click to autofill</span>
                  </div>
                  <div className="text-xs text-[#A1A1AA] mt-0.5 font-mono">
                    demo@skillpath.ai <span className="text-[#525252]">/</span> Demo@1234
                  </div>
                </div>
              </div>
              <span className="text-xs text-white font-medium group-hover:translate-x-0.5 transition-transform">
                Auto-fill &rarr;
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              Sign in to your learning cockpit
            </h1>
            <p className="text-sm text-[#A1A1AA] mt-2">
              Accelerate your engineering journey with personalized roadmaps and continuous AI diagnostics.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#A1A1AA] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#171717] border ${
                    errors.email ? 'border-red-500/70 focus:border-red-500' : 'border-[#292929] focus:border-white'
                  } rounded-xl text-sm text-white placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#A1A1AA] hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-11 py-2.5 bg-[#171717] border ${
                    errors.password ? 'border-red-500/70 focus:border-red-500' : 'border-[#292929] focus:border-white'
                  } rounded-xl text-sm text-white placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#71717A] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Signing into cockpit...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-[#292929] text-center">
            <p className="text-sm text-[#A1A1AA]">
              New to SkillPath AI?{' '}
              <Link to="/register" className="text-white hover:underline font-medium ml-1">
                Create your learner profile &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-[#71717A] flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#292929]">
          <span>&copy; {new Date().getFullYear()} SkillPath AI. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-white cursor-pointer">System Status</span>
          </div>
        </div>
      </div>

      {/* Right Column - 40% Decorative Showcase */}
      <div className="hidden lg:flex w-full lg:w-[40%] bg-[#141414] border-l border-[#292929] p-12 flex-col justify-between relative overflow-hidden">
        {/* Top Badges Floating Presentation */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171717] border border-[#292929] text-[#A1A1AA] text-xs font-mono mb-6">
            <GraduationCap className="w-3.5 h-3.5 text-white" /> Autonomous Learning Trajectory
          </div>
          <h2 className="text-2xl xl:text-3xl font-heading font-bold text-white leading-tight">
            Tailored engineering pathways engineered with live AI diagnostics.
          </h2>
        </div>

        {/* Center Floating Skill Matrix Badges */}
        <div className="relative z-10 my-8 space-y-3.5">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#292929] shadow-sm flex items-center justify-between hover:border-neutral-500 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#292929] text-white flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Full Stack AI Agent</h4>
                <p className="text-xs text-[#A1A1AA]">Target Role &bull; 84% Ready</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#292929] shadow-sm flex items-center justify-between ml-4 hover:border-neutral-500 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#292929] text-white flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">React 19 & Python Async</h4>
                <p className="text-xs text-[#A1A1AA]">Core Foundations &bull; 88/100</p>
              </div>
            </div>
            <div className="flex items-center text-xs text-white font-medium">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" /> Mastered
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#292929] shadow-sm flex items-center justify-between hover:border-neutral-500 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#292929] text-white flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Adaptive Module Next</h4>
                <p className="text-xs text-[#A1A1AA]">RAG Vector Pipelines &bull; 45m</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
              Active
            </span>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="relative z-10 pt-6 border-t border-[#292929]">
          <p className="text-sm text-[#A1A1AA] italic leading-relaxed">
            &ldquo;SkillPath AI transformed how I prepare for tech roles. Rather than watching 50 hours of generic tutorials, it identified my exact distributed systems gap and built a direct pathway to solve it.&rdquo;
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
              EK
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Elena Rostova</p>
              <p className="text-[11px] text-[#A1A1AA]">Software Engineer @ CloudScale AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
