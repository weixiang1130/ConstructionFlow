import React from 'react';
import { ShoppingCart, BarChart3, ClipboardCheck, Building2, ArrowRight, LogOut, UserCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  onSelectDepartment: (dept: string) => void;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectDepartment, currentUser, onLogout }) => {
  
  // Helper to check if a user can access a specific department
  const canAccess = (targetDept: string) => {
    if (currentUser.department === 'ADMIN') return true;
    return currentUser.department === targetDept;
  };

  const getButtonClass = (targetDept: string, hoverColorClass: string) => {
    const accessible = canAccess(targetDept);
    const baseClass = "group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 transition-all text-left flex flex-col items-start w-full";
    
    if (accessible) {
      return `${baseClass} hover:shadow-xl ${hoverColorClass} cursor-pointer`;
    } else {
      return `${baseClass} opacity-50 grayscale cursor-not-allowed`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with User Info and Logout */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-lg">
          <Building2 className="text-blue-600" />
          <span>根基營造</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            <UserCircle size={18} />
            <span className="font-medium">{currentUser.name}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500 text-xs">{currentUser.department}</span>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            登出
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">幕僚單位警示報表整合系統</h1>
            <p className="text-slate-500 text-lg">請選擇您的工作部門</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Procurement Department */}
            <button
              onClick={() => canAccess('PROCUREMENT') && onSelectDepartment('PROCUREMENT')}
              disabled={!canAccess('PROCUREMENT')}
              className={getButtonClass('PROCUREMENT', 'hover:border-blue-500')}
            >
              <div className={`p-3 bg-blue-50 text-blue-600 rounded-lg mb-4 ${canAccess('PROCUREMENT') ? 'group-hover:bg-blue-600 group-hover:text-white' : ''} transition-colors`}>
                <ShoppingCart size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">採購部</h2>
              <p className="text-slate-500 text-sm mb-6">工程發包管理、採購進度追蹤、廠商合約控管。</p>
              
              {canAccess('PROCUREMENT') && (
                <div className="mt-auto flex items-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  進入系統 <ArrowRight size={16} className="ml-1" />
                </div>
              )}
              {!canAccess('PROCUREMENT') && (
                <div className="mt-auto flex items-center text-slate-400 font-medium text-xs">
                  無存取權限
                </div>
              )}
            </button>

            {/* Operations Department */}
            <button
              onClick={() => canAccess('OPERATIONS') && onSelectDepartment('OPERATIONS')}
              disabled={!canAccess('OPERATIONS')}
              className={getButtonClass('OPERATIONS', 'hover:border-indigo-500')}
            >
              <div className={`p-3 bg-indigo-50 text-indigo-600 rounded-lg mb-4 ${canAccess('OPERATIONS') ? 'group-hover:bg-indigo-600 group-hover:text-white' : ''} transition-colors`}>
                <BarChart3 size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">營運管理部</h2>
              <p className="text-slate-500 text-sm mb-6">專案營運分析、績效儀表板。</p>
              
              {canAccess('OPERATIONS') && (
                <div className="mt-auto flex items-center text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  進入系統 <ArrowRight size={16} className="ml-1" />
                </div>
              )}
               {!canAccess('OPERATIONS') && (
                <div className="mt-auto flex items-center text-slate-400 font-medium text-xs">
                  無存取權限
                </div>
              )}
            </button>

            {/* QA Department */}
            <button
              onClick={() => canAccess('QUALITY') && onSelectDepartment('QUALITY')}
              disabled={!canAccess('QUALITY')}
              className={getButtonClass('QUALITY', 'hover:border-teal-500')}
            >
              <div className={`p-3 bg-teal-50 text-teal-600 rounded-lg mb-4 ${canAccess('QUALITY') ? 'group-hover:bg-teal-600 group-hover:text-white' : ''} transition-colors`}>
                <ClipboardCheck size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">品保部</h2>
              <p className="text-slate-500 text-sm mb-6">施工計畫書送審。</p>
              
              {canAccess('QUALITY') && (
                <div className="mt-auto flex items-center text-teal-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  進入系統 <ArrowRight size={16} className="ml-1" />
                </div>
              )}
               {!canAccess('QUALITY') && (
                <div className="mt-auto flex items-center text-slate-400 font-medium text-xs">
                  無存取權限
                </div>
              )}
            </button>
          </div>

          <div className="mt-12 text-center text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Construction Management Portal System
          </div>
        </div>
      </div>
    </div>
  );
};