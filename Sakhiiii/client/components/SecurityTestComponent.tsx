import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestResult {
  name: string;
  status: 'testing' | 'success' | 'blocked' | 'error';
  message: string;
}

export default function SecurityTestComponent() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testEndpoints = [
    { name: 'Health Check', url: '/api/health' },
    { name: 'Zones API', url: '/api/zones' },
    { name: 'Incidents API', url: '/api/incidents' },
    { name: 'Safe Businesses', url: '/api/safe-businesses' }
  ];

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    for (const endpoint of testEndpoints) {
      results.push({
        name: endpoint.name,
        status: 'testing',
        message: 'Testing...'
      });
      setTests([...results]);

      try {
        const { secureNetworkService } = await import('../services/secureNetworkService');
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        
        const result = await secureNetworkService.secureFetch(`${backendUrl}${endpoint.url}`, {
          timeout: 5000,
          retries: 1,
          showUserError: false
        });

        const lastResult = results[results.length - 1];
        if (result.success) {
          lastResult.status = 'success';
          lastResult.message = 'Connection successful';
        } else if (result.isBlocked) {
          lastResult.status = 'blocked';
          lastResult.message = 'Blocked by security software (expected)';
        } else {
          lastResult.status = 'error';
          lastResult.message = result.error || 'Connection failed';
        }
        setTests([...results]);

      } catch (error) {
        const lastResult = results[results.length - 1];
        lastResult.status = 'error';
        lastResult.message = error.message || 'Test failed';
        setTests([...results]);
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'blocked':
        return <Shield className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'testing':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'blocked':
        return 'border-orange-200 bg-orange-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="glass rounded-2xl p-6 shadow-beautiful">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              🛡️ Security Software Detection Test
            </h2>
            <p className="text-muted-foreground text-sm">
              Testing network connectivity and security software blocking detection
            </p>
          </div>
          <Button
            onClick={runTests}
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {test.message}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {tests.length > 0 && !isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-muted/50 rounded-lg"
          >
            <h3 className="font-semibold mb-2">📊 Test Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">✅ Successful: </span>
                {tests.filter(t => t.status === 'success').length}
              </div>
              <div>
                <span className="text-orange-600">🛡️ Blocked: </span>
                {tests.filter(t => t.status === 'blocked').length}
              </div>
              <div>
                <span className="text-red-600">❌ Errors: </span>
                {tests.filter(t => t.status === 'error').length}
              </div>
              <div>
                <span className="text-blue-600">📡 Total: </span>
                {tests.length}
              </div>
            </div>
            
            <div className="mt-3 text-xs text-muted-foreground">
              {tests.some(t => t.status === 'blocked') ? (
                <p>🛡️ Security software detected and handled gracefully. Demo mode will be used for blocked requests.</p>
              ) : tests.every(t => t.status === 'success') ? (
                <p>✅ All connections successful. Full functionality available.</p>
              ) : (
                <p>⚠️ Some connections failed. Check backend connectivity.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
