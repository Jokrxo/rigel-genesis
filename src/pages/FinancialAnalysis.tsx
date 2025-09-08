import { MainLayout } from "@/components/Layout/MainLayout";
import { FinancialAnalysisEngine } from "@/components/FinancialAnalysis/FinancialAnalysisEngine";
import { Chatbot } from "@/components/Shared/Chatbot";

const FinancialAnalysis = () => {
  return (
    <MainLayout>
      <FinancialAnalysisEngine />
      <Chatbot />
    </MainLayout>
  );
};

export default FinancialAnalysis;