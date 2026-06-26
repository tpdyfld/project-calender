import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 프로젝트 기본 정보 조회
export async function GET() {
  try {
    const project = await prisma.project.findFirst();
    if (!project) {
      return NextResponse.json({ error: '프로젝트 정보가 존재하지 않습니다.' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error('프로젝트 조회 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

// PATCH: 프로젝트 정보 업데이트
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updatedFields } = body;

    if (!id) {
      return NextResponse.json({ error: '수정할 프로젝트 식별자(id)가 필요합니다.' }, { status: 400 });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updatedFields,
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('프로젝트 수정 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
