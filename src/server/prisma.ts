import { PrismaClient, Transaction } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ['warn', 'error'] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

prisma.$use(async (params, next) => {
  const result = await next(params)
  if (params.model === 'Transaction' && params.action === 'create') {
    try {
      // Dynamically import mapping helpers to avoid circular dependency
      const { getMappingFor, findAccountsByCodes } = await import('../../api/_lib/mappings')
      const tx = result as Transaction
      const mapping = await getMappingFor(tx.type)
      const { debit, credit } = await findAccountsByCodes(tx.entityId, mapping.debitCode, mapping.creditCode)
      await prisma.journalEntry.create({
        data: {
          transactionId: tx.id,
          date: tx.date,
          debitAccountId: debit.id,
          creditAccountId: credit.id,
          amount: tx.amount,
          memo: mapping.description ?? undefined,
          ledgerPostings: {
            create: [
              { accountId: debit.id, date: tx.date, debit: tx.amount, credit: 0 },
              { accountId: credit.id, date: tx.date, debit: 0, credit: tx.amount },
            ]
          }
        }
      })
    } catch (e) {
      // swallow middleware errors to not block original transaction
      console.error('Journal auto-create failed', e)
    }
  }
  return result
})

