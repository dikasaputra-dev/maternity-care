export function AuthLoadingScreen() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-surface px-5"
    >
      <div className="text-center">
        <span
          aria-hidden="true"
          className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"
        />

        <p className="mt-4 text-sm font-medium text-slate-700">Memeriksa sesi pengguna...</p>

        <p className="mt-1 text-sm text-slate-500">Mohon tunggu sebentar.</p>
      </div>
    </main>
  );
}
