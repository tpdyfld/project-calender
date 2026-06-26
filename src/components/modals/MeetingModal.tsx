'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Save, FileText } from 'lucide-react';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MeetingModal({ isOpen, onClose }: MeetingModalProps) {
  const { members, addMeeting } = useProject();

  // 폼 입력 상태
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [discussion, setDiscussion] = useState('');
  const [decisions, setDecisions] = useState('');
  const [actionItems, setActionItems] = useState('');

  // 모달 열림 시 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      // 현재 로컬 시간 기준으로 날짜 포맷 (YYYY-MM-DD HH:MM)
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
      setDate(localISOTime.replace('T', ' '));
      setSelectedAttendees([]);
      setDiscussion('');
      setDecisions('');
      setActionItems('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 참석자 체크박스 제어
  const handleAttendeeToggle = (name: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      alert('회의 제목을 입력해 주세요.');
      return;
    }
    if (selectedAttendees.length === 0) {
      alert('최소 한 명 이상의 참석자를 선택해 주세요.');
      return;
    }

    addMeeting({
      title,
      date,
      attendees: selectedAttendees,
      discussion,
      decisions,
      actionItems,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-400" />
            <h3 className="font-bold text-white text-base">새 회의록 작성</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 폼 입력 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 회의 제목 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">회의 제목 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 4차 중간 점검 및 테스트 스케줄 논의"
              className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 회의 일시 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">회의 일시 *</label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY-MM-DD HH:MM"
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none"
              />
            </div>

            {/* 참석자 선택 (체크박스 목록) */}
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">참석 팀원 *</label>
              <div className="flex flex-wrap gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg max-h-[74px] overflow-y-auto">
                {members.map((member) => {
                  const isChecked = selectedAttendees.includes(member.name);
                  return (
                    <label
                      key={member.id}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs cursor-pointer select-none transition-colors border ${
                        isChecked
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAttendeeToggle(member.name)}
                        className="hidden"
                      />
                      <span>{member.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 논의 내용 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">논의 내용 (Discussion)</label>
            <textarea
              value={discussion}
              onChange={(e) => setDiscussion(e.target.value)}
              rows={3}
              placeholder="회의에서 주고받은 중요 이야기나 안건 분석 내용을 요약해 주세요."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          {/* 결정 사항 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">핵심 결정 사항 (Decisions)</label>
            <textarea
              value={decisions}
              onChange={(e) => setDecisions(e.target.value)}
              rows={2}
              placeholder="회의에서 최종 결정된 약속이나 합의 사항을 줄바꿈하여 작성합니다."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          {/* 액션 아이템 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">다음 작업 계획 (Action Items)</label>
            <textarea
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              rows={2}
              placeholder="각자 맡아서 진행해야 할 액션 아이템들을 나열해 주세요.&#13;예: 다인 - 상세 필터 버그 패치"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-600 transition-all resize-none"
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
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 rounded-lg transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Save size={14} />
              <span>회의록 생성</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
