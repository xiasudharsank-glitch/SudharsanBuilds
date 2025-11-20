# 🔐 Security Considerations & Recommendations

This document outlines security considerations for the SudharsanBuilds portfolio website and provides recommendations for improving data protection.

---

## ⚠️ Current Security Concerns

### 1. **Sensitive Data Storage (HIGH PRIORITY)**

**Issue**: Customer personally identifiable information (PII) is currently stored as plain text in the Supabase database.

**Affected Data**:
- Customer email addresses (`customer_email`)
- Customer phone numbers (`customer_phone`)
- Payment IDs (`payment_id`, `order_id`)
- Project details (may contain sensitive business information)

**Affected Files**:
- `src/services/invoiceService.ts` (lines 122-123)
- Supabase `invoices` table

**Risk Level**: HIGH
- Data breach could expose customer contact information
- Potential GDPR/privacy compliance violations
- Reputation damage if customer data is compromised

---

## ✅ Recommended Security Improvements

### Priority 1: Encrypt Sensitive PII Data

#### Option A: Supabase Vault (Recommended)
Use Supabase's built-in encryption features:

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create encrypted columns
ALTER TABLE invoices
  ADD COLUMN customer_email_encrypted BYTEA,
  ADD COLUMN customer_phone_encrypted BYTEA;

-- Encrypt data using pgp_sym_encrypt
-- Example insert:
INSERT INTO invoices (customer_email_encrypted, customer_phone_encrypted)
VALUES (
  pgp_sym_encrypt('customer@example.com', current_setting('app.encryption_key')),
  pgp_sym_encrypt('+1234567890', current_setting('app.encryption_key'))
);

-- Decrypt when reading:
SELECT
  pgp_sym_decrypt(customer_email_encrypted, current_setting('app.encryption_key'))::text as customer_email
FROM invoices;
```

**Setup**:
1. Go to Supabase Dashboard → Settings → Vault
2. Create a new encryption key
3. Update `invoiceService.ts` to use encrypted fields
4. Migrate existing data

#### Option B: Client-Side Encryption
Encrypt data before sending to database:

```typescript
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = env.ENCRYPTION_KEY; // Store securely

function encryptPII(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

function decryptPII(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Usage in invoiceService.ts
customer_email: encryptPII(paymentData.email),
customer_phone: encryptPII(paymentData.phone),
```

---

### Priority 2: Implement Row-Level Security (RLS) Policies

**Current Status**: Basic RLS enabled but needs refinement

**Recommendations**:

```sql
-- Update RLS policies for invoices table
ALTER POLICY "Allow customers to view their own invoices" ON invoices
  USING (
    auth.jwt() ->> 'email' = pgp_sym_decrypt(customer_email_encrypted, current_setting('app.encryption_key'))::text
  );

-- Add policy for service role only (admin access)
CREATE POLICY "Service role full access" ON invoices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Revoke public access
REVOKE ALL ON invoices FROM anon, authenticated;
```

---

### Priority 3: Secure LocalStorage (Chat History)

**Issue**: Chat history stored in plain text in browser localStorage

**File**: `src/components/AIChatbot.tsx`

**Recommendation**: Encrypt chat history before storing

```typescript
import CryptoJS from 'crypto-js';

const saveChatHistory = (msgs: Message[]) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(msgs),
      getUserId() // Use user ID as encryption key
    ).toString();

    localStorage.setItem(CHAT_HISTORY_KEY, encrypted);
  } catch (error) {
    // Handle quota exceeded errors (already implemented)
  }
};

const loadChatHistory = () => {
  try {
    const encrypted = localStorage.getItem(CHAT_HISTORY_KEY);
    if (encrypted) {
      const decrypted = CryptoJS.AES.decrypt(encrypted, getUserId()).toString(CryptoJS.enc.Utf8);
      const history = JSON.parse(decrypted);
      setMessages(history);
    }
  } catch (error) {
    console.error('Failed to decrypt chat history:', error);
    // Clear corrupted data
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }
};
```

---

### Priority 4: Environment Variable Security

**Current Status**: ✅ Good - .env files properly gitignored

**Verify**:
```bash
# Ensure these are in .gitignore:
.env
.env.local
.env.production
.env.*.local
```

**Production Checklist**:
- [ ] Rotate all API keys before public launch
- [ ] Use Vercel environment variables (never commit to git)
- [ ] Enable "Sensitive" flag for sensitive env vars in Vercel
- [ ] Regularly rotate Razorpay and Supabase keys (every 90 days)

---

### Priority 5: Input Validation & Sanitization

**Current Status**: ✅ Good - DOMPurify implemented for blog content

**Verify All User Inputs Are Sanitized**:
- [x] Blog content (Blog.tsx) - ✅ Fixed with DOMPurify
- [x] Contact form (Contact.tsx) - ✅ Using sanitize.ts
- [x] Booking form (Services.tsx) - ✅ Using sanitize.ts
- [x] AI Chat messages (AIChatbot.tsx) - ✅ Markdown rendering with sanitization

---

### Priority 6: CSRF Protection

**Issue**: Payment flow lacks CSRF tokens

**Recommendation**: Add CSRF tokens to all state-changing requests

```typescript
// Generate CSRF token on page load
const csrfToken = crypto.randomUUID();
sessionStorage.setItem('csrf_token', csrfToken);

// Include in payment requests
body: JSON.stringify({
  ...paymentData,
  csrf_token: sessionStorage.getItem('csrf_token')
}),

// Validate on server (Supabase Edge Function)
if (request.csrf_token !== session.csrf_token) {
  throw new Error('Invalid CSRF token');
}
```

---

### Priority 7: Rate Limiting (Server-Side)

**Current Status**: Client-side rate limiting only (can be bypassed)

**Recommendation**: Implement server-side rate limiting in Supabase Edge Functions

```typescript
// supabase/functions/ai-chatbot/index.ts
import { rateLimit } from '@supabase/supabase-js';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  limit: 10 // 10 requests per minute
});

// In handler:
const identifier = userId || req.headers.get('x-forwarded-for');
const { success } = await limiter.check(identifier);

if (!success) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

---

## 🔍 Security Audit Checklist

Before deploying to production:

### Authentication & Authorization
- [ ] All API endpoints require authentication
- [ ] Row-Level Security (RLS) enabled on all tables
- [ ] Service role keys not exposed client-side
- [ ] JWT tokens properly validated

### Data Protection
- [ ] Sensitive PII data encrypted at rest
- [ ] TLS/HTTPS enabled (Vercel provides this automatically)
- [ ] Database backups enabled in Supabase
- [ ] Payment data handled according to PCI DSS guidelines (Razorpay handles this)

### Input Validation
- [ ] All user inputs sanitized (XSS prevention)
- [ ] SQL injection prevention (Supabase client handles this)
- [ ] File upload validation (if implemented)
- [ ] Phone number validation (server-side)

### API Security
- [ ] Rate limiting implemented (server-side)
- [ ] CSRF protection on state-changing requests
- [ ] CORS properly configured
- [ ] API keys rotated regularly

### Monitoring & Logging
- [ ] Error logging configured (Vercel Analytics, Sentry)
- [ ] Failed login attempts monitored
- [ ] Unusual payment activity alerts
- [ ] Regular security audit logs reviewed

---

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Razorpay Security](https://razorpay.com/docs/payments/payments/security/)
- [GDPR Compliance](https://gdpr.eu/)

---

## 🔄 Regular Security Maintenance

**Monthly Tasks**:
- Review and update dependencies (`npm audit`)
- Check for security vulnerabilities
- Review access logs for suspicious activity

**Quarterly Tasks**:
- Rotate API keys and secrets
- Review and update RLS policies
- Conduct security penetration testing
- Update security documentation

**Annually**:
- Full security audit by third party
- Update encryption algorithms to latest standards
- Review compliance with data protection regulations

---

## 📞 Reporting Security Issues

If you discover a security vulnerability, please email: **sudharsanofficial0001@gmail.com**

Do not create public GitHub issues for security vulnerabilities.

---

**Last Updated**: January 2025
**Next Review Date**: April 2025
**Maintained by**: Sudharsan
