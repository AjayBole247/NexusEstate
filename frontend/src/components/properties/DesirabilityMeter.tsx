"use client";

import { useEffect, useState } from "react";

interface DesirabilityMeterProps {
  score: number;
}

export default function DesirabilityMeter({ score }: DesirabilityMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Red < 50, Yellow 50-75, Green > 75
  let color = "text-emerald-500";
  let strokeColor = "stroke-emerald-500";
  if (score < 50) {
    color = "text-rose-500";
    strokeColor = "stroke-rose-500";
  } else if (score <= 75) {
    color = "text-amber-500";
    strokeColor = "stroke-amber-500";
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${strokeColor} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{animatedScore}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Score</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600 text-center">
        Based on location, price, and market trends
      </p>
    </div>
  );
}
