"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { formatArea, formatPrice } from "@/lib/utils";
import { MOCK_PROPERTIES } from "@/lib/data";
import { PropertyDetailData } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { Bookmark, MessageSquare } from "lucide-react";

import AiValuationBadge from "@/components/properties/AiValuationBadge";
import PriceComparisonChart from "@/components/properties/PriceComparisonChart";
import DesirabilityMeter from "@/components/properties/DesirabilityMeter";
import AiDashboardSkeleton from "@/components/properties/AiDashboardSkeleton";
import AiOfflineFallback from "@/components/properties/AiOfflineFallback";
import NegotiationRoom from "@/components/NegotiationRoom";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// Simulated mock data from the backend
const mockAiResponse: PropertyDetailData["ai_insights"] = {
  status: "success",
  predicted_price: 19200000,
  desirability_score: 88,
  fraud_flag: false,
  similar_properties: [
    { id: "prop_89", title: "Omaxe Heights", match_score: "94%" },
    { id: "prop_12", title: "DLF Phase 3", match_score: "89%" }
  ]
};

export default function PropertyDetailPage({ params }: Props) {
  const unwrappedParams = use(params);
  const property = MOCK_PROPERTIES.find((item) => item.id === unwrappedParams.id);

  const [aiLoading, setAiLoading] = useState(true);
  const [aiData, setAiData] = useState<PropertyDetailData["ai_insights"] | null>(null);
  const [showNegotiation, setShowNegotiation] = useState(false);

  const { wishlist, toggleWishlist } = useAppStore();
  const isSaved = property ? wishlist.includes(property.id) : false;

  useEffect(() => {
    // Simulate network delay for AI service
    const timer = setTimeout(() => {
      setAiData(mockAiResponse);
      setAiLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        <div className="space-y-8">
          {/* Main Property Info */}
          <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="aspect-video rounded-3xl bg-slate-200 overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">Image placeholder</div>
              )}
            </div>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-slate-950">{formatPrice(property.price)}</p>
              <p className="text-sm text-slate-600">
                {formatArea(property.area)} • {property.bedrooms ?? property.beds} beds • {property.bathrooms ?? property.baths} baths
              </p>
              {property.description && (
                <p className="text-base leading-7 text-slate-700">{property.description}</p>
              )}
            </div>
          </section>

          {/* AI Valuation Dashboard */}
          <section className="space-y-6 rounded-3xl border border-nexus-200 bg-white p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nexus-400 to-nexus-600"></div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              ✨ AI Valuation Dashboard
            </h2>

            {aiLoading ? (
              <AiDashboardSkeleton />
            ) : aiData?.status === "success" ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">AI Predicted Price</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatPrice(aiData.predicted_price)}</p>
                  </div>
                  <AiValuationBadge askingPrice={property.price} predictedPrice={aiData.predicted_price} />
                </div>

                <div className="grid gap-8 sm:grid-cols-2 pt-6 border-t border-slate-100">
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Price Comparison</h3>
                    <PriceComparisonChart askingPrice={property.price} predictedPrice={aiData.predicted_price} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2 text-center">Desirability Score</h3>
                    <DesirabilityMeter score={aiData.desirability_score} />
                  </div>
                </div>
                
                {aiData.similar_properties && aiData.similar_properties.length > 0 && (
                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Similar Properties (AI Matched)</h3>
                    <div className="flex flex-wrap gap-2">
                      {aiData.similar_properties.map((sim) => (
                        <span key={sim.id} className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                          {sim.title} <span className="ml-2 text-nexus-600">{sim.match_score} Match</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <AiOfflineFallback />
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Quick info</h2>
            <dl className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <dt>Category</dt>
                <dd>{property.category}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <dt>Status</dt>
                <dd className="capitalize">{property.status?.replace("-", " ")}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <dt>Asking Price</dt>
                <dd className="font-semibold text-slate-900">{formatPrice(property.price)}</dd>
              </div>
            </dl>
            
            <div className="mt-8 space-y-3">
              <button 
                onClick={() => setShowNegotiation(true)}
                className="w-full rounded-2xl bg-nexus-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-nexus-700 flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Propose Swap / Negotiate
              </button>
              <button 
                onClick={() => toggleWishlist(property.id)}
                className={`w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition flex items-center justify-center gap-2 border ${
                  isSaved 
                    ? "bg-slate-50 text-slate-900 border-slate-300 hover:bg-slate-100" 
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-slate-900" : ""}`} />
                {isSaved ? "Saved to Watchlist" : "Save to Arbitrage Watchlist"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {showNegotiation && (
        <NegotiationRoom 
          roomId={`room_${property.id}`} 
          userId="user_123" // Mock user ID for now
          onClose={() => setShowNegotiation(false)} 
        />
      )}
    </main>
  );
}
