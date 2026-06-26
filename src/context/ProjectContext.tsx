'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Member, Task, Bug, Meeting } from '../types';
import { useAuth } from './AuthContext';
import {
  initialProject,
  initialTasks,
  initialBugs,
  initialMeetings,
} from '../data/mockData';

// Context에서 제공하는 상태 및 제어 함수들의 타입 정의
interface ProjectContextType {
  project: Project;
  members: Member[];
  tasks: Task[];
  bugs: Bug[];
  meetings: Meeting[];
  activeTab: string; // 현재 활성화된 화면 (dashboard, todo, tasks, calendar, bugs, meetings, team)
  searchQuery: string; // 상단 검색창 텍스트
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  
  // 프로젝트 관리
  updateProject: (updatedProject: Partial<Project>) => void;
  
  // 작업(태스크) CRUD
  addTask: (task: Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, taskUpdates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  
  // 버그 관리
  addBug: (bug: Omit<Bug, 'id' | 'projectId' | 'createdAt'>) => void;
  updateBug: (bugId: string, bugUpdates: Partial<Bug>) => void;
  
  // 회의록 관리
  addMeeting: (meeting: Omit<Meeting, 'id' | 'projectId' | 'createdAt'>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { authMembers } = useAuth();
  
  // 초기 로딩 전 기본 Fallback용 모의 데이터 기본 설정
  const [project, setProject] = useState<Project>(initialProject);
  const [members, setMembers] = useState<Member[]>(authMembers);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [bugs, setBugs] = useState<Bug[]>(initialBugs);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);

  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 1. 애플리케이션 로드 시 Next.js API Routes로부터 DB 데이터 비동기 조회
  useEffect(() => {
    async function loadDatabaseData() {
      try {
        // 병렬 fetch를 수행하여 로딩 지연을 최소화합니다.
        const [resProj, resMemb, resTasks, resBugs, resMeets] = await Promise.all([
          fetch('/api/project'),
          fetch('/api/members'),
          fetch('/api/tasks'),
          fetch('/api/bugs'),
          fetch('/api/meetings'),
        ]);

        if (resProj.ok) setProject(await resProj.json());
        if (resMemb.ok) setMembers(await resMemb.json());
        if (resTasks.ok) setTasks(await resTasks.json());
        if (resBugs.ok) setBugs(await resBugs.json());
        if (resMeets.ok) setMeetings(await resMeets.json());
      } catch (error) {
        console.warn('Neon DB API 연동이 설정되지 않았거나 조치 중입니다. (로컬 스토리지 또는 더미 모의 데이터로 구동합니다.)', error);
        
        // 네트워크 에러 시 임시로 기존 localStorage 데이터 복원 지원 (하이브리드 백업 구조)
        const savedProject = localStorage.getItem('devflow_project');
        const savedMembers = localStorage.getItem('devflow_members');
        const savedTasks = localStorage.getItem('devflow_tasks');
        const savedBugs = localStorage.getItem('devflow_bugs');
        const savedMeetings = localStorage.getItem('devflow_meetings');

        if (savedProject) setProject(JSON.parse(savedProject));
        if (savedMembers) setMembers(JSON.parse(savedMembers));
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedBugs) setBugs(JSON.parse(savedBugs));
        if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
      } finally {
        setIsLoaded(true);
      }
    }

    loadDatabaseData();

    // 활성 탭 복원
    const savedTab = localStorage.getItem('devflow_active_tab');
    if (savedTab) setActiveTabState(savedTab);
  }, []);

  // 가입 회원 목록(authMembers) 변경 시 멤버 명단 상태 갱신
  useEffect(() => {
    if (authMembers && authMembers.length > 0) {
      setMembers(authMembers);
    }
  }, [authMembers]);

  // 활성 탭 전환
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('devflow_active_tab', tab);
    }
  };

  // 2. 프로젝트 기본 정보 수정 (API PUT / PATCH)
  const updateProject = async (updatedFields: Partial<Project>) => {
    const updated = {
      ...project,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };

    // 선반영 (Optimistic UI)
    setProject(updated);

    try {
      await fetch('/api/project', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      localStorage.setItem('devflow_project', JSON.stringify(updated));
    } catch (e) {
      console.error('프로젝트 백엔드 업데이트 실패:', e);
    }
  };

  // 3. 작업(태스크) 추가 (API POST)
  const addTask = async (newTaskFields: Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    const payload = {
      ...newTaskFields,
      projectId: project.id,
    };

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdTask = await res.json();
        setTasks((prev) => {
          const updated = [createdTask, ...prev];
          if (typeof window !== 'undefined') {
            localStorage.setItem('devflow_tasks', JSON.stringify(updated));
          }
          return updated;
        });
      } else {
        throw new Error('API 등록 실패');
      }
    } catch (e) {
      console.error('태스크 추가 API 실패 (로컬 가상 생성):', e);
      // 오프라인/테스트용 임시 fallback 생성
      const tempTask: Task = {
        ...payload,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => {
        const updated = [tempTask, ...prev];
        if (typeof window !== 'undefined') {
          localStorage.setItem('devflow_tasks', JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  // 4. 작업(태스크) 수정 (API PATCH)
  const updateTask = async (taskId: string, updatedFields: Partial<Task>) => {
    // 선반영 (Optimistic UI) 및 로컬스토리지 백업
    setTasks((prev) => {
      const updated = prev.map((task) =>
        task.id === taskId
          ? { ...task, ...updatedFields, updatedAt: new Date().toISOString() }
          : task
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('devflow_tasks', JSON.stringify(updated));
      }
      return updated;
    });

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {
      console.error('태스크 수정 API 실패:', e);
    }
  };

  // 5. 작업(태스크) 삭제 (API DELETE)
  const deleteTask = async (taskId: string) => {
    // 선반영 (Optimistic UI) 및 로컬스토리지 백업
    setTasks((prev) => {
      const updated = prev.filter((task) => task.id !== taskId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('devflow_tasks', JSON.stringify(updated));
      }
      return updated;
    });

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('태스크 삭제 API 실패:', e);
    }
  };

  // 6. 버그 추가 (API POST)
  const addBug = async (newBugFields: Omit<Bug, 'id' | 'projectId' | 'createdAt'>) => {
    const payload = {
      ...newBugFields,
      projectId: project.id,
    };

    try {
      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdBug = await res.json();
        setBugs((prev) => [createdBug, ...prev]);
      } else {
        throw new Error('API 등록 실패');
      }
    } catch (e) {
      console.error('버그 추가 API 실패 (로컬 가상 생성):', e);
      const tempBug: Bug = {
        ...payload,
        id: `bug-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setBugs((prev) => [tempBug, ...prev]);
    }
  };

  // 7. 버그 수정 (API PATCH)
  const updateBug = async (bugId: string, updatedFields: Partial<Bug>) => {
    const isResolving = updatedFields.status === 'Fixed' || updatedFields.status === 'Closed';
    const payload = {
      ...updatedFields,
      resolvedAt: isResolving ? new Date().toISOString() : undefined,
    };

    // 선반영 (Optimistic UI)
    setBugs((prev) =>
      prev.map((bug) =>
        bug.id === bugId
          ? {
              ...bug,
              ...payload,
              resolvedAt: isResolving ? new Date().toISOString() : bug.resolvedAt,
            }
          : bug
      )
    );

    try {
      await fetch(`/api/bugs/${bugId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error('버그 수정 API 실패:', e);
    }
  };

  // 8. 회의록 추가 (API POST)
  const addMeeting = async (newMeetingFields: Omit<Meeting, 'id' | 'projectId' | 'createdAt'>) => {
    const payload = {
      ...newMeetingFields,
      projectId: project.id,
    };

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdMeeting = await res.json();
        setMeetings((prev) => [createdMeeting, ...prev]);
      } else {
        throw new Error('API 등록 실패');
      }
    } catch (e) {
      console.error('회의록 추가 API 실패 (로컬 가상 생성):', e);
      const tempMeeting: Meeting = {
        ...payload,
        id: `meeting-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setMeetings((prev) => [tempMeeting, ...prev]);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        members,
        tasks,
        bugs,
        meetings,
        activeTab,
        searchQuery,
        setActiveTab,
        setSearchQuery,
        updateProject,
        addTask,
        updateTask,
        deleteTask,
        addBug,
        updateBug,
        addMeeting,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject는 ProjectProvider 하위에서만 사용할 수 있습니다.');
  }
  return context;
}
