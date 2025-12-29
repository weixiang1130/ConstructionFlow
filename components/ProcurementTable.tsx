import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Download, Lock, RefreshCw, Calendar, ChevronLeft, ChevronRight, LogOut, Sparkles } from 'lucide-react';
import { ProcurementRow, UserRole } from '../types';
import { calculateVariance, getVarianceColor } from '../utils';
import { analyzeSchedule } from '../services/geminiService';

// Role Definitions for Display
const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: '管理員 (完整權限)',
  PLANNER: '工地排程 (Site Planner)',
  EXECUTOR: '工地執行 (Site Executor)',
  PROCUREMENT: '採購發包 (Procurement)'
};

// BufferedInput component
const BufferedInput = ({ 
  value, 
  onCommit, 
  className, 
  placeholder, 
  type = 'text',
  disabled = false
}: { 
  value: string; 
  onCommit: (val: string) => void; 
  className?: string; 
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const isComposing = useRef(false);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing.current) {
      onCommit(localValue);
      e.currentTarget.blur();
    }
  };

  const handleBlur = () => {
    onCommit(localValue);
  };

  return (
    <input
      type={type}
      value={localValue}
      disabled={disabled}
      onCompositionStart={() => { isComposing.current = true; }}
      onCompositionEnd={() => { isComposing.current = false; }}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 placeholder-gray-400'}`}
      placeholder={disabled ? '' : placeholder}
    />
  );
};

// Custom Date Picker Modal Component
const CustomDatePicker = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  initialDate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (date: string) => void; 
  initialDate: string; 
}) => {
  if (!isOpen) return null;

  const [viewDate, setViewDate] = useState(() => {
    // Strictly parse YYYY-MM-DD manually to construct a local date. 
    // This prevents timezone shifts and handles invalid inputs gracefully.
    const isValidDate = initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate);
    if (isValidDate) {
      const [y, m, d] = initialDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
  };

  const handleDayClick = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    onSelect(`${year}-${m}-${d}`);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8"></div>);
  }
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    const isSelected = initialDate === dateStr;
    
    // Check if it is today using local time logic
    const today = new Date();
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;

    days.push(
      <button
        type="button"
        key={i}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDayClick(i); }}
        className={`
          h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer
          ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-100 text-gray-700'}
          ${!isSelected && isToday ? 'border border-blue-400 font-bold text-blue-600' : ''}
        `}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[320px] overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
          <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronLeft size={20} /></button>
          <div className="font-bold text-lg tracking-wide">{year}年 {month + 1}月</div>
          <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronRight size={20} /></button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 mb-2 text-center">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <span key={d} className="text-xs font-semibold text-gray-400">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 place-items-center">{days}</div>
        </div>
        <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
           <button type="button" onClick={handleToday} className="text-sm text-blue-600 font-medium hover:text-blue-800 px-2 py-1">跳至今天</button>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 font-medium hover:text-gray-700 px-3 py-1 hover:bg-gray-200 rounded">取消</button>
        </div>
      </div>
    </div>
  );
};

const DateInput = ({ 
  value, 
  onChange, 
  className, 
  disabled = false,
  onOpenPicker
}: { 
  value: string; 
  onChange: (val: string) => void; 
  className?: string; 
  disabled?: boolean;
  onOpenPicker: () => void;
}) => {
  const [isValid, setIsValid] = useState(true);

  // Sync validation state with value prop updates
  useEffect(() => {
    if (!value) {
      setIsValid(true);
      return;
    }
    // Check if the current value matches the format
    setIsValid(/^\d{4}-\d{2}-\d{2}$/.test(value));
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Validate on blur
    if (val && !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

  return (
    <div className="flex items-center w-full gap-1">
      <input
        type="text"
        value={value || ''}
        disabled={disabled}
        placeholder="YYYY-MM-DD"
        maxLength={10}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        className={`${className} flex-1 min-w-0 ${!disabled ? 'cursor-text' : ''} ${!isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
      />
      {!disabled && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenPicker(); }}
          className="p-1.5 bg-white border border-gray-300 rounded text-gray-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm flex-shrink-0"
          title="開啟日曆"
        >
          <Calendar size={16} />
        </button>
      )}
    </div>
  );
};

const INITIAL_ROWS: ProcurementRow[] = [
  {
    id: '1',
    projectId: 'default-project',
    remarks: '',
    projectName: 'A1-主塔樓',
    engineeringItem: '鋼結構工程',
    scheduledRequestDate: '2023-10-01',
    actualRequestDate: '2023-10-05',
    siteOrganizer: '王小明',
    procurementOrganizer: '李大華',
    returnDate: '',
    returnReason: '',
    resubmissionDate: '',
    contractorConfirmDate: '',
    contractorName: ''
  },
  {
    id: '2',
    projectId: 'default-project',
    remarks: '需優先處理',
    projectName: 'B2-裙樓',
    engineeringItem: '混凝土澆置',
    scheduledRequestDate: '2023-10-15',
    actualRequestDate: '2023-10-10',
    siteOrganizer: '王小明',
    procurementOrganizer: '陳採購',
    returnDate: '',
    returnReason: '',
    resubmissionDate: '',
    contractorConfirmDate: '',
    contractorName: ''
  }
];

const STORAGE_KEY = 'procurement_schedule_data';

interface ProcurementTableProps {
  currentProjectId: string;
  userRole: UserRole;
  onLogout: () => void;
}

export const ProcurementTable: React.FC<ProcurementTableProps> = ({ currentProjectId, userRole, onLogout }) => {
  
  // Load ALL rows from storage
  const [allRows, setAllRows] = useState<ProcurementRow[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((r: any) => ({
            ...r,
            remarks: r.remarks || '',
            projectId: r.projectId || 'default-project' // Migration support
          }));
        } catch (e) {
          console.error("Failed to parse saved data", e);
        }
      }
    }
    return INITIAL_ROWS;
  });

  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    rowId: string | null;
    field: keyof ProcurementRow | null;
    currentDate: string;
  }>({ isOpen: false, rowId: null, field: null, currentDate: '' });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Filter rows for current project
  const displayRows = allRows.filter(r => r.projectId === currentProjectId);

  // Save to localStorage whenever allRows changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRows));
  }, [allRows]);

  const isEditable = (field: keyof ProcurementRow): boolean => {
    if (userRole === 'ADMIN') return true;
    switch (userRole) {
      case 'PLANNER': return ['projectName', 'engineeringItem', 'scheduledRequestDate', 'siteOrganizer'].includes(field);
      case 'EXECUTOR': return ['actualRequestDate', 'remarks'].includes(field); 
      case 'PROCUREMENT': return ['procurementOrganizer', 'returnDate', 'returnReason', 'resubmissionDate', 'contractorConfirmDate', 'contractorName'].includes(field);
      default: return false;
    }
  };

  const canManageRows = userRole === 'ADMIN' || userRole === 'PLANNER';

  const addRow = () => {
    if (!canManageRows) return;
    const newRow: ProcurementRow = {
      id: crypto.randomUUID(),
      projectId: currentProjectId, // Assign current project ID
      remarks: '',
      projectName: '',
      engineeringItem: '',
      scheduledRequestDate: '',
      actualRequestDate: '',
      siteOrganizer: '',
      procurementOrganizer: '',
      returnDate: '',
      returnReason: '',
      resubmissionDate: '',
      contractorConfirmDate: '',
      contractorName: ''
    };
    setAllRows([...allRows, newRow]);
  };

  const deleteRow = (id: string) => {
    if (!canManageRows) return;
    setAllRows(allRows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof ProcurementRow, value: string) => {
    if (!isEditable(field)) return;
    setAllRows(prevRows => prevRows.map(row => {
      if (row.id === id) return { ...row, [field]: value };
      return row;
    }));
  };
  
  const resetData = () => {
    if (confirm('確定要重置本專案所有資料嗎？此動作無法復原。')) {
      // Only remove rows for current project, keep others
      const otherProjectRows = allRows.filter(r => r.projectId !== currentProjectId);
      setAllRows([...otherProjectRows]); 
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeSchedule(displayRows);
      setAnalysisResult(result);
    } catch (error) {
      alert("AI 分析失敗，請稍後再試。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "專案名稱", "工程項目", "預定提出時間", "實際提出時間", "時程差異", "燈號狀態", "工地主辦", "採發主辦", "退件日期", "退件原因", "重新提送日期", "確認承攬商日期", "廠商", "備註"
    ];
    
    const csvContent = [
      headers.join(','),
      ...displayRows.map(row => {
        const variance = calculateVariance(row.scheduledRequestDate, row.actualRequestDate);
        let status = "正常";
        if (variance !== null && variance < 0) {
            const delay = Math.abs(variance);
            if (delay > 30) status = "嚴重延誤 (紅燈)";
            else if (delay >= 8) status = "延誤需通知 (橘燈)";
            else status = "警示 (黃燈)";
        }
        return [
          row.projectName,
          row.engineeringItem,
          row.scheduledRequestDate,
          row.actualRequestDate,
          variance ?? '',
          status,
          row.siteOrganizer,
          row.procurementOrganizer,
          row.returnDate,
          row.returnReason,
          row.resubmissionDate,
          row.contractorConfirmDate,
          row.contractorName,
          row.remarks
        ].map(val => `"${val}"`).join(',');
      })
    ].join('\n');

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `procurement_schedule_${currentProjectId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getInputClass = (field: keyof ProcurementRow) => {
    const editable = isEditable(field);
    const base = "w-full p-2 rounded outline-none transition-all border border-transparent";
    if (editable) {
      return `${base} bg-white text-gray-900 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm`;
    }
    return `${base} bg-gray-100 text-gray-400 cursor-not-allowed select-none`;
  };

  const handleOpenPicker = (rowId: string, field: keyof ProcurementRow, currentDate: string) => {
    setPickerState({ isOpen: true, rowId, field, currentDate });
  };

  const handleDateSelect = (dateStr: string) => {
    if (pickerState.rowId && pickerState.field) {
      updateRow(pickerState.rowId, pickerState.field, dateStr);
      setPickerState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const StatusLight = ({ variance }: { variance: number | null }) => {
    if (variance === null) return <div className="w-5 h-5 rounded-full bg-gray-200" title="無資料" />;
    if (variance >= 0) return <div className="flex justify-center"><div className="w-5 h-5 rounded-full bg-green-500 shadow-md ring-2 ring-green-100" title="正常" /></div>;
    const delay = Math.abs(variance);
    if (delay <= 7) return <div className="flex justify-center"><div className="w-5 h-5 rounded-full bg-yellow-400 shadow-md ring-2 ring-yellow-100" title={`警示: 延誤 ${delay} 天`} /></div>;
    if (delay <= 30) return <div className="flex justify-center"><div className="w-5 h-5 rounded-full bg-orange-500 shadow-md ring-2 ring-orange-100" title={`通知工地: 延誤 ${delay} 天`} /></div>;
    return <div className="flex justify-center"><div className="relative flex items-center justify-center"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><div className="relative w-5 h-5 rounded-full bg-red-600 shadow-md ring-2 ring-red-100" title={`通知長官: 延誤 ${delay} 天`}></div></div></div>;
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
      <CustomDatePicker 
        isOpen={pickerState.isOpen}
        initialDate={pickerState.currentDate}
        onSelect={handleDateSelect}
        onClose={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* AI Analysis Modal */}
      {analysisResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setAnalysisResult(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-300" />
                <h3 className="text-lg font-bold">AI 智能進度分析報告</h3>
              </div>
              <button onClick={() => setAnalysisResult(null)} className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded">
                <LogOut size={20} className="rotate-180" /> {/* Using LogOut icon as close for now, or X */}
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">行政摘要</h4>
                <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{analysisResult.summary}</p>
              </div>

              {analysisResult.criticalDelays.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">嚴重延誤警示</h4>
                  <ul className="space-y-3">
                    {analysisResult.criticalDelays.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                        <div className="shrink-0 w-1.5 bg-red-500 rounded-full mt-1.5 h-1.5"></div>
                        <span className="text-red-800 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-2">趕工建議策略</h4>
                <ul className="space-y-3">
                  {analysisResult.recommendations.map((item: string, idx: number) => (
                    <li key={idx} className="flex gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold border border-blue-200">{idx + 1}</div>
                      <span className="text-blue-900 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 shrink-0 text-right">
              <button onClick={() => setAnalysisResult(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium text-sm transition-colors">
                關閉報告
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200">
        <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-800">請採購項目管理表</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || displayRows.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded text-white shadow-sm text-sm font-medium transition-all ${isAnalyzing || displayRows.length === 0 ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isAnalyzing ? <span className="animate-spin">⏳</span> : <Sparkles size={16} />} 
              {isAnalyzing ? '分析中...' : 'AI 進度分析'}
            </button>

            {canManageRows && (
              <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
                <Plus size={16} /> 新增項目
              </button>
            )}
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm text-sm font-medium">
              <Download size={16} /> 匯出 CSV
            </button>
             <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors shadow-sm text-sm font-medium ml-2">
              <LogOut size={16} /> 登出
            </button>
          </div>
        </div>
        
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Lock size={12} />
            <span>目前權限: </span>
            <span className="font-medium text-gray-700">{ROLE_DESCRIPTIONS[userRole]}</span>
            {!canManageRows && <span className="text-red-400 ml-2">(新增/刪除功能已鎖定)</span>}
          </div>
          {userRole === 'ADMIN' && (
            <button onClick={resetData} className="flex items-center gap-1 text-gray-400 hover:text-red-600 transition-colors">
              <RefreshCw size={10} /> 重置本專案資料
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative bg-gray-50">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 shadow-sm">
             <tr className="divide-x divide-gray-300 border-b border-gray-300">
              <th className="bg-gray-100 p-2 text-center text-gray-700 font-bold min-w-[50px]">操作</th>
              <th className="bg-blue-100 p-2 text-center text-blue-900 font-bold" colSpan={6}>提出請購時程 (工地)</th>
              <th className="bg-amber-100 p-2 text-center text-amber-900 font-bold" colSpan={2}>退件 (採購)</th>
              <th className="bg-orange-100 p-2 text-center text-orange-900 font-bold" colSpan={1}>工地重新提送</th>
              <th className="bg-gray-100 p-2 text-center text-gray-800 font-bold" colSpan={2}>確認</th>
              <th className="bg-yellow-300 p-2 text-center text-yellow-900 font-bold border-l-4 border-yellow-500" colSpan={2}>結果</th>
              <th className="bg-gray-100 p-2 text-center text-gray-700 font-bold min-w-[150px]">備註</th>
            </tr>
            <tr className="divide-x divide-gray-300 border-b border-gray-300 text-xs text-gray-700">
              <th className="bg-gray-50 p-2 min-w-[50px]"></th>
              <th className="bg-blue-50 p-2 min-w-[150px] font-semibold">專案名稱</th>
              <th className="bg-blue-50 p-2 min-w-[150px] font-semibold">工程項目</th>
              <th className="bg-blue-50 p-2 min-w-[130px] font-semibold">預定提出時間</th>
              <th className="bg-blue-50 p-2 min-w-[130px] font-semibold">實際提出時間</th>
              <th className="bg-blue-50 p-2 min-w-[100px] font-semibold">工地主辦</th>
              <th className="bg-blue-50 p-2 min-w-[100px] font-semibold">採發主辦</th>
              <th className="bg-amber-50 p-2 min-w-[130px] font-semibold">退件日期</th>
              <th className="bg-amber-50 p-2 min-w-[150px] font-semibold">退件原因</th>
              <th className="bg-orange-50 p-2 min-w-[130px] font-semibold">重新提送日期</th>
              <th className="bg-gray-50 p-2 min-w-[130px] font-semibold">確認承攬商日期</th>
              <th className="bg-gray-50 p-2 min-w-[150px] font-semibold">廠商</th>
              <th className="bg-yellow-100 p-2 min-w-[100px] font-semibold border-l-2 border-yellow-300">請購時程差異</th>
              <th className="bg-yellow-100 p-2 min-w-[60px] font-semibold">燈號</th>
              <th className="bg-gray-50 p-2 min-w-[150px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {displayRows.map((row) => {
               const variance = calculateVariance(row.scheduledRequestDate, row.actualRequestDate);
               const varianceColor = getVarianceColor(variance);

               return (
                <tr key={row.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="p-2 text-center border-r border-gray-200">
                    <button 
                      onClick={() => deleteRow(row.id)}
                      disabled={!canManageRows}
                      className={`p-1 rounded transition-colors ${canManageRows ? 'text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer' : 'text-gray-200 cursor-not-allowed'}`}
                      title={canManageRows ? "刪除" : "無刪除權限"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                  <td className="p-1 border-r border-gray-100"><BufferedInput value={row.projectName} disabled={!isEditable('projectName')} onCommit={(val) => updateRow(row.id, 'projectName', val)} className={getInputClass('projectName')} placeholder="輸入專案名稱"/></td>
                  <td className="p-1 border-r border-gray-100"><BufferedInput value={row.engineeringItem} disabled={!isEditable('engineeringItem')} onCommit={(val) => updateRow(row.id, 'engineeringItem', val)} className={getInputClass('engineeringItem')} placeholder="輸入工程項目"/></td>
                  <td className="p-1 border-r border-gray-100"><DateInput value={row.scheduledRequestDate} disabled={!isEditable('scheduledRequestDate')} onChange={(val) => updateRow(row.id, 'scheduledRequestDate', val)} className={getInputClass('scheduledRequestDate')} onOpenPicker={() => handleOpenPicker(row.id, 'scheduledRequestDate', row.scheduledRequestDate)}/></td>
                  <td className="p-1 border-r border-gray-100"><DateInput value={row.actualRequestDate} disabled={!isEditable('actualRequestDate')} onChange={(val) => updateRow(row.id, 'actualRequestDate', val)} className={getInputClass('actualRequestDate')} onOpenPicker={() => handleOpenPicker(row.id, 'actualRequestDate', row.actualRequestDate)}/></td>
                  <td className="p-1 border-r border-gray-100"><BufferedInput value={row.siteOrganizer} disabled={!isEditable('siteOrganizer')} onCommit={(val) => updateRow(row.id, 'siteOrganizer', val)} className={getInputClass('siteOrganizer')}/></td>
                  <td className="p-1 border-r border-gray-100"><BufferedInput value={row.procurementOrganizer} disabled={!isEditable('procurementOrganizer')} onCommit={(val) => updateRow(row.id, 'procurementOrganizer', val)} className={getInputClass('procurementOrganizer')}/></td>
                  <td className="p-1 border-r border-gray-100"><DateInput value={row.returnDate} disabled={!isEditable('returnDate')} onChange={(val) => updateRow(row.id, 'returnDate', val)} className={getInputClass('returnDate')} onOpenPicker={() => handleOpenPicker(row.id, 'returnDate', row.returnDate)}/></td>
                  <td className="p-1 border-r border-gray-100"><BufferedInput value={row.returnReason} disabled={!isEditable('returnReason')} onCommit={(val) => updateRow(row.id, 'returnReason', val)} className={getInputClass('returnReason')} placeholder=""/></td>
                  <td className="p-1 border-r border-gray-100"><DateInput value={row.resubmissionDate} disabled={!isEditable('resubmissionDate')} onChange={(val) => updateRow(row.id, 'resubmissionDate', val)} className={getInputClass('resubmissionDate')} onOpenPicker={() => handleOpenPicker(row.id, 'resubmissionDate', row.resubmissionDate)}/></td>
                  <td className="p-1 border-r border-gray-100"><DateInput value={row.contractorConfirmDate} disabled={!isEditable('contractorConfirmDate')} onChange={(val) => updateRow(row.id, 'contractorConfirmDate', val)} className={getInputClass('contractorConfirmDate')} onOpenPicker={() => handleOpenPicker(row.id, 'contractorConfirmDate', row.contractorConfirmDate)}/></td>
                  <td className="p-1 border-r border-gray-100"><BufferedInput value={row.contractorName} disabled={!isEditable('contractorName')} onCommit={(val) => updateRow(row.id, 'contractorName', val)} className={getInputClass('contractorName')}/></td>
                  <td className={`p-2 text-center bg-yellow-50 border-l-2 border-yellow-200 ${varianceColor}`}>{variance !== null ? (variance > 0 ? `+${variance}` : variance) : '-'}</td>
                  <td className="p-2 text-center bg-yellow-50"><StatusLight variance={variance} /></td>
                  <td className="p-1 border-l border-gray-100"><BufferedInput value={row.remarks} disabled={!isEditable('remarks')} onCommit={(val) => updateRow(row.id, 'remarks', val)} className={getInputClass('remarks')} placeholder="工作說明..."/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {displayRows.length === 0 && (
          <div className="text-center py-12 text-gray-400"><p>本專案無資料。請點擊「新增項目」開始。</p></div>
        )}
      </div>
      <div className="p-2 bg-gray-50 border-t text-xs text-gray-500 flex flex-wrap justify-center gap-4">
        <span>計算公式: -(實際提出時間 - 預定提出時間)</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> 正常 (無延誤)</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div> 警示 (延誤 1-7 天)</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> 通知工地 (延誤 8-30 天)</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-600 rounded-full"></div> 通知長官 (延誤 > 30 天)</span>
      </div>
    </div>
  );
};