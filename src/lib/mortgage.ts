import { addMonths, format, isAfter, isSameMonth } from "date-fns"

export interface LumpSumPayment {
  id: string
  date: string // YYYY-MM format
  amount: number
}

export interface MortgageInputs {
  startDate: string // YYYY-MM format
  interestRate: number // annual percentage, e.g. 6.5
  mortgageLengthYears: number
  currentBalance: number
  currentPI: number // monthly principal & interest payment
  extraMonthly: number
  extraAnnual: number
  extraAnnualMonth: number // 1-12, which month annual payment is made
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
  // Scenario A: invest the extra payments instead, keep mortgage at minimum
  investExtraFinalValue: number
  investExtraContributions: number
  investExtraGrowth: number
  investExtraMonthlyData: { month: number; dateLabel: string; value: number }[]

  // Scenario B: pay off mortgage early, then invest full P&I for remaining term
  earlyPayoffThenInvestFinalValue: number
  earlyPayoffThenInvestContributions: number
  earlyPayoffThenInvestGrowth: number
  earlyPayoffThenInvestMonthlyData: { month: number; dateLabel: string; value: number }[]

  // Net comparison
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

    // Annual extra payment
    if (extraAnnual > 0 && (currentDate.getMonth() + 1) === extraAnnualMonth) {
      extra += extraAnnual
    }

    // Lump sum payments
    for (const ls of lumpSums) {
      if (ls.amount > 0 && isSameMonth(currentDate, new Date(ls.date + "-01"))) {
        extra += ls.amount
      }
    }

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
  monthlyRate: number,
  basePayment: number,
  investmentRateAnnual: number
): InvestmentResult {
  const investMonthlyRate = investmentRateAnnual / 100 / 12
  const totalMonths = baseline.totalMonths // comparison horizon is the original mortgage term

  // Scenario A: invest the extra payments instead of paying down mortgage
  let investExtraBalance = 0
  let investExtraContributions = 0
  const investExtraMonthlyData: { month: number; dateLabel: string; value: number }[] = []

  for (let i = 0; i < totalMonths; i++) {
    // The extra amount that would have been paid in the accelerated schedule
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

  // Scenario B: pay off mortgage early, then invest full P&I for remaining months
  let earlyPayoffBalance = 0
  let earlyPayoffContributions = 0
  const earlyPayoffMonthlyData: { month: number; dateLabel: string; value: number }[] = []

  for (let i = 0; i < totalMonths; i++) {
    const isPaidOff = i >= accelerated.totalMonths

    if (isPaidOff) {
      // After payoff, invest the full P&I amount plus the extra amounts
      const extraThisMonth = i < accelerated.schedule.length
        ? accelerated.schedule[i].extraPayment
        : 0
      const contribution = basePayment + extraThisMonth
      earlyPayoffBalance = earlyPayoffBalance * (1 + investMonthlyRate) + contribution
      earlyPayoffContributions += contribution
    } else {
      // Before payoff, just compound what's already there (nothing extra to invest)
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

  // Also account for the interest saved by paying off early
  const interestSaved = baseline.totalInterest - accelerated.totalInterest
  // The paydown strategy total wealth = investment growth + interest saved
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
  const startDate = new Date(inputs.startDate + "-01")
  const maxMonths = inputs.mortgageLengthYears * 12

  // Baseline: minimum payments only
  const baseline = computeAmortization(
    startDate,
    inputs.currentBalance,
    monthlyRate,
    inputs.currentPI,
    0,
    0,
    1,
    [],
    maxMonths * 2 // allow extra buffer
  )

  const hasExtraPayments =
    inputs.extraMonthly > 0 ||
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
      inputs.currentPI,
      inputs.extraMonthly,
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
        monthlyRate,
        inputs.currentPI,
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
