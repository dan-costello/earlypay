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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/mortgage"
import type { CalculationResults } from "@/lib/mortgage"

interface ChartsProps {
  results: CalculationResults
}

function currencyFormatter(value: number) {
  return formatCurrency(value)
}

export function Charts({ results }: ChartsProps) {
  const { baseline, accelerated, investment } = results

  // Balance over time chart data
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

  // Add final accelerated row if it ends before baseline
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

  // Interest breakdown chart data (cumulative)
  const interestData = baseline.schedule
    .filter((_, i) => i % 6 === 0 || i === baseline.schedule.length - 1)
    .map((row) => {
      const accelRow = accelerated?.schedule.find((r) => r.month === row.month)
      return {
        dateLabel: row.dateLabel,
        month: row.month,
        baselineInterest: Math.round(row.totalInterestPaid),
        ...(accelRow
          ? { acceleratedInterest: Math.round(accelRow.totalInterestPaid) }
          : {}),
      }
    })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Remaining Balance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={currencyFormatter}
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="baseline"
                name="Minimum Payments"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              {accelerated && (
                <Area
                  type="monotone"
                  dataKey="accelerated"
                  name="With Extra Payments"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cumulative Interest Paid</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={interestData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={currencyFormatter}
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="baselineInterest"
                name="Minimum Payments"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
              />
              {accelerated && (
                <Line
                  type="monotone"
                  dataKey="acceleratedInterest"
                  name="With Extra Payments"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {investment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Investment Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={investment.investExtraMonthlyData
                  .filter((_, i) => i % 3 === 0 || i === investment.investExtraMonthlyData.length - 1)
                  .map((d, _i) => {
                    const paydownRow = investment.earlyPayoffThenInvestMonthlyData.find(
                      (r) => r.month === d.month
                    )
                    return {
                      dateLabel: d.dateLabel,
                      month: d.month,
                      investInstead: Math.round(d.value),
                      paydownThenInvest: Math.round(paydownRow?.value ?? 0),
                    }
                  })}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={currencyFormatter}
                  tick={{ fontSize: 11 }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="investInstead"
                  name="Invest Extra Instead"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="paydownThenInvest"
                  name="Pay Off Early → Invest P&I"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
