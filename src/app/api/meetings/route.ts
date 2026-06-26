import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 전체 회의록 목록 조회 (최신 작성순)
export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(meetings);
  } catch (error) {
    console.error('회의록 조회 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

// POST: 신규 회의록 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, date, attendees, discussion, decisions, actionItems, projectId } = body;

    if (!title || !projectId || !date) {
      return NextResponse.json({ error: '필수 필드(title, projectId, date)가 누락되었습니다.' }, { status: 400 });
    }

    const newMeeting = await prisma.meeting.create({
      data: {
        title,
        date,
        attendees: attendees || [],
        discussion: discussion || '',
        decisions: decisions || '',
        actionItems: actionItems || '',
        projectId,
      },
    });

    return NextResponse.json(newMeeting, { status: 201 });
  } catch (error) {
    console.error('회의록 작성 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
