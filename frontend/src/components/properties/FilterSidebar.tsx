"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { INDIAN_CITIES } from "@/lib/data";

interface FilterState {
  city: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string[];
  status: string;
  minArea: number;
  maxArea: number;
  amenities: string[];
  facing: string;
  postedBy: string;
}

const defaultFilters: FilterState = {
  city: "",
  type: "",
  minPrice: 0,
  maxPrice: 100000000,
  bedrooms: [],
  status: "",
  minArea: 0,
  maxArea: 10000,
  amenities: [],
  facing: "",
  postedBy: "",
};

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && children}
    </div>
  );
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const update = (key: keyof FilterState, value: any) =>
    onChange({ ...filters, [key]: value });

  const toggleBedroom = (val: string) => {
    const beds = filters.bedrooms.includes(val)
      ? filters.bedrooms.filter((b) => b !== val)
      : [...filters.bedrooms, val];
    update("bedrooms", beds);
  };

  const toggleAmenity = (val: string) => {
    const ams = filters.amenities.includes(val)
      ? filters.amenities.filter((a) => a !== val)
      : [...filters.amenities, val];
    update("amenities", ams);
  };

  const priceOptions = [
    { label: "Under ₹50L", min: 0, max: 5000000 },
    { label: "₹50L - ₹1Cr", min: 5000000, max: 10000000 },
    { label: "₹1Cr - ₹2Cr", min: 10000000, max: 20000000 },
    { label: "₹2Cr - ₹5Cr", min: 20000000, max: 50000000 },
    { label: "Above ₹5Cr", min: 50000000, max: 100000000 },
  ];

  const content = (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-nexus-600" />
          <h3 className="font-display font-bold text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="text-nexus-600 text-sm font-medium hover:underline"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <FilterSection title="City">
        <select
          value={filters.city}
          onChange={(e) => update("city", e.target.value)}
          className="w-full input-nexus text-sm"
        >
          <option value="">All India</option>
          {INDIAN_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Property Type">
        <div className="flex flex-wrap gap-2">
          {[
            "Apartment",
            "Villa",
            "Builder Floor",
            "Plot",
            "Commercial",
          ].map((type) => (
            <button
              key={type}
              onClick={() =>
                update(
                  "type",
                  filters.type === type.toLowerCase().replace(" ", "-")
                    ? ""
                    : type.toLowerCase().replace(" ", "-")
                )
              }
              className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                filters.type === type.toLowerCase().replace(" ", "-")
                  ? "bg-nexus-600 border-nexus-600 text-white"
                  : "border-gray-200 text-gray-600 hover:border-nexus-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="BHK / Bedrooms">
        <div className="flex gap-2 flex-wrap">
          {["1", "2", "3", "4", "5+"].map((b) => (
            <button
              key={b}
              onClick={() => toggleBedroom(b)}
              className={`w-12 h-10 rounded-xl border text-sm font-medium transition-all ${
                filters.bedrooms.includes(b)
                  ? "bg-nexus-600 border-nexus-600 text-white"
                  : "border-gray-200 text-gray-600 hover:border-nexus-300"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Budget">
        <div className="space-y-2">
          {priceOptions.map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={
                  filters.minPrice === opt.min && filters.maxPrice === opt.max
                }
                onChange={() => {
                  update("minPrice", opt.min);
                  update("maxPrice", opt.max);
                }}
                className="accent-nexus-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-nexus-600 transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Possession Status">
        <div className="space-y-2">
          {[
            { value: "", label: "All" },
            { value: "ready-to-move", label: "Ready to Move" },
            { value: "under-construction", label: "Under Construction" },
            { value: "new-launch", label: "New Launch" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="status"
                checked={filters.status === opt.value}
                onChange={() => update("status", opt.value)}
                className="accent-nexus-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-nexus-600 transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Amenities" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {[
            "Swimming Pool",
            "Gym",
            "Parking",
            "Security",
            "Clubhouse",
            "Garden",
            "Lift",
            "Power Backup",
            "CCTV",
            "Intercom",
          ].map((am) => (
            <button
              key={am}
              onClick={() => toggleAmenity(am)}
              className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                filters.amenities.includes(am)
                  ? "bg-nexus-50 border-nexus-400 text-nexus-700"
                  : "border-gray-200 text-gray-600 hover:border-nexus-300"
              }`}
            >
              {am}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Posted By" defaultOpen={false}>
        <div className="space-y-2">
          {["All", "Builder", "Owner", "Agent"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="postedBy"
                checked={filters.postedBy === (opt === "All" ? "" : opt.toLowerCase())}
                onChange={() =>
                  update("postedBy", opt === "All" ? "" : opt.toLowerCase())
                }
                className="accent-nexus-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-nexus-600 transition-colors">
                {opt}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-24">
          {content}
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative w-80 bg-white h-full ml-auto overflow-y-auto shadow-2xl animate-slide-in-right">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export type { FilterState };
export { defaultFilters };
export default FilterSidebar;
