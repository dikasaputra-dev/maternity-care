import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-controls';
import { Card } from '@/components/ui/surface';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [passwordConfirmationError, setPasswordConfirmationError] = useState<string | undefined>();

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearErrors() {
    setCurrentPasswordError(undefined);
    setPasswordError(undefined);
    setPasswordConfirmationError(undefined);
    setFormError(null);
    setSuccessMessage(null);
  }

  function mapApiValidationError(error: ApiError) {
    const currentPasswordMessage = error.validationErrors.current_password?.[0];
    const passwordMessage = error.validationErrors.password?.[0];
    const passwordConfirmationMessage = error.validationErrors.password_confirmation?.[0];

    if (currentPasswordMessage) {
      setCurrentPasswordError(currentPasswordMessage);
    }

    if (passwordMessage) {
      setPasswordError(passwordMessage);
    }

    if (passwordConfirmationMessage) {
      setPasswordConfirmationError(passwordConfirmationMessage);
    }

    if (!currentPasswordMessage && !passwordMessage && !passwordConfirmationMessage) {
      setFormError(error.message);
    }
  }

  function validateForm() {
    let valid = true;

    if (!currentPassword) {
      setCurrentPasswordError('Password saat ini wajib diisi.');
      valid = false;
    }

    if (password.length < 8) {
      setPasswordError('Password baru minimal 8 karakter.');
      valid = false;
    }

    if (password !== passwordConfirmation) {
      setPasswordConfirmationError('Konfirmasi password tidak sesuai.');
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearErrors();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });

      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
      setSuccessMessage('Password berhasil diperbarui.');
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        mapApiValidationError(error);
      } else {
        setFormError(
          error instanceof Error
            ? error.message
            : 'Password gagal diperbarui. Silakan coba kembali.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    void navigate('/profile');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />
          Kembali ke Profil
        </button>

        <p className="mt-5 text-sm font-semibold text-brand-600">Keamanan Akun</p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Ganti password
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Gunakan password baru yang kuat dan tidak digunakan di layanan lain.
        </p>
      </section>

      <Card>
        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="space-y-5"
        >
          <Input
            label="Password Saat Ini"
            type="password"
            value={currentPassword}
            disabled={isSubmitting}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              setCurrentPasswordError(undefined);
              setFormError(null);
              setSuccessMessage(null);
            }}
            autoComplete="current-password"
            error={currentPasswordError}
          />

          <Input
            label="Password Baru"
            type="password"
            value={password}
            disabled={isSubmitting}
            onChange={(event) => {
              setPassword(event.target.value);
              setPasswordError(undefined);
              setFormError(null);
              setSuccessMessage(null);
            }}
            autoComplete="new-password"
            hint="Minimal 8 karakter."
            error={passwordError}
          />

          <Input
            label="Konfirmasi Password Baru"
            type="password"
            value={passwordConfirmation}
            disabled={isSubmitting}
            onChange={(event) => {
              setPasswordConfirmation(event.target.value);
              setPasswordConfirmationError(undefined);
              setFormError(null);
              setSuccessMessage(null);
            }}
            autoComplete="new-password"
            error={passwordConfirmationError}
          />

          {formError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          ) : null}

          {successMessage ? (
            <div
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {successMessage}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isSubmitting}
              leadingIcon={<KeyOutlinedIcon aria-hidden="true" fontSize="small" />}
            >
              Simpan Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
