import { z } from "zod";

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

// Password validation with security requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Display name validation
export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

// Phone number validation (international format)
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .optional();

// URL validation
export const urlSchema = z
  .string()
  .trim()
  .url("Invalid URL format")
  .max(2048, "URL must be less than 2048 characters");

// Numeric validation helpers
export const positiveNumberSchema = z
  .number()
  .positive("Must be a positive number");

export const nonNegativeNumberSchema = z
  .number()
  .nonnegative("Cannot be negative");

// Text content validation (for descriptions, messages, etc.)
export const textContentSchema = z
  .string()
  .trim()
  .min(1, "This field is required")
  .max(5000, "Content must be less than 5000 characters");

// VAT number validation (South African format)
export const vatNumberSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "VAT number must be 10 digits")
  .optional();

// Registration number validation
export const registrationNumberSchema = z
  .string()
  .trim()
  .min(1, "Registration number is required")
  .max(50, "Registration number must be less than 50 characters");

// Sanitization helper
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - removes script tags and potentially dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/javascript:/gi, "");
};

// Input validation for SQL injection prevention
export const sanitizeInput = (input: string): string => {
  // Escape special characters without using control-character regex
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    switch (c) {
      case "\0":
        out += "\\0";
        break;
      case "\b":
        out += "\\b";
        break;
      case "\t":
        out += "\\t";
        break;
      case "\x1a":
        out += "\\z";
        break;
      case "\n":
        out += "\\n";
        break;
      case "\r":
        out += "\\r";
        break;
      case '"':
      case "'":
      case "\\":
      case "%":
        out += "\\" + c;
        break;
      default:
        out += c;
    }
  }
  return out.trim();
};

// File validation
export const fileSchema = z.object({
  name: z.string(),
  size: z.number().max(20 * 1024 * 1024, "File size must be less than 20MB"),
  type: z.string().refine(
    (type) => 
      ["application/pdf", "application/vnd.ms-excel", 
       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
       "text/csv"].includes(type),
    "Invalid file type. Only PDF, Excel, and CSV files are allowed"
  ),
});

// Date validation helpers
export const futureDateSchema = z.date().refine(
  (date) => date > new Date(),
  "Date must be in the future"
);

export const pastDateSchema = z.date().refine(
  (date) => date < new Date(),
  "Date must be in the past"
);

// Currency amount validation
export const currencyAmountSchema = z
  .number()
  .finite("Amount must be a valid number")
  .refine(
    (num) => Number.isFinite(num) && Math.abs(num) <= 999999999.99,
    "Amount exceeds maximum allowed value"
  );
