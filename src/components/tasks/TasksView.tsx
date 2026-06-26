'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task } from '../../types';
import { STANDARD_DATE, getDaysDifference } from '../../utils/projectStats';
import { AlertOctagon, Calendar, CheckCircle2, Filter, Info, Trash2, GripVertical } from 'lucide-react';
import TaskModal from '../modals/TaskModal';

export default function TasksView() {
  const { tasks, members, updateTask, deleteTask, searchQuery } = useProject();

  // 모달 제어 상태
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // 로컬 필터 상태 관리
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [blockerFilter, setBlockerFilter] = useState<string>('all');
  const [timelineFilter, setTimelineFilter] = useState<string>('all');

  // 드래그앤드롭 상태
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [taskOrder, setTaskOrder] = useState<string[]>([]);

  // 컴포넌트 마운트 시 저장된 순서 로드
  useEffect(() => {
    const savedOrder = localStorage.getItem('devflow_tasks_order');
    if (savedOrder) {
      setTaskOrder(JSON.parse(savedOrder));
    }
  }, []);

  // 새로운 순서 저장 핸들러
  const saveTaskOrder = (newOrder: string[]) => {
    setTaskOrder(newOrder);
    localStorage.setItem('devflow_tasks_order', JSON.stringify(newOrder));
  };

  // 작업 행 클릭 시 상세 조회 모달 띄우기
  const handleRowClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  // 삭제 클릭 시 (행 클릭 이벤트 전파 차단)
  const handleDeleteClick = (event: React.MouseEvent, taskId: string) => {
    event.stopPropagation();
    if (confirm('정말로 이 작업을 삭제하시겠습니까?')) {
      deleteTask(taskId);
    }
  };

  // 외부 원클릭 완료 토글 액션 (체크박스 변경 시 호출)
  const handleCheckboxToggle = (event: React.ChangeEvent<HTMLInputElement>, task: Task) => {
    event.stopPropagation(); // 행 클릭 이벤트 전파 완전 방지
    if (task.status === 'Done') {
      updateTask(task.id, { status: 'Todo', progress: 0 });
    } else {
      updateTask(task.id, { status: 'Done', progress: 100 });
    }
  };

  // 상태값에 따른 우선순위 뱃지 스타일
  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'High':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Medium':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-550/20';
    }
  };

  // 상태값에 따른 상태 뱃지 스타일
  const getStatusStyle = (status: Task['status']) => {
    switch (status) {
      case 'Done':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Testing':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Code Review':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'In Progress':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'Todo':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-slate-400 bg-slate-550/10 border-slate-500/20';
    }
  };

  // 복합 필터 알고리즘 적용
  const filteredTasks = tasks.filter((task) => {
    // 1. 상단 글로벌 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. 상태(Status) 필터
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;

    // 3. 담당자(Assignee) 필터
    if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) return false;

    // 4. 우선순위(Priority) 필터
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // 5. 블로커(Blocker) 유무 필터
    if (blockerFilter === 'blocked' && !task.hasBlocker) return false;
    if (blockerFilter === 'unblocked' && task.hasBlocker) return false;

    // 6. 마감 일정 임박 필터
    if (timelineFilter !== 'all') {
      const daysLeft = getDaysDifference(STANDARD_DATE, task.dueDate);
      if (timelineFilter === 'overdue' && (daysLeft >= 0 || task.status === 'Done')) return false;
      if (timelineFilter === 'due_soon' && (daysLeft < 0 || daysLeft > 2 || task.status === 'Done')) return false;
    }

    return true;
  });

  // 정렬 순서 계산 함수
  // 1) 미완료 작업 우선, 완료된 작업 맨 아래 배치
  // 2) 각 서브그룹 내에서 사용자의 order 필드가 지정되어 있는 경우 최우선 적용
  // 3) order 필드가 없는 경우 로컬스토리지 백업 순서(taskOrder)를 차선 적용
  // 4) 드래그 기록이 없으면 우선순위 및 마감일 임박순 적용
  const getSortedTasks = (tasksToSort: Task[]) => {
    const priorityWeight: Record<string, number> = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };

    return [...tasksToSort].sort((a, b) => {
      // 1. 완료 상태 비교 (Done은 맨 아래로)
      const isADone = a.status === 'Done';
      const isBDone = b.status === 'Done';
      if (isADone && !isBDone) return 1;
      if (!isADone && isBDone) return -1;

      // 2. 같은 그룹(둘 다 미완료 또는 둘 다 완료) 내에서 order 필드가 있으면 우선 정렬
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;

      // 3. localStorage 순서 데이터 기반 차선 적용
      const aOrderIdx = taskOrder.indexOf(a.id);
      const bOrderIdx = taskOrder.indexOf(b.id);

      if (aOrderIdx !== -1 && bOrderIdx !== -1) {
        return aOrderIdx - bOrderIdx;
      } else if (aOrderIdx !== -1) {
        return -1;
      } else if (bOrderIdx !== -1) {
        return 1;
      }

      // 4. 드래그 기록이 없는 경우의 기본 정렬 기준
      if (!isADone) {
        // 미완료일 때
        const aWeight = priorityWeight[a.priority] || 0;
        const bWeight = priorityWeight[b.priority] || 0;
        if (bWeight !== aWeight) {
          return bWeight - aWeight;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        // 완료일 때 마감일 역순
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
    });
  };

  const sortedFilteredTasks = getSortedTasks(filteredTasks);

  // HTML5 Drag & Drop 드래그 시작
  const handleTaskDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  // HTML5 Drag & Drop 드롭 처리 (순서 갱신)
  const handleTaskDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetId) return;

    const dragTask = tasks.find((t) => t.id === draggedTaskId);
    const targetTask = tasks.find((t) => t.id === targetId);
    if (!dragTask || !targetTask) return;

    const isDragDone = dragTask.status === 'Done';
    const isTargetDone = targetTask.status === 'Done';

    // 드래그 대상과 드롭 타겟의 완료 여부가 같을 때만 순서 변경 허용
    if (isDragDone === isTargetDone) {
      // 해당 그룹(미완료 그룹 또는 완료 그룹)을 필터링
      const targetGroup = sortedFilteredTasks.filter((t) => (t.status === 'Done') === isDragDone);
      const otherGroup = sortedFilteredTasks.filter((t) => (t.status === 'Done') !== isDragDone);

      const dragIdx = targetGroup.findIndex((t) => t.id === draggedTaskId);
      const targetIdx = targetGroup.findIndex((t) => t.id === targetId);

      if (dragIdx !== -1 && targetIdx !== -1) {
        const updatedTargetGroup = [...targetGroup];
        const [draggedItem] = updatedTargetGroup.splice(dragIdx, 1);
        updatedTargetGroup.splice(targetIdx, 0, draggedItem);

        // 정렬 우선순위(미완료 우선)에 맞춰 재병합
        const finalMerged = isDragDone
          ? [...otherGroup, ...updatedTargetGroup]
          : [...updatedTargetGroup, ...otherGroup];

        const newOrderList = finalMerged.map((t) => t.id);
        saveTaskOrder(newOrderList);

        // 각 태스크의 order 값을 정렬 인덱스 순서에 맞춰 updateTask 호출로 업데이트 (새로고침 시 유지 보장)
        finalMerged.forEach((task, index) => {
          updateTask(task.id, { order: index });
        });
      }
    }

    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-4rem)] pb-8 pr-2">
      {/* 필터링 조작 바 */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-350">
          <Filter size={14} className="text-indigo-400" />
          <span>조건 상세 필터</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded focus:outline-none"
          >
            <option value="all">진행 상태: 전체</option>
            <option value="Backlog">Backlog</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Code Review">Code Review</option>
            <option value="Testing">Testing</option>
            <option value="Done">Done</option>
          </select>

          {/* 담당자 필터 */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded focus:outline-none"
          >
            <option value="all">담당 팀원: 전체</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>

          {/* 우선순위 필터 */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded focus:outline-none"
          >
            <option value="all">우선순위: 전체</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          {/* 블로커 필터 */}
          <select
            value={blockerFilter}
            onChange={(e) => setBlockerFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded focus:outline-none"
          >
            <option value="all">장애 여부: 전체</option>
            <option value="blocked">블락(Blocker) 있음</option>
            <option value="unblocked">일반(장애 없음)</option>
          </select>

          {/* 일정 필터 */}
          <select
            value={timelineFilter}
            onChange={(e) => setTimelineFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded focus:outline-none"
          >
            <option value="all">마감 임박: 전체</option>
            <option value="overdue">마감일 지남 (Overdue)</option>
            <option value="due_soon">마감 2일 이내 임박 (Due Soon)</option>
          </select>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="py-4 px-2 text-center w-8">순서</th>
                <th className="py-4 px-4 text-center w-12">완료</th>
                <th className="py-4 px-6">작업 제목</th>
                <th className="py-4 px-4">담당자</th>
                <th className="py-4 px-4">영역</th>
                <th className="py-4 px-4">우선순위</th>
                <th className="py-4 px-4">상태</th>
                <th className="py-4 px-4">마감일 (D-Day)</th>
                <th className="py-4 px-4">진행률</th>
                <th className="py-4 px-6 text-center">동작</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {sortedFilteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 font-medium bg-slate-900">
                    필터링 조건에 부합하는 작업 내역이 존재하지 않습니다.
                  </td>
                </tr>
              ) : (
                sortedFilteredTasks.map((task) => {
                  const assignee = members.find((m) => m.id === task.assigneeId);
                  const daysLeft = getDaysDifference(STANDARD_DATE, task.dueDate);
                  const isOverdue = daysLeft < 0 && task.status !== 'Done';

                  return (
                    <tr
                      key={task.id}
                      draggable // 항상 드래그 가능하도록 수정
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleTaskDrop(e, task.id)}
                      onClick={() => handleRowClick(task.id)}
                      className={`hover:bg-slate-950/30 transition-colors cursor-pointer group ${
                        draggedTaskId === task.id ? 'opacity-30 bg-slate-950/50' : ''
                      }`}
                    >
                      {/* 순서 그립 핸들 */}
                      <td className="py-4 px-2 text-center text-slate-650" onClick={(e) => e.stopPropagation()}>
                        <span className="cursor-grab active:cursor-grabbing inline-block text-slate-500 hover:text-slate-300 transition-colors">
                          <GripVertical size={13} />
                        </span>
                      </td>

                      {/* 원클릭 토글 체크박스 */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={task.status === 'Done'}
                          onChange={(e) => handleCheckboxToggle(e, task)}
                          className="w-4 h-4 rounded text-indigo-655 bg-slate-955 border-slate-805 focus:ring-indigo-655 focus:ring-offset-slate-955 cursor-pointer accent-indigo-500"
                        />
                      </td>

                      {/* 작업 제목 & 블로커 */}
                      <td className="py-4 px-6 font-semibold text-slate-200">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="group-hover:text-indigo-400 transition-colors truncate max-w-[280px]">
                              {task.title}
                            </span>
                            {task.hasBlocker && task.status !== 'Done' && (
                              <span className="flex items-center gap-0.5 bg-rose-500/15 text-rose-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-rose-500/20">
                                <AlertOctagon size={10} />
                                <span>장애</span>
                              </span>
                            )}
                          </div>
                          {task.hasBlocker && task.blockerText && task.status !== 'Done' && (
                            <span className="text-[10px] text-rose-400 font-medium truncate max-w-[340px]">
                              사유: {task.blockerText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 담당 팀원 */}
                      <td className="py-4 px-4 font-medium text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold ${assignee?.avatarColor || 'bg-slate-700'}`}>
                            {assignee?.name[0] || 'U'}
                          </span>
                          <span>{assignee?.name || '미정'}</span>
                        </div>
                      </td>

                      {/* 카테고리 (영역) */}
                      <td className="py-4 px-4 text-slate-400 font-semibold uppercase text-[10px]">
                        {task.category}
                      </td>

                      {/* 우선순위 */}
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* 진행 상태 */}
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusStyle(task.status)}`}>
                          {task.status}
                        </span>
                      </td>

                      {/* 마감 날짜 및 D-day */}
                      <td className="py-4 px-4 text-slate-300 font-medium">
                        <div className="flex flex-col">
                          <span>{task.dueDate}</span>
                          <span className={`text-[10px] ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                            {task.status === 'Done' ? '완료됨' : isOverdue ? `초과 D+${Math.abs(daysLeft)}` : `D-${daysLeft}`}
                          </span>
                        </div>
                      </td>

                      {/* 진행률 게이지 */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5 w-24">
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">{task.progress}%</span>
                        </div>
                      </td>

                      {/* 동작 (삭제) */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={(e) => handleDeleteClick(e, task.id)}
                          className="p-1.5 text-slate-550 hover:text-rose-450 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 작업 상세 수정용 모달 */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskId={selectedTaskId}
      />
    </div>
  );
}
