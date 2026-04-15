"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/data";
import PropertyCard from "@/components/properties/PropertyCard";
import FilterSidebar, { FilterState, defaultFilters } from "@/components/properties/FilterSidebar";

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "area-asc", label: "Area: Low to High" },
];

export default function PropertiesPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState("relevance");
  const [searchQ, setSearchQ] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let props = [...MOCK_PROPERTIES];

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

    if (sort === "price-asc") {
      props.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      props.sort((a, b) => b.price - a.price);
    } else if (sort === "area-asc") {
      props.sort((a, b) => a.area - b.area);
    }

    return props;
  }, [filters, sort, searchQ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search locality, project, society..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-nexus-400 focus:ring-2 focus:ring-nexus-50 outline-none text-sm"
              />
            </div>

            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="hidden sm:block px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-nexus-400 outline-none bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="hidden sm:flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-nexus-600"
                    : "text-gray-500"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-nexus-600"
                    : "text-gray-500"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display text-xl font-bold text-gray-900">
                  Properties for Sale
                  {filters.city && (
                    <span className="text-nexus-600"> in {filters.city}</span>
                  )}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">{filtered.length} properties found</p>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-700 font-semibold mb-2">No properties found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="mt-4 nexus-btn-primary text-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "flex flex-col gap-4"
                }
              >
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
