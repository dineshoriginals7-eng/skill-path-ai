import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Code2,
  ClipboardCheck,
  History,
  BarChart3,
  Target,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isDemo = useAppStore((state) => state.isDemo);

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [{ name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, exact: true }],
    },
    {
      title: 'Learning',
      items: [
        { name: 'My Roadmap', to: '/roadmap', icon: Map, exact: true },
        { name: 'Learning Modules', to: '/roadmap#modules', icon: BookOpen },
        { name: 'Practice', to: '/assessment?type=practice', icon: Code2 },
      ],
    },
    {
      title: 'Assessment',
      items: [
        { name: 'Take Assessment', to: '/assessment', icon: ClipboardCheck, exact: true },
        { name: 'Assessment History', to: '/assessment?tab=history', icon: History },
      ],
    },
    {
      title: 'Analysis',
      items: [
        { name: 'My Skills', to: '/skills', icon: BarChart3 },
        { name: 'Career Match', to: '/career-match', icon: Target },
        { name: 'Progress', to: '/progress', icon: TrendingUp },
      ],
    },
    {
      title: 'AI',
      items: [
        { name: 'AI Mentor', to: '/mentor', icon: BrainCircuit },
        { name: 'Insights', to: '/insights', icon: Lightbulb },
      ],
    },
    {
      title: 'Account',
      items: [{ name: 'Settings', to: '/settings', icon: Settings }],
    },
  ];

  if (user?.is_admin) {
    navSections.push({
      title: 'Administration',
      items: [{ name: 'Admin Dashboard', to: '/admin', icon: ShieldAlert }],
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/roadmap')) return 'Learning Roadmap';
    if (path.startsWith('/assessment')) return 'Assessments';
    if (path.startsWith('/skills')) return 'My Skills & Evaluation';
    if (path.startsWith('/career-match')) return 'Career Readiness & Roles';
    if (path.startsWith('/progress')) return 'Learning Progress';
    if (path.startsWith('/mentor')) return 'AI Mentor Chat';
    if (path.startsWith('/insights')) return 'Agent Insights & Intelligence';
    if (path.startsWith('/settings')) return 'Account Settings';
    if (path.startsWith('/profile')) return 'Learner Profile';
    if (path.startsWith('/interests')) return 'Skill Interests';
    if (path.startsWith('/onboarding')) return 'Onboarding';
    if (path.startsWith('/admin')) return 'Admin Dashboard';
    return 'SkillPath AI';
  };

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#171717] border-r border-[#292929]">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#292929]">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-base text-white leading-tight flex items-center gap-1.5">
              <span>SkillPath</span>
              <span className="text-[#A1A1AA]">AI</span>
            </div>
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-mono">
              Intelligence
            </span>
          </div>
        </NavLink>
        {isDemo && (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#141414] text-[#A1A1AA] border border-[#292929]">
            DEMO
          </span>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-[11px] font-medium tracking-wider text-[#A1A1AA] uppercase font-mono">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isExact = item.exact;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    end={isExact}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-3.5 border-t border-[#292929] bg-[#141414]">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#171717] border border-[#292929]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-xs font-bold shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'Learner'}
              </p>
              <p className="text-[11px] text-[#A1A1AA] truncate">
                {user?.email || 'learner@skillpath.ai'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#202020] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#090909] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full z-50">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#090909]/90 backdrop-blur border-b border-[#292929] flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#171717] border border-[#292929] text-[#A1A1AA] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-heading font-bold text-white tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            {isDemo && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#141414] text-[#A1A1AA] border border-[#292929]">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Demo Simulation Mode</span>
              </div>
            )}

            <button
              type="button"
              title="Notifications"
              className="p-2 rounded-xl bg-[#171717] hover:bg-[#202020] text-[#A1A1AA] hover:text-white border border-[#292929] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white ring-2 ring-[#171717]" />
            </button>

            <NavLink
              to="/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#292929] text-xs font-medium text-white transition-colors"
            >
              <span>Profile</span>
            </NavLink>
          </div>
        </header>

        {/* Scrollable Main Content Slot */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#090909]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
