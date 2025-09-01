
import React from "react";
import { Button } from "@/components/ui/button";

const developerChecklist = `
<h2>Developer Launch Checklist</h2>
<ul>
  <li><strong>Build Errors & Dependencies:</strong>
    <ul>
      <li>✅ Fix html-to-docx import errors</li>
      <li>Ensure all dependencies are properly installed and up to date</li>
      <li>Remove any unused dependencies to reduce bundle size</li>
      <li>Test build process in production mode</li>
    </ul>
  </li>
  <li><strong>Supabase Integration:</strong>
    <ul>
      <li>Confirm Supabase project is connected in Lovable</li>
      <li>Ensure all secrets are correctly configured:
        <ul>
          <li>SUPABASE_URL ✅</li>
          <li>SUPABASE_ANON_KEY ✅</li>
          <li>SUPABASE_SERVICE_ROLE_KEY ✅</li>
          <li>SUPABASE_DB_URL ✅</li>
        </ul>
      </li>
      <li>Verify authentication is fully tested (login, logout, register, Google/Facebook if desired)</li>
      <li>Check RLS (Row-Level Security) policies on all tables:
        <ul>
          <li>bank_statements table - needs RLS policies</li>
          <li>transactions table - needs RLS policies</li>
          <li>statement_audit table - needs RLS policies</li>
        </ul>
      </li>
      <li>Test database operations (CRUD) with proper error handling</li>
      <li>Storage buckets: Set up if needed for file uploads</li>
    </ul>
  </li>
  <li><strong>Code Quality & Structure:</strong>
    <ul>
      <li>⚠️ Refactor large files (Index.tsx: 225 lines, useAuth.tsx: 246 lines)</li>
      <li>Remove dead code, unused components, and imports</li>
      <li>Ensure consistent coding standards across components</li>
      <li>Add proper error boundaries for production</li>
      <li>Implement proper loading states throughout the app</li>
    </ul>
  </li>
  <li><strong>Authentication & Security:</strong>
    <ul>
      <li>Implement real authentication (currently mock implementation)</li>
      <li>Set up proper user session management</li>
      <li>Secure all API endpoints with proper authentication</li>
      <li>Test password reset functionality</li>
      <li>Verify email verification process</li>
    </ul>
  </li>
  <li><strong>API & Backend:</strong>
    <ul>
      <li>Test statement processing edge function</li>
      <li>Implement proper error handling for all API calls</li>
      <li>Add rate limiting and request validation</li>
      <li>Test file upload functionality</li>
    </ul>
  </li>
  <li><strong>GitHub & Version Control:</strong>
    <ul>
      <li>Ensure repo is connected and all changes are pushed</li>
      <li>Clean up commit history if needed</li>
      <li>Update README with deployment and setup instructions</li>
      <li>Set up branch protection rules</li>
    </ul>
  </li>
</ul>
`;

const uiChecklist = `
<h2>UI/UX & Branding Checklist</h2>
<ul>
  <li><strong>Logo Implementation:</strong>
    <ul>
      <li>✅ Logo implemented in header, footer, sidebar</li>
      <li>✅ Logo on homepage and auth pages</li>
      <li>✅ Responsive sizing with proper Tailwind classes</li>
      <li>✅ Alt text and error handling</li>
      <li>✅ White background applied where needed</li>
    </ul>
  </li>
  <li><strong>Color Theme Consistency:</strong>
    <ul>
      <li>✅ Royal/Navy Blue (financial-500, financial-700) as primary colors</li>
      <li>Review all buttons, cards, and interactive elements for consistency</li>
      <li>Ensure proper contrast ratios for accessibility</li>
      <li>Update any remaining default blue colors to custom financial colors</li>
    </ul>
  </li>
  <li><strong>Responsive Design:</strong>
    <ul>
      <li>Test on mobile, tablet, and desktop breakpoints</li>
      <li>Ensure sidebar collapses properly on mobile</li>
      <li>Verify all forms are mobile-friendly</li>
      <li>Test navigation and layout on different screen sizes</li>
    </ul>
  </li>
  <li><strong>Financial Imagery:</strong>
    <ul>
      <li>✅ Financial/commerce themed images on homepage</li>
      <li>Replace any generic placeholders with relevant financial imagery</li>
      <li>Optimize all images for web performance</li>
    </ul>
  </li>
  <li><strong>User Experience:</strong>
    <ul>
      <li>Add loading states for all async operations</li>
      <li>Implement proper error states and user feedback</li>
      <li>Test all user flows (registration, login, statement import, etc.)</li>
      <li>Ensure consistent spacing and typography</li>
    </ul>
  </li>
</ul>
`;

const chatbotChecklist = `
<h2>Chatbot & User Support Checklist</h2>
<ul>
  <li><strong>Chatbot Functionality:</strong>
    <ul>
      <li>✅ Chat interface implemented</li>
      <li>✅ Contact options (phone, WhatsApp, email)</li>
      <li>Improve automated responses with more specific financial guidance</li>
      <li>Add FAQ responses for common financial questions</li>
      <li>Test all contact methods (phone, WhatsApp, email links)</li>
    </ul>
  </li>
  <li><strong>Contact Information:</strong>
    <ul>
      <li>✅ Luthando Zulu contact details</li>
      <li>✅ Phone: 073 988 2190</li>
      <li>✅ Email: luthando@stella-lumen.com</li>
      <li>Verify all contact links are working</li>
    </ul>
  </li>
  <li><strong>User Guidance:</strong>
    <ul>
      <li>Add onboarding flow for new users</li>
      <li>Create help documentation for key features</li>
      <li>Add tooltips for complex financial terms</li>
    </ul>
  </li>
</ul>
`;

const correspondenceBookmarks = `
<h2>Correspondence Bookmarks & Key Points</h2>
<ol>
  <li>✅ Royal/navy blue branding implemented throughout</li>
  <li>✅ Logo visibility in all required locations</li>
  <li>⚠️ Remove any dev/test assets or code before production</li>
  <li>⚠️ File refactoring needed (Index.tsx and useAuth.tsx are too large)</li>
  <li>✅ Consistent branding and accessibility considerations</li>
  <li>🔴 Critical: Implement real authentication system (currently mock)</li>
  <li>🔴 Critical: Set up RLS policies for all database tables</li>
  <li>Deploy checklist: Build → Test → Deploy → GitHub push → Final review</li>
  <li>Maintain changelog for post-launch updates</li>
</ol>
`;

const securityChecklist = `
<h2>Security & Production Readiness</h2>
<ul>
  <li><strong>Database Security:</strong>
    <ul>
      <li>🔴 URGENT: Enable RLS on bank_statements table</li>
      <li>🔴 URGENT: Enable RLS on transactions table</li>
      <li>🔴 URGENT: Enable RLS on statement_audit table</li>
      <li>Test all RLS policies with different user scenarios</li>
    </ul>
  </li>
  <li><strong>Environment Variables:</strong>
    <ul>
      <li>Ensure no hardcoded secrets in code</li>
      <li>Verify all environment variables are properly set</li>
      <li>Remove any development/test credentials</li>
    </ul>
  </li>
  <li><strong>Error Handling:</strong>
    <ul>
      <li>Implement global error boundary</li>
      <li>Add proper error logging</li>
      <li>Ensure sensitive errors are not exposed to users</li>
    </ul>
  </li>
</ul>
`;

const performanceChecklist = `
<h2>Performance & Optimization</h2>
<ul>
  <li><strong>Bundle Optimization:</strong>
    <ul>
      <li>Analyze bundle size and optimize imports</li>
      <li>Implement code splitting for large components</li>
      <li>Lazy load non-critical components</li>
    </ul>
  </li>
  <li><strong>Image Optimization:</strong>
    <ul>
      <li>Compress all images</li>
      <li>Use appropriate image formats (WebP where possible)</li>
      <li>Implement lazy loading for images</li>
    </ul>
  </li>
  <li><strong>Caching Strategy:</strong>
    <ul>
      <li>Implement proper caching headers</li>
      <li>Use React Query for data caching</li>
      <li>Optimize API response caching</li>
    </ul>
  </li>
</ul>
`;

const allContent = `
  <h1>Rigel Financial Application Launch Checklist</h1>
  <p><strong>Status Legend:</strong> ✅ Complete | ⚠️ Needs Attention | 🔴 Critical/Urgent</p>
  <hr />
  ${securityChecklist}
  <hr />
  ${developerChecklist}
  <hr />
  ${uiChecklist}
  <hr />
  ${chatbotChecklist}
  <hr />
  ${performanceChecklist}
  <hr />
  ${correspondenceBookmarks}
`;

export const LaunchChecklistExport: React.FC = () => {
  const handleDownload = async () => {
    try {
      // Dynamic import to avoid build issues
      const { default: htmlToDocx } = await import("html-to-docx");
      const blob = await htmlToDocx(allContent, null, {
        pageNumber: false,
        orientation: "portrait",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Rigel_Financial_Launch_Checklist.docx";
      link.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error("Export error:", e);
      alert("Failed to export to Word. Please try again or contact support.");
    }
  };

  return (
    <div className="flex flex-col items-center my-10 p-6 bg-financial-50">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-financial-700 mb-2">Launch Readiness Checklist</h1>
        <p className="text-muted-foreground">Comprehensive checklist for Rigel Financial Application launch</p>
      </div>
      
      <Button
        className="px-8 py-4 bg-financial-600 text-white rounded-lg font-semibold hover:bg-financial-700 mb-8"
        onClick={handleDownload}
      >
        📄 Download Complete Checklist (Word)
      </Button>
      
      <div className="bg-background shadow-lg rounded-lg p-8 max-w-4xl w-full">
        <div dangerouslySetInnerHTML={{ __html: allContent }} />
      </div>
    </div>
  );
};
