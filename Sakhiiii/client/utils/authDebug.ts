// Google Auth Debugging Utility
export const debugGoogleAuth = () => {
  console.log('🔍 Google Auth Debug Information:');
  
  // Check environment variables
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log('📋 Client ID configured:', clientId ? '✅ Yes' : '❌ No');
  
  // Check Google APIs availability
  console.log('🌐 Google APIs loaded:', window.google ? '✅ Yes' : '❌ No');
  
  if (window.google?.accounts?.id) {
    console.log('🔐 Google Identity Services:', '✅ Available');
  } else {
    console.log('🔐 Google Identity Services:', '❌ Not available');
  }
  
  // Check browser compatibility
  const features = {
    'Fetch API': 'fetch' in window,
    'Promise': 'Promise' in window,
    'Local Storage': 'localStorage' in window,
    'Geolocation': 'geolocation' in navigator,
    'Notifications': 'Notification' in window
  };
  
  console.log('🔧 Browser Features:');
  Object.entries(features).forEach(([feature, supported]) => {
    console.log(`   ${feature}: ${supported ? '✅' : '❌'}`);
  });
  
  // Check permissions policy
  const permissionsPolicy = document.querySelector('meta[http-equiv="Permissions-Policy"]');
  console.log('📜 Permissions Policy set:', permissionsPolicy ? '✅ Yes' : '❌ No');
  
  // Check for FedCM errors
  const userAgent = navigator.userAgent;
  const isChrome = userAgent.includes('Chrome');
  const chromeVersion = isChrome ? parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || '0') : 0;
  
  console.log('🌐 Browser:', isChrome ? `Chrome ${chromeVersion}` : 'Other');
  
  if (isChrome && chromeVersion >= 108) {
    console.log('🔒 FedCM Support: ✅ Available (Chrome 108+)');
  } else {
    console.log('🔒 FedCM Support: ⚠️ Limited or not available');
  }
  
  console.log('\n📝 Setup Instructions:');
  console.log('1. Add VITE_GOOGLE_CLIENT_ID to .env file');
  console.log('2. Get Client ID from Google Cloud Console');
  console.log('3. Enable Google Identity Services API');
  console.log('4. Add your domain to authorized origins');
  
  return {
    clientIdConfigured: !!clientId,
    googleAPIsLoaded: !!window.google,
    identityServicesAvailable: !!window.google?.accounts?.id,
    permissionsPolicySet: !!permissionsPolicy,
    browserSupported: isChrome && chromeVersion >= 80
  };
};

// Auto-run debug in development
if (import.meta.env.DEV) {
  // Run debug after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(debugGoogleAuth, 1000);
    });
  } else {
    setTimeout(debugGoogleAuth, 1000);
  }
}

export default debugGoogleAuth;
