import type {
  AmnioticFluidColor,
  ContractionIntensity,
  CreateLaborMonitoringPayload,
  FetalHeadDescent,
  FetalMovement,
  LaborMonitoringFieldErrors,
  MembraneStatus,
  UrineAcetone,
  UrineProtein,
} from '@/features/labor-monitorings/types/labor-monitoring.types';

export interface LaborMonitoringCreateFormState {
  systolic_bp: string;
  diastolic_bp: string;
  pulse_rate: string;
  respiratory_rate: string;
  temperature_c: string;
  oxygen_saturation: string;

  fetal_heart_rate: string;
  fetal_movement: FetalMovement;

  contraction_frequency_per_10_minutes: string;
  contraction_duration_seconds: string;
  contraction_intensity: ContractionIntensity;

  cervical_dilation_cm: string;
  fetal_head_descent: FetalHeadDescent;

  membrane_status: MembraneStatus;
  membrane_rupture_at: string;
  amniotic_fluid_color: '' | AmnioticFluidColor;

  urine_volume_ml: string;
  urine_protein: UrineProtein;
  urine_acetone: UrineAcetone;

  notes: string;
}

export interface LaborMonitoringCreateValidationResult {
  payload: CreateLaborMonitoringPayload | null;
  fieldErrors: LaborMonitoringFieldErrors;
}

export const DEFAULT_LABOR_MONITORING_FORM_STATE: LaborMonitoringCreateFormState = {
  systolic_bp: '',
  diastolic_bp: '',
  pulse_rate: '',
  respiratory_rate: '',
  temperature_c: '',
  oxygen_saturation: '',

  fetal_heart_rate: '',
  fetal_movement: 'active',

  contraction_frequency_per_10_minutes: '',
  contraction_duration_seconds: '',
  contraction_intensity: 'moderate',

  cervical_dilation_cm: '',
  fetal_head_descent: 'not_assessed',

  membrane_status: 'intact',
  membrane_rupture_at: '',
  amniotic_fluid_color: '',

  urine_volume_ml: '',
  urine_protein: 'negative',
  urine_acetone: 'negative',

  notes: '',
};

function parseRequiredNumber(
  value: string,
  fieldName: keyof LaborMonitoringFieldErrors,
  label: string,
  errors: LaborMonitoringFieldErrors,
) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    errors[fieldName] = `${label} wajib diisi.`;
    return null;
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isFinite(parsedValue)) {
    errors[fieldName] = `${label} harus berupa angka.`;
    return null;
  }

  if (parsedValue < 0) {
    errors[fieldName] = `${label} tidak boleh bernilai negatif.`;
    return null;
  }

  return parsedValue;
}

function toIsoStringWithTimezone(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const pad = (number: number) => String(number).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absoluteOffsetMinutes / 60));
  const offsetRemainingMinutes = pad(absoluteOffsetMinutes % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:00${sign}${offsetHours}:${offsetRemainingMinutes}`;
}

export function validateLaborMonitoringCreateForm(
  formState: LaborMonitoringCreateFormState,
): LaborMonitoringCreateValidationResult {
  const fieldErrors: LaborMonitoringFieldErrors = {};

  const systolicBp = parseRequiredNumber(
    formState.systolic_bp,
    'systolic_bp',
    'Tekanan darah sistolik',
    fieldErrors,
  );
  const diastolicBp = parseRequiredNumber(
    formState.diastolic_bp,
    'diastolic_bp',
    'Tekanan darah diastolik',
    fieldErrors,
  );
  const pulseRate = parseRequiredNumber(formState.pulse_rate, 'pulse_rate', 'Nadi', fieldErrors);
  const respiratoryRate = parseRequiredNumber(
    formState.respiratory_rate,
    'respiratory_rate',
    'Frekuensi napas',
    fieldErrors,
  );
  const temperatureC = parseRequiredNumber(
    formState.temperature_c,
    'temperature_c',
    'Suhu',
    fieldErrors,
  );
  const oxygenSaturation = parseRequiredNumber(
    formState.oxygen_saturation,
    'oxygen_saturation',
    'Saturasi oksigen',
    fieldErrors,
  );

  const fetalHeartRate = parseRequiredNumber(
    formState.fetal_heart_rate,
    'fetal_heart_rate',
    'Denyut jantung janin',
    fieldErrors,
  );

  const contractionFrequency = parseRequiredNumber(
    formState.contraction_frequency_per_10_minutes,
    'contraction_frequency_per_10_minutes',
    'Frekuensi kontraksi',
    fieldErrors,
  );
  const contractionDuration = parseRequiredNumber(
    formState.contraction_duration_seconds,
    'contraction_duration_seconds',
    'Durasi kontraksi',
    fieldErrors,
  );

  const cervicalDilation = parseRequiredNumber(
    formState.cervical_dilation_cm,
    'cervical_dilation_cm',
    'Pembukaan serviks',
    fieldErrors,
  );

  const urineVolume = parseRequiredNumber(
    formState.urine_volume_ml,
    'urine_volume_ml',
    'Volume urine',
    fieldErrors,
  );

  let membraneRuptureAt: string | null = null;
  let amnioticFluidColor: AmnioticFluidColor | null = null;

  if (formState.membrane_status === 'ruptured') {
    if (!formState.membrane_rupture_at.trim()) {
      fieldErrors.membrane_rupture_at = 'Waktu pecah ketuban wajib diisi.';
    } else {
      membraneRuptureAt = toIsoStringWithTimezone(formState.membrane_rupture_at);
    }

    if (!formState.amniotic_fluid_color) {
      fieldErrors.amniotic_fluid_color = 'Warna ketuban wajib dipilih.';
    } else {
      amnioticFluidColor = formState.amniotic_fluid_color;
    }
  }

  const hasError = Object.keys(fieldErrors).length > 0;

  if (
    hasError ||
    systolicBp === null ||
    diastolicBp === null ||
    pulseRate === null ||
    respiratoryRate === null ||
    temperatureC === null ||
    oxygenSaturation === null ||
    fetalHeartRate === null ||
    contractionFrequency === null ||
    contractionDuration === null ||
    cervicalDilation === null ||
    urineVolume === null
  ) {
    return {
      payload: null,
      fieldErrors,
    };
  }

  return {
    fieldErrors,
    payload: {
      systolic_bp: systolicBp,
      diastolic_bp: diastolicBp,
      pulse_rate: pulseRate,
      respiratory_rate: respiratoryRate,
      temperature_c: temperatureC,
      oxygen_saturation: oxygenSaturation,

      fetal_heart_rate: fetalHeartRate,
      fetal_movement: formState.fetal_movement,

      contraction_frequency_per_10_minutes: contractionFrequency,
      contraction_duration_seconds: contractionDuration,
      contraction_intensity: formState.contraction_intensity,

      cervical_dilation_cm: cervicalDilation,
      fetal_head_descent: formState.fetal_head_descent,

      membrane_status: formState.membrane_status,
      membrane_rupture_at: membraneRuptureAt,
      amniotic_fluid_color: amnioticFluidColor,

      urine_volume_ml: urineVolume,
      urine_protein: formState.urine_protein,
      urine_acetone: formState.urine_acetone,

      notes: formState.notes.trim() || null,
    },
  };
}
