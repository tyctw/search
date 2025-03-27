export const config = {
  // API endpoint for querying reports
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw-UIFq9rqjW0v3dS9k1dTgx7Egh5xQnbqcamt5zyvkQLJqk7DLFMiWdvrwEmfd7kTVdA/exec',
  
  // hCaptcha settings
  HCAPTCHA_SITE_KEY: 'ceced506-fc3a-4214-976e-9514bf1eea48', // Replace with your actual site key
  
  // Security settings
  ENABLE_COPY_PROTECTION: false, // Changed to false to allow copy functionality
  ENABLE_RIGHT_CLICK_PROTECTION: true,
  ENABLE_TEXT_SELECTION_PROTECTION: false, // Changed to false to allow text selection for copy
  
  // Theme settings
  DARK_MODE_DEFAULT: false // Default theme mode (false = light, true = dark)
};
