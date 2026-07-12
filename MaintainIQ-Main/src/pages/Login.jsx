import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please provide a valid email address.';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!validateForm()) return;

    setLoading(true);
    
    api.auth.login(email, password)
      .then(res => {
        setLoading(false);
        // Save mock user session
        localStorage.setItem('maintainiq_user', JSON.stringify({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          avatar: res.data.user.avatar
        }));
        localStorage.setItem('maintainiq_token', res.data.token);
        navigate('/');
      })
      .catch(err => {
        setLoading(false);
        setAuthError(err.response?.data?.message || 'Invalid email credentials or incorrect password. Try admin@maintainiq.com / password123.');
      });
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
          <h2 className="text-xl font-bold text-white tracking-tight">Access MaintainIQ</h2>
          <p className="text-xs text-slate-400">Scan assets, assign schedules, and audit platform telemetry.</p>
        </div>

        {/* Global authentication alerts */}
        {authError && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-lg text-[11px] text-rose-400 leading-normal animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-950/60 border rounded-lg pl-9 pr-4 py-2.5 text-slate-200 placeholder-slate-650 focus:outline-none transition-colors
                  ${errors.email ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/15' : 'border-slate-800 focus:border-violet-500'}
                `}
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            </div>
            {errors.email && (
              <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.email}</span>
              </span>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-slate-400 font-bold uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-violet-400 hover:text-violet-300 font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-950/60 border rounded-lg pl-9 pr-10 py-2.5 text-slate-200 placeholder-slate-650 focus:outline-none transition-colors
                  ${errors.password ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/15' : 'border-slate-800 focus:border-violet-500'}
                `}
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-350 p-0.5 rounded focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.password}</span>
              </span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-violet-500/15 active:translate-y-0.5 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer info link */}
        <div className="text-center pt-4 border-t border-slate-900/60 text-[11px] text-slate-400 font-medium">
          <span>New engineer on board? </span>
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-bold hover:underline">
            Create an account
          </Link>
        </div>

      </div>

      {/* Info helper footer */}
      <div className="absolute bottom-6 text-slate-600 text-[10px] font-medium max-w-sm text-center px-4 leading-normal">
        <span>Quick Test Access: admin@maintainiq.com / password123 (Administrator) or tech@maintainiq.com / password123 (Technician).</span>
      </div>
    </div>
  );
};

export default Login;
