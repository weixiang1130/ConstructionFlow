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
    name: '採購部專用帳號',
    department: 'PROCUREMENT',
    role: 'PROCUREMENT'
  },
  {
    username: 'ops_user',
    name: '營管部專用帳號',
    department: 'OPERATIONS',
    role: 'PLANNER'
  },
  {
    username: 'qa_user',
    name: '品保部專用帳號',
    department: 'QUALITY',
    role: 'EXECUTOR'
  }
];