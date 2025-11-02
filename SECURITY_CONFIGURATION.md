# Security Configuration Guide

## Completed Security Optimizations

### ✅ RLS Policy Optimization (Applied)
All Row Level Security policies have been optimized for better performance:

**Before:**
```sql
USING (auth.uid() = id)
```

**After:**
```sql
USING ((select auth.uid()) = id)
```

**Impact:**
- Prevents re-evaluation of auth functions for each row
- Reduces CPU usage for RLS checks
- Improves query response times at scale
- Better performance with large datasets

**Tables Optimized:**
- `profiles` - 3 policies
- `transactions` - 3 policies
- `kyc_documents` - 2 policies
- `wallets` - 4 policies

### ✅ Foreign Key Indexes (Applied)
Added indexes for all foreign key columns to optimize JOIN performance:
- `idx_kyc_documents_user_id` - Foreign key to profiles
- `idx_wallets_user_id` - Foreign key to profiles

**Impact:**
- Faster queries when filtering by user_id
- Better JOIN performance between tables
- Improved foreign key constraint checking

**Kept Essential Indexes:**
- `idx_transactions_sender` - Used for transaction lookups by sender
- `idx_exchange_rates_pair` - Used for exchange rate queries

## Manual Configuration Required

### ⚠️ CRITICAL: Enable Leaked Password Protection

**Why This Matters:**
Supabase Auth can check passwords against HaveIBeenPwned.org to prevent users from using compromised passwords. This is a **critical security feature** that protects users from credential stuffing attacks.

**📋 Step-by-Step Instructions:**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on **"Authentication"** in the left sidebar
   - Then click on **"Policies"** or **"Password"** tab

3. **Enable Password Protection**
   - Look for **"Security and Protection"** section
   - Find the option: **"Leaked Password Protection"** or **"HaveIBeenPwned Integration"**
   - Toggle it **ON**
   - Save changes

**Alternative Path (if above doesn't work):**
1. Go to **Project Settings** (gear icon)
2. Click **"Authentication"**
3. Scroll to **"Password Protection"**
4. Enable **"Check against HaveIBeenPwned database"**

**What This Does:**
- ✅ Checks new passwords against 600M+ compromised passwords
- ✅ Prevents users from choosing known leaked passwords
- ✅ Protects against credential stuffing attacks
- ✅ No performance impact (uses k-anonymity model)
- ✅ User passwords are never sent to HaveIBeenPwned

**Note:** This is a **dashboard-only setting** and cannot be applied via SQL migrations.

## Security Best Practices Currently Implemented

### ✅ Authentication
- Email/password authentication with Supabase Auth
- Secure session management
- Row-level security on all tables

### ✅ KYC Compliance
- Document verification system
- Status tracking (pending, verified, rejected)
- User data protection

### ✅ Database Security
- All tables have RLS enabled
- Optimized policies for performance
- Users can only access their own data
- Foreign key constraints for data integrity

### ✅ Data Protection
- Passwords hashed with bcrypt
- Sensitive data encrypted at rest
- Secure API key management via environment variables
- No secrets in code or version control

### ✅ Frontend Security
- Input validation on all forms
- Wallet address validation (Ethereum format)
- CSRF protection via Supabase client
- Secure cookie handling

## Monitoring & Maintenance

### Regular Security Checks
1. Review RLS policies quarterly
2. Monitor for unused indexes
3. Check for security advisories
4. Update dependencies regularly
5. Review authentication logs

### Performance Monitoring
1. Monitor query performance
2. Check RLS policy execution times
3. Review index usage
4. Optimize as needed

## Additional Recommendations

### Multi-Factor Authentication (MFA)
Consider enabling MFA for high-value transactions:
```sql
create policy "Restrict high-value transfers"
on transactions
as restrictive
for insert
to authenticated
using (
  amount_inr < 50000 OR
  (select auth.jwt()->>'aal') = 'aal2'
);
```

### Rate Limiting
Implement rate limiting for:
- Transaction creation (prevent spam)
- KYC submissions
- Authentication attempts

### Audit Logging
Consider adding audit trails for:
- Transaction status changes
- KYC verification decisions
- Profile updates
- Wallet connections

## Security Incident Response

1. **Immediate Actions:**
   - Disable affected accounts
   - Review audit logs
   - Notify affected users

2. **Investigation:**
   - Identify attack vector
   - Assess data breach scope
   - Document findings

3. **Remediation:**
   - Patch vulnerabilities
   - Update security policies
   - Strengthen affected systems

4. **Follow-up:**
   - Review security practices
   - Update documentation
   - Train team on new procedures

## Compliance Considerations

### Indian Financial Regulations
- KYC/AML compliance
- Data localization requirements
- Transaction reporting
- User consent management

### GDPR (if applicable)
- Right to access
- Right to deletion
- Data portability
- Privacy by design

## Contact & Support

For security concerns or questions:
- Review Supabase Security Docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Check HaveIBeenPwned: https://haveibeenpwned.com/
- Supabase Support: https://supabase.com/support
