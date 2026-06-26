'use client';

import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task } from '../../types';
import { STANDARD_DATE, getDaysDifference } from '../../utils/projectStats';
import { AlertOctagon, Calendar, CheckCircle2, ChevronRight, User } from 'lucide-react';
import TaskModal from '../modals/TaskModal';

export default function BoardView() {
  const { tasks, members, updateTask, searchQuery } = useProject();

  // 태스크 상세 수정용 모달 상태
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // 칸반 컬럼 목록 정의
  const columns: { id: Task['status']; label: string; bgClass: string; borderClass: string }[] = [
    { id: 'Backlog', label: '대기 (Backlog)', bgClass: 'bg-slate-900/50', borderClass: 'border-slate-800' },
    { id: 'Todo', label: '계획 (Todo)', bgClass: 'bg-slate-900/50', borderClass: 'border-slate-800' },
    { id: 'In Progress', label: '진행 중 (Progress)', bgClass: 'bg-slate-900/50', borderClass: 'border-slate-800' },
    { id: 'Code Review', label: '리뷰 중 (Review)', bgClass: 'bg-purple-950/5', borderClass: 'border-purple-900/10' },
    { id: 'Testing', label: '테스트 (Testing)', bgClass: 'bg-orange-950/5', borderClass: 'border-orange-900/10' },
    { id: 'Done', label: '완료 (Done)', bgClass: 'bg-emerald-950/5', borderClass: 'border-emerald-900/10' },
  ];

  // 카드 클릭 시 수정 모달 팝업
  const handleCardClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  // 상태 변경 드롭다운 선택 시 (이벤트 전파 방지 적용)
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>, taskId: string) => {
    event.stopPropagation(); // 카드 클릭 모달이 열리지 않도록 전파를 완전히 차단합니다.
    const newStatus = event.target.value as Task['status'];
    updateTask(taskId, { status: newStatus });
  };

  // 원클릭 Done 토글 액션 처리 (이벤트 전파 방지)
  const handleQuickCompleteToggle = (event: React.MouseEvent, task: Task) => {
    event.stopPropagation(); // 모달 팝업 차단
    if (task.status === 'Done') {
      updateTask(task.id, { status: 'Todo', progress: 0 });
    } else {
      updateTask(task.id, { status: 'Done', progress: 100 });
    }
  };

  // 우선순위 텍스트에 따른 뱃지 색상 구하기
  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/30';
      case 'High':
        return 'text-orange-400 bg-orange-950/40 border-orange-850/30';
      case 'Medium':
        return 'text-indigo-400 bg-indigo-950/40 border-indigo-850/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700/50';
    }
  };

  // 검색어 필터링
  const filteredTasks = searchQuery
    ? tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  return (
    <div className="h-full flex flex-col space-y-4 max-w-full overflow-hidden pb-2">
      {/* 칸반 가로 스크롤 영역 */}
      <div className="flex-1 flex gap-3 overflow-x-auto pb-4 pt-1 items-start select-none w-full max-w-full">
        {columns.map((column) => {
          // 해당 컬럼에 속하는 태스크 분류
          const columnTasks = filteredTasks.filter((task) => task.status === column.id);

          return (
            <div
              key={column.id}
              className={`w-[255px] xl:w-[275px] shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col max-h-full ${column.bgClass} ${column.borderClass}`}
            >
              {/* 컬럼 헤더 */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800 shrink-0">
                <span className="text-xs font-bold text-slate-200 tracking-wider">
                  {column.label}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              {/* 컬럼 카드 목록 */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {columnTasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-center text-xs text-slate-600 p-4">
                    여기에 배치된 작업이 없습니다.
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const assignee = members.find((m) => m.id === task.assigneeId);
                    const daysLeft = getDaysDifference(STANDARD_DATE, task.dueDate);
                    const isOverdue = daysLeft < 0 && task.status !== 'Done';

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleCardClick(task.id)}
                        className={`p-4 bg-slate-950 hover:bg-slate-900/80 border rounded-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3.5 group ${
                          task.hasBlocker && task.status !== 'Done'
                            ? 'border-rose-900/50 hover:border-rose-700 shadow-md shadow-rose-950/20'
                            : 'border-slate-850 hover:border-slate-700'
                        }`}
                      >
                        {/* 카드 상단: 카테고리, 우선순위, 블로커, 원클릭 완료 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">{task.category}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {task.hasBlocker && task.status !== 'Done' && (
                              <div className="flex items-center gap-1 bg-rose-500/10 text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">
                                <AlertOctagon size={10} />
                                <span>장애</span>
                              </div>
                            )}

                            {/* 원클릭 즉시 완료 단추 */}
                            <button
                              onClick={(event) => handleQuickCompleteToggle(event, task)}
                              className={`p-1 rounded hover:bg-slate-800/80 transition-colors cursor-pointer ${
                                task.status === 'Done' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                              }`}
                              title={task.status === 'Done' ? '계획 상태로 변경' : '즉시 완료 처리'}
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* 카드 제목 & 설명 */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors truncate-2-lines">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* 진행률 바 */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] text-slate-500">
                            <span>진행 현황</span>
                            <span className="font-mono font-semibold text-slate-400">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* 카드 하단 정보: D-day, 담당자, 상태 변경 select */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-900 shrink-0">
                          {/* 마감일 및 D-Day */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Calendar size={11} className={isOverdue ? 'text-rose-400' : 'text-slate-500'} />
                            <span className={isOverdue ? 'text-rose-400 font-bold' : 'font-medium'}>
                              {task.status === 'Done' ? '완료됨' : isOverdue ? `지연 D+${Math.abs(daysLeft)}` : `D-${daysLeft}`}
                            </span>
                          </div>

                          {/* 담당자 배정 */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${assignee?.avatarColor || 'bg-slate-700'}`}>
                                {assignee?.name[0] || 'U'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">{assignee?.name}</span>
                            </div>

                            {/* 실시간 상태 업데이트 드롭다운 */}
                            <select
                              value={task.status}
                              onChange={(event) => handleStatusChange(event, task.id)}
                              className="h-6 px-1 bg-slate-900 hover:bg-slate-800 text-[9px] font-semibold text-slate-400 rounded border border-slate-800 focus:outline-none focus:border-indigo-600 transition-colors"
                            >
                              <option value="Backlog">Backlog</option>
                              <option value="Todo">Todo</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Code Review">Review</option>
                              <option value="Testing">Testing</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 작업 수정을 위한 상세 모달 */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskId={selectedTaskId}
      />
    </div>
  );
}
