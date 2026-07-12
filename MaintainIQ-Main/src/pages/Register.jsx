import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Briefcase,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Technician');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation States
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const tempErrors = {};
    if (!fullName.trim()) {
      tempErrors.fullName = 'Full Name is required.';
    }

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

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    api.auth.register({ name: fullName, email, password, role })
      .then(res => {
        setLoading(false);
        // Save session
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
        const serverErrors = err.response?.data?.errors;
        if (serverErrors && serverErrors.length > 0) {
          const tempErrors = {};
          serverErrors.forEach(errorItem => {
            if (errorItem.field === 'name') tempErrors.fullName = errorItem.message;
            if (errorItem.field === 'email') tempErrors.email = errorItem.message;
            if (errorItem.field === 'password') tempErrors.password = errorItem.message;
          });
          setErrors(tempErrors);
        } else {
          setErrors({ email: err.response?.data?.message || 'This email is already registered.' });
        }
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="bg-glow-purple top-1/4 left-1/4 scale-125" />
      <div className="bg-glow-emerald bottom-1/4 right-1/4 scale-125" />

      {/* Main Glassmorphic Wrapper */}
      <div className="glass-card border border-slate-800/80 rounded-2xl p-8 max-w-md w-full shadow-2xl backdrop-blur-md relative z-10 animate-slide-up space-y-5">
        
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/20 text-white mb-2">
            <ShieldCheck className="w-6.5 h-6.5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Create MaintainIQ Account</h2>
          <p className="text-xs text-slate-400">Join the engineering team and track connected machinery.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-bold uppercase tracking-wider">Full Name</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Marcus Aurelius"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full bg-slate-950/60 border rounded-lg pl-9 pr-4 py-2 text-slate-200 placeholder-slate-650 focus:outline-none transition-colors
                  ${errors.fullName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-violet-500'}
                `}
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            </div>
            {errors.fullName && (
              <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-medium animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.fullName}</span>
              </span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="engineer@maintainiq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-950/60 border rounded-lg pl-9 pr-4 py-2 text-slate-200 placeholder-slate-650 focus:outline-none transition-colors
                  ${errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-violet-500'}
                `}
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            </div>
            {errors.email && (
              <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-medium animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.email}</span>
              </span>
            )}
          </div>

          {/* Role selection dropdown */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-bold uppercase tracking-wider">Platform Role</label>
            <div className="relative flex items-center">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2 text-slate-350 focus:outline-none transition-colors font-medium cursor-pointer"
              >
                <option value="Technician">Technician (Maintenance Crew)</option>
                <option value="Admin">Administrator (Operations Dispatcher)</option>
              </select>
              <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-bold uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-950/60 border rounded-lg pl-9 pr-10 py-2 text-slate-200 placeholder-slate-650 focus:outline-none transition-colors
                  ${errors.password ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-violet-500'}
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
              <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-medium animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.password}</span>
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-bold uppercase tracking-wider">Confirm Password</label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-slate-950/60 border rounded-lg pl-9 pr-10 py-2 text-slate-200 placeholder-slate-650 focus:outline-none transition-colors
                  ${errors.confirmPassword ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-violet-500'}
                `}
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-350 p-0.5 rounded focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-medium animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.confirmPassword}</span>
              </span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-violet-500/15 active:translate-y-0.5 mt-2"
          >
            <span>{loading ? 'Registering...' : 'Create Account'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center pt-3 border-t border-slate-900/60 text-[11px] text-slate-400 font-medium">
          <span>Already have an account? </span>
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
