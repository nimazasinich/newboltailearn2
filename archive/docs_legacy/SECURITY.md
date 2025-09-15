<!-- ARCHIVED: moved from repo root on 2025-09-15 for cleanliness -->
# Security Documentation

## Overview

This document outlines the security measures implemented in the Persian Legal AI system and provides guidelines for maintaining security.

## Security Features

### 1. Authentication & Authorization

- **JWT-based authentication** with 24-hour token expiration
- **Role-based access control (RBAC)** with hierarchical permissions:
  - `viewer`: Read-only access
  - `trainer`: Can create and manage models/training
  - `admin`: Full system access
- **Password hashing** using bcrypt with 12 salt rounds
- **Session management** with secure cookies

### 2. Input Validation & Sanitization

- **Zod schema validation** for all API endpoints
- **DOMPurify sanitization** for output to prevent XSS
- **SQL injection prevention** using parameterized queries
- **File upload restrictions** and validation

### 3. Rate Limiting

Configurable rate limits for different endpoint types:

| Endpoint Type | Default Limit | Window |
|--------------|---------------|---------|
| Global | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| API | 30 requests | 1 minute |
| Training | 10 requests | 1 hour |
| Download | 20 requests | 1 hour |

### 4. CSRF Protection

- **Double-submit cookie pattern** for state-changing operations
- **CSRF tokens** generated per session
- **Automatic token injection** in responses
- **Token validation** on POST/PUT/DELETE requests

### 5. Security Headers

Implemented via Helmet.js:

- **Content Security Policy (CSP)**
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Strict-Transport-Security (HSTS)**
- **X-XSS-Protection**: 1; mode=block

### 6. Environment Variables

All sensitive configuration stored in environment variables:

```bash
# Required Security Variables
JWT_SECRET=<min-32-chars>
SESSION_SECRET=<min-32-chars>
HF_TOKEN_B64=<base64-encoded-token>

# Optional Security Configuration
RATE_LIMIT_GLOBAL=100
RATE_LIMIT_AUTH=5
SKIP_CSRF=false  # Only for development
```

### 7. Data Protection

- **Database encryption** at rest (SQLite encryption extension)
- **Secure token storage** using base64 encoding
- **No hardcoded secrets** in codebase
- **Automatic database backups** before migrations

## Security Best Practices

### For Developers

1. **Never commit secrets** to version control
2. **Always validate input** before processing
3. **Use parameterized queries** for database operations
4. **Keep dependencies updated** (run `npm audit` regularly)
5. **Follow the principle of least privilege** for permissions
6. **Log security events** for audit trails

### For Deployment

1. **Use HTTPS only** in production
2. **Enable all security headers**
3. **Configure firewall rules** appropriately
4. **Rotate secrets regularly**
5. **Monitor security logs**
6. **Keep system packages updated**

## Vulnerability Reporting

If you discover a security vulnerability, please:

1. **DO NOT** create a public GitHub issue
2. Email security details to: security@persian-legal-ai.example
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] JWT_SECRET is unique and secure (min 32 chars)
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] CSRF protection active
- [ ] Security headers configured
- [ ] HTTPS/TLS certificates valid
- [ ] Firewall rules configured
- [ ] Monitoring/alerting setup

### Regular Maintenance

- [ ] Weekly: Check security logs
- [ ] Weekly: Review failed authentication attempts
- [ ] Monthly: Run `npm audit` and fix vulnerabilities
- [ ] Monthly: Review and rotate API keys
- [ ] Quarterly: Security assessment
- [ ] Quarterly: Update dependencies
- [ ] Annually: Penetration testing

## Incident Response

### If a Security Breach Occurs:

1. **Immediate Actions**:
   - Isolate affected systems
   - Preserve logs and evidence
   - Reset all credentials
   - Notify stakeholders

2. **Investigation**:
   - Determine scope of breach
   - Identify attack vector
   - Assess data exposure

3. **Remediation**:
   - Patch vulnerabilities
   - Strengthen affected controls
   - Update security policies

4. **Recovery**:
   - Restore from clean backups
   - Monitor for suspicious activity
   - Document lessons learned

## Compliance

The system is designed to comply with:

- **GDPR** - General Data Protection Regulation
- **OWASP Top 10** - Security best practices
- **ISO 27001** - Information security standards

## Security Tools

### Recommended Tools

- **npm audit**: Dependency vulnerability scanning
- **Trivy**: Container security scanning
- **OWASP ZAP**: Web application security testing
- **SonarQube**: Code security analysis
- **Snyk**: Continuous security monitoring

### Security Commands

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities (production only)
npm audit fix --only=prod

# Update dependencies
npm update

# Run security tests
npm run test:security

# Database backup
npm run db:backup

# Generate secure secrets
openssl rand -base64 32
```

## Contact

For security concerns, contact:
- Security Team: security@persian-legal-ai.example
- Emergency: +98-XXX-XXXX (24/7 hotline)

---

*Last Updated: [Current Date]*
*Version: 1.0.0*