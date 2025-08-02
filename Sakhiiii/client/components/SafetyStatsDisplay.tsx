import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Users, MapPin, TrendingUp, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sampleDataService } from '@/services/sampleData';

const SafetyStatsDisplay: React.FC = () => {
  const [stats, setStats] = useState({
    totalZones: 0,
    safeZones: 0,
    riskZones: 0,
    recentIncidents: 0,
    safetyScore: 0,
    highRiskIncidents: 0
  });
  const [cityStats, setCityStats] = useState<any[]>([]);
  const [trendingTypes, setTrendingTypes] = useState<any[]>([]);

  useEffect(() => {
    // Load real statistics from sample data
    const safetyStats = sampleDataService.getSafetyStats();
    const cities = sampleDataService.getCityStats();
    const trending = sampleDataService.getTrendingIncidentTypes();
    
    setStats(safetyStats);
    setCityStats(cities);
    setTrendingTypes(trending.slice(0, 3)); // Top 3 trending
    
    console.log('📊 Safety stats loaded:', {
      safetyStats,
      cities: cities.length,
      trending: trending.length
    });
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-lg border border-purple-100"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <Badge variant={trend > 0 ? "destructive" : "default"} className="text-xs">
            {trend > 0 ? '+' : ''}{trend}%
          </Badge>
        )}
      </div>
      <h3 className="font-bold text-lg text-gray-900">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={Shield}
          title="Safe Zones"
          value={stats.safeZones}
          subtitle="Verified safe areas"
          color="bg-green-500"
          trend={2}
        />
        
        <StatCard
          icon={AlertTriangle}
          title="Risk Zones"
          value={stats.riskZones}
          subtitle="Areas with incidents"
          color="bg-red-500"
          trend={-1}
        />
        
        <StatCard
          icon={Activity}
          title="Safety Score"
          value={`${stats.safetyScore}%`}
          subtitle="Overall city safety"
          color="bg-purple-500"
          trend={5}
        />
        
        <StatCard
          icon={Users}
          title="Recent Reports"
          value={stats.recentIncidents}
          subtitle="Last 7 days"
          color="bg-blue-500"
          trend={12}
        />
        
        <StatCard
          icon={MapPin}
          title="High Risk"
          value={stats.highRiskIncidents}
          subtitle="Urgent incidents"
          color="bg-orange-500"
          trend={-8}
        />
        
        <StatCard
          icon={TrendingUp}
          title="Total Areas"
          value={stats.totalZones}
          subtitle="Monitored zones"
          color="bg-indigo-500"
          trend={3}
        />
      </div>

      {/* City-wise Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-4 shadow-lg border border-purple-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-purple-600" />
          City-wise Safety Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cityStats.map((city, index) => (
            <div key={city.city} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{city.city}</h4>
                <Badge 
                  variant={city.safetyScore >= 80 ? "default" : city.safetyScore >= 60 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {city.safetyScore}%
                </Badge>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Incidents: {city.incidents}</span>
                <span>Safe: {city.safeZones}</span>
                <span>Risk: {city.riskZones}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Trending Incident Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-4 shadow-lg border border-purple-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
          Most Reported Incident Types
        </h3>
        
        <div className="space-y-2">
          {trendingTypes.map((type, index) => (
            <div key={type.type} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium capitalize">{type.type}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {type.count} reports
              </Badge>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Real-time Update Indicator */}
      <div className="text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live data from community reports</span>
        </div>
      </div>
    </div>
  );
};

export default SafetyStatsDisplay;
