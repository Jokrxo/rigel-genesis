# Security Policy

## Overview

Rigel is committed to maintaining the highest security standards for our financial management platform. This document outlines our security practices and how to report vulnerabilities.

## Security Features

### Authentication & Authorization
- **Supabase Authentication**: Industry-standard auth with email/password and OAuth (Google, Facebook)
- **Row Level Security (RLS)**: Database-level security policies ensuring users can only access their own data
- **Session Management**: Secure session handling with automatic token refresh
- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, and numbers

### Data Protection
- **Encryption at Rest**: All data stored in Supabase is encrypted
- **Encryption in Transit**: HTTPS/TLS for all connections
- **Input Validation**: Zod schema validation for all user inputs
- **SQL Injection Prevention**: Parameterized queries and Supabase client methods only
- **XSS Protection**: HTML sanitization for user-generated content
- **CSRF Protection**: Built-in with Supabase auth

### Application Security
- **Environment Variables**: Sensitive data never exposed in client code
- **Error Handling**: Generic error messages to prevent information disclosure
- **Content Security Policy**: Configured to prevent unauthorized script execution
- **Rate Limiting**: API request throttling (handled by Supabase)
- **Secure File Uploads**: Validated file types and size limits

### Compliance
- **SARS Compliance**: Tax calculations aligned with South African Revenue Service requirements
- **POPIA Compliance**: Personal data protection as per Protection of Personal Information Act
- **Data Retention**: Clear policies for data storage and deletion
- **Audit Logs**: Comprehensive logging for financial transactions

## Security Best Practices for Developers

### Code Security
1. Never commit sensitive data (API keys, passwords)
2. Use environment variables for configuration
3. Always validate and sanitize user input
4. Use parameterized queries (Supabase client methods)
5. Implement proper error handling
6. Keep dependencies up to date

### Database Security
1. Always enable RLS on public tables
2. Create specific policies for each operation (SELECT, INSERT, UPDATE, DELETE)
3. Never expose sensitive columns without proper access control
4. Use database functions for complex operations
5. Implement proper foreign key constraints

### Authentication Security
1. Never store passwords in plain text
2. Implement proper session timeout
3. Use secure password reset flows
4. Enable email verification
5. Implement rate limiting for auth attempts

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. Do NOT:
- Open a public GitHub issue
- Disclose the vulnerability publicly
- Exploit the vulnerability

### 2. Please DO:
1. Email security details to: luthando@stella-lumen.com
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if applicable)
3. Allow up to 48 hours for initial response
4. Work with our team to verify and fix the issue

### Response Timeline
- **Initial Response**: Within 48 hours
- **Verification**: Within 5 business days
- **Fix Deployment**: Based on severity (Critical: 24-48hrs, High: 1 week, Medium: 2 weeks)
- **Public Disclosure**: After fix is deployed and verified

## Security Checklist for Production

Before deploying to production, ensure:

- [ ] All RLS policies are enabled and tested
- [ ] Email verification is configured
- [ ] OAuth providers are properly configured
- [ ] Environment variables are set correctly
- [ ] HTTPS is enforced
- [ ] Error logging is configured
- [ ] File upload restrictions are in place
- [ ] Rate limiting is active
- [ ] Security headers are configured
- [ ] Dependencies are up to date
- [ ] Database backups are scheduled
- [ ] Monitoring and alerting is set up

## Security Updates

We regularly update our dependencies and monitor for security advisories:

- **Automated Updates**: Dependabot configured for security patches
- **Monthly Reviews**: Manual security audit of dependencies
- **Quarterly Audits**: Comprehensive security review
- **Annual Penetration Testing**: Third-party security assessment

## Contact

For security concerns or questions:
- Email: luthando@stella-lumen.com
- Response Time: Within 48 hours

## Version History

- **v1.0.0** (2025): Initial security policy
  - Supabase authentication implemented
  - RLS policies configured
  - Input validation added
  - Security utilities created
