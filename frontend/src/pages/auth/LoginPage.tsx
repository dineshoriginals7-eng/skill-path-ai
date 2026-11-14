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
    <div className="min-h-screen w-full bg-[#0b0d13] text-gray-100 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />

      {/* Left Column - 60% Login Form */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between p-6 sm:p-10 lg:p-16 z-10">
        {/* Header / Brand */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                SkillPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
              </span>
              <span className="block text-[11px] text-gray-400 -mt-1 font-mono tracking-wider">LEARNER INTELLIGENCE</span>
            </div>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Next-Gen Adaptive Learning
          </span>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-6">
          {/* Demo Credentials Banner */}
          <div
            onClick={handleFillDemo}
            className="mb-8 p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900/60 to-violet-950/40 backdrop-blur-md cursor-pointer hover:border-indigo-400/60 transition-all duration-200 group shadow-lg shadow-indigo-950/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500/30 transition-colors">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-indigo-300 tracking-wide uppercase flex items-center gap-1.5">
                    Fast Demo Access
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 normal-case">Click to autofill</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-0.5 font-mono">
                    demo@skillpath.ai <span className="text-gray-500">/</span> Demo@1234
                  </div>
                </div>
              </div>
              <span className="text-xs text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                Auto-fill &rarr;
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign in to your learning cockpit
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Accelerate your engineering journey with personalized roadmaps and continuous AI diagnostics.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#141721] border ${
                    errors.email ? 'border-red-500/70 focus:border-red-500' : 'border-gray-800 focus:border-indigo-500'
                  } rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-11 py-2.5 bg-[#141721] border ${
                    errors.password ? 'border-red-500/70 focus:border-red-500' : 'border-gray-800 focus:border-indigo-500'
                  } rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
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
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0b0d13] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          <div className="mt-8 pt-6 border-t border-gray-800/80 text-center">
            <p className="text-sm text-gray-400">
              New to SkillPath AI?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium ml-1">
                Create your learner profile &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-gray-600 flex flex-wrap items-center justify-between gap-4 pt-6">
          <span>&copy; {new Date().getFullYear()} SkillPath AI. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-gray-400 cursor-pointer">System Status</span>
          </div>
        </div>
      </div>

      {/* Right Column - 40% Decorative Showcase */}
      <div className="hidden lg:flex w-full lg:w-[40%] bg-gradient-to-br from-[#121522] via-[#0f121d] to-[#151728] border-l border-gray-800/70 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(165, 180, 252, 0.4) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Glow Spheres */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-indigo-600/20 blur-[100px]" />

        {/* Top Badges Floating Presentation */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <GraduationCap className="w-3.5 h-3.5" /> Autonomous Learning Trajectory
          </div>
          <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight">
            Tailored engineering pathways engineered with live AI diagnostics.
          </h2>
        </div>

        {/* Center Floating Skill Matrix Badges */}
        <div className="relative z-10 my-8 space-y-3.5">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl bg-[#181c2b]/80 border border-gray-800/80 backdrop-blur-md shadow-xl flex items-center justify-between transform hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Full Stack AI Agent</h4>
                <p className="text-xs text-gray-400">Target Role &bull; 84% Ready</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl bg-[#181c2b]/80 border border-gray-800/80 backdrop-blur-md shadow-xl flex items-center justify-between ml-4 transform hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">React 19 & Python Async</h4>
                <p className="text-xs text-gray-400">Core Foundations &bull; 88/100</p>
              </div>
            </div>
            <div className="flex items-center text-xs text-indigo-400 font-medium">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" /> Mastered
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl bg-[#181c2b]/80 border border-gray-800/80 backdrop-blur-md shadow-xl flex items-center justify-between transform hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Adaptive Module Next</h4>
                <p className="text-xs text-gray-400">RAG Vector Pipelines &bull; 45m</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
              Active
            </span>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="relative z-10 pt-6 border-t border-gray-800/80">
          <p className="text-sm text-gray-300 italic leading-relaxed">
            &ldquo;SkillPath AI transformed how I prepare for tech roles. Rather than watching 50 hours of generic tutorials, it identified my exact distributed systems gap and built a direct pathway to solve it.&rdquo;
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-xs ring-2 ring-indigo-500/30">
              EK
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Elena Rostova</p>
              <p className="text-[11px] text-gray-400">Software Engineer @ CloudScale AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
