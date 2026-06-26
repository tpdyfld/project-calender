// Todo 아이템 처리를 위한 TypeScript 타입 정의 파일

// 1. Todo 카테고리 타입 정의
export type TodoCategory =
  | '개발'
  | '디자인'
  | '회의'
  | '버그수정'
  | '테스트'
  | '문서작업'
  | '기타';

// 2. Todo 우선순위 타입 정의
export type TodoPriority = 'Low' | 'Medium' | 'High';

// 3. Todo 핵심 인터페이스 정의
export interface Todo {
  id: string;            // 할 일 고유 식별자 (UUID)
  title: string;         // 할 일 제목
  description: string;   // 상세 설명 또는 메모
  userId: string;        // 작성한 사용자의 고유 ID (AuthUser.id)
  userName: string;      // 작성한 사용자의 이름 (화면 렌더링용 캐싱)
  userRole: string;      // 작성한 사용자의 역할 (화면 렌더링용 캐싱)
  date: string;          // 오늘 날짜 필터링을 위한 필드 (YYYY-MM-DD)
  startDate?: string;    // 시작일 (YYYY-MM-DD)
  dueDate?: string;      // 마감일 (YYYY-MM-DD)
  priority: TodoPriority; // 우선순위 (Low, Medium, High)
  category: TodoCategory; // 카테고리 영역
  isCompleted: boolean;  // 완료 여부
  order: number;         // 정렬 드래그앤드롭 보존을 위한 순서 가중치
  createdAt: string;     // 생성 일자 (ISO 8601 문자열)
  updatedAt: string;     // 수정 일자 (ISO 8601 문자열)
}
