'use client';

import React from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import DashboardView from '../components/dashboard/DashboardView';
import TodoView from '../components/todo/TodoView';
import TasksView from '../components/tasks/TasksView';
import BugsView from '../components/bugs/BugsView';
import MeetingsView from '../components/meetings/MeetingsView';
import TeamView from '../components/team/TeamView';
import CalendarView from '../components/calendar/CalendarView';
import AuthView from '../components/auth/AuthView';

export default function Home() {
  const { activeTab } = useProject();
  const { currentUser, isAuthLoading } = useAuth();

  // 1. 인증 정보 로딩 중일 경우 스켈레톤/로딩 렌더링
  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-450 text-xs font-semibold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-550 border-t-transparent animate-spin" />
          <span>보안 인증 동기화 중...</span>
        </div>
      </div>
    );
  }

  // 2. 비로그인 상태일 경우 로그인/회원가입 폼 노출
  if (!currentUser) {
    return <AuthView />;
  }

  // activeTab 상태값에 따른 메인 본문 뷰 렌더링 스위처
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'todo':
        return <TodoView />;
      case 'tasks':
        return <TasksView />;
      case 'calendar':
        return <CalendarView />;
      case 'bugs':
        return <BugsView />;
      case 'meetings':
        return <MeetingsView />;
      case 'team':
        return <TeamView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* 좌측 64px(w-64) 고정 사이드 바 */}
      <Sidebar />

      {/* 우측 메인 콘텐츠 레이아웃 영역 (헤더 + 본문) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 16px(h-16) 유틸리티 헤더 */}
        <Header />

        {/* 하단 본문 스크롤 영역 */}
        <main className="flex-1 overflow-hidden p-8 bg-slate-950">
          <div className="h-full w-full max-w-none">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
