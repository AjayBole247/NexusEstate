"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { TrendingUp, AlertTriangle, Activity, BrainCircuit } from "lucide-react";

// Mock Data
const trendData = [
  { month: "Jan", listedPrice: 240000, trueValue: 245000 },
  { month: "Feb", listedPrice: 250000, trueValue: 248000 },
  { month: "Mar", listedPrice: 265000, trueValue: 255000 },
  { month: "Apr", listedPrice: 280000, trueValue: 260000 },
  { month: "May", listedPrice: 275000, trueValue: 262000 },
  { month: "Jun", listedPrice: 290000, trueValue: 268000 },
  { month: "Jul", listedPrice: 310000, trueValue: 275000 }, // Anomaly!
];

export default function InsightsPage() {
  const [valuationData, setValuationData] = useState<{ predicted_value: number } | null>(null);
  const [fraudData, setFraudData] = useState<{ is_anomaly: boolean, z_score: number } | null>(null);

  // Simulate calling the backend which calls the Python service
  useEffect(() => {
    const fetchAI = async () => {
      try {
        // Calling the Node.js backend proxy which internally calls Python
        const valRes = await fetch("http://localhost:3001/api/analytics/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            features: {
              bedrooms: 3,
              bathrooms: 2,
              square_feet: 1500,
              year_built: 2010,
              location_score: 8
            }
          })
        });
        if(valRes.ok) setValuationData(await valRes.json());

        const fraudRes = await fetch("http://localhost:3001/api/analytics/fraud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listed_price: 310000, location: "Downtown" })
        });
        if(fraudRes.ok) setFraudData(await fraudRes.json());
      } catch (e) {
        console.error("AI Microservice is not running or accessible.", e);
      }
    };
    fetchAI();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-light text-white mb-2 flex items-center gap-3">
            <BrainCircuit className="text-purple-500" />
            AI Market Analytics Hub
          </h1>
          <p className="text-neutral-400">Powered by our Scikit-Learn Valuation Engine & Z-Score Fraud Detection</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-start justify-between">
            <div>
              <p className="text-neutral-400 text-sm mb-1">Market Trend</p>
              <h3 className="text-2xl font-semibold text-white">+12.5%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <TrendingUp size={20} />
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-start justify-between">
            <div>
              <p className="text-neutral-400 text-sm mb-1">AI Valuation Estimate</p>
              <h3 className="text-2xl font-semibold text-blue-400">
                {valuationData ? `$${valuationData.predicted_value.toLocaleString()}` : "Loading..."}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Activity size={20} />
            </div>
          </div>

          <div className={`border p-6 rounded-2xl flex items-start justify-between transition-colors ${
            fraudData?.is_anomaly ? "bg-red-500/5 border-red-500/30" : "bg-neutral-900 border-neutral-800"
          }`}>
            <div>
              <p className="text-neutral-400 text-sm mb-1">Price Anomaly Detection</p>
              <h3 className={`text-2xl font-semibold ${fraudData?.is_anomaly ? "text-red-400" : "text-emerald-400"}`}>
                {fraudData ? (fraudData.is_anomaly ? "Flagged" : "Normal") : "Analyzing..."}
              </h3>
              {fraudData && (
                <p className="text-xs text-neutral-500 mt-2">Z-Score: {fraudData.z_score.toFixed(2)}</p>
              )}
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              fraudData?.is_anomaly ? "bg-red-500/20 text-red-500" : "bg-neutral-800 text-neutral-500"
            }`}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <h2 className="text-xl font-medium text-white mb-6">True Market Value vs. Listed Price</h2>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorListed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#525252" />
                <YAxis stroke="#525252" tickFormatter={(value) => `$${value/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="trueValue" name="AI True Valuation" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTrue)" />
                <Area type="monotone" dataKey="listedPrice" name="Listed Price" stroke="#ef4444" fillOpacity={1} fill="url(#colorListed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
