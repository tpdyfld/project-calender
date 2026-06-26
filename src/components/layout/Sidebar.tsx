'use client';

import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { getProjectProgress } from '../../utils/projectStats';
import {
  LayoutDashboard,
  CheckSquare,
  ClipboardList,
  Calendar,
  Bug,
  FileText,
  Users,
  Award,
  Layers,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, project, tasks } = useProject();
  const { currentUser, logout } = useAuth();

  // 사이드바 메뉴 리스트 정의 (칸반 보드 제거 및 Todo 추가)
  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'todo', label: 'Todo', icon: CheckSquare },
    { id: 'tasks', label: '작업 목록', icon: ClipboardList },
    { id: 'calendar', label: '일정 달력', icon: Calendar },
    { id: 'bugs', label: '버그 관리', icon: Bug },
    { id: 'meetings', label: '회의록', icon: FileText },
    { id: 'team', label: '팀원 현황', icon: Users },
  ];

  // 프로젝트 전체 진행률 계산
  const projectProgress = getProjectProgress(tasks);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300 select-none">
      {/* 로고 영역 */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
          DF
        </div>
        <div>
          <h1 className="font-semibold text-white tracking-wider text-base">DevFlow</h1>
          <p className="text-[10px] text-slate-500 font-medium">MANAGER v1.0</p>
        </div>
      </div>

      {/* 프로젝트 단계 요약 */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Layers size={12} className="text-indigo-500" />
          <span>현재 개발 단계</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {project.phase === 'Planning' && '기획 단계'}
            {project.phase === 'Design' && '디자인 단계'}
            {project.phase === 'Development' && '개발 단계'}
            {project.phase === 'Testing' && '테스트 단계'}
            {project.phase === 'Deployment' && '배포 단계'}
            {project.phase === 'Completed' && '완료 단계'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">D-Day</span>
        </div>
      </div>

      {/* 네비게이션 메뉴 목록 */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-250 gap-3 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
              }`}
            >
              <IconComponent size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 하단 프로젝트 달성률 프로그레스 영역 */}
      <div className="p-6 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Award size={14} className="text-indigo-400" />
            <span>전체 프로젝트 달성률</span>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400">{projectProgress}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${projectProgress}%` }}
          />
        </div>
        <div className="mt-3 text-[10px] text-slate-500 text-center leading-relaxed">
          {project.name}의 성공적인 마감을 응원합니다!
        </div>
      </div>

      {/* 사용자 프로필 및 로그아웃 섹션 */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0 ${currentUser?.avatarColor || 'bg-indigo-600'}`}>
            {currentUser?.name ? currentUser.name[0] : 'U'}
          </span>
          <div className="overflow-hidden">
            <p className="font-bold text-white truncate">{currentUser?.name || '사용자'}</p>
            <p className="text-[10px] text-slate-500 truncate">{currentUser?.email || '이메일 없음'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-1.5 text-slate-500 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
          title="로그아웃"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
