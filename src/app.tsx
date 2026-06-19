export function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-teal-700">MaternityCare</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Fondasi project berhasil disiapkan
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          React, TypeScript, Vite, Tailwind CSS, ESLint, Prettier, dan alias import sudah siap
          digunakan.
        </p>

        <div className="mt-8 border-l-4 border-teal-600 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm font-medium text-slate-800">
            Phase 0 — Project Initialization + Clean Foundation
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Belum ada fitur autentikasi atau fitur klinis pada tahap ini.
          </p>
        </div>
      </section>
    </main>
  );
}
