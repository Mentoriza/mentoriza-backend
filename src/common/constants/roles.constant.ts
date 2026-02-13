export const ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  ADVISOR: 'advisor',
  STUDENT: 'student',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: RoleName[] = Object.values(ROLES);

export const ROLE_LABELS: Record<RoleName, string> = {
  [ROLES.ADMIN]: 'Administrador do sistema',
  [ROLES.COORDINATOR]: 'Coordenador do curso',
  [ROLES.ADVISOR]: 'Orientador / Coorientador',
  [ROLES.STUDENT]: 'Aluno',
};

export const PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage-roles',

  STUDENT_CREATE: 'student:create',
  STUDENT_READ: 'student:read',
  STUDENT_UPDATE: 'student:update',
  STUDENT_DELETE: 'student:delete',
  STUDENT_LINK_GROUP: 'student:link-group',

  GROUP_CREATE: 'group:create',
  GROUP_READ: 'group:read',
  GROUP_UPDATE: 'group:update',
  GROUP_PUBLISH: 'group:publish',
  GROUP_DELETE: 'group:delete',

  REPORT_SUBMIT: 'report:submit',
  REPORT_REVIEW: 'report:review',
  REPORT_APPROVE: 'report:approve',
  REPORT_REJECT: 'report:reject',
  REPORT_READ_ALL: 'report:read-all',

  SUBMISSION_MANAGE: 'submission:manage',
  INDICATOR_MANAGE: 'indicator:manage',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionName[] = Object.values(PERMISSIONS);
