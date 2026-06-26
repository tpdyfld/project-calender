import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ProjectProvider } from '../context/ProjectContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevFlow Manager - IT 프로젝트 관리',
  description: 'IT 개발 팀 프로젝트의 진행 상황, 버그, 회의록을 한눈에 관리하는 대시보드 앱',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased overflow-hidden`}>
        {/* React Context 상태 보존 Provider를 주입하여 전역 상태를 바인딩합니다. */}
        <AuthProvider>
          <ProjectProvider>{children}</ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
