export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <div className="mb-10 space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Contact</p>
        <h1 className="text-4xl font-bold text-slate-950">Let's help you find the right home</h1>
        <p className="text-base leading-7 text-slate-600">
          Reach out for property inquiries, swap support, or personalized recommendations from our local team.
        </p>
      </div>
      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-3 text-sm text-slate-700">
            Name
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" placeholder="Your name" />
          </label>
          <label className="space-y-3 text-sm text-slate-700">
            Email
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" placeholder="you@example.com" />
          </label>
        </div>
        <label className="space-y-3 text-sm text-slate-700">
          Message
          <textarea rows={6} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" placeholder="Tell us what you need" />
        </label>
        <button className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Send message
        </button>
      </form>
    </main>
  );
}
