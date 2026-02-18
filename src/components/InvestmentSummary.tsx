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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-blue-700">
            A: Invest Extra Instead
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-blue-700">
            {formatCurrency(investment.investExtraFinalValue)}
          </div>
          <div className="text-[10px] text-blue-600 leading-relaxed">
            <p>Contributed: {formatCurrency(investment.investExtraContributions)}</p>
            <p>Growth: {formatCurrency(investment.investExtraGrowth)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-orange-700">
            B: Pay Off Early → Invest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-orange-700">
            {formatCurrency(paydownTotal)}
          </div>
          <div className="text-[10px] text-orange-600 leading-relaxed">
            <p>Investment: {formatCurrency(investment.earlyPayoffThenInvestFinalValue)}</p>
            <p>Interest saved: {formatCurrency(interestSaved)}</p>
          </div>
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
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Verdict
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">
            {investment.betterStrategy === "invest"
              ? "Invest Wins"
              : investment.betterStrategy === "paydown"
                ? "Paydown Wins"
                : "It's a Tie"}
          </div>
          <p className="text-xs">
            {investment.betterStrategy === "equal"
              ? "Both strategies yield the same result."
              : `By ${formatCurrency(investment.difference)}`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
