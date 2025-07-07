
import React from "react";
import { FeatureCard } from "@/components/HomePage/FeatureCard";
import { Download, FileText, Calculator } from "lucide-react";

// Use provided placeholder images as discussed in context
const featureCards = [
  {
    key: "statement-import",
    imageSrc: "/photo-1488590528505-98d2b5aba04b", // Laptop
    imageAlt: "Statement import illustration",
    icon: Download,
    title: "Statement Import",
    description: "Easily import PDF and Excel bank statements from all major South African banks with intelligent data processing.",
  },
  {
    key: "financial-statements",
    imageSrc: "/photo-1498050108023-c5249f4df085", // Financial document desk
    imageAlt: "Financial statement illustration",
    icon: FileText,
    title: "Financial Statements",
    description: "Generate comprehensive financial statements and reports automatically with professional formatting.",
  },
  {
    key: "tax-calculations",
    imageSrc: "/photo-1487058792275-0ad4aaf24ca7", // Tax workspace
    imageAlt: "Tax calculations illustration",
    icon: Calculator,
    title: "Tax Calculations",
    description: "Calculate VAT, company income tax, personal income tax, and deferred tax with SARS compliance.",
  },
  {
    key: "ai-assistant",
    imageSrc: "/photo-1486312338219-ce68d2c6f44d", // Person using MacBook Pro
    imageAlt: "AI assistant illustration",
    icon: Calculator,
    title: "Smart Financial Assistant",
    description: "Ask detailed questions about South African tax, VAT, and SARS compliance. Get immediate expert guidance for your business with AI.",
  },
  {
    key: "document-generation",
    imageSrc: "/photo-1461749280684-dccba630e2f6", // Monitor showing code (doc generation)
    imageAlt: "AI document generation",
    icon: FileText,
    title: "Document Generation",
    description: "Automatically generate invoices, quotes, statements, and other essential documents using AI-powered templates.",
  },
  {
    key: "statement-processing",
    imageSrc: "/photo-1649972904349-6e44c42644a7", // Person with laptop
    imageAlt: "AI statement processing",
    icon: Download,
    title: "Statement Processing",
    description: "Upload PDF or Excel bank statements and let Rigel categorize, analyze, and extract key data for you using AI.",
  },
  {
    key: "predictive-analytics",
    imageSrc: "/photo-1518770660439-4636190af475", // Circuit board (symbolic: analytics)
    imageAlt: "Predictive analytics chart",
    icon: Calculator,
    title: "Predictive Analytics",
    description: "Unlock insights into future income, expenses, and business performance using AI-driven forecasting.",
  },
  {
    key: "ai-financial-statements",
    imageSrc: "/photo-174d8654-9efa-44c0-9ea9-2a6f568c7a33", // placeholder (use `photo-174...` if available)
    imageAlt: "AI financial statements",
    icon: FileText,
    title: "AI Financial Statements",
    description: "Generate professional financial statements and business reports at the click of a button, with advanced analysis.",
  }
];

export const FeaturesSection = () => (
  <section className="py-20 bg-financial-50">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-3 gap-12">
        {featureCards.map((card) => (
          <FeatureCard
            key={card.key}
            imageSrc={card.imageSrc}
            imageAlt={card.imageAlt}
            icon={card.icon}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    </div>
  </section>
);
