import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 등록된 전체 팀원 목록 조회
export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { name: 'asc' }, // 이름 오름차순으로 정렬하여 일관되게 보여줍니다.
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error('팀원 조회 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
