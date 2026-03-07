# Multi-Institutional Simulation Management System

## Overview

The Multi-Institutional Simulation Management System allows administrators to create and manage separate simulation instances for different institutions. Each instance can have its own branding, content, and data collection while maintaining the core simulation functionality.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Admin Dashboard Features](#admin-dashboard-features)
4. [Instance Management](#instance-management)
5. [Branding & Customization](#branding--customization)
6. [Data Collection & Webhooks](#data-collection--webhooks)
7. [User Access & Security](#user-access--security)
8. [API Endpoints](#api-endpoints)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance & Updates](#maintenance--updates)

## System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Institutional System                │
├─────────────────────────────────────────────────────────────┤
│  Admin Dashboard (React)                                    │
│  ├── Instance Management                                    │
│  ├── Branding Configuration                                 │
│  ├── Content Management                                     │
│  └── Analytics Dashboard                                    │
├─────────────────────────────────────────────────────────────┤
│  Instance-Specific Simulations (React)                      │
│  ├── InstanceWelcomeScreen                                  │
│  ├── InstanceSimulationScene                                │
│  ├── InstanceResultsScreen                                  │
│  └── InstanceSimulationContext                              │
├─────────────────────────────────────────────────────────────┤
│  Database Layer (Supabase)                                  │
│  ├── simulation_instances                                   │
│  ├── instance_access_tokens                                 │
│  ├── instance_session_data                                  │
│  └── Content Override Tables                               │
├─────────────────────────────────────────────────────────────┤
│  Webhook Integration                                        │
│  ├── Data Transmission                                      │
│  ├── Retry Logic                                            │
│  └── Error Handling                                         │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

- **Instance Isolation**: Each institution has its own simulation instance
- **Branding Customization**: Colors, logos, fonts per institution
- **Content Overrides**: Videos, scenes, audio specific to each instance
- **Data Collection**: Instance-specific webhook endpoints
- **Access Control**: Secure token-based access
- **Analytics**: Per-instance usage tracking

## Database Schema

### Core Tables

#### `simulation_instances`
```sql
CREATE TABLE simulation_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  institution_id TEXT UNIQUE NOT NULL,
  description TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  webhook_retry_count INTEGER DEFAULT 3,
  webhook_timeout_seconds INTEGER DEFAULT 10,
  branding_config JSONB DEFAULT '{}'::jsonb,
  content_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  max_sessions_per_day INTEGER,
  session_timeout_minutes INTEGER DEFAULT 60,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `instance_access_tokens`
```sql
CREATE TABLE instance_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `instance_session_data`
```sql
CREATE TABLE instance_session_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_data JSONB,
  simulation_data JSONB,
  completion_data JSONB,
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_attempts INTEGER DEFAULT 0,
  webhook_last_attempt TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### Content Override Tables

#### `instance_video_overrides`
```sql
CREATE TABLE instance_video_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  original_video_id UUID REFERENCES simulation_videos(id),
  override_video_url TEXT,
  override_title TEXT,
  override_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `instance_character_overrides`
```sql
CREATE TABLE instance_character_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  original_character_id UUID REFERENCES scene_characters(id),
  override_name TEXT,
  override_description TEXT,
  override_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `instance_audio_overrides`
```sql
CREATE TABLE instance_audio_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  original_audio_id UUID REFERENCES scene_audio_files(id),
  override_audio_url TEXT,
  override_title TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Admin Dashboard Features

### Navigation Structure

```
Admin Dashboard
├── Simulation Instances (Primary Tab)
│   ├── Instance List
│   ├── Create New Instance
│   ├── Instance Settings
│   └── Instance Analytics
├── Videos
├── Scene Management
├── Analytics
├── Settings
└── Welcome Screen
```

### Institution Selector

The admin dashboard includes a modern institution selector that allows switching between different simulation instances:

```typescript
// AdminHeader.tsx
const AdminHeader = ({ instances, selectedInstance, setSelectedInstance }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <InstitutionSelector 
          instances={instances}
          selectedInstance={selectedInstance}
          setSelectedInstance={setSelectedInstance}
        />
        <NavigationTabs />
      </div>
    </div>
  );
};
```

## Instance Management

### Creating a New Instance

1. **Navigate to Admin Dashboard**
   - Go to `/admin`
   - Click "Simulation Instances" tab

2. **Fill Instance Details**
   ```typescript
   const instanceData = {
     name: "University of Health Sciences Simulation",
     institution_name: "University of Health Sciences",
     description: "Advanced healthcare simulation for medical students",
     webhook_url: "https://your-webhook-endpoint.com/simulation-data",
     webhook_secret: "your-secret-key",
     branding_config: {
       primary_color: "#3b82f6",
       secondary_color: "#1e40af",
       accent_color: "#f59e0b",
       background_color: "#ffffff",
       text_color: "#1f2937",
       font_family: "Inter, sans-serif",
       logo_url: "https://example.com/logo.png"
     }
   };
   ```

3. **Configure Webhook Settings**
   - **Webhook URL**: Endpoint for receiving simulation data
   - **Webhook Secret**: Authentication key for webhook requests
   - **Retry Count**: Number of retry attempts (default: 3)
   - **Timeout**: Request timeout in seconds (default: 10)

4. **Set Access Controls**
   - **Requires Approval**: Whether instances need admin approval
   - **Max Sessions**: Daily session limit (optional)
   - **Session Timeout**: Auto-logout time in minutes

### Instance Settings

#### Basic Information
- **Instance Name**: Display name for the simulation
- **Institution Name**: Official institution name
- **Description**: Detailed description of the simulation
- **Status**: Active/Inactive toggle

#### Webhook Configuration
```typescript
interface WebhookConfig {
  webhook_url: string;
  webhook_secret: string;
  webhook_retry_count: number;
  webhook_timeout_seconds: number;
}
```

#### Branding Configuration
```typescript
interface BrandingConfig {
  primary_color: string;      // Main brand color
  secondary_color: string;    // Secondary brand color
  accent_color: string;       // Accent/highlight color
  background_color: string;   // Background color
  text_color: string;         // Text color
  font_family: string;        // Font family
  logo_url: string;          // Institution logo
  custom_css: string;        // Custom CSS overrides
}
```

#### Content Configuration
```typescript
interface ContentConfig {
  video_overrides: VideoOverride[];
  character_overrides: CharacterOverride[];
  audio_overrides: AudioOverride[];
  scene_modifications: SceneModification[];
}
```

## Branding & Customization

### Color Scheme Management

Each instance can have its own color scheme:

```typescript
// Example branding configuration
const brandingConfig = {
  primary_color: "#3b82f6",      // Blue
  secondary_color: "#1e40af",    // Dark Blue
  accent_color: "#f59e0b",        // Orange
  background_color: "#ffffff",    // White
  text_color: "#1f2937",         // Dark Gray
  font_family: "Inter, sans-serif"
};
```

### Logo Integration

```typescript
// Logo configuration
const logoConfig = {
  logo_url: "https://example.com/institution-logo.png",
  logo_alt: "Institution Logo",
  logo_width: "auto",
  logo_height: "32px"
};
```

### Custom CSS

For advanced customization, instances can include custom CSS:

```css
/* Custom CSS for institution-specific styling */
.instance-custom-styles {
  --institution-primary: #3b82f6;
  --institution-secondary: #1e40af;
}

.custom-button {
  background: linear-gradient(135deg, var(--institution-primary), var(--institution-secondary));
  border-radius: 8px;
  padding: 12px 24px;
}
```

## Data Collection & Webhooks

### Webhook Payload Structure

When a simulation is completed, the system sends data to the configured webhook:

```typescript
interface WebhookPayload {
  instance_id: string;
  session_id: string;
  user_data: {
    education_level: string;
    organization: string;
    school: string;
    year: string;
    program: string;
    field: string;
    how_heard: string;
  };
  simulation_data: {
    scenes_completed: number;
    total_scenes: number;
    completion_time: number;
    scores: Record<string, number>;
  };
  completion_data: {
    completed_at: string;
    total_time: number;
    final_score: number;
    performance_metrics: any;
  };
  metadata: {
    user_agent: string;
    ip_address: string;
    timestamp: string;
  };
}
```

### Webhook Security

```typescript
// Webhook signature verification
const verifyWebhookSignature = (payload: string, signature: string, secret: string) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};
```

### Retry Logic

```typescript
const sendWebhookData = async (instanceId: string, data: WebhookPayload) => {
  const instance = await getInstance(instanceId);
  const maxRetries = instance.webhook_retry_count || 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(instance.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': generateSignature(data, instance.webhook_secret)
        },
        body: JSON.stringify(data),
        timeout: instance.webhook_timeout_seconds * 1000
      });
      
      if (response.ok) {
        await markWebhookSent(instanceId, data.session_id);
        return;
      }
    } catch (error) {
      if (attempt === maxRetries) {
        await logWebhookError(instanceId, data.session_id, error);
        throw error;
      }
      await delay(1000 * attempt); // Exponential backoff
    }
  }
};
```

## User Access & Security

### Access Token Generation

```typescript
const generateAccessToken = async (instanceId: string, expiresIn: number = 24 * 60 * 60) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  
  await supabase
    .from('instance_access_tokens')
    .insert({
      instance_id: instanceId,
      token: token,
      expires_at: expiresAt.toISOString(),
      is_active: true
    });
  
  return token;
};
```

### Instance URL Structure

```
Main Simulation:     /sim/:institutionId
Welcome Screen:      /sim/:institutionId/
Scene:              /sim/:institutionId/scene/:sceneId
Completion:         /sim/:institutionId/completion
```

### Security Measures

1. **Row Level Security (RLS)**: Database-level access control
2. **Token-based Authentication**: Secure access tokens for instances
3. **Webhook Signatures**: Cryptographic verification of webhook data
4. **Rate Limiting**: Protection against abuse
5. **Data Encryption**: Sensitive data encrypted at rest

## API Endpoints

### Instance Management

```typescript
// Create new instance
POST /api/instances
{
  "name": "University Simulation",
  "institution_name": "University Name",
  "webhook_url": "https://webhook.example.com",
  "branding_config": { ... }
}

// Get instance details
GET /api/instances/:id

// Update instance
PUT /api/instances/:id
{
  "branding_config": { ... },
  "content_config": { ... }
}

// Delete instance
DELETE /api/instances/:id
```

### Analytics Endpoints

```typescript
// Get instance analytics
GET /api/instances/:id/analytics
{
  "total_sessions": 150,
  "completion_rate": 0.85,
  "average_score": 78.5,
  "sessions_today": 12,
  "top_performing_scenes": [...]
}

// Get session data
GET /api/instances/:id/sessions
{
  "sessions": [...],
  "pagination": { ... }
}
```

## Troubleshooting

### Common Issues

#### 1. Instance Not Loading
**Symptoms**: "Simulation Not Found" error
**Causes**:
- Invalid institution ID
- Instance is inactive
- Database connection issues

**Solutions**:
```typescript
// Check instance status
const checkInstanceStatus = async (institutionId: string) => {
  const { data, error } = await supabase
    .from('simulation_instances')
    .select('*')
    .eq('institution_id', institutionId)
    .eq('is_active', true)
    .single();
  
  if (error) {
    console.error('Instance not found:', error);
    return null;
  }
  
  return data;
};
```

#### 2. Webhook Failures
**Symptoms**: Data not reaching webhook endpoint
**Causes**:
- Invalid webhook URL
- Network connectivity issues
- Authentication failures

**Solutions**:
```typescript
// Test webhook connectivity
const testWebhook = async (webhookUrl: string, secret: string) => {
  const testPayload = {
    test: true,
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': generateSignature(testPayload, secret)
      },
      body: JSON.stringify(testPayload)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Webhook test failed:', error);
    return false;
  }
};
```

#### 3. Branding Not Applied
**Symptoms**: Instance shows default styling instead of custom branding
**Causes**:
- Invalid CSS in branding config
- Missing logo URL
- Color format issues

**Solutions**:
```typescript
// Validate branding configuration
const validateBrandingConfig = (config: BrandingConfig) => {
  const errors = [];
  
  if (!config.primary_color || !isValidColor(config.primary_color)) {
    errors.push('Invalid primary color format');
  }
  
  if (config.logo_url && !isValidUrl(config.logo_url)) {
    errors.push('Invalid logo URL');
  }
  
  if (config.custom_css && !isValidCSS(config.custom_css)) {
    errors.push('Invalid custom CSS');
  }
  
  return errors;
};
```

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Enable debug mode
const DEBUG_MODE = process.env.NODE_ENV === 'development';

const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, data);
  }
};
```

## Maintenance & Updates

### Database Migrations

When updating the system, run database migrations:

```bash
# Apply new migrations
supabase db push

# Check migration status
supabase migration list

# Rollback if needed
supabase db reset
```

### Instance Updates

To update an instance:

1. **Backup Current Configuration**
   ```typescript
   const backupInstance = async (instanceId: string) => {
     const { data } = await supabase
       .from('simulation_instances')
       .select('*')
       .eq('id', instanceId)
       .single();
     
     // Save backup
     await saveBackup(instanceId, data);
   };
   ```

2. **Update Instance Settings**
   ```typescript
   const updateInstance = async (instanceId: string, updates: Partial<InstanceData>) => {
     const { data, error } = await supabase
       .from('simulation_instances')
       .update(updates)
       .eq('id', instanceId)
       .select()
       .single();
     
     if (error) throw error;
     return data;
   };
   ```

3. **Test Changes**
   ```typescript
   const testInstance = async (instanceId: string) => {
     // Test instance loading
     const instance = await loadInstance(instanceId);
     
     // Test webhook
     await testWebhook(instance.webhook_url, instance.webhook_secret);
     
     // Test branding
     await validateBrandingConfig(instance.branding_config);
   };
   ```

### Performance Monitoring

Monitor system performance:

```typescript
// Performance metrics
const performanceMetrics = {
  instance_load_time: 0,
  webhook_response_time: 0,
  database_query_time: 0,
  error_rate: 0
};

const trackPerformance = (metric: string, startTime: number) => {
  const duration = Date.now() - startTime;
  performanceMetrics[metric] = duration;
  
  if (duration > 5000) { // Alert if > 5 seconds
    console.warn(`Slow performance: ${metric} took ${duration}ms`);
  }
};
```

### Backup Strategy

1. **Database Backups**: Daily automated backups
2. **Configuration Backups**: Before any changes
3. **Webhook Data**: Archive completed sessions
4. **Media Assets**: Backup custom videos/audio

```typescript
const createBackup = async () => {
  const timestamp = new Date().toISOString();
  const backup = {
    timestamp,
    instances: await getAllInstances(),
    sessions: await getRecentSessions(),
    configurations: await getAllConfigurations()
  };
  
  await saveBackupFile(`backup-${timestamp}.json`, backup);
};
```

## Best Practices

### Instance Management
1. **Naming Convention**: Use clear, descriptive names
2. **Documentation**: Document custom configurations
3. **Testing**: Test instances before going live
4. **Monitoring**: Set up alerts for webhook failures

### Security
1. **Webhook Secrets**: Use strong, unique secrets
2. **Access Tokens**: Implement proper expiration
3. **Data Encryption**: Encrypt sensitive data
4. **Audit Logs**: Log all administrative actions

### Performance
1. **Caching**: Cache frequently accessed data
2. **CDN**: Use CDN for media assets
3. **Database Indexing**: Optimize database queries
4. **Monitoring**: Track performance metrics

### Maintenance
1. **Regular Updates**: Keep system updated
2. **Backup Strategy**: Implement comprehensive backups
3. **Monitoring**: Set up health checks
4. **Documentation**: Keep documentation current

---

## Support

For technical support or questions about the Multi-Institutional Simulation Management System:

1. **Documentation**: Check this guide first
2. **Logs**: Review application logs for errors
3. **Database**: Check Supabase logs for database issues
4. **Webhooks**: Test webhook endpoints manually
5. **Support Team**: Contact the development team for complex issues

Remember to always test changes in a development environment before applying to production instances.
