import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import { UserCircle, Lock, ArrowRight, AlertCircle } from 'lucide-react';

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

    // Find user in mock database
    const user = MOCK_USERS.find(u => u.username === username);

    if (user) {
      // In a real app, we would check the password here.
      // For this prototype, we accept any password as long as the username exists.
      onLogin(user);
    } else {
      setError('查無此帳號，請確認後再試。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle size={40} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">根基營造管理系統</h1>
          <p className="text-gray-500 mt-2">請輸入您的帳號密碼以登入</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">帳號 (Username)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="請輸入帳號"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密碼 (Password)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="請輸入密碼"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!username}
          >
            登入 <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-2 text-center">測試用帳號列表 (點擊複製)</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {MOCK_USERS.map(u => (
              <button
                key={u.username}
                type="button"
                onClick={() => setUsername(u.username)}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded transition-colors"
                title={`${u.name} - ${u.department}`}
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