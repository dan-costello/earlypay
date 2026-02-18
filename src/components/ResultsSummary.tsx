import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5" />
            Baseline Payoff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{baseline.payoffDateLabel}</div>
          <p className="text-xs text-muted-foreground">
            {baseline.totalMonths} mo &middot; {formatCurrency(baseline.totalInterest)} int.
          </p>
        </CardContent>
      </Card>

      {accelerated ? (
        <>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-green-700 flex items-center gap-1.5">
                <CalendarCheck className="h-3.5 w-3.5" />
                Accelerated Payoff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-700">
                {accelerated.payoffDateLabel}
              </div>
              <p className="text-xs text-green-600">
                {accelerated.totalMonths} mo &middot; {formatCurrency(accelerated.totalInterest)} int.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Time Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-700">
                {yearsSaved > 0 && `${yearsSaved}y `}
                {remainingMonths}m
              </div>
              <p className="text-xs text-blue-600">
                {monthsSaved} months earlier
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-purple-700 flex items-center gap-1.5">
                <PiggyBank className="h-3.5 w-3.5" />
                Interest Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-700">
                {formatCurrency(interestSaved)}
              </div>
              <p className="text-xs text-purple-600">
                less interest
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="col-span-3 border-dashed">
          <CardContent className="flex items-center justify-center py-6">
            <p className="text-muted-foreground text-xs flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5" />
              Add extra payments to see savings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
