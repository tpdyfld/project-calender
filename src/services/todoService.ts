import { Todo, TodoCategory, TodoPriority } from '../types/todo';

const TODOS_KEY = 'devflow_todos';

// YYYY-MM-DD 형식으로 오늘 날짜를 구하는 헬퍼 함수
function getTodayDateString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 1. 초기 테스트 Todo 데이터를 생성하는 시딩 함수
function seedDefaultTodosIfNeeded() {
  if (typeof window === 'undefined') return;

  const rawTodos = localStorage.getItem(TODOS_KEY);
  if (!rawTodos) {
    const today = getTodayDateString();
    
    // 요구사항에 맞춰 4가지 테스트용 기본 Todo 배열 정의 (userRole: '팀장' 필드 추가)
    const defaultTodos: Todo[] = [
      {
        id: 'todo-1',
        title: '오늘 로그인 기능 마무리하기',
        description: 'localStorage 기반의 회원가입과 로그인 연동을 확인하고 예외 처리를 마무리합니다.',
        userId: 'test-user-id',
        userName: '테스트유저',
        userRole: '팀장',
        date: today,
        startDate: today,
        dueDate: today,
        priority: 'High',
        category: '개발',
        isCompleted: false,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'todo-2',
        title: 'Todo 리스트 UI 다듬기',
        description: 'Planit 앱 스타일의 부드러운 다크 모드 배경과 카드 디자인, 우선순위 배지를 연동합니다.',
        userId: 'test-user-id',
        userName: '테스트유저',
        userRole: '팀장',
        date: today,
        startDate: today,
        dueDate: today,
        priority: 'Medium',
        category: '디자인',
        isCompleted: false,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'todo-3',
        title: '버그 관리 페이지 확인하기',
        description: '기존 QA에서 발급된 시스템 결함 목록이 대시보드 및 버그 관리 메뉴와 정상 연동되는지 체크합니다.',
        userId: 'test-user-id',
        userName: '테스트유저',
        userRole: '팀장',
        date: today,
        startDate: today,
        dueDate: today,
        priority: 'Low',
        category: '버그수정',
        isCompleted: false,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'todo-4',
        title: '회의록 페이지 수정 사항 정리하기',
        description: '팀 회의 결정 사항에서 고정 mock 이름("세연", "다인" 등)이 수정되었는지 더블체크합니다.',
        userId: 'test-user-id',
        userName: '테스트유저',
        userRole: '팀장',
        date: today,
        startDate: today,
        dueDate: today,
        priority: 'Low',
        category: '회의',
        isCompleted: false,
        order: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(TODOS_KEY, JSON.stringify(defaultTodos));
  }
}

// 2. Todo 데이터 제어 서비스 객체 정의
export const todoService = {
  /**
   * 지정한 날짜 또는 전체 Todo 목록을 가져옵니다. (기본적으로 order 오름차순 정렬)
   */
  getTodos(date?: string): Todo[] {
    seedDefaultTodosIfNeeded();
    if (typeof window === 'undefined') return [];

    const raw = localStorage.getItem(TODOS_KEY);
    const allTodos: Todo[] = raw ? JSON.parse(raw) : [];

    // 특정 날짜 필터링이 요구된 경우 수행
    const filtered = date ? allTodos.filter((t) => t.date === date) : allTodos;

    // order 우선 정렬 후, 생성일 오름차순 정렬
    return filtered.sort((a, b) => a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  /**
   * 새로운 Todo를 생성하여 데이터베이스(localStorage)에 추가합니다.
   */
  createTodo(
    title: string,
    description: string,
    userId: string,
    userName: string,
    userRole: string,
    date: string,
    priority: TodoPriority,
    category: TodoCategory,
    startDate?: string,
    dueDate?: string
  ): Todo {
    seedDefaultTodosIfNeeded();
    if (typeof window === 'undefined') {
      throw new Error('브라우저 환경에서만 동작합니다.');
    }

    if (!title.trim()) throw new Error('할 일 제목을 입력해주세요.');

    const allTodos = this.getTodos();
    
    // 동일 날짜/유저의 Todo들 중에서 가장 큰 order 값을 찾아 + 1 가중치 부여
    const sameDayTodos = allTodos.filter((t) => t.date === date);
    const maxOrder = sameDayTodos.reduce((max, t) => (t.order > max ? t.order : max), 0);

    const newTodo: Todo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      userId,
      userName,
      userRole,
      date,
      startDate: startDate || date,
      dueDate: dueDate || date,
      priority,
      category,
      isCompleted: false,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allTodos.push(newTodo);
    localStorage.setItem(TODOS_KEY, JSON.stringify(allTodos));
    return newTodo;
  },

  /**
   * 특정 Todo의 세부 정보를 업데이트합니다. (완료 여부, 텍스트 등)
   */
  updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): Todo {
    seedDefaultTodosIfNeeded();
    if (typeof window === 'undefined') {
      throw new Error('브라우저 환경에서만 동작합니다.');
    }

    const allTodos = this.getTodos();
    const index = allTodos.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error('해당 할 일을 찾을 수 없습니다.');
    }

    const updatedTodo: Todo = {
      ...allTodos[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    allTodos[index] = updatedTodo;
    localStorage.setItem(TODOS_KEY, JSON.stringify(allTodos));
    return updatedTodo;
  },

  /**
   * 특정 Todo를 리스트에서 영구히 삭제합니다.
   */
  deleteTodo(id: string): void {
    seedDefaultTodosIfNeeded();
    if (typeof window === 'undefined') return;

    const allTodos = this.getTodos();
    const filtered = allTodos.filter((t) => t.id !== id);
    localStorage.setItem(TODOS_KEY, JSON.stringify(filtered));
  },

  /**
   * 드래그앤드롭 등 재배치 작업으로 인해 변경된 Todo 순서 배열을 전체 갱신 저장합니다.
   */
  saveTodos(todos: Todo[]): void {
    if (typeof window === 'undefined') return;
    
    // 전체 할 일 목록을 가져와 해당 날짜의 변경된 내역을 교체 업데이트
    const allTodos = this.getTodos();
    const otherTodos = allTodos.filter((t) => !todos.some((ut) => ut.id === t.id));
    
    // 순서 가중치(order) 재할당
    const updatedWithOrder = todos.map((t, idx) => ({
      ...t,
      order: idx + 1,
    }));

    const finalTodos = [...otherTodos, ...updatedWithOrder];
    localStorage.setItem(TODOS_KEY, JSON.stringify(finalTodos));
  },
};
