import { useState, useCallback } from "react"
import { MortgageForm } from "@/components/MortgageForm"
import { ResultsSummary } from "@/components/ResultsSummary"
import { Charts } from "@/components/Charts"
import { InvestmentSummary } from "@/components/InvestmentSummary"
import { AmortizationTable } from "@/components/AmortizationTable"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { calculate } from "@/lib/mortgage"
import { Table2, Info } from "lucide-react"
import type { MortgageInputs, CalculationResults } from "@/lib/mortgage"

function App() {
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [showBaselineSchedule, setShowBaselineSchedule] = useState(false)
  const [showAcceleratedSchedule, setShowAcceleratedSchedule] = useState(false)
  const [showAbout, setShowAbout] = useState(() => {
    return !localStorage.getItem("earlypay-visited")
  })

  const handleCalculate = useCallback((inputs: MortgageInputs) => {
    const res = calculate(inputs)
    setResults(res)
  }, [])

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left sidebar — inputs */}
      <aside className="w-72 shrink-0 border-r bg-muted/30 p-4 overflow-y-auto">
        <header className="mb-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">EarlyPay</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowAbout(true)}
              aria-label="About EarlyPay"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
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

      {/* About dialog */}
      <Dialog open={showAbout} onClose={() => { localStorage.setItem("earlypay-visited", "1"); setShowAbout(false) }} className="max-w-lg">
        <h2 className="text-lg font-semibold mb-3">About EarlyPay</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            EarlyPay is a mortgage payoff and investment comparison calculator
            that helps you understand the impact of making extra payments on your
            mortgage.
          </p>
          <p>
            <strong className="text-foreground">How to use:</strong> Enter your
            mortgage details in the sidebar — including loan amount, interest
            rate, term, and current balance. Then add any extra payments you plan
            to make (monthly, annual, biweekly, or lump sums) to see how they
            accelerate your payoff timeline.
          </p>
          <p>
            <strong className="text-foreground">Payoff analysis:</strong> See
            how much time and interest you save with extra payments, with
            side-by-side charts comparing your baseline and accelerated
            schedules.
          </p>
          <p>
            <strong className="text-foreground">Investment comparison:</strong>{" "}
            Optionally enter an expected investment return rate to compare
            whether your extra money is better spent paying down the mortgage or
            investing in the market.
          </p>
        </div>
      </Dialog>

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
