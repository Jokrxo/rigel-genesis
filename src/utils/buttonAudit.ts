// Button and Navigation Audit Utility
// This utility helps track and validate button functionality across the app

interface ButtonAuditResult {
  component: string;
  buttonText: string;
  hasOnClick: boolean;
  hasValidHandler: boolean;
  isWorking: boolean;
  supabaseIntegration?: string;
  issues: string[];
}

interface NavigationAuditResult {
  linkText: string;
  href: string;
  isProtected: boolean;
  hasValidRoute: boolean;
  issues: string[];
}

export const auditButtons = (): ButtonAuditResult[] => {
  const results: ButtonAuditResult[] = [];
  
  // Find all buttons in the DOM
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach((button, index) => {
    const buttonText = button.textContent?.trim() || `Button ${index}`;
    const hasOnClick = button.onclick !== null || button.addEventListener !== null;
    const isDisabled = button.disabled;
    
    const issues: string[] = [];
    
    if (!hasOnClick && !isDisabled) {
      issues.push('No click handler found');
    }
    
    if (button.type === 'submit' && !button.form) {
      issues.push('Submit button not associated with form');
    }
    
    results.push({
      component: button.closest('[data-component]')?.getAttribute('data-component') || 'Unknown',
      buttonText,
      hasOnClick,
      hasValidHandler: hasOnClick && !isDisabled,
      isWorking: issues.length === 0,
      issues
    });
  });
  
  return results;
};

export const auditNavigation = (): NavigationAuditResult[] => {
  const results: NavigationAuditResult[] = [];
  
  // Find all navigation links
  const links = document.querySelectorAll('a[href]');
  
  const protectedRoutes = [
    '/dashboard',
    '/import-statement',
    '/financial-analysis',
    '/transaction-processing',
    '/reports',
    '/settings',
    '/profile'
  ];
  
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const linkText = link.textContent?.trim() || 'Unknown Link';
    const isProtected = protectedRoutes.some(route => href.startsWith(route));
    
    const issues: string[] = [];
    
    if (href === '#' || href === '') {
      issues.push('Empty or placeholder href');
    }
    
    if (href.startsWith('/') && !href.includes('http')) {
      // Check if route exists in our app
      const validRoutes = [
        '/', '/login', '/register', '/verify-email', '/verification-success',
        '/forgot-password', '/reset-password', '/features', '/signup-wizard',
        '/pricing', '/terms', '/privacy', '/qr-code', '/dashboard',
        '/import-statement', '/asset-management', '/documents', '/customers',
        '/inventory', '/suppliers', '/projects', '/bank-movements',
        '/director-transactions', '/loan-management', '/employee-management',
        '/payroll-management', '/investments', '/transaction-processing',
        '/company-profile', '/help', '/reports', '/profile', '/settings',
        '/tax-calculators', '/ai-features', '/financial-analysis',
        '/tax-dashboard', '/trial-balance', '/bank-reconciliation',
        '/budget-management', '/chart-of-accounts', '/accounting-cycle',
        '/community', '/impairment', '/reports/payroll', '/tools-support',
        '/reports/balance-sheet', '/reports/income-statement',
        '/reports/cash-flow', '/reports/equity', '/reports/notes',
        '/general-ledger', '/general-ledger/posting', '/monthly-reports',
        '/journal-entries'
      ];
      
      const hasValidRoute = validRoutes.some(route => href === route || href.startsWith(`${route}/`));
      
      results.push({
        linkText,
        href,
        isProtected,
        hasValidRoute,
        issues
      });
    }
  });
  
  return results;
};

export const generateAuditReport = () => {
  const buttonResults = auditButtons();
  const navResults = auditNavigation();
  
  const report = {
    timestamp: new Date().toISOString(),
    buttonAudit: {
      total: buttonResults.length,
      working: buttonResults.filter(r => r.isWorking).length,
      issues: buttonResults.filter(r => !r.isWorking),
    },
    navigationAudit: {
      total: navResults.length,
      protected: navResults.filter(r => r.isProtected).length,
      issues: navResults.filter(r => r.issues.length > 0),
    },
    recommendations: [
      'Add loading states to async buttons',
      'Implement error handling for Supabase operations',
      'Add toast notifications for user feedback',
      'Ensure all buttons have accessible labels',
      'Validate form inputs before submission'
    ]
  };
  
  /*
  console.group('🔍 Button & Navigation Audit Report');
  console.log('Generated at:', report.timestamp);
  console.log('Button Status:', `${report.buttonAudit.working}/${report.buttonAudit.total} working`);
  console.log('Navigation Status:', `${report.navigationAudit.total - report.navigationAudit.issues.length}/${report.navigationAudit.total} working`);
  
  if (report.buttonAudit.issues.length > 0) {
    console.group('❌ Button Issues');
    report.buttonAudit.issues.forEach(issue => {
      console.log(`${issue.component}: ${issue.buttonText}`, issue.issues);
    });
    console.groupEnd();
  }
  
  if (report.navigationAudit.issues.length > 0) {
    console.group('❌ Navigation Issues');
    report.navigationAudit.issues.forEach(issue => {
      console.log(`${issue.linkText} (${issue.href})`, issue.issues);
    });
    console.groupEnd();
  }
  
  console.group('💡 Recommendations');
  report.recommendations.forEach(rec => console.log(`• ${rec}`));
  console.groupEnd();
  console.groupEnd();
  */
  
  return report;
};