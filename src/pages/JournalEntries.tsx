import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { JournalEntryManager } from '@/components/Journals/JournalEntryManager';

const JournalEntries = () => {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-muted-foreground mt-2">
            View, create, and manage manual journal entries.
          </p>
        </div>
        <JournalEntryManager />
      </div>
    </MainLayout>
  );
};

export default JournalEntries;
