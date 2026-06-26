'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task } from '../../types';
import { X, AlertOctagon, Info, Save } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string; // 전달될 경우 수정 모드, 없으면 신규 생성 모드
}

export default function TaskModal({ isOpen, onClose, taskId }: TaskModalProps) {
  const { members, tasks, addTask, updateTask, deleteTask } = useProject();

  // 폼 내부 입력 필드 상태 관리
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [status, setStatus] = useState<Task['status']>('Todo');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [category, setCategory] = useState<Task['category']>('Frontend');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [hasBlocker, setHasBlocker] = useState(false);
  const [blockerText, setBlockerText] = useState('');
  const [memo, setMemo] = useState('');

  // 수정 대상 태스크가 변경되거나 모달이 열릴 때 초기화 로직
  useEffect(() => {
    if (isOpen) {
      if (taskId) {
        const targetTask = tasks.find((t) => t.id === taskId);
        if (targetTask) {
          setTitle(targetTask.title);
          setDescription(targetTask.description);
          setAssigneeId(targetTask.assigneeId);
          setStatus(targetTask.status);
          setPriority(targetTask.priority);
          setCategory(targetTask.category);
          setStartDate(targetTask.startDate);
          setDueDate(targetTask.dueDate);
          setProgress(targetTask.progress);
          setHasBlocker(targetTask.hasBlocker);
          setBlockerText(targetTask.blockerText || '');
          setMemo(targetTask.memo || '');
        }
      } else {
        // 생성 모드 초기값
        setTitle('');
        setDescription('');
        setAssigneeId(members[0]?.id || '');
        setStatus('Todo');
        setPriority('Medium');
        setCategory('Frontend');
        setStartDate(new Date().toISOString().split('T')[0]);
        setDueDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 5일 뒤 기본 마감
        setProgress(0);
        setHasBlocker(false);
        setBlockerText('');
        setMemo('');
      }
    }
  }, [isOpen, taskId, tasks, members]);

  if (!isOpen) return null;

  // 폼 전송 이벤트 핸들러
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      alert('작업 제목을 입력해 주세요.');
      return;
    }

    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      alert('마감 날짜는 시작 날짜보다 빠를 수 없습니다.');
      return;
    }

    const taskData = {
      title,
      description,
      assigneeId,
      status,
      priority,
      category,
      startDate,
      dueDate,
      progress: Number(progress),
      hasBlocker,
      blockerText: hasBlocker ? blockerText : '',
      memo,
    };

    if (taskId) {
      updateTask(taskId, taskData);
    } else {
      addTask(taskData);
    }
    onClose();
  };

  // 진행 상태 수동 변경 시 진행률 상호 조절
  const handleStatusChange = (newStatus: Task['status']) => {
    setStatus(newStatus);
    if (newStatus === 'Done') {
      setProgress(100);
    } else if (progress === 100) {
      setProgress(90); // 완료가 아니면 진행률을 90%로 조율
    }
  };

  // 진행률 슬라이더 조절 시 상태 상호 조절
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    if (newProgress === 100) {
      setStatus('Done');
    } else if (status === 'Done' && newProgress < 100) {
      setStatus('In Progress'); // Done 상태에서 진행률을 낮추면 In Progress로 복귀
    }
  };

  // 태스크 삭제 처리
  const handleDelete = () => {
    if (taskId && confirm('정말로 이 작업을 삭제하시겠습니까?')) {
      deleteTask(taskId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <h3 className="font-bold text-white text-base">
            {taskId ? '작업 상세 정보 & 수정' : '새 프로젝트 작업 생성'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 폼 및 본문 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 제목 */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">작업 제목 *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="어떤 업무를 진행하나요?"
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              />
            </div>

            {/* 설명 */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">작업 상세 내용</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="업무 내용, 개발 요건 등을 설명해 주세요."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-none"
              />
            </div>

            {/* 담당자 배정 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">담당 팀원</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-600"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            {/* 기능 영역 (카테고리) */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">기능 영역</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Task['category'])}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-600"
              >
                <option value="Planning">기획 (Planning)</option>
                <option value="UI">디자인/UI</option>
                <option value="Frontend">Frontend 개발</option>
                <option value="Backend">Backend 개발</option>
                <option value="Database">데이터베이스</option>
                <option value="API">API 연동</option>
                <option value="Test">테스트/QA</option>
                <option value="Deploy">배포/DevOps</option>
              </select>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">진행 상태</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-600"
              >
                <option value="Backlog">Backlog (대기 작업)</option>
                <option value="Todo">Todo (계획된 작업)</option>
                <option value="In Progress">In Progress (진행 중)</option>
                <option value="Code Review">Code Review (코드 리뷰)</option>
                <option value="Testing">Testing (QA 검증 중)</option>
                <option value="Done">Done (완료)</option>
              </select>
            </div>

            {/* 우선순위 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">우선순위</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-600"
              >
                <option value="Low">Low (낮음)</option>
                <option value="Medium">Medium (보통)</option>
                <option value="High">High (높음)</option>
                <option value="Critical">Critical (긴급)</option>
              </select>
            </div>

            {/* 시작일 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">시작 날짜</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* 마감일 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">마감 날짜</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* 진행률 Slider */}
            <div className="col-span-1 md:col-span-2 bg-slate-950/40 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400">작업 세부 진행률</label>
                <span className="text-xs font-mono font-bold text-indigo-400">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => handleProgressChange(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 블로커(Blocker) 설정 */}
            <div className="col-span-1 md:col-span-2 bg-slate-950/40 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon size={16} className={hasBlocker ? 'text-rose-500' : 'text-slate-500'} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">작업 블로커 (Blocker) 설정</h4>
                    <p className="text-[10px] text-slate-500">다른 작업 때문에 일에 차질이 생겼거나 막힌 점이 있나요?</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasBlocker}
                  onChange={(e) => setHasBlocker(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-600"
                />
              </div>

              {hasBlocker && (
                <div className="animate-in slide-in-from-top-1 duration-150">
                  <label className="block text-[10px] font-semibold text-rose-400 mb-1">
                    블로커 사유를 적어주세요. (팀원에게 바로 경고 표시됨)
                  </label>
                  <input
                    type="text"
                    required={hasBlocker}
                    value={blockerText}
                    onChange={(e) => setBlockerText(e.target.value)}
                    placeholder="예: 서버 DB 마이그레이션 지연으로 프론트엔드 API 테스트 불가"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-lg text-xs text-rose-300 placeholder-slate-600"
                  />
                </div>
              )}
            </div>

            {/* 추가 메모 */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mb-1.5">
                <Info size={14} className="text-slate-500" />
                <span>참고 메모</span>
              </div>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="비고, 관련 PR 링크 등을 작성해 주세요."
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* 모달 하단 버튼 */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-5 mt-4">
            <div>
              {taskId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 text-xs font-semibold h-9 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  작업 삭제
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold h-9 px-4 rounded-lg transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 rounded-lg transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Save size={14} />
                <span>{taskId ? '변경사항 저장' : '작업 만들기'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
