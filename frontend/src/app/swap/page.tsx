import Link from "next/link";
import { sampleProperties } from "@/lib/data";
import PropertyCard from "@/components/properties/PropertyCard";

export default function SwapPage() {
  const swapProperties = sampleProperties.filter((property) => property.category === "Swap");

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
      <div className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Nomad Swap</p>
        <h1 className="text-4xl font-bold text-slate-950">Swap homes across cities</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Browse lease swap opportunities for remote workers and travelers looking to exchange city living without the hassle.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {swapProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Need help swapping?</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Connect with a local specialist, compare city neighborhoods, and select an ideal lease match with our guidance.
        </p>
        <Link href="/contact" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Contact a swap advisor
        </Link>
      </div>
    </main>
  );
}
