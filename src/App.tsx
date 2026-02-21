import { useState, useCallback, useEffect, useRef } from "react"
import { MortgageForm } from "@/components/MortgageForm"
import { ResultsSummary } from "@/components/ResultsSummary"
import { Charts } from "@/components/Charts"
import { InvestmentSummary } from "@/components/InvestmentSummary"
import { AmortizationTable } from "@/components/AmortizationTable"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { calculate } from "@/lib/mortgage"
import { Table2, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MortgageInputs, CalculationResults } from "@/lib/mortgage"

function App() {
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [showBaselineSchedule, setShowBaselineSchedule] = useState(false)
  const [showAcceleratedSchedule, setShowAcceleratedSchedule] = useState(false)
  const [showAbout, setShowAbout] = useState(() => {
    return !localStorage.getItem("earlypay-visited")
  })
  const [mobileView, setMobileView] = useState<"form" | "results">("form")
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleCalculate = useCallback((inputs: MortgageInputs) => {
    const res = calculate(inputs)
    setResults(res)
  }, [])

  useEffect(() => {
    if (mobileView === "results" && resultsRef.current) {
      resultsRef.current.scrollTop = 0
    }
  }, [mobileView])

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Mobile top bar (visible only < md) */}
      <div className="md:hidden flex items-center justify-between border-b px-4 py-2 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight">EarlyPay</h1>
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
        {results && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => setMobileView(mobileView === "form" ? "results" : "form")}
          >
            {mobileView === "form" ? (
              <>
                View Results
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Edit Inputs
              </>
            )}
          </Button>
        )}
      </div>

      {/* Left sidebar / mobile form view */}
      <aside
        className={cn(
          "md:w-72 md:shrink-0 md:flex-none md:border-r md:bg-muted/30 md:p-4 md:overflow-y-auto",
          "flex-1 overflow-y-auto p-4 bg-muted/30",
          mobileView === "results" && "hidden md:block"
        )}
      >
        {/* Desktop-only header */}
        <header className="mb-5 hidden md:block">
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
        {/* Mobile-only CTA at bottom of form */}
        {results && (
          <div className="md:hidden mt-4">
            <Button
              className="w-full"
              onClick={() => setMobileView("results")}
            >
              View Results
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </aside>

      {/* Results panels */}
      {results ? (
        <div
          ref={resultsRef}
          className={cn(
            "md:flex-1 md:flex md:min-w-0",
            "flex-1 overflow-y-auto",
            mobileView === "form" && "hidden md:flex"
          )}
        >
          {/* Middle panel — Payoff */}
          <div className="md:flex-1 md:min-w-0 md:border-r p-3 flex flex-col gap-3 md:overflow-y-auto">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">Payoff</h2>
            <div className="shrink-0">
              <ResultsSummary results={results} />
            </div>
            <div className="h-64 md:flex-1 md:min-h-0 md:h-auto">
              <Charts results={results} variant="balance" />
            </div>
            <div className="h-64 md:flex-1 md:min-h-0 md:h-auto">
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
            <div className="md:flex-1 md:min-w-0 p-3 flex flex-col gap-3 border-t md:border-t-0">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">Invest vs. Pay Down</h2>
              <div className="shrink-0">
                <InvestmentSummary results={results} />
              </div>
              <div className="h-64 md:flex-1 md:min-h-0 md:h-auto">
                <Charts results={results} variant="investment" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <main className={cn(
          "flex-1 flex items-center justify-center text-muted-foreground",
          mobileView === "form" && "hidden md:flex"
        )}>
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
