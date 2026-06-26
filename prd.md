# 제품 요구사항 정의서 (PRD) - DevFlow Manager

## 1. 프로젝트 개요
* **서비스명:** DevFlow Manager
* **한 줄 설명:** IT 개발 팀 프로젝트의 업무 진행 상황, 이슈, 코드 리뷰, 회의 기록, 마감 위험도를 통합 관리하는 대시보드 웹 서비스
* **목표:** 팀원 간 업무 투명성 확보, 지연 작업 및 Blocker(장애 요인) 신속 감지, 회의록 및 버그/이슈의 유기적 관리를 통한 프로젝트 마감 위험도 최소화
* **주요 사용자:** 대학생 캡스톤 디자인 팀, 사이드 프로젝트 팀, 포트폴리오 준비용 개발 팀

---

## 2. 핵심 컨셉 & 워크플로우
개발 팀 프로젝트의 실제 협업 흐름에 맞춘 칸반 및 대시보드 중심의 관리 도구입니다.

1. **프로젝트 관리:** 프로젝트 기본 정보(기간, 기술 스택, 현재 단계) 설정
2. **팀원 역할 정의:** 역할군(PM, FE, BE, QA 등) 정의 및 개인별 담당/완료 업무 연동
3. **칸반 기반 상태 관리:** 6단계 상태 흐름(`Backlog` -> `Todo` -> `In Progress` -> `Code Review` -> `Testing` -> `Done`)
4. **블로커(Blocker) 추적:** 업무 진행 시 막히는 부분을 기록하여 팀원에게 빠른 도움 요청
5. **버그 리포팅:** 개발/테스트 중 발견된 버그 등록 및 조치 상태 파악
6. **회의록 작성:** 논의 사항과 핵심 결정 사항 기록
7. **마감 위험도 산출:** 마감 직전 지연 작업이나 블로커가 있는 작업을 감지하여 대시보드에 시각화

---

## 3. 기능 요구사항 (MVP 범위)

### 3-1. 대시보드 (Dashboard)
* **요약 통계:** 전체/완료/진행중/지연/리뷰중/테스트중 작업 개수 및 버그 개수
* **진행률 시각화:** 프로젝트 전체 달성률(Done 작업 비율) 표시 및 마감 디데이(D-Day) 표시
* **위험 작업(Risk Tasks) 목록:**
  * 마감일이 지났으나 완료(`Done`)되지 않은 작업
  * 마감일이 2일 이내로 남았으나 진행중(`In Progress`) 이전 단계(`Backlog`, `Todo`)인 작업
  * 블로커(`Blocker`)가 등록된 작업
* **최근 업데이트 및 팀원별 상태 요약**

### 3-2. 프로젝트 및 팀원 관리
* **프로젝트 설정:** 이름, 설명, 기간, 기술 스택, 단계(기획/디자인/개발/테스트/배포/완료) 정보
* **팀원 프로필:** 이름, 역할, 이메일, 담당 작업 수, 완료 작업 수, 현재 진행 중인 작업 표시 및 아바타 색상 지정

### 3-3. 칸반 보드 (Board)
* **6단계 컬럼:** `Backlog`, `Todo`, `In Progress`, `Code Review`, `Testing`, `Done`
* **작업 카드:** 제목, 담당자, 우선순위, 마감일, 블로커 표시, 진행률 표기
* **상태 변경:** 카드 상세 팝업 또는 드롭다운 선택을 통해 즉각적인 상태 전환 지원

### 3-4. 작업 리스트 (Tasks)
* **테이블 뷰:** 등록된 전체 작업을 한눈에 조회
* **필터링:** 상태별, 담당자별, 우선순위별, 마감일 임박 여부, 블로커 유무 필터 제공
* **작업 추가 및 수정:** 제목, 설명, 담당자, 상태, 우선순위, 카테고리, 기간, 진행률, 블로커 상태 등을 제어하는 폼 및 모달 제공

### 3-5. 버그 및 이슈 관리 (Bugs)
* **버그 리포팅:** 제목, 설명, 발견자, 담당자, 심각도(Minor, Major, Critical), 상태(Open, In Progress, Fixed, Closed), 재현 방법, 발생 영역 입력 및 관리

### 3-6. 회의록 관리 (Meetings)
* **회의 기록:** 회의 제목, 일시, 참석자, 논의 내용, 결정 사항, 액션 아이템 등록 및 리스트 조회

---

## 4. 데이터 모델 (Schema)

```typescript
// 1. 프로젝트 (Project)
interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  techStack: string[];
  phase: 'Planning' | 'Design' | 'Development' | 'Testing' | 'Deployment' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

// 2. 팀원 (Member)
interface Member {
  id: string;
  name: string;
  role: 'PM' | 'Frontend' | 'Backend' | 'Fullstack' | 'Designer' | 'QA';
  email: string;
  avatarColor: string; // Tailwind bg color class (e.g., 'bg-blue-500')
  createdAt: string;
}

// 3. 작업 (Task)
interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string; // Member.id
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Code Review' | 'Testing' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Planning' | 'UI' | 'Frontend' | 'Backend' | 'Database' | 'API' | 'Test' | 'Deploy';
  startDate: string;
  dueDate: string;
  progress: number; // 0 ~ 100
  hasBlocker: boolean;
  blockerText?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

// 4. 버그 (Bug)
interface Bug {
  id: string;
  projectId: string;
  title: string;
  description: string;
  reporterId: string; // Member.id
  assigneeId: string; // Member.id
  severity: 'Minor' | 'Major' | 'Critical';
  status: 'Open' | 'In Progress' | 'Fixed' | 'Closed';
  reproduceSteps: string;
  relatedArea: string;
  createdAt: string;
  resolvedAt?: string;
}

// 5. 회의록 (Meeting)
interface Meeting {
  id: string;
  projectId: string;
  title: string;
  date: string;
  attendees: string[]; // Member.name or Member.id lists
  discussion: string;
  decisions: string;
  actionItems: string;
  createdAt: string;
}
```

---

## 5. 디자인 시스템 & UX
* **테마:** 개발자 친화적인 **다크 테마(Sleek Dark Mode)** 기본 적용 (Slate/Zinc 톤의 깊이감 있는 배경과 선명한 포인트 컬러)
* **포인트 색상:**
  * Primary: Violet (`indigo-500` / `violet-500`)
  * Success: Green (`emerald-500`)
  * Warning: Yellow/Orange (`amber-500`)
  * Danger/Blocker: Red (`rose-500`)
  * Code Review: Purple (`purple-500`)
  * Testing: Orange (`orange-500`)
* **레이아웃:** 반응형 사이드바를 활용한 2단 레이아웃. 대형 모니터 및 랩톱(Desktop-first)에 최적화된 넓고 정보 밀도가 높은 대시보드 카드 구성.
