# Video Management - Quick Start Guide

## 🎥 Accessing the Video Manager

1. Navigate to `/admin/videos` in your browser
2. Click on the "Videos" tab in the admin portal

## 🎯 Quick Scene Overview

At the top of the page, you'll see a visual grid showing all 10 scenes:

- **Blue Button**: Currently selected scene
- **Green Button**: Scene has a video ✓
- **White Button**: Scene needs a video ○
- **Counter**: Shows "X/10 scenes have videos"

Click any scene number to instantly jump to it!

## 📹 Viewing Existing Videos

### Method 1: Scene Grid
Click on any green scene button to view its current video

### Method 2: Dropdown Menu
Use the scene dropdown (shows ✓ for scenes with videos)

### Method 3: Video List
Click on any video card in the left panel to preview it

### What You'll See:
- 🟢 **Green Banner**: "Current Video for Scene X"
- Video player with full controls
- Video title, description, and metadata
- Upload date and video ID

## ⬆️ Uploading a New Video

### Step 1: Select Scene
Choose which scene to upload to (use grid or dropdown)

### Step 2: Choose File
Click "Video File" and select your video (max 50MB)
- Supported formats: MP4, WebM, OGG
- You'll see an instant preview!

### Step 3: Add Details
- **Title**: Give your video a descriptive name
- **Description**: Add context about the video content

### Step 4: Preview
- 🟠 **Orange Banner**: "New Video Selected"
- Watch your video before uploading
- Review file size and name

### Step 5: Upload
Click the "Upload Video" button

✅ **Success!** The video is now live in the simulation

## 🎬 Video Preview Behavior

### Three States:

1. **New Upload Preview** (Orange Banner)
   - Shows when you select a new file
   - Displays before uploading
   - Clear call-to-action to upload

2. **Current Video** (Green Banner)
   - Shows existing video for selected scene
   - This is what students see in the simulation
   - Can be replaced by uploading a new video

3. **No Video** (Empty State)
   - Displayed when scene has no video
   - Prompts you to upload one

## 🔄 Replacing an Existing Video

1. Select the scene (with green indicator)
2. You'll see the current video with green banner
3. Choose a new video file
4. Preview changes to orange banner (new video)
5. Upload to replace

**Note**: Old video is automatically replaced - no manual deletion needed!

## ✏️ Editing Video Details

1. Find the video in the list
2. Click the blue **Edit** button (pencil icon)
3. Update title and/or description
4. Optionally replace the video file
5. Click "Update"

## 🗑️ Deleting a Video

1. Find the video in the list
2. Click the red **Delete** button (trash icon)
3. Confirm deletion
4. Video is removed from the scene

⚠️ **Warning**: Deleted videos cannot be recovered!

## 🔗 How It Connects to the Main App

### Automatic Integration:
- Videos are stored in Supabase database
- Main simulation app loads videos automatically
- Students see the latest videos immediately
- No cache clearing needed!

### Priority System:
1. Database video (if exists) ← **Your uploads!**
2. Fallback to scene default video (if configured)
3. Empty state (no video available)

## 💡 Pro Tips

### 🎯 Efficient Workflow
- Use the quick scene grid to navigate fast
- Green buttons show completed scenes at a glance
- The counter helps track overall progress

### 📊 Video List Features
- Videos are sorted by scene number
- Click any video card to preview it
- Scene badges show which scene each video belongs to
- Date stamps show when videos were uploaded

### 🎨 Visual Indicators
- **✓ Checkmark**: Scene has video
- **○ Circle**: Scene needs video  
- **Green backgrounds**: Active/completed
- **Blue highlights**: Currently selected
- **Orange badges**: Pending upload

### ⚡ Keyboard Shortcuts (Future)
- Arrow keys to navigate scenes
- Enter to select video file
- Spacebar to play/pause preview

## 🔧 Troubleshooting

### Video Won't Upload
- Check file size (must be < 50MB)
- Ensure it's a valid video format
- Check your internet connection
- Try refreshing the page

### Video Not Showing in Simulation
- The app automatically refetches on scene load
- Try navigating to a different scene and back
- Check browser console for errors

### Preview Not Working
- Ensure browser supports HTML5 video
- Try a different video format
- Check if file is corrupted

### Can't See Uploaded Video
- Wait a moment for database sync
- Refresh the admin page
- Check if upload was successful (green message)

## 📋 Checklist for Complete Setup

- [ ] Upload videos for all 10 scenes
- [ ] Add descriptive titles for each video
- [ ] Write helpful descriptions
- [ ] Preview each video to ensure quality
- [ ] Test in the main simulation app
- [ ] Verify all scenes load correctly

## 🎓 Best Practices

### Video Content
- Keep videos concise and focused
- Ensure good audio quality
- Use appropriate medical scenarios
- Test on different devices

### Naming Convention
- Use clear, descriptive titles
- Include scene number for reference
- Example: "Scene 1: Initial Patient Assessment"

### File Management
- Compress large videos before uploading
- Use consistent video formats
- Keep original files as backups
- Document any special instructions

## 🆘 Need Help?

### Quick Reference
- Green = Good (video exists)
- Orange = Pending (new upload ready)
- White = Empty (needs video)

### Support Resources
- Check `VIDEO_MANAGEMENT_IMPROVEMENTS.md` for technical details
- Review `ADMIN_PORTAL_GUIDE.md` for general admin features
- Contact technical support for database issues

---

**Version**: 2.0  
**Last Updated**: October 1, 2025  
**Status**: Production Ready ✅

