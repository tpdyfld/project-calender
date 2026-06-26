import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 전체 작업(태스크) 목록 조회 (최신 등록 순)
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('태스크 조회 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

// POST: 신규 작업(태스크) 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, assigneeId, status, priority, category, startDate, dueDate, progress, hasBlocker, blockerText, memo, projectId } = body;

    if (!title || !projectId || !assigneeId) {
      return NextResponse.json({ error: '필수 필드(title, projectId, assigneeId)가 누락되었습니다.' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        status: status || 'Todo',
        priority: priority || 'Medium',
        category: category || 'Frontend',
        startDate,
        dueDate,
        progress: Number(progress) || 0,
        hasBlocker: Boolean(hasBlocker),
        blockerText: hasBlocker ? blockerText : '',
        memo: memo || '',
        projectId,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('태스크 생성 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
