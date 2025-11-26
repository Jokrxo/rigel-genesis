import { computeDepreciationTillDisposal, computeGainLoss, monthsBetween } from '@/accounting/logic'

test('monthsBetween computes whole months', () => {
  expect(monthsBetween(new Date('2024-01-15'), new Date('2024-06-10'))).toBe(5)
})

test('depreciation capped at cost price', () => {
  const total = computeDepreciationTillDisposal(1000, 12, new Date('2020-01-01'), new Date('2030-01-01'))
  expect(Math.round(total)).toBe(1000)
})

test('gain on disposal', () => {
  const dep = computeDepreciationTillDisposal(10000, 12, new Date('2024-01-01'), new Date('2024-07-01'))
  const gainLoss = computeGainLoss(10000, dep, 9500)
  // 6 months depreciation at 1% per month = 600, NBV = 9400, selling 9500 => gain 100
  expect(Math.round(dep)).toBe(600)
  expect(Math.round(gainLoss)).toBe(100)
})

