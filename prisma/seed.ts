import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스 시딩(Seed) 작업을 시작합니다...');

  // 1. 기존 데이터 전체 클리닝 (멱등성 확보)
  // 외래키 제약조건이 있으므로 자식 테이블(Task, Bug, Meeting)을 먼저 지우고 부모 테이블(Member, Project)을 지웁니다.
  await prisma.task.deleteMany({});
  await prisma.bug.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.project.deleteMany({});
  console.log('🧹 기존 데이터베이스 레코드가 초기화되었습니다.');

  // 2. 부모 데이터 - 프로젝트 생성
  const project = await prisma.project.create({
    data: {
      id: 'project-1',
      name: 'DevFlow Manager',
      description: 'IT 개발 팀 프로젝트의 진행 상황, 이슈, 코드 리뷰, 회의 기록을 통합 관리하는 대시보드 웹 서비스입니다.',
      startDate: '2026-06-10',
      dueDate: '2026-07-15',
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Neon DB (Prisma)'],
      phase: 'Development',
    },
  });
  console.log(`📁 프로젝트 생성 완료: ${project.name}`);

  // 3. 부모 데이터 - 팀원 목록 생성
  const membersData = [
    {
      id: 'member-1',
      name: '세연',
      role: 'Fullstack',
      email: 'seyeon@devflow.com',
      avatarColor: 'bg-violet-500',
    },
    {
      id: 'member-2',
      name: '다인',
      role: 'Frontend',
      email: 'dain@devflow.com',
      avatarColor: 'bg-sky-500',
    },
    {
      id: 'member-3',
      name: '수진',
      role: 'Backend',
      email: 'sujin@devflow.com',
      avatarColor: 'bg-emerald-500',
    },
    {
      id: 'member-4',
      name: '민재',
      role: 'QA',
      email: 'minjae@devflow.com',
      avatarColor: 'bg-amber-500',
    },
  ];

  for (const m of membersData) {
    const createdMember = await prisma.member.create({ data: m });
    console.log(`👤 팀원 생성 완료: ${createdMember.name} (${createdMember.role})`);
  }

  // 4. 자식 데이터 - 작업(태스크) 목록 생성
  const tasksData = [
    {
      id: 'task-1',
      projectId: 'project-1',
      title: '로그인 화면 UI 구현',
      description: '사용자가 서비스를 이용할 수 있도록 이메일 로그인 및 소셜 로그인 디자인을 완성합니다.',
      assigneeId: 'member-2',
      status: 'Done',
      priority: 'Low',
      category: 'UI',
      startDate: '2026-06-11',
      dueDate: '2026-06-15',
      progress: 100,
      hasBlocker: false,
      memo: 'Figma 시안을 기준으로 깔끔한 다크 모드 버튼을 배치했습니다.',
    },
    {
      id: 'task-2',
      projectId: 'project-1',
      title: 'API 엔드포인트 설계 및 검증',
      description: '프로젝트, 작업, 버그 및 회의록 관리를 위한 REST API 규격을 설계하고 Swagger로 문서화합니다.',
      assigneeId: 'member-3',
      status: 'Done',
      priority: 'High',
      category: 'API',
      startDate: '2026-06-11',
      dueDate: '2026-06-18',
      progress: 100,
      hasBlocker: false,
      memo: '세연이와 논의한 뒤 DB 스키마에 맞춰 URL 경로를 맞추었습니다.',
    },
    {
      id: 'task-3',
      projectId: 'project-1',
      title: '프로젝트 대시보드 통계 카드 구현',
      description: '전체 작업 수, 완료 작업 수, 진행 중인 작업 수 등을 API에서 계산하여 보여주는 대시보드 상단 요약 카드를 개발합니다.',
      assigneeId: 'member-2',
      status: 'In Progress',
      priority: 'Medium',
      category: 'Frontend',
      startDate: '2026-06-20',
      dueDate: '2026-06-26',
      progress: 60,
      hasBlocker: false,
      memo: 'SVG 아이콘과 Tailwind 애니메이션을 추가하는 작업 진행 중입니다.',
    },
    {
      id: 'task-4',
      projectId: 'project-1',
      title: '칸반 보드 작업 상태 변경 기능',
      description: '칸반 보드에서 드롭다운 또는 드래그앤드롭으로 카드의 진행 상태(Todo, In Progress 등)를 변경할 수 있도록 합니다.',
      assigneeId: 'member-1',
      status: 'In Progress',
      priority: 'High',
      category: 'Frontend',
      startDate: '2026-06-22',
      dueDate: '2026-06-28',
      progress: 40,
      hasBlocker: false,
      memo: 'Select 컴포넌트를 이용한 비동기 상태 업데이트 로직 먼저 연결 중.',
    },
    {
      id: 'task-5',
      projectId: 'project-1',
      title: 'Neon DB 연동 구조 설계',
      description: 'Prisma ORM을 이용해 Neon DB(PostgreSQL) 클라우드 데이터베이스에 연결하고 마이그레이션 설정을 진행합니다.',
      assigneeId: 'member-3',
      status: 'Code Review',
      priority: 'Critical',
      category: 'Database',
      startDate: '2026-06-18',
      dueDate: '2026-06-24',
      progress: 90,
      hasBlocker: false,
      memo: '커넥션 풀 설정에 이슈가 있어서 풀 확인 중입니다. PR 올려두었습니다.',
    },
    {
      id: 'task-6',
      projectId: 'project-1',
      title: '버그 리포트 등록 기능',
      description: 'QA 단계에서 발견된 버그를 제목, 설명, 심각도, 재현 경로와 함께 등록하는 양식 폼을 구성합니다.',
      assigneeId: 'member-1',
      status: 'Testing',
      priority: 'High',
      category: 'Frontend',
      startDate: '2026-06-20',
      dueDate: '2026-06-24',
      progress: 90,
      hasBlocker: false,
      memo: '기본 폼 입력 밸리데이션 검사 추가하여 테스트 중입니다.',
    },
    {
      id: 'task-7',
      projectId: 'project-1',
      title: '반응형 레이아웃 수정',
      description: '태블릿 및 모바일 브라우저 크기에서 좌측 사이드바가 햄버거 메뉴로 토글되고, 대시보드 카드가 1열로 세로 정렬되도록 레이아웃을 다듬습니다.',
      assigneeId: 'member-2',
      status: 'In Progress',
      priority: 'Medium',
      category: 'UI',
      startDate: '2026-06-23',
      dueDate: '2026-06-29',
      progress: 20,
      hasBlocker: true,
      blockerText: '모바일 뷰포트에서 칸반 보드 가로 스크롤 시 화면 전체가 흔들리고 사이드바 레이아웃이 침범하는 깨짐 현상 발생.',
      memo: '우선순위를 높여 CSS Flex/Grid 속성을 재확인할 예정입니다.',
    },
    {
      id: 'task-8',
      projectId: 'project-1',
      title: '작업 추가 모달 구현',
      description: '새로운 작업을 신속히 생성할 수 있도록 간편 입력 다이얼로그 모달을 개발합니다.',
      assigneeId: 'member-2',
      status: 'Todo',
      priority: 'Medium',
      category: 'Frontend',
      startDate: '2026-06-25',
      dueDate: '2026-06-30',
      progress: 0,
      hasBlocker: false,
    },
    {
      id: 'task-9',
      projectId: 'project-1',
      title: '배포 환경 설정',
      description: 'Vercel 또는 Netlify 환경을 통해 프론트엔드 빌드 결과물을 웹상에 배포하고, 환경 변수를 세팅합니다.',
      assigneeId: 'member-1',
      status: 'Backlog',
      priority: 'Medium',
      category: 'Deploy',
      startDate: '2026-07-01',
      dueDate: '2026-07-05',
      progress: 0,
      hasBlocker: false,
    },
    {
      id: 'task-10',
      projectId: 'project-1',
      title: '회의록 작성 페이지 구현',
      description: '회의 제목, 참석자 선택, 결정 사항 등을 에디터 폼 형태로 기입하고 아카이빙할 수 있는 페이지를 구현합니다.',
      assigneeId: 'member-2',
      status: 'Backlog',
      priority: 'Low',
      category: 'Frontend',
      startDate: '2026-07-02',
      dueDate: '2026-07-08',
      progress: 0,
      hasBlocker: false,
    }
  ];

  for (const t of tasksData) {
    await prisma.task.create({ data: t });
  }
  console.log(`✅ 작업 데이터(${tasksData.length}건) 생성 완료`);

  // 5. 자식 데이터 - 버그 목록 생성
  const bugsData = [
    {
      id: 'bug-1',
      projectId: 'project-1',
      title: '작업 상태 변경 후 새로고침 시 초기화됨',
      description: '칸반 보드 및 상세 모달에서 작업 상태를 Done으로 변경해도, 새로고침을 누르면 다시 이전 상태로 되돌아가는 현상이 발생합니다.',
      reporterId: 'member-4',
      assigneeId: 'member-1',
      severity: 'Critical',
      status: 'Open',
      reproduceSteps: '1. 보드 화면 진입\n2. Todo에 있는 임의의 카드 드롭다운을 Done으로 변경\n3. 브라우저 새로고침(F5) 실행\n4. 상태가 다시 Todo로 원복되어 있음',
      relatedArea: '칸반 보드 상태 동기화 모듈',
    },
    {
      id: 'bug-2',
      projectId: 'project-1',
      title: '마감일 지난 작업이 위험 목록에 표시되지 않음',
      description: '태스크의 마감일이 지났음에도 불구하고 대시보드 우측 위험 작업(Risk Tasks) 영역에 잡히지 않고 누락되고 있습니다.',
      reporterId: 'member-4',
      assigneeId: 'member-2',
      severity: 'Major',
      status: 'In Progress',
      reproduceSteps: '1. 마감일이 어제 날짜인 새로운 작업을 생성하되, 상태를 Todo로 설정\n2. 대시보드로 이동\n3. 위험 작업 목록에 방금 생성한 작업이 보이지 않음',
      relatedArea: '대시보드 통계/위험 작업 필터링 로직',
    },
    {
      id: 'bug-3',
      projectId: 'project-1',
      title: '모바일 화면에서 칸반 보드가 깨짐',
      description: '모바일 환경(가로 해상도 480px 이하)에서 칸반 보드 레이아웃의 가로형 6단 컬럼이 깨져 겹치거나 화면 밖으로 이탈합니다.',
      reporterId: 'member-4',
      assigneeId: 'member-2',
      severity: 'Minor',
      status: 'Open',
      reproduceSteps: '1. 크롬 개발자 도구 기기 에뮬레이터를 통해 iPhone 12 Pro 해상도로 설정\n2. 보드 메뉴로 이동\n3. 칸반 보드의 6개 열이 비정상적으로 구겨지고 겹쳐 가독성이 크게 훼손됨',
      relatedArea: '보드 페이지 CSS Grid',
    }
  ];

  for (const b of bugsData) {
    await prisma.bug.create({ data: b });
  }
  console.log(`✅ 버그 데이터(${bugsData.length}건) 생성 완료`);

  // 6. 자식 데이터 - 회의록 목록 생성
  const meetingsData = [
    {
      id: 'meeting-1',
      projectId: 'project-1',
      title: '1차 기획 및 기술 스택 확정 회의',
      date: '2026-06-10 14:00',
      attendees: ['세연', '다인', '수진'],
      discussion: '프로젝트 DevFlow Manager의 전체적인 MVP 범위와 화면 구성에 대해 이야기했습니다. 각자 포트폴리오로 잘 활용할 수 있도록 최신 개발 스택을 도입하기로 결정했습니다.',
      decisions: '1. 프론트엔드는 Next.js(App Router) + TypeScript + Tailwind CSS를 사용한다.\n2. 나중에 클라우드 DB 연결을 위해 Neon DB + Prisma ORM 구조를 설계한다.\n3. 각 탭은 Dashboard, Board, Tasks, Bugs, Meetings, Team으로 나눈다.',
      actionItems: '1. 다인: 로그인 UI 구성 및 전체 CSS 테마 조사\n2. 수진: Neon DB 사전 스터디 및 Prisma 연동 구조 검토\n3. 세연: Next.js Boilerplate 레포지토리 세팅 및 컴포넌트 뼈대 잡기',
    },
    {
      id: 'meeting-2',
      projectId: 'project-1',
      title: 'UI 설계 및 기능 우선순위 조율',
      date: '2026-06-18 16:30',
      attendees: ['세연', '다인', '수진', '민재'],
      discussion: 'Figma를 바탕으로 한 대시보드 및 칸반 보드 화면 시안을 논의했습니다. QA 담당인 민재의 합류로 버그 트래킹 탭의 상세 기능 규격을 확정했습니다.',
      decisions: '1. 작업 상태는 6단계로 관리한다 (Backlog, Todo, In Progress, Code Review, Testing, Done).\n2. MVP 기능 구현에서 실시간 드래그앤드롭 대신 간편한 Select 변경으로 시작해 구현 복잡도를 조율한다.\n3. 버그 티켓에는 발견자와 조치 담당자를 구분해 등록한다.',
      actionItems: '1. 다인: 대시보드 통계 카드 퍼블리싱\n2. 수진: REST API 백엔드 설계 및 문서 작성\n3. 민재: 각 기능별 테스트 시나리오 초안 작성',
    },
    {
      id: 'meeting-3',
      projectId: 'project-1',
      title: '중간 점검 및 리스크 관리 논의',
      date: '2026-06-22 10:00',
      attendees: ['세연', '다인', '수진', '민재'],
      discussion: '전반적인 API 엔드포인트 설계와 로그인 UI 개발이 완료된 상태에서, 다음 단계로 대시보드 로직 연결 및 버그 트래커 개발 진행 상황을 공유했습니다. DB 연결부에서 사소한 접속 지연 이슈가 있음을 보고받았습니다.',
      decisions: '1. 수진의 DB 커넥션 지연 이슈는 blocker로 등록하여 집중 해결한다.\n2. 다인은 다음 회의 전까지 칸반 보드 UI 퍼블리싱을 완료하여 세연이 작업 상태 변경 로직을 붙일 수 있도록 지원한다.',
      actionItems: '1. 수진: Neon DB 프리 티어 커넥션 풀 속성 보완 (이슈 해소 추진)\n2. 세연: 버그 리포트 등록 폼 UI 개발 착수\n3. 다인: 반응형 사이드바 구현 완료',
    }
  ];

  for (const meet of meetingsData) {
    await prisma.meeting.create({ data: meet });
  }
  console.log(`✅ 회의록 데이터(${meetingsData.length}건) 생성 완료`);

  console.log('🎉 모든 초기 시딩 데이터가 데이터베이스에 성공적으로 들어갔습니다!');
}

main()
  .catch((e) => {
    console.error('❌ 시딩 중 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
