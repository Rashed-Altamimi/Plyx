// Pure finance math. No React / no DOM — reusable & unit-testable.

export interface CompoundInput {
  principal: number
  annualRate: number      // %, e.g. 7 for 7%
  years: number
  compoundsPerYear: number
  contribution: number    // per-period contribution
  contributionAtStart: boolean
}

export interface CompoundYearly {
  year: number
  startBalance: number
  contributions: number
  interest: number
  endBalance: number
}

export interface CompoundResult {
  finalBalance: number
  totalContributions: number
  totalInterest: number
  yearly: CompoundYearly[]
}

export function compound({
  principal,
  annualRate,
  years,
  compoundsPerYear,
  contribution,
  contributionAtStart,
}: CompoundInput): CompoundResult {
  const n = Math.max(1, Math.floor(compoundsPerYear))
  const rate = annualRate / 100 / n
  const totalPeriods = Math.max(0, Math.round(years * n))

  let balance = principal
  let totalContributions = principal
  const yearly: CompoundYearly[] = []
  let yearStart = balance
  let yearContrib = 0
  let yearInterest = 0

  for (let i = 1; i <= totalPeriods; i++) {
    if (contributionAtStart) {
      balance += contribution
      yearContrib += contribution
      totalContributions += contribution
    }
    const interest = balance * rate
    balance += interest
    yearInterest += interest

    if (!contributionAtStart) {
      balance += contribution
      yearContrib += contribution
      totalContributions += contribution
    }

    if (i % n === 0 || i === totalPeriods) {
      yearly.push({
        year: Math.ceil(i / n),
        startBalance: yearStart,
        contributions: yearContrib,
        interest: yearInterest,
        endBalance: balance,
      })
      yearStart = balance
      yearContrib = 0
      yearInterest = 0
    }
  }

  return {
    finalBalance: balance,
    totalContributions,
    totalInterest: balance - totalContributions,
    yearly,
  }
}

// --- Mortgage amortization ---------------------------------------------------

export interface MortgageInput {
  principal: number       // loan amount
  annualRate: number      // %
  termYears: number
  extraMonthly?: number   // optional extra payment each month
}

export interface AmortizationRow {
  month: number
  payment: number
  interest: number
  principal: number
  extra: number
  balance: number
}

export interface MortgageResult {
  monthlyPayment: number
  totalPaid: number
  totalInterest: number
  months: number
  schedule: AmortizationRow[]
}

export function mortgage({
  principal,
  annualRate,
  termYears,
  extraMonthly = 0,
}: MortgageInput): MortgageResult {
  const r = annualRate / 100 / 12
  const n = Math.max(1, Math.round(termYears * 12))

  // Standard amortization formula. Handle r == 0 (interest-free) separately.
  const basePayment = r === 0
    ? principal / n
    : (principal * r) / (1 - Math.pow(1 + r, -n))

  const schedule: AmortizationRow[] = []
  let balance = principal
  let totalInterest = 0
  let totalPaid = 0
  let monthsUsed = 0

  for (let i = 1; i <= n && balance > 0.005; i++) {
    const interest = balance * r
    let principalPayment = basePayment - interest
    let extra = extraMonthly

    // Don't overpay on the final payment
    if (principalPayment + extra > balance) {
      const remaining = balance
      principalPayment = Math.max(0, Math.min(principalPayment, remaining))
      extra = Math.max(0, remaining - principalPayment)
    }

    const payment = principalPayment + interest + extra
    balance = Math.max(0, balance - principalPayment - extra)
    totalInterest += interest
    totalPaid += payment
    monthsUsed = i

    schedule.push({
      month: i,
      payment,
      interest,
      principal: principalPayment,
      extra,
      balance,
    })

    if (balance < 0.005) break
  }

  return {
    monthlyPayment: basePayment,
    totalPaid,
    totalInterest,
    months: monthsUsed,
    schedule,
  }
}
