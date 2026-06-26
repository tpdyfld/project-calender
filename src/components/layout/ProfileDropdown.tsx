'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Mail, Shield, Users, ChevronDown } from 'lucide-react';

export default function ProfileDropdown() {
  const { currentUser, authMembers, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 팝오버 바깥쪽 영역 클릭 감지 및 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 1. 상단 아바타 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 h-9 pl-2 pr-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer select-none"
      >
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0 ${currentUser.avatarColor || 'bg-indigo-650'}`}>
          {currentUser.name ? currentUser.name[0] : 'U'}
        </span>
        <span className="max-w-[70px] truncate">{currentUser.name}</span>
        <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 2. 우측 정렬 팝오버 창 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 내 정보 영역 */}
          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-start gap-3">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm text-white font-bold shadow-md shadow-slate-950/40 ${currentUser.avatarColor || 'bg-indigo-650'}`}>
              {currentUser.name ? currentUser.name[0] : 'U'}
            </span>
            <div className="space-y-0.5 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
                <span className="text-[8px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-900/30 px-1.5 py-0.2 rounded">
                  {currentUser.role || '팀원'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <Mail size={9} />
                <span>{currentUser.email}</span>
              </p>
            </div>
          </div>

          {/* 가입된 팀원 목록 */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Users size={12} className="text-indigo-500" />
              <span>현재 접속 가능한 팀원 ({authMembers.length})</span>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {authMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between text-xs py-1.5 px-2 bg-slate-950/20 rounded border border-slate-850">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0 ${member.avatarColor || 'bg-slate-700'}`}>
                      {member.name[0]}
                    </span>
                    <span className="font-semibold text-slate-300 truncate">{member.name}</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 border border-slate-800 px-1.5 py-0.2 rounded shrink-0">
                    {member.role || '팀원'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full h-8 flex items-center justify-center gap-1.5 bg-slate-850 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg border border-slate-800 hover:border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
