export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',

  PROFILE_VIEW: 'profile.view',
  PROFILE_CHANGE_PASSWORD: 'profile.change-password',

  PATIENTS_LIST: 'patients.list',
  PATIENTS_VIEW: 'patients.view',
  PATIENTS_CREATE: 'patients.create',
  PATIENTS_UPDATE: 'patients.update',
  PATIENTS_DELETE: 'patients.delete',

  SCREENINGS_LIST: 'screenings.list',
  SCREENINGS_VIEW: 'screenings.view',
  SCREENINGS_CREATE: 'screenings.create',
  SCREENINGS_UPDATE: 'screenings.update',
  SCREENINGS_DELETE: 'screenings.delete',

  MONITORING_LIST: 'monitoring.list',
  MONITORING_VIEW: 'monitoring.view',
  MONITORING_CREATE: 'monitoring.create',
  MONITORING_UPDATE: 'monitoring.update',
  MONITORING_DELETE: 'monitoring.delete',

  HISTORY_VIEW_OWN: 'history.view-own',
  HISTORY_VIEW_ALL: 'history.view-all',

  REPORTS_VIEW: 'reports.view',
  REPORTS_PRINT: 'reports.print',
  REPORTS_EXPORT: 'reports.export',

  STUDENTS_LIST: 'students.list',
  STUDENTS_VIEW: 'students.view',
  STUDENTS_CREATE: 'students.create',
  STUDENTS_UPDATE: 'students.update',
  STUDENTS_CHANGE_STATUS: 'students.change-status',
  STUDENTS_RESET_PASSWORD: 'students.reset-password',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export function isPermission(value: unknown): value is Permission {
  return typeof value === 'string' && ALL_PERMISSIONS.includes(value as Permission);
}
