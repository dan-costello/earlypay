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
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left sidebar — inputs */}
      <aside className="w-72 shrink-0 border-r bg-muted/30 p-4 overflow-y-auto">
        <header className="mb-5">
          <h1 className="text-xl font-bold tracking-tight">EarlyPay</h1>
          <p className="text-xs text-muted-foreground">
            Mortgage payoff &amp; investment calculator
          </p>
        </header>
        <MortgageForm onCalculate={handleCalculate} />
      </aside>

      {/* Right side — outputs */}
      {results ? (
        <div className="flex-1 flex min-w-0">
          {/* Middle panel — Payoff */}
          <div className="flex-1 min-w-0 border-r p-3 flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">Payoff</h2>
            <div className="shrink-0">
              <ResultsSummary results={results} />
            </div>
            <div className="flex-1 min-h-0">
              <Charts results={results} variant="balance" />
            </div>
            <div className="flex-1 min-h-0">
              <Charts results={results} variant="interest" />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBaselineSchedule(true)}
                className="text-xs h-7"
              >
                <Table2 className="h-3 w-3 mr-1" />
                Baseline ({results.baseline.totalMonths} mo)
              </Button>
              {results.accelerated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAcceleratedSchedule(true)}
                  className="text-xs h-7"
                >
                  <Table2 className="h-3 w-3 mr-1" />
                  Accelerated ({results.accelerated.totalMonths} mo)
                </Button>
              )}
            </div>
          </div>

          {/* Right panel — Investment */}
          {results.investment && (
            <div className="flex-1 min-w-0 p-3 flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">Invest vs. Pay Down</h2>
              <div className="shrink-0">
                <InvestmentSummary results={results} />
              </div>
              <div className="flex-1 min-h-0">
                <Charts results={results} variant="investment" />
              </div>
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
  )
}

export default App
