# 제품 요구사항 정의서 (PRD) - DevFlow Manager

## 1. 프로젝트 개요
* **서비스명:** DevFlow Manager
* **한 줄 설명:** IT 개발 팀 프로젝트의 업무 진행 상황, 개인 할 일(Todo), 버그 이슈, 회의록, 마감 위험도를 통합 관리하는 협업 대시보드 웹 서비스
* **목표:** 팀원 간 업무 투명성 확보, 지연 작업 및 Blocker(장애 요인) 신속 감지, 일정 달력(기간 바) 및 Todo/작업 정렬 관리를 통한 프로젝트 마감 위험도 최소화
* **주요 사용자:** 대학생 캡스톤 디자인 팀, 사이드 프로젝트 팀, 포트폴리오 준비용 개발 팀

---

## 2. 핵심 컨셉 & 워크플로우
개발 팀 프로젝트의 실제 협업 흐름에 맞춘 대시보드, 일정 달력 및 할 일(Todo) 중심의 통합 관리 도구입니다.

1. **로그인 및 회원가입:** 직무 역할(PM, FE, BE, Designer 등)을 선택해 회원가입 후 로그인하여 개인 세션 생성.
2. **프로젝트 관리:** 프로젝트 기본 정보(기간, 기술 스택, 현재 단계) 설정 및 공유.
3. **개인 할 일(Todo) 관리:** 일자별 Todo 생성 및 완료 처리. 드래그앤드롭을 통한 정렬 순서 보존 및 타 팀원 업무 가로 보드 조회.
4. **일정 달력(Calendar) 관리:** 하루에 국한되지 않고 시작일~마감일까지 가로로 연장되어 이어지는 "기간 일정 바(Bar)" 렌더링. 드래그 드롭을 활용한 기간 길이 보존 날짜 이동.
5. **작업(Task) 리스트 정렬:** 테이블 형태의 작업 목록 제공. 미완료 작업 및 완료(`Done`) 작업 그룹별 독립적인 드래그 드롭 정렬 보존.
6. **마감 위험도 및 Blocker 추적:** 대시보드를 통해 3개 이하 잘림 없는 마감 위험 작업 조회 및 드래그 드롭 위험도 순서 변경.
7. **버그 리포팅 및 회의록:** 개발 중 발생한 버그 및 팀 회의록을 유기적으로 기록하고 유지.

---

## 3. 기능 요구사항 (MVP 범위)

### 3-1. 로그인 & 회원가입 (Auth)
* **회원가입:** 이메일, 비밀번호, 이름 및 전문 직무 역할(팀장, Frontend, Backend, Designer, QA, Fullstack 등)을 드롭다운에서 필수로 선택하여 가입.
* **로그인:** 가입한 이메일/비밀번호 기반 로그인 및 사용자 세션 생성.
* **로그인 정보 조회:** 헤더 우측의 내 프로필 아바타 버튼 클릭 시 팝오버 창을 통해 내 이름/이메일/역할 정보 및 전체 가입된 팀원 리스트와 직무 조회 가능.
* **권한 방어벽:** 로그인 세션을 기반으로 본인이 작성한 데이터(Todo 등)만 수정, 완료 처리, 삭제할 수 있도록 방어벽 적용.

### 3-2. 대시보드 (Dashboard)
* **요약 통계:** 총 작업 수, 진행 중인 작업 수, 일정 지연 작업 수, 진행 장애(Block) 수, 미해결 버그 통계 카드 제공.
* **진행률 시각화:** 프로젝트 전체 달성률(Done 작업 비율)을 나타내는 SVG 원형 차트 제공.
* **위험 작업(Risk Tasks) 목록:**
  * 마감일 초과, 마감 2일 이내의 미시작 작업 또는 블로커 등록 작업 감지.
  * 컨테이너 세로 한계 개선(`max-h-[310px]`)을 적용하여 3개 이하의 카드는 잘림 없이 완전히 노출되고, D-Day 및 담당자가 요약 표시됨.
  * 4개 이상부터 세로 스크롤바 활성화.
  * 그립 핸들 및 드래그앤드롭 정렬을 연동하여 위험 등급 순서를 실시간 변경하고 `riskOrder` 필드 및 localStorage에 영구 보존.

### 3-3. Todo 리스트 (Todo)
* **내 할 일 탭 (My Todos):**
  * 오늘 할 일들이 세로로 쌓이는 정갈한 적층형 목록으로 제공.
  * 미완료 할 일(상단)과 완료된 할 일(하단, 취소선 및 불투명도 적용)로 분리 렌더링.
  * 미완료 항목들끼리 마우스 드래그를 통해 위아래 순서 배치 변경 및 유지.
* **팀 전체 할 일 탭 (Team Todos):**
  * 가입된 전체 팀원 개개인이 세로 컬럼(보드)이 되어 가로 방향으로 나열되는 가로 스크롤 레이아웃 제공.
  * 각 컬럼 헤더에 팀원의 이름, 아바타 이니셜, 역할 정보 노출.
  * 타인의 컬럼 내 Todo는 조회만 가능한 읽기 전용 상태로 차단하고 본인 Todo만 실시간 수정/완료 토글 가능.
* **할 일 추가 및 수정 모달:**
  * 제목, 설명, 시작일, 마감일, 우선순위(Low, Medium, High), 카테고리를 입력/수정할 수 있는 팝업 모달 제공.
  * **삭제 기능 추가:** 수정 모달 왼쪽 하단에 붉은색 [삭제하기] 휴지통 버튼을 추가하여, 작성자 본인 세션인 경우에만 1차 컨펌을 거쳐 즉시 데이터 소멸 및 UI 동기화 처리.
  * **마감일 역전 에러 검증:** 마감일이 시작일보다 빠르게 입력되는 경우 제출을 차단하고 에러 경고를 표출.

### 3-4. 일정 달력 (Calendar)
* **가로형 기간 일정 바(Bar) 표시:**
  * 하루에만 찍히는 단조로운 형태를 탈피해 시작일부터 마감일까지 가로로 연장되어 이어지는 바 형태로 렌더링.
  * 주(Week) 단위 다층 레이블 구조(`absolute` 배경 격자 + `z-10` 전면 일정 바 레이어)를 적용해 주가 바뀌더라도 요일선 경계를 부드럽게 넘어가며 이어지도록 배치.
  * 시작일에는 왼쪽 둥글기(`rounded-l-md`), 마감일에는 오른쪽 둥글기(`rounded-r-md`) 적용.
  * 제목은 시작일 또는 주의 첫 날에만 한 번 크게 노출되며, 길이에 맞춰 말줄임(`truncate`) 처리.
  * 3개 이하의 일정은 스크롤 없이 노출되며, 4개 이상부터 주 단위 개별 레이어 내에서만 마우스 휠 스크롤 활성화.
* **드래그앤드롭 날짜 이동:**
  * 일정 바를 마우스로 잡고 다른 날짜 칸으로 드롭하면, **기존 기간의 길이(일 수)를 유지한 채 시작일과 마감일이 함께 슬라이드 이동**하여 저장.
  * 드래그 중인 카드는 투명도 조절, 마우스 오버 중인 날짜 칸은 연한 하이라이트 배경으로 강조되어 시각적 피드백 제공.
  * `Task`와 `Todo`를 통합 렌더링하며 드롭 이동 시 각각의 데이터 갱신 로직 실행.
  * 일정 바 클릭 시 각각의 수정 모달 팝업 오픈 연동.

### 3-5. 작업 목록 (Tasks)
* **테이블 뷰:** 제목, 담당자, 카테고리, 우선순위, 상태, 마감일(D-day), 진행률, Blocker 유무를 포함한 테이블 정보 제공.
* **필터링:** 상태별, 담당자별, 우선순위별, 블로커 유무별, 마감 일정 임박 여부별(초과 / 2일 이내) 실시간 다중 필터 조작 지원.
* **드래그앤드롭 정렬:** 미완료 작업 그룹 및 완료(`Done`) 작업 그룹 내에서 마우스 드래그를 통해 위아래 순서를 자유롭게 편집 가능하며, `order` 필드 및 localStorage에 영구 보존.

### 3-6. 버그 및 이슈 관리 (Bugs)
* **버그 리포팅:** 제목, 설명, 발견자, 담당자, 심각도(Minor, Major, Critical), 상태(Open, In Progress, Fixed, Closed), 재현 방법, 발생 영역 입력 및 관리.

### 3-7. 회의록 관리 (Meetings)
* **회의 기록:** 회의 제목, 일시, 참석자, 논의 내용, 결정 사항, 액션 아이템 등록 및 조회.

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
  role: string; // 'PM', 'Frontend', 'Backend', 'Fullstack', 'Designer', 'QA' 등 세분화된 직무
  email: string;
  avatarColor: string; // Tailwind bg color class (e.g., 'bg-indigo-650')
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
  order?: number;     // 작업 목록 드래그 정렬 순서
  riskOrder?: number; // 대시보드 마감 위험 목록 드래그 정렬 순서
  createdAt: string;
  updatedAt: string;
}

// 4. 할 일 (Todo)
interface Todo {
  id: string;
  title: string;
  description: string;
  userId: string;        // AuthUser.id
  userName: string;      // 작성 유저 이름 캐싱
  userRole: string;      // 작성 유저 역할(직무) 캐싱
  date: string;          // 날짜 기준 필터링 필드
  startDate?: string;    // 기간제 할 일의 시작일
  dueDate?: string;      // 기간제 할 일의 마감일
  priority: 'Low' | 'Medium' | 'High';
  category: '개발' | '디자인' | '회의' | '버그수정' | '테스트' | '문서작업' | '기타';
  isCompleted: boolean;
  order: number;         // Todo 목록 드래그 정렬 순서
  createdAt: string;
  updatedAt: string;
}

// 5. 버그 (Bug)
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

// 6. 회의록 (Meeting)
interface Meeting {
  id: string;
  projectId: string;
  title: string;
  date: string;
  attendees: string[]; // Member.name 리스트
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
  * Success: Green (`emerald-550`)
  * Warning: Yellow/Orange (`amber-500`)
  * Danger/Blocker: Red (`rose-500`)
  * Code Review: Purple (`purple-500`)
  * Testing: Orange (`orange-500`)
* **인터랙션 피드백:**
  * 드래그 가능한 카드는 마우스 오버 시 `cursor: grab`, 드래그 시 `cursor: grabbing`을 제공해 드래그 동작 직관화.
  * 드래그 중인 대상은 투명도(`opacity-30`) 조절.
  * 드롭 타겟(캘린더 날짜 셀)은 드래그 진입 시 연한 배경색 및 테두리 두께 강조 처리.
* **레이아웃:** 반응형 사이드바를 활용한 2단 레이아웃. 정보의 밀도가 높은 효율적인 카드 및 목록 구조 설계.
