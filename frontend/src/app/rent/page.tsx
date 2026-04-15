"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { MOCK_RENT_PROPERTIES } from "@/lib/data";
import PropertyCard from "@/components/properties/PropertyCard";
import FilterSidebar, { FilterState, defaultFilters } from "@/components/properties/FilterSidebar";
import ArticlesSection from "@/components/home/ArticlesSection";

export default function RentPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const filtered = useMemo(() => {
    let props = [...MOCK_RENT_PROPERTIES];

    if (filters.city) {
      props = props.filter((p) =>
        p.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.type) {
      props = props.filter((p) => p.type === filters.type);
    }

    if (filters.status) {
      props = props.filter((p) => p.status === filters.status);
    }

    if (filters.bedrooms.length > 0) {
      props = props.filter((p) =>
        filters.bedrooms.some((b) =>
          b === "5+"
            ? (p.bedrooms ?? 0) >= 5
            : p.bedrooms === parseInt(b)
        )
      );
    }

    props = props.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    if (searchQ) {
      props = props.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQ.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQ.toLowerCase())
      );
    }

    return props;
  }, [filters, searchQ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-r from-emerald-900 to-teal-800 py-16">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Find a Home to Rent</h1>
          <p className="text-emerald-200 mb-8">Discover apartments, villas, PG & co-living spaces across India</p>
          <div className="max-w-xl mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search locality, society..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 outline-none text-sm"
              />
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900">Properties for Rent</h2>
                <p className="text-gray-500 text-sm">{filtered.length} listings available</p>
              </div>
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} isRent />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ArticlesSection
        title="Best Renting Advice by Our Top Editors"
        subtitle="Read from Beginners checklist to Pro Tips"
        mode="rent"
      />
    </div>
  );
}
