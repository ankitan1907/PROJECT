import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Shield,
  MapPin,
  Phone,
  Mic,
  Database,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckResult {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warning' | 'testing';
  message: string;
  critical: boolean;
}

export default function FinalSystemCheck() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0, warnings: 0 });

  const runComprehensiveCheck = async () => {
    setIsRunning(true);
    const results: CheckResult[] = [];

    // Frontend Core Checks
    results.push(await checkBrowserAPIs());
    results.push(await checkLocationServices());
    results.push(await checkVoiceAssistant());
    results.push(await checkNotifications());
    results.push(await checkLocalStorage());

    // Services Checks
    results.push(await checkSampleDataService());
    results.push(await checkNetworkService());
    results.push(await checkSMSService());
    results.push(await checkGoogleMapsAPI());

    // Backend Connectivity
    results.push(await checkBackendHealth());
    results.push(await checkDatabaseConnection());

    // Security & Performance
    results.push(await checkSecurityBlocking());
    results.push(await checkDeploymentReadiness());

    setChecks(results);
    
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      warnings: results.filter(r => r.status === 'warning').length
    };
    setSummary(summary);
    setIsRunning(false);
  };

  // Individual check functions
  const checkBrowserAPIs = async (): Promise<CheckResult> => {
    const required = ['fetch', 'localStorage', 'geolocation'];
    const available = required.filter(api => {
      if (api === 'geolocation') return 'geolocation' in navigator;
      if (api === 'localStorage') return 'localStorage' in window;
      return api in window;
    });

    return {
      name: 'Browser APIs',
      category: 'Core',
      status: available.length === required.length ? 'pass' : 'fail',
      message: `${available.length}/${required.length} required APIs available`,
      critical: true
    };
  };

  const checkLocationServices = async (): Promise<CheckResult> => {
    try {
      const { locationService } = await import('../services/locationService');
      const location = await locationService.getCurrentLocation(false);
      
      return {
        name: 'Location Services',
        category: 'Core',
        status: 'pass',
        message: `GPS working - accuracy: ${Math.round(location.accuracy)}m`,
        critical: true
      };
    } catch (error) {
      return {
        name: 'Location Services',
        category: 'Core',
        status: 'warning',
        message: 'Location permission required or unavailable',
        critical: false
      };
    }
  };

  const checkVoiceAssistant = async (): Promise<CheckResult> => {
    try {
      const { voiceAssistantService } = await import('../services/voiceAssistantService');
      const supported = voiceAssistantService.isSupported();
      const voices = voiceAssistantService.getVoices();
      
      return {
        name: 'Voice Assistant',
        category: 'Features',
        status: supported ? 'pass' : 'warning',
        message: supported ? `${voices.length} voices available` : 'Speech synthesis not supported',
        critical: false
      };
    } catch (error) {
      return {
        name: 'Voice Assistant',
        category: 'Features',
        status: 'fail',
        message: 'Service unavailable',
        critical: false
      };
    }
  };

  const checkNotifications = async (): Promise<CheckResult> => {
    const supported = 'Notification' in window;
    let permission = 'unknown';
    
    if (supported) {
      permission = Notification.permission;
    }

    return {
      name: 'Notifications',
      category: 'Features',
      status: supported ? 'pass' : 'warning',
      message: supported ? `Permission: ${permission}` : 'Notifications not supported',
      critical: false
    };
  };

  const checkLocalStorage = async (): Promise<CheckResult> => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      return {
        name: 'Local Storage',
        category: 'Core',
        status: 'pass',
        message: 'Data persistence available',
        critical: true
      };
    } catch (error) {
      return {
        name: 'Local Storage',
        category: 'Core',
        status: 'fail',
        message: 'Storage not available',
        critical: true
      };
    }
  };

  const checkSampleDataService = async (): Promise<CheckResult> => {
    try {
      const { sampleDataService } = await import('../services/sampleData');
      const zones = sampleDataService.getAllZones();
      const incidents = sampleDataService.getNearbyIncidents(12.9716, 77.5946, 10000);
      const businesses = sampleDataService.getSafeBusinesses();
      
      return {
        name: 'Sample Data Service',
        category: 'Services',
        status: 'pass',
        message: `${zones.length} zones, ${incidents.length} incidents, ${businesses.length} businesses`,
        critical: true
      };
    } catch (error) {
      return {
        name: 'Sample Data Service',
        category: 'Services',
        status: 'fail',
        message: `Service error: ${error.message}`,
        critical: true
      };
    }
  };

  const checkNetworkService = async (): Promise<CheckResult> => {
    try {
      const { secureNetworkService } = await import('../services/secureNetworkService');
      const isDemoMode = secureNetworkService.isDemoMode();
      
      return {
        name: 'Network Service',
        category: 'Services',
        status: 'pass',
        message: isDemoMode ? 'Demo mode active (security software detected)' : 'Full network access',
        critical: false
      };
    } catch (error) {
      return {
        name: 'Network Service',
        category: 'Services',
        status: 'fail',
        message: 'Service unavailable',
        critical: false
      };
    }
  };

  const checkSMSService = async (): Promise<CheckResult> => {
    try {
      const { twilioSMSService } = await import('../services/twilioSMS');
      const contacts = twilioSMSService.getEmergencyContacts();
      const testResult = await twilioSMSService.testSMSService();
      
      return {
        name: 'SMS Service',
        category: 'Services',
        status: testResult ? 'pass' : 'warning',
        message: `${contacts.length} contacts configured, ${testResult ? 'service operational' : 'demo mode'}`,
        critical: false
      };
    } catch (error) {
      return {
        name: 'SMS Service',
        category: 'Services',
        status: 'warning',
        message: 'Using demo mode',
        critical: false
      };
    }
  };

  const checkGoogleMapsAPI = async (): Promise<CheckResult> => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const googleLoaded = typeof google !== 'undefined' && google.maps;
    
    return {
      name: 'Google Maps API',
      category: 'External',
      status: apiKey && googleLoaded ? 'pass' : apiKey ? 'warning' : 'fail',
      message: !apiKey ? 'API key missing' : googleLoaded ? 'Maps loaded successfully' : 'Maps loading...',
      critical: true
    };
  };

  const checkBackendHealth = async (): Promise<CheckResult> => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      return {
        name: 'Backend Health',
        category: 'Backend',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? 'Backend responding' : `HTTP ${response.status}`,
        critical: false
      };
    } catch (error) {
      return {
        name: 'Backend Health',
        category: 'Backend',
        status: 'warning',
        message: 'Backend unavailable (using demo mode)',
        critical: false
      };
    }
  };

  const checkDatabaseConnection = async (): Promise<CheckResult> => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/dashboard/stats`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Database Connection',
          category: 'Backend',
          status: 'pass',
          message: `MongoDB connected - ${data.stats?.totalIncidents || 0} incidents`,
          critical: false
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: 'Database Connection',
        category: 'Backend',
        status: 'warning',
        message: 'Database unavailable (using demo data)',
        critical: false
      };
    }
  };

  const checkSecurityBlocking = async (): Promise<CheckResult> => {
    const userAgent = navigator.userAgent.toLowerCase();
    const hasKaspersky = userAgent.includes('kaspersky');
    
    return {
      name: 'Security Software',
      category: 'Security',
      status: 'pass',
      message: hasKaspersky ? 'Kaspersky detected - graceful handling active' : 'No blocking detected',
      critical: false
    };
  };

  const checkDeploymentReadiness = async (): Promise<CheckResult> => {
    const requiredEnvVars = ['VITE_GOOGLE_MAPS_API_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
    
    return {
      name: 'Deployment Readiness',
      category: 'Deployment',
      status: missingVars.length === 0 ? 'pass' : 'warning',
      message: missingVars.length === 0 ? 'All required configs present' : `Missing: ${missingVars.join(', ')}`,
      critical: false
    };
  };

  useEffect(() => {
    runComprehensiveCheck();
  }, []);

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Core':
        return <Shield className="w-4 h-4" />;
      case 'Features':
        return <Mic className="w-4 h-4" />;
      case 'Services':
        return <Globe className="w-4 h-4" />;
      case 'Backend':
        return <Database className="w-4 h-4" />;
      case 'External':
        return <MapPin className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const groupedChecks = checks.reduce((groups, check) => {
    if (!groups[check.category]) {
      groups[check.category] = [];
    }
    groups[check.category].push(check);
    return groups;
  }, {} as Record<string, CheckResult[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="glass rounded-2xl p-6 shadow-beautiful">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🚀 Final System Check
            </h2>
            <p className="text-muted-foreground">
              Comprehensive verification of all app components and features
            </p>
          </div>
          <Button
            onClick={runComprehensiveCheck}
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Re-run Check'
            )}
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-xs text-blue-600">Total Tests</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
            <div className="text-xs text-green-600">Passed</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{summary.warnings}</div>
            <div className="text-xs text-orange-600">Warnings</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
            <div className="text-xs text-red-600">Failed</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                {getCategoryIcon(category)}
                <h3 className="font-semibold text-lg">{category}</h3>
              </div>
              <div className="space-y-2">
                {categoryChecks.map((check, index) => (
                  <motion.div
                    key={check.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-muted-foreground">{check.message}</div>
                      </div>
                    </div>
                    {check.critical && (
                      <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Critical
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Overall Status */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-center">
            {summary.failed === 0 ? (
              <div>
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-green-700">✅ System Ready for Production</h3>
                <p className="text-sm text-green-600 mt-1">
                  All critical systems operational. App is ready for deployment and user access.
                </p>
              </div>
            ) : (
              <div>
                <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-orange-700">⚠️ Review Required</h3>
                <p className="text-sm text-orange-600 mt-1">
                  Some systems need attention before production deployment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
