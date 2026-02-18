import { useState, useCallback } from "react"
import { MortgageForm } from "@/components/MortgageForm"
import { ResultsSummary } from "@/components/ResultsSummary"
import { Charts } from "@/components/Charts"
import { InvestmentSummary } from "@/components/InvestmentSummary"
import { AmortizationTable } from "@/components/AmortizationTable"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { calculate } from "@/lib/mortgage"
import { Table2 } from "lucide-react"
import type { MortgageInputs, CalculationResults } from "@/lib/mortgage"

function App() {
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [showBaselineSchedule, setShowBaselineSchedule] = useState(false)
  const [showAcceleratedSchedule, setShowAcceleratedSchedule] = useState(false)

  const handleCalculate = useCallback((inputs: MortgageInputs) => {
    const res = calculate(inputs)
    setResults(res)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left sidebar — inputs */}
        <aside className="w-72 shrink-0 border-r bg-muted/30 p-4 overflow-y-auto sticky top-0 h-screen">
          <header className="mb-5">
            <h1 className="text-xl font-bold tracking-tight">EarlyPay</h1>
            <p className="text-xs text-muted-foreground">
              Mortgage payoff &amp; investment calculator
            </p>
          </header>
          <MortgageForm onCalculate={handleCalculate} />
        </aside>

        {/* Right side — outputs in 2-column split */}
        {results ? (
          <div className="flex-1 flex min-w-0">
            {/* Middle panel — Payoff */}
            <div className="flex-1 min-w-0 border-r p-4 overflow-y-auto h-screen sticky top-0 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payoff</h2>
              <ResultsSummary results={results} />
              <Charts results={results} variant="balance" />
              <Charts results={results} variant="interest" />

              {/* Amortization schedule buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBaselineSchedule(true)}
                  className="text-xs"
                >
                  <Table2 className="h-3.5 w-3.5 mr-1" />
                  Baseline ({results.baseline.totalMonths} mo)
                </Button>
                {results.accelerated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAcceleratedSchedule(true)}
                    className="text-xs"
                  >
                    <Table2 className="h-3.5 w-3.5 mr-1" />
                    Accelerated ({results.accelerated.totalMonths} mo)
                  </Button>
                )}
              </div>
            </div>

            {/* Right panel — Investment */}
            {results.investment && (
              <div className="flex-1 min-w-0 p-4 overflow-y-auto h-screen sticky top-0 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Invest vs. Pay Down</h2>
                <InvestmentSummary results={results} />
                <Charts results={results} variant="investment" />
              </div>
            )}
          </div>
        ) : (
          <main className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Enter your mortgage details to see results</p>
          </main>
        )}

        {/* Amortization modals */}
        {results && (
          <>
            <Dialog open={showBaselineSchedule} onClose={() => setShowBaselineSchedule(false)}>
              <AmortizationTable
                title="Baseline (Minimum Payments)"
                result={results.baseline}
              />
            </Dialog>

            {results.accelerated && (
              <Dialog open={showAcceleratedSchedule} onClose={() => setShowAcceleratedSchedule(false)}>
                <AmortizationTable
                  title="Accelerated (With Extra Payments)"
                  result={results.accelerated}
                />
              </Dialog>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
