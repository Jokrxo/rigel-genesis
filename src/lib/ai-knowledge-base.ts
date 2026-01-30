
// This is a simulated knowledge base for the AI Assistant.
// It contains high-quality, technical responses for South African context.

interface KnowledgeEntry {
  keywords: string[];
  response: string;
  category: 'Financial Management' | 'Risk Management' | 'Governance' | 'Business Solutions' | 'Internal Audit';
}

export const aiKnowledgeBase: KnowledgeEntry[] = [
  // Financial Management
  {
    keywords: ['ifrs', 'gaap', 'accounting standards', 'reporting framework'],
    category: 'Financial Management',
    response: "In South Africa, the Companies Act requires companies to prepare financial statements in accordance with International Financial Reporting Standards (IFRS) or IFRS for SMEs, depending on their public interest score. These standards ensure transparency, accountability, and comparability in financial reporting, which is critical for maintaining investor confidence and regulatory compliance."
  },
  {
    keywords: ['vat', 'value added tax', 'sars', 'tax compliance', '15%'],
    category: 'Financial Management',
    response: "Value-Added Tax (VAT) in South Africa is currently levied at the standard rate of 15%. Vendors making taxable supplies of more than R1 million per annum must register for VAT. It is critical to maintain accurate tax invoices and submit returns (VAT201) timeously via SARS eFiling to avoid penalties and interest. Input tax can be claimed on valid business expenses, provided a valid tax invoice is held."
  },
  {
    keywords: ['cash flow', 'liquidity', 'working capital'],
    category: 'Financial Management',
    response: "Effective cash flow management is the lifeblood of any South African business. Key strategies include optimizing working capital by managing debtors' days (accounts receivable), negotiating favorable terms with creditors, and maintaining optimal inventory levels. Regular cash flow forecasting is essential to anticipate liquidity gaps and arrange facilities before they are needed."
  },

  // Risk Management
  {
    keywords: ['risk management', 'risk assessment', 'iso 31000', 'mitigation'],
    category: 'Risk Management',
    response: "Risk management involves the identification, assessment, and prioritization of risks followed by coordinated application of resources to minimize, monitor, and control the probability or impact of unfortunate events. In the South African context, adhering to ISO 31000 principles and integrating risk management into strategic planning is vital for resilience against market volatility, regulatory changes, and operational disruptions."
  },
  {
    keywords: ['fraud', 'prevention', 'controls', 'cybersecurity'],
    category: 'Risk Management',
    response: "Fraud prevention requires a robust internal control environment. This includes segregation of duties, regular reconciliation of accounts, and automated alerts for unusual transactions. With the rise of digital banking in SA, cybersecurity is also a critical risk area; businesses must implement strong authentication protocols and regular staff training on phishing and social engineering."
  },

  // Governance
  {
    keywords: ['king iv', 'governance', 'board', 'ethics', 'corporate governance'],
    category: 'Governance',
    response: "The King IV Report on Corporate Governance for South Africa 2016 sets the benchmark for ethical leadership and good governance. Unlike a 'tick-box' approach, King IV emphasizes outcomes: ethical culture, good performance, effective control, and legitimacy. Application is on an 'apply and explain' basis, meaning organizations should transparently demonstrate how they achieve these governance outcomes."
  },
  {
    keywords: ['companies act', 'director duties', 'fiduciary'],
    category: 'Governance',
    response: "The Companies Act 71 of 2008 codifies the fiduciary duties of directors. Directors must act in good faith, in the best interests of the company, and with the necessary degree of care, skill, and diligence. Failure to uphold these duties can result in personal liability for any loss, damages, or costs sustained by the company."
  },

  // Internal Audit
  {
    keywords: ['internal audit', 'iia', 'assurance', 'audit charter'],
    category: 'Internal Audit',
    response: "Internal Audit provides independent, objective assurance and consulting services designed to add value and improve an organization's operations. In South Africa, the internal audit function should adhere to the IIA's International Standards for the Professional Practice of Internal Auditing (IPPF). It helps the organization accomplish its objectives by bringing a systematic, disciplined approach to evaluate and improve the effectiveness of risk management, control, and governance processes."
  },
  {
    keywords: ['compliance', 'regulatory', 'popia', 'fica'],
    category: 'Internal Audit',
    response: "Compliance auditing in South Africa is multi-faceted. Key regulations include POPIA (Protection of Personal Information Act) for data privacy and FICA (Financial Intelligence Centre Act) for anti-money laundering. Internal Audit plays a crucial role in verifying that the organization has adequate controls to ensure compliance with these laws, thereby mitigating legal and reputational risk."
  },

  // Customized Business Solutions
  {
    keywords: ['business solution', 'optimization', 'process improvement', 'automation'],
    category: 'Business Solutions',
    response: "Customized business solutions focus on tailoring operational processes and technology to the specific needs of the entity. This often involves business process re-engineering (BPR) to eliminate waste, implementing ERP systems for better data integration, and utilizing data analytics for decision support. The goal is to drive efficiency, reduce costs, and enhance value delivery to customers."
  },
  {
    keywords: ['strategy', 'strategic planning', 'growth'],
    category: 'Business Solutions',
    response: "Strategic planning requires a deep understanding of the local market dynamics. A customized solution involves analyzing the SWOT (Strengths, Weaknesses, Opportunities, Threats) specifically within the South African economic climate. This includes considering factors like infrastructure challenges (load shedding), labor legislation, and emerging market opportunities to build a resilient and growth-oriented strategy."
  },
  // Broad / Fallback Catch-all for specified domains
  {
    keywords: ['finance', 'money', 'budgeting', 'accounting'],
    category: 'Financial Management',
    response: "Financial management in the South African context requires strict adherence to local regulations (SARS, Companies Act) while optimizing resource allocation. We focus on ensuring accurate financial reporting (IFRS), efficient cash flow management, and strategic budgeting to ensure long-term sustainability."
  },
  {
    keywords: ['risk', 'danger', 'threat', 'security'],
    category: 'Risk Management',
    response: "Effective risk management identifies, assesses, and mitigates threats to an organization's capital and earnings. In South Africa, this encompasses operational risks (e.g., power supply), financial risks (currency volatility), and compliance risks (regulatory changes), managed through frameworks like ISO 31000 and COSO."
  },
  {
    keywords: ['governance', 'board', 'director', 'oversight'],
    category: 'Governance',
    response: "Corporate governance is the system of rules, practices, and processes by which a firm is directed and controlled. Central to this in South Africa is the King IV Report, which advocates for ethical leadership, corporate citizenship, and sustainable development as core pillars of business strategy."
  },
  {
    keywords: ['audit', 'check', 'verify', 'control'],
    category: 'Internal Audit',
    response: "Internal auditing is an independent, objective assurance and consulting activity designed to add value and improve an organization's operations. We adhere to the IIA Standards to evaluate the effectiveness of risk management, control, and governance processes, ensuring compliance with local laws like POPIA and FICA."
  }
];

export function queryKnowledgeBase(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  // Simple scoring mechanism
  let bestMatch: KnowledgeEntry | null = null;
  let maxScore = 0;

  for (const entry of aiKnowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 1; // Basic keyword matching
      }
    }
    
    // Bonus for multi-keyword matches
    if (score > maxScore) {
      maxScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && maxScore > 0) {
    return bestMatch.response;
  }

  return null;
}
