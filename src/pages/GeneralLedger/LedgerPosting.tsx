import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { LedgerPostingForm } from '@/components/GeneralLedger/LedgerPostingForm';

const LedgerPosting = () => {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledger Posting</h1>
          <p className="text-muted-foreground mt-2">
            Manually post transactions to the general ledger. Ensure all entries comply with IFRS standards.
          </p>
        </div>
        <LedgerPostingForm />
      </div>
    </MainLayout>
  );
};

export default LedgerPosting;
