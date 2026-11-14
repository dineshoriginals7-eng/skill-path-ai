import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';

// Real Page Implementations
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import InterestsPage from './pages/onboarding/InterestsPage';
import AssessmentPage from './pages/assessment/AssessmentPage';
import SkillsPage from './pages/skills/SkillsPage';
import CareerMatchPage from './pages/skills/CareerMatchPage';
import RoadmapPage from './pages/roadmap/RoadmapPage';
import MentorPage from './pages/mentor/MentorPage';
import InsightsPage from './pages/insights/InsightsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AssessmentResultsPage from './pages/assessment/AssessmentResultsPage';
import ModulePage from './pages/roadmap/ModulePage';
import ProgressPage from './pages/progress/ProgressPage';

// Placeholder pages (not yet fully built)
import {
  AboutPage,
  HowItWorksPage,
  SettingsPage,
  ProfilePage,
} from './pages/placeholders';


// ==========================================
// Protected Route Guard
// ==========================================
interface RouteGuardProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: RouteGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center text-neutral-300 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-neutral-400">Loading SkillPath AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to /onboarding if user hasn't completed onboarding
  const isOnboardingComplete = Boolean(
    user?.onboarding_complete === true ||
    (typeof user?.onboarding_complete === 'string' &&
      (user?.onboarding_complete === 'true' || user?.onboarding_complete === 'completed'))
  );

  if (!isOnboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

// ==========================================
// Public Auth Route Guard (Redirect if logged in)
// ==========================================
export function AuthRoute({ children }: RouteGuardProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    const isOnboardingComplete = Boolean(
      user?.onboarding_complete === true ||
      (typeof user?.onboarding_complete === 'string' &&
        (user?.onboarding_complete === 'true' || user?.onboarding_complete === 'completed'))
    );

    return <Navigate to={isOnboardingComplete ? '/dashboard' : '/onboarding'} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

// ==========================================
// Admin Route Guard
// ==========================================
export function AdminRoute({ children }: RouteGuardProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

// ==========================================
// Main App Component with React Router Setup
// ==========================================
export function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#141414',
            color: '#FFFFFF',
            border: '1px solid #292929',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#FFFFFF',
              secondary: '#141414',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#141414',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes with PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
        </Route>

        {/* Auth Routes (Guest Only) */}
        <Route element={<AuthRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        {/* Protected App Routes with AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/interests" element={<InterestsPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/assessment/:id/results" element={<AssessmentResultsPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/career-match" element={<CareerMatchPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/roadmap/module/:id" element={<ModulePage />} />
            <Route path="/mentor" element={<MentorPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
          </Route>
        </Route>

        {/* Catch-all 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
