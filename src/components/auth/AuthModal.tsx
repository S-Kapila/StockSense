import React, { useState } from 'react';
import { PackageCheck, ShieldCheck, Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface AuthModalProps {
  isOpen: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  const { login, signup, loginDemo } = useAuth();
  const { success, error: toastError } = useToast();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('sarah.jenkins@stocksense.io');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Sarah Jenkins');
  const [role, setRole] = useState<'Warehouse Admin' | 'Inventory Manager' | 'Logistics Operator'>('Warehouse Admin');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Missing fields', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        success('Welcome back', `Signed in as ${email}`);
      } else {
        if (!name) {
          toastError('Missing Name', 'Please provide your full name.');
          setLoading(false);
          return;
        }
        await signup(name, email, password, role);
        success('Account Created', `Welcome to StockSense, ${name}!`);
      }
    } catch (err: any) {
      toastError('Authentication Error', err?.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-brand-600 to-blue-700 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <PackageCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">StockSense ERP</h2>
          <p className="text-xs text-blue-100 mt-1">Enterprise Inventory Management System</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              tab === 'login'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              tab === 'signup'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Main Form */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'signup' && (
              <>
                <Input
                  label="Full Name"
                  placeholder="e.g. Alex Henderson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Role Privilege
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
                  >
                    <option value="Warehouse Admin">Warehouse Admin (Full Access)</option>
                    <option value="Inventory Manager">Inventory Manager (Stock & Orders)</option>
                    <option value="Logistics Operator">Logistics Operator (Intake/Dispatch)</option>
                  </select>
                </div>
              </>
            )}

            <Input
              label="Work Email"
              type="email"
              placeholder="name@stocksense.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {tab === 'login' ? 'Sign In to Dashboard' : 'Register & Launch'}
            </Button>
          </form>

          {/* 1-Click Demo Login Personas */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Click Instant Demo Evaluation
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginDemo('admin')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-500 text-left transition-all group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600">
                  Admin
                </div>
                <div className="text-[10px] text-slate-400">Sarah J.</div>
              </button>

              <button
                type="button"
                onClick={() => loginDemo('manager')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-500 text-left transition-all group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600">
                  Manager
                </div>
                <div className="text-[10px] text-slate-400">David V.</div>
              </button>

              <button
                type="button"
                onClick={() => loginDemo('operator')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-500 text-left transition-all group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600">
                  Operator
                </div>
                <div className="text-[10px] text-slate-400">Elena R.</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
