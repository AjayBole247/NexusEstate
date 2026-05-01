import { AlertCircle } from "lucide-react";

export default function AiOfflineFallback() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-4">
      <div className="bg-slate-200 p-2 rounded-full">
        <AlertCircle className="w-5 h-5 text-slate-500" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">AI Valuation Offline</h3>
        <p className="mt-1 text-sm text-slate-600">
          Our AI pricing engine is currently undergoing maintenance. Displaying standard property details in the meantime.
        </p>
      </div>
    </div>
  );
}
