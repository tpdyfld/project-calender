'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types/auth';
import { Member } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: AuthUser | null;
  authMembers: Member[];
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string, role: string) => Promise<AuthUser>;
  logout: () => void;
  refreshMembers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authMembers, setAuthMembers] = useState<Member[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // 로컬스토리지로부터 세션 및 멤버 명단 동기화
  useEffect(() => {
    function initAuth() {
      try {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        
        // 가입 회원 목록을 Member 규격으로 가져오기
        const members = authService.getMembers();
        setAuthMembers(members);
      } catch (e) {
        console.error('인증 상태 복원 실패:', e);
      } finally {
        setIsAuthLoading(false);
      }
    }
    initAuth();
  }, []);

  // 수동 멤버 갱신 유틸리티 (회원가입 등 발생 시 명단 리프레시 목적)
  const refreshMembers = () => {
    setAuthMembers(authService.getMembers());
  };

  // 로그인 핸들러
  const login = async (email: string, password: string): Promise<AuthUser> => {
    try {
      const user = authService.login(email, password);
      setCurrentUser(user);
      refreshMembers(); // 로그인 후 멤버 명단 갱신
      return user;
    } catch (error: any) {
      throw new Error(error.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  // 회원가입 핸들러
  const signup = async (name: string, email: string, password: string, role: string): Promise<AuthUser> => {
    try {
      const newUser = authService.register(name, email, password, role);
      // 회원가입 성공 시 사용성 향상을 위해 즉시 로그인 수행
      const user = authService.login(email, password);
      setCurrentUser(user);
      refreshMembers();
      return user;
    } catch (error: any) {
      throw new Error(error.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  // 로그아웃 핸들러
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authMembers,
        isAuthLoading,
        login,
        signup,
        logout,
        refreshMembers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 하위에서만 사용할 수 있습니다.');
  }
  return context;
}
