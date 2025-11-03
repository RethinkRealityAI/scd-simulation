# Multi-Institutional Simulation Management System - PRD

## Executive Summary

This PRD outlines the development of a comprehensive simulation management system that allows administrators to create, manage, and deploy multiple institutional instances of the SCD simulation. Each instance will have its own configuration, data isolation, and webhook endpoints for data collection.

## Problem Statement

Currently, the system supports only a single simulation instance. Educational institutions need:
- **Data Isolation**: Each institution's data should be separate and secure
- **Customization**: Ability to customize content, branding, and configuration per institution
- **Easy Deployment**: Simple link/QR code generation for teachers to access their institution's simulation
- **Data Collection**: Institution-specific webhook endpoints for completion data
- **Management**: Centralized admin panel to manage multiple simulation instances

## Goals & Objectives

### Primary Goals
1. **Multi-Tenancy**: Support unlimited simulation instances per institution
2. **Data Isolation**: Complete separation of data between institutions
3. **Easy Access**: Generate shareable links and QR codes for each instance
4. **Customization**: Per-instance configuration of content, branding, and settings
5. **Analytics**: Institution-specific analytics and reporting
6. **Webhook Integration**: Configurable webhook endpoints per instance

### Secondary Goals
1. **Scalability**: System should handle hundreds of institutions
2. **Security**: HIPAA-compliant data handling per institution
3. **User Experience**: Intuitive admin interface for managing instances
4. **Performance**: Fast loading and responsive interface
5. **Monitoring**: Health checks and usage analytics per instance

## User Stories

### Admin User Stories
- **As an admin**, I want to create new simulation instances for different institutions
- **As an admin**, I want to configure each instance with custom settings, branding, and content
- **As an admin**, I want to generate shareable links and QR codes for each instance
- **As an admin**, I want to view analytics and completion data per institution
- **As an admin**, I want to set custom webhook endpoints for each institution
- **As an admin**, I want to manage user access and permissions per instance

### Teacher/Institution User Stories
- **As a teacher**, I want to receive a simple link to access my institution's simulation
- **As a teacher**, I want to see my institution's branding and custom content
- **As a teacher**, I want my students' data to be sent to my institution's specified endpoint
- **As a teacher**, I want to track my students' progress and completion rates

### Student User Stories
- **As a student**, I want to access the simulation through a simple link
- **As a student**, I want to see my institution's branding and feel familiar with the interface
- **As a student**, I want my completion data to be securely transmitted to my institution

## Technical Architecture

### Database Schema Extensions

#### 1. Simulation Instances Table
```sql
CREATE TABLE simulation_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  institution_id VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  webhook_url TEXT,
  webhook_secret VARCHAR(255),
  branding_config JSONB DEFAULT '{}',
  content_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Instance-Specific Content Tables
```sql
-- Instance-specific videos
CREATE TABLE instance_simulation_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  scene_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  audio_narration_url TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instance_id, scene_id)
);

-- Instance-specific characters
CREATE TABLE instance_scene_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  scene_id INTEGER NOT NULL,
  character_name TEXT NOT NULL,
  character_role TEXT,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instance-specific audio files
CREATE TABLE instance_scene_audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  scene_id INTEGER NOT NULL,
  character_id UUID REFERENCES instance_scene_characters(id) ON DELETE CASCADE,
  audio_title TEXT NOT NULL,
  audio_description TEXT,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  display_order INTEGER DEFAULT 0,
  auto_play BOOLEAN DEFAULT FALSE,
  hide_player BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Instance-Specific Session Data
```sql
CREATE TABLE instance_session_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  user_demographics JSONB,
  responses JSONB,
  category_scores JSONB,
  final_score INTEGER,
  completion_time INTEGER,
  completed_scenes INTEGER[],
  submission_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. Instance Access Management
```sql
CREATE TABLE instance_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
  access_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

#### Instance Management
- `GET /api/instances` - List all simulation instances
- `POST /api/instances` - Create new simulation instance
- `GET /api/instances/:id` - Get specific instance details
- `PUT /api/instances/:id` - Update instance configuration
- `DELETE /api/instances/:id` - Delete instance (soft delete)

#### Instance Access
- `GET /api/instances/:token/access` - Validate access token
- `POST /api/instances/:token/generate-link` - Generate shareable link
- `POST /api/instances/:token/generate-qr` - Generate QR code

#### Content Management
- `GET /api/instances/:id/content` - Get instance-specific content
- `POST /api/instances/:id/content` - Update instance content
- `GET /api/instances/:id/analytics` - Get instance analytics

#### Webhook Management
- `POST /api/instances/:id/webhook` - Configure webhook endpoint
- `GET /api/instances/:id/webhook/status` - Check webhook status
- `POST /api/instances/:id/webhook/test` - Test webhook endpoint

## User Interface Design

### 1. Simulation Management Dashboard

#### Main Dashboard
- **Instance Overview**: Cards showing all simulation instances
- **Quick Actions**: Create new instance, view analytics, manage access
- **Recent Activity**: Latest completions, errors, and updates
- **System Health**: Instance status, webhook health, usage metrics

#### Instance Management
- **Instance List**: Table with search, filter, and sort capabilities
- **Instance Cards**: Visual representation with key metrics
- **Bulk Actions**: Select multiple instances for batch operations
- **Export/Import**: Configuration backup and restore

#### Instance Configuration
- **Basic Settings**: Name, description, institution details
- **Content Management**: Scene configuration, video management, character setup
- **Branding**: Logo, colors, custom CSS, welcome screen customization
- **Webhook Configuration**: Endpoint URL, authentication, retry settings
- **Access Management**: Token generation, expiration, usage limits

### 2. Instance-Specific Admin Panel

#### Content Management
- **Scene Editor**: Per-instance scene configuration
- **Video Management**: Upload and manage instance-specific videos
- **Character Management**: Customize characters and avatars
- **Audio Management**: Upload and configure audio files

#### Analytics Dashboard
- **Completion Metrics**: Success rates, average scores, completion times
- **User Demographics**: Education levels, institutions, programs
- **Performance Analytics**: Category scores, improvement trends
- **Export Options**: CSV, Excel, PDF reports

#### Access & Sharing
- **Link Generation**: Create shareable links with custom parameters
- **QR Code Generation**: Download QR codes for easy access
- **Access Tokens**: Manage temporary and permanent access tokens
- **Usage Tracking**: Monitor link usage and access patterns

### 3. Public Simulation Interface

#### Instance-Specific Landing
- **Custom Branding**: Institution logo, colors, and styling
- **Welcome Screen**: Customized welcome message and forms
- **Content**: Instance-specific videos, characters, and audio
- **Navigation**: Seamless experience with institution branding

#### Data Collection
- **Demographics**: Institution-specific form fields
- **Progress Tracking**: Real-time progress with custom metrics
- **Completion**: Custom results screen with institution branding
- **Webhook Integration**: Automatic data transmission to institution endpoint

## ✅ IMPLEMENTATION STATUS - COMPLETED

### Core System Architecture ✅ COMPLETED
- **Multi-Instance Support**: Full support for unlimited simulation instances
- **Data Isolation**: Complete separation of data between institutions
- **Instance Routing**: `/sim/{institutionId}/*` routing system implemented
- **Unified Admin Interface**: Single dashboard for all instance management
- **Reusable Simulation Components**: Instance simulation uses exact same layout as main simulation

### Key Features Implemented ✅ COMPLETED
1. **Instance Management Dashboard**: Create, edit, delete simulation instances
2. **Unified Admin Interface**: Single admin dashboard with tabs for:
   - Simulation Instances management
   - Video management (upload, organize, assign to scenes)
   - Scene management (create, edit, order, completion scene selection)
   - Analytics dashboard with instance-specific metrics
   - Settings and webhook configuration
3. **Instance-Specific Customization**:
   - Background images per instance
   - Scene content customization via database
   - Branding (colors, fonts, logos) per instance
   - Video and audio content per instance
4. **Scene Management System**:
   - Dynamic scene ordering and arrangement
   - Completion scene selection
   - Scene creation with comprehensive form builder
   - Video selection from database or URL input
   - Scene type templates (Clinical Assessment, Quiz, etc.)
5. **Analytics & Reporting**:
   - Instance-specific analytics dashboard
   - Completion tracking and metrics
   - Performance analytics per institution
   - Real-time monitoring and health checks

### Technical Implementation ✅ COMPLETED
- **Database Schema**: All required tables created and migrated
- **React Context**: InstanceSimulationContext for state management
- **Component Reuse**: InstanceSimulationScene uses exact same layout as main simulation
- **Admin Dashboard**: Unified interface consolidating all management functions
- **Webhook Integration**: Instance-specific webhook endpoints with authentication
- **Video Management**: Upload, organize, and assign videos to scenes
- **Scene Configuration**: Database-driven scene content with static fallback

## Implementation Plan

### Phase 1: Database & Backend (Weeks 1-2) ✅ COMPLETED
1. **Database Schema**: Create all required tables and relationships
2. **API Development**: Build core instance management endpoints
3. **Authentication**: Implement instance-based access control
4. **Webhook System**: Enhanced webhook functionality with instance-specific endpoints

### Phase 2: Admin Interface (Weeks 3-4)
1. **Simulation Management Dashboard**: Main admin interface
2. **Instance Creation**: Form-based instance creation workflow
3. **Content Management**: Instance-specific content editing
4. **Access Management**: Token generation and link management

### Phase 3: Public Interface (Weeks 5-6)
1. **Instance Routing**: URL-based instance access
2. **Custom Branding**: Dynamic styling and content loading
3. **Data Collection**: Instance-specific data handling
4. **Webhook Integration**: Automatic data transmission

### Phase 4: Analytics & Monitoring (Weeks 7-8)
1. **Analytics Dashboard**: Per-instance analytics and reporting
2. **Health Monitoring**: System health and performance tracking
3. **Export Features**: Data export and reporting capabilities
4. **Testing & Optimization**: Performance testing and optimization

## Security Considerations

### Data Isolation
- **Row-Level Security**: Database-level isolation between instances
- **Access Tokens**: Secure token-based access to instances
- **API Authentication**: Instance-specific API keys and authentication

### HIPAA Compliance
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Access Logging**: Comprehensive audit trails for all data access
- **Data Retention**: Configurable data retention policies per instance
- **Secure Transmission**: HTTPS-only communication with webhooks

### Privacy Protection
- **Data Minimization**: Only collect necessary data per instance
- **Consent Management**: Clear consent mechanisms for data collection
- **Right to Deletion**: Ability to delete user data upon request
- **Data Portability**: Export user data in standard formats

## Success Metrics

### Technical Metrics
- **Instance Creation Time**: < 5 minutes to create new instance
- **Page Load Time**: < 3 seconds for instance access
- **Webhook Success Rate**: > 99% successful data transmission
- **System Uptime**: > 99.9% availability

### User Experience Metrics
- **Admin Task Completion**: < 2 minutes for common admin tasks
- **Teacher Onboarding**: < 1 minute to access simulation via link
- **Student Completion Rate**: > 85% completion rate per instance
- **User Satisfaction**: > 4.5/5 rating for ease of use

### Business Metrics
- **Instance Adoption**: Number of active instances per month
- **Data Collection**: Volume of completion data per instance
- **User Engagement**: Average session duration and completion rates
- **System Scalability**: Ability to handle 100+ concurrent instances

## Risk Assessment

### Technical Risks
- **Database Performance**: Large number of instances may impact performance
- **Webhook Reliability**: External webhook failures could cause data loss
- **Scalability**: System may not scale to handle large number of institutions
- **Data Migration**: Existing data migration to new schema

### Mitigation Strategies
- **Database Optimization**: Proper indexing and query optimization
- **Webhook Retry Logic**: Automatic retry with exponential backoff
- **Load Testing**: Comprehensive load testing before deployment
- **Gradual Migration**: Phased rollout with data validation

### Business Risks
- **User Adoption**: Institutions may not adopt new system
- **Data Loss**: Risk of data loss during migration
- **Compliance**: HIPAA compliance requirements
- **Support**: Increased support burden for multiple instances

### Mitigation Strategies
- **User Training**: Comprehensive training materials and documentation
- **Data Backup**: Regular backups and disaster recovery procedures
- **Compliance Review**: Legal review of HIPAA compliance
- **Support Documentation**: Detailed support documentation and training

## Future Enhancements

### Advanced Features
- **Multi-Language Support**: Internationalization for global institutions
- **Advanced Analytics**: Machine learning-based insights and recommendations
- **Integration APIs**: Third-party system integration capabilities
- **Mobile App**: Native mobile applications for better accessibility

### Scalability Improvements
- **Microservices Architecture**: Break down into smaller, scalable services
- **CDN Integration**: Global content delivery for better performance
- **Auto-Scaling**: Automatic scaling based on usage patterns
- **Multi-Region Deployment**: Global deployment for better performance

## Conclusion

This multi-institutional simulation management system will provide a comprehensive solution for managing multiple simulation instances while maintaining data isolation, security, and ease of use. The phased implementation approach ensures a smooth transition while minimizing risks and maximizing user adoption.

The system will enable educational institutions to easily deploy and manage their own simulation instances while providing administrators with powerful tools for content management, analytics, and user access control.
