import PDFDocument from 'pdfkit'

export function exportTrialBalancePDF(rows: { code: string, name: string, type: string, debit: number, credit: number }[], totals: { debit: number, credit: number }) {
  const doc = new PDFDocument({ margin: 40 })
  const chunks: Buffer[] = []
  doc.on('data', (c) => chunks.push(c))
  return new Promise<Blob>((resolve) => {
    doc.on('end', () => {
      const blob = new Blob(chunks, { type: 'application/pdf' })
      resolve(blob)
    })
    doc.fontSize(18).text('Trial Balance', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12)
    rows.forEach(r => {
      doc.text(`${r.code}  ${r.name}  ${r.type}  Dr ${r.debit.toFixed(2)}  Cr ${r.credit.toFixed(2)}`)
    })
    doc.moveDown()
    doc.text(`Totals  Dr ${totals.debit.toFixed(2)}  Cr ${totals.credit.toFixed(2)}`)
    doc.end()
  })
}

