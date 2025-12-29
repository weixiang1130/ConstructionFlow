import { UserProfile } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    username: 'admin',
    name: '系統管理員',
    department: 'ADMIN',
    role: 'ADMIN'
  },
  {
    username: 'proc_user',
    name: '採購小李',
    department: 'PROCUREMENT',
    role: 'PROCUREMENT'
  },
  {
    username: 'ops_user',
    name: '營管小張',
    department: 'OPERATIONS',
    role: 'PLANNER'
  },
  {
    username: 'qa_user',
    name: '品保小王',
    department: 'QUALITY',
    role: 'EXECUTOR'
  }
];