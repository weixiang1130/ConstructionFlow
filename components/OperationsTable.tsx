import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Activity, AlertCircle, CheckCircle2, Download, ChevronDown, FolderOpen, TrendingUp, Layers } from 'lucide-react';
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

// --- Shared Helper Components (Duplicated to maintain independence) ---

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
      className={`${className} ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 placeholder-gray-400'}`}
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
          ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-100 text-gray-700'}
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
    <div className="flex items-center w-full gap-1">
      <input
        type="text"
        value={value || ''}
        disabled={disabled}
        placeholder="YYYY-MM-DD"
        maxLength={10}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        className={`${className} flex-1 min-w-0 ${!isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
      />
      {!disabled && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenPicker(); }}
          className="p-1.5 bg-white border border-gray-300 rounded text-gray-500 hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 transition-all shadow-sm flex-shrink-0"
          title="開啟日曆"
        >
          <Calendar size={16} />
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
    const base = "w-full p-2 rounded outline-none transition-all border border-transparent bg-white text-gray-900 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-sm";
    return base;
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
    // 1. Determine Project Start: Earliest Actual Start of ANY item
    // We look at the whole project to see when it actually began.
    const actualStartDates = rows
      .map(r => r.actualStartDate)
      .filter(d => d && !isNaN(new Date(d).getTime()))
      .map(d => new Date(d).getTime());

    if (actualStartDates.length === 0) return 0;
    const projectStart = Math.min(...actualStartDates);

    // 2. Determine Project Target: The *Last Item* of '交屋驗收' (Handover) category
    const handoverRows = rows.filter(r => r.category === '交屋驗收');
    
    // Fallback: If no handover rows, use the very last row of the project
    const targetRow = handoverRows.length > 0 
      ? handoverRows[handoverRows.length - 1] 
      : rows[rows.length - 1];

    if (!targetRow) return 0;

    // 3. Completion Check: Has the Handover Item actually finished?
    if (targetRow.actualEndDate && !isNaN(new Date(targetRow.actualEndDate).getTime())) {
      return 100; // Fully Completed
    }

    // 4. Get Benchmark Date: Scheduled End Date of that Handover Item
    const scheduledEndStr = targetRow.scheduledEndDate;
    if (!scheduledEndStr || isNaN(new Date(scheduledEndStr).getTime())) return 0;
    
    const projectTarget = new Date(scheduledEndStr).getTime();

    // 5. Calculate Progress Percentage
    const today = new Date().setHours(0,0,0,0);
    
    // Total project duration based on (Handover Scheduled End - Project Start)
    const totalDuration = projectTarget - projectStart;
    
    // If invalid duration (e.g., start > end), default to 0
    if (totalDuration <= 0) return 0;

    const elapsed = today - projectStart;
    
    // If we are before start date, 0%
    if (elapsed < 0) return 0;

    let pct = (elapsed / totalDuration) * 100;
    
    // Cap at 99% if not marked as "Actual End" (completed)
    // This allows the user to see they are "at the end" without falsely claiming completion.
    if (pct > 99) pct = 99;
    if (pct < 0) pct = 0;

    return Math.round(pct);
  };

  const StatusIndicator = ({ variance }: { variance: number | null }) => {
    if (variance === null) return <div className="text-gray-300 text-xs">-</div>;

    if (variance >= 0) {
      return <div className="flex items-center justify-center"><CheckCircle2 className="text-green-500" size={20} /></div>;
    }
    if (variance > -10) {
       return <div className="flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-yellow-400 ring-2 ring-yellow-100 shadow-sm"></div></div>;
    }
    if (variance > -30) {
       return <div className="flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-orange-500 ring-2 ring-orange-100 shadow-sm"></div></div>;
    }
    return <div className="flex items-center justify-center"><AlertCircle className="text-red-600" size={20} /></div>;
  };

  const exportCSV = () => {
    const headers = [
      "區分", "工程項目", 
      "預定開始", "預定完成", "預定工期", 
      "實際開始", "實際完成", "實際工期", 
      "差異天數", "燈號狀態", "工期百分比", "備註"
    ];
    
    const csvContent = [
      headers.join(','),
      ...displayRows.map(row => {
        const scheduledDuration = calculateDuration(row.scheduledStartDate, row.scheduledEndDate);
        const actualDuration = calculateDuration(row.actualStartDate, row.actualEndDate);
        const variance = calculateVariance(row.scheduledEndDate, row.actualEndDate);
        const progressPct = calculateProgress(row.actualStartDate, row.actualEndDate, row.scheduledEndDate);
        
        let status = "正常";
        if (variance !== null && variance < 0) {
            if (variance <= -30) status = "嚴重落後 (紅)";
            else if (variance <= -11) status = "警示落後 (橘)";
            else status = "輕微落後 (黃)";
        }

        return [
          row.category,
          row.item,
          row.scheduledStartDate,
          row.scheduledEndDate,
          scheduledDuration ?? '',
          row.actualStartDate,
          row.actualEndDate,
          actualDuration ?? '',
          variance !== null ? (variance > 0 ? `+${variance}` : variance) : '',
          status,
          `${progressPct}%`,
          row.remarks
        ].map(val => `"${val}"`).join(',');
      })
    ].join('\n');

    const dateStr = new Date().toISOString().split('T')[0];
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${currentProjectName}_營運管理控制表_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const overallProgress = calculateOverallProjectProgress(displayRows);

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
      <CustomDatePicker 
        isOpen={pickerState.isOpen}
        initialDate={pickerState.currentDate}
        onSelect={handleDateSelect}
        onClose={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="bg-white border-b border-gray-200">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="text-indigo-600" />
              全程營運管理控制表
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium">
              <Download size={16} /> 匯出 Excel
            </button>
            <button onClick={() => addRow('')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium">
              <Plus size={16} /> 新增未分類項目
            </button>
          </div>
        </div>
        
        {/* Dashboard Summary */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
               <div>
                 <p className="text-gray-500 text-sm font-medium">專案總項目</p>
                 <p className="text-2xl font-bold mt-1 text-indigo-600">{displayRows.length}</p>
               </div>
               <div className="p-3 rounded-full bg-indigo-50">
                 <Layers className="text-indigo-600" size={24} />
               </div>
             </div>

             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
               <div>
                 <p className="text-gray-500 text-sm font-medium">全程預定進度</p>
                 <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold mt-1 text-emerald-600">{overallProgress}%</p>
                    <span className="text-xs text-gray-400 mb-1">(依據交屋驗收排程)</span>
                 </div>
               </div>
               <div className="p-3 rounded-full bg-emerald-50">
                 <TrendingUp className="text-emerald-600" size={24} />
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative bg-gray-50">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 shadow-sm">
            <tr className="divide-x divide-gray-300 border-b border-gray-300">
              <th className="bg-gray-100 p-2 min-w-[50px] font-bold text-gray-600">操作</th>
              <th className="bg-gray-100 p-2 font-bold text-gray-700">工程項目</th>
              {/* Scheduled Group */}
              <th className="bg-blue-100 p-2 font-bold text-blue-900 border-b-2 border-blue-200" colSpan={3}>預定進度</th>
              {/* Actual Group */}
              <th className="bg-yellow-100 p-2 font-bold text-yellow-900 border-b-2 border-yellow-200" colSpan={3}>實際進度</th>
              {/* Indicators Group */}
              <th className="bg-gray-100 p-2 font-bold text-gray-800" colSpan={4}>管理指標</th>
            </tr>
            <tr className="divide-x divide-gray-300 border-b border-gray-300 text-xs">
              <th className="bg-gray-50 p-2"></th>
              <th className="bg-gray-50 p-2 min-w-[150px] font-semibold text-gray-600">項目說明</th>
              
              <th className="bg-blue-50 p-2 min-w-[130px] font-semibold text-blue-800">開始日期</th>
              <th className="bg-blue-50 p-2 min-w-[130px] font-semibold text-blue-800">完成日期</th>
              <th className="bg-blue-50 p-2 min-w-[60px] font-semibold text-blue-800">工期</th>
              
              <th className="bg-yellow-50 p-2 min-w-[130px] font-semibold text-yellow-800">開始日期</th>
              <th className="bg-yellow-50 p-2 min-w-[130px] font-semibold text-yellow-800">完成日期</th>
              <th className="bg-yellow-50 p-2 min-w-[60px] font-semibold text-yellow-800">工期</th>
              
              <th className="bg-gray-50 p-2 min-w-[80px] font-semibold text-gray-600">差異天數</th>
              <th className="bg-gray-50 p-2 min-w-[60px] font-semibold text-gray-600">狀態</th>
              <th className="bg-gray-50 p-2 min-w-[80px] font-semibold text-gray-600">進度 %</th>
              <th className="bg-gray-50 p-2 min-w-[200px] font-semibold text-gray-600">備註</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {[...OPERATION_STAGES, 'Uncategorized'].map(stage => {
               const isUncategorized = stage === 'Uncategorized';
               const groupRows = displayRows.filter(r => 
                 isUncategorized 
                 ? (!r.category || !OPERATION_STAGES.includes(r.category))
                 : r.category === stage
               );
               const isExpanded = expandedGroups[stage];

               // If Uncategorized is empty, don't render header
               if (isUncategorized && groupRows.length === 0) return null;

               return (
                 <React.Fragment key={stage}>
                   {/* Section Header */}
                   <tr className="bg-slate-100 border-b border-gray-300">
                     <td colSpan={12} className="p-0">
                       <div className="flex items-center justify-between px-3 py-2">
                         <div 
                           className="flex items-center gap-2 cursor-pointer select-none"
                           onClick={() => toggleGroup(stage)}
                         >
                            <div className="text-slate-500">
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                            <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                {isUncategorized ? '未分類項目' : stage}
                                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{groupRows.length}</span>
                            </span>
                         </div>
                         
                         {/* Only show 'Add Item to Category' for defined stages */}
                         {!isUncategorized && (
                            <button 
                                onClick={() => addRow(stage)}
                                className="flex items-center gap-1 text-xs bg-white border border-gray-300 text-gray-600 hover:text-indigo-600 hover:border-indigo-400 px-2 py-1 rounded shadow-sm transition-colors"
                                title={`新增項目至 ${stage}`}
                            >
                                <Plus size={14} /> 新增項目
                            </button>
                         )}
                       </div>
                     </td>
                   </tr>

                   {/* Rows */}
                   {isExpanded && groupRows.map(row => {
                      const scheduledDuration = calculateDuration(row.scheduledStartDate, row.scheduledEndDate);
                      const actualDuration = calculateDuration(row.actualStartDate, row.actualEndDate);
                      const variance = calculateVariance(row.scheduledEndDate, row.actualEndDate);
                      const progressPct = calculateProgress(row.actualStartDate, row.actualEndDate, row.scheduledEndDate);

                      return (
                        <tr key={row.id} className="hover:bg-indigo-50/30 group transition-colors">
                            <td className="p-2 text-center border-r border-gray-200">
                                <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                            {/* Removed Category Column */}
                            <td className="p-1 border-r border-gray-100 pl-4">
                                <BufferedInput value={row.item} onCommit={(v) => updateRow(row.id, 'item', v)} className={getInputClass()} placeholder="項目名稱" />
                            </td>

                            {/* Scheduled */}
                            <td className="p-1 border-r border-blue-50 bg-blue-50/30">
                                <DateInput value={row.scheduledStartDate} onChange={(v) => updateRow(row.id, 'scheduledStartDate', v)} className={getInputClass(true)} onOpenPicker={() => handleOpenPicker(row.id, 'scheduledStartDate', row.scheduledStartDate)} />
                            </td>
                            <td className="p-1 border-r border-blue-50 bg-blue-50/30">
                                <DateInput value={row.scheduledEndDate} onChange={(v) => updateRow(row.id, 'scheduledEndDate', v)} className={getInputClass(true)} onOpenPicker={() => handleOpenPicker(row.id, 'scheduledEndDate', row.scheduledEndDate)} />
                            </td>
                            <td className="p-2 text-center border-r border-blue-50 bg-blue-50/30 text-blue-700 font-medium">
                                {scheduledDuration || '-'}
                            </td>

                            {/* Actual */}
                            <td className="p-1 border-r border-yellow-50 bg-yellow-50/30">
                                <DateInput value={row.actualStartDate} onChange={(v) => updateRow(row.id, 'actualStartDate', v)} className={getInputClass(true)} onOpenPicker={() => handleOpenPicker(row.id, 'actualStartDate', row.actualStartDate)} />
                            </td>
                            <td className="p-1 border-r border-yellow-50 bg-yellow-50/30">
                                <DateInput value={row.actualEndDate} onChange={(v) => updateRow(row.id, 'actualEndDate', v)} className={getInputClass(true)} onOpenPicker={() => handleOpenPicker(row.id, 'actualEndDate', row.actualEndDate)} />
                            </td>
                            <td className="p-2 text-center border-r border-yellow-50 bg-yellow-50/30 text-yellow-700 font-medium">
                                {actualDuration || '-'}
                            </td>

                            {/* Indicators */}
                            <td className={`p-2 text-center border-r border-gray-100 font-bold ${variance !== null && variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {variance !== null ? (variance > 0 ? `+${variance}` : variance) : '-'}
                            </td>
                            <td className="p-2 text-center border-r border-gray-100">
                                <StatusIndicator variance={variance} />
                            </td>
                            <td className="p-2 text-center border-r border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${progressPct}%` }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 w-8">{progressPct}%</span>
                                </div>
                            </td>
                            <td className="p-1">
                                <BufferedInput value={row.remarks} onCommit={(v) => updateRow(row.id, 'remarks', v)} className={getInputClass()} placeholder="備註..." />
                            </td>
                        </tr>
                      );
                   })}
                 </React.Fragment>
               );
            })}
          </tbody>
        </table>
        {displayRows.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>本專案尚無營運控制資料。</p>
            <p className="text-sm mt-2">請點擊標題列右側「新增項目」或上方按鈕開始。</p>
          </div>
        )}
      </div>
      <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 flex gap-6 justify-center">
         <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> 進度正常 (差異 &ge; 0)</div>
         <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div> 輕微落後 (差異 -1 ~ -10)</div>
         <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> 警示落後 (差異 -11 ~ -29)</div>
         <div className="flex items-center gap-2"><AlertCircle size={14} className="text-red-600"/> 嚴重落後 (差異 &le; -30)</div>
      </div>
    </div>
  );
};