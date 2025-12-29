export type UserRole = 'ADMIN' | 'PLANNER' | 'EXECUTOR' | 'PROCUREMENT';

export type Department = 'PROCUREMENT' | 'OPERATIONS' | 'QUALITY' | 'ADMIN';

export interface UserProfile {
  username: string;
  name: string;
  department: Department; // Which department they belong to
  role: UserRole;         // Their permission level WITHIN that department (e.g., PLANNER, EXECUTOR)
}

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

export interface OperationRow {
  id: string;
  projectId: string;
  category: string;        // 區分 (例如：設計階段、假設工程、地工工程)
  item: string;            // 各階段/工程項目 (例如：基本設計、連續壁)
  
  // 預定進度 (Scheduled)
  scheduledStartDate: string; // 開始日期
  scheduledEndDate: string;   // 完成日期
  // scheduledDuration (工期) is calculated on the fly

  // 實際進度 (Actual)
  actualStartDate: string;    // 開始日期
  actualEndDate: string;      // 完成日期
  // actualDuration (工期) is calculated on the fly

  remarks: string;            // 備註 (落後說明)
}

export interface QualityRow {
  id: string;
  projectId: string;
  planName: string;        // 計畫名稱 (例如：施工架計畫) - 固定不可改
  submissionDate: string;  // 提送日期
  reviewDate: string;      // 審查日期
  approvalDate: string;    // 核定備查日期
  owner: string;           // 承辦人員
}

export interface AnalysisResult {
  summary: string;
  criticalDelays: string[];
  recommendations: string[];
}