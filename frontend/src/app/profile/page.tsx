"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { User as UserIcon, Building2, ArrowRightLeft, Activity, Mail, Star, Edit3, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAppStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<any[]>([]);
  const [swaps, setSwaps] = useState<any[]>([]);
  
  // Wait until hydration to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user?.id) {
      fetch(`http://localhost:3001/api/properties/user/${user.id}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setProperties(data) })
        .catch(console.error);

      fetch(`http://localhost:3001/api/swaps/user/${user.id}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setSwaps(data) })
        .catch(console.error);
    }
  }, [user]);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <UserIcon size={48} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Not Logged In</h2>
        <p className="text-slate-500 mb-6">Please log in to view your profile.</p>
        <Link href="/auth" className="nexus-btn-primary px-6 py-2">
          Go to Login
        </Link>
      </div>
    );
  }

  // Using Real DB Data instead of mocks

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Profile Header Block */}
      <div className="bg-white border-b border-gray-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-nexus-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-nexus-600/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{user?.name || 'Nexus User'}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><Mail size={16} /> {(user as any)?.email || "user@example.com"}</span>
                <span className="flex items-center gap-1.5"><UserIcon size={16} /> Role: <strong className="text-nexus-600">{(user as any)?.role || "Nomad"}</strong></span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium">
                <Edit3 size={16} /> Edit Profile
              </button>
              <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium">
                <Settings size={16} /> Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
              {[
                { id: "overview", label: "Activity Overview", icon: Activity },
                { id: "properties", label: "My Properties", icon: Building2 },
                { id: "swaps", label: "Lease Swaps", icon: ArrowRightLeft },
                { id: "saved", label: "Saved Listings", icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-nexus-50 text-nexus-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium mb-1">Active Properties</p>
                    <p className="text-3xl font-bold text-slate-900">{properties.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium mb-1">Ongoing Swaps</p>
                    <p className="text-3xl font-bold text-slate-900">{swaps.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium mb-1">Saved Listings</p>
                    <p className="text-3xl font-bold text-slate-900">0</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 pb-4 border-b border-gray-50">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <ArrowRightLeft size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Joined a 3-way Swap Loop</p>
                        <p className="text-xs text-slate-500 mt-1">Waiting for other parties to commit in the Negotiation Room.</p>
                        <span className="text-xs font-semibold text-blue-600 mt-2 inline-block bg-blue-50 px-2 py-1 rounded">2 hours ago</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Property valuation updated</p>
                        <p className="text-xs text-slate-500 mt-1">AI reassessed "Downtown Luxury Loft" at a +12% premium.</p>
                        <span className="text-xs font-semibold text-emerald-600 mt-2 inline-block bg-emerald-50 px-2 py-1 rounded">Yesterday</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "properties" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">My Properties</h3>
                  <Link href="/sell" className="nexus-btn-primary px-4 py-2 text-sm">Add New Property</Link>
                </div>
                <div className="space-y-4">
                  {properties.length === 0 ? (
                    <p className="text-slate-500 text-sm">You haven't listed any properties yet.</p>
                  ) : properties.map(listing => (
                    <div key={listing.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:border-nexus-200 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{listing.location}</p>
                          <p className="text-sm text-slate-500">${listing.listed_price?.toLocaleString()}/mo</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${listing.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {listing.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "swaps" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Lease Swap History</h3>
                <div className="space-y-4">
                  {swaps.length === 0 ? (
                    <p className="text-slate-500 text-sm">No swap history found.</p>
                  ) : swaps.map(swap => (
                    <div key={swap.id} className="p-4 border border-gray-100 rounded-xl">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Transaction #{swap.id}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(swap.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${swap.status === 'COMMITTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {swap.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600 font-medium">Participants: {swap.participants} Nodes</span>
                        {swap.status !== 'COMMITTED' && (
                          <Link href="/swap" className="text-sm text-nexus-600 font-semibold hover:underline">
                            Go to Commitment Room &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === "saved" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Star size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Saved Properties</h3>
                <p className="text-slate-500 text-sm">You haven't bookmarked any properties recently.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
