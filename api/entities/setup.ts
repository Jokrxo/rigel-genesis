import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../_lib/prisma'
import { EntitySetupPayload } from '../_lib/types'
import { seedEntityChartOfAccounts } from '../_lib/mappings'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const body = req.body as EntitySetupPayload
    if (!body?.name || !body?.ownership) {
      res.status(400).json({ error: 'Missing required fields: name, ownership' })
      return
    }

    const entity = await prisma.entity.create({
      data: {
        name: body.name,
        address: body.address,
        ownership: body.ownership as any,
        taxConfig: {
          create: {
            vatRate: 0.15,
            depreciationMethod: 'monthly',
          }
        }
      },
      include: { taxConfig: true }
    })

    await seedEntityChartOfAccounts(entity.id, entity.ownership as any)

    const accounts = await prisma.chartOfAccount.findMany({ where: { entityId: entity.id } })

    res.status(201).json({ entity, accountsPreview: accounts })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

