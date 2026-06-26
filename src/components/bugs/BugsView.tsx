'use client';

import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Bug } from '../../types';
import { AlertTriangle, Bug as BugIcon, CheckCircle2, ChevronDown, ChevronUp, Eye, Filter, User } from 'lucide-react';
import BugModal from '../modals/BugModal';

export default function BugsView() {
  const { bugs, members, searchQuery } = useProject();

  // 버그 수정 모달 관련 상태
  const [selectedBugId, setSelectedBugId] = useState<string | undefined>(undefined);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  // 재현 경로 아코디언 상태 관리 (버그 ID별 토글 여부)
  const [expandedBugs, setExpandedBugs] = useState<Record<string, boolean>>({});

  // 필터 조건 상태
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const toggleExpand = (event: React.MouseEvent, bugId: string) => {
    event.stopPropagation(); // 카드 클릭 모달 팝업 방지
    setExpandedBugs((prev) => ({ ...prev, [bugId]: !prev[bugId] }));
  };

  const handleCardClick = (bugId: string) => {
    setSelectedBugId(bugId);
    setIsBugModalOpen(true);
  };

  // 심각도 뱃지 스타일
  const getSeverityStyle = (severity: Bug['severity']) => {
    switch (severity) {
      case 'Critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Major':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    }
  };

  // 버그 조치 상태 스타일
  const getStatusStyle = (status: Bug['status']) => {
    switch (status) {
      case 'Closed':
        return 'text-slate-400 bg-slate-800 border-slate-700/50';
      case 'Fixed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      default:
        return 'text-rose-500 bg-rose-500/10 border-rose-500/30 font-bold';
    }
  };

  // 필터 처리
  const filteredBugs = bugs.filter((bug) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = bug.title.toLowerCase().includes(query);
      const matchDesc = bug.description.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) return false;
    }

    if (severityFilter !== 'all' && bug.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && bug.status !== statusFilter) return false;
    if (assigneeFilter !== 'all' && bug.assigneeId !== assigneeFilter) return false;

    return true;
  });

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-4rem)] pb-8 pr-2">
      {/* 버그 세부 조건 필터 */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-350">
          <Filter size={14} className="text-amber-500" />
          <span>결함 검색 필터</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* 심각도 필터 */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded focus:outline-none"
          >
            <option value="all">심각도: 전체</option>
            <option value="Critical">Critical (긴급)</option>
            <option value="Major">Major (높음)</option>
            <option value="Minor">Minor (낮음)</option>
          </select>

          {/* 조치 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded focus:outline-none"
          >
            <option value="all">조치 상태: 전체</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Fixed">Fixed</option>
            <option value="Closed">Closed</option>
          </select>

          {/* 담당자 필터 */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded focus:outline-none"
          >
            <option value="all">담당자: 전체</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 버그 카드 목록 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBugs.length === 0 ? (
          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm font-medium">
            등록된 결함/이슈 티켓이 존재하지 않습니다.
          </div>
        ) : (
          filteredBugs.map((bug) => {
            const reporter = members.find((m) => m.id === bug.reporterId);
            const assignee = members.find((m) => m.id === bug.assigneeId);
            const isExpanded = !!expandedBugs[bug.id];

            return (
              <div
                key={bug.id}
                onClick={() => handleCardClick(bug.id)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative"
              >
                {/* 카드 상단 배지 */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityStyle(bug.severity)}`}>
                      {bug.severity}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusStyle(bug.status)}`}>
                      {bug.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{bug.relatedArea}</span>
                </div>

                {/* 제목 & 설명 */}
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                    {bug.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {bug.description}
                  </p>
                </div>

                {/* 재현 경로 아코디언 */}
                {bug.reproduceSteps && (
                  <div className="bg-slate-950 rounded-lg border border-slate-850 overflow-hidden">
                    <button
                      onClick={(e) => toggleExpand(e, bug.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye size={12} className="text-indigo-400" />
                        재현 경로 (Reproduce Steps)
                      </span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-850/50 text-[10px] text-slate-300 font-mono leading-relaxed whitespace-pre-line select-text">
                        {bug.reproduceSteps}
                      </div>
                    )}
                  </div>
                )}

                {/* 인원 정보 & 등록일 */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-850">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">제보:</span>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white font-bold ${reporter?.avatarColor || 'bg-slate-700'}`}>
                        {reporter?.name[0] || 'U'}
                      </span>
                      <span className="text-slate-400 font-medium">{reporter?.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">담당:</span>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white font-bold ${assignee?.avatarColor || 'bg-slate-700'}`}>
                        {assignee?.name[0] || 'U'}
                      </span>
                      <span className="text-slate-400 font-medium">{assignee?.name}</span>
                    </div>
                  </div>

                  <span>{bug.createdAt.split('T')[0]}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 버그 조치를 위한 상세 모달 */}
      <BugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        bugId={selectedBugId}
      />
    </div>
  );
}
