import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { GeneralLedgerTable } from '@/components/GeneralLedger/GeneralLedgerTable';

const GeneralLedger = () => {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
          <p className="text-muted-foreground mt-2">
            Complete record of all financial transactions.
          </p>
          <p className="text-sm text-blue-600 mt-1">
             Note: This report strictly follows IFRS and IAS guidelines.
          </p>
        </div>
        <GeneralLedgerTable />
      </div>
    </MainLayout>
  );
};

export default GeneralLedger;
