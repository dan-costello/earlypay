import { useState } from "react"
import { MortgageForm } from "@/components/MortgageForm"
import { ResultsSummary } from "@/components/ResultsSummary"
import { Charts } from "@/components/Charts"
import { InvestmentSummary } from "@/components/InvestmentSummary"
import { AmortizationTable } from "@/components/AmortizationTable"
import { calculate } from "@/lib/mortgage"
import type { MortgageInputs, CalculationResults } from "@/lib/mortgage"

function App() {
  const [results, setResults] = useState<CalculationResults | null>(null)

  function handleCalculate(inputs: MortgageInputs) {
    const res = calculate(inputs)
    setResults(res)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">EarlyPay</h1>
          <p className="text-muted-foreground mt-1">
            Mortgage payoff calculator &amp; investment comparison tool
          </p>
        </header>

        <MortgageForm onCalculate={handleCalculate} />

        {results && (
          <div className="space-y-8">
            <hr className="border-border" />
            <ResultsSummary results={results} />
            <Charts results={results} />
            {results.investment && <InvestmentSummary results={results} />}

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Amortization Schedules</h2>
              <AmortizationTable
                title="Baseline (Minimum Payments)"
                result={results.baseline}
              />
              {results.accelerated && (
                <AmortizationTable
                  title="Accelerated (With Extra Payments)"
                  result={results.accelerated}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
