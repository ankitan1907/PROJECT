#!/usr/bin/env node

/**
 * Sakhi App Deployment Verification Script
 * Run this after deployment to verify all systems are working
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  timeout: 10000
};

console.log('🚀 Sakhi App Deployment Verification');
console.log('=====================================\n');

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: CONFIG.timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Test endpoint
 */
async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`Testing ${name}...`);
    const response = await makeRequest(url);
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: OK (${response.status})`);
      return true;
    } else {
      console.log(`⚠️  ${name}: Unexpected status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Failed - ${error.message}`);
    return false;
  }
}

/**
 * Test JSON API endpoint
 */
async function testApiEndpoint(name, url) {
  try {
    console.log(`Testing ${name}...`);
    const response = await makeRequest(url);
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (data.success !== undefined) {
          console.log(`✅ ${name}: OK - API responding`);
          return true;
        } else {
          console.log(`⚠️  ${name}: Unexpected response format`);
          return false;
        }
      } catch (parseError) {
        console.log(`⚠️  ${name}: Invalid JSON response`);
        return false;
      }
    } else {
      console.log(`❌ ${name}: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Failed - ${error.message}`);
    return false;
  }
}

/**
 * Main verification function
 */
async function verifyDeployment() {
  const tests = [];
  
  console.log('Frontend URL:', CONFIG.frontendUrl);
  console.log('Backend URL:', CONFIG.backendUrl);
  console.log('\n📋 Running Tests...\n');

  // Frontend tests
  tests.push(await testEndpoint('Frontend', CONFIG.frontendUrl));
  
  // Backend tests
  tests.push(await testApiEndpoint('Backend Health', `${CONFIG.backendUrl}/api/health`));
  tests.push(await testApiEndpoint('Database Stats', `${CONFIG.backendUrl}/api/dashboard/stats`));
  tests.push(await testApiEndpoint('Safe Zones API', `${CONFIG.backendUrl}/api/zones`));
  tests.push(await testApiEndpoint('Incidents API', `${CONFIG.backendUrl}/api/incidents`));
  
  // Summary
  const passed = tests.filter(Boolean).length;
  const total = tests.length;
  
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Deployment is ready.');
    console.log('\n✅ Your Sakhi app is fully operational and ready for users!');
    console.log('\n🌍 Key Features Available:');
    console.log('   • Real-time location tracking');
    console.log('   • Emergency SOS alerts');
    console.log('   • Incident reporting with database storage');
    console.log('   • SMS notifications (if Twilio configured)');
    console.log('   • Voice assistant (browser dependent)');
    console.log('   • Cross-platform compatibility');
    
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    console.log('\n🔧 Common Solutions:');
    console.log('   • Ensure backend is running and accessible');
    console.log('   • Check environment variables are set correctly');
    console.log('   • Verify MongoDB connection string');
    console.log('   • Ensure CORS is configured for your frontend domain');
    
    process.exit(1);
  }
}

// Run verification
verifyDeployment().catch(error => {
  console.error('\n💥 Verification failed:', error.message);
  process.exit(1);
});
