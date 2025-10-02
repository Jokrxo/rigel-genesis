import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export const WelcomeEmail = ({
  userName = 'Valued User',
  loginUrl = 'https://rigel.co.za/login',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Rigel - Your Financial Success Partner 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          <div style={logoBox}>
            <Text style={logoText}>R</Text>
          </div>
          <Text style={brandName}>Rigel</Text>
        </Section>

        {/* Hero Section */}
        <Section style={heroSection}>
          <Heading style={h1}>Welcome to Rigel, {userName}! 🎉</Heading>
          <Text style={text}>
            We're thrilled to have you join South Africa's most comprehensive
            financial management platform. Your journey to financial clarity
            and business success starts now!
          </Text>
        </Section>

        {/* Features Section */}
        <Section style={featuresSection}>
          <Heading style={h2}>What You Can Do With Rigel:</Heading>
          
          <div style={featureItem}>
            <Text style={featureIcon}>🏦</Text>
            <div>
              <Text style={featureTitle}>Smart Bank Statement Processing</Text>
              <Text style={featureDesc}>
                Import statements from all major SA banks with AI-powered categorization
              </Text>
            </div>
          </div>

          <div style={featureItem}>
            <Text style={featureIcon}>📊</Text>
            <div>
              <Text style={featureTitle}>Real-Time Financial Insights</Text>
              <Text style={featureDesc}>
                Get instant visibility into your cash flow, expenses, and revenue
              </Text>
            </div>
          </div>

          <div style={featureItem}>
            <Text style={featureIcon}>🧮</Text>
            <div>
              <Text style={featureTitle}>SARS-Compliant Tax Calculations</Text>
              <Text style={featureDesc}>
                Automated VAT, income tax, and deferred tax calculations
              </Text>
            </div>
          </div>

          <div style={featureItem}>
            <Text style={featureIcon}>🤖</Text>
            <div>
              <Text style={featureTitle}>AI Financial Assistant</Text>
              <Text style={featureDesc}>
                Get expert guidance on South African tax and compliance questions
              </Text>
            </div>
          </div>
        </Section>

        {/* CTA Section */}
        <Section style={ctaSection}>
          <Button href={loginUrl} style={button}>
            Start Your Financial Journey
          </Button>
          <Text style={ctaText}>
            Click above to log in and explore your new financial command center
          </Text>
        </Section>

        {/* Quick Tips */}
        <Section style={tipsSection}>
          <Heading style={h3}>Quick Start Tips 💡</Heading>
          <Text style={tipText}>
            ✅ <strong>Import your first statement</strong> to see instant insights
          </Text>
          <Text style={tipText}>
            ✅ <strong>Set up your company profile</strong> for personalized reports
          </Text>
          <Text style={tipText}>
            ✅ <strong>Explore tax calculators</strong> to stay SARS compliant
          </Text>
          <Text style={tipText}>
            ✅ <strong>Ask the AI assistant</strong> any financial questions
          </Text>
        </Section>

        {/* Support Section */}
        <Section style={supportSection}>
          <Text style={supportText}>
            Need help getting started? Our team is here for you!
          </Text>
          <Text style={supportText}>
            📧 Email:{' '}
            <Link href="mailto:support@rigel.co.za" style={link}>
              support@rigel.co.za
            </Link>
          </Text>
          <Text style={supportText}>
            📱 WhatsApp: <Link href="tel:+27123456789" style={link}>+27 12 345 6789</Link>
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            This email was sent to you because you created an account with Rigel.
          </Text>
          <Text style={footerText}>
            © 2025 Rigel Financial Management. All rights reserved.
          </Text>
          <Text style={footerText}>
            Cape Town, South Africa
          </Text>
          <div style={socialLinks}>
            <Link href="https://twitter.com/rigel" style={socialLink}>
              Twitter
            </Link>
            {' • '}
            <Link href="https://linkedin.com/company/rigel" style={socialLink}>
              LinkedIn
            </Link>
            {' • '}
            <Link href="https://rigel.co.za/help" style={socialLink}>
              Help Center
            </Link>
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderBottom: '3px solid #0e7490',
};

const logoBox = {
  width: '64px',
  height: '64px',
  margin: '0 auto 16px',
  background: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoText = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
  lineHeight: '64px',
};

const brandName = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#0e7490',
  margin: '0',
};

const heroSection = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#f0f9ff',
};

const h1 = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 16px',
  lineHeight: '1.3',
};

const h2 = {
  color: '#0e7490',
  fontSize: '22px',
  fontWeight: '600',
  margin: '0 0 24px',
};

const h3 = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const featuresSection = {
  padding: '32px 24px',
};

const featureItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
};

const featureIcon = {
  fontSize: '28px',
  marginRight: '12px',
  flexShrink: 0,
};

const featureTitle = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const featureDesc = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const ctaSection = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#f0f9ff',
};

const button = {
  backgroundColor: '#0e7490',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  lineHeight: '1.5',
};

const ctaText = {
  color: '#64748b',
  fontSize: '14px',
  marginTop: '16px',
};

const tipsSection = {
  padding: '32px 24px',
  backgroundColor: '#fefce8',
  borderRadius: '8px',
  margin: '0 24px',
};

const tipText = {
  color: '#713f12',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '8px 0',
};

const supportSection = {
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const supportText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const link = {
  color: '#0e7490',
  textDecoration: 'none',
  fontWeight: '500',
};

const footer = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e2e8f0',
};

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '4px 0',
};

const socialLinks = {
  marginTop: '16px',
};

const socialLink = {
  color: '#0e7490',
  fontSize: '12px',
  textDecoration: 'none',
};
