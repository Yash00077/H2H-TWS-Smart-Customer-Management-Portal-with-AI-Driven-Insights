import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Shield, Zap, Users, Brain, TrendingUp, ChevronRight, Sparkles, Globe } from 'lucide-react';
import { useRef, useEffect, useCallback } from 'react';

// ── Intersection Observer hook for scroll reveals ──
function useScrollReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          } else {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return containerRef;
}

function Landing() {
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const glowPos = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const rafId = useRef(null);
  const scrollRef = useScrollReveal();

  const animateCursor = useCallback(() => {
    ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
    ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;
    glowPos.current.x += (mousePos.current.x - glowPos.current.x) * 0.08;
    glowPos.current.y += (mousePos.current.y - glowPos.current.y) * 0.08;

    if (cursorDotRef.current) {
      cursorDotRef.current.style.transform = `translate(${mousePos.current.x - 4}px, ${mousePos.current.y - 4}px)`;
    }
    if (cursorRingRef.current) {
      const scale = isHovering.current ? 1.8 : 1;
      cursorRingRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px) scale(${scale})`;
      cursorRingRef.current.style.opacity = isHovering.current ? '0.6' : '0.35';
    }
    if (cursorGlowRef.current) {
      cursorGlowRef.current.style.transform = `translate(${glowPos.current.x - 60}px, ${glowPos.current.y - 60}px)`;
    }

    rafId.current = requestAnimationFrame(animateCursor);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, [role="button"]');
      isHovering.current = !!target;
    };

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    rafId.current = requestAnimationFrame(animateCursor);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [animateCursor]);

  const features = [
    {
      icon: BarChart3,
      title: 'Health Score Tracking',
      desc: 'Real-time health scores calculated from usage, NPS, support tickets, and engagement metrics.',
      gradient: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      title: 'Churn Prediction',
      desc: 'AI-powered churn risk analysis with multi-factor scoring to identify at-risk accounts early.',
      gradient: 'from-rose-500/20 to-rose-600/5',
      border: 'border-rose-500/20',
      iconColor: 'text-rose-400',
    },
    {
      icon: Brain,
      title: 'AI Query Engine',
      desc: 'Ask natural language questions like "Who will churn first?" and get instant, intelligent answers.',
      gradient: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      icon: Shield,
      title: 'Risk Factor Analysis',
      desc: 'Understand exactly why customers are at risk with detailed factor breakdowns.',
      gradient: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      icon: Users,
      title: 'Customer Management',
      desc: 'Full CRUD operations with device tracking, ticket management, and contract monitoring.',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Globe,
      title: 'Regional Insights',
      desc: 'Filter and analyze customers by region, plan tier, and custom thresholds.',
      gradient: 'from-cyan-500/20 to-cyan-600/5',
      border: 'border-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
  ];

  const stats = [
    { value: '200+', label: 'Customers Tracked', icon: Users },
    { value: '99.9%', label: 'Uptime Guarantee', icon: Shield },
    { value: '< 1s', label: 'Query Response', icon: Zap },
    { value: '3', label: 'AI Query Models', icon: Brain },
  ];

  return (
    <div ref={scrollRef} className="min-h-screen bg-slate-950 text-white overflow-hidden landing-cursor-none">
      {/* Custom Cursor Elements */}
      <div ref={cursorGlowRef} className="fixed top-0 left-0 w-[120px] h-[120px] rounded-full bg-blue-500/10 blur-[40px] pointer-events-none z-[9999] hidden md:block" />
      <div ref={cursorRingRef} className="fixed top-0 left-0 w-10 h-10 rounded-full border-2 border-blue-400/40 pointer-events-none z-[9999] transition-opacity duration-200 hidden md:block" style={{ willChange: 'transform' }} />
      <div ref={cursorDotRef} className="fixed top-0 left-0 w-2 h-2 rounded-full bg-blue-400 pointer-events-none z-[9999] hidden md:block" style={{ willChange: 'transform', boxShadow: '0 0 8px 2px rgba(96,165,250,0.6)' }} />

      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* ═══ Navbar ═══ */}
      <nav className="reveal reveal-down relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">SmartPortal</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stats" className="hover:text-white transition-colors">Stats</a>
          <a href="#cta" className="hover:text-white transition-colors">Get Started</a>
        </div>
        <Link
          to="/login"
          className="px-5 py-2 text-sm font-medium rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all backdrop-blur-sm"
        >
          Sign In
        </Link>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pt-16 md:pt-24 pb-20 md:pb-32 text-center max-w-6xl mx-auto">
        {/* Badge */}
        <div className="reveal reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-8 backdrop-blur-sm">
          <Sparkles size={12} />
          AI-Powered Customer Intelligence Platform
        </div>

        <h1 className="reveal reveal-up reveal-delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          <span className="block">Understand Your</span>
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Customers Deeply
          </span>
        </h1>

        <p className="reveal reveal-up reveal-delay-2 text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Track health scores, predict churn risk, and gain AI-driven insights — all from one powerful dashboard. 
          Make data-informed decisions that keep your customers happy.
        </p>

        <div className="reveal reveal-up reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="group relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-sm hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center gap-2"
          >
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
          </Link>
          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-full font-semibold text-sm border border-white/15 text-slate-300 hover:bg-white/5 hover:border-white/25 transition-all flex items-center gap-2"
          >
            Create Account
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="reveal reveal-scale reveal-delay-4 mt-16 md:mt-20 relative mx-auto max-w-4xl">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl" />
          <div className="relative bg-slate-900/80 border border-white/10 rounded-2xl p-2 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] text-slate-500 font-mono">smartportal.app/dashboard</span>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Customers', value: '203', color: 'from-blue-600 to-blue-700' },
                  { label: 'High Risk', value: '79', color: 'from-rose-500 to-rose-700' },
                  { label: 'Avg Health', value: '9.4', color: 'from-violet-500 to-violet-700' },
                  { label: 'Healthy', value: '124', color: 'from-emerald-500 to-emerald-700' },
                ].map((s, i) => (
                  <div key={i} className={`bg-gradient-to-br ${s.color} rounded-xl p-3 md:p-4`}>
                    <p className="text-[10px] md:text-xs text-white/60">{s.label}</p>
                    <p className="text-lg md:text-2xl font-black">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-xs text-slate-400">Usage Distribution</span>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {[35, 55, 70, 90, 80, 65, 45, 75, 85, 60, 50, 40].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/60 to-blue-400/30 rounded-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Stats Bar ═══ */}
      <section id="stats" className="relative z-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i} className={`reveal reveal-up reveal-delay-${i + 1} space-y-2`}>
                <s.icon size={20} className="mx-auto text-blue-400 mb-2" />
                <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section id="features" className="relative z-10 px-6 md:px-12 lg:px-20 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="reveal reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-5">
            <Globe size={12} />
            Powerful Features
          </div>
          <h2 className="reveal reveal-up reveal-delay-1 text-3xl md:text-4xl font-black tracking-tight mb-4">
            Everything you need to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">retain customers</span>
          </h2>
          <p className="reveal reveal-up reveal-delay-2 text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            A comprehensive suite of tools designed to help you understand, predict, and act on customer behavior.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`reveal reveal-up reveal-delay-${(i % 3) + 1} group relative bg-gradient-to-b ${f.gradient} rounded-2xl p-6 border ${f.border} hover:border-white/20 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${f.iconColor} group-hover:scale-110 transition-transform`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section id="cta" className="relative z-10 px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute -inset-10 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl" />
          <div className="reveal reveal-scale relative bg-slate-900/50 border border-white/10 rounded-3xl p-8 md:p-14 backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Ready to reduce churn?
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm md:text-base">
              Join hundreds of companies using SmartPortal to understand their customers and prevent churn before it happens.
            </p>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-sm hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all duration-300"
            >
              Get Started for Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="reveal reveal-up relative z-10 border-t border-white/5 px-6 md:px-12 lg:px-20 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-400">SmartPortal</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 SmartPortal. Built with ❤️ for customer success.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
