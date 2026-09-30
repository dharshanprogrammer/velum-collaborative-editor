import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Zap, Lock, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { CerebriumBackground } from '../components/ui/CerebriumBackground';

export function AuthRoute() {
  const [searchParams] = useSearchParams();
  const isRegisterParam = searchParams.get('register') === 'true';
  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (isRegister && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Left: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-14">
        {/* Brand header */}
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
              <span className="font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-text-primary">Velum</span>
          </Link>
        </div>

        {/* Center: Auth Form */}
        <div className="max-w-md w-full mx-auto my-12">
          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-tight text-text-primary">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-text-muted mt-2 font-light">
              {isRegister
                ? 'Join high-performance teams collaborating in real-time.'
                : 'Enter your credentials to access your workspaces.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-semantic-danger-bg border border-semantic-danger/30 text-semantic-danger text-xs">
                {error}
              </div>
            )}

            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">Full Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus={isRegister}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted">Email address</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={!isRegister}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-text-muted">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Password Strength Meter */}
              {isRegister && password.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={cn(
                          'flex-1 rounded-full transition-all duration-200',
                          strength >= step
                            ? strength <= 1
                              ? 'bg-semantic-danger'
                              : strength <= 3
                              ? 'bg-accent'
                              : 'bg-semantic-success'
                            : 'bg-border'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {strength <= 1 ? 'Weak' : strength <= 3 ? 'Good' : 'Strong'} password
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-3 h-11 bg-gradient-to-r from-accent to-accent-secondary text-white border-0 shadow-lg shadow-accent/20 hover:shadow-accent/30 btn-glow font-semibold rounded-xl"
              loading={loading}
            >
              {isRegister ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Switch Register/Login */}
          <div className="mt-8 text-center text-sm text-text-muted">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className="text-accent font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  className="text-accent font-medium hover:underline"
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-text-muted text-center">
          <p>© 2026 Velum Studio. Real-time CRDT infrastructure.</p>
        </div>
      </div>

      {/* Right: Cerebrium-Style Brand Panel */}
      <div className="hidden lg:flex w-1/2 border-l border-border/30 flex-col justify-center p-16 relative overflow-hidden select-none bg-surface/30 hero-gradient">
        <CerebriumBackground className="opacity-70" />
        <div className="max-w-md space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/[0.08] border border-accent/20 text-accent text-xs font-semibold glow-pill">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-Time Infrastructure</span>
          </div>

          <h2 className="text-4xl font-light text-text-primary tracking-tight leading-snug">
            Never wait for a server.
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
              Never lose a keystroke.
            </span>
          </h2>

          <div className="space-y-5 pt-2">
            <div className="flex items-start gap-3 text-sm text-text-muted">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-3 h-3 text-accent" />
              </div>
              <span>
                <strong className="text-text-primary font-medium">CRDT state vectors:</strong> Edits apply directly to memory with zero lockups.
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm text-text-muted">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-3 h-3 text-accent" />
              </div>
              <span>
                <strong className="text-text-primary font-medium">IndexedDB caching:</strong> Instantaneous 0ms boot times without blank screens.
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm text-text-muted">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-3 h-3 text-accent" />
              </div>
              <span>
                <strong className="text-text-primary font-medium">Multi-tab broadcast:</strong> Open multiple tabs with zero presence collisions.
              </span>
            </div>
          </div>
        </div>

        {/* Decorative glow orbs */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-[100px] pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-accent-secondary/[0.04] blur-[80px] pointer-events-none" />
      </div>
    </div>
  );
}
