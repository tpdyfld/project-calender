'use client';

import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Calendar, ChevronDown, ChevronUp, FileText, CheckCircle2, Award, Users } from 'lucide-react';

export default function MeetingsView() {
  const { meetings, searchQuery } = useProject();

  // 특정 회의록 카드의 접힘/펼침 상태 관리 (ID 기준)
  const [expandedMeetings, setExpandedMeetings] = useState<Record<string, boolean>>({});

  const toggleExpand = (meetingId: string) => {
    setExpandedMeetings((prev) => ({
      ...prev,
      [meetingId]: !prev[meetingId],
    }));
  };

  // 검색 필터
  const filteredMeetings = meetings.filter((meeting) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = meeting.title.toLowerCase().includes(query);
      const matchDiscussion = meeting.discussion.toLowerCase().includes(query);
      const matchDecisions = meeting.decisions.toLowerCase().includes(query);
      if (!matchTitle && !matchDiscussion && !matchDecisions) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-4rem)] pb-8 pr-2">
      <div className="grid grid-cols-1 gap-4">
        {filteredMeetings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm font-medium">
            작성된 팀 회의록이 존재하지 않습니다.
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const isExpanded = !!expandedMeetings[meeting.id];

            return (
              <div
                key={meeting.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
              >
                {/* 회의록 헤더 영역 (클릭 시 접힘/펼침) */}
                <div
                  onClick={() => toggleExpand(meeting.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-950/20 transition-colors select-none"
                >
                  <div className="space-y-2 flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 font-bold bg-indigo-950/30 px-2.5 py-0.5 rounded border border-indigo-900/20">
                        <Calendar size={12} />
                        <span>{meeting.date}</span>
                      </div>
                      
                      {/* 참석자 아바타 뱃지들 */}
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Users size={12} className="text-slate-500" />
                        <span className="text-[10px] font-semibold uppercase text-slate-500 mr-1.5">참석자:</span>
                        <div className="flex items-center gap-1">
                          {meeting.attendees.map((attendee, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 bg-slate-950 border border-slate-800 rounded text-[10px] font-bold text-slate-300"
                            >
                              {attendee}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-wide">
                      {meeting.title}
                    </h4>
                  </div>

                  <div className="text-slate-400 hover:text-white transition-colors pl-2">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* 회의록 상세 본문 영역 (펼쳐질 때 슬라이드 렌더링) */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-850/80 bg-slate-950/20 space-y-5 text-xs text-slate-350 leading-relaxed select-text animate-in fade-in duration-200">
                    
                    {/* 1. 회의 논의 내용 */}
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                        <FileText size={12} className="text-indigo-400" />
                        회의 논의 내용 (Discussion)
                      </h5>
                      <p className="p-3.5 bg-slate-950 rounded-lg border border-slate-850 text-slate-300 font-medium whitespace-pre-line leading-relaxed">
                        {meeting.discussion}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 2. 핵심 결정 사항 */}
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          핵심 결정 사항 (Decisions)
                        </h5>
                        <div className="p-3.5 bg-emerald-950/5 rounded-lg border border-emerald-900/10 text-emerald-300 font-bold whitespace-pre-line leading-relaxed">
                          {meeting.decisions}
                        </div>
                      </div>

                      {/* 3. 다음 작업 계획 (Action Items) */}
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                          <Award size={12} className="text-indigo-400" />
                          수행할 액션 아이템 (Action Items)
                        </h5>
                        <div className="p-3.5 bg-indigo-950/5 rounded-lg border border-indigo-900/10 text-indigo-300 font-bold whitespace-pre-line leading-relaxed">
                          {meeting.actionItems}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
