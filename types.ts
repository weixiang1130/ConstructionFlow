export type UserRole = 'ADMIN' | 'PLANNER' | 'EXECUTOR' | 'PROCUREMENT';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface ProcurementRow {
  id: string;
  projectId: string;           // Linked Project ID (New)
  remarks: string;             // 備註
  projectName: string;         // 專案名稱
  engineeringItem: string;     // 工程項目
  scheduledRequestDate: string; // 預定提出時間 (C)
  actualRequestDate: string;    // 實際提出時間 (D)
  siteOrganizer: string;       // 工地主辦
  procurementOrganizer: string;// 採發主辦
  returnDate: string;          // 退件日期
  returnReason: string;        // 退件原因
  resubmissionDate: string;    // 重新提送日期
  contractorConfirmDate: string;// 確認承攬商日期
  contractorName: string;      // 廠商
}

export interface AnalysisResult {
  summary: string;
  criticalDelays: string[];
  recommendations: string[];
}