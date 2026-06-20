import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-controls';
import { AuthLoadingScreen } from '@/features/auth/components/auth-loading-screen';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { AuthRole } from '@/features/auth/types/auth.types';
import { cn } from '@/lib/cn';
import { BrandLogo } from '@/components/brand/brand-logo';

const NIM_PATTERN = /^\d{3}[A-Z]{2}\d{5}$/;

interface RedirectState {
  from?: string;
}

export function LoginPage() {
  const { isAuthenticated, isInitializing, loginAsAdmin, loginAsNurse } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<AuthRole>('nurse');
  const [identifier, setIdentifier] = useState('251FK05002');
  const [password, setPassword] = useState('password');
  const [identifierError, setIdentifierError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function changeAccountType(role: AuthRole) {
    setAccountType(role);
    setIdentifier(role === 'nurse' ? '251FK05002' : 'admin@example.com');
    setPassword('password');
    setIdentifierError(undefined);
    setPasswordError(undefined);
    setFormError(null);
  }

  function handleIdentifierChange(value: string) {
    const normalizedValue = accountType === 'nurse' ? value.toUpperCase() : value;

    setIdentifier(normalizedValue);
    setIdentifierError(undefined);
    setFormError(null);
  }

  function mapApiValidationError(error: ApiError) {
    const identifierField = accountType === 'nurse' ? 'nim' : 'email';

    const identifierMessage = error.validationErrors[identifierField]?.[0];

    const passwordMessage = error.validationErrors.password?.[0];

    if (identifierMessage) {
      setIdentifierError(identifierMessage);
    }

    if (passwordMessage) {
      setPasswordError(passwordMessage);
    }

    if (!identifierMessage && !passwordMessage) {
      setFormError(error.message);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIdentifierError(undefined);
    setPasswordError(undefined);
    setFormError(null);

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
      if (accountType === 'nurse') {
        await loginAsNurse({
          nim: normalizedIdentifier,
          password,
        });
      } else {
        await loginAsAdmin({
          email: normalizedIdentifier,
          password,
        });
      }

      const redirectState = location.state as RedirectState | null;

      await navigate(redirectState?.from ?? '/dashboard', {
        replace: true,
      });
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
        <div className="flex items-center gap-2">
          <BrandLogo className="h-14 w-14" />

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
            Early Screenimg and Risk Detection for Maternal Care
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
            Hak akses setiap pengguna mengikuti role dan permission yang diberikan oleh backend.
          </p>
        </div>

        <p className="text-sm text-slate-500">Authentication and RBAC</p>
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

          <div
            role="tablist"
            aria-label="Jenis akun"
            className="mt-7 grid grid-cols-2 rounded-xl bg-brand-50 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={accountType === 'nurse'}
              onClick={() => changeAccountType('nurse')}
              className={cn(
                'flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors',
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
              onClick={() => changeAccountType('admin')}
              className={cn(
                'flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors',
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
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError(undefined);
                setFormError(null);
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

          {import.meta.env.VITE_AUTH_MODE !== 'api' ? (
            <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
              <p className="text-sm font-semibold text-slate-800">Akun preview</p>

              {accountType === 'nurse' ? (
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <p>NIM: 251FK05002</p>
                  <p>Password: password</p>
                </div>
              ) : (
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <p>Email: admin@example.com</p>
                  <p>Password: password</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
