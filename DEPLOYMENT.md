# Deployment Guide

## Overview

This guide covers deploying Rigel to production, including Supabase configuration, GitHub integration, and deployment options.

## Prerequisites

- [x] GitHub account
- [x] Supabase project (already connected)
- [x] Domain name (optional, for custom domains)
- [x] Production environment secrets

## Supabase Setup

### 1. Database Configuration

Ensure all migrations are applied:
```bash
# Check migration status
supabase db diff

# Apply pending migrations
supabase db push
```

### 2. Row Level Security (RLS)

Verify all tables have RLS enabled:
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. Authentication Setup

Configure auth providers in Supabase Dashboard:
1. Navigate to Authentication → Providers
2. Configure Google OAuth:
   - Add Client ID and Secret
   - Set redirect URLs
3. Configure Facebook OAuth (optional)
4. Set Site URL to your production domain
5. Add redirect URLs for production

### 4. Storage Buckets

Verify storage buckets and policies:
- `statements` bucket with proper RLS policies
- File size limits configured
- MIME type restrictions in place

### 5. Edge Functions

Edge functions are automatically deployed. Verify:
1. All functions are listed in `supabase/config.toml`
2. Environment variables are set
3. Functions are properly configured (JWT verification, CORS)

### 6. Secrets Management

Set production secrets:
```bash
# Via Supabase Dashboard → Settings → API
# Or using CLI:
supabase secrets set OPENAI_API_KEY=your_key_here
```

Required secrets:
- `OPENAI_API_KEY`: For AI features
- `SUPABASE_SERVICE_ROLE_KEY`: For admin operations (auto-configured)

## GitHub Integration

### 1. Connect Repository

If not already connected:
1. Click GitHub button in Lovable editor
2. Authorize Lovable GitHub App
3. Select organization and create repository

### 2. Branch Setup

Configure branches:
- `main`: Production branch
- `develop`: Development branch (optional)
- Feature branches for new development

### 3. CI/CD Workflows

The repository includes GitHub Actions for:
- Automated testing on PR
- Linting and type checking
- Build verification

## Deployment Options

### Option 1: Lovable Hosting (Recommended)

1. Click "Publish" button in Lovable editor
2. Review changes
3. Publish to production URL
4. Access at: `your-project.lovable.app`

#### Custom Domain Setup
1. Navigate to Project → Settings → Domains
2. Add custom domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: @ (or subdomain)
   Value: your-project.lovable.app
   ```
4. Enable SSL (automatic)

### Option 2: Self-Hosting

Clone repository and build:

```bash
# Clone repository
git clone https://github.com/your-org/rigel.git
cd rigel

# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy `dist/` folder to:
- Vercel
- Netlify  
- Cloudflare Pages
- Your own server

#### Environment Variables for Self-Hosting

Create `.env.production`:
```env
VITE_SUPABASE_URL=https://upmlbzaskdloikeqgtzz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Never commit `.env` files to Git!

### Option 3: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t rigel .
docker run -p 80:80 rigel
```

## Post-Deployment Checklist

### Functionality Testing
- [ ] User registration and login
- [ ] OAuth providers (Google, Facebook)
- [ ] Password reset flow
- [ ] File upload (bank statements)
- [ ] Transaction processing
- [ ] Financial statement generation
- [ ] AI features (if enabled)
- [ ] Report generation
- [ ] Tax calculations
- [ ] All CRUD operations

### Security Verification
- [ ] HTTPS enabled
- [ ] RLS policies active
- [ ] Email verification working
- [ ] File upload restrictions enforced
- [ ] API rate limiting active
- [ ] Error messages don't expose sensitive data
- [ ] CSP headers configured
- [ ] Session timeouts working

### Performance Testing
- [ ] Page load times < 3s
- [ ] Image optimization working
- [ ] Lazy loading implemented
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Mobile responsive

### Monitoring Setup
- [ ] Error tracking (Supabase logs)
- [ ] Analytics configured
- [ ] Uptime monitoring
- [ ] Database performance monitoring
- [ ] Edge function logs accessible

## Maintenance

### Regular Updates
- Update dependencies monthly
- Review security advisories weekly
- Apply Supabase platform updates
- Monitor error logs daily

### Backup Strategy
- Database: Automatic daily backups (Supabase)
- Files: Storage bucket replication enabled
- Code: Version controlled in GitHub

### Rollback Procedure
If issues arise:
1. In Lovable: Use version history to revert
2. Self-hosted: Rollback Git commit and redeploy
3. Database: Use Supabase backup restore

## Monitoring & Logs

### Application Logs
Access via Lovable console or hosting platform logs

### Database Logs
```sql
-- Recent errors
SELECT * FROM postgres_logs 
WHERE error_severity IN ('ERROR', 'FATAL')
ORDER BY timestamp DESC 
LIMIT 100;

-- Slow queries
SELECT * FROM postgres_logs 
WHERE duration > 1000
ORDER BY timestamp DESC 
LIMIT 100;
```

### Edge Function Logs
View in Supabase Dashboard → Edge Functions → Function Name → Logs

## Troubleshooting

### Common Issues

**Authentication not working**
- Verify Site URL in Supabase auth settings
- Check redirect URLs configuration
- Ensure OAuth credentials are correct

**Database connection errors**
- Check Supabase project status
- Verify connection string
- Review RLS policies

**File upload failures**
- Check storage bucket policies
- Verify file size limits
- Review CORS configuration

**Deployment failures**
- Clear build cache
- Check environment variables
- Review build logs

## Support

For deployment assistance:
- Email: luthando@stella-lumen.com
- Documentation: [Lovable Docs](https://docs.lovable.dev)
- Supabase Docs: [Supabase Documentation](https://supabase.com/docs)

## Version History

- **v1.0.0**: Initial deployment guide
- Production-ready configuration
- Security hardening complete
- CI/CD workflows configured
