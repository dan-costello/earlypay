import { Collapsible } from "@/components/ui/collapsible"
import { formatCurrencyExact } from "@/lib/mortgage"
import type { AmortizationResult } from "@/lib/mortgage"

interface AmortizationTableProps {
  title: string
  result: AmortizationResult
  defaultOpen?: boolean
}

export function AmortizationTable({ title, result, defaultOpen = false }: AmortizationTableProps) {
  return (
    <Collapsible title={`${title} (${result.totalMonths} months)`} defaultOpen={defaultOpen}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-medium">#</th>
              <th className="py-2 pr-3 font-medium">Date</th>
              <th className="py-2 pr-3 font-medium text-right">Payment</th>
              <th className="py-2 pr-3 font-medium text-right">Extra</th>
              <th className="py-2 pr-3 font-medium text-right">Principal</th>
              <th className="py-2 pr-3 font-medium text-right">Interest</th>
              <th className="py-2 pr-3 font-medium text-right">Balance</th>
              <th className="py-2 font-medium text-right">Total Interest</th>
            </tr>
          </thead>
          <tbody>
            {result.schedule.map((row) => (
              <tr key={row.month} className="border-b border-muted/50 hover:bg-muted/30">
                <td className="py-1.5 pr-3 tabular-nums">{row.month}</td>
                <td className="py-1.5 pr-3 whitespace-nowrap">{row.dateLabel}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums">
                  {formatCurrencyExact(row.payment)}
                </td>
                <td className="py-1.5 pr-3 text-right tabular-nums">
                  {row.extraPayment > 0 ? (
                    <span className="text-green-600">{formatCurrencyExact(row.extraPayment)}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-1.5 pr-3 text-right tabular-nums">
                  {formatCurrencyExact(row.principalPaid)}
                </td>
                <td className="py-1.5 pr-3 text-right tabular-nums">
                  {formatCurrencyExact(row.interestPaid)}
                </td>
                <td className="py-1.5 pr-3 text-right tabular-nums">
                  {formatCurrencyExact(row.endBalance)}
                </td>
                <td className="py-1.5 text-right tabular-nums">
                  {formatCurrencyExact(row.totalInterestPaid)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Collapsible>
  )
}
