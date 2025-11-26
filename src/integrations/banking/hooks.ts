export async function scheduleBankSync() {
  return { status: 'scheduled' }
}

export async function fetchBankStatementPreview() {
  return { transactions: [], balance: 0 }
}