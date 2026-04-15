export default function AuthPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <div className="mb-10 space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Authentication</p>
        <h1 className="text-4xl font-bold text-slate-950">Login, register, or use Google</h1>
        <p className="text-base leading-7 text-slate-600">
          Access your account with OTP verification or sign in quickly using Google OAuth.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">OTP login</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Enter your phone number to receive a one-time passcode.</p>
          <label className="mt-6 block text-sm font-medium text-slate-700">
            Phone number
            <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" placeholder="+1 555 0100" />
          </label>
          <button className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Send OTP
          </button>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Google sign-in</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Use your Google account for a fast and secure login experience.</p>
          <button className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50">
            Continue with Google
          </button>
        </section>
      </div>
    </main>
  );
}
