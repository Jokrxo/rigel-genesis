import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './_lib/prisma'
import { TransactionPayload } from './_lib/types'
import { findAccountsByCodes, getMappingFor } from './_lib/mappings'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const body = req.body as TransactionPayload
    if (!body?.entityId || !body?.type || !body?.amount || !body?.date || !body?.description) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const mapping = await getMappingFor(body.type)

    const { debit, credit } = await findAccountsByCodes(body.entityId, mapping.debitCode, mapping.creditCode)

    const transaction = await prisma.transaction.create({
      data: {
        entityId: body.entityId,
        type: body.type,
        amount: body.amount,
        date: new Date(body.date),
        description: body.description,
        taxRule: mapping.taxRule ?? null,
      }
    })

    const journal = await prisma.journalEntry.create({
      data: {
        transactionId: transaction.id,
        date: new Date(body.date),
        debitAccountId: debit.id,
        creditAccountId: credit.id,
        amount: body.amount,
        memo: mapping.description ?? undefined,
        ledgerPostings: {
          create: [
            { accountId: debit.id, date: new Date(body.date), debit: body.amount, credit: 0 },
            { accountId: credit.id, date: new Date(body.date), debit: 0, credit: body.amount },
          ]
        }
      },
      include: { ledgerPostings: true }
    })

    const taxConfig = await prisma.taxConfig.findUnique({ where: { entityId: body.entityId } })
    let vatAmount: number | null = null
    if (mapping.taxRule && (mapping.taxRule as any)?.applyVAT === true && taxConfig) {
      vatAmount = Number(body.amount) * Number(taxConfig.vatRate)
      const vatAccountDebit = await prisma.chartOfAccount.findFirst({ where: { entityId: body.entityId, code: '6001' } }) // Expense placeholder
      const vatAccountCredit = await prisma.chartOfAccount.findFirst({ where: { entityId: body.entityId, code: '2001' } }) // Liability VAT payable
      if (vatAccountDebit && vatAccountCredit) {
        await prisma.journalEntry.create({
          data: {
            transactionId: transaction.id,
            date: new Date(body.date),
            debitAccountId: vatAccountDebit.id,
            creditAccountId: vatAccountCredit.id,
            amount: vatAmount,
            memo: 'VAT applied',
            ledgerPostings: {
              create: [
                { accountId: vatAccountDebit.id, date: new Date(body.date), debit: vatAmount, credit: 0 },
                { accountId: vatAccountCredit.id, date: new Date(body.date), debit: 0, credit: vatAmount },
              ]
            }
          }
        })
      }
    }

    res.status(201).json({ transaction, suggested: { debit, credit }, journal, vatAmount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
