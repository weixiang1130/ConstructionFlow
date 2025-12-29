import React from 'react';
import { ProcurementTable } from './components/ProcurementTable';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">請採購項目管理表</h1>
        <p className="text-gray-600 mt-2">施工採購進度追蹤、延誤分析與時程管理系統</p>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto h-[80vh]">
        <ProcurementTable />
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm pb-4">
        &copy; {new Date().getFullYear()} Construction Procurement System. All rights reserved.
      </footer>
    </div>
  );
};

export default App;