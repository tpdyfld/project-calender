'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Bug } from '../../types';
import { X, Save, AlertTriangle } from 'lucide-react';

interface BugModalProps {
  isOpen: boolean;
  onClose: () => void;
  bugId?: string; // 전달될 경우 상세조회 및 수정 모드
}

export default function BugModal({ isOpen, onClose, bugId }: BugModalProps) {
  const { members, bugs, addBug, updateBug } = useProject();

  // 폼 입력 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporterId, setReporterId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [severity, setSeverity] = useState<Bug['severity']>('Major');
  const [status, setStatus] = useState<Bug['status']>('Open');
  const [reproduceSteps, setReproduceSteps] = useState('');
  const [relatedArea, setRelatedArea] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (bugId) {
        const targetBug = bugs.find((b) => b.id === bugId);
        if (targetBug) {
          setTitle(targetBug.title);
          setDescription(targetBug.description);
          setReporterId(targetBug.reporterId);
          setAssigneeId(targetBug.assigneeId);
          setSeverity(targetBug.severity);
          setStatus(targetBug.status);
          setReproduceSteps(targetBug.reproduceSteps);
          setRelatedArea(targetBug.relatedArea);
        }
      } else {
        // 생성 모드 초기값
        setTitle('');
        setDescription('');
        setReporterId(members[0]?.id || '');
        setAssigneeId(members[1]?.id || members[0]?.id || '');
        setSeverity('Major');
        setStatus('Open');
        setReproduceSteps('');
        setRelatedArea('');
      }
    }
  }, [isOpen, bugId, bugs, members]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      alert('버그 제목을 입력해 주세요.');
      return;
    }

    const bugData = {
      title,
      description,
      reporterId,
      assigneeId,
      severity,
      status,
      reproduceSteps,
      relatedArea,
    };

    if (bugId) {
      updateBug(bugId, bugData);
    } else {
      addBug(bugData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-bold text-white text-base">
              {bugId ? '버그 상세 정보 & 조치' : '신규 버그 리포트 등록'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 폼 입력 영역 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 버그 제목 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">버그 요약 (제목) *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 상태 변경 후 새로고침 시 초기화 현상"
              className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all"
            />
          </div>

          {/* 버그 현상 설명 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">버그 현상 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="어떤 에러 메시지가 뜨거나 비정상적인 결과가 발생했나요?"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-600 transition-all resize-none"
            />
          </div>

          {/* 발생 위치 & 영역 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">발생 영역/컴포넌트</label>
            <input
              type="text"
              value={relatedArea}
              onChange={(e) => setRelatedArea(e.target.value)}
              placeholder="예: 로그인 UI, 모바일 사이드바, API 라우터 등"
              className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 발견자 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">발견자 (제보자)</label>
              <select
                value={reporterId}
                onChange={(e) => setReporterId(e.target.value)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* 해결 담당자 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">조치 담당자</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* 심각도 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">심각도 (Severity)</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Bug['severity'])}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
              >
                <option value="Minor">Minor (낮음)</option>
                <option value="Major">Major (높음)</option>
                <option value="Critical">Critical (긴급/심각)</option>
              </select>
            </div>

            {/* 조치 상태 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">조치 상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Bug['status'])}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
              >
                <option value="Open">Open (신규/미해결)</option>
                <option value="In Progress">In Progress (조치 중)</option>
                <option value="Fixed">Fixed (수정 완료)</option>
                <option value="Closed">Closed (검증 완료/종료)</option>
              </select>
            </div>
          </div>

          {/* 재현 방법 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">버그 재현 방법 (Steps to Reproduce)</label>
            <textarea
              value={reproduceSteps}
              onChange={(e) => setReproduceSteps(e.target.value)}
              rows={3}
              placeholder="1. 모바일 뷰로 전환한다.&#13;2. 보드에서 태스크 카드 드롭다운을 클릭한다.&#13;3. 반응이 없거나 레이아웃이 밀리는 것을 확인한다."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-600 transition-all font-mono leading-relaxed"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex items-center justify-end border-t border-slate-800 pt-5 mt-4 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold h-9 px-4 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-semibold h-9 px-4 rounded-lg transition-colors shadow-md shadow-amber-600/10 cursor-pointer"
            >
              <Save size={14} />
              <span>{bugId ? '조치 정보 저장' : '버그 리포트 등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
