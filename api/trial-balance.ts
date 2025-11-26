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

    const accounts = await prisma.chartOfAccount.findMany({ where: { entityId } })
    const postings = await prisma.ledgerPosting.findMany({ where: { account: { entityId } }, include: { account: true } })

    const byAccount: Record<string, { code: string, name: string, type: string, debit: number, credit: number }> = {}
    for (const p of postings) {
      const a = p.account
      if (!byAccount[a.id]) byAccount[a.id] = { code: a.code, name: a.name, type: a.type, debit: 0, credit: 0 }
      byAccount[a.id].debit += Number(p.debit)
      byAccount[a.id].credit += Number(p.credit)
    }

    const rows = Object.values(byAccount)
    const totals = rows.reduce((acc, r) => ({ debit: acc.debit + r.debit, credit: acc.credit + r.credit }), { debit: 0, credit: 0 })

    res.status(200).json({ accountsCount: accounts.length, rows, totals })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

