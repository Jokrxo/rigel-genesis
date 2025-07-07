
import { MainLayout } from "@/components/Layout/MainLayout";
import ImportStatementPage from "@/components/ImportStatement/ImportStatementPage";
import { Chatbot } from "@/components/Shared/Chatbot";

const ImportStatement = () => {
  return (
    <MainLayout>
      <ImportStatementPage />
      <Chatbot />
    </MainLayout>
  );
};

export default ImportStatement;
