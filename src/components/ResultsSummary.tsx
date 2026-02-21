import { formatCurrency } from "@/lib/mortgage"
import type { CalculationResults } from "@/lib/mortgage"
import { CalendarCheck, PiggyBank, TrendingDown, Clock } from "lucide-react"

interface ResultsSummaryProps {
  results: CalculationResults
}

export function ResultsSummary({ results }: ResultsSummaryProps) {
  const { baseline, accelerated, interestSaved, monthsSaved } = results
  const yearsSaved = Math.floor(monthsSaved / 12)
  const remainingMonths = monthsSaved % 12

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div className="rounded-lg border px-3 py-2">
        <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mb-0.5">
          <CalendarCheck className="h-3 w-3" />
          Baseline
        </p>
        <p className="text-base font-bold">{baseline.payoffDateLabel}</p>
        <p className="text-[10px] text-muted-foreground">
          {baseline.totalMonths} mo &middot; {formatCurrency(baseline.totalInterest)} int.
        </p>
      </div>

      {accelerated ? (
        <>
          <div className="rounded-lg border border-green-200 bg-green-50/50 px-3 py-2">
            <p className="text-[10px] font-medium text-green-700 flex items-center gap-1 mb-0.5">
              <CalendarCheck className="h-3 w-3" />
              Accelerated
            </p>
            <p className="text-base font-bold text-green-700">{accelerated.payoffDateLabel}</p>
            <p className="text-[10px] text-green-600">
              {accelerated.totalMonths} mo &middot; {formatCurrency(accelerated.totalInterest)} int.
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2">
            <p className="text-[10px] font-medium text-blue-700 flex items-center gap-1 mb-0.5">
              <Clock className="h-3 w-3" />
              Time Saved
            </p>
            <p className="text-base font-bold text-blue-700">
              {yearsSaved > 0 && `${yearsSaved}y `}{remainingMonths}m
            </p>
            <p className="text-[10px] text-blue-600">{monthsSaved} months earlier</p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50/50 px-3 py-2">
            <p className="text-[10px] font-medium text-purple-700 flex items-center gap-1 mb-0.5">
              <PiggyBank className="h-3 w-3" />
              Interest Saved
            </p>
            <p className="text-base font-bold text-purple-700">{formatCurrency(interestSaved)}</p>
            <p className="text-[10px] text-purple-600">less interest</p>
          </div>
        </>
      ) : (
        <div className="col-span-1 md:col-span-3 rounded-lg border border-dashed flex items-center justify-center py-4">
          <p className="text-muted-foreground text-xs flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5" />
            Add extra payments to see savings
          </p>
        </div>
      )}
    </div>
  )
}
