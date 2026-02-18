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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Payoff Summary</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Baseline Payoff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{baseline.payoffDateLabel}</div>
            <p className="text-sm text-muted-foreground">
              {baseline.totalMonths} months &middot; {formatCurrency(baseline.totalInterest)} interest
            </p>
          </CardContent>
        </Card>

        {accelerated && (
          <>
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Accelerated Payoff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {accelerated.payoffDateLabel}
                </div>
                <p className="text-sm text-green-600">
                  {accelerated.totalMonths} months &middot; {formatCurrency(accelerated.totalInterest)} interest
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {yearsSaved > 0 && `${yearsSaved}y `}
                  {remainingMonths}m
                </div>
                <p className="text-sm text-blue-600">
                  {monthsSaved} months earlier
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  Interest Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {formatCurrency(interestSaved)}
                </div>
                <p className="text-sm text-purple-600">
                  less in interest charges
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {!accelerated && (
          <Card className="sm:col-span-3 border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Add extra payments above to see potential savings
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
