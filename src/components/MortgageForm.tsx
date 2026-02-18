import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import type { MortgageInputs, LumpSumPayment } from "@/lib/mortgage"

interface MortgageFormProps {
  onCalculate: (inputs: MortgageInputs) => void
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

let lumpSumCounter = 0

export function MortgageForm({ onCalculate }: MortgageFormProps) {
  const [startDate, setStartDate] = useState("2024-01")
  const [interestRate, setInterestRate] = useState("6.5")
  const [mortgageLength, setMortgageLength] = useState("30")
  const [currentBalance, setCurrentBalance] = useState("350000")
  const [currentPI, setCurrentPI] = useState("2212")
  const [extraMonthly, setExtraMonthly] = useState("")
  const [extraAnnual, setExtraAnnual] = useState("")
  const [extraAnnualMonth, setExtraAnnualMonth] = useState("1")
  const [investmentRate, setInvestmentRate] = useState("8")
  const [lumpSums, setLumpSums] = useState<(LumpSumPayment & { dateStr: string; amountStr: string })[]>([])

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onCalculate({
      startDate,
      interestRate: parseFloat(interestRate) || 0,
      mortgageLengthYears: parseInt(mortgageLength) || 30,
      currentBalance: parseFloat(currentBalance) || 0,
      currentPI: parseFloat(currentPI) || 0,
      extraMonthly: parseFloat(extraMonthly) || 0,
      extraAnnual: parseFloat(extraAnnual) || 0,
      extraAnnualMonth: parseInt(extraAnnualMonth) || 1,
      lumpSums: lumpSums.map((ls) => ({ id: ls.id, date: ls.date, amount: ls.amount })),
      investmentRate: parseFloat(investmentRate) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mortgage Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              min="0"
              max="30"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="6.5"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mortgageLength">Mortgage Length (years)</Label>
            <Input
              id="mortgageLength"
              type="number"
              step="1"
              min="1"
              max="50"
              value={mortgageLength}
              onChange={(e) => setMortgageLength(e.target.value)}
              placeholder="30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentBalance">Current Balance ($)</Label>
            <Input
              id="currentBalance"
              type="number"
              step="0.01"
              min="0"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              placeholder="350,000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPI">Monthly P&I Payment ($)</Label>
            <Input
              id="currentPI"
              type="number"
              step="0.01"
              min="0"
              value={currentPI}
              onChange={(e) => setCurrentPI(e.target.value)}
              placeholder="2,212"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extra Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="extraMonthly">Extra Monthly ($)</Label>
              <Input
                id="extraMonthly"
                type="number"
                step="0.01"
                min="0"
                value={extraMonthly}
                onChange={(e) => setExtraMonthly(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extraAnnual">Extra Annual ($)</Label>
              <Input
                id="extraAnnual"
                type="number"
                step="0.01"
                min="0"
                value={extraAnnual}
                onChange={(e) => setExtraAnnual(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extraAnnualMonth">Annual Payment Month</Label>
              <Select
                id="extraAnnualMonth"
                value={extraAnnualMonth}
                onChange={(e) => setExtraAnnualMonth(e.target.value)}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={String(i + 1)}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Lump Sum Payments</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLumpSum}>
                <Plus className="h-4 w-4 mr-1" />
                Add Lump Sum
              </Button>
            </div>
            {lumpSums.map((ls) => (
              <div key={ls.id} className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Input
                    type="month"
                    value={ls.dateStr}
                    onChange={(e) => updateLumpSum(ls.id, "dateStr", e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ls.amountStr}
                    onChange={(e) => updateLumpSum(ls.id, "amountStr", e.target.value)}
                    placeholder="10,000"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLumpSum(ls.id)}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investment Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="investmentRate">Expected Annual Return (%)</Label>
            <Input
              id="investmentRate"
              type="number"
              step="0.01"
              min="0"
              max="30"
              value={investmentRate}
              onChange={(e) => setInvestmentRate(e.target.value)}
              placeholder="8"
            />
            <p className="text-xs text-muted-foreground">
              Compare investing extra payments vs. paying down the mortgage
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Calculate
      </Button>
    </form>
  )
}
