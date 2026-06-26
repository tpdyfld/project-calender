import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH: 특정 버그 정보 및 조치 상태 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedBug = await prisma.bug.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedBug);
  } catch (error) {
    console.error('버그 수정 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
