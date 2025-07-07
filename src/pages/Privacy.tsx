
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose prose-sm max-w-none text-justify">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="font-semibold">POPIA Compliance Statement</p>
            <p>
              Creative Commerce (Pty) Ltd is fully committed to compliance with the Protection of Personal Information Act (POPIA) of South Africa. 
              All personal information collected through this application is processed in accordance with POPIA requirements. 
              We respect your privacy rights and are committed to securing your personal information.
            </p>
          </div>
          
          <h2>1. Introduction</h2>
          <p>
            Your privacy is important to us. It is Creative Commerce (Pty) Ltd's policy to respect your privacy regarding any information we may collect from you across our website, Rigel, and other sites or services we own and operate.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We only collect information about you if we have a reason to do so—for example, to provide our Services, to communicate with you, or to make our Services better. We collect information in three ways: if and when you provide information to us, automatically through operating our Services, and from outside sources.
          </p>

          <h3>Information You Provide to Us</h3>
          <p>
            It's probably no surprise that we collect information that you provide to us. The amount and type of information depends on the context and how we use the information. Here are some examples:
          </p>
          <ul>
            <li><strong>Basic Account Information:</strong> We ask for basic information from you in order to set up your account.</li>
            <li><strong>Business Profile:</strong> If you have a business account with us, we collect information to set up your business profile.</li>
            <li><strong>Transaction and Billing Information:</strong> If you buy something from us, you will provide additional personal and payment information.</li>
            <li><strong>Communications with Us:</strong> You may also provide us information when you respond to surveys, communicate with our support team, or post a question in our public forums.</li>
          </ul>

          <h3>Information We Collect Automatically</h3>
          <p>
            We also collect some information automatically:
          </p>
          <ul>
            <li><strong>Log Information:</strong> Like most online service providers, we collect information that web browsers, mobile devices, and servers typically make available.</li>
            <li><strong>Usage Information:</strong> We collect information about your usage of our Services.</li>
            <li><strong>Location Information:</strong> We may determine the approximate location of your device from your IP address.</li>
            <li><strong>Information from Cookies & Other Technologies:</strong> A cookie is a string of information that a website stores on a visitor's computer, and that the visitor's browser provides to the website each time the visitor returns.</li>
          </ul>

          <h2>3. How We Use Information</h2>
          <p>
            We use information about you as mentioned above and for the purposes listed below:
          </p>
          <ul>
            <li>To provide our Services</li>
            <li>To further develop and improve our Services</li>
            <li>To monitor and analyze trends and better understand how users interact with our Services</li>
            <li>To measure, gauge, and improve the effectiveness of our advertising</li>
            <li>To monitor and prevent any problems with our Services</li>
            <li>To communicate with you</li>
            <li>To personalize your experience</li>
          </ul>

          <h2>4. POPIA Compliance</h2>
          <p>
            As a South African business, we comply with the Protection of Personal Information Act (POPIA). This means we:
          </p>
          <ul>
            <li>Only collect and process personal information with your consent and for legitimate purposes</li>
            <li>Only collect what is necessary and relevant to our business relationship with you</li>
            <li>Inform you of the purpose for which information is collected</li>
            <li>Do not keep personal information longer than necessary or legally required</li>
            <li>Take appropriate, reasonable technical and organizational measures to prevent loss, damage, unauthorized destruction, and unlawful access to your personal information</li>
            <li>Ensure all personal information is complete, accurate, and not misleading</li>
            <li>Facilitate your right to access, correct, or delete your personal information</li>
          </ul>

          <h2>5. Sharing Information</h2>
          <p>
            We do not sell our users' private personal information. We share information about you in the limited circumstances spelled out below and with appropriate safeguards on your privacy:
          </p>
          <ul>
            <li><strong>Third Party Vendors:</strong> We may share information about you with third party vendors who need to know information about you in order to provide their services to us.</li>
            <li><strong>Legal and Regulatory Requirements:</strong> We may disclose information about you in response to a subpoena, court order, or other governmental request.</li>
            <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition of all or a portion of our business by another company, or in the unlikely event that Creative Commerce (Pty) Ltd goes out of business or enters bankruptcy, user information would likely be one of the assets that is transferred or acquired by a third party.</li>
            <li><strong>With Your Consent:</strong> We may share and disclose information with your consent or at your direction.</li>
            <li><strong>Aggregated or De-Identified Information:</strong> We may share information that has been aggregated or reasonably de-identified, so that the information could not reasonably be used to identify you.</li>
          </ul>

          <h2>6. Your Rights</h2>
          <p>
            Under POPIA, you have the right to:
          </p>
          <ul>
            <li>Request access to your personal information</li>
            <li>Request the correction or deletion of your personal information</li>
            <li>Object to the processing of your personal information</li>
            <li>Submit a complaint to the Information Regulator</li>
            <li>Institute civil proceedings regarding alleged interference with your personal information</li>
          </ul>

          <h2>7. Security</h2>
          <p>
            We take security seriously and do what we can within commercially acceptable means to protect your personal information from loss or theft, as well as unauthorized access, disclosure, copying, use or modification. That said, we advise that no method of electronic transmission or storage is 100% secure, and cannot guarantee absolute data security.
          </p>

          <h2>8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>

          <h2>9. Information Officer</h2>
          <p>
            In accordance with POPIA, we have appointed an Information Officer who is responsible for ensuring our compliance with the Act. You may contact our Information Officer if you have any questions or concerns regarding your personal information or this Privacy Policy.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us:<br />
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

export default Privacy;
