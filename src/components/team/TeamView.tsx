'use client';

import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { getMemberStats } from '../../utils/projectStats';
import { Mail, Briefcase, Award, CheckCircle2, Play } from 'lucide-react';

export default function TeamView() {
  const { members, tasks } = useProject();

  // 팀원별 상세 업무 통계 계산
  const memberStatsList = getMemberStats(members, tasks);

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] pb-8 pr-2">
      {/* 팀원 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memberStatsList.map((stat) => {
          // 팀원의 현재 진행 중인 최신 작업 찾기
          const activeTask = tasks.find(
            (task) =>
              task.assigneeId === stat.memberId &&
              (task.status === 'In Progress' || task.status === 'Code Review' || task.status === 'Testing')
          );

          return (
            <div
              key={stat.memberId}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-5"
            >
              {/* 팀원 기본 인적 사항 */}
              <div className="flex items-start gap-4">
                {/* 대형 서클 아바타 */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-slate-950/40 select-none ${stat.avatarColor}`}>
                  {stat.memberName[0]}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-wide">{stat.memberName}</h4>
                    <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.2 rounded-full uppercase">
                      {stat.role || '팀원'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <Mail size={12} className="text-slate-600" />
                    <span>{members.find((m) => m.id === stat.memberId)?.email}</span>
                  </div>
                </div>
              </div>

              {/* 통계 스탯 그리드 */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-850 text-center font-mono">
                <div>
                  <span className="block text-[9px] font-semibold text-slate-500 uppercase">할당량</span>
                  <span className="text-sm font-bold text-slate-300">{stat.assignedCount} 건</span>
                </div>
                <div>
                  <span className="block text-[9px] font-semibold text-slate-500 uppercase">진행 중</span>
                  <span className="text-sm font-bold text-sky-400">{stat.inProgressCount} 건</span>
                </div>
                <div>
                  <span className="block text-[9px] font-semibold text-slate-500 uppercase">완료됨</span>
                  <span className="text-sm font-bold text-emerald-400">{stat.completedCount} 건</span>
                </div>
              </div>

              {/* 완료도 진행 상태 바 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Award size={13} className="text-indigo-400" />
                    업무 달성 완료도
                  </span>
                  <span className="font-mono text-indigo-400">{stat.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stat.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 현재 집중하고 있는 태스크 노출 */}
              <div className="pt-3.5 border-t border-slate-850/80">
                <span className="block text-[9px] font-semibold text-slate-500 uppercase mb-2 tracking-wider">
                  현재 집중 작업 (Active Task)
                </span>
                {activeTask ? (
                  <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg flex items-start gap-2 animate-in fade-in duration-200">
                    <Play size={12} className="text-sky-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h5 className="text-[11px] font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1 leading-tight">
                        {activeTask.title}
                      </h5>
                      <span className="text-[9px] text-slate-500 font-medium">
                        마감일: {activeTask.dueDate} / 상태: {activeTask.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-950 border border-dashed border-slate-850 rounded-lg flex items-center gap-2 text-slate-600 text-[10px] font-medium">
                    <CheckCircle2 size={12} />
                    <span>현재 밀려있는 진행중인 작업이 없습니다.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
