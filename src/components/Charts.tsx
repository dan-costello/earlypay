import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { formatCurrency } from "@/lib/mortgage"
import type { CalculationResults } from "@/lib/mortgage"

interface ChartsProps {
  results: CalculationResults
  variant: "balance" | "interest" | "investment"
}

function currencyFormatter(value: number) {
  return formatCurrency(value)
}

export function Charts({ results, variant }: ChartsProps) {
  const { baseline, accelerated, investment } = results

  if (variant === "balance") {
    const balanceData = baseline.schedule
      .filter((_, i) => i % 3 === 0 || i === baseline.schedule.length - 1)
      .map((row) => {
        const accelRow = accelerated?.schedule.find((r) => r.month === row.month)
        return {
          dateLabel: row.dateLabel,
          month: row.month,
          baseline: Math.round(row.endBalance),
          ...(accelRow ? { accelerated: Math.round(accelRow.endBalance) } : {}),
        }
      })

    if (accelerated && accelerated.totalMonths < baseline.totalMonths) {
      const lastAccelMonth = accelerated.totalMonths
      const alreadyIncluded = balanceData.some((d) => d.month >= lastAccelMonth)
      if (!alreadyIncluded) {
        const lastAccelRow = accelerated.schedule[accelerated.schedule.length - 1]
        const baselineRow = baseline.schedule.find((r) => r.month === lastAccelRow.month)
        if (baselineRow) {
          balanceData.push({
            dateLabel: lastAccelRow.dateLabel,
            month: lastAccelRow.month,
            baseline: Math.round(baselineRow.endBalance),
            accelerated: 0,
          })
        }
      }
    }

    return (
      <div className="h-full flex flex-col rounded-lg border bg-card p-3">
        <h3 className="text-xs font-medium text-muted-foreground mb-1 shrink-0">Balance Over Time</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 9 }} width={65} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => label} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="baseline" name="Minimum" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} strokeWidth={2} />
              {accelerated && (
                <Area type="monotone" dataKey="accelerated" name="Accelerated" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (variant === "interest") {
    const interestData = baseline.schedule
      .filter((_, i) => i % 6 === 0 || i === baseline.schedule.length - 1)
      .map((row) => {
        const accelRow = accelerated?.schedule.find((r) => r.month === row.month)
        return {
          dateLabel: row.dateLabel,
          month: row.month,
          baselineInterest: Math.round(row.totalInterestPaid),
          ...(accelRow ? { acceleratedInterest: Math.round(accelRow.totalInterestPaid) } : {}),
        }
      })

    return (
      <div className="h-full flex flex-col rounded-lg border bg-card p-3">
        <h3 className="text-xs font-medium text-muted-foreground mb-1 shrink-0">Cumulative Interest</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={interestData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 9 }} width={65} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => label} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="baselineInterest" name="Minimum" stroke="#94a3b8" strokeWidth={2} dot={false} />
              {accelerated && (
                <Line type="monotone" dataKey="acceleratedInterest" name="Accelerated" stroke="#a855f7" strokeWidth={2} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (variant === "investment" && investment) {
    return (
      <div className="h-full flex flex-col rounded-lg border bg-card p-3">
        <h3 className="text-xs font-medium text-muted-foreground mb-1 shrink-0">Investment Growth</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={investment.investExtraMonthlyData
                .filter((_, i) => i % 3 === 0 || i === investment.investExtraMonthlyData.length - 1)
                .map((d) => {
                  const paydownRow = investment.earlyPayoffThenInvestMonthlyData.find((r) => r.month === d.month)
                  return {
                    dateLabel: d.dateLabel,
                    month: d.month,
                    investInstead: Math.round(d.value),
                    paydownThenInvest: Math.round(paydownRow?.value ?? 0),
                  }
                })}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 9 }} width={65} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => label} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="investInstead" name="Invest Extra" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="paydownThenInvest" name="Pay Off → Invest" stroke="#f97316" fill="#f97316" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return null
}
