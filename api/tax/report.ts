import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './_lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const entityId = (req.query.entityId as string) || ''
    if (!entityId) {
      res.status(400).json({ error: 'Missing entityId' })
      return
    }
    const config = await prisma.taxConfig.findUnique({ where: { entityId } })
    const postings = await prisma.ledgerPosting.findMany({
      where: { account: { entityId } },
      include: { account: true }
    })

    const vatRate = Number(config?.vatRate ?? 0.15)
    const revenue = postings
      .filter(p => p.account.type === 'REVENUE')
      .reduce((sum, p) => sum + Number(p.credit) - Number(p.debit), 0)
    const expenses = postings
      .filter(p => p.account.type === 'EXPENSE')
      .reduce((sum, p) => sum + Number(p.debit) - Number(p.credit), 0)

    const vatDue = revenue * vatRate
    const depreciationExpense = postings
      .filter(p => p.account.code === '6101')
      .reduce((sum, p) => sum + Number(p.debit) - Number(p.credit), 0)

    const taxableIncome = revenue - expenses
    const corpTax = config?.corpTaxBracket ? computeCorpTax(taxableIncome, config.corpTaxBracket as any) : taxableIncome * 0.27

    res.status(200).json({ vatRate, vatDue, revenue, expenses, depreciationExpense, taxableIncome, corpTax })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

function computeCorpTax(income: number, brackets: { rate: number, threshold: number }[]) {
  if (!Array.isArray(brackets) || brackets.length === 0) return income * 0.27
  brackets.sort((a, b) => a.threshold - b.threshold)
  let tax = 0
  let prev = 0
  for (const b of brackets) {
    if (income > b.threshold) {
      tax += (b.threshold - prev) * b.rate
      prev = b.threshold
    } else {
      tax += (income - prev) * b.rate
      return tax
    }
  }
  tax += (income - prev) * brackets[brackets.length - 1].rate
  return tax
}

