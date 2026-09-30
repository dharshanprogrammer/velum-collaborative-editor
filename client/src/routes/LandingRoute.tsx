import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  ArrowRight,
  GitBranch,
  CloudOff,
  ArrowUpRight,
  Shield,
  Gauge,
  Globe,
  Layers,
  Terminal,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { CerebriumBackground } from '../components/ui/CerebriumBackground';

const FEATURES = [
  {
    icon: Zap,
    title: 'Sub-Second Latency',
    desc: 'Every keystroke writes to memory and IndexedDB instantly. Your cursor never waits for a round-trip.',
    tag: 'Performance',
  },
  {
    icon: GitBranch,
    title: 'Yjs CRDT Engine',
    desc: 'Real-time collaboration over WebSocket. Binary sync vectors guarantee mathematical convergence.',
    tag: 'Infrastructure',
  },
  {
    icon: CloudOff,
    title: 'Offline Resilient',
    desc: 'Lose Wi-Fi? Keep writing. Changes merge seamlessly when connectivity returns.',
    tag: 'Reliability',
  },
  {
    icon: Shield,
    title: 'End-to-End Security',
    desc: 'Document-level encryption with zero-knowledge architecture. Your content stays private.',
    tag: 'Security',
  },
  {
    icon: Gauge,
    title: 'Instant Boot',
    desc: 'IndexedDB state vector caching means zero blank screens. Documents load in under 50ms.',
    tag: 'Speed',
  },
  {
    icon: Globe,
    title: 'Multi-Region Sync',
    desc: 'Deploy collaboration nodes closest to your team. Sub-100ms sync across continents.',
    tag: 'Scale',
  },
];

const TRUSTED_BY = [
  'Engineering Teams',
  'Product Studios',
  'Research Labs',
  'Design Agencies',
  'Open Source Projects',
  'Startups',
];

export function LandingRoute() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-accent/20 relative overflow-x-hidden bg-noise">
      {/* Exact Cerebrium 3D Background Animation */}
      <div className="fixed inset-0 pointer-events-none z-0 w-full h-full overflow-hidden">
        <CerebriumBackground />
      </div>

      {/* Navigation */}
      <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-2xl px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-accent/20">
              V
            </div>
            <span className="font-bold text-[16px] tracking-tight text-text-primary">
              Velum
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
              Product
            </Link>
            <Link to="/design" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
              Design System
            </Link>
            <span className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer">
              Docs
            </span>
            <span className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer">
              Pricing
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link to="/auth?register=true">
            <Button size="sm" className="rounded-lg px-5 bg-gradient-to-r from-accent to-accent-secondary text-white border-0 shadow-lg shadow-accent/20 hover:shadow-accent/30 btn-glow font-semibold">
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero (Cerebrium 2-Column Asymmetric Layout) */}
      <section className="pt-24 sm:pt-32 pb-20 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Massive Headline */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/[0.08] border border-accent/20 text-accent text-xs font-semibold mb-8 select-none glow-pill"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>Real-time CRDT Infrastructure</span>
              <span className="text-accent/50">·</span>
              <span className="text-accent/70">v1.0 GA</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-[5.5rem] font-light tracking-tighter text-text-primary leading-[1.04]"
            >
              Real-time doc <br />
              infrastructure <br />
              that <span className="bg-gradient-to-r from-accent via-accent-secondary to-accent bg-clip-text text-transparent font-normal">scales</span> with you
            </motion.h1>
          </div>

          {/* Right Column: Narrative Subtitle & Buttons */}
          <div className="lg:col-span-5 flex flex-col items-start lg:pl-6 text-left">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-base sm:text-lg text-text-muted leading-relaxed font-light"
            >
              Deploy collaborative document studios with sub-second sync and instant autoscaling.
              Mathematical CRDTs, zero latency keystrokes, and offline resilience — built for teams that need reliability at scale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link to="/auth?register=true">
                <Button size="lg" className="rounded-xl px-7 bg-gradient-to-r from-accent to-accent-secondary text-white border-0 shadow-lg shadow-accent/25 hover:shadow-accent/40 btn-glow gap-2 font-semibold text-sm h-12 uppercase tracking-wider">
                  <span>Try It Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="rounded-xl px-6 text-sm border-border/60 bg-surface/40 backdrop-blur-md text-text-muted hover:text-text-primary hover:border-text-primary/30 h-12 uppercase tracking-wider">
                  <Terminal className="w-4 h-4 mr-2" />
                  Explore Studio
                </Button>
              </Link>
            </motion.div>

            {/* Micro proof points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 pt-6 border-t border-border/40 w-full flex items-center justify-between text-xs text-text-muted/70"
            >
              <div>
                <span className="font-semibold text-text-primary block text-sm">&lt; 10ms</span>
                <span>Typing latency</span>
              </div>
              <div className="h-6 w-px bg-border/40" />
              <div>
                <span className="font-semibold text-text-primary block text-sm">100% Offline</span>
                <span>IndexedDB sync</span>
              </div>
              <div className="h-6 w-px bg-border/40" />
              <div>
                <span className="font-semibold text-text-primary block text-sm">Zero Conflict</span>
                <span>Yjs CRDTs</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trusted by */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 flex flex-col items-center gap-4 text-center"
        >
          <span className="text-[11px] font-semibold text-text-muted/70 uppercase tracking-wider">
            Built for modern engineering & product teams
          </span>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {TRUSTED_BY.map((name) => (
              <span key={name} className="text-xs text-text-muted/60 font-medium">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Live Editor Preview */}
      <section className="px-4 sm:px-8 max-w-5xl mx-auto w-full pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="rounded-2xl border border-border/40 bg-surface/60 backdrop-blur-xl shadow-floating overflow-hidden relative gradient-border"
        >
          {/* Window Chrome */}
          <div className="h-12 border-b border-border/30 bg-surface-subtle/30 px-5 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent/40" />
              <div className="w-3 h-3 rounded-full bg-accent-secondary/30" />
              <div className="w-3 h-3 rounded-full bg-text-muted/20" />
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <span>Architecture Spec.md</span>
              <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse" />
            </div>

            <div className="flex items-center -space-x-2">
              <span className="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-surface bg-gradient-to-br from-accent to-accent-secondary shadow-sm">
                A
              </span>
              <span className="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-surface bg-gradient-to-br from-accent-secondary to-purple-600 shadow-sm">
                L
              </span>
              <span className="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-surface bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm">
                S
              </span>
            </div>
          </div>

          {/* Editor Body */}
          <div className="p-8 sm:p-14 min-h-[380px] bg-surface/80 relative select-none">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-light text-text-primary tracking-tight leading-tight">
                Deterministic Peer Convergence
              </h2>

              <p className="text-text-muted text-base leading-relaxed">
                When two people type in the exact same paragraph simultaneously, legacy
                systems lock the viewport or discard keystrokes.{' '}
                <span
                  className={cn(
                    'transition-all duration-300 rounded px-1',
                    step >= 1 ? 'bg-accent/[0.12] font-medium text-accent' : ''
                  )}
                >
                  Velum uses mathematical semi-lattices
                </span>
                , enabling zero-conflict reconciliation across peers.
              </p>

              <div className="p-4 rounded-xl border border-accent/20 bg-accent/[0.04] text-text-primary text-xs leading-relaxed flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="text-accent">Zero Keystroke Loss:</strong>{' '}
                  Every character is encoded as an atomic Yjs item with a Lamport timestamp and client vector.
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-border/40 bg-surface-subtle/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded bg-gradient-to-br from-accent to-accent-secondary text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="font-medium text-text-primary">
                    IndexedDB state vector synchronized
                  </span>
                </div>
                <span className="font-mono text-[10px] text-semantic-success bg-semantic-success-bg px-2 py-0.5 rounded-md border border-semantic-success/20">
                  0ms
                </span>
              </div>
            </div>

            {/* Cursor simulations */}
            <motion.div
              animate={{
                x: step === 0 ? 100 : step === 1 ? 320 : step === 2 ? 220 : 140,
                y: step === 0 ? -160 : step === 1 ? -120 : step === 2 ? -80 : -140,
              }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute pointer-events-none z-20 flex flex-col items-start"
            >
              <div className="w-[2px] h-5 bg-accent" />
              <div className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm shadow-accent/30">
                Ana
              </div>
            </motion.div>

            <motion.div
              animate={{
                x: step === 0 ? 280 : step === 1 ? 180 : step === 2 ? 380 : 310,
                y: step === 0 ? -90 : step === 1 ? -70 : step === 2 ? -130 : -80,
              }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="absolute pointer-events-none z-20 flex flex-col items-start"
            >
              <div className="w-[2px] h-5 bg-accent-secondary" />
              <div className="bg-accent-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm shadow-accent-secondary/30">
                Liam
              </div>
            </motion.div>

            <motion.div
              animate={{
                x: step === 0 ? 440 : step === 1 ? 510 : step === 2 ? 140 : 360,
                y: step === 0 ? -170 : step === 1 ? -100 : step === 2 ? -90 : -130,
              }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="absolute pointer-events-none z-20 flex flex-col items-start"
            >
              <div className="w-[2px] h-5 bg-blue-500" />
              <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm shadow-blue-500/30">
                Sofia
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 sm:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/[0.06] border border-accent/15 text-accent text-xs font-semibold mb-6"
          >
            <Layers className="w-3.5 h-3.5" />
            Platform
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tighter text-text-primary leading-[1.1]"
          >
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
              ship fast
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm text-text-muted mt-4 max-w-lg mx-auto leading-relaxed"
          >
            Local-first architecture, mathematical CRDTs, and a design that gets out of your way.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group p-7 rounded-2xl border border-border/40 bg-surface/40 hover:bg-surface/80 hover:border-accent/20 card-aurora flex flex-col gap-5 transition-all backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-accent/[0.08] text-accent flex items-center justify-center group-hover:bg-accent/[0.12] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider bg-surface-subtle/60 px-2.5 py-1 rounded-full border border-border/40">
                    {feature.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-text-primary tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">{feature.desc}</p>
                </div>
                <div className="mt-auto pt-2">
                  <span className="text-xs text-accent font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-16 border-y border-border/30">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '0ms', label: 'Keystroke Latency' },
            { value: '100%', label: 'Uptime SLA' },
            { value: '<50ms', label: 'Document Boot' },
            { value: '∞', label: 'Offline Duration' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-light tracking-tighter bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-text-muted mt-2 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-light tracking-tighter text-text-primary leading-tight">
            Ready to build{' '}
            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
              without limits?
            </span>
          </h2>
          <p className="text-text-muted mt-5 max-w-lg mx-auto text-sm leading-relaxed">
            Start writing with real-time collaboration today. No credit card required.
            Your data stays yours with local-first architecture.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth?register=true">
              <Button size="lg" className="rounded-xl px-8 bg-gradient-to-r from-accent to-accent-secondary text-white border-0 shadow-lg shadow-accent/25 hover:shadow-accent/40 btn-glow gap-2 font-semibold text-sm h-12">
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="rounded-xl px-6 text-sm border-border/60 text-text-muted hover:text-text-primary h-12">
                View Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Marquee */}
      <section className="border-y border-border/20 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-4 text-text-muted/20 text-sm font-semibold uppercase tracking-widest">
              <span>Local-First</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
              <span>CRDT Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
              <span>Zero Latency</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
              <span>Offline Ready</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
              <span>Real-Time Collab</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
              <span>AI Assist</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-16 px-6 sm:px-12 border-t border-border/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center font-bold text-xs text-white">
              V
            </div>
            <span className="font-semibold text-sm text-text-primary">Velum</span>
            <span className="text-[10px] text-text-muted font-mono bg-surface-subtle px-2 py-0.5 rounded-full border border-border/40">
              v1.0
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <span className="hover:text-text-primary transition-colors cursor-pointer">Documentation</span>
            <span className="hover:text-text-primary transition-colors cursor-pointer">Blog</span>
            <span className="hover:text-text-primary transition-colors cursor-pointer">Status</span>
            <span className="hover:text-text-primary transition-colors cursor-pointer">Privacy</span>
          </div>
          <p className="text-[11px] text-text-muted/60">
            Built with React, TipTap, Yjs, and Node.js
          </p>
        </div>
      </footer>
    </div>
  );
}
