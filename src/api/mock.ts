type OwnershipForm = 'sole' | 'partnership' | 'llc' | 'corp'

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

function seedAccounts(ownership: OwnershipForm) {
  const variant = baseAccounts.map(a => {
    if (ownership === 'llc' && a.code === '3001') return { ...a, name: 'Members Equity' }
    if (ownership === 'corp' && a.code === '3001') return { ...a, name: 'Share Capital' }
    return a
  })
  return variant.map((a, i) => ({ id: `acc-${i}`, ...a }))
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function pdfResponse(text: string) {
  const blob = new Blob([text], { type: 'application/pdf' })
  return new Response(blob, { status: 200, headers: { 'Content-Type': 'application/pdf' } })
}

export async function mockFetch(path: string, init?: RequestInit) {
  const method = (init?.method || 'GET').toUpperCase()
  if (path === '/api/entities/setup' && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {}
    const accounts = seedAccounts(body.ownership || 'sole')
    return jsonResponse({ entity: { id: 'demo', name: body.name, ownership: body.ownership }, accountsPreview: accounts }, 201)
  }
  if (path === '/api/transactions' && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {}
    const mapping = body.type === 'sale_credit' ? { debit: { name: 'Accounts Receivable' }, credit: { name: 'Sales Revenue' } } : { debit: { name: 'Cash' }, credit: { name: 'Sales Revenue' } }
    return jsonResponse({ transaction: { id: 't1' }, suggested: { debit: { name: mapping.debit.name }, credit: { name: mapping.credit.name } }, journal: { id: 'j1' } }, 201)
  }
  if (path.startsWith('/api/disposals/') && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {}
    const cost = 10000
    const depRate = 12
    const purchaseDate = new Date('2024-01-01')
    const disposalDate = new Date(body.disposalDate || '2024-07-01')
    const months = Math.max(0, (disposalDate.getFullYear() - purchaseDate.getFullYear()) * 12 + (disposalDate.getMonth() - purchaseDate.getMonth()))
    const monthlyRate = depRate / 100 / 12
    const totalDep = Math.min(cost, cost * monthlyRate * months)
    const nbv = Math.max(0, cost - totalDep)
    const gainLoss = Number(body.sellingPrice || 9500) - nbv
    return jsonResponse({ result: 'ok', profitLoss: gainLoss }, 201)
  }
  if (path.startsWith('/api/tax/report') && method === 'GET') {
    return jsonResponse({ vatRate: 0.15, vatDue: 1500, revenue: 10000, expenses: 3000, depreciationExpense: 600, taxableIncome: 7000, corpTax: 1890 })
  }
  if (path.startsWith('/api/trial-balance') && method === 'GET') {
    const rows = [
      { code: '1001', name: 'Cash', type: 'ASSET', debit: 5000, credit: 0 },
      { code: '4001', name: 'Sales Revenue', type: 'REVENUE', debit: 0, credit: 5000 },
    ]
    const totals = { debit: 5000, credit: 5000 }
    return jsonResponse({ accountsCount: 12, rows, totals })
  }
  if (path.startsWith('/api/reports/trial-balance') && method === 'GET') {
    return pdfResponse('Trial Balance PDF')
  }
  return jsonResponse({ error: 'Not Found in mock' }, 404)
}