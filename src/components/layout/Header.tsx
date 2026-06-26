'use client';

import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { STANDARD_DATE, getDaysDifference } from '../../utils/projectStats';
import { Search, Plus, Calendar, AlertTriangle, FileText } from 'lucide-react';
import TaskModal from '../modals/TaskModal';
import BugModal from '../modals/BugModal';
import MeetingModal from '../modals/MeetingModal';
import ProfileDropdown from './ProfileDropdown';

export default function Header() {
  const {
    activeTab,
    searchQuery,
    setSearchQuery,
    project,
  } = useProject();

  // 모달 열림 여부를 제어하는 로컬 상태
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  // 탭 ID에 맞는 한글 타이틀과 서브타이틀 매핑
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: '프로젝트 대시보드',
      subtitle: '프로젝트의 전체 진행 현황 및 리스크 요인을 파악합니다.',
    },
    todo: {
      title: '오늘의 할 일 (Todo)',
      subtitle: '팀원들이 오늘 진행할 작업을 기록하고 관리하는 깔끔한 할 일 목록입니다.',
    },
    tasks: {
      title: '전체 작업 목록',
      subtitle: '상세 조건 필터링을 통해 팀 프로젝트 업무를 조회합니다.',
    },
    calendar: {
      title: '일정 달력',
      subtitle: '작업들의 마감 일정을 월간 달력 형태로 시각화하여 확인합니다.',
    },
    bugs: {
      title: '버그 및 이슈 관리',
      subtitle: '개발 및 테스트 중 발견된 시스템 결함을 리포팅하고 조치합니다.',
    },
    meetings: {
      title: '회의록 아카이브',
      subtitle: '팀 회의에서 논의된 대화 기록과 결정 사항을 보존합니다.',
    },
    team: {
      title: '팀원 업무 현황',
      subtitle: '역할별 팀원 배치 현황 및 개인별 담당/완료 업무 통계입니다.',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || {
    title: 'DevFlow Manager',
    subtitle: 'IT 프로젝트 통합 관리',
  };

  // 남은 D-day 계산
  const daysLeft = getDaysDifference(STANDARD_DATE, project.dueDate);
  const isOverdue = daysLeft < 0;

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 text-slate-300 shrink-0">
      {/* 탭 타이틀 영역 */}
      <div className="flex flex-col">
        <h2 className="text-base font-bold text-white leading-tight">{currentTabInfo.title}</h2>
        <p className="text-xs text-slate-500 font-medium hidden md:block">{currentTabInfo.subtitle}</p>
      </div>

      {/* 우측 검색, 일정 정보, 액션 버튼 영역 */}
      <div className="flex items-center gap-6">
        {/* 검색창 */}
        <div className="relative w-64 hidden lg:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={15} className="text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="작업, 버그, 회의록 검색..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>

        {/* D-Day 캘린더 배지 */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 h-9 px-3 rounded-lg text-xs font-semibold text-slate-300">
          <Calendar size={14} className="text-indigo-400" />
          <span>마감일: {project.dueDate}</span>
          <span
            className={`ml-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
              isOverdue
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : daysLeft <= 3
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}
          >
            {isOverdue ? `지연됨 (D+${Math.abs(daysLeft)})` : `D-${daysLeft}`}
          </span>
        </div>

        {/* 내 프로필 드롭다운 버튼 */}
        <ProfileDropdown />

        {/* 빠른 추가 액션 버튼들 */}
        <div className="flex items-center gap-2">
          {/* 새 작업 추가 버튼 */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold h-9 px-3.5 rounded-lg transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">새 작업</span>
          </button>

          {/* 새 버그 리포팅 버튼 */}
          <button
            onClick={() => setIsBugModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold h-9 px-3.5 rounded-lg transition-colors cursor-pointer"
          >
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="hidden sm:inline">버그 제보</span>
          </button>

          {/* 새 회의록 등록 버튼 */}
          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold h-9 px-3.5 rounded-lg transition-colors cursor-pointer"
          >
            <FileText size={14} className="text-indigo-400" />
            <span className="hidden sm:inline">회의록 작성</span>
          </button>
        </div>
      </div>

      {/* 모달 렌더링 영역 */}
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <BugModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
      <MeetingModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} />
    </header>
  );
}
