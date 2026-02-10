export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  // PENDING: 'pending',
  // SUSPENDED: 'suspended',
  // BLOCKED: 'blocked',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const ALL_USER_STATUSES: UserStatus[] = [
  USER_STATUS.ACTIVE,
  USER_STATUS.INACTIVE,
  // USER_STATUS.PENDING,
  // USER_STATUS.SUSPENDED,
  // USER_STATUS.BLOCKED,
];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [USER_STATUS.ACTIVE]: 'Ativo',
  [USER_STATUS.INACTIVE]: 'Inativo',
  // [USER_STATUS.PENDING]: 'Pendente',
  // [USER_STATUS.SUSPENDED]: 'Suspenso',
  // [USER_STATUS.BLOCKED]: 'Bloqueado',
};

export const ALLOWED_LOGIN_STATUSES: UserStatus[] = [
  USER_STATUS.ACTIVE,
  // USER_STATUS.PENDING,
];
