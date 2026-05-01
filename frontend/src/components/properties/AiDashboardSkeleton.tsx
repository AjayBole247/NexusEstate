export default function AiDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Badge skeleton */}
      <div className="h-8 w-32 bg-slate-200 rounded-full"></div>
      
      {/* Chart and Meter skeleton container */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Chart skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-4/5 bg-slate-200 rounded-lg"></div>
        </div>
        
        {/* Meter skeleton */}
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-32 h-32 bg-slate-200 rounded-full"></div>
          <div className="h-4 w-48 bg-slate-200 rounded mt-4"></div>
        </div>
      </div>
    </div>
  );
}
