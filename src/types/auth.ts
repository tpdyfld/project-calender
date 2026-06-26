// 사용자 인증을 위한 TypeScript 타입 정의 파일

// 1. 현재 로그인한 사용자 세션을 유지하기 위한 유저 인터페이스
export interface AuthUser {
  id: string;          // 유저 고유 식별자 (UUID)
  name: string;        // 유저 이름 (실제 닉네임)
  email: string;       // 유저 이메일 (로그인 식별자)
  avatarColor: string; // UI 렌더링에 매핑될 아바타 배경색 (Tailwind 클래스)
  role: string;        // IT 개발 팀 프로젝트 내 역할 (예: 'PM', 'Frontend', '팀장' 등)
}

// 2. 회원가입 및 로그인 등 데이터 교환에 필요한 부가 타입
export interface UserRegisterInput {
  name: string;
  email: string;
  role: string;        // 선택한 유저 직무 역할
  password?: string; // localStorage 인증용 비밀번호 (해시 없이 저장하므로 가상 보안 고려)
}
