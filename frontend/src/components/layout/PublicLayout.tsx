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
    <div className="min-h-screen flex flex-col bg-[#090909] text-white selection:bg-white selection:text-black">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#090909]/80 backdrop-blur-md border-b border-[#292929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black transition-transform group-hover:scale-105">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="font-heading font-extrabold text-xl text-white tracking-tight flex items-center gap-1">
                <span>SkillPath</span>
                <span className="text-[#A1A1AA]">AI</span>
              </div>
              <span className="text-[10px] text-[#A1A1AA] tracking-wider font-mono uppercase">
                Adaptive Learning
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                className={({ isActive }) =>
                  `transition-colors hover:text-white ${
                    isActive ? 'text-white font-semibold' : ''
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
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-[#171717] border border-transparent hover:border-[#292929] transition-all"
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
            className="md:hidden p-2 rounded-xl bg-[#171717] text-[#A1A1AA] hover:text-white border border-[#292929]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#292929] bg-[#141414] px-4 py-6 space-y-4 animate-slide-up">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-[#A1A1AA] hover:bg-[#171717] hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-[#292929] flex flex-col gap-2.5">
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
      <footer className="border-t border-[#292929] bg-[#090909] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand */}
            <div className="space-y-4 md:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <span className="font-heading font-extrabold text-lg text-white">SkillPath AI</span>
              </Link>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Evaluation-first, multi-agent AI learning platform that diagnoses real knowledge gaps and builds personalized career roadmaps.
              </p>
              <div className="flex items-center gap-3 text-[#A1A1AA]">
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
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm text-[#A1A1AA]">
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/#features" className="hover:text-white transition-colors">AI Assessment</Link></li>
                <li><Link to="/#features" className="hover:text-white transition-colors">Roadmap Generator</Link></li>
                <li><Link to="/#features" className="hover:text-white transition-colors">Multi-Agent Intelligence</Link></li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm text-[#A1A1AA]">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Career Tracks</a></li>
                <li><a href="#support" className="hover:text-white transition-colors">Support Center</a></li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-[#A1A1AA]">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Data Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#292929] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1A1AA]">
            <p>© {new Date().getFullYear()} SkillPath AI. All rights reserved.</p>
            <p className="flex items-center gap-1 text-[#A1A1AA]">
              Built for Google Fest with <span className="text-white">Multi-Agent Intelligence</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
