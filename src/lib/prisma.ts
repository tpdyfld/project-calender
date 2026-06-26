import { PrismaClient } from '@prisma/client';

// Next.js 개발 환경에서 핫 리로드(Hot Reload) 발생 시 
// PrismaClient 인스턴스가 계속 새로 생성되어 DB 커넥션이 초과되는 현상을 방지하는 싱글톤 헬퍼입니다.

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
