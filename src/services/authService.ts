import { AuthUser } from '../types/auth';
import { Member } from '../types';

// localStorage 접근을 안전하게 처리하기 위한 키 정의
const USERS_KEY = 'devflow_users';
const CURRENT_USER_KEY = 'devflow_current_user';

// 사용 가능한 Tailwind 아바타 색상 테마 정의
const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-pink-500',
];

// 이메일 정규식 포맷 검증 유틸리티 함수
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 1. 초기 테스트 계정을 가상 DB에 시딩(Seeding)하기 위한 내부 헬퍼 함수
function seedDefaultUserIfNeeded() {
  if (typeof window === 'undefined') return;

  const rawUsers = localStorage.getItem(USERS_KEY);
  let users = rawUsers ? JSON.parse(rawUsers) : [];

  // 테스트 계정이 목록에 없다면 자동 추가 (비밀번호: 123456, 이름: 테스트유저)
  const hasTestUser = users.some((u: any) => u.email === 'test@example.com');
  if (!hasTestUser) {
    const testUser = {
      id: 'test-user-id',
      name: '테스트유저',
      email: 'test@example.com',
      password: '123456', // 실제 상용 빌드 시에는 복호화가 안 되게 해싱하여 전달되어야 함
      avatarColor: 'bg-indigo-600',
      role: '팀장', // 기존 PM에서 요구사항인 '팀장'으로 변경
      createdAt: new Date().toISOString(),
    };
    users.push(testUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

// 2. 인증 서비스 클라이언트 계층 객체 정의
export const authService = {
  /**
   * 전체 가입 유저 목록을 조회 (로컬 DB 마이그레이션 모사)
   */
  getUsers(): any[] {
    seedDefaultUserIfNeeded();
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * 가입된 유저 리스트를 기존 Member 타입 포맷으로 반환하여 호환성을 확보합니다.
   */
  getMembers(): Member[] {
    const users = this.getUsers();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role || '팀원', // 디폴트 역할은 '팀원'으로 지정
      email: user.email,
      avatarColor: user.avatarColor,
      createdAt: user.createdAt || new Date().toISOString(),
    }));
  },

  /**
   * 회원가입을 처리합니다.
   */
  register(name: string, email: string, password: string, role: string): AuthUser {
    seedDefaultUserIfNeeded();
    if (typeof window === 'undefined') {
      throw new Error('브라우저 환경에서만 동작합니다.');
    }

    if (!name.trim()) throw new Error('이름을 입력해주세요.');
    if (!isValidEmail(email)) throw new Error('올바른 이메일 형식이 아닙니다.');
    if (!role.trim()) throw new Error('역할을 선택해주세요.');
    if (password.length < 6) throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');

    const users = this.getUsers();
    const isEmailTaken = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (isEmailTaken) {
      throw new Error('이미 사용 중인 이메일 주소입니다.');
    }

    // 신규 아바타 랜덤 배경색 선택
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password, // 로컬스토리지 모의용
      avatarColor: randomColor,
      role: role || '팀원', // 가입 시 선택한 역할 저장
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // 회원가입 성공 시 회원 정보 반환
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarColor: newUser.avatarColor,
      role: newUser.role,
    };
  },

  /**
   * 로그인을 검증하고 사용자 세션을 활성화합니다.
   */
  login(email: string, password: string): AuthUser {
    seedDefaultUserIfNeeded();
    if (typeof window === 'undefined') {
      throw new Error('브라우저 환경에서만 동작합니다.');
    }

    const users = this.getUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    const authUser: AuthUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      avatarColor: foundUser.avatarColor,
      role: foundUser.role || '팀원',
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    return authUser;
  },

  /**
   * 로그아웃을 수행하고 현재 세션을 폐기합니다.
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  /**
   * 현재 로그인되어 세션이 활성화된 사용자 정보를 조회합니다.
   */
  getCurrentUser(): AuthUser | null {
    seedDefaultUserIfNeeded();
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};
