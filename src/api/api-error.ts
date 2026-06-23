export type ApiValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  status?: number;
  errors: ApiValidationErrors;
  validationErrors: ApiValidationErrors;

  constructor(
    message: string,
    options?: {
      status?: number;
      errors?: ApiValidationErrors;
    },
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = options?.status;
    this.errors = options?.errors ?? {};
    this.validationErrors = this.errors;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseValidationErrors(value: unknown): ApiValidationErrors | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const errors: ApiValidationErrors = {};

  for (const [field, messages] of Object.entries(value)) {
    if (!Array.isArray(messages)) {
      continue;
    }

    const validMessages = messages.filter(
      (message): message is string => typeof message === 'string',
    );

    if (validMessages.length > 0) {
      errors[field] = validMessages;
    }
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (!isRecord(error)) {
    return new ApiError('Terjadi kesalahan yang tidak diketahui.');
  }

  const response = error.response;

  if (!isRecord(response)) {
    return new ApiError('Terjadi kesalahan jaringan.');
  }

  const status = typeof response.status === 'number' ? response.status : undefined;

  const data = response.data;

  if (!isRecord(data)) {
    return new ApiError('Terjadi kesalahan dari server.', {
      status,
    });
  }

  const message =
    typeof data.message === 'string' ? data.message : 'Terjadi kesalahan dari server.';

  return new ApiError(message, {
    status,
    errors: parseValidationErrors(data.errors),
  });
}
