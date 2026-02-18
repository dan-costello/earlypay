import { addMonths, format, isSameMonth } from "date-fns"

export interface LumpSumPayment {
  id: string
  date: string // YYYY-MM format
  amount: number
}

export interface MortgageInputs {
  originalLoanAmount: number
  interestRate: number // annual percentage, e.g. 6.5
  mortgageLengthYears: number
  currentBalance: number
  monthlyPI: number // monthly principal & interest payment (auto-calculated or overridden)
  extraMonthly: number
  extraAnnual: number
  extraAnnualMonth: number // 1-12, which month annual payment is made
  biweekly: boolean // pay every 2 weeks (13 payments/year instead of 12)
  lumpSums: LumpSumPayment[]
  investmentRate: number // annual percentage for investment comparison
}

export interface AmortizationRow {
  month: number
  date: Date
  dateLabel: string
  startBalance: number
  payment: number
  extraPayment: number
  principalPaid: number
  interestPaid: number
  endBalance: number
  totalInterestPaid: number
  totalPrincipalPaid: number
}

export interface AmortizationResult {
  schedule: AmortizationRow[]
  payoffDate: Date
  payoffDateLabel: string
  totalMonths: number
  totalInterest: number
  totalPaid: number
}

export interface InvestmentResult {
  investExtraFinalValue: number
  investExtraContributions: number
  investExtraGrowth: number
  investExtraMonthlyData: { month: number; dateLabel: string; value: number }[]

  earlyPayoffThenInvestFinalValue: number
  earlyPayoffThenInvestContributions: number
  earlyPayoffThenInvestGrowth: number
  earlyPayoffThenInvestMonthlyData: { month: number; dateLabel: string; value: number }[]

  betterStrategy: "invest" | "paydown" | "equal"
  difference: number
}

export interface CalculationResults {
  baseline: AmortizationResult
  accelerated: AmortizationResult | null
  interestSaved: number
  monthsSaved: number
  investment: InvestmentResult | null
}

/** Calculate the standard monthly P&I payment from original loan parameters */
export function calculateMonthlyPI(
  loanAmount: number,
  annualRate: number,
  termYears: number
): number {
  const r = annualRate / 100 / 12
  const n = termYears * 12
  if (r === 0) return loanAmount / n
  return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/** Get current month as YYYY-MM string and as a Date (1st of the month) */
export function getCurrentMonth(): { str: string; date: Date } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() // 0-indexed
  const date = new Date(y, m, 1)
  const str = format(date, "yyyy-MM")
  return { str, date }
}

function computeAmortization(
  startDate: Date,
  balance: number,
  monthlyRate: number,
  basePayment: number,
  extraMonthly: number,
  extraAnnual: number,
  extraAnnualMonth: number,
  lumpSums: LumpSumPayment[],
  maxMonths: number
): AmortizationResult {
  const schedule: AmortizationRow[] = []
  let currentBalance = balance
  let totalInterest = 0
  let totalPrincipal = 0
  let month = 0

  while (currentBalance > 0.01 && month < maxMonths) {
    const currentDate = addMonths(startDate, month)
    const dateLabel = format(currentDate, "MMM yyyy")
    const startBalance = currentBalance

    const interestCharge = currentBalance * monthlyRate
    const basePaymentThisMonth = Math.min(basePayment, currentBalance + interestCharge)

    let extra = extraMonthly

    if (extraAnnual > 0 && (currentDate.getMonth() + 1) === extraAnnualMonth) {
      extra += extraAnnual
    }

    for (const ls of lumpSums) {
      if (ls.amount > 0 && isSameMonth(currentDate, new Date(ls.date + "-01"))) {
        extra += ls.amount
      }
    }

    // Cap extra so we don't overpay
    const maxExtra = Math.max(0, currentBalance - (basePaymentThisMonth - interestCharge))
    extra = Math.min(extra, maxExtra)

    const totalPayment = basePaymentThisMonth + extra
    const principalPaid = Math.min(totalPayment - interestCharge, currentBalance)
    const actualPayment = principalPaid + interestCharge

    currentBalance = Math.max(0, currentBalance - principalPaid)
    totalInterest += interestCharge
    totalPrincipal += principalPaid

    schedule.push({
      month: month + 1,
      date: currentDate,
      dateLabel,
      startBalance,
      payment: actualPayment,
      extraPayment: extra,
      principalPaid,
      interestPaid: interestCharge,
      endBalance: currentBalance,
      totalInterestPaid: totalInterest,
      totalPrincipalPaid: totalPrincipal,
    })

    month++
  }

  const payoffDate = schedule.length > 0 ? schedule[schedule.length - 1].date : startDate
  return {
    schedule,
    payoffDate,
    payoffDateLabel: format(payoffDate, "MMMM yyyy"),
    totalMonths: schedule.length,
    totalInterest,
    totalPaid: totalInterest + balance,
  }
}

function computeInvestment(
  baseline: AmortizationResult,
  accelerated: AmortizationResult,
  basePayment: number,
  investmentRateAnnual: number
): InvestmentResult {
  const investMonthlyRate = investmentRateAnnual / 100 / 12
  const totalMonths = baseline.totalMonths

  let investExtraBalance = 0
  let investExtraContributions = 0
  const investExtraMonthlyData: { month: number; dateLabel: string; value: number }[] = []

  for (let i = 0; i < totalMonths; i++) {
    const extraThisMonth = i < accelerated.schedule.length
      ? accelerated.schedule[i].extraPayment
      : 0

    investExtraBalance = investExtraBalance * (1 + investMonthlyRate) + extraThisMonth
    investExtraContributions += extraThisMonth

    const dateLabel = i < baseline.schedule.length
      ? baseline.schedule[i].dateLabel
      : format(addMonths(baseline.schedule[0].date, i), "MMM yyyy")

    investExtraMonthlyData.push({
      month: i + 1,
      dateLabel,
      value: investExtraBalance,
    })
  }

  let earlyPayoffBalance = 0
  let earlyPayoffContributions = 0
  const earlyPayoffMonthlyData: { month: number; dateLabel: string; value: number }[] = []

  for (let i = 0; i < totalMonths; i++) {
    const isPaidOff = i >= accelerated.totalMonths

    if (isPaidOff) {
      const contribution = basePayment
      earlyPayoffBalance = earlyPayoffBalance * (1 + investMonthlyRate) + contribution
      earlyPayoffContributions += contribution
    } else {
      earlyPayoffBalance = earlyPayoffBalance * (1 + investMonthlyRate)
    }

    const dateLabel = i < baseline.schedule.length
      ? baseline.schedule[i].dateLabel
      : format(addMonths(baseline.schedule[0].date, i), "MMM yyyy")

    earlyPayoffMonthlyData.push({
      month: i + 1,
      dateLabel,
      value: earlyPayoffBalance,
    })
  }

  const interestSaved = baseline.totalInterest - accelerated.totalInterest
  const paydownTotalBenefit = earlyPayoffBalance + interestSaved

  const betterStrategy: "invest" | "paydown" | "equal" =
    investExtraBalance > paydownTotalBenefit
      ? "invest"
      : investExtraBalance < paydownTotalBenefit
        ? "paydown"
        : "equal"

  return {
    investExtraFinalValue: investExtraBalance,
    investExtraContributions,
    investExtraGrowth: investExtraBalance - investExtraContributions,

    earlyPayoffThenInvestFinalValue: earlyPayoffBalance,
    earlyPayoffThenInvestContributions: earlyPayoffContributions,
    earlyPayoffThenInvestGrowth: earlyPayoffBalance - earlyPayoffContributions,

    investExtraMonthlyData,
    earlyPayoffThenInvestMonthlyData: earlyPayoffMonthlyData,

    betterStrategy,
    difference: Math.abs(investExtraBalance - paydownTotalBenefit),
  }
}

export function calculate(inputs: MortgageInputs): CalculationResults {
  const monthlyRate = inputs.interestRate / 100 / 12
  const startDate = getCurrentMonth().date // always start from current month
  const maxMonths = inputs.mortgageLengthYears * 12

  // Biweekly: 26 half-payments/year = 13 full payments instead of 12
  // The extra is equivalent to monthlyPI / 12 added each month
  const biweeklyExtra = inputs.biweekly ? inputs.monthlyPI / 12 : 0

  const baseline = computeAmortization(
    startDate,
    inputs.currentBalance,
    monthlyRate,
    inputs.monthlyPI,
    0,
    0,
    1,
    [],
    maxMonths * 2
  )

  const effectiveExtraMonthly = inputs.extraMonthly + biweeklyExtra

  const hasExtraPayments =
    effectiveExtraMonthly > 0 ||
    inputs.extraAnnual > 0 ||
    inputs.lumpSums.some((ls) => ls.amount > 0)

  let accelerated: AmortizationResult | null = null
  let interestSaved = 0
  let monthsSaved = 0
  let investment: InvestmentResult | null = null

  if (hasExtraPayments) {
    accelerated = computeAmortization(
      startDate,
      inputs.currentBalance,
      monthlyRate,
      inputs.monthlyPI,
      effectiveExtraMonthly,
      inputs.extraAnnual,
      inputs.extraAnnualMonth,
      inputs.lumpSums,
      maxMonths * 2
    )

    interestSaved = baseline.totalInterest - accelerated.totalInterest
    monthsSaved = baseline.totalMonths - accelerated.totalMonths

    if (inputs.investmentRate > 0) {
      investment = computeInvestment(
        baseline,
        accelerated,
        inputs.monthlyPI,
        inputs.investmentRate
      )
    }
  }

  return {
    baseline,
    accelerated,
    interestSaved,
    monthsSaved,
    investment,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCurrencyExact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
