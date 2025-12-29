import React, { useState } from 'react';
import { UserRole } from '../types';
import { UserCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'ADMIN', label: '管理員 (Admin)', description: '完整權限' },
  { value: 'PLANNER', label: '工地排程 (Planner)', description: '工程項目與預定時間' },
  { value: 'EXECUTOR', label: '工地執行 (Executor)', description: '實際時間回報' },
  { value: 'PROCUREMENT', label: '採購發包 (Procurement)', description: '發包與廠商管理' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle size={40} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">歡迎使用採購管理系統</h1>
          <p className="text-gray-500 mt-2">請選擇您的身份以登入</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">選擇角色</label>
            <div className="grid gap-3">
              {ROLES.map((role) => (
                <div 
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all ${
                    selectedRole === role.value 
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className={`font-semibold ${selectedRole === role.value ? 'text-blue-700' : 'text-gray-700'}`}>
                      {role.label}
                    </div>
                    <div className="text-xs text-gray-500">{role.description}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border ${selectedRole === role.value ? 'border-4 border-blue-600' : 'border-gray-300'}`}></div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
          >
            登入系統 <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          模擬登入系統 v1.0
        </div>
      </div>
    </div>
  );
};