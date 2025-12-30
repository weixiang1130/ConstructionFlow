import React from 'react';
import { ShoppingCart, BarChart3, ClipboardCheck, Building2, ArrowRight, LogOut, UserCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  onSelectDepartment: (dept: string) => void;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectDepartment, currentUser, onLogout }) => {
  
  const canAccess = (targetDept: string) => {
    if (currentUser.department === 'ADMIN') return true;
    return currentUser.department === targetDept;
  };

  const getCardStyle = (targetDept: string, theme: 'blue' | 'indigo' | 'teal') => {
    const accessible = canAccess(targetDept);
    
    const themeStyles = {
      blue: {
        bg: 'bg-blue-50', text: 'text-blue-600', hoverBorder: 'hover:border-blue-300', hoverShadow: 'hover:shadow-blue-100'
      },
      indigo: {
        bg: 'bg-indigo-50', text: 'text-indigo-600', hoverBorder: 'hover:border-indigo-300', hoverShadow: 'hover:shadow-indigo-100'
      },
      teal: {
        bg: 'bg-teal-50', text: 'text-teal-600', hoverBorder: 'hover:border-teal-300', hoverShadow: 'hover:shadow-teal-100'
      }
    };

    const style = themeStyles[theme];

    if (accessible) {
      return `group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 ${style.hoverBorder} hover:shadow-xl ${style.hoverShadow} cursor-pointer flex flex-col items-start h-full`;
    } else {
      return `relative bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-start h-full opacity-60 grayscale cursor-not-allowed`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Building2 className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">根基營造 <span className="text-slate-400 font-normal hidden sm:inline">| 警示報表系統</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="text-right hidden md:block">
                <p className="font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-slate-500 text-xs uppercase tracking-wider">{currentUser.department}</p>
              </div>
              <div className="bg-slate-100 p-2 rounded-full">
                <UserCircle size={24} className="text-slate-500" />
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-medium text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-red-200 hover:bg-red-50"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            幕僚單位 <span className="text-indigo-600">智慧整合平台</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            整合採購、營運與品保之專案進度，提供即時的警示分析與 AI 輔助決策。請選擇您的工作部門以開始。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Procurement Card */}
          <button
            onClick={() => canAccess('PROCUREMENT') && onSelectDepartment('PROCUREMENT')}
            disabled={!canAccess('PROCUREMENT')}
            className={getCardStyle('PROCUREMENT', 'blue')}
          >
            <div className={`p-4 bg-blue-50 text-blue-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">採購部</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              工程發包管理、採購進度追蹤、廠商合約控管與時程警示。
            </p>
            
            {canAccess('PROCUREMENT') ? (
              <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                進入系統 <ArrowRight size={16} />
              </div>
            ) : (
              <div className="mt-auto text-slate-400 text-sm font-medium flex items-center gap-2">
                <LockIcon /> 無存取權限
              </div>
            )}
          </button>

          {/* Operations Card */}
          <button
            onClick={() => canAccess('OPERATIONS') && onSelectDepartment('OPERATIONS')}
            disabled={!canAccess('OPERATIONS')}
            className={getCardStyle('OPERATIONS', 'indigo')}
          >
             <div className={`p-4 bg-indigo-50 text-indigo-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <BarChart3 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">營運管理部</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              專案全生命週期管理、進度里程碑追蹤與營運績效分析。
            </p>
            
            {canAccess('OPERATIONS') ? (
              <div className="mt-auto flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                進入系統 <ArrowRight size={16} />
              </div>
            ) : (
              <div className="mt-auto text-slate-400 text-sm font-medium flex items-center gap-2">
                 <LockIcon /> 無存取權限
              </div>
            )}
          </button>

          {/* Quality Card */}
          <button
            onClick={() => canAccess('QUALITY') && onSelectDepartment('QUALITY')}
            disabled={!canAccess('QUALITY')}
            className={getCardStyle('QUALITY', 'teal')}
          >
            <div className={`p-4 bg-teal-50 text-teal-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <ClipboardCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors">品保部</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              12 項標準施工計畫書送審管制、品質查核與缺失改善追蹤。
            </p>
            
            {canAccess('QUALITY') ? (
              <div className="mt-auto flex items-center gap-2 text-teal-600 font-bold text-sm bg-teal-50 px-4 py-2 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-all">
                進入系統 <ArrowRight size={16} />
              </div>
            ) : (
              <div className="mt-auto text-slate-400 text-sm font-medium flex items-center gap-2">
                 <LockIcon /> 無存取權限
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);