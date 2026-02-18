import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/mortgage"
import type { CalculationResults } from "@/lib/mortgage"
import { TrendingUp, Scale } from "lucide-react"

interface InvestmentSummaryProps {
  results: CalculationResults
}

export function InvestmentSummary({ results }: InvestmentSummaryProps) {
  const { investment, interestSaved } = results

  if (!investment) return null

  const paydownTotal = investment.earlyPayoffThenInvestFinalValue + interestSaved

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Scale className="h-5 w-5" />
        Investment vs. Mortgage Paydown
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Strategy A: Invest Extra Instead
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(investment.investExtraFinalValue)}
            </div>
            <div className="text-xs text-blue-600 space-y-1">
              <p>Contributions: {formatCurrency(investment.investExtraContributions)}</p>
              <p>Investment growth: {formatCurrency(investment.investExtraGrowth)}</p>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Put extra payment amounts into an investment account instead of against mortgage principal.
              Mortgage pays off at the normal date.
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Strategy B: Pay Off Early → Invest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-orange-700">
              {formatCurrency(paydownTotal)}
            </div>
            <div className="text-xs text-orange-600 space-y-1">
              <p>Investment account: {formatCurrency(investment.earlyPayoffThenInvestFinalValue)}</p>
              <p>Interest saved: {formatCurrency(interestSaved)}</p>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Pay extra toward mortgage, then after early payoff invest the full
              P&I payment for the remainder of the original term.
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            investment.betterStrategy === "invest"
              ? "border-blue-400 bg-blue-100/50"
              : investment.betterStrategy === "paydown"
                ? "border-orange-400 bg-orange-100/50"
                : "border-green-200 bg-green-50/50"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Verdict
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {investment.betterStrategy === "invest"
                ? "Invest Wins"
                : investment.betterStrategy === "paydown"
                  ? "Paydown Wins"
                  : "It's a Tie"}
            </div>
            <p className="text-sm">
              {investment.betterStrategy === "equal"
                ? "Both strategies yield the same result."
                : `By ${formatCurrency(investment.difference)} over the mortgage term.`}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              {investment.betterStrategy === "invest"
                ? "Investing the extra payments yields more wealth than paying down the mortgage early, given the expected return rate."
                : investment.betterStrategy === "paydown"
                  ? "Paying off the mortgage early and then investing provides more total benefit than investing the extra alone."
                  : ""}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
