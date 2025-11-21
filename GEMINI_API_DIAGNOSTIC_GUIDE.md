# 🔍 Gemini API Error Diagnostic Guide

## 🚨 **The Problem You're Experiencing**

You're seeing "I encountered a temporary issue. Please try again in a moment." for **EVERY** question - even simple ones like "What are your rates?"

---

## 🎯 **ROOT CAUSE FOUND**

The frontend was **hiding the real error messages** from the Gemini API backend!

### What Was Happening:

1. **Backend** (Supabase Edge Function) calls Gemini API
2. Gemini API returns an error (could be rate limit, quota, auth, etc.)
3. **Backend** creates helpful error message like:
   - "I'm experiencing high demand right now. Please wait a moment and try again!"
   - "I'm having trouble connecting. Please contact support at..."
4. **Frontend** receives the error but **IGNORES** the helpful message
5. **Frontend** shows generic "I encountered a temporary issue" instead

**Result:** You never knew what the actual problem was!

---

## 🛠️ **THE FIX**

I've fixed the frontend to:
1. ✅ **Check for errors FIRST** before checking success
2. ✅ **Show the actual error message** from the backend
3. ✅ **Log comprehensive diagnostics** to the browser console
4. ✅ **Display user-friendly messages** for each error type

---

## 📊 **How to Debug Now**

### **Step 1: Open Browser Console**

1. Open your website
2. Press **F12** (or **Cmd+Option+I** on Mac)
3. Click the **Console** tab
4. Ask the chatbot a question

### **Step 2: Look for These Logs**

You'll now see detailed logging:

```
🔍 API Response: {
  status: 429,                    // HTTP status code
  ok: false,                      // Request failed
  success: undefined,             // No success field (it's an error)
  hasMessage: true,               // Has error message
  hasError: true,                 // Error flag is present
  error: "QUOTA_EXCEEDED",        // Error type
  userMessage: "I'm experiencing high demand right now..."  // User-friendly message
}
```

```
❌ Backend Error Response: {
  status: 429,
  errorCode: "QUOTA_EXCEEDED",
  technicalMessage: "⚠️ AI service is temporarily at capacity...",
  userMessage: "I'm experiencing high demand right now. Please wait a moment and try again!",
  fullResponse: { ... }           // Complete API response
}
```

---

## 🔎 **Common Error Types & Solutions**

### **Error 1: QUOTA_EXCEEDED (Status 429)**

**Message:** "I'm experiencing high demand right now. Please wait a moment and try again!"

**Cause:**
- Gemini API free tier rate limits
- Too many requests in short time
- Free quota exhausted

**Solutions:**
1. **Wait 60 seconds** and try again
2. **Upgrade to paid API** in Google AI Studio
3. **Implement exponential backoff** (wait longer between retries)
4. **Add rate limiting** on frontend to prevent rapid clicks

**Check Quota:**
- Go to: https://aistudio.google.com/app/apikey
- Click on your API key
- Check "Usage" tab

---

### **Error 2: AUTH_ERROR (Status 401/403)**

**Message:** "I'm having trouble connecting. Please contact support at sudharsanofficial0001@gmail.com"

**Cause:**
- Invalid/expired API key
- API key not enabled for Gemini 2.0 Flash
- API key missing required permissions

**Solutions:**
1. **Check API Key Configuration:**
   ```bash
   # In Supabase Dashboard:
   # Settings > Edge Functions > Secrets
   # Verify GEMINI_API_KEY is set correctly
   ```

2. **Generate New API Key:**
   - Go to: https://aistudio.google.com/app/apikey
   - Create new API key
   - Update in Supabase Edge Function secrets

3. **Verify Model Access:**
   - Check your API key has access to `gemini-2.0-flash` model
   - Some keys are restricted to specific models

---

### **Error 3: INVALID_REQUEST (Status 400)**

**Message:** "I couldn't understand that request. Please try asking in a different way."

**Cause:**
- Malformed request to Gemini API
- Invalid conversation history format
- Message too long (exceeds token limit)

**Solutions:**
1. **Check Message Length:**
   - Max input tokens: ~30,000 (Gemini 2.0 Flash)
   - Current config: `maxOutputTokens: 400`

2. **Verify Conversation History:**
   - Frontend sends last 6 messages
   - Check format in console logs

3. **Test with Simple Message:**
   - Try: "Hello"
   - If it works, the issue is with complex messages

---

### **Error 4: SERVER_ERROR (Status 500+)**

**Message:** "The AI service is experiencing issues. Please try again in a few minutes."

**Cause:**
- Google AI/Gemini server downtime
- Internal server error at Gemini API

**Solutions:**
1. **Check Gemini Status:**
   - Google Cloud Status: https://status.cloud.google.com/
   - Wait 5-10 minutes and retry

2. **Retry Logic:**
   - Automatic retry with exponential backoff already implemented
   - If persists > 30 minutes, contact Google support

---

### **Error 5: NETWORK_ERROR (Status 408/504)**

**Message:** "The request timed out. Please check your internet connection and try again."

**Cause:**
- User's internet connection slow/unstable
- Gemini API slow to respond
- Timeout threshold too low

**Solutions:**
1. **Check User Internet:**
   - Test at: https://fast.com/
   - Minimum: 1 Mbps for reliable API calls

2. **Increase Timeout:**
   ```typescript
   // In edge function, add:
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
   ```

---

## 🧪 **Testing Your Fixes**

### **Test 1: Rate Limit Detection**

1. Send 10 rapid messages (click send repeatedly)
2. **Expected:** After ~5-10 messages, see rate limit error
3. **Check Console:** Should show `QUOTA_EXCEEDED`
4. **User Sees:** "I'm experiencing high demand..."

### **Test 2: Simple Questions Work**

1. Ask: "What are your rates?"
2. **Expected:** Normal response with pricing
3. **Check Console:** Should show `success: true`
4. **User Sees:** Normal pricing information

### **Test 3: Complex Questions**

1. Ask: "Can you tell me about all your services, pricing, timelines, and technologies in detail?"
2. **Expected:** May hit token limits or rate limits
3. **Check Console:** Look for error type
4. **User Sees:** Appropriate error message (not generic)

---

## 📈 **Monitoring & Prevention**

### **1. Set Up Rate Limiting on Frontend**

Add this to prevent users from spamming:

```typescript
// In AIChatbot.tsx
const [lastMessageTime, setLastMessageTime] = useState(0);
const MIN_MESSAGE_INTERVAL = 2000; // 2 seconds

const handleSendMessage = async (promptText?: string) => {
  const now = Date.now();
  if (now - lastMessageTime < MIN_MESSAGE_INTERVAL) {
    alert('Please wait a moment before sending another message.');
    return;
  }
  setLastMessageTime(now);
  // ... rest of function
};
```

### **2. Implement Exponential Backoff**

For automatic retry on temporary errors:

```typescript
const retryWithBackoff = async (fn: Function, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

### **3. Add Error Analytics**

Track which errors occur most frequently:

```typescript
// After error handling:
if (data.error) {
  // Send to analytics (e.g., Google Analytics, Mixpanel)
  gtag('event', 'chatbot_error', {
    error_type: data.error,
    user_message: messageText.substring(0, 50), // First 50 chars
    timestamp: Date.now(),
  });
}
```

---

## 🎯 **Specific to Your Free Gemini API Key**

### **Free Tier Limits (as of 2024):**

| Limit | Free Tier | Paid Tier |
|-------|-----------|-----------|
| **Requests per minute** | 15 RPM | 360 RPM |
| **Requests per day** | 1,500 RPD | 10,000+ RPD |
| **Tokens per minute** | 32,000 TPM | 4M TPM |
| **Concurrent requests** | 5 | 60 |

### **Your Current Configuration:**

```typescript
// In supabase/functions/ai-chatbot/index.ts
generationConfig: {
  temperature: 0.7,           // Creativity level
  topP: 0.95,                 // Nucleus sampling
  maxOutputTokens: 400,       // Max response length
}
```

**Estimated Usage:**
- Average input: ~200 tokens (conversation history + prompt)
- Average output: ~150-300 tokens (response)
- **Total per request: ~350-500 tokens**

**With 32,000 TPM free limit:**
- Theoretical max: **64-91 messages/minute**
- Practical limit with 15 RPM: **15 messages/minute**

### **When You'll Hit Limits:**

1. **Rapid Testing:**
   - Sending messages every 2-3 seconds
   - Will hit 15 RPM limit quickly
   - **Solution:** Add 4-second delay between messages

2. **Multiple Users:**
   - 3-4 users chatting simultaneously
   - Can exhaust free tier quickly
   - **Solution:** Upgrade to paid tier ($0.00015/1K tokens)

3. **Long Conversations:**
   - 10+ message exchanges (lots of history)
   - More tokens per request
   - **Solution:** Limit conversation history to last 4 messages

---

## 🚀 **Immediate Action Items**

### **For Development:**
1. ✅ **Already Fixed:** Frontend now shows real error messages
2. ✅ **Already Fixed:** Comprehensive error logging
3. ⏳ **Test:** Try chatbot again and check console logs
4. ⏳ **Monitor:** Watch for QUOTA_EXCEEDED errors

### **For Production:**
1. 🎯 **Add Rate Limiting:** Prevent users from rapid-firing messages
2. 🎯 **Upgrade API Key:** Consider paid tier if seeing frequent QUOTA_EXCEEDED
3. 🎯 **Implement Caching:** Cache common responses (FAQ-style questions)
4. 🎯 **Monitor Usage:** Track daily API calls in Google AI Studio

---

## 📞 **Still Seeing Issues?**

### **Debug Checklist:**

- [ ] Open browser console (F12)
- [ ] Send a test message
- [ ] Look for `🔍 API Response:` log
- [ ] Check `status` code (200 = success, 429 = rate limit, 401 = auth error)
- [ ] Read `error` field (error type)
- [ ] Read `userMessage` field (what user sees)
- [ ] Copy console logs and share with developer

### **What to Share When Reporting Issues:**

```
1. Error Type: (from console, e.g., QUOTA_EXCEEDED)
2. Status Code: (e.g., 429)
3. User Message: (what the chatbot showed)
4. Test Message: (what you asked the chatbot)
5. Timestamp: (when it happened)
6. Frequency: (every message? occasional?)
7. Console Logs: (screenshot or text)
```

---

## ✅ **Expected Behavior After Fix**

### **Before Fix:**
- ❌ Every error: "I encountered a temporary issue"
- ❌ No way to know what went wrong
- ❌ No diagnostic information
- ❌ Frustrating user experience

### **After Fix:**
- ✅ Rate limit: "I'm experiencing high demand right now..."
- ✅ Auth error: "Please contact support at [email]"
- ✅ Network error: "Check your internet connection"
- ✅ Detailed console logs for debugging
- ✅ Clear, actionable error messages

---

## 🎓 **Learning: Why This Happened**

### **Backend had perfect error handling:**
```typescript
// Backend was doing this correctly:
if (response.status === 429) {
  return {
    error: 'QUOTA_EXCEEDED',
    userMessage: "I'm experiencing high demand right now..."
  };
}
```

### **Frontend was ignoring it:**
```typescript
// Frontend was doing this WRONG:
if (data.success && data.message) {
  // Show message
} else {
  // Show generic "temporary issue" ❌
  // Ignored data.userMessage completely!
}
```

### **The Fix:**
```typescript
// Frontend now does this CORRECTLY:
if (!response.ok || data.error) {
  // Show data.userMessage ✅
  return;
}
if (data.success && data.message) {
  // Show message
}
```

---

## 🎉 **Summary**

**What I Fixed:**
1. ✅ Frontend now detects errors before checking success
2. ✅ Shows actual backend error messages (`userMessage` field)
3. ✅ Comprehensive console logging for debugging
4. ✅ Early return prevents fallthrough to generic handler

**What You Should Do:**
1. 🧪 Test the chatbot with the new fix
2. 👀 Check browser console for detailed logs
3. 📊 Monitor for QUOTA_EXCEEDED errors
4. 💰 Consider upgrading to paid API key if hitting limits frequently

**What You'll See:**
- Clear, actionable error messages
- Specific guidance for each error type
- Detailed diagnostic logs in console
- Much better user experience!

---

*Last Updated: 2025* 🚀
