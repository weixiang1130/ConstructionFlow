import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Download, UserCircle, Lock, RefreshCw, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ProcurementRow } from '../types';
import { calculateVariance, getVarianceColor } from '../utils';

// Role Definitions
type UserRole = 'ADMIN' | 'PLANNER' | 'EXECUTOR' | 'PROCUREMENT';

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'ADMIN', label: '管理員 (完整權限) - Admin', description: 'Full access to all fields' },
  { value: 'PLANNER', label: '工地-預定排程人員 (Site Planner)', description: '可編輯: 專案、項目、預定提出時間、工地主辦' },
  { value: 'EXECUTOR', label: '工地-實際執行人員 (Site Executor)', description: '可編輯: 實際提出時間、備註' },
  { value: 'PROCUREMENT', label: '採購發包人員 (Procurement Officer)', description: '可編輯: 採發主辦、退件、重新提送、廠商確認' },
];

// BufferedInput component with disabled state support
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
    const d = new Date(initialDate || Date.now());
    return isNaN(d.getTime()) ? new Date() : d;
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    // Optional: Auto select today? User asked for "pick", so maybe just navigate to today.
  };

  const handleDayClick = (day: number) => {
    // Format: YYYY-MM-DD
    // Note: Month is 0-indexed, so we add 1.
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    onSelect(`${year}-${m}-${d}`);
  };

  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8"></div>);
  }
  // Days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    const isSelected = initialDate === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    days.push(
      <button
        key={i}
        onClick={() => handleDayClick(i)}
        className={`
          h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
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
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronLeft size={20} /></button>
          <div className="font-bold text-lg tracking-wide">
            {year}年 {month + 1}月
          </div>
          <button onClick={handleNextMonth} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronRight size={20} /></button>
        </div>

        <div className="p-4">
          {/* Week Days */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <span key={d} className="text-xs font-semibold text-gray-400">{d}</span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 place-items-center">
            {days}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
           <button 
            onClick={handleToday}
            className="text-sm text-blue-600 font-medium hover:text-blue-800 px-2 py-1"
          >
            跳至今天
          </button>
          <button 
            onClick={onClose}
            className="text-sm text-gray-500 font-medium hover:text-gray-700 px-3 py-1 hover:bg-gray-200 rounded"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

// DateInput component with external trigger button for custom picker
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
  return (
    <div className="flex items-center w-full gap-1">
      <input
        type="date"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} flex-1 min-w-0 ${!disabled ? 'cursor-pointer' : ''}`}
        // Still allow clicking input to try native behavior if user prefers
      />
      {!disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenPicker();
          }}
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

export const ProcurementTable: React.FC = () => {
  // Load initial state from localStorage if available
  const [rows, setRows] = useState<ProcurementRow[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((r: any) => ({
            ...r,
            remarks: r.remarks || '' 
          }));
        } catch (e) {
          console.error("Failed to parse saved data", e);
        }
      }
    }
    return INITIAL_ROWS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');

  // Picker State
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    rowId: string | null;
    field: keyof ProcurementRow | null;
    currentDate: string;
  }>({
    isOpen: false,
    rowId: null,
    field: null,
    currentDate: ''
  });

  // Save to localStorage whenever rows change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  // Permission Logic
  const isEditable = (field: keyof ProcurementRow): boolean => {
    if (currentRole === 'ADMIN') return true;

    switch (currentRole) {
      case 'PLANNER':
        return ['projectName', 'engineeringItem', 'scheduledRequestDate', 'siteOrganizer'].includes(field);
      case 'EXECUTOR':
        return ['actualRequestDate', 'remarks'].includes(field); 
      case 'PROCUREMENT':
        return [
          'procurementOrganizer', 'returnDate', 'returnReason', 
          'resubmissionDate', 'contractorConfirmDate', 'contractorName'
        ].includes(field);
      default:
        return false;
    }
  };

  const canManageRows = currentRole === 'ADMIN' || currentRole === 'PLANNER';

  const addRow = () => {
    if (!canManageRows) return;
    const newRow: ProcurementRow = {
      id: crypto.randomUUID(),
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
    setRows([...rows, newRow]);
  };

  const deleteRow = (id: string) => {
    if (!canManageRows) return;
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof ProcurementRow, value: string) => {
    if (!isEditable(field)) return;
    setRows(prevRows => prevRows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };
  
  const resetData = () => {
    if (confirm('確定要重置所有資料回到預設值嗎？此動作無法復原。')) {
      setRows(INITIAL_ROWS);
    }
  };

  const exportCSV = () => {
    // Reordered headers to match table visual order
    const headers = [
      "專案名稱", "工程項目", "預定提出時間", "實際提出時間", "時程差異", "燈號狀態", "工地主辦", "採發主辦", "退件日期", "退件原因", "重新提送日期", "確認承攬商日期", "廠商", "備註"
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => {
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
          row.remarks // Moved to end
        ].map(val => `"${val}"`).join(',');
      })
    ].join('\n');

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "procurement_schedule.csv");
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
      return `${base} bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm`;
    }
    return `${base} bg-gray-100 text-gray-400 cursor-not-allowed select-none`;
  };

  // Handle opening the picker
  const handleOpenPicker = (rowId: string, field: keyof ProcurementRow, currentDate: string) => {
    setPickerState({
      isOpen: true,
      rowId,
      field,
      currentDate
    });
  };

  // Handle date selection from picker
  const handleDateSelect = (dateStr: string) => {
    if (pickerState.rowId && pickerState.field) {
      updateRow(pickerState.rowId, pickerState.field, dateStr);
      setPickerState(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Traffic Light Component
  const StatusLight = ({ variance }: { variance: number | null }) => {
    if (variance === null) return <div className="w-5 h-5 rounded-full bg-gray-200" title="無資料" />;
    
    if (variance >= 0) {
      return <div className="flex justify-center"><div className="w-5 h-5 rounded-full bg-green-500 shadow-md ring-2 ring-green-100" title="正常 (On Time/Early)" /></div>;
    }

    const delay = Math.abs(variance);
    
    if (delay <= 7) {
      return <div className="flex justify-center"><div className="w-5 h-5 rounded-full bg-yellow-400 shadow-md ring-2 ring-yellow-100" title={`警示: 延誤 ${delay} 天`} /></div>;
    }
    
    if (delay <= 30) {
      return <div className="flex justify-center"><div className="w-5 h-5 rounded-full bg-orange-500 shadow-md ring-2 ring-orange-100" title={`通知工地: 延誤 ${delay} 天`} /></div>;
    }

    return (
      <div className="flex justify-center">
        <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <div className="relative w-5 h-5 rounded-full bg-red-600 shadow-md ring-2 ring-red-100" title={`通知長官: 延誤 ${delay} 天`}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
      {/* Date Picker Modal */}
      <CustomDatePicker 
        isOpen={pickerState.isOpen}
        initialDate={pickerState.currentDate}
        onSelect={handleDateSelect}
        onClose={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Toolbar & Role Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-800">請採購項目管理表</h2>
            <span className="hidden md:inline-block text-gray-300">|</span>
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <UserCircle size={18} className="text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">身份模擬</span>
              <select 
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent border-none text-sm font-bold text-indigo-700 focus:ring-0 cursor-pointer outline-none min-w-[200px]"
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            {canManageRows && (
              <button 
                onClick={addRow}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
              >
                <Plus size={16} /> 新增項目
              </button>
            )}
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
            >
              <Download size={16} /> 匯出 CSV
            </button>
          </div>
        </div>
        
        {/* Role Description Bar */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Lock size={12} />
            <span>目前權限: </span>
            <span className="font-medium text-gray-700">{ROLES.find(r => r.value === currentRole)?.description}</span>
            {!canManageRows && <span className="text-red-400 ml-2">(新增/刪除功能已鎖定)</span>}
          </div>
          {currentRole === 'ADMIN' && (
            <button onClick={resetData} className="flex items-center gap-1 text-gray-400 hover:text-red-600 transition-colors">
              <RefreshCw size={10} /> 重置資料
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto custom-scrollbar relative bg-gray-50">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 shadow-sm">
            {/* Top Header Row (Categories) */}
            <tr className="divide-x divide-gray-300 border-b border-gray-300">
              <th className="bg-gray-100 p-2 text-center text-gray-700 font-bold min-w-[50px]">操作</th>
              <th className="bg-blue-100 p-2 text-center text-blue-900 font-bold" colSpan={6}>
                提出請購時程 (工地) <span className="text-xs font-normal opacity-75 block">Site Schedule Proposal</span>
              </th>
              <th className="bg-amber-100 p-2 text-center text-amber-900 font-bold" colSpan={2}>
                退件 (採購) <span className="text-xs font-normal opacity-75 block">Return (Procurement)</span>
              </th>
              <th className="bg-orange-100 p-2 text-center text-orange-900 font-bold" colSpan={1}>
                工地重新提送 <span className="text-xs font-normal opacity-75 block">Resubmit</span>
              </th>
              <th className="bg-gray-100 p-2 text-center text-gray-800 font-bold" colSpan={2}>
                確認 <span className="text-xs font-normal opacity-75 block">Confirmation</span>
              </th>
              <th className="bg-yellow-300 p-2 text-center text-yellow-900 font-bold border-l-4 border-yellow-500" colSpan={2}>
                結果 <span className="text-xs font-normal opacity-75 block">Result</span>
              </th>
              <th className="bg-gray-100 p-2 text-center text-gray-700 font-bold min-w-[150px]">備註 <span className="text-xs font-normal opacity-75 block">Remarks</span></th>
            </tr>
            
            {/* Second Header Row (Fields) */}
            <tr className="divide-x divide-gray-300 border-b border-gray-300 text-xs text-gray-700">
              <th className="bg-gray-50 p-2 min-w-[50px]"></th>
              
              {/* Blue Section */}
              <th className="bg-blue-50 p-2 min-w-[150px] font-semibold">專案名稱<br/><span className="text-gray-500 font-normal">Project Name</span></th>
              <th className="bg-blue-50 p-2 min-w-[150px] font-semibold">工程項目<br/><span className="text-gray-500 font-normal">Eng. Item</span></th>
              <th className="bg-blue-50 p-2 min-w-[130px] font-semibold">預定提出時間<br/><span className="text-gray-500 font-normal">Scheduled</span></th>
              <th className="bg-blue-50 p-2 min-w-[130px] font-semibold">實際提出時間<br/><span className="text-gray-500 font-normal">Actual</span></th>
              <th className="bg-blue-50 p-2 min-w-[100px] font-semibold">工地主辦<br/><span className="text-gray-500 font-normal">Site Org.</span></th>
              <th className="bg-blue-50 p-2 min-w-[100px] font-semibold">採發主辦<br/><span className="text-gray-500 font-normal">Proc. Org.</span></th>

              {/* Amber Section */}
              <th className="bg-amber-50 p-2 min-w-[130px] font-semibold">退件日期<br/><span className="text-gray-500 font-normal">Return Date</span></th>
              <th className="bg-amber-50 p-2 min-w-[150px] font-semibold">退件原因<br/><span className="text-gray-500 font-normal">Reason</span></th>

              {/* Orange Section */}
              <th className="bg-orange-50 p-2 min-w-[130px] font-semibold">重新提送日期<br/><span className="text-gray-500 font-normal">Resubmit Date</span></th>

              {/* Confirmation */}
              <th className="bg-gray-50 p-2 min-w-[130px] font-semibold">確認承攬商日期<br/><span className="text-gray-500 font-normal">Confirm Date</span></th>
              <th className="bg-gray-50 p-2 min-w-[150px] font-semibold">廠商<br/><span className="text-gray-500 font-normal">Contractor</span></th>

              {/* Result */}
              <th className="bg-yellow-100 p-2 min-w-[100px] font-semibold border-l-2 border-yellow-300">請購時程差異<br/><span className="text-gray-500 font-normal">Variance (Days)</span></th>
              <th className="bg-yellow-100 p-2 min-w-[60px] font-semibold">燈號<br/><span className="text-gray-500 font-normal">Status</span></th>

              {/* Remarks */}
              <th className="bg-gray-50 p-2 min-w-[150px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.map((row) => {
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

                  {/* Inputs */}
                  <td className="p-1 border-r border-gray-100">
                    <BufferedInput 
                      value={row.projectName} 
                      disabled={!isEditable('projectName')}
                      onCommit={(val) => updateRow(row.id, 'projectName', val)}
                      className={getInputClass('projectName')}
                      placeholder="輸入專案名稱"
                    />
                  </td>
                  <td className="p-1 border-r border-gray-100">
                    <BufferedInput 
                      value={row.engineeringItem} 
                      disabled={!isEditable('engineeringItem')}
                      onCommit={(val) => updateRow(row.id, 'engineeringItem', val)}
                      className={getInputClass('engineeringItem')}
                      placeholder="輸入工程項目"
                    />
                  </td>
                  <td className="p-1 border-r border-gray-100">
                    <DateInput 
                      value={row.scheduledRequestDate} 
                      disabled={!isEditable('scheduledRequestDate')}
                      onChange={(val) => updateRow(row.id, 'scheduledRequestDate', val)}
                      className={getInputClass('scheduledRequestDate')}
                      onOpenPicker={() => handleOpenPicker(row.id, 'scheduledRequestDate', row.scheduledRequestDate)}
                    />
                  </td>
                  <td className="p-1 border-r border-gray-100">
                    <DateInput 
                      value={row.actualRequestDate} 
                      disabled={!isEditable('actualRequestDate')}
                      onChange={(val) => updateRow(row.id, 'actualRequestDate', val)}
                      className={getInputClass('actualRequestDate')}
                      onOpenPicker={() => handleOpenPicker(row.id, 'actualRequestDate', row.actualRequestDate)}
                    />
                  </td>
                  <td className="p-1 border-r border-gray-100">
                    <BufferedInput 
                      value={row.siteOrganizer} 
                      disabled={!isEditable('siteOrganizer')}
                      onCommit={(val) => updateRow(row.id, 'siteOrganizer', val)}
                      className={getInputClass('siteOrganizer')}
                    />
                  </td>
                  <td className="p-1 border-r border-gray-100">
                    <BufferedInput 
                      value={row.procurementOrganizer} 
                      disabled={!isEditable('procurementOrganizer')}
                      onCommit={(val) => updateRow(row.id, 'procurementOrganizer', val)}
                      className={getInputClass('procurementOrganizer')}
                    />
                  </td>

                  {/* Return Section */}
                  <td className="p-1 border-r border-gray-100">
                    <DateInput 
                      value={row.returnDate} 
                      disabled={!isEditable('returnDate')}
                      onChange={(val) => updateRow(row.id, 'returnDate', val)}
                      className={getInputClass('returnDate')}
                      onOpenPicker={() => handleOpenPicker(row.id, 'returnDate', row.returnDate)}
                    />
                  </td>
                  <td className="p-1 border-r border-gray-100">
                    <BufferedInput 
                      value={row.returnReason} 
                      disabled={!isEditable('returnReason')}
                      onCommit={(val) => updateRow(row.id, 'returnReason', val)}
                      className={getInputClass('returnReason')}
                      placeholder=""
                    />
                  </td>

                  {/* Resubmit */}
                  <td className="p-1 border-r border-gray-100">
                    <DateInput 
                      value={row.resubmissionDate} 
                      disabled={!isEditable('resubmissionDate')}
                      onChange={(val) => updateRow(row.id, 'resubmissionDate', val)}
                      className={getInputClass('resubmissionDate')}
                      onOpenPicker={() => handleOpenPicker(row.id, 'resubmissionDate', row.resubmissionDate)}
                    />
                  </td>

                  {/* Confirm */}
                  <td className="p-1 border-r border-gray-100">
                    <DateInput 
                      value={row.contractorConfirmDate} 
                      disabled={!isEditable('contractorConfirmDate')}
                      onChange={(val) => updateRow(row.id, 'contractorConfirmDate', val)}
                      className={getInputClass('contractorConfirmDate')}
                      onOpenPicker={() => handleOpenPicker(row.id, 'contractorConfirmDate', row.contractorConfirmDate)}
                    />
                  </td>
                  <td className="p-1 border-r border-gray-100">
                    <BufferedInput 
                      value={row.contractorName} 
                      disabled={!isEditable('contractorName')}
                      onCommit={(val) => updateRow(row.id, 'contractorName', val)}
                      className={getInputClass('contractorName')}
                    />
                  </td>

                  {/* Variance (Read Only) */}
                  <td className={`p-2 text-center bg-yellow-50 border-l-2 border-yellow-200 ${varianceColor}`}>
                    {variance !== null ? (variance > 0 ? `+${variance}` : variance) : '-'}
                  </td>
                  <td className="p-2 text-center bg-yellow-50">
                    <StatusLight variance={variance} />
                  </td>

                  {/* Remarks (Moved to Right) */}
                  <td className="p-1 border-l border-gray-100">
                     <BufferedInput 
                      value={row.remarks} 
                      disabled={!isEditable('remarks')}
                      onCommit={(val) => updateRow(row.id, 'remarks', val)}
                      className={getInputClass('remarks')}
                      placeholder="工作說明..."
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>無資料。請點擊「新增項目」開始。</p>
          </div>
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