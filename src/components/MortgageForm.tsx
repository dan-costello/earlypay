import { useState, useMemo, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Plus, Trash2, Calculator } from "lucide-react"
import { calculateMonthlyPI, formatCurrencyExact, getNextMonth } from "@/lib/mortgage"
import type { MortgageInputs, LumpSumPayment } from "@/lib/mortgage"

interface MortgageFormProps {
  onCalculate: (inputs: MortgageInputs) => void
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

let lumpSumCounter = 0

export function MortgageForm({ onCalculate }: MortgageFormProps) {
  const [originalLoanAmount, setOriginalLoanAmount] = useState("350000")
  const [interestRate, setInterestRate] = useState("6.5")
  const [mortgageLength, setMortgageLength] = useState("30")
  const [currentBalance, setCurrentBalance] = useState("340000")
  const [piOverride, setPiOverride] = useState("")
  const [biweekly, setBiweekly] = useState(false)
  const [extraMonthly, setExtraMonthly] = useState("")
  const [extraAnnual, setExtraAnnual] = useState("")
  const [extraAnnualMonth, setExtraAnnualMonth] = useState("1")
  const [investmentRate, setInvestmentRate] = useState("8")
  const [lumpSums, setLumpSums] = useState<(LumpSumPayment & { dateStr: string; amountStr: string })[]>([])

  const calculatedPI = useMemo(() => {
    const loan = parseFloat(originalLoanAmount) || 0
    const rate = parseFloat(interestRate) || 0
    const term = parseInt(mortgageLength) || 30
    if (loan <= 0 || rate < 0 || term <= 0) return 0
    return calculateMonthlyPI(loan, rate, term)
  }, [originalLoanAmount, interestRate, mortgageLength])

  const effectivePI = piOverride ? parseFloat(piOverride) || 0 : calculatedPI

  const nextMonth = useMemo(() => getNextMonth(), [])

  function addLumpSum() {
    setLumpSums([
      ...lumpSums,
      { id: String(++lumpSumCounter), date: "", dateStr: "", amount: 0, amountStr: "" },
    ])
  }

  function removeLumpSum(id: string) {
    setLumpSums(lumpSums.filter((ls) => ls.id !== id))
  }

  function updateLumpSum(id: string, field: "dateStr" | "amountStr", value: string) {
    setLumpSums(
      lumpSums.map((ls) => {
        if (ls.id !== id) return ls
        const updated = { ...ls, [field]: value }
        if (field === "dateStr") updated.date = value
        if (field === "amountStr") updated.amount = parseFloat(value) || 0
        return updated
      })
    )
  }

  const doCalculate = useCallback(() => {
    const balance = parseFloat(currentBalance) || 0
    if (balance <= 0 || effectivePI <= 0) return
    onCalculate({
      originalLoanAmount: parseFloat(originalLoanAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      mortgageLengthYears: parseInt(mortgageLength) || 30,
      currentBalance: balance,
      monthlyPI: effectivePI,
      biweekly,
      extraMonthly: parseFloat(extraMonthly) || 0,
      extraAnnual: parseFloat(extraAnnual) || 0,
      extraAnnualMonth: parseInt(extraAnnualMonth) || 1,
      lumpSums: lumpSums.map((ls) => ({ id: ls.id, date: ls.date, amount: ls.amount })),
      investmentRate: parseFloat(investmentRate) || 0,
    })
  }, [originalLoanAmount, interestRate, mortgageLength, currentBalance, effectivePI, biweekly, extraMonthly, extraAnnual, extraAnnualMonth, lumpSums, investmentRate, onCalculate])

  // Auto-calculate on any input change
  useEffect(() => {
    doCalculate()
  }, [doCalculate])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Mortgage Details
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Projections start {nextMonth.str.replace("-", "/")}
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="originalLoanAmount" className="text-xs">Original Loan ($)</Label>
          <Input
            id="originalLoanAmount"
            type="number"
            step="0.01"
            min="0"
            value={originalLoanAmount}
            onChange={(e) => setOriginalLoanAmount(e.target.value)}
            className="h-8 text-sm"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="interestRate" className="text-xs">Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              min="0"
              max="30"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="h-8 text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mortgageLength" className="text-xs">Term (yrs)</Label>
            <Input
              id="mortgageLength"
              type="number"
              step="1"
              min="1"
              max="50"
              value={mortgageLength}
              onChange={(e) => setMortgageLength(e.target.value)}
              className="h-8 text-sm"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="currentBalance" className="text-xs">Current Balance ($)</Label>
          <Input
            id="currentBalance"
            type="number"
            step="0.01"
            min="0"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            className="h-8 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="monthlyPI" className="text-xs flex items-center gap-1">
            <Calculator className="h-3 w-3 text-muted-foreground" />
            Monthly P&I ($)
          </Label>
          <Input
            id="monthlyPI"
            type="number"
            step="0.01"
            min="0"
            value={piOverride}
            onChange={(e) => setPiOverride(e.target.value)}
            placeholder={calculatedPI > 0 ? formatCurrencyExact(calculatedPI).replace("$", "") : "0.00"}
            className="h-8 text-sm"
          />
          {calculatedPI > 0 && (
            <p className="text-[10px] text-muted-foreground leading-tight">
              Calc: {formatCurrencyExact(calculatedPI)}
              {piOverride && (
                <>
                  {" · "}
                  <button
                    type="button"
                    className="text-primary underline underline-offset-2"
                    onClick={() => setPiOverride("")}
                  >
                    reset
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Extra Payments */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Extra Payments
        </h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="extraMonthly" className="text-xs">Extra Monthly ($)</Label>
            <Input
              id="extraMonthly"
              type="number"
              step="0.01"
              min="0"
              value={extraMonthly}
              onChange={(e) => setExtraMonthly(e.target.value)}
              placeholder="0"
              className="h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="extraAnnual" className="text-xs">Extra Annual ($)</Label>
              <Input
                id="extraAnnual"
                type="number"
                step="0.01"
                min="0"
                value={extraAnnual}
                onChange={(e) => setExtraAnnual(e.target.value)}
                placeholder="0"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="extraAnnualMonth" className="text-xs">In Month</Label>
              <Select
                id="extraAnnualMonth"
                value={extraAnnualMonth}
                onChange={(e) => setExtraAnnualMonth(e.target.value)}
                className="h-8 text-sm"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={String(i + 1)}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={biweekly}
              onChange={(e) => setBiweekly(e.target.checked)}
              className="h-4 w-4 mt-0.5 rounded border-input accent-primary"
            />
            <span className="text-xs leading-tight">
              <span className="font-medium">Biweekly</span>
              <span className="text-muted-foreground block">
                13 payments/yr
                {calculatedPI > 0 && biweekly && (
                  <> (+{formatCurrencyExact(effectivePI / 12)}/mo)</>
                )}
              </span>
            </span>
          </label>

          {/* Lump Sums */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Lump Sums</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLumpSum} className="h-6 px-2 text-[10px]">
                <Plus className="h-3 w-3 mr-0.5" />
                Add
              </Button>
            </div>
            {lumpSums.map((ls) => (
              <div key={ls.id} className="flex items-end gap-1.5">
                <div className="flex-1 space-y-0.5">
                  <Input
                    type="month"
                    value={ls.dateStr}
                    onChange={(e) => updateLumpSum(ls.id, "dateStr", e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="flex-1 space-y-0.5">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ls.amountStr}
                    onChange={(e) => updateLumpSum(ls.id, "amountStr", e.target.value)}
                    placeholder="$"
                    className="h-7 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLumpSum(ls.id)}
                  className="h-7 w-7 shrink-0"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investment Comparison */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Investment Comparison
        </h2>
        <div className="space-y-1">
          <Label htmlFor="investmentRate" className="text-xs">Expected Return (%)</Label>
          <Input
            id="investmentRate"
            type="number"
            step="0.01"
            min="0"
            max="30"
            value={investmentRate}
            onChange={(e) => setInvestmentRate(e.target.value)}
            placeholder="8"
            className="h-8 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">
            Compare investing vs. paying down
          </p>
        </div>
      </div>
    </div>
  )
}
