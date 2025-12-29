import React, { useState, useEffect } from 'react';
import { Layout, ArrowLeft, BarChart3, FolderOpen, ArrowLeftRight } from 'lucide-react';
import { ProjectSelectionPage } from './ProjectSelectionPage';
import { OperationsTable } from './OperationsTable';
import { Project } from '../types';

const PROJECT_STORAGE_KEY = 'procurement_projects_list'; // Share project list with procurement

interface OperationsModuleProps {
  onBackToLanding: () => void;
}

export const OperationsModule: React.FC<OperationsModuleProps> = ({ onBackToLanding }) => {
  // --- Project State ---
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Sync projects (read-only mostly, but creation supported via ProjectSelectionPage)
  useEffect(() => {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: name,
      createdAt: new Date().toISOString()
    };
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm("確定刪除專案？注意：這也會影響採購部的專案列表。")) {
          const updated = projects.filter(p => p.id !== projectId);
          setProjects(updated);
          localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(updated)); // Explicit save
          if (currentProjectId === projectId) setCurrentProjectId(null);
      }
  };

  // --- Render Logic ---

  // 1. Project Selection
  if (!currentProjectId) {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
          >
            <ArrowLeft size={18} /> 回部門入口
          </button>
        </div>
        <ProjectSelectionPage 
          projects={projects} 
          onSelect={setCurrentProjectId}
          onCreate={handleCreateProject}
          onDelete={handleDeleteProject}
          title="內/外案選擇 (營管)" 
        />
      </div>
    );
  }

  const currentProjectName = projects.find(p => p.id === currentProjectId)?.name || '未知專案';

  // 2. Main Table View
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-indigo-900 text-indigo-100 flex flex-col h-auto md:h-screen sticky top-0 z-20 shadow-xl">
        <div className="p-4 border-b border-indigo-800 flex items-center gap-2 text-white bg-indigo-950">
          <button 
            onClick={onBackToLanding}
            className="mr-2 p-1 hover:bg-white/10 rounded transition-colors text-indigo-200 hover:text-white"
            title="回部門首頁"
          >
            <ArrowLeft size={20} />
          </button>
          <BarChart3 className="text-indigo-400" />
          <h1 className="text-lg font-bold tracking-tight">營運管理系統</h1>
        </div>
        
        <div className="flex-1 p-4 space-y-6">
           <div className="bg-indigo-800/50 rounded-lg p-4 border border-indigo-700/50">
              <p className="text-xs text-indigo-300 uppercase mb-1">目前專案</p>
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-3 break-all">
                <FolderOpen size={20} className="text-indigo-400 shrink-0" />
                {currentProjectName}
              </div>
              <button 
                onClick={() => setCurrentProjectId(null)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-600 text-white text-sm py-2 rounded transition-colors"
              >
                <ArrowLeftRight size={14} /> 切換專案
              </button>
           </div>
        </div>

        <div className="p-4 border-t border-indigo-800 text-xs text-indigo-400 text-center">
            營運管理部 v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100">
        <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
          <div className="mb-4">
             <h2 className="text-2xl font-bold text-gray-800">
               {currentProjectName}
             </h2>
             <p className="text-sm text-gray-500">營運管理控制中心</p>
          </div>

          <div className="flex-1 h-full min-h-0">
             <OperationsTable currentProjectId={currentProjectId} currentProjectName={currentProjectName} />
          </div>
        </div>
      </main>
    </div>
  );
};