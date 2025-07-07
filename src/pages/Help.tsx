
import { MainLayout } from "@/components/Layout/MainLayout";
import { HelpResources } from "@/components/HelpCenter/HelpResources";
import { Chatbot } from "@/components/Shared/Chatbot";

const Help = () => {
  return (
    <MainLayout>
      <HelpResources />
      <Chatbot />
    </MainLayout>
  );
};

export default Help;
