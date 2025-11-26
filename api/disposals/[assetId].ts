import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../_lib/prisma'
import { DisposalPayload } from '../_lib/types'
import { getMappingFor, findAccountsByCodes } from '../_lib/mappings'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const assetId = (req.query.assetId as string) || ''
    const body = req.body as DisposalPayload

    const asset = await prisma.fixedAsset.findUnique({ where: { id: assetId } })
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }
    const entityId = asset.entityId
    const disposalDate = new Date(body.disposalDate)

    const monthsOwned = Math.max(0, (disposalDate.getFullYear() - asset.purchaseDate.getFullYear()) * 12 + (disposalDate.getMonth() - asset.purchaseDate.getMonth()))
    const monthlyRate = Number(asset.depreciationRate) / 12
    const monthlyDep = Number(asset.costPrice) * monthlyRate
    const totalDepTillDisposal = Math.min(Number(asset.costPrice), monthlyDep * monthsOwned)
    const accumBefore = Number(asset.accumDepr)
    const requiredDepAdjustment = Math.max(0, totalDepTillDisposal - accumBefore)

    if (requiredDepAdjustment > 0) {
      const mapping = await getMappingFor('monthly_depreciation')
      const { debit, credit } = await findAccountsByCodes(entityId, mapping.debitCode, mapping.creditCode)
      await prisma.journalEntry.create({
        data: {
          transaction: { create: { entityId, date: disposalDate, description: 'Depreciation catch-up before disposal', amount: requiredDepAdjustment, type: 'monthly_depreciation' } },
          date: disposalDate,
          debitAccountId: debit.id,
          creditAccountId: credit.id,
          amount: requiredDepAdjustment,
          memo: 'Depreciation catch-up',
          ledgerPostings: { create: [
            { accountId: debit.id, date: disposalDate, debit: requiredDepAdjustment, credit: 0 },
            { accountId: credit.id, date: disposalDate, debit: 0, credit: requiredDepAdjustment },
          ] }
        }
      })
    }

    {
      const mapping = await getMappingFor('disposal_cost_remove')
      const { debit, credit } = await findAccountsByCodes(entityId, mapping.debitCode, mapping.creditCode)
      await prisma.journalEntry.create({
        data: {
          transaction: { create: { entityId, date: disposalDate, description: 'Remove asset cost on disposal', amount: Number(asset.costPrice), type: 'disposal_cost_remove' } },
          date: disposalDate,
          debitAccountId: debit.id,
          creditAccountId: credit.id,
          amount: Number(asset.costPrice),
          memo: 'Remove asset cost',
          ledgerPostings: { create: [
            { accountId: debit.id, date: disposalDate, debit: Number(asset.costPrice), credit: 0 },
            { accountId: credit.id, date: disposalDate, debit: 0, credit: Number(asset.costPrice) },
          ] }
        }
      })
    }

    const saleType = body.method === 'cash' ? 'disposal_sale_cash' : 'disposal_sale_credit'
    {
      const mapping = await getMappingFor(saleType)
      const { debit, credit } = await findAccountsByCodes(entityId, mapping.debitCode, mapping.creditCode)
      await prisma.journalEntry.create({
        data: {
          transaction: { create: { entityId, date: disposalDate, description: 'Asset disposal proceeds', amount: body.sellingPrice, type: saleType } },
          date: disposalDate,
          debitAccountId: debit.id,
          creditAccountId: credit.id,
          amount: body.sellingPrice,
          memo: 'Disposal proceeds',
          ledgerPostings: { create: [
            { accountId: debit.id, date: disposalDate, debit: body.sellingPrice, credit: 0 },
            { accountId: credit.id, date: disposalDate, debit: 0, credit: body.sellingPrice },
          ] }
        }
      })
    }

    const netBookValue = Math.max(0, Number(asset.costPrice) - Math.min(totalDepTillDisposal, Number(asset.costPrice)))
    const gainLoss = Number(body.sellingPrice) - netBookValue
    if (gainLoss !== 0) {
      const mappingType = gainLoss > 0 ? 'disposal_gain' : 'disposal_loss'
      const mapping = await getMappingFor(mappingType)
      const { debit, credit } = await findAccountsByCodes(entityId, mapping.debitCode, mapping.creditCode)
      const amount = Math.abs(gainLoss)
      const journal = await prisma.journalEntry.create({
        data: {
          transaction: { create: { entityId, date: disposalDate, description: gainLoss > 0 ? 'Gain on disposal' : 'Loss on disposal', amount, type: mappingType } },
          date: disposalDate,
          debitAccountId: debit.id,
          creditAccountId: credit.id,
          amount,
          memo: gainLoss > 0 ? 'Gain on disposal' : 'Loss on disposal',
          ledgerPostings: { create: [
            { accountId: debit.id, date: disposalDate, debit: amount, credit: 0 },
            { accountId: credit.id, date: disposalDate, debit: 0, credit: amount },
          ] }
        }
      })
      await prisma.disposal.create({
        data: {
          assetId,
          disposalDate,
          sellingPrice: body.sellingPrice,
          method: body.method,
          profitLoss: gainLoss,
          journalEntryId: journal.id,
        }
      })
    } else {
      await prisma.disposal.create({
        data: {
          assetId,
          disposalDate,
          sellingPrice: body.sellingPrice,
          method: body.method,
          profitLoss: 0,
        }
      })
    }

    await prisma.fixedAsset.update({
      where: { id: assetId },
      data: { disposalDate, sellingPrice: body.sellingPrice }
    })

    res.status(201).json({ result: 'ok', profitLoss: gainLoss })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
