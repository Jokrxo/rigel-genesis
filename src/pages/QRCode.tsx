
import { MainLayout } from "@/components/Layout/MainLayout";
import { QRCodeGenerator } from "@/components/Shared/QRCodeGenerator";
import { Chatbot } from "@/components/Shared/Chatbot";

const QRCode = () => {
  return (
    <MainLayout>
      <QRCodeGenerator />
    </MainLayout>
  );
};

export default QRCode;
