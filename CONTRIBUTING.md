# Contributing to Rigel

Thank you for your interest in contributing to Rigel! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- GitHub account
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/rigel.git
   cd rigel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:8080

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 2. Make Your Changes

Follow these guidelines:

#### Code Style
- Use TypeScript for all new code
- Follow existing code formatting (Prettier configured)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

#### Component Guidelines
```typescript
// ✅ Good: Typed props, clear structure
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <Button onClick={() => onEdit(user.id)}>Edit</Button>
    </Card>
  );
}

// ❌ Bad: Untyped props, inline styles
export function UserCard({ user, onEdit }) {
  return (
    <div style={{ padding: '16px' }}>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
}
```

#### Design System Usage
- Always use semantic tokens from the design system
- Never use hardcoded colors
- Use existing components from `/src/components/ui`

```typescript
// ✅ Good: Semantic tokens
<div className="bg-card text-card-foreground border-border">

// ❌ Bad: Hardcoded colors  
<div className="bg-white text-black border-gray-200">
```

#### Accessibility
- Add proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios (WCAG AA)
- Test with screen readers when possible

```typescript
// ✅ Good: Accessible
<button
  aria-label="Delete transaction"
  onClick={handleDelete}
>
  <TrashIcon className="h-4 w-4" />
</button>

// ❌ Bad: Not accessible
<button onClick={handleDelete}>
  <TrashIcon className="h-4 w-4" />
</button>
```

### 3. Testing

Before submitting:

#### Manual Testing
- Test your changes in the browser
- Check responsiveness (mobile, tablet, desktop)
- Test both light and dark modes
- Verify all theme colors work correctly
- Test error states and edge cases

#### Automated Testing
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when available)
npm run test
```

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "feat: add VAT calculator component"
git commit -m "fix: resolve date picker timezone issue"
git commit -m "docs: update deployment guide"
git commit -m "refactor: extract form validation logic"

# Bad commit messages
git commit -m "update"
git commit -m "fixes"
git commit -m "changes"
```

Commit message format:
```
<type>: <short description>

<optional longer description>

<optional footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

## Pull Request Guidelines

### PR Title
Follow the same format as commit messages:
```
feat: Add transaction export to Excel
fix: Correct tax calculation for high earners
docs: Improve README installation steps
```

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Changes Made
- List of specific changes
- Another change

## Testing Done
- How you tested the changes
- Which scenarios were covered

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my own code
- [ ] Commented complex sections
- [ ] Updated documentation if needed
- [ ] No console errors or warnings
- [ ] Tested in multiple browsers
- [ ] Checked responsive design
- [ ] Tested dark/light modes
```

## Database Changes

For database migrations:

1. **Never modify existing migrations**
2. **Create new migration files**
   ```sql
   -- Migration: Add user preferences table
   CREATE TABLE user_preferences (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users NOT NULL,
     theme TEXT DEFAULT 'system',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

   -- Add policies
   CREATE POLICY "Users can view their own preferences"
     ON user_preferences FOR SELECT
     USING (auth.uid() = user_id);
   ```

3. **Always include RLS policies**
4. **Test migration thoroughly**

## Documentation

Update documentation when:
- Adding new features
- Changing APIs
- Updating dependencies
- Modifying configuration

Documentation files:
- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `SECURITY.md` - Security practices
- `CONTRIBUTING.md` - This file

## Review Process

### What Reviewers Look For

1. **Code Quality**
   - Clean, readable code
   - Proper TypeScript types
   - Following established patterns

2. **Functionality**
   - Feature works as described
   - No regressions
   - Edge cases handled

3. **Security**
   - Input validation
   - No security vulnerabilities
   - Proper authentication checks

4. **Performance**
   - No unnecessary re-renders
   - Optimized database queries
   - Reasonable bundle size impact

5. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - Color contrast

### Addressing Feedback

- Respond to all comments
- Make requested changes promptly
- Ask questions if unclear
- Update the PR description if scope changes

## Release Process

Releases are managed by maintainers:

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Create Git tag
4. Deploy to production
5. Create GitHub release

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Security**: Email luthando@stella-lumen.com

## Recognition

Contributors will be:
- Added to `CONTRIBUTORS.md`
- Mentioned in release notes
- Acknowledged in the README

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Rigel! 🚀
