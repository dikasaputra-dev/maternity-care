export function formatPatientDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatLatestScreening(value: string | null) {
  if (!value) {
    return 'Belum ada';
  }

  return formatPatientDateTime(value);
}

export function formatPatientAge(value: number) {
  return `${value} tahun`;
}

export function formatNullableNumber(value: number | null) {
  return value === null ? '-' : value.toString();
}

export function formatGestationalAge(value: number | null) {
  return value === null ? '-' : `${value} minggu`;
}

export function formatBloodPressure(value: string | null) {
  return value ?? '-';
}

export function formatFetalWeight(value: number | null) {
  if (value === null) {
    return '-';
  }

  return `${value.toLocaleString('id-ID')} gram`;
}
