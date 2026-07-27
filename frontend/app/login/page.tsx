'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, ArrowRight, AlertTriangle, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('executive@skylark.com');
  const [password, setPassword] = useState('skylark2026');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      localStorage.setItem('skylark_token', res.token);
      localStorage.setItem('skylark_user', JSON.stringify(res.user));
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Live GraphQL API to Deal Funnel & Work Orders',
    'Google Gemini AI for natural language queries',
    'Executive KPI dashboards & board briefings',
    '87.2% data completeness with auto-normalization',
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 50%, #ECFDF5 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, #C7D2FE 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #BAE6FD 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

      <div className="relative z-10 flex w-full max-w-5xl gap-8 items-stretch">

        {/* ── Left hero panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 rounded-3xl p-10 shadow-2xl text-white"
          style={{ background: 'linear-gradient(155deg, #4F46E5 0%, #0891B2 55%, #059669 100%)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-inner">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-sm leading-none flex items-center gap-2">
                Skylark BI Copilot
                <span className="text-[9px] bg-white/20 rounded px-1.5 py-0.5">v2.0</span>
              </p>
              <p className="text-white/70 text-[11px]">AI Command Center</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <h2 className="text-4xl font-black leading-tight tracking-tight">
              Your Monday.com<br />data, supercharged<br />with Gemini AI.
            </h2>
            <div className="space-y-3.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 text-white/90 text-[13px]">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-emerald-300" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: '522+', label: 'Live Records' },
              { val: '87.2%', label: 'Data Quality' },
              { val: '17/17', label: 'APIs Active' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-3 text-center">
                <p className="text-xl font-extrabold">{s.val}</p>
                <p className="text-white/65 text-[10px] font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-white/40 text-[10px]">© 2026 Skylark Drones · Internal Enterprise Tool</p>
        </div>

        {/* ── Right login card ── */}
        <div className="flex-1 bg-white rounded-3xl p-10 shadow-2xl border border-slate-200 flex flex-col justify-center">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#6366F1,#06B6D4)' }}>
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800">Skylark BI Copilot</p>
              <p className="text-indigo-500 text-[11px]">AI Command Center</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-1.5">
              Welcome back <Sparkles className="h-5 w-5 text-indigo-500" />
            </h1>
            <p className="text-slate-500 text-sm">Sign in to access your executive intelligence console.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl p-4 flex items-start gap-3 text-sm bg-red-50 border border-red-200 text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="executive@skylark.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)' }}
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>Sign in to Command Center <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 rounded-2xl p-4 bg-indigo-50 border border-indigo-100 text-center space-y-1">
            <p className="text-xs font-bold text-indigo-700 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Demo credentials are pre-filled
            </p>
            <p className="text-[11px] text-indigo-500">Click &quot;Sign in&quot; to authenticate and receive a JWT token.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
