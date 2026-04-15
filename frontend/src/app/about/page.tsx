export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">About us</p>
        <h1 className="text-4xl font-bold text-slate-950">A modern platform for property search and swaps</h1>
        <p className="text-lg leading-8 text-slate-600">
          NexusEstate brings buyers, renters, sellers, and urban nomads together in one trusted marketplace. Our goal is to help every user find the right home, publish a listing quickly, and explore lease swap opportunities with confidence.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Mission</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Make modern real estate discovery accessible through smarter search, better market transparency, and seamless customer support.
          </p>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Vision</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Build the leading digital destination for home seekers, listing professionals, and city swap travelers across every major destination.
          </p>
        </section>
      </div>
    </main>
  );
}
