import React, { useState, useEffect } from 'react';
import { ProcurementTable } from './components/ProcurementTable';
import { LoginPage } from './components/LoginPage';
import { UserRole, Project } from './types';
import { Layout, Plus, FolderOpen, Folder, X, Pencil } from 'lucide-react';

const PROJECT_STORAGE_KEY = 'procurement_projects_list';

const App: React.FC = () => {
  // --- Auth State ---
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // --- Project State ---
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    // Default project if none exist
    return [{ id: 'default-project', name: '預設工程專案', createdAt: new Date().toISOString() }];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(projects[0]?.id || 'default-project');

  // --- Modal State (Create) ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // --- Modal State (Edit) ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // --- Handlers ---
  const handleLogin = (role: UserRole) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  // Create Project Handlers
  const openCreateProjectModal = () => {
    setNewProjectName('');
    setIsCreateModalOpen(true);
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName && newProjectName.trim()) {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: newProjectName.trim(),
        createdAt: new Date().toISOString()
      };
      setProjects([...projects, newProject]);
      setCurrentProjectId(newProject.id); // Switch to new project
      setIsCreateModalOpen(false);
    }
  };

  // Edit Project Handlers
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

  // --- Render ---
  if (!userRole) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const currentProjectName = projects.find(p => p.id === currentProjectId)?.name || '未命名專案';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar - Project Selector */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col h-auto md:h-screen sticky top-0 z-20 shadow-xl">
        <div className="p-4 border-b border-slate-700 flex items-center gap-2 text-white">
          <Layout className="text-blue-400" />
          <h1 className="text-lg font-bold tracking-tight">工程採購系統</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">專案列表</h3>
              <button 
                onClick={openCreateProjectModal}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                title="建立新專案"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setCurrentProjectId(project.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                    currentProjectId === project.id 
                      ? 'bg-blue-600 text-white font-medium shadow-md' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {currentProjectId === project.id ? <FolderOpen size={18} /> : <Folder size={18} />}
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="bg-slate-800 rounded p-3 mb-2">
            <p className="text-xs text-slate-400">登入身份</p>
            <p className="font-bold text-white">{userRole}</p>
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
             <p className="text-sm text-gray-500">專案 ID: {currentProjectId}</p>
          </div>
          
          <div className="flex-1 h-full min-h-0">
            <ProcurementTable 
              currentProjectId={currentProjectId}
              userRole={userRole}
              onLogout={handleLogout}
            />
          </div>
        </div>
        
        <footer className="bg-white border-t border-gray-200 py-2 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Construction Procurement System.
        </footer>

        {/* Create Project Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold text-gray-800">建立新專案</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateProjectSubmit}>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">專案名稱</label>
                    <input 
                      type="text" 
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="例如：C3-景觀工程"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium text-sm"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    disabled={!newProjectName.trim()}
                    className={`px-4 py-2 text-white rounded font-medium text-sm transition-colors ${
                      newProjectName.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
                    }`}
                  >
                    建立
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

export default App;