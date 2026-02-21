import { formatCurrency } from "@/lib/mortgage"
import type { CalculationResults } from "@/lib/mortgage"
import { TrendingUp } from "lucide-react"

interface InvestmentSummaryProps {
  results: CalculationResults
}

export function InvestmentSummary({ results }: InvestmentSummaryProps) {
  const { investment, interestSaved } = results

  if (!investment) return null

  const paydownTotal = investment.earlyPayoffThenInvestFinalValue + interestSaved

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2">
        <p className="text-[10px] font-medium text-blue-700 mb-0.5">A: Invest Extra</p>
        <p className="text-base font-bold text-blue-700">{formatCurrency(investment.investExtraFinalValue)}</p>
        <p className="text-[10px] text-blue-600">
          {formatCurrency(investment.investExtraContributions)} in &middot; {formatCurrency(investment.investExtraGrowth)} growth
        </p>
      </div>

      <div className="rounded-lg border border-orange-200 bg-orange-50/50 px-3 py-2">
        <p className="text-[10px] font-medium text-orange-700 mb-0.5">B: Pay Off → Invest</p>
        <p className="text-base font-bold text-orange-700">{formatCurrency(paydownTotal)}</p>
        <p className="text-[10px] text-orange-600">
          {formatCurrency(investment.earlyPayoffThenInvestFinalValue)} inv. &middot; {formatCurrency(interestSaved)} saved
        </p>
      </div>

      <div
        className={`rounded-lg border px-3 py-2 ${
          investment.betterStrategy === "invest"
            ? "border-blue-400 bg-blue-100/50"
            : investment.betterStrategy === "paydown"
              ? "border-orange-400 bg-orange-100/50"
              : "border-green-200 bg-green-50/50"
        }`}
      >
        <p className="text-[10px] font-medium flex items-center gap-1 mb-0.5">
          <TrendingUp className="h-3 w-3" />
          Verdict
        </p>
        <p className="text-base font-bold">
          {investment.betterStrategy === "invest"
            ? "Invest Wins"
            : investment.betterStrategy === "paydown"
              ? "Paydown Wins"
              : "It's a Tie"}
        </p>
        <p className="text-[10px]">
          {investment.betterStrategy === "equal"
            ? "Same result"
            : `By ${formatCurrency(investment.difference)}`}
        </p>
      </div>
    </div>
  )
}
