import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import { UserCircle, Lock, ArrowRight, AlertCircle, Building2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = MOCK_USERS.find(u => u.username === username);
    if (user) {
      onLogin(user);
    } else {
      setError('查無此帳號，請確認後再試。');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Building2 size={40} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">根基營造</h1>
          <p className="text-slate-500 mt-2 font-medium">幕僚單位警示報表系統</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">帳號</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800 placeholder-slate-400"
                  placeholder="請輸入使用者帳號"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">密碼</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800 placeholder-slate-400"
                  placeholder="請輸入密碼"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            disabled={!username}
          >
            登入系統 <ArrowRight size={20} />
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-semibold mb-3 text-center uppercase tracking-wider">快速測試帳號</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {MOCK_USERS.map(u => (
              <button
                key={u.username}
                type="button"
                onClick={() => setUsername(u.username)}
                className="text-xs bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                {u.username}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};