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

---

## 🔄 **HIGH Priority Fixes - Implementation Status**

### ✅ **Completed (Client-Side Fixes)**

#### 1. Contact Form Email Misleading UX - FIXED ✅
- **Issue**: Form always showed success even though no email was sent
- **Fix**: Removed misleading email function, updated success messaging
- **Files**: `src/services/emailService.ts`, `src/components/Contact.tsx`

#### 2. Razorpay Error Handling - FIXED ✅
- **Issue**: Generic error messages for all payment failures
- **Fix**: Added specific error code parsing with actionable messages
- **Files**: `src/components/Services.tsx` (lines 275-309, 494-498)

#### 3. Navigation Timeout Memory Leak - FIXED ✅
- **Issue**: setTimeout calls not cleaned up on unmount
- **Fix**: Track timeout IDs with useRef and cleanup on unmount
- **Files**: `src/components/Navigation.tsx` (lines 11-50, 75-95)

#### 4. Throttled Scroll Handler - FIXED ✅
- **Issue**: Scroll event firing on every pixel scroll (performance hit)
- **Fix**: Throttled to 100ms with significant change detection
- **Files**: `src/components/Navigation.tsx` (lines 14-41)

#### 5. Image Error Handler Infinite Loop - FIXED ✅
- **Issue**: onError could trigger repeatedly if fallback also fails
- **Fix**: Track failed images in Set to prevent re-triggering
- **Files**: `src/components/Projects.tsx` (lines 197, 415-421)

---

### ⏳ **Pending (Server-Side Implementation Required)**

#### 6. Encrypt Chat History in LocalStorage
- **Priority**: HIGH
- **Requires**: Client-side encryption library (CryptoJS or Web Crypto API)
- **Implementation**:
  ```typescript
  // Install: npm install crypto-js @types/crypto-js
  import CryptoJS from 'crypto-js';
  
  const saveChatHistory = (msgs: Message[]) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(msgs),
      getUserId() // Use user ID as encryption key
    ).toString();
    localStorage.setItem(CHAT_HISTORY_KEY, encrypted);
  };
  ```
- **Files**: `src/components/AIChatbot.tsx` (lines 850-885)
- **Estimated Time**: 2 hours

#### 7. Server-Side Phone Validation
- **Priority**: HIGH
- **Requires**: Supabase Edge Function or PostgreSQL constraint
- **Implementation**:
  ```sql
  -- Add CHECK constraint in Supabase
  ALTER TABLE inquiries
  ADD CONSTRAINT valid_phone_format
  CHECK (phone ~* '^\+?[1-9]\d{7,14}$');
  ```
- **Files**: Supabase database schema, `src/components/Contact.tsx`
- **Estimated Time**: 1 hour

#### 8. CSRF Protection for Payment Flow
- **Priority**: HIGH
- **Requires**: Session management in Supabase Edge Functions
- **Implementation**:
  ```typescript
  // Generate CSRF token on page load
  const csrfToken = crypto.randomUUID();
  sessionStorage.setItem('csrf_token', csrfToken);
  
  // Include in payment requests
  headers: {
    'X-CSRF-Token': sessionStorage.getItem('csrf_token')
  }
  
  // Validate in Supabase Edge Function
  const csrfToken = req.headers.get('x-csrf-token');
  // Compare with session token
  ```
- **Files**: `src/components/Services.tsx`, `supabase/functions/create-payment-order/index.ts`
- **Estimated Time**: 3 hours

#### 9. Server-Side Rate Limiting
- **Priority**: HIGH
- **Requires**: Supabase Edge Function middleware or Upstash Redis
- **Implementation**:
  ```typescript
  // supabase/functions/ai-chatbot/index.ts
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";
  
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
  });
  
  const identifier = userId || clientIp;
  const { success } = await ratelimit.limit(identifier);
  if (!success) return new Response('Rate limit exceeded', { status: 429 });
  ```
- **Files**: `supabase/functions/ai-chatbot/index.ts`
- **Estimated Time**: 4 hours (includes Upstash setup)

#### 10. Categorize Supabase Edge Function Errors
- **Priority**: HIGH
- **Requires**: Access to Supabase Edge Function code
- **Implementation**:
  ```typescript
  // supabase/functions/ai-chatbot/index.ts
  try {
    const result = await gemini.generateContent(prompt);
    return new Response(JSON.stringify({ success: true, message: result }));
  } catch (error) {
    // Categorize errors
    if (error.message.includes('quota')) {
      return new Response(JSON.stringify({
        error: 'QUOTA_EXCEEDED',
        message: 'API quota exceeded. Please try again later.'
      }), { status: 429 });
    } else if (error.message.includes('auth')) {
      return new Response(JSON.stringify({
        error: 'AUTH_ERROR',
        message: 'Authentication failed. Please contact support.'
      }), { status: 401 });
    }
    // ... more error categories
  }
  ```
- **Files**: `supabase/functions/ai-chatbot/index.ts` (lines 222-241)
- **Estimated Time**: 2 hours

#### 11. Add Retry Logic to Payment Order Creation
- **Priority**: HIGH
- **Requires**: Retry logic in Supabase Edge Function
- **Implementation**:
  ```typescript
  // supabase/functions/create-payment-order/index.ts
  async function createOrderWithRetry(orderData, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const order = await razorpay.orders.create(orderData);
        return order;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        // Exponential backoff: 2^attempt * 100ms
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }
  ```
- **Files**: `supabase/functions/create-payment-order/index.ts`
- **Estimated Time**: 2 hours

#### 12. Enhanced EmailJS Failure Notifications
- **Priority**: MEDIUM (partially implemented)
- **Status**: Already logs to console; needs user-facing alerts
- **Implementation**: Add toast notifications instead of console.log
- **Files**: `src/services/invoiceService.ts` (lines 161-211)
- **Estimated Time**: 1 hour

---

## 📋 **Implementation Roadmap**

### Phase 1: Quick Wins (1-2 hours each)
1. ✅ Contact form email fix - DONE
2. ✅ Razorpay error handling - DONE
3. ✅ Navigation timeout cleanup - DONE
4. ✅ Throttled scroll handler - DONE
5. ✅ Image error loop prevention - DONE
6. ⏳ Enhanced EmailJS notifications (1 hour)
7. ⏳ Server-side phone validation (1 hour)

### Phase 2: Encryption & Security (2-4 hours each)
8. ⏳ Encrypt chat history (2 hours)
9. ⏳ Categorize Supabase errors (2 hours)
10. ⏳ Payment retry logic (2 hours)
11. ⏳ CSRF protection (3 hours)

### Phase 3: Advanced (4+ hours each)
12. ⏳ Server-side rate limiting (4 hours)

---

## 🎯 **Total Estimated Time for Remaining Fixes**

- **Quick Wins**: 2 hours
- **Phase 2**: 9 hours
- **Phase 3**: 4 hours
- **Total**: ~15 hours of development time

---

## 📞 **Support & Resources**

For implementation assistance:
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Upstash Redis: https://upstash.com/docs/redis/overall/getstarted
- CryptoJS: https://cryptojs.gitbook.io/docs/

---

**Last Updated**: January 2025 (Phase 1 Complete)  
**Status**: 5 of 12 HIGH priority fixes completed ✅

