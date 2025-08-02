import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  Clock,
  Zap,
  Target,
  Activity,
  Bell,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { safetyHeatmap } from '@/services/safetyHeatmap';
import { advancedSMSService } from '@/services/advancedSMS';
import { voiceService } from '@/services/voiceService';
import { sampleDataService } from '@/services/sampleData';

interface SafetyMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: any;
}

interface PredictiveAlert {
  id: string;
  type: 'danger_zone' | 'time_risk' | 'weather_risk' | 'route_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: string;
  timeframe: string;
  recommendation: string;
}

const AdvancedSafetyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetric[]>([]);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [emergencyCircleActive, setEmergencyCircleActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...');
  const [weeklyTrend, setWeeklyTrend] = useState<any>(null);

  useEffect(() => {
    loadSafetyData();
    checkEmergencyCircleStatus();
    getCurrentLocationData();
    generatePredictiveAlerts();
  }, []);

  const loadSafetyData = async () => {
    try {
      // Get trend analysis
      const trends = safetyHeatmap.getTrendAnalysis();
      setWeeklyTrend(trends);

      // Generate safety metrics
      const metrics: SafetyMetric[] = [
        {
          label: 'Area Safety Score',
          value: '78%',
          change: trends.incidentChange,
          trend: trends.trendDirection === 'increasing' ? 'down' : trends.trendDirection === 'decreasing' ? 'up' : 'stable',
          color: 'bg-green-500',
          icon: Shield
        },
        {
          label: 'Weekly Incidents',
          value: Math.abs(trends.incidentChange),
          change: trends.incidentChange,
          trend: trends.incidentChange > 0 ? 'up' : trends.incidentChange < 0 ? 'down' : 'stable',
          color: trends.incidentChange > 0 ? 'bg-red-500' : 'bg-green-500',
          icon: AlertTriangle
        },
        {
          label: 'Safe Businesses',
          value: '12',
          change: 8,
          trend: 'up',
          color: 'bg-blue-500',
          icon: MapPin
        },
        {
          label: 'Community Alerts',
          value: '3',
          change: -2,
          trend: 'down',
          color: 'bg-yellow-500',
          icon: Bell
        }
      ];

      setSafetyMetrics(metrics);
    } catch (error) {
      console.error('Error loading safety data:', error);
    }
  };

  const checkEmergencyCircleStatus = () => {
    const isActive = advancedSMSService.isEmergencyCircleActive();
    setEmergencyCircleActive(isActive);
  };

  const getCurrentLocationData = async () => {
    try {
      const location = advancedSMSService.getCurrentLocation();
      if (location && location.address) {
        setCurrentLocation(location.address);
      } else {
        setCurrentLocation('Unable to get location');
      }
    } catch (error) {
      setCurrentLocation('Location unavailable');
    }
  };

  const generatePredictiveAlerts = () => {
    const currentHour = new Date().getHours();
    const alerts: PredictiveAlert[] = [];

    // Time-based risk alert
    if (currentHour >= 20 || currentHour <= 6) {
      alerts.push({
        id: '1',
        type: 'time_risk',
        severity: 'medium',
        message: 'Higher risk detected for evening hours',
        timeframe: 'Next 4 hours',
        recommendation: 'Travel with companions or use well-lit routes'
      });
    }

    // Location-based prediction
    const locationAlert = safetyHeatmap.getPredictiveAlert(12.9716, 77.5946);
    if (locationAlert) {
      alerts.push({
        id: '2',
        type: 'danger_zone',
        severity: 'high',
        message: locationAlert,
        location: 'MG Road Area',
        timeframe: 'Tonight',
        recommendation: 'Consider alternative routes or delay travel'
      });
    }

    // Weather-based risk (mock)
    alerts.push({
      id: '3',
      type: 'weather_risk',
      severity: 'low',
      message: 'Reduced visibility due to fog predicted',
      timeframe: 'Tomorrow morning',
      recommendation: 'Allow extra travel time and stay in groups'
    });

    setPredictiveAlerts(alerts);
  };

  const activateEmergencyCircle = async () => {
    try {
      const userName = user?.name || 'User';
      await advancedSMSService.activateEmergencyCircle(userName, currentLanguage);
      setEmergencyCircleActive(true);
      
      voiceService.speakNotification(
        'Emergency circle activated. Your trusted contacts are now receiving your live location.',
        currentLanguage
      );
    } catch (error) {
      console.error('Error activating emergency circle:', error);
    }
  };

  const deactivateEmergencyCircle = async () => {
    try {
      const userName = user?.name || 'User';
      await advancedSMSService.deactivateEmergencyCircle(userName, currentLanguage);
      setEmergencyCircleActive(false);
      
      voiceService.speakNotification(
        'Emergency circle deactivated. All clear signal sent to contacts.',
        currentLanguage
      );
    } catch (error) {
      console.error('Error deactivating emergency circle:', error);
    }
  };

  const MetricCard = ({ metric }: { metric: SafetyMetric }) => {
    const Icon = metric.icon;
    const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100"
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`${metric.color} rounded-xl p-2`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-1">
            <TrendIcon className={`w-4 h-4 ${
              metric.trend === 'up' ? 'text-green-500' : 
              metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`} />
            <span className={`text-sm font-medium ${
              metric.trend === 'up' ? 'text-green-500' : 
              metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {Math.abs(metric.change)}%
            </span>
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
          <div className="text-sm text-gray-600">{metric.label}</div>
        </div>
      </motion.div>
    );
  };

  const AlertCard = ({ alert }: { alert: PredictiveAlert }) => {
    const severityColors = {
      low: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      medium: 'bg-orange-50 border-orange-200 text-orange-800', 
      high: 'bg-red-50 border-red-200 text-red-800',
      critical: 'bg-red-100 border-red-300 text-red-900'
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-4 rounded-2xl border-2 ${severityColors[alert.severity]}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Predictive Alert</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {alert.timeframe}
          </Badge>
        </div>
        <p className="font-medium mb-2">{alert.message}</p>
        {alert.location && (
          <p className="text-sm mb-2">📍 {alert.location}</p>
        )}
        <div className="bg-white/50 rounded-lg p-2 text-sm">
          <strong>Recommendation:</strong> {alert.recommendation}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          AI Safety Dashboard 🧠
        </h1>
        <p className="text-gray-600">
          Real-time safety intelligence powered by predictive analytics
        </p>
      </motion.div>

      {/* Emergency Circle Status */}
      {emergencyCircleActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 rounded-full p-2 animate-pulse">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-red-900">Emergency Circle Active</h3>
                <p className="text-sm text-red-700">Live location shared with trusted contacts</p>
              </div>
            </div>
            <Button
              onClick={deactivateEmergencyCircle}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Deactivate
            </Button>
          </div>
        </motion.div>
      )}

      {/* Current Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 rounded-xl p-2">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Current Location</h3>
              <p className="text-sm text-gray-600">{currentLocation}</p>
            </div>
          </div>
          {!emergencyCircleActive && (
            <Button
              onClick={activateEmergencyCircle}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Start Emergency Circle
            </Button>
          )}
        </div>
      </motion.div>

      {/* Safety Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Safety Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          {safetyMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </motion.div>

      {/* Predictive Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">AI Predictions</h2>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100">
            <Zap className="w-3 h-3 mr-1" />
            Powered by AI
          </Badge>
        </div>
        <div className="space-y-3">
          {predictiveAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </motion.div>

      {/* Weekly Trend Analysis */}
      {weeklyTrend && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100"
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Weekly Trend Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Incident Change</span>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${weeklyTrend.incidentChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {weeklyTrend.incidentChange > 0 ? '+' : ''}{weeklyTrend.incidentChange}%
                </span>
                <Badge variant={weeklyTrend.trendDirection === 'increasing' ? 'destructive' : 'default'}>
                  {weeklyTrend.trendDirection}
                </Badge>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-600 block mb-2">Safest Times</span>
              <div className="flex flex-wrap gap-2">
                {weeklyTrend.safestTimes.map((time: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                    <Clock className="w-3 h-3 mr-1" />
                    {time}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600 block mb-2">Recommendations</span>
              <div className="space-y-1">
                {weeklyTrend.recommendations.slice(0, 2).map((rec: string, index: number) => (
                  <div key={index} className="text-sm bg-purple-50 rounded-lg p-2 text-purple-800">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* WhatsApp Integration Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200"
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-green-500 rounded-xl p-2">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">WhatsApp Safety Bot</h3>
            <p className="text-sm text-green-700">Get instant safety info via WhatsApp</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Try these commands:</strong>
          </p>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• "SAFE ROUTE to MG Road" - Get safest directions</div>
            <div>• "ALERT ME" - Enable location-based warnings</div>
            <div>• "HELP" - Emergency assistance</div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              📱 WhatsApp: +91-XXXXX-XXXXX (Coming Soon)
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedSafetyDashboard;
