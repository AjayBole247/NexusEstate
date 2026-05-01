import Link from "next/link";
import { formatArea, formatPrice } from "@/lib/utils";
import { sampleProperties } from "@/lib/data";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

import { use } from 'react';

export default function PropertyDetailPage({ params }: Props) {
  const unwrappedParams = use(params);
  const property = sampleProperties.find((item) => item.id === unwrappedParams.id);

  if (!property) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
        <p className="text-slate-600">Property not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Property detail</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">{property.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{property.location}</p>
        </div>
        <Link href="/properties" className="text-sm font-semibold text-slate-700 transition hover:text-slate-950">
          Back to listings
        </Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="aspect-video rounded-3xl bg-slate-200 text-slate-500">Image placeholder</div>
          <div className="space-y-4">
            <p className="text-lg font-semibold text-slate-950">{formatPrice(property.price)}</p>
            <p className="text-sm text-slate-600">
              {formatArea(property.area)} • {property.beds ?? property.bedrooms} beds • {property.baths ?? property.bathrooms} baths
            </p>
            <p className="text-base leading-7 text-slate-700">{property.description}</p>
          </div>
        </section>
        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Quick info</h2>
            <dl className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <dt>Category</dt>
                <dd>{property.category}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <dt>Lease term</dt>
                <dd>{property.leaseTerm ?? "Flexible"}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <dt>Price</dt>
                <dd>{formatPrice(property.price)}</dd>
              </div>
            </dl>
          </div>
          <button className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Request viewing
          </button>
        </aside>
      </div>
    </main>
  );
}
