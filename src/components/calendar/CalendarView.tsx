'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task } from '../../types';
import { Todo, TodoCategory, TodoPriority } from '../../types/todo';
import { todoService } from '../../services/todoService';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import TaskModal from '../modals/TaskModal';
import TodoModal from '../todo/TodoModal';
import { useAuth } from '../../context/AuthContext';

interface CalendarItem {
  id: string;
  title: string;
  startDate: string;
  dueDate: string;
  category: string;
  priority: string;
  status: string;
  type: 'task' | 'todo';
  assigneeName?: string;
  colorClass: string;
}

interface PositionedItem {
  item: CalendarItem;
  startCol: number;
  endCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
}

// 카테고리별 다크 테마와 매치되는 선명하고 세련된 색상 구분 함수
const getCategoryColor = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('개발') || cat.includes('frontend') || cat.includes('backend') || cat.includes('database') || cat.includes('api')) {
    return 'bg-blue-950/70 text-blue-400 border-blue-500/30 hover:bg-blue-900/60';
  }
  if (cat.includes('디자인') || cat.includes('ui')) {
    return 'bg-purple-950/70 text-purple-400 border-purple-500/30 hover:bg-purple-900/60';
  }
  if (cat.includes('회의') || cat.includes('planning')) {
    return 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/60';
  }
  if (cat.includes('버그수정')) {
    return 'bg-rose-950/70 text-rose-400 border-rose-500/30 hover:bg-rose-900/60';
  }
  if (cat.includes('테스트') || cat.includes('test')) {
    return 'bg-amber-950/70 text-amber-400 border-amber-500/30 hover:bg-amber-900/60';
  }
  if (cat.includes('문서작업') || cat.includes('deploy')) {
    return 'bg-slate-800/80 text-slate-400 border-slate-700/30 hover:bg-slate-700/70';
  }
  // 기타/남색
  return 'bg-indigo-950/70 text-indigo-400 border-indigo-500/30 hover:bg-indigo-900/60';
};

// 날짜 계산 유틸리티 헬퍼 (타임존 방지를 위해 T00:00:00 기준 사용)
const getDaysDiff = (startStr: string, endStr: string): number => {
  const s = new Date(startStr + 'T00:00:00');
  const e = new Date(endStr + 'T00:00:00');
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
};

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function CalendarView() {
  const { tasks, members, updateTask, searchQuery } = useProject();
  const { currentUser } = useAuth();

  // Todo 데이터 로컬 상태 관리
  const [todos, setTodos] = useState<Todo[]>([]);

  // 모달 제어 상태
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | undefined>(undefined);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);

  // 시뮬레이션 기준 날짜(2026년 6월 25일)에 맞춰 달력의 초기 값을 2026년 6월로 고정합니다.
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed (5 = 6월)

  // 드래그앤드롭 관련 로컬 상태
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<'task' | 'todo' | null>(null);
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);

  // 월별 한글 이름 매핑
  const monthNames = [
    '1월 (January)', '2월 (February)', '3월 (March)', '4월 (April)',
    '5월 (May)', '6월 (June)', '7월 (July)', '8월 (August)',
    '9월 (September)', '10월 (October)', '11월 (November)', '12월 (December)'
  ];

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // Todo 데이터 가져오기
  const loadTodos = () => {
    setTodos(todoService.getTodos());
  };

  useEffect(() => {
    loadTodos();
  }, [tasks]);

  // 연도 및 월 이동 조작
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(5);
  };

  // 특정 달의 일수 및 첫 번째 날의 요일 구하기
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // 달력 격자(Grid) 배열 빌드
  const calendarCells: { dateNum: number | null; dateString: string | null }[] = [];

  // 1일 시작 전 빈 칸 채우기
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ dateNum: null, dateString: null });
  }

  // 실제 날짜 채우기
  for (let dateNum = 1; dateNum <= daysInMonth; dateNum++) {
    const monthString = String(currentMonth + 1).padStart(2, '0');
    const dayString = String(dateNum).padStart(2, '0');
    const dateString = `${currentYear}-${monthString}-${dayString}`;
    calendarCells.push({ dateNum, dateString });
  }

  // 6주(42칸) 그리드를 채우기 위한 나머지 빈 칸 생성
  const remainingCells = 42 - calendarCells.length;
  for (let i = 0; i < remainingCells; i++) {
    calendarCells.push({ dateNum: null, dateString: null });
  }

  // 주(Week) 단위 슬라이싱 (6개 행)
  const weeks: typeof calendarCells[] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  // 검색어 및 활성 필터링된 태스크 조회
  const filteredTasks = searchQuery
    ? tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  const filteredTodos = searchQuery
    ? todos.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          todo.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : todos;

  // 전체 달력 아이템 병합 및 표준화
  const allCalendarItems: CalendarItem[] = [
    ...filteredTasks.map((t) => ({
      id: t.id,
      title: t.title,
      startDate: t.startDate || t.dueDate,
      dueDate: t.dueDate,
      category: t.category,
      priority: t.priority,
      status: t.status,
      type: 'task' as const,
      assigneeName: members.find((m) => m.id === t.assigneeId)?.name,
      colorClass: getCategoryColor(t.category),
    })),
    ...filteredTodos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      startDate: todo.startDate || todo.date,
      dueDate: todo.dueDate || todo.date,
      category: todo.category,
      priority: todo.priority,
      status: todo.isCompleted ? 'Done' : 'Todo',
      type: 'todo' as const,
      assigneeName: todo.userName,
      colorClass: getCategoryColor(todo.category),
    })),
  ];

  // 클릭 시 수정 모달 오픈 핸들러
  const handleItemClick = (event: React.MouseEvent, itemId: string, type: 'task' | 'todo') => {
    event.stopPropagation();
    if (type === 'task') {
      setSelectedTaskId(itemId);
      setIsTaskModalOpen(true);
    } else {
      const targetTodo = todos.find((t) => t.id === itemId);
      if (targetTodo) {
        setSelectedTodo(targetTodo);
        setIsTodoModalOpen(true);
      }
    }
  };

  // HTML5 Drag & Drop: 드래그 시작 시 ID 및 타입 캐싱
  const handleDragStart = (e: React.DragEvent, itemId: string, type: 'task' | 'todo') => {
    setDraggedItemId(itemId);
    setDraggedItemType(type);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  // HTML5 Drag & Drop: 날짜 셀 드래그 오버 강조
  const handleDragOverCell = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    setDraggedOverDate(dateString);
  };

  // HTML5 Drag & Drop: 날짜 셀 드래그 아웃
  const handleDragLeaveCell = () => {
    setDraggedOverDate(null);
  };

  // HTML5 Drag & Drop: 날짜 셀 드롭 시 기간 유지한 채 시작일/마감일 이동 갱신
  const handleDropCell = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDraggedOverDate(null);

    const itemId = draggedItemId || e.dataTransfer.getData('text/plain');
    const itemType = draggedItemType;
    if (!itemId || !itemType) return;

    if (itemType === 'task') {
      const task = tasks.find((t) => t.id === itemId);
      if (task) {
        const startStr = task.startDate || task.dueDate;
        const endStr = task.dueDate;
        const diffDays = getDaysDiff(startStr, endStr);
        const newStartDate = targetDate;
        const newDueDate = addDays(newStartDate, diffDays);

        await updateTask(itemId, { startDate: newStartDate, dueDate: newDueDate });
      }
    } else {
      const todo = todos.find((t) => t.id === itemId);
      if (todo) {
        const startStr = todo.startDate || todo.date;
        const endStr = todo.dueDate || todo.date;
        const diffDays = getDaysDiff(startStr, endStr);
        const newStartDate = targetDate;
        const newDueDate = addDays(newStartDate, diffDays);

        todoService.updateTodo(itemId, { 
          startDate: newStartDate, 
          dueDate: newDueDate,
          date: newStartDate
        });
        loadTodos();
      }
    }

    setDraggedItemId(null);
    setDraggedItemType(null);
  };

  // Todo 수정을 완료했을 때의 콜백 핸들러
  const handleTodoSubmit = (data: {
    title: string;
    description: string;
    date: string;
    startDate: string;
    dueDate: string;
    priority: TodoPriority;
    category: TodoCategory;
  }) => {
    if (selectedTodo) {
      todoService.updateTodo(selectedTodo.id, {
        title: data.title,
        description: data.description,
        date: data.date,
        startDate: data.startDate,
        dueDate: data.dueDate,
        priority: data.priority,
        category: data.category,
      });
    }
    setIsTodoModalOpen(false);
    setSelectedTodo(undefined);
    loadTodos();
  };

  // Todo 삭제를 처리하는 핸들러
  const handleTodoDelete = () => {
    if (selectedTodo) {
      todoService.deleteTodo(selectedTodo.id);
      setIsTodoModalOpen(false);
      setSelectedTodo(undefined);
      loadTodos();
    }
  };

  // 주(Week) 단위 일정 정렬 및 위치 지정 알고리즘 (가로 겹침 방지)
  const getWeekSchedule = (weekCells: typeof calendarCells) => {
    const days = weekCells.map((d) => d.dateString);
    const weekStartStr = days[0];
    const weekEndStr = days[6];

    if (!weekStartStr || !weekEndStr) return [];

    // 이 주(Week)에 걸쳐 있는 일정들 필터링
    const itemsInWeek = allCalendarItems.filter((item) => {
      return item.startDate <= weekEndStr && item.dueDate >= weekStartStr;
    });

    // 정렬: 기간이 긴 것 우선, 시작일이 빠른 것 우선
    itemsInWeek.sort((a, b) => {
      const aLen = getDaysDiff(a.startDate, a.dueDate);
      const bLen = getDaysDiff(b.startDate, b.dueDate);
      if (bLen !== aLen) return bLen - aLen;
      return a.startDate.localeCompare(b.startDate);
    });

    const rows: boolean[][] = [];
    const positionedItems: PositionedItem[][] = [];

    itemsInWeek.forEach((item) => {
      const startIdx = days.indexOf(item.startDate);
      const startCol = startIdx !== -1 ? startIdx : 0;

      const endIdx = days.indexOf(item.dueDate);
      const endCol = endIdx !== -1 ? endIdx : 6;

      const span = endCol - startCol + 1;
      const isStart = startIdx !== -1;
      const isEnd = endIdx !== -1;

      let targetRowIdx = -1;
      for (let r = 0; r < rows.length; r++) {
        let isAvailable = true;
        for (let c = startCol; c <= endCol; c++) {
          if (rows[r][c]) {
            isAvailable = false;
            break;
          }
        }
        if (isAvailable) {
          targetRowIdx = r;
          break;
        }
      }

      if (targetRowIdx === -1) {
        rows.push(new Array(7).fill(false));
        positionedItems.push([]);
        targetRowIdx = rows.length - 1;
      }

      for (let c = startCol; c <= endCol; c++) {
        rows[targetRowIdx][c] = true;
      }

      positionedItems[targetRowIdx].push({
        item,
        startCol,
        endCol,
        span,
        isStart,
        isEnd
      });
    });

    return positionedItems;
  };

  return (
    <div className="h-full flex flex-col space-y-4 max-w-full overflow-y-auto max-h-[calc(100vh-5rem)] pb-8 pr-1.5">
      {/* 1. 달력 제어 및 헤더 영역 */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/40 flex items-center justify-center border border-indigo-900/30">
            <CalendarIcon size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {currentYear}년 {monthNames[currentMonth]}
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Monthly Project Timeline</p>
          </div>
        </div>

        {/* 제어 버튼들 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleToday}
            className="h-8 px-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
          >
            오늘 (6월)
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. 메인 격자 달력 뷰포트 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm shrink-0">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/40 shrink-0 text-center py-2.5 text-[10px] font-bold text-slate-550 uppercase tracking-wider select-none">
          {daysOfWeek.map((day, idx) => (
            <div
              key={idx}
              className={idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-indigo-400' : ''}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 주(Week) 단위 적층 렌더링 영역 */}
        <div className="flex flex-col divide-y divide-slate-800 bg-slate-950/20">
          {weeks.map((week, weekIdx) => {
            const weekRows = getWeekSchedule(week);

            return (
              <div
                key={weekIdx}
                className="relative min-h-[140px] flex flex-col"
              >
                {/* 1) 배경 날짜 격자 셀 (7칸) */}
                <div className="absolute inset-0 grid grid-cols-7 divide-x divide-slate-800/80 pointer-events-none">
                  {week.map((cell, idx) => {
                    const isToday = cell.dateString === '2026-06-25';
                    const isDraggedOver = draggedOverDate === cell.dateString;

                    return (
                      <div
                        key={idx}
                        className={`pointer-events-auto p-2 flex flex-col justify-between h-full relative transition-all ${
                          cell.dateNum === null
                            ? 'bg-slate-950/30 border-slate-850'
                            : isToday
                            ? 'bg-indigo-950/10'
                            : 'bg-slate-900/10'
                        } ${
                          isDraggedOver && cell.dateString
                            ? 'bg-indigo-600/10 border-indigo-500 border-2 shadow-inner' // 드롭 하이라이트 강조 효과
                            : ''
                        }`}
                        onDragOver={(e) => cell.dateString && handleDragOverCell(e, cell.dateString)}
                        onDragLeave={handleDragLeaveCell}
                        onDrop={(e) => cell.dateString && handleDropCell(e, cell.dateString)}
                      >
                        {/* 날짜 숫자 */}
                        {cell.dateNum && (
                          <div className="flex items-center justify-between select-none mb-1">
                            <span
                              className={`text-[11px] font-mono font-bold ${
                                isToday
                                  ? 'w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center shadow shadow-indigo-600/30'
                                  : idx === 0
                                  ? 'text-rose-500'
                                  : idx === 6
                                  ? 'text-indigo-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {cell.dateNum}
                            </span>
                            {isToday && (
                              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider hidden sm:inline">
                                TODAY
                              </span>
                            )}
                          </div>
                        )}
                        {/* 내부 하단 공간 */}
                        <div className="flex-1" />
                      </div>
                    );
                  })}
                </div>

                {/* 2) 전면 가로 일정 바 레이어 (3개까지 스크롤 없음, 4개 이상부터 주 단위 세로 스크롤) */}
                <div className="relative flex-1 pt-9 pb-2 px-1 pointer-events-none flex flex-col space-y-1.5 overflow-y-auto max-h-[140px] pr-0.5 z-10">
                  {weekRows.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[10px] text-slate-650 select-none">
                      등록된 일정이 없습니다
                    </div>
                  ) : (
                    weekRows.map((rowItems, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid grid-cols-7 gap-x-1 h-[22px] relative shrink-0"
                      >
                        {rowItems.map(({ item, startCol, endCol, span, isStart, isEnd }) => {
                          const showTitle = isStart || startCol === 0;

                          return (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item.id, item.type)}
                              onClick={(e) => handleItemClick(e, item.id, item.type)}
                              style={{
                                gridColumnStart: startCol + 1,
                                gridColumnEnd: endCol + 2,
                              }}
                              className={`pointer-events-auto h-[22px] px-2 py-1 text-[9px] font-semibold border flex items-center justify-between cursor-grab active:cursor-grabbing hover:scale-[1.01] hover:shadow-md transition-all duration-150 gap-1 ${
                                draggedItemId === item.id ? 'opacity-30' : ''
                              } ${
                                isStart ? 'rounded-l-md border-l' : 'rounded-l-none border-l-0'
                              } ${
                                isEnd ? 'rounded-r-md border-r' : 'rounded-r-none border-r-0'
                              } ${item.colorClass}`}
                              title={`${item.type === 'task' ? '[작업]' : '[할일]'} ${item.title} (${item.startDate} ~ ${item.dueDate})`}
                            >
                              <span className="truncate flex-1 leading-none text-left font-medium">
                                {showTitle ? item.title : ''}
                              </span>
                              
                              {showTitle && (
                                item.status === 'Done' ? (
                                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded scale-90 shrink-0 leading-none">완료</span>
                                ) : (
                                  <span className="text-[8px] opacity-60 scale-90 shrink-0 leading-none">
                                    {item.type === 'task' ? `T:${item.assigneeName ? item.assigneeName[0] : 'U'}` : `H:${item.assigneeName ? item.assigneeName[0] : 'U'}`}
                                  </span>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 달력 정보 팁 */}
      <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-lg flex items-center gap-2 text-[10px] text-slate-500 select-none shrink-0">
        <Info size={13} className="text-indigo-400" />
        <span>기간 일정 바를 마우스로 드래그앤드롭하면, 기간 길이를 유지한 채 시작일과 마감일이 함께 이동합니다.</span>
      </div>

      {/* 태스크 상세 모달 */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskId={selectedTaskId}
      />

      {/* Todo 상세 모달 */}
      <TodoModal
        isOpen={isTodoModalOpen}
        onClose={() => {
          setIsTodoModalOpen(false);
          setSelectedTodo(undefined);
        }}
        onSubmit={handleTodoSubmit}
        onDelete={handleTodoDelete}
        canDelete={selectedTodo ? selectedTodo.userId === currentUser?.id : false}
        todo={selectedTodo}
      />
    </div>
  );
}
