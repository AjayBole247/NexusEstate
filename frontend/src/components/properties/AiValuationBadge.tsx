import { CheckCircle2, AlertTriangle } from "lucide-react";

interface AiValuationBadgeProps {
  askingPrice: number;
  predictedPrice: number;
}

export default function AiValuationBadge({ askingPrice, predictedPrice }: AiValuationBadgeProps) {
  const isGreatValue = askingPrice <= predictedPrice;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm border ${
        isGreatValue
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      {isGreatValue ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Great Value
        </>
      ) : (
        <>
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Above Market
        </>
      )}
    </div>
  );
}
