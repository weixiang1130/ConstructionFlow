import React, { useState } from 'react';
import { Project } from '../types';
import { FolderOpen, Plus, Calendar, Trash2, ArrowRight } from 'lucide-react';

interface ProjectSelectionPageProps {
  projects: Project[];
  onSelect: (projectId: string) => void;
  onCreate: (name: string) => void;
  onDelete: (projectId: string, e: React.MouseEvent) => void;
  title?: string; // Optional title prop
}

export const ProjectSelectionPage: React.FC<ProjectSelectionPageProps> = ({ projects, onSelect, onCreate, onDelete, title }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreate(newProjectName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 w-full max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-100">
          <div className="text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
               <div className="bg-indigo-100 p-2 rounded-xl">
                 <FolderOpen size={28} className="text-indigo-600" />
               </div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title || '專案選擇'}</h1>
             </div>
             <p className="text-slate-500 ml-1">請選擇要作業的專案或建立新專案</p>
          </div>
          
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus size={20} /> 建立新專案
            </button>
          )}
        </div>

        {!isCreating ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 && (
               <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <p>目前沒有專案，請點擊右上方按鈕建立。</p>
               </div>
            )}
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelect(project.id)}
                className="group relative bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-[180px]"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="bg-indigo-50 p-2.5 rounded-lg group-hover:bg-indigo-600 transition-colors">
                     <FolderOpen size={20} className="text-indigo-600 group-hover:text-white transition-colors" />
                   </div>
                   <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onDelete(project.id, e);
                    }}
                    className="p-2 rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="刪除專案"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="font-bold text-xl text-slate-800 group-hover:text-indigo-600 mb-2 truncate transition-colors">
                  {project.name}
                </div>
                
                <div className="mt-auto flex items-center justify-between">
                   <div className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                    <Calendar size={12} />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto py-10 animate-in fade-in zoom-in duration-300">
             <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
               <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">建立新專案</h3>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">專案名稱</label>
                    <input 
                      type="text" 
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="例如：萬華直興案"
                      className="w-full p-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button 
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="flex-1 px-4 py-3 text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-xl font-bold transition-all"
                     >
                       取消
                     </button>
                     <button 
                      type="submit"
                      disabled={!newProjectName.trim()}
                      className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all shadow-md ${
                        newProjectName.trim() ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg' : 'bg-indigo-300 cursor-not-allowed'
                      }`}
                     >
                       確認建立
                     </button>
                  </div>
               </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};