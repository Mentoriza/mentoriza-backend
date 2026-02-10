export const ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  ADVISOR: 'advisor',
  STUDENT: 'student',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: RoleName[] = [
  ROLES.ADMIN,
  ROLES.COORDINATOR,
  ROLES.ADVISOR,
  ROLES.STUDENT,
];

export const ROLE_LABELS: Record<RoleName, string> = {
  [ROLES.ADMIN]: 'Administrador do sistema',
  [ROLES.COORDINATOR]: 'Coordenador do curso',
  [ROLES.ADVISOR]: 'Orientador / Coorientador',
  [ROLES.STUDENT]: 'Aluno',
};
