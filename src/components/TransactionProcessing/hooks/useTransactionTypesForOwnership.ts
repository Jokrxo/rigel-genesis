
import { CompanyProfile } from "@/components/CompanyProfile/types";

const ownershipTransactionMap = {
  "Proprietary Limited (Pty) Ltd": [
    { value: "income", label: "Income (Sales/Services)" },
    { value: "expense", label: "Business Expense" },
    { value: "director_loan", label: "Director’s Loan/Drawings" },
    { value: "shareholder_loan", label: "Shareholder Loan" },
    { value: "dividend", label: "Dividend Payment" },
    { value: "vat_payment", label: "VAT Payment" },
    { value: "tax_payment", label: "Tax Payment" },
    { value: "asset_purchase", label: "Asset Purchase" },
    { value: "transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ],
  "Sole Proprietor": [
    { value: "income", label: "Income" },
    { value: "expense", label: "Business/Private Expense" },
    { value: "drawings", label: "Drawings" },
    { value: "tax_payment", label: "Tax Payment" },
    { value: "asset_purchase", label: "Asset Purchase" },
    { value: "transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ],
  "Partnership": [
    { value: "income", label: "Income" },
    { value: "expense", label: "Business Expense" },
    { value: "partner_drawings", label: "Partner Drawings" },
    { value: "capital_contribution", label: "Capital Contribution" },
    { value: "transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ],
  "Non-Profit Organisation (NPO)": [
    { value: "donation", label: "Donation Received" },
    { value: "grant", label: "Grant/Income" },
    { value: "expense", label: "Project/Overhead Expense" },
    { value: "asset_acquisition", label: "Asset Acquisition" },
    { value: "project_transfer", label: "Project Fund Transfer" },
    { value: "other", label: "Other" },
  ],
  "Trust": [
    { value: "income", label: "Trust Income" },
    { value: "expense", label: "Trust Expense" },
    { value: "distribution", label: "Distribution to Beneficiary" },
    { value: "capital_contribution", label: "Capital Contribution" },
    { value: "transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ],
  "Close Corporation": [
    { value: "income", label: "Income" },
    { value: "expense", label: "CC Expense" },
    { value: "member_drawings", label: "Member Drawings" },
    { value: "asset_purchase", label: "Asset Purchase" },
    { value: "vat_payment", label: "VAT Payment" },
    { value: "transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ],
  "Other": [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
    { value: "transfer", label: "Transfer" },
    { value: "other", label: "Other" },
  ]
};

function getOwnershipType(profile?: CompanyProfile | null) {
  if (!profile) return "Other";
  const descriptionTest =
    profile.description?.toLowerCase() +
    " " +
    profile.name?.toLowerCase() +
    " " +
    profile.registrationNumber?.toLowerCase() +
    " " +
    profile.vatNumber?.toLowerCase();

  if (descriptionTest.includes("proprietary") || descriptionTest.includes("pty"))
    return "Proprietary Limited (Pty) Ltd";
  if (descriptionTest.includes("cc") || descriptionTest.includes("close corporation"))
    return "Close Corporation";
  if (descriptionTest.includes("non-profit") || descriptionTest.includes("npo"))
    return "Non-Profit Organisation (NPO)";
  if (descriptionTest.includes("trust")) return "Trust";
  if (descriptionTest.includes("partnership")) return "Partnership";
  if (descriptionTest.includes("sole proprietor") || descriptionTest.includes("sole trader"))
    return "Sole Proprietor";
  return "Other";
}

export function getTransactionTypesForOwnership(profile?: CompanyProfile | null) {
  const ownershipType = getOwnershipType(profile);
  return ownershipTransactionMap[ownershipType] || ownershipTransactionMap["Other"];
}
