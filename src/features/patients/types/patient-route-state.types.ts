export interface PatientListRouteState {
  shouldRefreshPatients?: boolean;
  flashMessage?: string;
}

export interface PatientDetailRouteState {
  fromCreate?: boolean;
  flashMessage?: string;
}
