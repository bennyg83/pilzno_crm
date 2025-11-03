# 🔒 Security Guide for Public Repository

## ⚠️ Important Security Considerations

This repository is **public**, which means anyone can view the code. Follow these security practices to keep your system safe.

## 🚫 What NOT to Commit

### Never Commit These:

1. **Passwords** (database, admin, API keys)
2. **JWT Secrets** (authentication tokens)
3. **Tailscale IPs or Domains** (your private network infrastructure)
4. **Environment Files** (`.env`, `.env.local`, `.env.production`)
5. **Database Credentials**
6. **API Keys** (third-party services)
7. **Private Keys** (SSL certificates, SSH keys)

### Already Protected (in `.gitignore`):

- ✅ `.env` files
- ✅ `backups/` directories
- ✅ `node_modules/`
- ✅ Test scripts with credentials
- ✅ Password reset scripts

## ✅ Secure Configuration

### Use GitHub Secrets

All sensitive values should be stored in **GitHub Secrets**:

1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Add secrets for:
   - `BACKEND_API_URL` - Your Tailscale URL (HTTPS recommended)
   - Any other sensitive configuration

### Environment Variables

**Never hardcode sensitive values in code!**

Instead, use environment variables:

```typescript
// ❌ BAD - Hardcoded
const password = 'pilzno2024'

// ✅ GOOD - Environment variable
const password = process.env.ADMIN_PASSWORD
```

## 🔐 Current Security Status

### ✅ Secured

- ✅ **Tailscale IP**: Removed from code (only in GitHub Secrets)
- ✅ **Tailscale Domain**: Removed from code (only in GitHub Secrets)
- ✅ **Password Scripts**: Require environment variables
- ✅ **Test Scripts**: Use environment variables
- ✅ **Default Secrets**: Only fallback values (not real secrets)

### ⚠️ Still Need Review

1. **Documentation Files**: Some docs contain example credentials
   - These are marked as "examples" but should be generic
   - Review: `DEPLOYMENT_SUMMARY.md`, `YOUR_TAILSCALE_SETUP.md`, etc.

2. **Default Passwords**: Some code has default fallback values
   - These are development defaults only
   - Production should always use environment variables

## 📋 Security Checklist

Before pushing to a public repo:

- [ ] No hardcoded passwords in code
- [ ] No API keys in code
- [ ] No Tailscale IPs/domains in code
- [ ] No `.env` files committed
- [ ] All secrets in GitHub Secrets
- [ ] Sensitive scripts use environment variables
- [ ] Default values are clearly marked as "development only"
- [ ] Documentation uses placeholder values

## 🔧 Making Code Public-Safe

### Example: Password Reset Script

**Before (Unsafe):**
```javascript
const password = 'pilzno2024' // ❌ Hardcoded!
```

**After (Safe):**
```javascript
const password = process.env.ADMIN_PASSWORD || process.argv[2]
if (!password) {
  console.error('❌ Password required via environment variable')
  process.exit(1)
}
```

### Example: Backend URL

**Before (Unsafe):**
```typescript
return 'https://crm-mini.tail34e202.ts.net:3002' // ❌ Exposes infrastructure
```

**After (Safe):**
```typescript
if (!import.meta.env.VITE_API_BASE_URL) {
  console.error('❌ Set BACKEND_API_URL secret in GitHub Actions')
  return 'https://configure-tailscale-url-in-github-secrets'
}
return import.meta.env.VITE_API_BASE_URL
```

## 🛡️ Protection Strategies

### 1. Use Environment Variables

```bash
# Set locally
export ADMIN_PASSWORD=your_secure_password

# Or in GitHub Actions
env:
  ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
```

### 2. Use GitHub Secrets

All sensitive configuration should be in:
- **GitHub Secrets** (for Actions)
- **Local `.env` files** (never committed)

### 3. Use Placeholder Values in Code

```typescript
// Development defaults (clearly marked)
const JWT_SECRET = process.env.JWT_SECRET || 'DEV_ONLY_CHANGE_IN_PRODUCTION'
```

### 4. Validate Secrets Exist

```typescript
if (!process.env.BACKEND_API_URL) {
  throw new Error('BACKEND_API_URL must be set via GitHub Secrets')
}
```

## 📝 Required GitHub Secrets

For this project to work, you need:

1. **`BACKEND_API_URL`**
   - Your Tailscale backend URL
   - Format: `https://your-machine.tailscale.ts.net:3002`
   - Or: `http://your-tailscale-ip:3002`

2. **Optional: `ADMIN_PASSWORD`**
   - If using automated password reset scripts
   - Only needed for local development

## 🔍 Audit Your Repository

### Check for Exposed Secrets

```bash
# Search for hardcoded passwords
grep -r "password.*=" --include="*.ts" --include="*.js" --include="*.tsx" frontend/ backend/

# Search for hardcoded IPs
grep -r "100\.74\.73\.107" .

# Search for Tailscale domains
grep -r "tailscale\.ts\.net" .
```

### Review Committed Files

```bash
# Check what's tracked
git ls-files | grep -E "\.env|password|secret"

# Check recent commits
git log --all --full-history --source -- "*secret*" "*password*"
```

## 🚨 If You Accidentally Committed Secrets

### Immediate Actions:

1. **Rotate the secrets immediately**:
   - Change all passwords
   - Regenerate JWT secrets
   - Update Tailscale configuration

2. **Remove from Git history**:
   ```bash
   # Use git filter-branch or BFG Repo-Cleaner
   # CAUTION: This rewrites history
   ```

3. **Update GitHub Secrets**:
   - Set new values in GitHub Secrets
   - Remove old secrets

4. **Review exposed data**:
   - Check if anyone accessed the secrets
   - Monitor for unauthorized access

## 📚 Best Practices

### For Public Repos:

1. **Never commit secrets** - Use environment variables
2. **Use GitHub Secrets** - For CI/CD configuration
3. **Review code before pushing** - Check for sensitive data
4. **Use `.gitignore`** - Protect sensitive files
5. **Use placeholder values** - In documentation and examples
6. **Rotate secrets regularly** - Even if not exposed
7. **Monitor access** - Check GitHub audit logs

### For Development:

1. **Use `.env` files** - Never commit them
2. **Use local secrets** - For testing
3. **Document securely** - No real credentials in docs
4. **Use example values** - In documentation

## ✅ Current Security Measures

- ✅ `.gitignore` excludes sensitive files
- ✅ Scripts require environment variables
- ✅ Backend URL uses GitHub Secrets only
- ✅ Default values are clearly marked
- ✅ Test scripts use environment variables

## 🔄 Next Steps

1. **Review all documentation** - Remove any real credentials
2. **Update GitHub Secrets** - Set `BACKEND_API_URL`
3. **Test locally** - Verify everything works with env vars
4. **Monitor repository** - Check for exposed secrets

---

**Last Updated**: November 2, 2025  
**Repository**: Public  
**Security Level**: Enhanced for public exposure

