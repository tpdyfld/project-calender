'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, AlertCircle, ArrowRight, Briefcase } from 'lucide-react';

export default function AuthView() {
  const { login, signup } = useAuth();
  
  // 'login' | 'signup' 탭 상태
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // 폼 입력값 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Fullstack'); // 회원가입 시 역할 필드 상태 추가
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // 오류 및 로딩 상태
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 입력값 검증 및 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        if (!email.trim() || !password) {
          throw new Error('이메일과 비밀번호를 모두 입력해주세요.');
        }
        await login(email, password);
      } else {
        if (!name.trim()) throw new Error('이름을 입력해주세요.');
        if (!email.trim()) throw new Error('이메일을 입력해주세요.');
        if (!role.trim()) throw new Error('역할을 선택해주세요.');
        if (password.length < 6) throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
        if (password !== passwordConfirm) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        await signup(name, email, password, role);
      }
    } catch (err: any) {
      setErrorMessage(err.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 탭 전환 시 입력 폼 초기화 헬퍼
  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setPassword('');
    setPasswordConfirm('');
    setRole('Fullstack');
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden select-none">
      {/* 백그라운드 디자인 그라데이션 광원 */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full bg-sky-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* 상단 로고 & 타이틀 */}
        <div className="p-8 text-center border-b border-slate-800/60 bg-slate-950/30">
          <div className="inline-flex w-12 h-12 rounded-xl bg-indigo-600 items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-600/30 mb-4">
            DF
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">DevFlow Manager</h1>
          <p className="text-xs text-slate-500 mt-1.5">IT 개발 팀 프로젝트 관리 플랫폼</p>
        </div>

        {/* 로그인 / 회원가입 전환 탭 */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/20">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-3.5 text-xs font-bold tracking-wider uppercase transition-all border-b-2 cursor-pointer ${
              activeTab === 'login'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/40'
                : 'border-transparent text-slate-550 hover:text-slate-350'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={`flex-1 py-3.5 text-xs font-bold tracking-wider uppercase transition-all border-b-2 cursor-pointer ${
              activeTab === 'signup'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/40'
                : 'border-transparent text-slate-550 hover:text-slate-350'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 폼 영역 */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'signup' && (
            <>
              {/* 이름 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">이름</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <User size={15} className="text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* 역할(Role) 선택 필드 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">역할</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Briefcase size={15} className="text-slate-500" />
                  </span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-350 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none"
                  >
                    <option value="팀장">팀장</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="DB">DB</option>
                    <option value="Server">Server</option>
                    <option value="Designer">Designer</option>
                    <option value="QA">QA</option>
                    <option value="Fullstack">Fullstack</option>
                  </select>
                  {/* 화살표 장식 */}
                  <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 text-xs">▼</span>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">이메일 주소</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Mail size={15} className="text-slate-500" />
              </span>
              <input
                type="email"
                placeholder="example@devflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">비밀번호</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Lock size={15} className="text-slate-500" />
              </span>
              <input
                type="password"
                placeholder={activeTab === 'signup' ? '최소 6자 이상' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {activeTab === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">비밀번호 확인</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock size={15} className="text-slate-500" />
                </span>
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800/40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-650/10 transition-all hover:-translate-y-0.5"
          >
            {isLoading ? (
              <span>로딩 중...</span>
            ) : (
              <>
                <span>{activeTab === 'login' ? '로그인' : '회원가입 및 시작'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
