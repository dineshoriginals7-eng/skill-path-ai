import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Brain,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  Zap,
  Award,
  BookOpen
} from 'lucide-react';
import { authStore } from '../../store/authStore';

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms & privacy policy',
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
      terms: true,
    },
  });

  const passwordValue = watch('password', '');

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    if (!passwordValue) return { score: 0, label: 'None', color: 'bg-gray-800' };
    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  }, [passwordValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authStore.register({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created! Setting up your learning cockpit...');
      navigate('/onboarding');
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Registration failed. Try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090909] text-white flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Left Column - 60% Form */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between p-6 sm:p-10 lg:p-16 z-10 overflow-y-auto">
        {/* Header */}
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
            <Zap className="w-3.5 h-3.5 text-white" />
            Adaptive Skill Engine
          </span>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              Start your personalized learning path
            </h1>
            <p className="text-sm text-[#A1A1AA] mt-2">
              Join thousands of engineers accelerating their careers with real-time competency assessments.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#A1A1AA] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  {...register('full_name')}
                  placeholder="e.g. Alex Chen"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#171717] border ${
                    errors.full_name ? 'border-red-500/70 focus:border-red-500' : 'border-[#292929] focus:border-white'
                  } rounded-xl text-sm text-white placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all`}
                />
              </div>
              {errors.full_name && (
                <p className="text-xs text-red-400 mt-1 font-medium">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#A1A1AA] mb-1.5 uppercase tracking-wider">
                Work or Academic Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="alex@university.edu or alex@company.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#171717] border ${
                    errors.email ? 'border-red-500/70 focus:border-red-500' : 'border-[#292929] focus:border-white'
                  } rounded-xl text-sm text-white placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#A1A1AA] mb-1.5 uppercase tracking-wider">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="At least 8 chars, 1 uppercase & 1 number"
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

              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#71717A]">Strength:</span>
                    <span
                      className={`font-semibold ${
                        passwordStrength.score === 3
                          ? 'text-emerald-400'
                          : passwordStrength.score === 2
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 h-1">
                    <div
                      className={`rounded-full transition-colors ${
                        passwordStrength.score >= 1 ? passwordStrength.color : 'bg-[#292929]'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-colors ${
                        passwordStrength.score >= 2 ? passwordStrength.color : 'bg-[#292929]'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-colors ${
                        passwordStrength.score >= 3 ? passwordStrength.color : 'bg-[#292929]'
                      }`}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-xs text-red-400 mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#A1A1AA] mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-[#171717] border ${
                    errors.confirm_password
                      ? 'border-red-500/70 focus:border-red-500'
                      : 'border-[#292929] focus:border-white'
                  } rounded-xl text-sm text-white placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#71717A] hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-xs text-red-400 mt-1 font-medium">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('terms')}
                  className="mt-0.5 h-4 w-4 rounded border-[#292929] bg-[#171717] text-white focus:ring-white focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-[#A1A1AA] leading-snug">
                  I agree to SkillPath AI&apos;s{' '}
                  <span className="text-white hover:underline">Terms of Service</span> and{' '}
                  <span className="text-white hover:underline">Privacy Policy</span>, including consent for AI skill modeling.
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-red-400 mt-1 font-medium">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Configuring your profile...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-[#292929] text-center">
            <p className="text-sm text-[#A1A1AA]">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:underline font-medium ml-1">
                Sign in &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-[#71717A] pt-4 border-t border-[#292929]">
          <span>Protected by SkillPath AI Enterprise Security & 256-bit encryption.</span>
        </div>
      </div>

      {/* Right Column - 40% Decorative Info */}
      <div className="hidden lg:flex w-full lg:w-[40%] bg-[#141414] border-l border-[#292929] p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171717] border border-[#292929] text-[#A1A1AA] text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5 text-white" /> What happens next?
          </div>
          <h2 className="text-2xl xl:text-3xl font-heading font-bold text-white leading-tight">
            An intelligent 3-minute setup customized to your background.
          </h2>

          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center shrink-0 border border-[#292929]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">1. Share Your Context</h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5 leading-relaxed">
                  Provide your academic status, current courses, and projects to seed your profile baseline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center shrink-0 border border-[#292929]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">2. AI Diagnostic Assessment</h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5 leading-relaxed">
                  Take a quick 5-question targeted assessment to pinpoint strengths and specific concept gaps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center shrink-0 border border-[#292929]">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">3. Autonomous Roadmap Generation</h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5 leading-relaxed">
                  Receive a milestone-driven learning roadmap targeted specifically to your dream career goal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="relative z-10 p-5 rounded-xl bg-[#171717] border border-[#292929]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center shrink-0 border border-[#292929]">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">No generic video marathons</p>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                Every exercise, reading, and assessment adapts in real-time as you solve problems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
