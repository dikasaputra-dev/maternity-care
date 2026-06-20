import axios from 'axios';

export type ValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number | null;
  readonly validationErrors: ValidationErrors;

  constructor(
    message: string,
    status: number | null = null,
    validationErrors: ValidationErrors = {},
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readMessage(value: unknown) {
  if (!isRecord(value) || typeof value.message !== 'string') {
    return null;
  }

  return value.message;
}

function readValidationErrors(value: unknown): ValidationErrors {
  if (!isRecord(value) || !isRecord(value.errors)) {
    return {};
  }

  const validationErrors: ValidationErrors = {};

  for (const [field, messages] of Object.entries(value.errors)) {
    if (Array.isArray(messages) && messages.every((message) => typeof message === 'string')) {
      validationErrors[field] = messages;
    }
  }

  return validationErrors;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<unknown>(error)) {
    const responseData: unknown = error.response?.data;
    const status = error.response?.status ?? null;

    const message =
      readMessage(responseData) ??
      (error.code === 'ECONNABORTED'
        ? 'Permintaan terlalu lama. Silakan coba kembali.'
        : 'Tidak dapat terhubung ke server.');

    return new ApiError(message, status, readValidationErrors(responseData));
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('Terjadi kesalahan yang tidak diketahui.');
}
