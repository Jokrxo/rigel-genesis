import { MainLayout } from "@/components/Layout/MainLayout";
import ReportsGenerator from "@/components/Reports/ReportsGenerator";
import { Chatbot } from "@/components/Shared/Chatbot";

const Reports = () => {
  return (
    <MainLayout>
      <ReportsGenerator />
      <Chatbot />
    </MainLayout>
  );
};

export default Reports;
