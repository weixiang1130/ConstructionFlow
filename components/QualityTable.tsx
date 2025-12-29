import React, { useState, useEffect, useRef } from 'react';
import { Download, Calendar, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import { QualityRow } from '../types';

const STORAGE_KEY = 'quality_control_data';

const QUALITY_PLANS = [
  "1.施工架計畫", 
  "2.終層開挖計畫", 
  "3.鐵捲門計畫", 
  "4.穿樑計畫", 
  "5.一樓高程計畫", 
  "6.實品屋計畫", 
  "7.外飾計畫", 
  "8.屋頂計畫", 
  "9.泳池計畫", 
  "10.防水計畫", 
  "11.交驗屋計畫", 
  "12.門窗開口MO計畫"
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
      className={`${className} ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed select-none' : 'bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 placeholder-gray-400'}`}
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
          ${isSelected ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-teal-100 text-gray-700'}
          ${!isSelected && isToday ? 'border border-teal-400 font-bold text-teal-600' : ''}
        `}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[320px] overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="bg-teal-600 p-4 text-white flex items-center justify-between">
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
           <button type="button" onClick={handleToday} className="text-sm text-teal-600 font-medium hover:text-teal-800 px-2 py-1">跳至今天</button>
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
          className="p-1.5 bg-white border border-gray-300 rounded text-gray-500 hover:text-teal-600 hover:border-teal-500 hover:bg-teal-50 transition-all shadow-sm flex-shrink-0"
          title="開啟日曆"
        >
          <Calendar size={16} />
        </button>
      )}
    </div>
  );
};

// --- Main Quality Table ---

interface QualityTableProps {
  currentProjectId: string;
  currentProjectName: string;
}

export const QualityTable: React.FC<QualityTableProps> = ({ currentProjectId, currentProjectName }) => {
  const [allRows, setAllRows] = useState<QualityRow[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    rowId: string | null;
    field: keyof QualityRow | null;
    currentDate: string;
  }>({ isOpen: false, rowId: null, field: null, currentDate: '' });

  const displayRows = allRows.filter(r => r.projectId === currentProjectId);

  // --- Auto-Initialize Data for New Projects ---
  useEffect(() => {
    const hasData = allRows.some(r => r.projectId === currentProjectId);
    
    if (!hasData && currentProjectId) {
      // Generate default 12 rows
      const newRows: QualityRow[] = QUALITY_PLANS.map(planName => ({
        id: crypto.randomUUID(),
        projectId: currentProjectId,
        planName: planName,
        submissionDate: '',
        reviewDate: '',
        approvalDate: '',
        owner: ''
      }));
      
      setAllRows(prev => [...prev, ...newRows]);
    }
  }, [currentProjectId, allRows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRows));
  }, [allRows]);

  const updateRow = (id: string, field: keyof QualityRow, value: string) => {
    setAllRows(prevRows => prevRows.map(row => {
      if (row.id === id) return { ...row, [field]: value };
      return row;
    }));
  };

  const handleOpenPicker = (rowId: string, field: keyof QualityRow, currentDate: string) => {
    setPickerState({ isOpen: true, rowId, field, currentDate });
  };

  const handleDateSelect = (dateStr: string) => {
    if (pickerState.rowId && pickerState.field) {
      updateRow(pickerState.rowId, pickerState.field, dateStr);
      setPickerState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const getInputClass = (isDate = false) => {
    return "w-full p-2 rounded outline-none transition-all border border-transparent bg-white text-gray-900 hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 shadow-sm";
  };

  const exportCSV = () => {
    const headers = [
      "計畫名稱", "提送日期", "審查日期", "核定備查日期", "承辦人員"
    ];
    
    const csvContent = [
      headers.join(','),
      ...displayRows.map(row => {
        return [
          row.planName,
          row.submissionDate,
          row.reviewDate,
          row.approvalDate,
          row.owner
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
      link.setAttribute("download", `${currentProjectName}_品保計畫管制表_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
      <CustomDatePicker 
        isOpen={pickerState.isOpen}
        initialDate={pickerState.currentDate}
        onSelect={handleDateSelect}
        onClose={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardCheck className="text-teal-600" />
            施工計畫書送審管制表
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium">
            <Download size={16} /> 匯出 Excel
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative bg-gray-50">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 shadow-sm">
            <tr className="divide-x divide-gray-300 border-b border-gray-300 text-xs">
              <th className="bg-gray-100 p-2 min-w-[200px] text-left font-bold text-gray-700 pl-4">計畫項目</th>
              <th className="bg-teal-50 p-2 min-w-[150px] font-semibold text-teal-800">提送日期</th>
              <th className="bg-teal-50 p-2 min-w-[150px] font-semibold text-teal-800">審查日期</th>
              <th className="bg-teal-50 p-2 min-w-[150px] font-semibold text-teal-800">核定備查日期</th>
              <th className="bg-gray-50 p-2 min-w-[150px] font-semibold text-gray-600">承辦人員</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {displayRows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 group">
                <td className="p-2 border-r border-gray-100">
                  <div className="w-full p-2 rounded bg-gray-100 text-gray-700 font-medium select-none border border-transparent">
                    {row.planName}
                  </div>
                </td>
                <td className="p-1 border-r border-teal-50 bg-teal-50/20">
                  <DateInput 
                    value={row.submissionDate} 
                    onChange={(v) => updateRow(row.id, 'submissionDate', v)} 
                    className={getInputClass(true)} 
                    onOpenPicker={() => handleOpenPicker(row.id, 'submissionDate', row.submissionDate)} 
                  />
                </td>
                <td className="p-1 border-r border-teal-50 bg-teal-50/20">
                  <DateInput 
                    value={row.reviewDate} 
                    onChange={(v) => updateRow(row.id, 'reviewDate', v)} 
                    className={getInputClass(true)} 
                    onOpenPicker={() => handleOpenPicker(row.id, 'reviewDate', row.reviewDate)} 
                  />
                </td>
                <td className="p-1 border-r border-teal-50 bg-teal-50/20">
                  <DateInput 
                    value={row.approvalDate} 
                    onChange={(v) => updateRow(row.id, 'approvalDate', v)} 
                    className={getInputClass(true)} 
                    onOpenPicker={() => handleOpenPicker(row.id, 'approvalDate', row.approvalDate)} 
                  />
                </td>
                <td className="p-1">
                  <BufferedInput 
                    value={row.owner} 
                    onCommit={(v) => updateRow(row.id, 'owner', v)} 
                    className={getInputClass()} 
                    placeholder="承辦人..." 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayRows.length === 0 && (
          <div className="text-center py-12 text-gray-400">
             <p className="animate-pulse">正在初始化計畫列表...</p>
          </div>
        )}
      </div>
      <div className="p-2 bg-gray-50 border-t text-xs text-gray-500 text-center">
         包含 12 項標準施工計畫書之送審與核定時程管制
      </div>
    </div>
  );
};