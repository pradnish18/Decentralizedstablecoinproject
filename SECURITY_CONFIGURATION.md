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

### ✅ Index Optimization (Applied)
Removed unused indexes to reduce write overhead:
- `idx_transactions_status`
- `idx_transactions_created`
- `idx_kyc_user`
- `idx_wallets_user`
- `idx_wallets_address`

**Kept Essential Indexes:**
- `idx_transactions_sender` - Used for transaction lookups by sender
- `idx_exchange_rates_pair` - Used for exchange rate queries

## Manual Configuration Required

### ⚠️ Enable Leaked Password Protection

**Why This Matters:**
Supabase Auth can check passwords against HaveIBeenPwned.org to prevent users from using compromised passwords. This adds an important security layer.

**How to Enable:**

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Policies**
3. Find **Password Requirements** section
4. Enable **"Check password against HaveIBeenPwned"**

**Alternative - Via Supabase Management API:**

```bash
curl -X PATCH 'https://api.supabase.com/v1/projects/{ref}/config/auth' \
  -H "Authorization: Bearer {service_role_key}" \
  -H "Content-Type: application/json" \
  -d '{
    "SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION": true,
    "PASSWORD_HIBP_ENABLED": true
  }'
```

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
