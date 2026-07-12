import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Send
} from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your email address.');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="bg-glow-purple top-1/4 left-1/4 scale-125" />
      <div className="bg-glow-emerald bottom-1/4 right-1/4 scale-125" />

      {/* Main Glassmorphic Wrapper */}
      <div className="glass-card border border-slate-800/80 rounded-2xl p-8 max-w-md w-full shadow-2xl backdrop-blur-md relative z-10 animate-slide-up space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/20 text-white mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Recover Credentials</h2>
          <p className="text-xs text-slate-400">Enter your email and we'll dispatch a link to reset your password access.</p>
        </div>

        {success ? (
          /* Success Message State */
          <div className="space-y-4 text-center animate-fade-in py-2">
            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">Reset Dispatch Sent</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans px-2">
                We have generated recovery tokens and sent a verification link to <span className="text-slate-200 font-mono font-semibold">{email}</span>. Please verify within 20 minutes.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Input Form State */
          <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-lg text-[11px] text-rose-400 leading-normal animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="engineer@maintainiq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2.5 text-slate-200 placeholder-slate-650 focus:outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-violet-500/15 active:translate-y-0.5 mt-2"
            >
              <span>{loading ? 'Sending Request...' : 'Send Recovery Link'}</span>
              {!loading && <Send className="w-3.5 h-3.5" />}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 font-semibold hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
