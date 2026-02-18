import { useState } from "react"
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

  function handleCalculate(inputs: MortgageInputs) {
    const res = calculate(inputs)
    setResults(res)
  }

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

        {/* Right side — outputs */}
        <main className="flex-1 p-6 overflow-y-auto">
          {results ? (
            <div className="space-y-5 max-w-[1200px]">
              <ResultsSummary results={results} />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <Charts results={results} variant="balance" />
                <Charts results={results} variant="interest" />
              </div>

              {results.investment && (
                <>
                  <InvestmentSummary results={results} />
                  <Charts results={results} variant="investment" />
                </>
              )}

              {/* Amortization schedule buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBaselineSchedule(true)}
                >
                  <Table2 className="h-4 w-4 mr-1.5" />
                  Baseline Schedule ({results.baseline.totalMonths} mo)
                </Button>
                {results.accelerated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAcceleratedSchedule(true)}
                  >
                    <Table2 className="h-4 w-4 mr-1.5" />
                    Accelerated Schedule ({results.accelerated.totalMonths} mo)
                  </Button>
                )}
              </div>

              {/* Amortization modals */}
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
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Enter your mortgage details to see results</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
