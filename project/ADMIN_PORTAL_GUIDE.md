# Admin Portal Comprehensive Guide

## Overview

The enhanced admin portal provides comprehensive management capabilities for the Sickle Cell Disease simulation platform. Access the admin portal at `/admin/videos` to manage all aspects of your simulation content and monitor user performance.

## Features Overview

### 1. Video Management Tab
- **Upload Videos**: Upload video files for specific scenes with titles and descriptions
- **Edit Videos**: Modify video metadata, replace video files, and add poster images
- **Delete Videos**: Remove videos from specific scenes
- **Scene Mapping**: Videos are automatically mapped to scenes 1-10
- **File Storage**: All videos are stored in Supabase storage with automatic URL generation

### 2. Character Management Tab
- **Create Characters**: Add new characters with names, roles, and avatar images
- **Global Character Pool**: Characters can be reused across multiple scenes
- **Edit Characters**: Modify character information and avatars
- **Delete Characters**: Remove characters and all associated audio files
- **Character Preview**: View character details with avatar and role information

### 3. Audio Management Tab
- **Scene-Based Organization**: Manage audio files by scene
- **Character Association**: Link audio files to specific characters
- **Playback Order**: Set display order for audio file sequence
- **Auto-play Configuration**: Enable/disable automatic playback
- **Transcript Support**: Add subtitles and transcripts for accessibility
- **Audio File Management**: Upload, edit, and delete audio files

### 4. Scene Management Tab (NEW)
- **Scene Configuration Editor**: Edit quiz questions, action prompts, and discussion prompts
- **Content Overview**: View summary of all interactive content per scene
- **Bulk Operations**: Export and import scene configurations
- **Real-time Editing**: Modify scene content with immediate preview
- **Content Statistics**: Track the number of questions and prompts per scene

### 5. Analytics Dashboard Tab (NEW)
- **User Performance Metrics**: Monitor overall user performance and completion rates
- **Category-Based Scoring**: Track performance across the 5 key competency areas:
  - Timely Pain Management
  - Clinical Judgment
  - Communication
  - Cultural Safety
  - Bias Mitigation
- **Completion Analytics**: View average completion times and scene progression
- **Demographic Insights**: Analyze performance by age group and education level
- **Real-time Data**: Live dashboard with automatic data refresh

### 6. Settings Tab (NEW)
- **Webhook Configuration**: Manage data collection endpoints
- **System Status Monitoring**: View database, storage, and webhook status
- **Configuration Management**: Update system-wide settings
- **Integration Settings**: Configure external service connections

## Key Features in Detail

### Scene Configuration Management

The scene management system allows you to:

1. **Edit Quiz Questions**:
   - Modify question text and explanations
   - Update answer options and correct answers
   - Adjust scoring categories

2. **Manage Action Prompts**:
   - Edit prompt titles and content
   - Update response options
   - Modify explanations and feedback

3. **Update Discussion Prompts**:
   - Edit reflection questions
   - Add or remove discussion points
   - Update prompt text for better engagement

4. **Export/Import Configurations**:
   - Export scene configurations as JSON files
   - Import configurations from backup files
   - Version control for scene content

### Analytics and Performance Tracking

The analytics dashboard provides comprehensive insights:

1. **Performance Metrics**:
   - Total users and completion rates
   - Average scores across all categories
   - Time-to-completion statistics
   - Scene progression analytics

2. **Category Performance**:
   - Visual breakdown of competency areas
   - Comparative performance analysis
   - Identification of knowledge gaps

3. **User Demographics**:
   - Performance by education level
   - Age group analysis
   - Completion patterns

### Content Preview and Testing

- **Scene Preview**: View scenes as users would experience them
- **Content Validation**: Ensure all multimedia content loads correctly
- **Interactive Testing**: Test quiz questions and action prompts
- **Mobile Responsiveness**: Preview on different screen sizes

## Technical Implementation

### Database Schema

The admin portal integrates with the following database tables:

- `simulation_videos`: Video content and metadata
- `scene_characters`: Character definitions and avatars
- `scene_audio_files`: Audio content with character associations
- User response data (via webhook integration)

### File Storage

All media files are stored in Supabase Storage:

- **Videos**: `/simulation-videos/` bucket
- **Audio**: `/audio-files/` bucket
- **Images**: `/avatars/` bucket
- **Automatic URL generation** for public access

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Authenticated access** required for admin operations
- **Public read access** for simulation content
- **Secure file upload** with validation

## Usage Guidelines

### Getting Started

1. **Access the Admin Portal**: Navigate to `/admin/videos`
2. **Select a Tab**: Choose the management area you want to work with
3. **Create Content**: Use the "Add" buttons to create new content
4. **Edit Existing Content**: Click edit icons to modify existing items
5. **Monitor Performance**: Use the Analytics tab to track user engagement

### Best Practices

1. **Content Organization**:
   - Create characters before adding audio files
   - Use descriptive titles and descriptions
   - Maintain consistent naming conventions

2. **Performance Monitoring**:
   - Regularly check analytics for user feedback
   - Monitor completion rates by scene
   - Identify and address content gaps

3. **Data Management**:
   - Export configurations regularly for backup
   - Test imports in a development environment
   - Validate webhook configurations

### Troubleshooting

Common issues and solutions:

1. **File Upload Issues**:
   - Check file size limits (videos: 100MB, audio: 50MB, images: 10MB)
   - Ensure supported file formats (MP4, MP3, JPG, PNG)
   - Verify internet connection stability

2. **Analytics Not Loading**:
   - Check webhook configuration
   - Verify database connectivity
   - Ensure proper authentication

3. **Content Not Displaying**:
   - Verify file URLs are accessible
   - Check browser console for errors
   - Validate scene configuration

## Future Enhancements

Planned improvements include:

1. **Advanced Analytics**:
   - Heat maps for user interaction
   - Detailed time-on-task metrics
   - Comparative cohort analysis

2. **Content Authoring**:
   - Visual scene editor
   - Drag-and-drop interface
   - Template-based content creation

3. **Integration Features**:
   - LMS integration capabilities
   - SCORM package export
   - Multi-language support

4. **Performance Optimization**:
   - Content delivery network (CDN) integration
   - Progressive loading for large files
   - Offline content caching

## Support and Maintenance

For technical support or feature requests:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify all dependencies are up to date
4. Contact the development team with specific error details

## API Integration

The admin portal integrates with external services:

- **Webhook Endpoint**: Configurable URL for user data collection
- **Supabase API**: Database and storage operations
- **File Upload API**: Secure media file handling

All API interactions are authenticated and follow RESTful conventions.



