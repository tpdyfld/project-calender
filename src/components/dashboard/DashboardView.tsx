'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  getTaskStats,
  getRiskTasks,
  getProjectProgress,
  getMemberStats,
  getBugStats,
  STANDARD_DATE,
  getDaysDifference
} from '../../utils/projectStats';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Play,
  Bug,
  AlertOctagon,
  Flame,
  ArrowRight,
  User,
  Zap,
  GripVertical
} from 'lucide-react';
import TaskModal from '../modals/TaskModal';

export default function DashboardView() {
  const { tasks, members, bugs, searchQuery, updateTask } = useProject();

  // 위험 작업 상세 수정을 위한 모달 상태
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // 드래그앤드롭 정렬 상태
  const [draggedRiskTaskId, setDraggedRiskTaskId] = useState<string | null>(null);
  const [riskTasksOrder, setRiskTasksOrder] = useState<string[]>([]);

  // 로컬스토리지로부터 저장된 위험 작업 정렬 인덱스 복원
  useEffect(() => {
    const savedOrder = localStorage.getItem('devflow_risk_tasks_order');
    if (savedOrder) {
      setRiskTasksOrder(JSON.parse(savedOrder));
    }
  }, []);

  // 정렬된 작업 순서 저장
  const saveRiskTasksOrder = (newOrder: string[]) => {
    setRiskTasksOrder(newOrder);
    localStorage.setItem('devflow_risk_tasks_order', JSON.stringify(newOrder));
  };

  // 검색 쿼리가 있는 경우 작업 필터링
  const filteredTasks = searchQuery
    ? tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  // 각종 통계 수치 연산
  const stats = getTaskStats(filteredTasks);
  const progress = getProjectProgress(tasks);
  const riskTasks = getRiskTasks(filteredTasks);
  const memberStats = getMemberStats(members, tasks);
  const bugStats = getBugStats(bugs);

  // riskOrder 필드 또는 로컬스토리지 드래그앤드롭 가중치에 맞춰 위험 작업 정렬
  const sortedRiskTasks = [...riskTasks].sort((a, b) => {
    // 1. 객체의 riskOrder 값이 존재하면 최우선 기준으로 비교 정렬
    if (a.riskOrder !== undefined && b.riskOrder !== undefined) {
      return a.riskOrder - b.riskOrder;
    }
    if (a.riskOrder !== undefined) return -1;
    if (b.riskOrder !== undefined) return 1;

    // 2. localStorage 순서 백업 데이터 기반 차선 정렬
    const aIdx = riskTasksOrder.indexOf(a.id);
    const bIdx = riskTasksOrder.indexOf(b.id);
    if (aIdx !== -1 && bIdx !== -1) {
      return aIdx - bIdx;
    }
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    // 기본 마감 임박 순 정렬
    return getDaysDifference(STANDARD_DATE, a.dueDate) - getDaysDifference(STANDARD_DATE, b.dueDate);
  });

  // 위험 작업 카드 클릭 시 모달 열기 핸들러
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  // 우선순위 색상 구출 함수
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-rose-450 bg-rose-500/10 border-rose-500/20';
      case 'High':
        return 'text-orange-455 bg-orange-500/10 border-orange-500/20';
      case 'Medium':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  // HTML5 Drag & Drop: 드래그 시작
  const handleRiskDragStart = (e: React.DragEvent, id: string) => {
    setDraggedRiskTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  // HTML5 Drag & Drop: 드롭 및 순서 변경 보존
  const handleRiskDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedRiskTaskId || draggedRiskTaskId === targetId) return;

    const dragIdx = sortedRiskTasks.findIndex((t) => t.id === draggedRiskTaskId);
    const targetIdx = sortedRiskTasks.findIndex((t) => t.id === targetId);

    if (dragIdx !== -1 && targetIdx !== -1) {
      const updated = [...sortedRiskTasks];
      const [draggedItem] = updated.splice(dragIdx, 1);
      updated.splice(targetIdx, 0, draggedItem);

      // ID 정렬 배열 갱신 저장 (localStorage 용)
      const newOrderList = updated.map((t) => t.id);
      saveRiskTasksOrder(newOrderList);

      // 각 작업의 riskOrder 데이터 갱신 API 호출 연동 (새로고침 시 유지 보장)
      updated.forEach((task, index) => {
        updateTask(task.id, { riskOrder: index });
      });
    }
    setDraggedRiskTaskId(null);
  };

  // SVG 원형 프로그레스 계산용 변수
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] pb-8 pr-2">
      {/* 1. 상단 통계 카드 목록 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 총 작업 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-555 uppercase tracking-wider">총 작업 수</span>
            <h3 className="text-2xl font-bold text-white font-mono">{stats.total}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
            <ClipboardList size={18} className="text-slate-400" />
          </div>
        </div>

        {/* 진행 중 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-555 uppercase tracking-wider">진행 중</span>
            <h3 className="text-2xl font-bold text-sky-400 font-mono">{stats.inProgress + stats.codeReview + stats.testing}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-950/20 flex items-center justify-center border border-sky-900/30">
            <Play size={18} className="text-sky-400" />
          </div>
        </div>

        {/* 지연 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-555 uppercase tracking-wider">일정 지연</span>
            <h3 className="text-2xl font-bold text-rose-400 font-mono">{stats.overdue}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-950/20 flex items-center justify-center border border-rose-900/30">
            <Flame size={18} className="text-rose-400" />
          </div>
        </div>

        {/* 진행 장애 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-555 uppercase tracking-wider">진행 장애 (Block)</span>
            <h3 className="text-2xl font-bold text-amber-400 font-mono">{stats.blocked}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/20 flex items-center justify-center border border-amber-900/30">
            <AlertOctagon size={18} className="text-amber-400" />
          </div>
        </div>

        {/* 버그 개수 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-555 uppercase tracking-wider">미해결 버그</span>
            <h3 className="text-2xl font-bold text-red-500 font-mono">{bugStats.open + bugStats.inProgress}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/20 flex items-center justify-center border border-red-900/30">
            <Bug size={18} className="text-red-500" />
          </div>
        </div>
      </div>

      {/* 2. 메인 지표 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* (왼쪽) 프로젝트 달성률 도넛 차트 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 self-start">프로젝트 종합 진행률</h4>
          
          <div className="relative flex items-center justify-center mb-6">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white font-mono leading-none">{progress}%</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1.5">Done Ratio</span>
            </div>
          </div>

          <div className="w-full bg-slate-950/50 rounded-lg p-3.5 border border-slate-850 flex items-center justify-between text-left">
            <div>
              <p className="text-[10px] text-slate-555 font-semibold uppercase">완료된 업무</p>
              <p className="text-sm font-bold text-white mt-0.5">{stats.done} / {stats.total} 건 완료</p>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle2 size={12} />
              <span>정상 기동</span>
            </div>
          </div>
        </div>

        {/* (중앙/우측) 마감 위험 작업 목록 (Risk Tasks) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-rose-500" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                마감 위험 작업 목록 ({riskTasks.length}건 감지)
              </h4>
            </div>
            <span className="text-[10px] text-slate-555">기준일: {STANDARD_DATE}</span>
          </div>

          {/* 컨테이너의 최대 높이를 max-h-[310px]로 넉넉하게 변경하여 */}
          {/* 항목 3개까지는 애매하게 잘림 현상 없이 스크롤 없이 그대로 다 보이고, */}
          {/* 4개 이상인 경우에만 세로 스크롤바가 생기도록 보완합니다. */}
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[310px] pr-1">
            {sortedRiskTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 text-slate-500 space-y-2">
                <CheckCircle2 size={24} className="text-indigo-400" />
                <p className="text-xs">현재 마감 위험이 있거나 블락된 작업이 없습니다.</p>
              </div>
            ) : (
              sortedRiskTasks.map((task) => {
                const daysLeft = getDaysDifference(STANDARD_DATE, task.dueDate);
                const isOverdue = daysLeft < 0;
                
                // 마감 위험 사유 텍스트
                let riskReason = '';
                if (task.hasBlocker) riskReason = '🚨 진행 차단(Blocker) 등록';
                else if (isOverdue) riskReason = `⚠️ 마감일 초과 (D+${Math.abs(daysLeft)})`;
                else if (daysLeft <= 2) riskReason = `⏳ 마감 직전 미시작 (D-${daysLeft})`;

                const assignee = members.find((m) => m.id === task.assigneeId);

                return (
                  <div
                    key={task.id}
                    draggable // 드래그 앤 드롭 활성화
                    onDragStart={(e) => handleRiskDragStart(e, task.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleRiskDrop(e, task.id)}
                    onClick={() => handleTaskClick(task.id)}
                    className={`p-3.5 bg-slate-955 border border-slate-850 hover:border-slate-700 hover:bg-slate-900/60 rounded-lg flex items-center justify-between transition-all duration-200 group ${
                      draggedRiskTaskId === task.id ? 'opacity-30 bg-slate-950/40 shadow-none' : 'cursor-grab active:cursor-grabbing hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* 드래그 가능함을 알려주는 그립 핸들 아이콘 추가 */}
                      <span className="text-slate-650 cursor-grab active:cursor-grabbing group-hover:text-slate-450 transition-colors shrink-0">
                        <GripVertical size={14} />
                      </span>
                      
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono font-medium shrink-0 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase truncate">{task.category}</span>
                        </div>
                        <h5 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {task.title}
                        </h5>
                        <p className="text-[9px] text-rose-400 font-semibold leading-none">{riskReason}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0 ml-4">
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-slate-555 font-semibold uppercase">담당자</p>
                        <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                          <span className={`w-2 h-2 rounded-full ${assignee?.avatarColor || 'bg-slate-500'}`} />
                          <span className="text-xs text-slate-300 font-medium">{assignee?.name}</span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-605 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. 하단 영역 (팀원별 진행 현황 차트 & 버그 정보) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* (좌측/중앙) 팀원별 업무 배분 및 진행 대비율 가로 막대 그래프 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">팀원별 업무 수행 지표</h4>
          
          <div className="space-y-4">
            {memberStats.map((stat) => (
              <div key={stat.memberId} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${stat.avatarColor}`}>
                      {stat.memberName[0]}
                    </span>
                    <span className="font-bold text-white">{stat.memberName}</span>
                    <span className="text-[10px] text-slate-555 font-semibold">{stat.role}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                    <span>할당: <strong className="text-white">{stat.assignedCount}</strong></span>
                    <span>진행: <strong className="text-sky-400">{stat.inProgressCount}</strong></span>
                    <span>완료: <strong className="text-emerald-400">{stat.completedCount}</strong></span>
                    <span className="text-indigo-400 font-bold">달성률 {stat.progressPercent}%</span>
                  </div>
                </div>

                {/* 가로형 백분율 바 그래프 */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex">
                  {stat.assignedCount === 0 ? (
                    <div className="w-full bg-slate-800/40 h-full" />
                  ) : (
                    <>
                      {/* 완료 비율 */}
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${(stat.completedCount / stat.assignedCount) * 100}%` }}
                      />
                      {/* 진행 중 비율 */}
                      <div
                        className="bg-sky-500 h-full transition-all duration-500"
                        style={{ width: `${(stat.inProgressCount / stat.assignedCount) * 100}%` }}
                      />
                      {/* 대기 비율 */}
                      <div
                        className="bg-slate-800 h-full transition-all duration-500"
                        style={{
                          width: `${
                            ((stat.assignedCount - stat.completedCount - stat.inProgressCount) /
                              stat.assignedCount) *
                            100
                          }%`,
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* (우측) 버그 심각도별 카드 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">시스템 버그 리포트 요약</h4>
            
            <div className="space-y-3.5">
              {/* Critical 버그 */}
              <div className="flex items-center justify-between p-3 bg-slate-955 rounded-lg border border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-300">Critical (긴급 조치)</span>
                </div>
                <span className="text-sm font-mono font-bold text-rose-500">{bugStats.critical} 건</span>
              </div>

              {/* Major 버그 */}
              <div className="flex items-center justify-between p-3 bg-slate-955 rounded-lg border border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-xs font-semibold text-slate-300">Major (중요/주요)</span>
                </div>
                <span className="text-sm font-mono font-bold text-orange-500">{bugStats.major} 건</span>
              </div>

              {/* Minor 버그 */}
              <div className="flex items-center justify-between p-3 bg-slate-955 rounded-lg border border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-xs font-semibold text-slate-300">Minor (기타/사소함)</span>
                </div>
                <span className="text-sm font-mono font-bold text-sky-400">{bugStats.minor} 건</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 bg-indigo-950/20 border border-indigo-900/30 rounded-lg flex items-center gap-3">
            <Zap size={18} className="text-indigo-400" />
            <p className="text-[10px] text-indigo-300 leading-relaxed font-medium">
              버그 수정이 완료되어 Fixed 상태가 된 티켓은 QA 담당자의 Closed 검증을 거친 뒤 완전히 소멸됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 태스크 상세 수정용 모달 */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskId={selectedTaskId}
      />
    </div>
  );
}
