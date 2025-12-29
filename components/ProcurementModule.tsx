import React, { useState, useEffect } from 'react';
import { ProcurementTable } from './ProcurementTable';
import { ProjectSelectionPage } from './ProjectSelectionPage';
import { UserRole, Project } from '../types';
import { Layout, FolderOpen, X, Pencil, ArrowLeftRight, LogOut, ArrowLeft } from 'lucide-react';

const PROJECT_STORAGE_KEY = 'procurement_projects_list';
const ROW_STORAGE_KEY = 'procurement_schedule_data';

interface ProcurementModuleProps {
  onBackToLanding: () => void;
  userRole: UserRole;
}

export const ProcurementModule: React.FC<ProcurementModuleProps> = ({ onBackToLanding, userRole }) => {
  // --- Project State ---
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    // Default project if none exist
    return [{ id: 'default-project', name: '預設工程專案', createdAt: new Date().toISOString() }];
  });

  // Start with NULL to force selection
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // --- Modal State (Edit Project Name) ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // --- Handlers ---
  
  const handleSwitchProject = () => {
    setCurrentProjectId(null);
  };

  // Reset Project to return to the project selection screen (within module)
  const handleResetProject = () => {
    setCurrentProjectId(null);
  };

  // Create Project (Called from Selection Page)
  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: name,
      createdAt: new Date().toISOString()
    };
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id); // Automatically select
  };

  // Edit Project Handlers (For Current Project)
  const openEditProjectModal = () => {
    const currentProject = projects.find(p => p.id === currentProjectId);
    if (currentProject) {
      setEditingProjectName(currentProject.name);
      setIsEditModalOpen(true);
    }
  };

  const handleEditProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProjectName && editingProjectName.trim()) {
      setProjects(projects.map(p => 
        p.id === currentProjectId ? { ...p, name: editingProjectName.trim() } : p
      ));
      setIsEditModalOpen(false);
    }
  };

  // Delete Project Handler
  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); 

    if (!window.confirm("確定要刪除此專案及其所有資料嗎？此動作無法復原。")) {
      return;
    }

    // 1. Data Cleanup
    try {
      const savedRows = localStorage.getItem(ROW_STORAGE_KEY);
      if (savedRows) {
        const rows = JSON.parse(savedRows);
        const filteredRows = rows.filter((r: any) => r.projectId !== projectId);
        localStorage.setItem(ROW_STORAGE_KEY, JSON.stringify(filteredRows));
      }
    } catch (error) {
      console.error("Error cleaning up project data:", error);
    }

    // 2. Update Projects State & LocalStorage immediately
    const updatedProjects = projects.filter(p => p.id !== projectId);
    
    // Explicitly update storage to ensure persistence immediately
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(updatedProjects));
    
    // Update State
    setProjects(updatedProjects);

    // 3. Handle Selection Logic
    // If we deleted the currently selected project, go back to selection
    if (projectId === currentProjectId) {
      setCurrentProjectId(null);
    }
  };

  // --- Render Flow ---

  // 1. Select Project
  if (!currentProjectId) {
    return (
      <div className="relative">
        {/* Absolute positioned back button for the selection page context */}
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
          >
            <ArrowLeft size={18} /> 回部門入口
          </button>
        </div>
        <ProjectSelectionPage 
          projects={projects} 
          onSelect={setCurrentProjectId} 
          onCreate={handleCreateProject} 
          onDelete={handleDeleteProject}
          title="內/外案選擇 (採購)"
        />
      </div>
    );
  }

  // 2. Main Application
  const currentProjectName = projects.find(p => p.id === currentProjectId)?.name || '未命名專案';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar - Simplified */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col h-auto md:h-screen sticky top-0 z-20 shadow-xl">
        <div className="p-4 border-b border-slate-700 flex items-center gap-2 text-white bg-slate-950">
          <button 
            onClick={onBackToLanding}
            className="mr-2 p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"
            title="回部門首頁"
          >
            <ArrowLeft size={20} />
          </button>
          <Layout className="text-blue-400" />
          <h1 className="text-lg font-bold tracking-tight">工程採購系統</h1>
        </div>

        <div className="flex-1 p-4 space-y-6">
           <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase mb-1">目前專案</p>
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-3 break-all">
                <FolderOpen size={20} className="text-blue-400 shrink-0" />
                {currentProjectName}
              </div>
              <button 
                onClick={handleSwitchProject}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded transition-colors"
              >
                <ArrowLeftRight size={14} /> 切換專案
              </button>
           </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="bg-slate-800 rounded p-3 mb-2">
            <p className="text-xs text-slate-400">登入身份</p>
            <div className="flex justify-between items-center">
               <p className="font-bold text-white">{userRole}</p>
               {/* Sidebar logout now returns to landing page (dashboard) */}
               <button onClick={onBackToLanding} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                 <ArrowLeft size={10} /> 離開
               </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100 relative">
        <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
          <div className="mb-4">
             <div className="flex items-center gap-3 group">
               <h2 className="text-2xl font-bold text-gray-800">
                 {currentProjectName}
               </h2>
               <button 
                onClick={openEditProjectModal}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="修改專案名稱"
               >
                 <Pencil size={18} />
               </button>
             </div>
          </div>
          
          <div className="flex-1 h-full min-h-0">
            <ProcurementTable 
              currentProjectId={currentProjectId}
              currentProjectName={currentProjectName}
              userRole={userRole}
              onLogout={onBackToLanding} // Map internal table logout to BackToLanding for now
              onBackToHome={handleResetProject}
              key={currentProjectId} // Force re-mount when project changes
            />
          </div>
        </div>
        
        <footer className="bg-white border-t border-gray-200 py-2 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Construction Procurement System.
        </footer>

        {/* Edit Project Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold text-gray-800">修改專案名稱</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditProjectSubmit}>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">新專案名稱</label>
                    <input 
                      type="text" 
                      value={editingProjectName}
                      onChange={(e) => setEditingProjectName(e.target.value)}
                      placeholder="請輸入名稱"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium text-sm"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    disabled={!editingProjectName.trim()}
                    className={`px-4 py-2 text-white rounded font-medium text-sm transition-colors ${
                      editingProjectName.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
                    }`}
                  >
                    儲存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};