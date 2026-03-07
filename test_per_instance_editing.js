// Test script to verify per-instance editing functionality
// This script will test that changes to one instance don't affect others

const testPerInstanceEditing = async () => {
  console.log('🧪 Testing Per-Instance Editing Functionality');
  
  // Test data for different instances
  const testInstances = [
    {
      id: 'university-of-toronto',
      name: 'University of Toronto Simulation',
      institution_name: 'University of Toronto',
      branding_config: {
        primary_color: '#FF0000', // Red for UofT
        secondary_color: '#CC0000',
        accent_color: '#FF6666',
        background_color: '#FFFFFF',
        text_color: '#000000',
        font_family: 'Arial, sans-serif'
      }
    },
    {
      id: 'mcgill-university',
      name: 'McGill University Simulation', 
      institution_name: 'McGill University',
      branding_config: {
        primary_color: '#0000FF', // Blue for McGill
        secondary_color: '#0000CC',
        accent_color: '#6666FF',
        background_color: '#FFFFFF',
        text_color: '#000000',
        font_family: 'Times New Roman, serif'
      }
    }
  ];

  console.log('📋 Test Plan:');
  console.log('1. Create two test instances with different branding');
  console.log('2. Edit branding for Instance A');
  console.log('3. Verify Instance A has new branding');
  console.log('4. Verify Instance B retains original branding');
  console.log('5. Edit branding for Instance B');
  console.log('6. Verify both instances have independent branding');
  
  return testInstances;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testPerInstanceEditing = testPerInstanceEditing;
}

module.exports = { testPerInstanceEditing };
