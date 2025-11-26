export type OwnershipForm = 'sole' | 'partnership' | 'llc' | 'corp'

export interface EntitySetupPayload {
  name: string
  address?: string
  ownership: OwnershipForm
  fiscalYearStartMonth?: number
}

export interface TransactionPayload {
  entityId: string
  type: string
  amount: number
  date: string
  description: string
}

export interface DisposalPayload {
  sellingPrice: number
  disposalDate: string
  method: 'cash' | 'credit'
}