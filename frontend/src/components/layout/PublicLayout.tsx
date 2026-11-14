import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BrainCircuit, Menu, X, ArrowRight, Globe, Share2, Sparkles } from 'lucide-react';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-DEFAULT text-gray-100 selection:bg-brand-600 selection:text-white">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-DEFAULT/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-violet-500 flex items-center justify-center shadow-brand text-white transition-transform group-hover:scale-105">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="font-display font-bold text-xl text-white tracking-tight flex items-center gap-1">
                <span>SkillPath</span>
                <span className="text-brand-400 font-extrabold">AI</span>
              </div>
              <span className="text-[10px] text-gray-400 tracking-wider font-mono uppercase">
                Adaptive Learning
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                className={({ isActive }) =>
                  `transition-colors hover:text-white ${
                    isActive ? 'text-brand-400 font-semibold' : ''
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-surface-200 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-surface-100 text-gray-300 hover:text-white border border-surface-border"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-surface-border bg-surface-100 px-4 py-6 space-y-4 animate-slide-up">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:bg-surface-200 hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-surface-border flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary w-full justify-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full justify-center"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Slot */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface-100/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand */}
            <div className="space-y-4 md:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-lg text-white">SkillPath AI</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">
                Evaluation-first, multi-agent AI learning platform that diagnoses real knowledge gaps and builds personalized career roadmaps.
              </p>
              <div className="flex items-center gap-3 text-gray-400">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="GitHub">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Twitter">
                  <Share2 className="w-4 h-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="LinkedIn">
                  <Sparkles className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Platform */}
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300 mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/#features" className="hover:text-white transition-colors">AI Assessment</Link></li>
                <li><Link to="/#features" className="hover:text-white transition-colors">Roadmap Generator</Link></li>
                <li><Link to="/#features" className="hover:text-white transition-colors">Multi-Agent Intelligence</Link></li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300 mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Career Tracks</a></li>
                <li><a href="#support" className="hover:text-white transition-colors">Support Center</a></li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300 mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Data Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-surface-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} SkillPath AI. All rights reserved.</p>
            <p className="flex items-center gap-1 text-gray-400">
              Built for Google Fest with <span className="text-brand-400">Multi-Agent Intelligence</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
