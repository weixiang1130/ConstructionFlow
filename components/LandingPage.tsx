import React from 'react';
import { ShoppingCart, BarChart3, ClipboardCheck, Building2, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onSelectDepartment: (dept: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectDepartment }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
              <Building2 size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">營管/採購/品保警示報表</h1>
          <p className="text-slate-500 text-lg">請選擇您要進入的部門系統</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Procurement Department */}
          <button
            onClick={() => onSelectDepartment('PROCUREMENT')}
            className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-500 transition-all text-left flex flex-col items-start"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">採購部</h2>
            <p className="text-slate-500 text-sm mb-6">工程發包管理、採購進度追蹤、廠商合約控管。</p>
            <div className="mt-auto flex items-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              進入系統 <ArrowRight size={16} className="ml-1" />
            </div>
          </button>

          {/* Operations Department */}
          <button
            onClick={() => onSelectDepartment('OPERATIONS')}
            className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-500 transition-all text-left flex flex-col items-start"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BarChart3 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">營運管理部</h2>
            <p className="text-slate-500 text-sm mb-6">專案營運分析、績效儀表板。</p>
            <div className="mt-auto flex items-center text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              進入系統 <ArrowRight size={16} className="ml-1" />
            </div>
          </button>

          {/* QA Department */}
          <button
            onClick={() => onSelectDepartment('QUALITY')}
            className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-teal-500 transition-all text-left flex flex-col items-start"
          >
            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <ClipboardCheck size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">品保部</h2>
            <p className="text-slate-500 text-sm mb-6">施工計畫書送審。</p>
            <div className="mt-auto flex items-center text-teal-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              進入系統 <ArrowRight size={16} className="ml-1" />
            </div>
          </button>
        </div>

        <div className="mt-12 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Construction Management Portal System
        </div>
      </div>
    </div>
  );
};