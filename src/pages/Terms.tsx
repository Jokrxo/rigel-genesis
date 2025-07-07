
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose prose-sm max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Rigel. These Terms of Service govern your use of our website and services.
            By accessing or using the Rigel platform, you agree to be bound by these Terms.
            If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2>2. Definitions</h2>
          <p>
            <strong>"Service"</strong> refers to the Rigel web application accessible from www.rigel.com<br />
            <strong>"Terms"</strong> refers to these Terms of Service<br />
            <strong>"You"</strong> refers to the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service<br />
            <strong>"Company"</strong> refers to Creative Commerce (Pty) Ltd
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To use certain features of the Service, you must register for an account. You must provide accurate and complete information and keep your account information updated. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2>4. Subscription and Payments</h2>
          <p>
            Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis, depending on the type of subscription plan you select. At the end of each period, your subscription will automatically renew under the exact same conditions unless you cancel it or the Company cancels it.
          </p>

          <h2>5. Free Trial</h2>
          <p>
            The Company may, at its sole discretion, offer a subscription with a free trial for a limited period of time. You may be required to enter your billing information to sign up for the free trial. If you do enter your billing information, you will not be charged by the Company until the free trial has expired.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Creative Commerce (Pty) Ltd and its licensors. The Service is protected by copyright, trademark, and other laws of both South Africa and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Creative Commerce (Pty) Ltd.
          </p>

          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the Service.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall Creative Commerce (Pty) Ltd, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:<br />
            Email: luthando@stella-lumen.com<br />
            Phone: 073 988 2190
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;
