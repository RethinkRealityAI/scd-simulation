# Instance Management Quick Reference

## Quick Start Guide

### 1. Creating a New Simulation Instance

1. **Access Admin Dashboard**
   ```
   Navigate to: http://localhost:5173/admin
   ```

2. **Create New Instance**
   - Click "Simulation Instances" tab
   - Click "Create New Instance" button
   - Fill in required fields:
     - Instance Name: "University of Health Sciences"
     - Institution Name: "University of Health Sciences"
     - Webhook URL: "https://your-webhook.com/simulation-data"
     - Webhook Secret: "your-secret-key"

3. **Configure Branding**
   ```json
   {
     "primary_color": "#3b82f6",
     "secondary_color": "#1e40af", 
     "accent_color": "#f59e0b",
     "background_color": "#ffffff",
     "text_color": "#1f2937",
     "font_family": "Inter, sans-serif",
     "logo_url": "https://example.com/logo.png"
   }
   ```

4. **Save and Test**
   - Click "Create Instance"
   - Test the instance URL: `/sim/{institution_id}`

### 2. Accessing Instance URLs

```
Main Instance URL: /sim/{institution_id}
Welcome Screen:    /sim/{institution_id}/
Scene 1:          /sim/{institution_id}/scene/1
Scene 2:          /sim/{institution_id}/scene/2
Completion:       /sim/{institution_id}/completion
```

### 3. Common Configuration Tasks

#### Update Instance Branding
```typescript
// In Admin Dashboard > Instance Settings > Branding
{
  "primary_color": "#your-color",
  "secondary_color": "#your-color",
  "logo_url": "https://your-logo-url.com/logo.png"
}
```

#### Configure Webhook
```typescript
// In Admin Dashboard > Instance Settings > Webhook
{
  "webhook_url": "https://your-endpoint.com/webhook",
  "webhook_secret": "your-secret-key",
  "webhook_retry_count": 3,
  "webhook_timeout_seconds": 10
}
```

#### Set Access Controls
```typescript
// In Admin Dashboard > Instance Settings > Access
{
  "requires_approval": false,
  "max_sessions_per_day": 100,
  "session_timeout_minutes": 60
}
```

### 4. Testing Your Instance

#### Test Instance Loading
```bash
# Navigate to instance URL
curl http://localhost:5173/sim/{institution_id}
```

#### Test Webhook Endpoint
```bash
# Test webhook with sample data
curl -X POST https://your-webhook.com/simulation-data \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: your-signature" \
  -d '{"test": true, "timestamp": "2024-01-01T00:00:00Z"}'
```

#### Test Branding
1. Open instance URL in browser
2. Verify colors match your configuration
3. Check logo displays correctly
4. Test form functionality

### 5. Monitoring & Analytics

#### View Instance Analytics
```
Admin Dashboard > Simulation Instances > [Instance] > Analytics
```

#### Check Webhook Status
```sql
-- Check webhook success rate
SELECT 
  instance_id,
  COUNT(*) as total_sessions,
  SUM(CASE WHEN webhook_sent = true THEN 1 ELSE 0 END) as successful_webhooks,
  (SUM(CASE WHEN webhook_sent = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM instance_session_data 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY instance_id;
```

#### Monitor Performance
```typescript
// Check instance performance
const checkInstanceHealth = async (instanceId: string) => {
  const metrics = {
    loadTime: 0,
    errorRate: 0,
    webhookSuccess: 0,
    activeSessions: 0
  };
  
  // Implementation details...
  return metrics;
};
```

### 6. Troubleshooting Common Issues

#### Issue: Instance Not Loading
**Check:**
- Institution ID is correct
- Instance is active (`is_active = true`)
- Database connection is working

**Fix:**
```sql
-- Activate instance
UPDATE simulation_instances 
SET is_active = true 
WHERE institution_id = 'your-institution-id';
```

#### Issue: Webhook Not Receiving Data
**Check:**
- Webhook URL is accessible
- Webhook secret is correct
- Network connectivity

**Fix:**
```typescript
// Test webhook manually
const testWebhook = async (url: string, secret: string) => {
  const testData = { test: true };
  const signature = generateSignature(testData, secret);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature
    },
    body: JSON.stringify(testData)
  });
  
  return response.ok;
};
```

#### Issue: Branding Not Applied
**Check:**
- Branding config is valid JSON
- Colors are in correct format (#hex)
- Logo URL is accessible

**Fix:**
```typescript
// Validate branding config
const validateBranding = (config: any) => {
  const errors = [];
  
  if (!config.primary_color || !/^#[0-9A-F]{6}$/i.test(config.primary_color)) {
    errors.push('Invalid primary color');
  }
  
  if (config.logo_url && !isValidUrl(config.logo_url)) {
    errors.push('Invalid logo URL');
  }
  
  return errors;
};
```

### 7. Database Queries

#### Get All Instances
```sql
SELECT 
  id,
  name,
  institution_name,
  institution_id,
  is_active,
  created_at
FROM simulation_instances 
ORDER BY created_at DESC;
```

#### Get Instance Analytics
```sql
SELECT 
  si.name,
  si.institution_name,
  COUNT(isd.id) as total_sessions,
  AVG(isd.completion_data->>'final_score') as avg_score,
  COUNT(CASE WHEN isd.webhook_sent = true THEN 1 END) as successful_webhooks
FROM simulation_instances si
LEFT JOIN instance_session_data isd ON si.id = isd.instance_id
WHERE si.id = 'your-instance-id'
GROUP BY si.id, si.name, si.institution_name;
```

#### Check Webhook Failures
```sql
SELECT 
  instance_id,
  session_id,
  webhook_attempts,
  webhook_last_attempt,
  created_at
FROM instance_session_data 
WHERE webhook_sent = false 
  AND webhook_attempts > 0
ORDER BY created_at DESC;
```

### 8. Maintenance Tasks

#### Daily Maintenance
- [ ] Check webhook success rates
- [ ] Monitor instance performance
- [ ] Review error logs
- [ ] Backup instance configurations

#### Weekly Maintenance
- [ ] Update instance analytics
- [ ] Clean up old session data
- [ ] Review access logs
- [ ] Test webhook endpoints

#### Monthly Maintenance
- [ ] Review and update branding
- [ ] Analyze usage patterns
- [ ] Update documentation
- [ ] Security audit

### 9. Security Checklist

#### Instance Security
- [ ] Webhook secrets are strong and unique
- [ ] Access tokens have proper expiration
- [ ] RLS policies are correctly configured
- [ ] Sensitive data is encrypted

#### Webhook Security
- [ ] HTTPS endpoints only
- [ ] Signature verification enabled
- [ ] Rate limiting implemented
- [ ] Error handling secure

### 10. Emergency Procedures

#### Instance Down
1. Check database connectivity
2. Verify instance is active
3. Check for recent configuration changes
4. Restore from backup if needed

#### Webhook Failures
1. Test webhook endpoint manually
2. Check network connectivity
3. Verify webhook secret
4. Review retry logs

#### Data Loss
1. Stop all instance activity
2. Restore from latest backup
3. Verify data integrity
4. Test instance functionality

---

## Quick Commands

### Database Commands
```bash
# Apply migrations
supabase db push

# Reset database
supabase db reset

# Check status
supabase status
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Instance Management
```bash
# Create instance (via API)
curl -X POST http://localhost:5173/api/instances \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Instance", "institution_name": "Test University"}'

# Get instance details
curl http://localhost:5173/api/instances/{instance-id}

# Update instance
curl -X PUT http://localhost:5173/api/instances/{instance-id} \
  -H "Content-Type: application/json" \
  -d '{"branding_config": {"primary_color": "#3b82f6"}}'
```

This quick reference should help you manage simulation instances efficiently. For detailed information, refer to the main documentation guide.
