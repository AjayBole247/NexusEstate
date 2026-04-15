export default function SellPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
      <div className="mb-10 space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Sell your property</p>
        <h1 className="text-4xl font-bold text-slate-950">List your property in a few steps</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Submit your property details, choose a plan, and let buyers discover your listing faster.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Property details", description: "Share the address, photos, and pricing." },
          { title: "Verification", description: "Verify ownership and quality with guided support." },
          { title: "Go live", description: "Publish your listing and start receiving buyer requests." },
        ].map((step) => (
          <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-12 w-12 rounded-3xl bg-slate-950 text-white grid place-items-center font-semibold">
              {step.title.charAt(0)}
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-950">{step.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>
      <form className="mt-12 space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Start your listing</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-3 text-sm text-slate-700">
            Property title
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" placeholder="Elegant townhouse" />
          </label>
          <label className="space-y-3 text-sm text-slate-700">
            Location
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" placeholder="City, state" />
          </label>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <label className="space-y-3 text-sm text-slate-700">
            Price
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" placeholder="$1,250,000" />
          </label>
          <label className="space-y-3 text-sm text-slate-700">
            Bedrooms
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" placeholder="3" />
          </label>
          <label className="space-y-3 text-sm text-slate-700">
            Bathrooms
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" placeholder="2" />
          </label>
        </div>
        <button className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Continue listing
        </button>
      </form>
    </main>
  );
}
