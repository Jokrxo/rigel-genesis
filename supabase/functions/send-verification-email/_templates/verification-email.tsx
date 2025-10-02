import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
  verificationCode: string;
}

export const VerificationEmail = ({
  userName = 'Valued User',
  verificationUrl = 'https://rigel.co.za/verify',
  verificationCode = '123456',
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your Rigel account - Just one click away! ✅</Preview>
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
          <div style={iconCircle}>
            <Text style={iconText}>✉️</Text>
          </div>
          <Heading style={h1}>Verify Your Email Address</Heading>
          <Text style={text}>
            Hi {userName}, we're excited to have you! To complete your
            registration and unlock all Rigel features, please verify your
            email address.
          </Text>
        </Section>

        {/* Verification Button */}
        <Section style={verificationSection}>
          <Button href={verificationUrl} style={button}>
            Verify My Email Address
          </Button>
          <Text style={buttonSubtext}>
            This link will expire in 24 hours for security
          </Text>
        </Section>

        {/* Manual Verification Code */}
        <Section style={codeSection}>
          <Text style={codeLabel}>Or enter this verification code:</Text>
          <div style={codeBox}>
            <Text style={code}>{verificationCode}</Text>
          </div>
          <Text style={codeHint}>
            Copy and paste this code if the button doesn't work
          </Text>
        </Section>

        {/* Security Notice */}
        <Section style={securitySection}>
          <Heading style={h3}>🔒 Security First</Heading>
          <Text style={securityText}>
            <strong>Why verify?</strong> Email verification helps us:
          </Text>
          <Text style={bulletText}>✅ Protect your account from unauthorized access</Text>
          <Text style={bulletText}>✅ Ensure you receive important financial notifications</Text>
          <Text style={bulletText}>✅ Enable secure password recovery</Text>
          <Text style={bulletText}>✅ Keep your business data safe</Text>
          
          <div style={warningBox}>
            <Text style={warningText}>
              ⚠️ <strong>Didn't request this?</strong> If you didn't create a
              Rigel account, please ignore this email or contact us immediately
              at{' '}
              <Link href="mailto:security@rigel.co.za" style={link}>
                security@rigel.co.za
              </Link>
            </Text>
          </div>
        </Section>

        {/* What Happens Next */}
        <Section style={nextStepsSection}>
          <Heading style={h3}>What Happens After Verification? 🚀</Heading>
          <div style={stepItem}>
            <Text style={stepNumber}>1</Text>
            <div>
              <Text style={stepTitle}>Access Your Dashboard</Text>
              <Text style={stepDesc}>
                Get instant visibility into your financial health
              </Text>
            </div>
          </div>
          <div style={stepItem}>
            <Text style={stepNumber}>2</Text>
            <div>
              <Text style={stepTitle}>Import Your First Statement</Text>
              <Text style={stepDesc}>
                Upload bank statements and see AI magic in action
              </Text>
            </div>
          </div>
          <div style={stepItem}>
            <Text style={stepNumber}>3</Text>
            <div>
              <Text style={stepTitle}>Set Up Your Profile</Text>
              <Text style={stepDesc}>
                Personalize settings for your business needs
              </Text>
            </div>
          </div>
        </Section>

        {/* Support Section */}
        <Section style={supportSection}>
          <Text style={supportTitle}>Need Help? We're Here! 💬</Text>
          <Text style={supportText}>
            Having trouble verifying? Our support team is ready to assist:
          </Text>
          <Text style={supportText}>
            📧{' '}
            <Link href="mailto:support@rigel.co.za" style={link}>
              support@rigel.co.za
            </Link>
          </Text>
          <Text style={supportText}>
            📱 WhatsApp:{' '}
            <Link href="tel:+27123456789" style={link}>
              +27 12 345 6789
            </Link>
          </Text>
          <Text style={supportText}>
            🌐{' '}
            <Link href="https://rigel.co.za/help" style={link}>
              Help Center
            </Link>
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            This verification link expires in 24 hours for your security.
          </Text>
          <Text style={footerText}>
            © 2025 Rigel Financial Management. All rights reserved.
          </Text>
          <Text style={footerText}>Cape Town, South Africa</Text>
          <div style={socialLinks}>
            <Link href="https://twitter.com/rigel" style={socialLink}>
              Twitter
            </Link>
            {' • '}
            <Link href="https://linkedin.com/company/rigel" style={socialLink}>
              LinkedIn
            </Link>
            {' • '}
            <Link href="https://rigel.co.za/privacy" style={socialLink}>
              Privacy Policy
            </Link>
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default VerificationEmail;

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
  padding: '32px 24px 24px',
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
  padding: '40px 24px 32px',
  textAlign: 'center' as const,
};

const iconCircle = {
  width: '80px',
  height: '80px',
  margin: '0 auto 24px',
  backgroundColor: '#dcfce7',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const iconText = {
  fontSize: '40px',
  margin: '0',
};

const h1 = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 16px',
  lineHeight: '1.3',
};

const h3 = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const verificationSection = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#f0f9ff',
};

const button = {
  backgroundColor: '#22c55e',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
  lineHeight: '1.5',
  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
};

const buttonSubtext = {
  color: '#64748b',
  fontSize: '13px',
  marginTop: '12px',
  fontStyle: 'italic',
};

const codeSection = {
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const codeLabel = {
  color: '#475569',
  fontSize: '14px',
  marginBottom: '16px',
  fontWeight: '500',
};

const codeBox = {
  backgroundColor: '#f1f5f9',
  border: '2px dashed #cbd5e1',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px auto',
  maxWidth: '300px',
};

const code = {
  color: '#0e7490',
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '8px',
  margin: '0',
  fontFamily: 'monospace',
};

const codeHint = {
  color: '#94a3b8',
  fontSize: '12px',
  marginTop: '12px',
};

const securitySection = {
  padding: '32px 24px',
  backgroundColor: '#fef3c7',
  margin: '0 24px',
  borderRadius: '8px',
};

const securityText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const bulletText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '4px 0',
};

const warningBox = {
  backgroundColor: '#fee2e2',
  border: '1px solid #fca5a5',
  borderRadius: '6px',
  padding: '12px 16px',
  marginTop: '16px',
};

const warningText = {
  color: '#991b1b',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
};

const nextStepsSection = {
  padding: '32px 24px',
};

const stepItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
};

const stepNumber = {
  width: '32px',
  height: '32px',
  backgroundColor: '#0e7490',
  color: '#ffffff',
  borderRadius: '50%',
  fontSize: '16px',
  fontWeight: '700',
  textAlign: 'center' as const,
  lineHeight: '32px',
  marginRight: '12px',
  flexShrink: 0,
};

const stepTitle = {
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const stepDesc = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const supportSection = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
};

const supportTitle = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
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
