import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Download, Lock, Calendar, ChevronLeft, ChevronRight, Layers, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ProcurementRow, UserRole } from '../types';
import { calculateVariance, getVarianceColor } from '../utils';

// Role Definitions for Display
const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: '管理員 (完整權限)',
  PLANNER: '工地排程 (採購部)',
  EXECUTOR: '工地執行 (工地單位)',
  PROCUREMENT: '採購發包 (採購部)'
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
      className={`${className} ${disabled ? 'bg-transparent text-gray-400 cursor-not-allowed' : 'bg-transparent text-slate-900 focus:ring-2 focus:ring-blue-500 placeholder-slate-300'}`}
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
          ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 text-slate-700'}
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
          className="opacity-0 group-hover/date:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all flex-shrink-0"
          title="開啟日曆"
        >
          <Calendar size={14} />
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
  currentProjectName: string;
  userRole: UserRole;
  onLogout: () => void;
  onBackToHome: () => void;
}

export const ProcurementTable: React.FC<ProcurementTableProps> = ({ currentProjectId, currentProjectName, userRole, onLogout, onBackToHome }) => {
  
  const [allRows, setAllRows] = useState<ProcurementRow[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((r: any) => ({
            ...r,
            remarks: r.remarks || '',
            projectId: r.projectId || 'default-project'
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

  const displayRows = allRows.filter(r => r.projectId === currentProjectId);

  const totalItems = displayRows.length;
  const completedItems = displayRows.filter(r => r.actualRequestDate).length;
  const delayedItems = displayRows.filter(r => {
    const variance = calculateVariance(r.scheduledRequestDate, r.actualRequestDate);
    return variance !== null && variance < 0;
  }).length;
  const upcomingItems = displayRows.filter(r => {
    if (!r.scheduledRequestDate || r.actualRequestDate) return false;
    const date = new Date(r.scheduledRequestDate);
    date.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return date >= today && date <= nextWeek;
  }).length;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRows));
  }, [allRows]);

  const isEditable = (field: keyof ProcurementRow): boolean => {
    if (field === 'projectName') return false;
    if (userRole === 'ADMIN' || userRole === 'PROCUREMENT') return true;
    switch (userRole) {
      case 'PLANNER': return ['engineeringItem', 'scheduledRequestDate', 'siteOrganizer'].includes(field);
      case 'EXECUTOR': return ['actualRequestDate', 'remarks'].includes(field); 
      default: return false;
    }
  };

  const canManageRows = userRole === 'ADMIN' || userRole === 'PLANNER' || userRole === 'PROCUREMENT';

  const addRow = () => {
    if (!canManageRows) return;
    const newRow: ProcurementRow = {
      id: crypto.randomUUID(),
      projectId: currentProjectId,
      remarks: '',
      projectName: currentProjectName,
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
      const otherProjectRows = allRows.filter(r => r.projectId !== currentProjectId);
      setAllRows([...otherProjectRows]); 
    }
  };

  const exportCSV = () => {
    const headers = [
      "工程項目", "預定提出時間", "實際提出時間", "時程差異", "燈號狀態", "工地主辦", "採發主辦", "退件日期", "退件原因", "重新提送日期", "確認承攬商日期", "廠商", "備註"
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

    const dateStr = new Date().toISOString().split('T')[0];
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${currentProjectName}_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getInputClass = (field: keyof ProcurementRow) => {
    const editable = isEditable(field);
    const base = "w-full rounded outline-none transition-all border-b border-transparent text-sm py-1 px-2";
    if (editable) {
      return `${base} hover:border-slate-300 focus:border-blue-500`;
    }
    return `${base} cursor-not-allowed select-none text-slate-500`;
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

  const StatusPill = ({ variance }: { variance: number | null }) => {
    if (variance === null) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">-</span>;
    if (variance >= 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">正常</span>;
    
    const delay = Math.abs(variance);
    let colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
    let text = `落後 ${delay} 天`;

    if (delay > 30) colorClass = "bg-red-100 text-red-700 border-red-200 font-bold";
    else if (delay >= 8) colorClass = "bg-orange-100 text-orange-700 border-orange-200";

    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>{text}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
      <CustomDatePicker 
        isOpen={pickerState.isOpen}
        initialDate={pickerState.currentDate}
        onSelect={handleDateSelect}
        onClose={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="bg-white border-b border-slate-200">
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
             <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Layers size={20} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800">請採購項目管理表</h2>
                <p className="text-sm text-slate-500">進度追蹤與時程控管</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            {canManageRows && (
              <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium">
                <Plus size={16} /> 新增
              </button>
            )}
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium">
              <Download size={16} /> 匯出
            </button>
          </div>
        </div>

        {/* Summary Dashboard */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">總項目</p>
                <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-blue-500">
                <Layers size={20} />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">延誤項目</p>
                <p className={`text-2xl font-bold ${delayedItems > 0 ? 'text-red-600' : 'text-slate-700'}`}>{delayedItems}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-red-500">
                <AlertCircle size={20} />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">本週即將到期</p>
                <p className="text-2xl font-bold text-amber-600">{upcomingItems}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-amber-500">
                <Clock size={20} />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">已完成</p>
                <p className="text-2xl font-bold text-green-600">{completedItems}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-green-500">
                <CheckCircle size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative bg-white">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 shadow-sm bg-slate-50/90 backdrop-blur-sm">
             <tr>
              <th className="bg-slate-50 p-3 text-center text-slate-400 font-semibold w-[50px] border-b border-slate-200"></th>
              <th className="bg-slate-50 p-3 text-left font-bold text-slate-700 border-b border-slate-200 min-w-[200px]">工程資訊</th>
              <th className="bg-blue-50/50 p-3 text-center font-bold text-blue-900 border-b border-blue-100 border-l border-blue-100" colSpan={2}>提出時間</th>
              <th className="bg-slate-50 p-3 text-center font-bold text-slate-700 border-b border-slate-200 border-l border-slate-200" colSpan={2}>主辦人員</th>
              <th className="bg-slate-50 p-3 text-center font-bold text-slate-700 border-b border-slate-200 border-l border-slate-200" colSpan={3}>退件/重送</th>
              <th className="bg-slate-50 p-3 text-center font-bold text-slate-700 border-b border-slate-200 border-l border-slate-200" colSpan={2}>承攬發包</th>
              <th className="bg-yellow-50/50 p-3 text-center font-bold text-yellow-900 border-b border-yellow-100 border-l border-yellow-100" colSpan={2}>進度狀態</th>
              <th className="bg-slate-50 p-3 text-left font-bold text-slate-700 border-b border-slate-200 min-w-[200px] border-l border-slate-200">備註</th>
            </tr>
            <tr className="text-xs text-slate-500 font-medium">
              <th className="bg-slate-50 p-2 border-b border-slate-200"></th>
              <th className="bg-slate-50 p-2 text-left border-b border-slate-200 pl-4">項目名稱</th>
              
              <th className="bg-blue-50/50 p-2 text-center text-blue-800 border-b border-blue-100 border-l border-blue-100 min-w-[110px]">預定</th>
              <th className="bg-blue-50/50 p-2 text-center text-blue-800 border-b border-blue-100 min-w-[110px]">實際</th>
              
              <th className="bg-slate-50 p-2 text-center border-b border-slate-200 border-l border-slate-200 w-[4.5rem] min-w-[4.5rem]">工地</th>
              <th className="bg-slate-50 p-2 text-center border-b border-slate-200 w-[4.5rem] min-w-[4.5rem]">採發</th>
              
              <th className="bg-slate-50 p-2 text-center border-b border-slate-200 border-l border-slate-200 min-w-[110px]">退件日</th>
              <th className="bg-slate-50 p-2 text-center border-b border-slate-200">原因</th>
              <th className="bg-slate-50 p-2 text-center border-b border-slate-200 min-w-[110px]">重送日</th>
              
              <th className="bg-slate-50 p-2 text-center border-b border-slate-200 border-l border-slate-200 min-w-[110px]">確認日</th>
              <th className="bg-slate-50 p-2 text-center border-b border-slate-200">廠商</th>
              
              <th className="bg-yellow-50/50 p-2 text-center text-yellow-800 border-b border-yellow-100 border-l border-yellow-100">差異</th>
              <th className="bg-yellow-50/50 p-2 text-center text-yellow-800 border-b border-yellow-100">狀態</th>
              
              <th className="bg-slate-50 p-2 text-left border-b border-slate-200 border-l border-slate-200 pl-4">說明</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {displayRows.map((row) => {
               const variance = calculateVariance(row.scheduledRequestDate, row.actualRequestDate);
               const varianceColor = getVarianceColor(variance);

               return (
                <tr key={row.id} className="hover:bg-blue-50/30 group transition-colors">
                  {/* Op */}
                  <td className="py-2 px-2 text-center border-b border-slate-100">
                    <button 
                      onClick={() => deleteRow(row.id)}
                      disabled={!canManageRows}
                      className={`p-1.5 rounded-lg transition-colors ${canManageRows ? 'text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 cursor-pointer' : 'text-transparent cursor-not-allowed'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>

                  {/* Item */}
                  <td className="py-2 px-2 border-b border-slate-100 align-middle">
                     <BufferedInput value={row.engineeringItem} disabled={!isEditable('engineeringItem')} onCommit={(val) => updateRow(row.id, 'engineeringItem', val)} className={getInputClass('engineeringItem') + " font-bold text-slate-800"} placeholder="輸入工程項目"/>
                  </td>

                  {/* Request Group */}
                  <td className="py-2 px-2 border-b border-slate-100 border-l border-slate-50 align-middle bg-blue-50/10">
                    <DateInput value={row.scheduledRequestDate} disabled={!isEditable('scheduledRequestDate')} onChange={(val) => updateRow(row.id, 'scheduledRequestDate', val)} className={getInputClass('scheduledRequestDate')} onOpenPicker={() => handleOpenPicker(row.id, 'scheduledRequestDate', row.scheduledRequestDate)}/>
                  </td>
                  <td className="py-2 px-2 border-b border-slate-100 align-middle bg-blue-50/10">
                    <DateInput value={row.actualRequestDate} disabled={!isEditable('actualRequestDate')} onChange={(val) => updateRow(row.id, 'actualRequestDate', val)} className={getInputClass('actualRequestDate')} onOpenPicker={() => handleOpenPicker(row.id, 'actualRequestDate', row.actualRequestDate)}/>
                  </td>

                  {/* Organizers */}
                  <td className="py-2 px-2 align-middle w-[4.5rem] min-w-[4.5rem] border-b border-slate-100 border-l border-slate-50">
                    <BufferedInput value={row.siteOrganizer} disabled={!isEditable('siteOrganizer')} onCommit={(val) => updateRow(row.id, 'siteOrganizer', val)} className={getInputClass('siteOrganizer') + " text-center"}/>
                  </td>
                  <td className="py-2 px-2 border-b border-slate-100 align-middle w-[4.5rem] min-w-[4.5rem]">
                    <BufferedInput value={row.procurementOrganizer} disabled={!isEditable('procurementOrganizer')} onCommit={(val) => updateRow(row.id, 'procurementOrganizer', val)} className={getInputClass('procurementOrganizer') + " text-center"}/>
                  </td>

                  {/* Process */}
                  <td className="py-2 px-2 align-middle border-b border-slate-100 border-l border-slate-50">
                    <DateInput value={row.returnDate} disabled={!isEditable('returnDate')} onChange={(val) => updateRow(row.id, 'returnDate', val)} className={getInputClass('returnDate')} onOpenPicker={() => handleOpenPicker(row.id, 'returnDate', row.returnDate)}/>
                  </td>
                  <td className="py-2 px-2 align-middle border-b border-slate-100">
                    <BufferedInput value={row.returnReason} disabled={!isEditable('returnReason')} onCommit={(val) => updateRow(row.id, 'returnReason', val)} className={getInputClass('returnReason') + " text-center"}/>
                  </td>
                  <td className="py-2 px-2 border-b border-slate-100 align-middle">
                    <DateInput value={row.resubmissionDate} disabled={!isEditable('resubmissionDate')} onChange={(val) => updateRow(row.id, 'resubmissionDate', val)} className={getInputClass('resubmissionDate')} onOpenPicker={() => handleOpenPicker(row.id, 'resubmissionDate', row.resubmissionDate)}/>
                  </td>

                  {/* Contractor */}
                  <td className="py-2 px-2 align-middle border-b border-slate-100 border-l border-slate-50">
                    <DateInput value={row.contractorConfirmDate} disabled={!isEditable('contractorConfirmDate')} onChange={(val) => updateRow(row.id, 'contractorConfirmDate', val)} className={getInputClass('contractorConfirmDate')} onOpenPicker={() => handleOpenPicker(row.id, 'contractorConfirmDate', row.contractorConfirmDate)}/>
                  </td>
                  <td className="py-2 px-2 border-b border-slate-100 align-middle">
                    <BufferedInput value={row.contractorName} disabled={!isEditable('contractorName')} onCommit={(val) => updateRow(row.id, 'contractorName', val)} className={getInputClass('contractorName') + " text-center"}/>
                  </td>

                  {/* Status Group */}
                  <td className={`py-2 px-2 text-center font-bold text-lg align-middle border-b border-slate-100 border-l border-slate-50 bg-yellow-50/10 ${varianceColor}`}>
                    {variance !== null ? (variance > 0 ? `+${variance}` : variance) : ''}
                  </td>
                  <td className="py-2 px-2 text-center border-b border-slate-100 align-middle bg-yellow-50/10">
                    <StatusPill variance={variance} />
                  </td>

                  {/* Remarks */}
                  <td className="py-2 px-2 align-middle border-b border-slate-100 border-l border-slate-50">
                    <BufferedInput value={row.remarks} disabled={!isEditable('remarks')} onCommit={(val) => updateRow(row.id, 'remarks', val)} className={getInputClass('remarks')} placeholder="..."/>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {displayRows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <div className="bg-slate-50 p-4 rounded-full mb-3">
               <Layers size={32} />
             </div>
             <p>本專案目前無資料</p>
             <button onClick={addRow} className="mt-4 text-blue-600 font-medium hover:underline">新增第一筆資料</button>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Lock size={12} />
           <span>權限: {ROLE_DESCRIPTIONS[userRole]}</span>
        </div>
        <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> 正常</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rounded-full"></div> 警示 (1-7天)</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> 延誤 (8-30天)</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600 rounded-full"></div> 嚴重 (&gt;30天)</span>
        </div>
      </div>
    </div>
  );
};