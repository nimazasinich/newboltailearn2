<!-- ARCHIVED: moved from repo root on 2025-09-15 for cleanliness -->
# 🔒 Persian Legal AI - Production Security Checklist

## Pre-Deployment Security Checklist

### ✅ Environment Configuration

- [ ] **JWT_SECRET**: Set to secure random string (32+ characters)
  ```bash
  # Generate: openssl rand -base64 32
  JWT_SECRET=your_secure_jwt_secret_32_characters_minimum
  ```

- [ ] **SESSION_SECRET**: Set to secure random string (32+ characters)
  ```bash
  # Generate: openssl rand -base64 32
  SESSION_SECRET=your_secure_session_secret_32_characters_minimum
  ```

- [ ] **CSRF_SECRET**: Set to secure random string (32+ characters)
  ```bash
  # Generate: openssl rand -base64 32
  CSRF_SECRET=your_secure_csrf_secret_32_characters_minimum
  ```

- [ ] **NODE_ENV**: Set to "production"
  ```bash
  NODE_ENV=production
  ```

- [ ] **CORS_ORIGIN**: Set to your production domain
  ```bash
  CORS_ORIGIN=https://your-production-domain.com
  ```

- [ ] **HF_TOKEN_B64**: Set to base64-encoded HuggingFace token (if using HF integration)
  ```bash
  # Encode: echo -n "hf_your_token_here" | base64
  HF_TOKEN_B64=your_base64_encoded_huggingface_token_here
  ```

### ✅ Feature Flags (Production Values)

- [ ] **DEMO_MODE**: Set to false
  ```bash
  DEMO_MODE=false
  ```

- [ ] **USE_FAKE_DATA**: Set to false
  ```bash
  USE_FAKE_DATA=false
  ```

- [ ] **SKIP_CSRF**: Set to false
  ```bash
  SKIP_CSRF=false
  ```

- [ ] **USE_WORKERS**: Set to true (for better performance)
  ```bash
  USE_WORKERS=true
  ```

### ✅ Database Security

- [ ] **Database file permissions**: Ensure database file is not world-readable
  ```bash
  chmod 600 persian_legal_ai.db
  ```

- [ ] **Database directory permissions**: Ensure data directory is secure
  ```bash
  chmod 700 ./data
  ```

- [ ] **SQLite pragmas**: Verify foreign keys and WAL mode are enabled
  - Foreign keys: ON
  - Journal mode: WAL
  - Synchronous: NORMAL

### ✅ Authentication & Authorization

- [ ] **Default admin password**: Change from default
  ```bash
  # Default: Admin123!@#
  # Change via API or database update
  ```

- [ ] **JWT token expiration**: Verify reasonable expiration times
- [ ] **Session timeout**: Configure appropriate session timeouts
- [ ] **Rate limiting**: Verify rate limits are configured
  - Global: 100 requests/minute
  - Auth: 5 requests/minute
  - API: 30 requests/minute

### ✅ Network Security

- [ ] **HTTPS**: Ensure all traffic uses HTTPS in production
- [ ] **Firewall**: Configure appropriate firewall rules
- [ ] **Port exposure**: Only expose necessary ports (3001)
- [ ] **CORS**: Verify CORS is configured for production domain only

### ✅ File System Security

- [ ] **Upload restrictions**: Verify file upload restrictions
- [ ] **Directory traversal**: Ensure no directory traversal vulnerabilities
- [ ] **File permissions**: Verify appropriate file permissions
- [ ] **Log files**: Ensure log files are not world-readable

### ✅ Application Security

- [ ] **Input validation**: Verify all inputs are validated
- [ ] **SQL injection**: Ensure parameterized queries are used
- [ ] **XSS protection**: Verify XSS protection is enabled
- [ ] **CSRF protection**: Verify CSRF tokens are required for state-changing operations

### ✅ Monitoring & Logging

- [ ] **Log levels**: Set appropriate log levels for production
- [ ] **Log rotation**: Configure log rotation
- [ ] **Monitoring**: Set up application monitoring
- [ ] **Alerting**: Configure alerts for critical issues

### ✅ Backup & Recovery

- [ ] **Database backup**: Set up regular database backups
- [ ] **File backup**: Backup uploaded files and models
- [ ] **Recovery plan**: Document recovery procedures
- [ ] **Backup testing**: Test backup restoration procedures

## Post-Deployment Security Verification

### ✅ Security Testing

- [ ] **Penetration testing**: Perform basic penetration testing
- [ ] **Vulnerability scanning**: Run vulnerability scans
- [ ] **Security headers**: Verify security headers are present
- [ ] **SSL/TLS**: Verify SSL/TLS configuration

### ✅ Performance Testing

- [ ] **Load testing**: Test under expected load
- [ ] **Stress testing**: Test beyond expected capacity
- [ ] **Memory usage**: Monitor memory usage patterns
- [ ] **Response times**: Verify acceptable response times

### ✅ Monitoring Setup

- [ ] **Health checks**: Verify health check endpoints work
- [ ] **Metrics collection**: Set up metrics collection
- [ ] **Log aggregation**: Set up log aggregation
- [ ] **Alerting**: Configure alerting for critical issues

## Security Best Practices

### 🔐 Secrets Management

1. **Never commit secrets to version control**
2. **Use environment variables for all secrets**
3. **Rotate secrets regularly**
4. **Use different secrets for different environments**

### 🛡️ Access Control

1. **Principle of least privilege**
2. **Regular access reviews**
3. **Strong password policies**
4. **Multi-factor authentication where possible**

### 📊 Monitoring

1. **Monitor all authentication attempts**
2. **Log all administrative actions**
3. **Monitor for unusual patterns**
4. **Set up automated alerts**

### 🔄 Updates & Maintenance

1. **Keep dependencies updated**
2. **Apply security patches promptly**
3. **Regular security audits**
4. **Document security procedures**

## Emergency Response

### 🚨 Incident Response Plan

1. **Identify the incident**
2. **Contain the threat**
3. **Eradicate the threat**
4. **Recover systems**
5. **Document lessons learned**

### 📞 Contact Information

- **Security Team**: [security@yourcompany.com]
- **System Administrator**: [admin@yourcompany.com]
- **Emergency Contact**: [emergency@yourcompany.com]

## Compliance & Legal

### 📋 Data Protection

- [ ] **Data classification**: Classify all data types
- [ ] **Data retention**: Implement data retention policies
- [ ] **Data encryption**: Encrypt sensitive data at rest and in transit
- [ ] **Privacy policy**: Ensure privacy policy is up to date

### ⚖️ Legal Requirements

- [ ] **Terms of service**: Ensure terms of service are current
- [ ] **Privacy policy**: Verify privacy policy compliance
- [ ] **Data processing agreements**: Review data processing agreements
- [ ] **Regulatory compliance**: Ensure compliance with applicable regulations

---

## Quick Security Commands

### Generate Secure Secrets
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32

# Generate CSRF secret
openssl rand -base64 32
```

### Verify Security Configuration
```bash
# Check environment variables
env | grep -E "(JWT_SECRET|SESSION_SECRET|CSRF_SECRET|NODE_ENV)"

# Check file permissions
ls -la persian_legal_ai.db
ls -la ./data/

# Test health endpoint
curl -f http://localhost:3001/health
```

### Security Audit
```bash
# Check for exposed secrets
grep -r "password\|secret\|key" --exclude-dir=node_modules --exclude-dir=.git .

# Check file permissions
find . -type f -perm /o+w

# Check for world-readable files
find . -type f -perm /o+r
```

---

**⚠️ IMPORTANT**: This checklist should be reviewed and updated regularly. Security is an ongoing process, not a one-time setup.

**📅 Last Updated**: September 13, 2025
**🔄 Next Review**: October 13, 2025