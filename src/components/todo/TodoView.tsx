'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Todo, TodoCategory, TodoPriority } from '../../types/todo';
import { todoService } from '../../services/todoService';
import TodoModal from './TodoModal';
import {
  Plus,
  Check,
  Edit2,
  Trash2,
  GripVertical,
  Calendar,
  Layers,
  ChevronRight,
  User,
  Tag,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';

// YYYY-MM-DD 형식으로 오늘 날짜를 구하는 헬퍼 함수
function getTodayDateString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function TodoView() {
  const { currentUser, authMembers } = useAuth();
  const today = getTodayDateString();

  // 오늘 날짜 한글 렌더링용 변수
  const formattedToday = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // 상태 관리
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | undefined>(undefined);
  
  // 드래그앤드롭 상태
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Todo 로드
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = () => {
    // 오늘 날짜의 할 일을 로드
    const data = todoService.getTodos(today);
    setTodos(data);
  };

  // 할 일 생성 및 수정 제출 처리
  const handleModalSubmit = (data: {
    title: string;
    description: string;
    date: string;
    startDate: string;
    dueDate: string;
    priority: TodoPriority;
    category: TodoCategory;
  }) => {
    if (!currentUser) return;

    if (selectedTodo) {
      // 수정 모드
      todoService.updateTodo(selectedTodo.id, {
        title: data.title,
        description: data.description,
        date: data.date,
        startDate: data.startDate,
        dueDate: data.dueDate,
        priority: data.priority,
        category: data.category,
      });
    } else {
      // 신규 등록 모드 (userRole 필드 삽입)
      todoService.createTodo(
        data.title,
        data.description,
        currentUser.id,
        currentUser.name,
        currentUser.role || '팀원',
        data.date,
        data.priority,
        data.category,
        data.startDate,
        data.dueDate
      );
    }
    
    setIsModalOpen(false);
    setSelectedTodo(undefined);
    loadTodos();
  };

  // 삭제 처리
  const handleDelete = (id: string) => {
    if (confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
      todoService.deleteTodo(id);
      loadTodos();
    }
  };

  // 모달 내에서의 삭제 요청 핸들러
  const handleModalDelete = () => {
    if (selectedTodo) {
      todoService.deleteTodo(selectedTodo.id);
      setIsModalOpen(false);
      setSelectedTodo(undefined);
      loadTodos();
    }
  };

  // 수정 모달 팝업
  const handleEditClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  // 완료 여부 토글 핸들러
  const handleToggleComplete = (todo: Todo) => {
    todoService.updateTodo(todo.id, {
      isCompleted: !todo.isCompleted,
    });
    loadTodos();
  };

  // HTML5 Drag & Drop 드래그 시작
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  // HTML5 Drag & Drop 드래그 오버
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // HTML5 Drag & Drop 드롭 처리 (순서 갱신)
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    // 내 할 일 목록
    const myTodos = todos.filter((t) => t.userId === currentUser?.id);

    // 미완료 할 일들만 추출하여 드래그 순서를 변경합니다.
    const activeTodos = myTodos.filter((t) => !t.isCompleted);
    const dragIdx = activeTodos.findIndex((t) => t.id === draggedId);
    const targetIdx = activeTodos.findIndex((t) => t.id === targetId);

    if (dragIdx !== -1 && targetIdx !== -1) {
      const updatedActive = [...activeTodos];
      const [draggedItem] = updatedActive.splice(dragIdx, 1);
      updatedActive.splice(targetIdx, 0, draggedItem);

      // 완료된 항목은 맨 아래에 둔 채 결합
      const completedTodos = myTodos.filter((t) => t.isCompleted);
      const reordered = [...updatedActive, ...completedTodos];

      // 화면 즉시 반영 및 localStorage에 순서 인덱스 전향 저장
      setTodos((prev) => {
        const otherUsersTodos = prev.filter((t) => t.userId !== currentUser?.id);
        return [...otherUsersTodos, ...reordered];
      });
      todoService.saveTodos(reordered);
    }

    setDraggedId(null);
  };

  // 우선순위에 따른 Tailwind 스타일 클래스 반환
  const getPriorityStyle = (priority: TodoPriority) => {
    switch (priority) {
      case 'High':
        return 'text-rose-450 bg-rose-500/10 border-rose-500/20';
      case 'Medium':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  // 카테고리별 부드러운 색상 반환
  const getCategoryStyle = (category: TodoCategory) => {
    switch (category) {
      case '개발':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case '디자인':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case '회의':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case '버그수정':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case '테스트':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case '문서작업':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  // 내 할 일 목록 가공 (미완료 최상단, 완료 최하단)
  const myTodos = todos.filter((t) => t.userId === currentUser?.id);
  const myIncomplete = myTodos.filter((t) => !t.isCompleted);
  const myCompleted = myTodos.filter((t) => t.isCompleted);

  // Todo 카드를 렌더링하는 공용 컴포넌트 함수
  const renderTodoCard = (todo: Todo, isOwn: boolean) => {
    return (
      <div
        key={todo.id}
        draggable={isOwn && !todo.isCompleted}
        onDragStart={(e) => handleDragStart(e, todo.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, todo.id)}
        className={`p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3 transition-all relative ${
          todo.isCompleted ? 'opacity-50 border-slate-850' : 'hover:border-slate-700 hover:bg-slate-900/90'
        } ${draggedId === todo.id ? 'opacity-20 border-dashed border-indigo-650' : ''}`}
      >
        {/* 1) 드래그 핸들 (본인 소유이고 미완료 상태일 때만 노출) */}
        {isOwn && !todo.isCompleted && (
          <div className="text-slate-600 cursor-grab active:cursor-grabbing flex items-center shrink-0 self-stretch">
            <GripVertical size={14} />
          </div>
        )}

        {/* 2) 체크박스 및 본문 */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={todo.isCompleted}
              disabled={!isOwn}
              onChange={() => handleToggleComplete(todo)}
              className="w-4 h-4 mt-0.5 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-600 focus:ring-offset-slate-950 cursor-pointer accent-indigo-500 shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <h5 className={`text-xs font-bold leading-snug break-all ${
                todo.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
              }`}>
                {todo.title}
              </h5>
              {todo.description && (
                <p className={`text-[10px] leading-relaxed break-all whitespace-pre-wrap ${
                  todo.isCompleted ? 'text-slate-650 line-through' : 'text-slate-500'
                }`}>
                  {todo.description}
                </p>
              )}
            </div>
          </div>

          {/* 3) 배지 정보 리스트 */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${getCategoryStyle(todo.category)}`}>
              {todo.category}
            </span>
            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${getPriorityStyle(todo.priority)}`}>
              {todo.priority}
            </span>
            {/* 작성자 이름 및 역할(Role) 배지 */}
            <span className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-850 text-[8px] text-slate-550">
              <span className="font-semibold">{todo.userName}</span>
              <span className="text-[7px] text-slate-500">({todo.userRole || '팀원'})</span>
            </span>

            {/* 완료됨 라벨 */}
            {todo.isCompleted && (
              <span className="flex items-center gap-0.5 text-[8px] text-emerald-500 font-bold ml-auto">
                <Clock size={9} />
                <span>완료됨</span>
              </span>
            )}
          </div>
        </div>

        {/* 4) 수정 / 삭제 버튼 (본인 소유이고 읽기 전용이 아닐 때만 제공) */}
        {isOwn && (
          <div className="flex flex-col gap-1 justify-center shrink-0 border-l border-slate-800/80 pl-2.5 self-stretch">
            <button
              onClick={() => handleEditClick(todo)}
              className="p-1 text-slate-650 hover:text-indigo-400 hover:bg-slate-800/40 rounded transition-colors cursor-pointer"
              title="수정"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => handleDelete(todo.id)}
              className="p-1 text-slate-650 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
              title="삭제"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden select-none pr-1">
      {/* 1. 상단 타이틀 & 정보 영역 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold">
            <Calendar size={13} />
            <span>{formattedToday}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            오늘 할 일 <span className="text-xs text-slate-500 font-medium">({todos.length}건 등록됨)</span>
          </h2>
        </div>

        {/* 유저 이름 및 추가 버튼 영역 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-450">역할:</span>
            <strong className="text-white font-bold">{currentUser?.name} ({currentUser?.role || '팀원'})</strong>
          </div>

          <button
            onClick={() => {
              setSelectedTodo(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold h-10 px-4 rounded-xl transition-all shadow-md shadow-indigo-650/15 cursor-pointer hover:-translate-y-0.5"
          >
            <Plus size={15} />
            <span>새 할 일 추가</span>
          </button>
        </div>
      </div>

      {/* 2. 탭 제어 전환 바 */}
      <div className="flex border-b border-slate-800 shrink-0">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-6 py-3 text-xs font-bold tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'my'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          내 할 일 ({myTodos.length})
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-6 py-3 text-xs font-bold tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'team'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-550 hover:text-slate-350'
          }`}
        >
          팀 전체 할 일 ({todos.length})
        </button>
      </div>

      {/* 3. 리스트 본문 영역 */}
      <div className="flex-1 overflow-hidden">
        {/* A. 내 할 일 탭 (세로 목록 형태) */}
        {activeTab === 'my' && (
          <div className="h-full flex flex-col space-y-4 overflow-y-auto max-h-[calc(100vh-17.5rem)] pb-8 pr-1">
            {myTodos.length === 0 ? (
              <div className="h-48 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-slate-550 space-y-2">
                <CheckCircle size={30} className="text-slate-800" />
                <p className="text-xs">오늘 진행할 본인의 할 일이 등록되지 않았습니다.</p>
              </div>
            ) : (
              <div className="max-w-3xl space-y-6">
                {/* 진행 중인 할 일 리스트 (세로) */}
                {myIncomplete.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest px-1">진행 중 ({myIncomplete.length})</h4>
                    <div className="flex flex-col gap-2.5">
                      {myIncomplete.map((todo) => renderTodoCard(todo, true))}
                    </div>
                  </div>
                )}

                {/* 완료된 할 일 리스트 (세로, 아래로 배치) */}
                {myCompleted.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest px-1">완료됨 ({myCompleted.length})</h4>
                    <div className="flex flex-col gap-2.5">
                      {myCompleted.map((todo) => renderTodoCard(todo, true))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* B. 팀 전체 할 일 탭 (가로 컬럼으로 배치된 팀원별 보드 구조) */}
        {activeTab === 'team' && (
          <div className="h-full flex flex-row overflow-x-auto gap-6 pb-6 pr-1 items-start max-w-full">
            {authMembers.map((member) => {
              // 해당 팀원의 오늘 할 일 필터
              const memberTodos = todos.filter((t) => t.userId === member.id);
              // 진행 중 vs 완료 구분
              const memberIncomplete = memberTodos.filter((t) => !t.isCompleted);
              const memberCompleted = memberTodos.filter((t) => t.isCompleted);
              const isMe = member.id === currentUser?.id;

              return (
                <div
                  key={member.id}
                  className={`w-80 shrink-0 bg-slate-900/60 border rounded-2xl p-4 flex flex-col max-h-[calc(100vh-19rem)] shadow-sm ${
                    isMe ? 'border-indigo-600/40 bg-slate-900/90' : 'border-slate-800'
                  }`}
                >
                  {/* 컬럼 헤더: 팀원 프로필 정보 */}
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-3 shrink-0">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white font-bold shrink-0 ${member.avatarColor || 'bg-slate-700'}`}>
                      {member.name[0]}
                    </span>
                    <div className="overflow-hidden space-y-0.5">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="truncate">{member.name}</span>
                        {isMe && (
                          <span className="text-[8px] bg-indigo-950/80 border border-indigo-900/40 px-1 py-0.2 rounded text-indigo-400">나</span>
                        )}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-semibold truncate flex items-center gap-1">
                        <Briefcase size={10} className="text-slate-600" />
                        <span>{member.role || '팀원'}</span>
                      </p>
                    </div>
                    {/* 해당 팀원의 완료 수치 요약 */}
                    <span className="ml-auto text-[10px] font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                      {memberCompleted.length}/{memberTodos.length}
                    </span>
                  </div>

                  {/* 컬럼 내부 리스트 영역 (스크롤 가능) */}
                  <div className="flex-1 overflow-y-auto space-y-5 pr-1 max-h-full">
                    {memberTodos.length === 0 ? (
                      <div className="py-12 border border-dashed border-slate-850 rounded-xl flex flex-col items-center justify-center text-center text-slate-600 space-y-1 bg-slate-950/20">
                        <CheckCircle size={18} className="text-slate-800" />
                        <p className="text-[9px] font-semibold">등록된 일정이 없습니다.</p>
                      </div>
                    ) : (
                      <>
                        {/* 진행 중 리스트 */}
                        {memberIncomplete.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-[8px] font-bold text-slate-550 uppercase tracking-wider px-1">진행 중 ({memberIncomplete.length})</h5>
                            <div className="flex flex-col gap-2">
                              {memberIncomplete.map((todo) => renderTodoCard(todo, isMe))}
                            </div>
                          </div>
                        )}

                        {/* 완료됨 리스트 */}
                        {memberCompleted.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-[8px] font-bold text-slate-550 uppercase tracking-wider px-1">완료됨 ({memberCompleted.length})</h5>
                            <div className="flex flex-col gap-2">
                              {memberCompleted.map((todo) => renderTodoCard(todo, isMe))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. 등록 및 수정을 위한 팝업 모달 */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTodo(undefined);
        }}
        onSubmit={handleModalSubmit}
        onDelete={handleModalDelete}
        canDelete={selectedTodo ? selectedTodo.userId === currentUser?.id : false}
        todo={selectedTodo}
      />
    </div>
  );
}
