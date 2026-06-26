// DevFlow Manager 공통 TypeScript 타입 정의

// 1. 프로젝트 정보 타입 (Project)
export interface Project {
  id: string; // 프로젝트 고유 식별자
  name: string; // 프로젝트 이름
  description: string; // 프로젝트 상세 설명
  startDate: string; // 시작 날짜 (YYYY-MM-DD)
  dueDate: string; // 마감 날짜 (YYYY-MM-DD)
  techStack: string[]; // 사용 기술 스택 목록
  phase: 'Planning' | 'Design' | 'Development' | 'Testing' | 'Deployment' | 'Completed'; // 현재 프로젝트 진행 단계
  createdAt: string; // 생성일
  updatedAt: string; // 수정일
}

// 2. 팀원 정보 타입 (Member)
export interface Member {
  id: string; // 팀원 고유 식별자
  name: string; // 팀원 이름
  role: string; // 담당 역할 (팀장, Frontend, Backend, Designer, DB, Server, QA, Fullstack, PM, 팀원 등)
  email: string; // 이메일 주소
  avatarColor: string; // UI 아바타 배경색으로 사용할 Tailwind 색상 클래스 (예: 'bg-indigo-600')
  createdAt: string; // 등록일
}

// 3. 작업 정보 타입 (Task) - 칸반 보드 카드 및 테이블용
export interface Task {
  id: string; // 작업 고유 식별자
  projectId: string; // 소속 프로젝트 식별자
  title: string; // 작업 제목
  description: string; // 작업 상세 설명
  assigneeId: string; // 담당 팀원 식별자 (Member.id)
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Code Review' | 'Testing' | 'Done'; // 현재 작업 진행 상태
  priority: 'Low' | 'Medium' | 'High' | 'Critical'; // 우선순위
  category: 'Planning' | 'UI' | 'Frontend' | 'Backend' | 'Database' | 'API' | 'Test' | 'Deploy'; // 관련 기능 영역(카테고리)
  startDate: string; // 시작일 (YYYY-MM-DD)
  dueDate: string; // 마감일 (YYYY-MM-DD)
  progress: number; // 진행률 (0 ~ 100)
  hasBlocker: boolean; // 블로커(진행 장애 요인) 존재 여부
  blockerText?: string; // 블로커 내용 설명
  memo?: string; // 추가 메모 및 참고사항
  createdAt: string; // 생성일
  updatedAt: string; // 수정일
  order?: number;     // 작업 목록 드래그 순서
  riskOrder?: number; // 대시보드 마감 위험 목록 드래그 순서
}

// 4. 버그/이슈 정보 타입 (Bug)
export interface Bug {
  id: string; // 버그 고유 식별자
  projectId: string; // 소속 프로젝트 식별자
  title: string; // 버그 제목
  description: string; // 버그 현상 상세 설명
  reporterId: string; // 발견자 팀원 식별자 (Member.id)
  assigneeId: string; // 해결 담당 팀원 식별자 (Member.id)
  severity: 'Minor' | 'Major' | 'Critical'; // 버그 심각도
  status: 'Open' | 'In Progress' | 'Fixed' | 'Closed'; // 버그 조치 상태
  reproduceSteps: string; // 재현 경로 및 방법
  relatedArea: string; // 발생 화면 또는 관련 기능명
  createdAt: string; // 등록일
  resolvedAt?: string; // 해결 완료일
}

// 5. 회의록 정보 타입 (Meeting)
export interface Meeting {
  id: string; // 회의록 고유 식별자
  projectId: string; // 소속 프로젝트 식별자
  title: string; // 회의 주제/제목
  date: string; // 회의 날짜 및 시간 (YYYY-MM-DD HH:MM)
  attendees: string[]; // 참석자 이름 목록
  discussion: string; // 논의 세부 사항
  decisions: string; // 핵심 결정 사항
  actionItems: string; // 다음 수행할 액션 아이템 목록 (텍스트 서술)
  createdAt: string; // 작성일
}
