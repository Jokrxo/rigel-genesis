const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const docs = [
  {
    filename: 'getting-started-guide.pdf',
    title: 'Getting Started Guide',
    description: 'A comprehensive guide to help you get started with Rigel.',
    sections: [
      { heading: 'Introduction', content: 'Welcome to Rigel! This guide will help you set up and start using the platform efficiently.' },
      { heading: 'Account Setup', content: 'Step-by-step instructions to create your account and configure your profile.' },
      { heading: 'Navigation', content: 'Overview of the main dashboard and navigation tips.' },
      { heading: 'Support', content: 'Where to find help and resources.' },
    ],
  },
  {
    filename: 'financial-statements-guide.pdf',
    title: 'Financial Statements Guide',
    description: 'Learn how to generate and interpret financial statements.',
    sections: [
      { heading: 'Overview', content: 'Understand the different types of financial statements available in Rigel.' },
      { heading: 'Generating Reports', content: 'How to generate balance sheets, income statements, and cash flow reports.' },
      { heading: 'Interpreting Data', content: 'Tips for reading and analyzing your financial data.' },
    ],
  },
  {
    filename: 'tax-calculation-tutorial.pdf',
    title: 'Tax Calculation Tutorial',
    description: 'Step-by-step tutorial on calculating taxes with Rigel.',
    sections: [
      { heading: 'Introduction', content: 'Learn how Rigel helps you calculate taxes accurately.' },
      { heading: 'Tax Settings', content: 'Configuring your tax preferences and rates.' },
      { heading: 'Calculation Process', content: 'How to use the tax calculator and review results.' },
    ],
  },
  {
    filename: 'asset-management-guide.pdf',
    title: 'Asset Management Guide',
    description: 'Best practices for managing your business assets.',
    sections: [
      { heading: 'Asset Tracking', content: 'How to add, update, and track assets in Rigel.' },
      { heading: 'Depreciation', content: 'Understanding and applying depreciation methods.' },
      { heading: 'Reporting', content: 'Generating asset management reports.' },
    ],
  },
  {
    filename: 'sars-compliance-checklist.pdf',
    title: 'SARS Compliance Checklist',
    description: 'Ensure your financial records meet SARS requirements.',
    sections: [
      { heading: 'Checklist', content: 'A list of requirements to ensure SARS compliance.' },
      { heading: 'Submission Tips', content: 'Best practices for submitting your records.' },
    ],
  },
  {
    filename: 'vat-registration-process.pdf',
    title: 'VAT Registration Process',
    description: 'Step-by-step guide to VAT registration in South Africa.',
    sections: [
      { heading: 'Eligibility', content: 'Who needs to register for VAT.' },
      { heading: 'Registration Steps', content: 'Detailed steps for registering your business for VAT.' },
      { heading: 'After Registration', content: 'What to do after you are registered.' },
    ],
  },
  {
    filename: 'import-statement-tutorial.pdf',
    title: 'Import Statement Tutorial',
    description: 'Learn how to import your bank statements correctly.',
    sections: [
      { heading: 'Supported Formats', content: 'Which bank statement formats are supported.' },
      { heading: 'Import Steps', content: 'How to upload and process your statements.' },
      { heading: 'Troubleshooting', content: 'Common issues and how to resolve them.' },
    ],
  },
  {
    filename: 'company-profile-setup-guide.pdf',
    title: 'Company Profile Setup Guide',
    description: 'Configure your company profile for accurate reporting.',
    sections: [
      { heading: 'Profile Information', content: 'What information to include in your company profile.' },
      { heading: 'Editing Details', content: 'How to update your company information.' },
      { heading: 'Best Practices', content: 'Tips for keeping your profile up to date.' },
    ],
  },
];

const outputDir = path.join(__dirname, '../public/docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

docs.forEach(docInfo => {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(outputDir, docInfo.filename);
  doc.pipe(fs.createWriteStream(filePath));

  // Title
  doc.fontSize(22).font('Helvetica-Bold').text(docInfo.title, { align: 'center' });
  doc.moveDown();

  // Description
  doc.fontSize(14).font('Helvetica').text(docInfo.description, { align: 'center' });
  doc.moveDown(2);

  // Table of Contents
  doc.fontSize(16).font('Helvetica-Bold').text('Table of Contents');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica');
  docInfo.sections.forEach((section, idx) => {
    doc.text(`${idx + 1}. ${section.heading}`);
  });
  doc.moveDown(2);

  // Sections
  docInfo.sections.forEach((section, idx) => {
    doc.addPage();
    doc.fontSize(18).font('Helvetica-Bold').text(section.heading);
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(section.content, { align: 'left' });
    doc.moveDown();
  });

  doc.end();
  console.log(`Generated: ${filePath}`);
}); 