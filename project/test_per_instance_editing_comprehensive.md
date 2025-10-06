# Per-Instance Editing Test Plan

## Objective
Verify that editing changes in the admin dashboard are properly compartmentalized and only affect the selected instance, not other instances.

## Test Scenarios

### Scenario 1: Branding Configuration Isolation
1. **Setup**: Create two instances with different branding
   - Instance A: Red theme (#FF0000)
   - Instance B: Blue theme (#0000FF)

2. **Test Steps**:
   - Select Instance A
   - Edit branding to Green theme (#00FF00)
   - Save changes
   - Verify Instance A has green branding
   - Verify Instance B still has blue branding
   - Switch to Instance B
   - Edit branding to Purple theme (#800080)
   - Save changes
   - Verify Instance B has purple branding
   - Verify Instance A still has green branding

### Scenario 2: Webhook Configuration Isolation
1. **Setup**: Two instances with different webhook URLs
   - Instance A: webhook_url = "https://institution-a.com/webhook"
   - Instance B: webhook_url = "https://institution-b.com/webhook"

2. **Test Steps**:
   - Select Instance A
   - Change webhook URL to "https://institution-a-new.com/webhook"
   - Save changes
   - Verify Instance A has new webhook URL
   - Verify Instance B retains original webhook URL

### Scenario 3: Basic Settings Isolation
1. **Setup**: Two instances with different names and descriptions
   - Instance A: "University A Simulation" / "Description A"
   - Instance B: "University B Simulation" / "Description B"

2. **Test Steps**:
   - Select Instance A
   - Change name to "University A Updated Simulation"
   - Change description to "Updated Description A"
   - Save changes
   - Verify Instance A has updated name/description
   - Verify Instance B retains original name/description

### Scenario 4: Advanced Settings Isolation
1. **Setup**: Two instances with different advanced settings
   - Instance A: is_active = true, requires_approval = false
   - Instance B: is_active = true, requires_approval = true

2. **Test Steps**:
   - Select Instance A
   - Change requires_approval to true
   - Change max_sessions_per_day to 50
   - Save changes
   - Verify Instance A has new settings
   - Verify Instance B retains original settings

## Expected Results
- ✅ Changes to Instance A should only affect Instance A
- ✅ Changes to Instance B should only affect Instance B
- ✅ No cross-contamination between instances
- ✅ All changes persist after page refresh
- ✅ Instance-specific URLs show correct branding/settings

## Test Implementation
This test will be performed using the browser automation to:
1. Navigate to admin dashboard
2. Select different instances
3. Make specific changes
4. Verify changes are isolated
5. Test instance-specific URLs to confirm branding changes
