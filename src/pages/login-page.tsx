import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { resolvePostLoginPath } from '@/app/router/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-controls';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { AuthRole, AuthUser } from '@/features/auth/types/auth.types';
import { cn } from '@/lib/cn';
import { BrandLogo } from '@/components/brand/brand-logo';
import { CloseOutlined, WarningAmberOutlined } from '@mui/icons-material';

const NIM_PATTERN = /^\d{3}[A-Za-z]{2}\d{5}$/;

interface RedirectState {
  from?: string;
  message?: string;
}

export function LoginPage() {
  const { authNotice, clearAuthNotice, loginAsAdmin, loginAsNurse } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const redirectState = location.state as RedirectState | null;
  const sessionNotice = authNotice ?? redirectState?.message ?? null;

  const [dismissedNotice, setDismissedNotice] = useState<string | null>(null);

  const visibleNotice = sessionNotice && dismissedNotice !== sessionNotice ? sessionNotice : null;

  const [accountType, setAccountType] = useState<AuthRole>('nurse');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [identifierError, setIdentifierError] = useState<string | undefined>();

  const [passwordError, setPasswordError] = useState<string | undefined>();

  const [formError, setFormError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearLoginNotice() {
    if (sessionNotice) {
      setDismissedNotice(sessionNotice);
    }

    clearAuthNotice();
  }

  function resetErrors() {
    setIdentifierError(undefined);
    setPasswordError(undefined);
    setFormError(null);
    clearLoginNotice();
  }

  function changeAccountType(role: AuthRole) {
    if (isSubmitting) {
      return;
    }

    setAccountType(role);

    setIdentifier('');

    setPassword('');
    resetErrors();
  }

  function handleIdentifierChange(value: string) {
    setIdentifier(value);
    setIdentifierError(undefined);
    setFormError(null);
    clearLoginNotice();
  }

  function mapApiValidationError(error: ApiError) {
    const identifierField = accountType === 'nurse' ? 'nim' : 'email';

    const identifierMessage = error.validationErrors[identifierField]?.[0];

    const currentPasswordMessage = error.validationErrors.password?.[0];

    if (identifierMessage) {
      setIdentifierError(identifierMessage);
    }

    if (currentPasswordMessage) {
      setPasswordError(currentPasswordMessage);
    }

    if (!identifierMessage && !currentPasswordMessage) {
      setFormError(error.message);
    }
  }

  async function authenticateUser() {
    if (accountType === 'nurse') {
      return loginAsNurse({
        nim: identifier.trim(),
        password,
      });
    }

    return loginAsAdmin({
      email: identifier.trim(),
      password,
    });
  }

  async function redirectAuthenticatedUser(user: AuthUser) {
    const redirectState = location.state as RedirectState | null;

    const destination = resolvePostLoginPath(user, redirectState?.from);

    await navigate(destination, {
      replace: true,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    resetErrors();

    const normalizedIdentifier = identifier.trim();

    if (accountType === 'nurse' && !NIM_PATTERN.test(normalizedIdentifier)) {
      setIdentifierError('NIM harus menggunakan format 3 angka, 2 huruf, dan 5 angka.');

      return;
    }

    if (!normalizedIdentifier) {
      setIdentifierError(accountType === 'nurse' ? 'NIM wajib diisi.' : 'Email wajib diisi.');

      return;
    }

    if (!password) {
      setPasswordError('Password wajib diisi.');

      return;
    }

    setIsSubmitting(true);

    try {
      const authenticatedUser = await authenticateUser();

      await redirectAuthenticatedUser(authenticatedUser);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        mapApiValidationError(error);
      } else {
        setFormError(error instanceof Error ? error.message : 'Login gagal. Silakan coba kembali.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.8fr)]">
      <section className="hidden bg-linear-to-br from-brand-50 via-white to-brand-100 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo decorative className="h-12 w-12 shrink-0" />

          <div>
            <p className="font-semibold text-slate-950">MaternityCare</p>

            <p className="text-sm text-brand-700">Universitas Bhakti Kencana</p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Maternal Risk Navigator
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Early Screening and Risk Detection for Maternal Care
          </h1>

          <div aria-hidden="true" className="mt-5 h-14 max-w-lg" />
        </div>

        <div aria-hidden="true" className="h-5" />
      </section>

      <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-400 to-brand-300 text-brand-950 shadow-sm">
              <HealthAndSafetyOutlinedIcon aria-hidden="true" />
            </span>

            <p className="mt-3 font-semibold text-slate-950">MaternityCare</p>
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="text-sm font-semibold text-brand-600">Selamat datang</p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Masuk ke akun
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Pilih jenis akun yang sesuai sebelum memasukkan informasi login.
            </p>
          </div>

          {visibleNotice ? (
            <div
              role="alert"
              className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <WarningAmberOutlined
                aria-hidden="true"
                fontSize="small"
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-900">Sesi berakhir</p>

                <p className="mt-1 leading-6">{visibleNotice}</p>
              </div>

              <button
                type="button"
                aria-label="Tutup pemberitahuan sesi"
                onClick={clearLoginNotice}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-amber-700 transition hover:bg-amber-100 hover:text-amber-900"
              >
                <CloseOutlined aria-hidden="true" fontSize="small" />
              </button>
            </div>
          ) : null}

          <div
            role="tablist"
            aria-label="Jenis akun"
            className="mt-7 grid grid-cols-2 rounded-xl bg-brand-50 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={accountType === 'nurse'}
              disabled={isSubmitting}
              onClick={() => changeAccountType('nurse')}
              className={cn(
                'flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-60',
                accountType === 'nurse'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-brand-700',
              )}
            >
              <BadgeOutlinedIcon aria-hidden="true" fontSize="small" />
              Nurse
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={accountType === 'admin'}
              disabled={isSubmitting}
              onClick={() => changeAccountType('admin')}
              className={cn(
                'flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-60',
                accountType === 'admin'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-brand-700',
              )}
            >
              <EmailOutlinedIcon aria-hidden="true" fontSize="small" />
              Admin
            </button>
          </div>

          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            className="mt-6 space-y-5"
          >
            <Input
              label={accountType === 'nurse' ? 'NIM' : 'Email'}
              type={accountType === 'nurse' ? 'text' : 'email'}
              value={identifier}
              disabled={isSubmitting}
              onChange={(event) => handleIdentifierChange(event.target.value)}
              placeholder={
                accountType === 'nurse' ? 'Contoh: 251FK05002' : 'Contoh: admin@example.com'
              }
              autoComplete="username"
              error={identifierError}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              disabled={isSubmitting}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError(undefined);
                setFormError(null);
                clearLoginNotice();
              }}
              placeholder="Masukkan password"
              autoComplete="current-password"
              error={passwordError}
            />

            {formError ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {formError}
              </div>
            ) : null}

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Masuk
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
