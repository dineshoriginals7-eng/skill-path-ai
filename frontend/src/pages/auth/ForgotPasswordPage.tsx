import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Brain,
  Mail,
  ArrowLeft,
  ArrowRight,
  KeyRound
} from 'lucide-react';
import api from '../../services/api';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    try {
      await api.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Reset instructions sent!');
    } catch (err: any) {
      toast.error('Unable to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0d13] text-gray-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                SkillPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
              </span>
              <span className="block text-[10px] text-gray-400 -mt-1 font-mono tracking-wider">RECOVERY PORTAL</span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#121522]/90 border border-gray-800/80 rounded-2xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative">
          {!isSubmitted ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                <KeyRound className="w-6 h-6" />
              </div>

              <h1 className="text-2xl font-bold text-white tracking-tight">Reset your password</h1>
              <p className="text-sm text-gray-400 mt-2">
                Enter your registered email address and we will send you a secure link to reset your account password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                    Account Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="alex@company.com"
                      className={`w-full pl-10 pr-4 py-2.5 bg-[#171b29] border ${
                        errors.email ? 'border-red-500/70 focus:border-red-500' : 'border-gray-800 focus:border-indigo-500'
                      } rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1 font-medium">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Instructions</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 animate-pulse-soft">
                <Mail className="w-7 h-7" />
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">Check your inbox</h2>
              <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                We sent password recovery instructions to:
              </p>
              <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 font-mono text-xs">
                {submittedEmail}
              </div>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                If an account exists under this email address, you will receive a reset link within a minute. Be sure to check your spam or promotions folder.
              </p>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline-offset-4 hover:underline"
              >
                Didn&apos;t get the email? Try another address
              </button>
            </div>
          )}

          {/* Back to Login link */}
          <div className="mt-8 pt-6 border-t border-gray-800/80 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
