import React, { useState } from 'react';
import { Project } from '../types';
import { FolderOpen, Plus, Calendar, Trash2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-5xl border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={40} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{title || '內/外案選擇'}</h1>
          <p className="text-gray-500 mt-2">請選擇專案以開始工作</p>
        </div>

        {!isCreating ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onSelect(project.id)}
                  className="relative flex flex-col items-start p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:bg-blue-50 transition-all group text-left cursor-pointer bg-white"
                >
                  <div className="font-bold text-gray-800 group-hover:text-blue-700 mb-2 truncate w-full text-lg">
                    {project.name}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-auto">
                    <Calendar size={12} />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent entering the project
                      onDelete(project.id, e);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-300 hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="刪除專案"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => setIsCreating(true)}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all min-h-[140px]"
              >
                <Plus size={40} className="mb-2" />
                <span className="font-medium text-lg">建立新專案</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto py-8">
             <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">建立新專案</h3>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">專案名稱</label>
                  <input 
                    type="text" 
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="例如：萬華直興案/板橋府中案"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 justify-center pt-2">
                   <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                   >
                     取消
                   </button>
                   <button 
                    type="submit"
                    disabled={!newProjectName.trim()}
                    className={`px-6 py-2.5 text-white rounded-lg font-medium transition-colors shadow-sm ${
                      newProjectName.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
                    }`}
                   >
                     建立並進入
                   </button>
                </div>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};