// Deployment Readiness Checker
// Ensures all services work across different platforms and environments

interface DeploymentCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

interface DeploymentReport {
  isReady: boolean;
  checks: DeploymentCheck[];
  warnings: string[];
  errors: string[];
}

class DeploymentChecker {
  
  /**
   * Run comprehensive deployment readiness check
   */
  public async checkDeploymentReadiness(): Promise<DeploymentReport> {
    const checks: DeploymentCheck[] = [];
    
    // Environment checks
    checks.push(...await this.checkEnvironmentVariables());
    
    // Browser API checks
    checks.push(...await this.checkBrowserAPIs());
    
    // Backend connectivity checks
    checks.push(...await this.checkBackendConnectivity());
    
    // Location services checks
    checks.push(...await this.checkLocationServices());
    
    // SMS service checks
    checks.push(...await this.checkSMSServices());
    
    // Voice assistant checks
    checks.push(...await this.checkVoiceServices());
    
    // MongoDB checks
    checks.push(...await this.checkDatabaseConnectivity());

    const errors = checks.filter(c => c.status === 'fail' && c.critical).map(c => c.message);
    const warnings = checks.filter(c => c.status === 'warning' || (c.status === 'fail' && !c.critical)).map(c => c.message);
    const isReady = errors.length === 0;

    return {
      isReady,
      checks,
      warnings,
      errors
    };
  }

  /**
   * Check environment variables
   */
  private async checkEnvironmentVariables(): Promise<DeploymentCheck[]> {
    const checks: DeploymentCheck[] = [];
    
    // Backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    checks.push({
      name: 'Backend URL',
      status: backendUrl ? 'pass' : 'warning',
      message: backendUrl ? `Backend configured: ${backendUrl}` : 'Backend URL not set, using localhost',
      critical: false
    });

    // Google Maps API Key
    const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    checks.push({
      name: 'Google Maps API Key',
      status: mapsKey ? 'pass' : 'fail',
      message: mapsKey ? 'Google Maps API key configured' : 'Google Maps API key missing - maps will not work',
      critical: true
    });

    // Google OAuth Client ID
    const oauthKey = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    checks.push({
      name: 'Google OAuth Client ID',
      status: oauthKey ? 'pass' : 'warning',
      message: oauthKey ? 'Google OAuth configured' : 'Google OAuth not configured - only email signup available',
      critical: false
    });

    return checks;
  }

  /**
   * Check browser API availability
   */
  private async checkBrowserAPIs(): Promise<DeploymentCheck[]> {
    const checks: DeploymentCheck[] = [];

    // Geolocation API
    checks.push({
      name: 'Geolocation API',
      status: 'geolocation' in navigator ? 'pass' : 'fail',
      message: 'geolocation' in navigator ? 'Geolocation supported' : 'Geolocation not supported - location features will fail',
      critical: true
    });

    // Speech Synthesis API
    checks.push({
      name: 'Speech Synthesis API',
      status: 'speechSynthesis' in window ? 'pass' : 'warning',
      message: 'speechSynthesis' in window ? 'Voice assistant supported' : 'Voice assistant not supported',
      critical: false
    });

    // Notifications API
    checks.push({
      name: 'Notifications API',
      status: 'Notification' in window ? 'pass' : 'warning',
      message: 'Notification' in window ? 'Notifications supported' : 'Browser notifications not supported',
      critical: false
    });

    // Local Storage
    checks.push({
      name: 'Local Storage',
      status: this.checkLocalStorage() ? 'pass' : 'fail',
      message: this.checkLocalStorage() ? 'Local storage available' : 'Local storage not available - app will not persist data',
      critical: true
    });

    // Fetch API
    checks.push({
      name: 'Fetch API',
      status: 'fetch' in window ? 'pass' : 'fail',
      message: 'fetch' in window ? 'Fetch API available' : 'Fetch API not supported - backend communication will fail',
      critical: true
    });

    return checks;
  }

  /**
   * Check backend connectivity
   */
  private async checkBackendConnectivity(): Promise<DeploymentCheck[]> {
    const checks: DeploymentCheck[] = [];
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        checks.push({
          name: 'Backend Health',
          status: 'pass',
          message: 'Backend server is responding',
          critical: true
        });
      } else {
        checks.push({
          name: 'Backend Health',
          status: 'fail',
          message: `Backend server error: ${response.status}`,
          critical: true
        });
      }
    } catch (error) {
      checks.push({
        name: 'Backend Health',
        status: 'fail',
        message: `Cannot connect to backend: ${error.message}`,
        critical: true
      });
    }

    return checks;
  }

  /**
   * Check location services
   */
  private async checkLocationServices(): Promise<DeploymentCheck[]> {
    const checks: DeploymentCheck[] = [];

    if ('geolocation' in navigator) {
      try {
        const { locationService } = await import('./locationService');
        const permission = await this.checkGeolocationPermission();
        
        checks.push({
          name: 'Geolocation Permission',
          status: permission === 'granted' ? 'pass' : permission === 'prompt' ? 'warning' : 'fail',
          message: `Geolocation permission: ${permission}`,
          critical: permission === 'denied'
        });

        // Test location accuracy
        try {
          const location = await locationService.getCurrentLocation(false);
          checks.push({
            name: 'Location Accuracy',
            status: location.accuracy < 100 ? 'pass' : location.accuracy < 1000 ? 'warning' : 'fail',
            message: `Location accuracy: ${Math.round(location.accuracy)}m`,
            critical: false
          });
        } catch (error) {
          checks.push({
            name: 'Location Services',
            status: 'warning',
            message: `Location test failed: ${error.message}`,
            critical: false
          });
        }
      } catch (error) {
        checks.push({
          name: 'Location Services',
          status: 'fail',
          message: `Location service error: ${error.message}`,
          critical: true
        });
      }
    }

    return checks;
  }

  /**
   * Check SMS services
   */
  private async checkSMSServices(): Promise<DeploymentCheck[]> {
    const checks: DeploymentCheck[] = [];

    try {
      const { twilioSMSService } = await import('./twilioSMS');
      const contacts = twilioSMSService.getEmergencyContacts();
      
      checks.push({
        name: 'Emergency Contacts',
        status: contacts.length > 0 ? 'pass' : 'warning',
        message: `${contacts.length} emergency contacts configured`,
        critical: false
      });

      // Test SMS service availability
      const testResult = await twilioSMSService.testSMSService();
      checks.push({
        name: 'SMS Service',
        status: testResult ? 'pass' : 'warning',
        message: testResult ? 'SMS service operational' : 'SMS service in demo mode',
        critical: false
      });

    } catch (error) {
      checks.push({
        name: 'SMS Services',
        status: 'warning',
        message: `SMS service error: ${error.message}`,
        critical: false
      });
    }

    return checks;
  }

  /**
   * Check voice services
   */
  private async checkVoiceServices(): Promise<DeploymentCheck[]> {
    const checks: DeploymentCheck[] = [];

    if ('speechSynthesis' in window) {
      try {
        const { voiceAssistantService } = await import('./voiceAssistantService');
        
        checks.push({
          name: 'Voice Assistant',
          status: voiceAssistantService.isSupported() ? 'pass' : 'warning',
          message: voiceAssistantService.isSupported() ? 'Voice assistant available' : 'Voice assistant not supported',
          critical: false
        });

        const voices = voiceAssistantService.getVoices();
        checks.push({
          name: 'Voice Selection',
          status: voices.length > 0 ? 'pass' : 'warning',
          message: `${voices.length} voices available`,
          critical: false
        });

      } catch (error) {
        checks.push({
          name: 'Voice Services',
          status: 'warning',
          message: `Voice service error: ${error.message}`,
          critical: false
        });
      }
    }

    return checks;
  }

  /**
   * Check database connectivity
   */
  private async checkDatabaseConnectivity(): Promise<DeploymentCheck[]> {
    const checks: DeploymentCheck[] = [];
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    try {
      const response = await fetch(`${backendUrl}/api/dashboard/stats`);
      const data = await response.json();

      if (data.success) {
        checks.push({
          name: 'Database Connectivity',
          status: 'pass',
          message: 'Database connected and operational',
          critical: true
        });
      } else {
        checks.push({
          name: 'Database Connectivity',
          status: 'fail',
          message: 'Database connection failed',
          critical: true
        });
      }
    } catch (error) {
      checks.push({
        name: 'Database Connectivity',
        status: 'fail',
        message: `Database check failed: ${error.message}`,
        critical: true
      });
    }

    return checks;
  }

  /**
   * Check local storage availability
   */
  private checkLocalStorage(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check geolocation permission status
   */
  private async checkGeolocationPermission(): Promise<string> {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Generate deployment report
   */
  public async generateReport(): Promise<string> {
    const report = await this.checkDeploymentReadiness();
    
    let output = '🚀 SAKHI DEPLOYMENT READINESS REPORT\n';
    output += '==========================================\n\n';
    
    if (report.isReady) {
      output += '✅ READY FOR DEPLOYMENT\n\n';
    } else {
      output += '❌ NOT READY FOR DEPLOYMENT\n\n';
    }

    // Critical errors
    if (report.errors.length > 0) {
      output += '🔴 CRITICAL ERRORS (Must Fix):\n';
      report.errors.forEach(error => {
        output += `   - ${error}\n`;
      });
      output += '\n';
    }

    // Warnings
    if (report.warnings.length > 0) {
      output += '⚠️  WARNINGS (Recommended to Fix):\n';
      report.warnings.forEach(warning => {
        output += `   - ${warning}\n`;
      });
      output += '\n';
    }

    // Detailed checks
    output += 'DETAILED CHECK RESULTS:\n';
    output += '========================\n';
    
    report.checks.forEach(check => {
      const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      output += `${icon} ${check.name}: ${check.message}\n`;
    });

    output += '\n';
    output += 'DEPLOYMENT RECOMMENDATIONS:\n';
    output += '===========================\n';
    
    if (report.isReady) {
      output += '• All critical systems are operational\n';
      output += '• App is ready for production deployment\n';
      output += '• Consider addressing warnings for optimal experience\n';
    } else {
      output += '• Fix all critical errors before deployment\n';
      output += '• Ensure proper environment variable configuration\n';
      output += '• Test on target deployment platform\n';
    }

    return output;
  }

  /**
   * Quick mobile compatibility check
   */
  public checkMobileCompatibility(): boolean {
    const checks = [
      'geolocation' in navigator,
      'localStorage' in window,
      'fetch' in window,
      window.screen.width >= 320 // Minimum mobile width
    ];

    return checks.every(check => check);
  }

  /**
   * Quick desktop compatibility check
   */
  public checkDesktopCompatibility(): boolean {
    const checks = [
      'geolocation' in navigator,
      'localStorage' in window,
      'fetch' in window,
      'speechSynthesis' in window
    ];

    return checks.every(check => check);
  }
}

export const deploymentChecker = new DeploymentChecker();
export default deploymentChecker;
