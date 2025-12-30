import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Activity, AlertCircle, CheckCircle2, Download, ChevronDown, Layers, TrendingUp } from 'lucide-react';
import { OperationRow } from '../types';
import { calculateDuration, calculateVariance } from '../utils';

const STORAGE_KEY = 'operations_control_data';

const OPERATION_STAGES = [
  '設計階段', 
  '假設工程', 
  '地工工程', 
  '結構工程', 
  '外牆工程', 
  '內裝工程', 
  '設備工程', 
  '使用執照', 
  '交屋驗收'
];

// --- Shared Helper Components ---

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
      className={`${className} ${disabled ? 'bg-transparent text-slate-400 cursor-not-allowed' : 'bg-transparent text-slate-900 focus:ring-2 focus:ring-indigo-500 placeholder-slate-300'}`}
      placeholder={disabled ? '' : placeholder}
    />
  );
};

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
    const isValidDate = initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate);
    if (isValidDate) {
      const [y, m, d] = initialDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const handleToday = () => setViewDate(new Date());

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
    const today = new Date();
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;

    days.push(
      <button
        type="button"
        key={i}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDayClick(i); }}
        className={`
          h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer
          ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-50 text-slate-700'}
          ${!isSelected && isToday ? 'border border-indigo-400 font-bold text-indigo-600' : ''}
        `}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[320px] overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
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
           <button type="button" onClick={handleToday} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 px-2 py-1">跳至今天</button>
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

  useEffect(() => {
    if (!value) {
      setIsValid(true);
      return;
    }
    setIsValid(/^\d{4}-\d{2}-\d{2}$/.test(value));
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

  return (
    <div className="flex items-center w-full gap-1 group/date">
      <input
        type="text"
        value={value || ''}
        disabled={disabled}
        placeholder="-"
        maxLength={10}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        className={`${className} flex-1 text-center bg-transparent text-slate-900 ${!disabled ? 'cursor-text' : ''} ${!isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
      />
      {!disabled && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenPicker(); }}
          className="p-1 opacity-0 group-hover/date:opacity-100 text-slate-400 hover:text-indigo-600 transition-all flex-shrink-0"
          title="開啟日曆"
        >
          <Calendar size={14} />
        </button>
      )}
    </div>
  );
};

// --- Main Operations Table ---

interface OperationsTableProps {
  currentProjectId: string;
  currentProjectName: string;
}

export const OperationsTable: React.FC<OperationsTableProps> = ({ currentProjectId, currentProjectName }) => {
  const [allRows, setAllRows] = useState<OperationRow[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    OPERATION_STAGES.forEach(stage => initial[stage] = true);
    initial['Uncategorized'] = true;
    return initial;
  });

  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    rowId: string | null;
    field: keyof OperationRow | null;
    currentDate: string;
  }>({ isOpen: false, rowId: null, field: null, currentDate: '' });

  const displayRows = allRows.filter(r => r.projectId === currentProjectId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRows));
  }, [allRows]);

  const addRow = (category: string = '') => {
    const newRow: OperationRow = {
      id: crypto.randomUUID(),
      projectId: currentProjectId,
      category: category,
      item: '',
      scheduledStartDate: '',
      scheduledEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      remarks: ''
    };
    setAllRows([...allRows, newRow]);
    
    // Ensure the group is expanded when adding
    if (category) {
        setExpandedGroups(prev => ({...prev, [category]: true}));
    } else {
        setExpandedGroups(prev => ({...prev, ['Uncategorized']: true}));
    }
  };

  const deleteRow = (id: string) => {
    if (confirm("確定要刪除此項目嗎？")) {
      setAllRows(allRows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof OperationRow, value: string) => {
    setAllRows(prevRows => prevRows.map(row => {
      if (row.id === id) return { ...row, [field]: value };
      return row;
    }));
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleOpenPicker = (rowId: string, field: keyof OperationRow, currentDate: string) => {
    setPickerState({ isOpen: true, rowId, field, currentDate });
  };

  const handleDateSelect = (dateStr: string) => {
    if (pickerState.rowId && pickerState.field) {
      updateRow(pickerState.rowId, pickerState.field, dateStr);
      setPickerState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const getInputClass = (isDate = false) => {
    const base = "w-full rounded outline-none transition-all border-b border-transparent text-sm py-1 px-2";
    return `${base} hover:border-slate-300 focus:border-indigo-500`;
  };

  // --- Logic Helpers ---
  const calculateProgress = (start: string, end: string, scheduledEnd: string) => {
    if (!start) return 0;
    
    const startDate = new Date(start);
    const today = new Date();
    today.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);

    if (today < startDate) return 0;

    let targetEndDate: Date;
    if (end) {
        targetEndDate = new Date(end);
    } else if (scheduledEnd) {
        targetEndDate = new Date(scheduledEnd);
    } else {
        return 0;
    }
    targetEndDate.setHours(0,0,0,0);

    const totalDuration = targetEndDate.getTime() - startDate.getTime();
    if (totalDuration <= 0) return 100;

    const elapsed = today.getTime() - startDate.getTime();
    
    let pct = (elapsed / totalDuration) * 100;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    
    return Math.round(pct);
  };

  const calculateOverallProjectProgress = (rows: OperationRow[]): number => {
    const actualStartDates = rows
      .map(r => r.actualStartDate)
      .filter(d => d && !isNaN(new Date(d).getTime()))
      .map(d => new Date(d).getTime());

    if (actualStartDates.length === 0) return 0;
    const projectStart = Math.min(...actualStartDates);

    const handoverRows = rows.filter(r => r.category === '交屋驗收');
    const targetRow = handoverRows.length > 0 
      ? handoverRows[handoverRows.length - 1] 
      : rows[rows.length - 1];

    if (!targetRow) return 0;
    if (targetRow.actualEndDate && !isNaN(new Date(targetRow.actualEndDate).getTime())) return 100;

    const scheduledEndStr = targetRow.scheduledEndDate;
    if (!scheduledEndStr || isNaN(new Date(scheduledEndStr).getTime())) return 0;
    
    const projectTarget = new Date(scheduledEndStr).getTime();
    const today = new Date().setHours(0,0,0,0);
    const totalDuration = projectTarget - projectStart;
    
    if (totalDuration <= 0) return 0;
    const elapsed = today - projectStart;
    if (elapsed < 0) return 0;

    let pct = (elapsed / totalDuration) * 100;
    if (pct > 99) pct = 99;
    if (pct < 0) pct = 0;

    return Math.round(pct);
  };

  const StatusIndicator = ({ variance }: { variance: number | null }) => {
    if (variance === null) return <span className="text-slate-300 text-xs">-</span>;

    if (variance >= 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">正常</span>;
    if (variance > -10) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">輕微落後</span>;
    if (variance > -30) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">警示</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">嚴重落後</span>;
  };

  const exportCSV = () => {
    const headers = ["區分", "工程項目", "預定開始", "預定完成", "預定工期", "實際開始", "實際完成", "實際工期", "差異天數", "燈號狀態", "工期百分比", "備註"];
    const csvContent = [headers.join(','), ...displayRows.map(row => {
        const scheduledDuration = calculateDuration(row.scheduledStartDate, row.scheduledEndDate);
        const actualDuration = calculateDuration(row.actualStartDate, row.actualEndDate);
        const variance = calculateVariance(row.scheduledEndDate, row.actualEndDate);
        const progressPct = calculateProgress(row.actualStartDate, row.actualEndDate, row.scheduledEndDate);
        let status = "正常";
        if (variance !== null && variance < 0) {
            if (variance <= -30) status = "嚴重落後";
            else if (variance <= -11) status = "警示落後";
            else status = "輕微落後";
        }
        return [row.category, row.item, row.scheduledStartDate, row.scheduledEndDate, scheduledDuration ?? '', row.actualStartDate, row.actualEndDate, actualDuration ?? '', variance !== null ? variance : '', status, `${progressPct}%`, row.remarks].map(val => `"${val}"`).join(',');
      })].join('\n');

    const dateStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${currentProjectName}_營運管理_${dateStr}.csv`;
    link.click();
  };

  const overallProgress = calculateOverallProjectProgress(displayRows);

  return (
    <div className="flex flex-col h-full bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
      <CustomDatePicker 
        isOpen={pickerState.isOpen}
        initialDate={pickerState.currentDate}
        onSelect={handleDateSelect}
        onClose={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="bg-white border-b border-slate-200">
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Activity size={20} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800">全程營運管理控制表</h2>
                <p className="text-sm text-slate-500">Gantt 核心進度追蹤</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium">
              <Download size={16} /> 匯出
            </button>
            <button onClick={() => addRow('')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium">
              <Plus size={16} /> 新增
            </button>
          </div>
        </div>
        
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
               <div>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">專案總項目</p>
                 <p className="text-2xl font-bold text-indigo-600">{displayRows.length}</p>
               </div>
               <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-indigo-500">
                 <Layers size={20} />
               </div>
             </div>

             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between col-span-2">
               <div>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">全程預定進度</p>
                 <div className="flex items-end gap-3">
                    <p className="text-3xl font-bold text-emerald-600 leading-none">{overallProgress}%</p>
                    <div className="w-48 h-2.5 bg-slate-200 rounded-full mb-1.5 overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }}></div>
                    </div>
                 </div>
               </div>
               <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-emerald-500">
                 <TrendingUp size={20} />
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative bg-white">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 shadow-sm bg-slate-50/90 backdrop-blur-sm">
            <tr>
              <th className="bg-slate-50 p-3 w-[50px] border-b border-slate-200"></th>
              <th className="bg-slate-50 p-3 text-left font-bold text-slate-700 border-b border-slate-200 pl-4">工程項目</th>
              <th className="bg-blue-50/50 p-3 text-center font-bold text-blue-900 border-b border-blue-100 border-l border-blue-100" colSpan={3}>預定進度</th>
              <th className="bg-indigo-50/50 p-3 text-center font-bold text-indigo-900 border-b border-indigo-100 border-l border-indigo-100" colSpan={3}>實際進度</th>
              <th className="bg-slate-50 p-3 text-center font-bold text-slate-700 border-b border-slate-200 border-l border-slate-200" colSpan={4}>管理指標</th>
            </tr>
            <tr className="text-xs text-slate-500 font-medium">
              <th className="bg-slate-50 p-2 border-b border-slate-200"></th>
              <th className="bg-slate-50 p-2 text-left border-b border-slate-200 pl-4 min-w-[200px]">項目說明</th>
              
              <th className="bg-blue-50/50 p-2 min-w-[110px] text-center text-blue-800 border-b border-blue-100 border-l border-blue-100">開始</th>
              <th className="bg-blue-50/50 p-2 min-w-[110px] text-center text-blue-800 border-b border-blue-100">完成</th>
              <th className="bg-blue-50/50 p-2 min-w-[60px] text-center text-blue-800 border-b border-blue-100">工期</th>
              
              <th className="bg-indigo-50/50 p-2 min-w-[110px] text-center text-indigo-800 border-b border-indigo-100 border-l border-indigo-100">開始</th>
              <th className="bg-indigo-50/50 p-2 min-w-[110px] text-center text-indigo-800 border-b border-indigo-100">完成</th>
              <th className="bg-indigo-50/50 p-2 min-w-[60px] text-center text-indigo-800 border-b border-indigo-100">工期</th>
              
              <th className="bg-slate-50 p-2 min-w-[80px] text-center border-b border-slate-200 border-l border-slate-200">差異</th>
              <th className="bg-slate-50 p-2 min-w-[100px] text-center border-b border-slate-200">狀態</th>
              <th className="bg-slate-50 p-2 min-w-[100px] text-center border-b border-slate-200">進度 %</th>
              <th className="bg-slate-50 p-2 min-w-[150px] text-left border-b border-slate-200 pl-4">備註</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {[...OPERATION_STAGES, 'Uncategorized'].map(stage => {
               const isUncategorized = stage === 'Uncategorized';
               const groupRows = displayRows.filter(r => isUncategorized ? (!r.category || !OPERATION_STAGES.includes(r.category)) : r.category === stage);
               const isExpanded = expandedGroups[stage];

               if (isUncategorized && groupRows.length === 0) return null;

               return (
                 <React.Fragment key={stage}>
                   <tr className="bg-slate-50/50 hover:bg-slate-100 transition-colors">
                     <td colSpan={12} className="p-0 border-b border-slate-100">
                       <div 
                         className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none"
                         onClick={() => toggleGroup(stage)}
                       >
                          <div className="flex items-center gap-3">
                              <div className="text-slate-400">
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </div>
                              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                  {isUncategorized ? '未分類項目' : stage}
                                  <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{groupRows.length}</span>
                              </span>
                          </div>
                          {!isUncategorized && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); addRow(stage); }}
                                className="flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-400 px-2 py-1 rounded shadow-sm transition-colors"
                            >
                                <Plus size={14} /> 新增
                            </button>
                         )}
                       </div>
                     </td>
                   </tr>

                   {isExpanded && groupRows.map(row => {
                      const scheduledDuration = calculateDuration(row.scheduledStartDate, row.scheduledEndDate);
                      const actualDuration = calculateDuration(row.actualStartDate, row.actualEndDate);
                      const variance = calculateVariance(row.scheduledEndDate, row.actualEndDate);
                      const progressPct = calculateProgress(row.actualStartDate, row.actualEndDate, row.scheduledEndDate);

                      return (
                        <tr key={row.id} className="hover:bg-indigo-50/30 group transition-colors">
                            <td className="p-2 text-center border-b border-slate-100">
                                <button onClick={() => deleteRow(row.id)} className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                            <td className="p-2 border-b border-slate-100 pl-4">
                                <BufferedInput value={row.item} onCommit={(v) => updateRow(row.id, 'item', v)} className={getInputClass()} placeholder="項目名稱" />
                            </td>

                            <td className="p-2 border-b border-slate-100 border-l border-slate-50 bg-blue-50/10">
                                <DateInput value={row.scheduledStartDate} onChange={(v) => updateRow(row.id, 'scheduledStartDate', v)} className={getInputClass(true)} onOpenPicker={() => handleOpenPicker(row.id, 'scheduledStartDate', row.scheduledStartDate)} />
                            </td>
                            <td className="p-2 border-b border-slate-100 bg-blue-50/10">
                                <DateInput value={row.scheduledEndDate} onChange={(v) => updateRow(row.id, 'scheduledEndDate', v)} className={getInputClass(true)} onOpenPicker={() => handleOpenPicker(row.id, 'scheduledEndDate', row.scheduledEndDate)} />
                            </td>
                            <td className="p-2 text-center border-b border-slate-100 text-blue-700 font-medium text-xs bg-blue-50/10">
                                {scheduledDuration || '-'}
                            </td>

                            <td className="p-2 border-b border-slate-100 border-l border-slate-50 bg-indigo-50/10">
                                <DateInput value={row.actualStartDate} onChange={(v) => updateRow(row.id, 'actualStartDate', v)} className={getInputClass(true)} onOpenPicker={() => handleOpenPicker(row.id, 'actualStartDate', row.actualStartDate)} />
                            </td>
                            <td className="p-2 border-b border-slate-100 bg-indigo-50/10">
                                <DateInput value={row.actualEndDate} onChange={(v) => updateRow(row.id, 'actualEndDate', v)} className={getInputClass(true)} onOpenPicker={() => handleOpenPicker(row.id, 'actualEndDate', row.actualEndDate)} />
                            </td>
                            <td className="p-2 text-center border-b border-slate-100 text-indigo-700 font-medium text-xs bg-indigo-50/10">
                                {actualDuration || '-'}
                            </td>

                            <td className={`p-2 text-center border-b border-slate-100 border-l border-slate-50 font-bold text-xs ${variance !== null && variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {variance !== null ? (variance > 0 ? `+${variance}` : variance) : '-'}
                            </td>
                            <td className="p-2 text-center border-b border-slate-100">
                                <StatusIndicator variance={variance} />
                            </td>
                            <td className="p-2 text-center border-b border-slate-100">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${progressPct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${progressPct}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 w-8 text-right">{progressPct}%</span>
                                </div>
                            </td>
                            <td className="p-2 border-b border-slate-100 border-l border-slate-50">
                                <BufferedInput value={row.remarks} onCommit={(v) => updateRow(row.id, 'remarks', v)} className={getInputClass()} placeholder="..." />
                            </td>
                        </tr>
                      );
                   })}
                 </React.Fragment>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};