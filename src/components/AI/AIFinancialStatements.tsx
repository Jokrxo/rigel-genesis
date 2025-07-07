
import { useState } from "react";
import { StatementGenerationForm } from './components/StatementGenerationForm';
import { GeneratedStatementDisplay } from './components/GeneratedStatementDisplay';
import { GeneratedStatement } from './types/financialStatementTypes';

export const AIFinancialStatements = () => {
  const [generatedStatement, setGeneratedStatement] = useState<GeneratedStatement | null>(null);

  const handleStatementGenerated = (statement: GeneratedStatement) => {
    setGeneratedStatement(statement);
  };

  return (
    <div className="space-y-8">
      <StatementGenerationForm onStatementGenerated={handleStatementGenerated} />
      {generatedStatement && (
        <GeneratedStatementDisplay statement={generatedStatement} />
      )}
    </div>
  );
};
