export function monthsBetween(start: Date, end: Date) {
  return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()))
}

export function computeDepreciationTillDisposal(costPrice: number, annualRatePct: number, purchaseDate: Date, disposalDate: Date) {
  const months = monthsBetween(purchaseDate, disposalDate)
  const monthlyRate = annualRatePct / 100 / 12
  const monthlyDep = costPrice * monthlyRate
  const total = monthlyDep * months
  return Math.min(total, costPrice)
}

export function computeGainLoss(costPrice: number, accumDepTillDisposal: number, sellingPrice: number) {
  const nbv = Math.max(0, costPrice - Math.min(accumDepTillDisposal, costPrice))
  return sellingPrice - nbv
}

