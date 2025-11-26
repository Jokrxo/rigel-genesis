const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const templates = await prisma.fooCoaTemplate.count()
  if (templates === 0) {
    const baseAccounts = [
      { code: '1001', name: 'Cash', type: 'ASSET' },
      { code: '1101', name: 'Accounts Receivable', type: 'ASSET' },
      { code: '1201', name: 'Inventory', type: 'ASSET' },
      { code: '1601', name: 'Fixed Assets', type: 'ASSET' },
      { code: '1701', name: 'Accumulated Depreciation', type: 'CONTRA_ASSET' },
      { code: '2001', name: 'Accounts Payable', type: 'LIABILITY' },
      { code: '3001', name: "Owner's Equity", type: 'EQUITY' },
      { code: '3101', name: 'Retained Earnings', type: 'EQUITY' },
      { code: '4001', name: 'Sales Revenue', type: 'REVENUE' },
      { code: '5001', name: 'Cost of Goods Sold', type: 'EXPENSE' },
      { code: '6001', name: 'Operating Expenses', type: 'EXPENSE' },
      { code: '6101', name: 'Depreciation Expense', type: 'EXPENSE' },
    ]
    await prisma.fooCoaTemplate.createMany({
      data: [
        { name: 'Sole Proprietorship COA', ownership: 'sole', accounts: baseAccounts },
        { name: 'Partnership COA', ownership: 'partnership', accounts: baseAccounts },
        { name: 'LLC COA', ownership: 'llc', accounts: baseAccounts.map(a => a.code === '3001' ? { ...a, name: 'Members Equity' } : a) },
        { name: 'Corporation COA', ownership: 'corp', accounts: baseAccounts.map(a => a.code === '3001' ? { ...a, name: 'Share Capital' } : a) },
      ]
    })
    console.log('Seeded FOO COA templates')
  }

  const mappings = await prisma.transactionTypeMapping.count()
  if (mappings === 0) {
    const data = [
      { type: 'sale_cash', debitCode: '1001', creditCode: '4001', description: 'Cash sale', isActive: true },
      { type: 'sale_credit', debitCode: '1101', creditCode: '4001', description: 'Credit sale', isActive: true },
      { type: 'purchase_inventory', debitCode: '1201', creditCode: '2001', description: 'Inventory purchase on credit', isActive: true },
      { type: 'asset_purchase_cash', debitCode: '1601', creditCode: '1001', description: 'Fixed asset purchase cash', isActive: true },
      { type: 'asset_purchase_credit', debitCode: '1601', creditCode: '2001', description: 'Fixed asset purchase on credit', isActive: true },
      { type: 'monthly_depreciation', debitCode: '6101', creditCode: '1701', description: 'Monthly depreciation', isActive: true },
      { type: 'disposal_cost_remove', debitCode: '1701', creditCode: '1601', description: 'Remove cost via accumulated depreciation', isActive: true },
      { type: 'disposal_sale_cash', debitCode: '1001', creditCode: '1601', description: 'Record disposal cash proceeds', isActive: true },
      { type: 'disposal_sale_credit', debitCode: '1101', creditCode: '1601', description: 'Record disposal credit proceeds', isActive: true },
      { type: 'disposal_gain', debitCode: '1601', creditCode: '4001', description: 'Gain on disposal', isActive: true },
      { type: 'disposal_loss', debitCode: '6001', creditCode: '1601', description: 'Loss on disposal', isActive: true },
    ]
    await prisma.transactionTypeMapping.createMany({ data })
    console.log('Seeded transaction type mappings')
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})