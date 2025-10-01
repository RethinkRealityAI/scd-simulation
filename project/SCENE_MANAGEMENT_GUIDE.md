# Scene Management Guide - Admin Portal

## Overview
The Scene Management system in the Admin Portal provides comprehensive control over every aspect of your simulation scenes, including questions, action prompts, clinical findings, discussion prompts, and scoring categories.

## Accessing Scene Management
1. Navigate to the Admin Portal
2. Click on the **"Scene Management"** tab in the navigation bar
3. Select a scene card to edit

## Scene Components

### 1. **Patient Vitals & Biometrics** 🩺
Complete control over patient vital signs and demographic information.

#### Features:
- **Patient Information**: Name, age, bed number, MRN
- **Vital Signs**:
  - Heart Rate (bpm)
  - Blood Pressure (systolic/diastolic mmHg)
  - Respiratory Rate (breaths/min)
  - O₂ Saturation (%)
  - Temperature (°C)
  - Pain Level (0-10, optional)
  - Procedure Time (optional)
- **Alarm Status**: Toggle alarm on/off
- **Real-time Preview**: See how vitals will display

#### Editing Vitals:
1. Navigate to the "Patient Vitals & Biometrics" section (red theme)
2. Update patient demographics
3. Enter vital sign values
4. Set alarm status if needed
5. Add optional fields (pain level, procedure time)
6. Values appear in VitalsMonitor during simulation

#### Best Practices:
- Use realistic vital signs for clinical accuracy
- Adjust vitals to reflect scene progression
- Enable alarms for critical situations
- Update patient name format consistently: "Last, First 'Nickname'"
- Consider age-appropriate normal ranges

---

### 2. **Quiz Questions**
Complete control over assessment questions with multiple question types.

#### Features:
- **Add/Remove Questions**: Dynamically add or remove quiz questions
- **Question Types**:
  - **Multiple Choice (Single Answer)**: Traditional single-selection questions
  - **Multi-Select (Multiple Answers)**: Allow learners to select multiple correct answers
  - **Text Input**: Free-form text responses

#### Creating a Question:
1. Click **"Add Question"** button
2. Select the question type from the dropdown
3. Enter the question text
4. Add answer options (for multiple-choice and multi-select)
   - Click "Add Option" to add more choices
   - Use the delete icon to remove options
5. **Set Correct Answer(s)**:
   - **Multiple Choice**: Select from dropdown
   - **Multi-Select**: Check all correct answers
   - **Text Input**: Enter expected answer text
6. Write explanation/feedback (shown after answer submission)

#### Question Management:
- **Edit**: Modify any field directly in the form
- **Delete**: Click the trash icon in the question header
- **Reorder**: Questions appear in the order shown (no drag-drop yet)

---

### 2. **Action Prompts**
Interactive decision-making scenarios that simulate clinical judgment.

#### Features:
- **Add/Remove Action Prompts**: Enable or disable for each scene
- **Prompt Types**:
  - **Action Selection**: Single-choice clinical decisions
  - **Multi-Select**: Multiple interventions/actions
  - **SBAR Communication**: Structured communication exercise
  - **Reflection**: Open-ended reflection prompts

#### Creating an Action Prompt:
1. Click **"Add Action Prompt"** if none exists
2. Select the prompt type
3. Enter prompt title and description
4. For Action Selection and Multi-Select:
   - Add action options
   - Mark correct answers (green highlight section)
   - Single-select: Choose one correct answer
   - Multi-select: Check all correct interventions
5. Write feedback/explanation

#### Action Prompt Types Explained:

**Action Selection**
- Best for: Single critical decisions
- Example: "What is your immediate priority?"
- Validates: One correct answer

**Multi-Select**
- Best for: Multiple interventions needed
- Example: "Select all appropriate initial interventions"
- Validates: All correct answers must be selected

**SBAR**
- Best for: Communication exercises
- Uses word bank interface (Scene 4)
- No options needed - uses built-in SBAR structure

**Reflection**
- Best for: Critical thinking exercises
- Free-text input
- Always marked as correct when completed

---

### 3. **Discussion Prompts**
Facilitate debriefing and reflective learning after scene completion.

#### Features:
- Add multiple discussion prompts per scene
- Prompts appear after learners complete the scene
- Encourage critical reflection and peer discussion

#### Creating Discussion Prompts:
1. Click **"Add Prompt"**
2. Enter the discussion question or reflection prompt
3. Add multiple prompts for multi-faceted discussions
4. Delete unwanted prompts with the trash icon

#### Best Practices:
- Ask open-ended questions
- Encourage learners to connect to real-world practice
- Address cultural safety and bias considerations
- Promote analysis of clinical decisions made

---

### 4. **Clinical Findings**
Display objective clinical observations for the scene.

#### Features:
- Add/remove findings dynamically
- Appears in the scene interface for reference
- Helps learners gather relevant data

#### Adding Clinical Findings:
1. Click **"Add Finding"**
2. Enter specific clinical observation
   - Examples: "Dry mucous membranes", "Guarding limbs, warm to touch"
3. Keep findings concise and clinically relevant
4. Delete with trash icon as needed

#### Tips:
- Focus on objective, observable data
- Use professional medical terminology
- Include positive and relevant negative findings
- Order findings by body system or importance

---

### 5. **Scoring Categories**
Link scenes to specific competency domains for comprehensive assessment.

#### Available Categories:
1. **Timely Pain Management** ⏰
   - Assesses prompt recognition and treatment of pain
   
2. **Clinical Judgment** 🧠
   - Evaluates decision-making and clinical reasoning
   
3. **Communication** 💬
   - Measures interprofessional and patient communication
   
4. **Cultural Safety** 🛡️
   - Assesses cultural humility and safety practices
   
5. **Bias Mitigation** ⚖️
   - Evaluates recognition and mitigation of bias

#### Setting Scoring Categories:
1. Check the boxes for relevant competency domains
2. Multiple categories can be selected per scene
3. Scores aggregate across all scenes for final results
4. Used in analytics and completion reports

#### Strategic Use:
- Ensure each category is assessed multiple times
- Balance across scenes for comprehensive evaluation
- Link to learning objectives
- Consider scene content when selecting

---

## Scene Structure & Flow

### Typical Scene Flow:
1. **Scene Introduction**: Title, description, vitals
2. **Content Presentation**: Video, audio, interactive content
3. **Clinical Findings**: Display relevant observations
4. **Quiz Questions** (if present): Sequential assessment
5. **Action Prompts** (if present): Decision-making exercise
6. **Discussion Prompts** (if present): Reflection and debriefing
7. **Scene Completion**: Progress to next scene

### Scene Types:

**Informational Scenes**
- No quiz or action prompts
- Focus on content delivery
- Learners click "Complete Scene" when ready

**Assessment Scenes**
- Include quiz questions or action prompts
- Require learner interaction
- Validate responses before completion

**Discussion Scenes**
- Emphasize reflection
- Multiple discussion prompts
- Often used for debriefing (e.g., Scene 9)

**Combined Scenes**
- Mix of assessment and discussion
- Most comprehensive learning experience

---

## Preview Feature 👁️

### Live Scene Preview
Preview how your scene will look before saving changes.

#### Using Preview:
1. Make changes to any scene component
2. Click **"Preview Scene"** button (bottom of editor)
3. A new window opens showing:
   - Scene title and description
   - Scoring category badges
   - Patient vitals display (realistic VitalsMonitor)
   - Clinical findings
   - Quiz questions with correct answers marked
   - Action prompts with feedback
   - Discussion prompts
4. Review the layout and content
5. Close preview window
6. Make adjustments if needed
7. Click "Save Changes" when satisfied

#### Preview Features:
- **Styled Interface**: Matches simulation appearance
- **Complete Data**: Shows all configured components
- **Correct Answer Indicators**: Green highlights on correct options
- **Alarm Animation**: Pulsing effect when alarm is active
- **Vital Signs Grid**: Professional medical display
- **Color-Coded Sections**: Easy navigation
- **Responsive Layout**: Works on all screen sizes

#### Benefits:
- ✅ Catch errors before saving
- ✅ Verify formatting and layout
- ✅ Review question flow
- ✅ Check correct answers
- ✅ Ensure completeness
- ✅ Professional quality assurance

---

## Advanced Configuration

### Scene Editor Workflow:

1. **Select Scene**: Click scene card in overview
2. **Edit Basic Info**: Title and description
3. **Configure Components**:
   - Add/edit quiz questions
   - Configure action prompts
   - Set discussion prompts
   - Add clinical findings
   - Select scoring categories
4. **Save Changes**: Click "Save Changes" button
5. **Test**: Review in simulation to verify

### Tips for Scene Design:

**Question Design:**
- Write clear, unambiguous questions
- Ensure options are mutually exclusive (for single-select)
- Provide meaningful feedback in explanations
- Reference evidence-based sources when possible

**Action Prompt Design:**
- Make scenarios realistic and clinically relevant
- Ensure correct answers align with best practices
- Provide detailed rationale in feedback
- Consider time-critical decisions

**Discussion Prompt Design:**
- Encourage self-reflection
- Connect to broader healthcare issues
- Address bias and cultural considerations
- Promote systems thinking

**Clinical Findings:**
- Include relevant objective data
- Mirror real-world assessment patterns
- Support decision-making process

**Scoring Strategy:**
- Map to learning objectives
- Ensure comprehensive coverage
- Balance across competency domains
- Use for formative and summative assessment

---

## Data Management

### Export Configuration
- Click **"Export Configuration"** to download scene JSON
- Includes all scenes, questions, prompts, and settings
- Use for backup or sharing

### Import Configuration
- Click **"Import Config"** to upload scene JSON
- Validates format before importing
- Overwrites current configuration (use with caution)

### Best Practices:
- Export regularly as backup
- Version control your configurations
- Test after importing
- Document significant changes

---

## Validation & Error Checking

### Question Validation:
- ✅ Question text is required
- ✅ At least 2 options for choice questions
- ✅ Correct answer must be selected
- ✅ Explanation is recommended but optional

### Action Prompt Validation:
- ✅ Title and content required
- ✅ Options required for selection types
- ✅ At least one correct answer for validation
- ✅ Feedback/explanation recommended

### Scene Validation:
- ✅ Title and description required
- ✅ At least one interactive component per scene
- ✅ Scoring categories aligned with content

---

## Troubleshooting

### Common Issues:

**Questions not appearing:**
- Verify question has required fields
- Check that quiz object exists in scene
- Ensure scene is saved after editing

**Correct answers not validating:**
- For multi-select: Ensure using array format
- Verify exact text match for options
- Check for extra spaces or characters

**Action prompts not showing:**
- Confirm action prompt is enabled
- Check prompt type is compatible with content
- Verify correct answers are set

**Discussion prompts missing:**
- Ensure prompts have text content
- Check that scene completion triggers discussion
- Verify flow logic in scene progression

---

## Integration with Simulation Flow

### Scene Completion Logic:
1. Learner completes all required interactions
2. System validates responses
3. Feedback is displayed
4. Discussion prompts appear (if configured)
5. "Complete Scene" button becomes available
6. Progress tracked in user session
7. Next scene unlocked

### Analytics Integration:
- All responses are tracked
- Scoring categories aggregate
- Time spent is recorded
- Correct/incorrect answers logged
- Used for completion reports

---

## Best Practices Summary

### Design Principles:
1. **Learner-Centered**: Focus on learning objectives
2. **Realistic**: Mirror real-world clinical scenarios
3. **Evidence-Based**: Ground in current best practices
4. **Progressive**: Build complexity across scenes
5. **Reflective**: Encourage critical thinking

### Quality Checklist:
- [ ] Clear learning objectives mapped to scene
- [ ] Questions aligned with objectives
- [ ] Correct answers validated and accurate
- [ ] Feedback is educational and specific
- [ ] Discussion prompts promote reflection
- [ ] Clinical findings support decision-making
- [ ] Scoring categories match content
- [ ] Scene tested end-to-end
- [ ] Configuration backed up

---

## Support & Resources

### Additional Documentation:
- **ADMIN_PORTAL_GUIDE.md**: General admin features
- **ADMIN_IMPROVEMENTS.md**: Recent enhancements
- **README.md**: Project overview and setup

### Need Help?
- Review scene templates in existing scenes
- Test changes in simulation before finalizing
- Export configuration for backup before major changes
- Document custom scenarios for reference

---

## Version History

**v2.0 - Enhanced Scene Management (Current)**
- Comprehensive quiz question controls
- Advanced action prompt configuration
- Dynamic add/remove for all components
- Multi-select and text-input question types
- Correct answer validation interface
- Clinical findings management
- Scoring categories integration
- Improved UI with color-coded sections

**v1.0 - Basic Scene Management**
- Simple text editing
- Limited question types
- Manual configuration files

---

Last Updated: January 2025

