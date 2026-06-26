'use client';

import React, { useState, useEffect } from 'react';
import { Todo, TodoCategory, TodoPriority } from '../../types/todo';
import { X, Calendar, AlertCircle, Trash2 } from 'lucide-react';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    date: string;
    startDate: string;
    dueDate: string;
    priority: TodoPriority;
    category: TodoCategory;
  }) => void;
  onDelete?: () => void; // 삭제 처리 핸들러 추가
  canDelete?: boolean;   // 삭제 권한 여부 추가
  todo?: Todo; // 수정 모드일 때 전달
}

const CATEGORIES: TodoCategory[] = [
  '개발',
  '디자인',
  '회의',
  '버그수정',
  '테스트',
  '문서작업',
  '기타',
];

const PRIORITIES: TodoPriority[] = ['Low', 'Medium', 'High'];

// YYYY-MM-DD 형식으로 오늘 날짜를 구하는 헬퍼 함수
function getTodayDateString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function TodoModal({ isOpen, onClose, onSubmit, onDelete, canDelete, todo }: TodoModalProps) {
  // 입력 필드 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('Medium');
  const [category, setCategory] = useState<TodoCategory>('개발');
  const [error, setError] = useState<string | null>(null);

  // 모달이 열리거나 수정 대상 todo가 바뀔 때 상태 초기화
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setDate(todo.date);
      setStartDate(todo.startDate || todo.date);
      setDueDate(todo.dueDate || todo.date);
      setPriority(todo.priority);
      setCategory(todo.category);
    } else {
      setTitle('');
      setDescription('');
      setDate(getTodayDateString());
      setStartDate(getTodayDateString());
      setDueDate(getTodayDateString());
      setPriority('Medium');
      setCategory('개발');
    }
    setError(null);
  }, [todo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('할 일 제목을 입력해주세요.');
      return;
    }
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      setError('마감일은 시작일보다 빠를 수 없습니다.');
      return;
    }
    setError(null);
    onSubmit({ title, description, date, startDate, dueDate, priority, category });
  };

  const handleDeleteClick = () => {
    if (onDelete && confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 반투명 오버레이 백드롭 */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
      />

      {/* 모달 본체 */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 상단 헤더 */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
          <h3 className="text-base font-bold text-white">
            {todo ? '오늘 할 일 수정' : '새 할 일 추가'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 폼 영역 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 제목 */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">할 일 제목</label>
            <input
              type="text"
              placeholder="예: 오늘 로그인 기능 마무리하기"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 rounded-lg placeholder-slate-650 outline-none transition-colors"
            />
          </div>

          {/* 기간 날짜 입력 (시작일 / 마감일) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">시작일</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Calendar size={14} className="text-slate-550" />
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDate(e.target.value); // 기존 호환성을 위해 date도 같이 맞춰줌
                  }}
                  className="w-full h-10 pl-10 pr-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 rounded-lg outline-none transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">마감일</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Calendar size={14} className="text-slate-550" />
                </span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 rounded-lg outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 카테고리 & 우선순위 2열 배치 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 카테고리 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TodoCategory)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-xs text-slate-350 focus:border-indigo-500 rounded-lg outline-none transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 우선순위 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">우선순위</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TodoPriority)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-xs text-slate-350 focus:border-indigo-500 rounded-lg outline-none transition-colors"
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 설명 (메모) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">설명 및 메모</label>
            <textarea
              rows={4}
              placeholder="구체적인 진행 단계나 참고할 만한 메모를 작성하세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 rounded-lg placeholder-slate-650 outline-none resize-none transition-colors"
            />
          </div>

          {/* 하단 액션 버튼 */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <div>
              {todo && canDelete && onDelete && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="flex items-center gap-1.5 px-4 h-10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>삭제하기</span>
                </button>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="h-10 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-650/10"
              >
                {todo ? '저장하기' : '등록하기'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
