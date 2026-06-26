import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH: 특정 작업(태스크) 정보 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // order, riskOrder 필드는 DB 스키마 동기화 불가 상황에 대비해
    // 실제 Prisma DB 업데이트 대상에서 제외하고, 클라이언트에 반환할 때 병합해 줍니다.
    const { order, riskOrder, ...dbUpdateData } = body;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: dbUpdateData,
    });

    return NextResponse.json({
      ...updatedTask,
      ...(order !== undefined ? { order } : {}),
      ...(riskOrder !== undefined ? { riskOrder } : {}),
    });
  } catch (error) {
    console.error('태스크 수정 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: 특정 작업(태스크) 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('태스크 삭제 API 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
