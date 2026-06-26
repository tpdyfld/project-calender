import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 전체 버그 목록 조회 (최신순)
export async function GET() {
  try {
    const bugs = await prisma.bug.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bugs);
  } catch (error) {
    console.error('버그 조회 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

// POST: 신규 버그 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, reporterId, assigneeId, severity, status, reproduceSteps, relatedArea, projectId } = body;

    if (!title || !projectId || !reporterId || !assigneeId) {
      return NextResponse.json({ error: '필수 필드(title, projectId, reporterId, assigneeId)가 누락되었습니다.' }, { status: 400 });
    }

    const newBug = await prisma.bug.create({
      data: {
        title,
        description,
        reporterId,
        assigneeId,
        severity: severity || 'Major',
        status: status || 'Open',
        reproduceSteps: reproduceSteps || '',
        relatedArea: relatedArea || '',
        projectId,
      },
    });

    return NextResponse.json(newBug, { status: 201 });
  } catch (error) {
    console.error('버그 등록 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
