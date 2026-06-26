import { Task, Bug, Member } from '../types';

// 시뮬레이션을 위한 기준 날짜 (2026년 6월 25일)
// 실제 개발 프로젝트의 타임라인에 맞춰 D-Day 및 마감 위험을 일관되게 보여주기 위해 고정된 기준일을 사용합니다.
export const STANDARD_DATE = '2026-06-25';

/**
 * 두 날짜 문자열(YYYY-MM-DD) 사이의 날짜 차이를 계산합니다.
 */
export function getDaysDifference(dateString1: string, dateString2: string): number {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);
  const differenceInTime = date2.getTime() - date1.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
}

/**
 * 마감 위험이 있는 작업(Risk Tasks) 목록을 필터링하여 반환합니다.
 * 위험 기준:
 * 1. 마감일이 지났는데 Done 상태가 아닌 작업 (Overdue)
 * 2. 마감일이 2일 이내로 남았는데(D-0, D-1, D-2) 아직 Backlog나 Todo인 작업 (Due Soon)
 * 3. 블로커(hasBlocker)가 등록되어 발이 묶인 작업 (Blocked)
 */
export function getRiskTasks(tasks: Task[], referenceDate: string = STANDARD_DATE): Task[] {
  return tasks.filter((task) => {
    if (task.status === 'Done') return false;

    // 1. 블로커 존재 여부
    if (task.hasBlocker) return true;

    const daysLeft = getDaysDifference(referenceDate, task.dueDate);

    // 2. 마감일 지남
    if (daysLeft < 0) return true;

    // 3. 마감 2일 이내이고 시작하지 않음 (Backlog, Todo)
    if (daysLeft <= 2 && (task.status === 'Backlog' || task.status === 'Todo')) {
      return true;
    }

    return false;
  });
}

/**
 * 프로젝트의 전체 완료도(진행률)를 계산합니다.
 * 완료도 = (Done 상태의 작업 개수 / 전체 작업 개수) * 100
 */
export function getProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completedTaskCount = tasks.filter((task) => task.status === 'Done').length;
  return Math.round((completedTaskCount / tasks.length) * 100);
}

/**
 * 대시보드 요약용 상태 통계를 계산합니다.
 */
export interface TaskStats {
  total: number;
  backlog: number;
  todo: number;
  inProgress: number;
  codeReview: number;
  testing: number;
  done: number;
  blocked: number;
  overdue: number;
}

export function getTaskStats(tasks: Task[], referenceDate: string = STANDARD_DATE): TaskStats {
  const stats: TaskStats = {
    total: tasks.length,
    backlog: 0,
    todo: 0,
    inProgress: 0,
    codeReview: 0,
    testing: 0,
    done: 0,
    blocked: 0,
    overdue: 0,
  };

  tasks.forEach((task) => {
    // 상태별 카운팅
    if (task.status === 'Backlog') stats.backlog++;
    else if (task.status === 'Todo') stats.todo++;
    else if (task.status === 'In Progress') stats.inProgress++;
    else if (task.status === 'Code Review') stats.codeReview++;
    else if (task.status === 'Testing') stats.testing++;
    else if (task.status === 'Done') stats.done++;

    // 블로커 카운팅
    if (task.hasBlocker && task.status !== 'Done') {
      stats.blocked++;
    }

    // 마감일 초과 카운팅 (완료되지 않은 상태에서 마감일이 지난 경우)
    if (task.status !== 'Done') {
      const daysLeft = getDaysDifference(referenceDate, task.dueDate);
      if (daysLeft < 0) {
        stats.overdue++;
      }
    }
  });

  return stats;
}

/**
 * 팀원별로 담당한 태스크 수, 완료한 태스크 수, 진행 중인 태스크 수 등의 현황을 취합합니다.
 */
export interface MemberStats {
  memberId: string;
  memberName: string;
  role: string;
  avatarColor: string;
  assignedCount: number;
  completedCount: number;
  inProgressCount: number; // In Progress, Code Review, Testing 포함
  progressPercent: number;
}

export function getMemberStats(members: Member[], tasks: Task[]): MemberStats[] {
  return members.map((member) => {
    const memberTasks = tasks.filter((task) => task.assigneeId === member.id);
    const assignedCount = memberTasks.length;
    const completedCount = memberTasks.filter((task) => task.status === 'Done').length;
    const inProgressCount = memberTasks.filter(
      (task) => task.status === 'In Progress' || task.status === 'Code Review' || task.status === 'Testing'
    ).length;

    const progressPercent = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;

    return {
      memberId: member.id,
      memberName: member.name,
      role: member.role,
      avatarColor: member.avatarColor,
      assignedCount,
      completedCount,
      inProgressCount,
      progressPercent,
    };
  });
}

/**
 * 버그 조치 상태 및 중요도 통계를 계산합니다.
 */
export interface BugStats {
  total: number;
  open: number;
  inProgress: number;
  fixed: number;
  closed: number;
  critical: number;
  major: number;
  minor: number;
}

export function getBugStats(bugs: Bug[]): BugStats {
  const stats: BugStats = {
    total: bugs.length,
    open: 0,
    inProgress: 0,
    fixed: 0,
    closed: 0,
    critical: 0,
    major: 0,
    minor: 0,
  };

  bugs.forEach((bug) => {
    // 상태별
    if (bug.status === 'Open') stats.open++;
    else if (bug.status === 'In Progress') stats.inProgress++;
    else if (bug.status === 'Fixed') stats.fixed++;
    else if (bug.status === 'Closed') stats.closed++;

    // 심각도별
    if (bug.severity === 'Critical') stats.critical++;
    else if (bug.severity === 'Major') stats.major++;
    else if (bug.severity === 'Minor') stats.minor++;
  });

  return stats;
}
