interface IncidentData {
  id: string;
  lat: number;
  lng: number;
  type: 'harassment' | 'stalking' | 'eve-teasing' | 'theft' | 'assault' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeOfDay: number; // 0-23 hours
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  reportedAt: Date;
  verifiedCount: number;
  isAnonymous: boolean;
  weatherCondition?: 'clear' | 'rainy' | 'foggy' | 'dark';
}

interface HeatmapZone {
  id: string;
  lat: number;
  lng: number;
  radius: number; // meters
  riskScore: number; // 0-100
  riskLevel: 'safe' | 'caution' | 'risky' | 'dangerous';
  predictedRisk: number; // 0-100 for future predictions
  incidentCount: number;
  lastIncident: Date;
  timePatterns: {
    hour: number;
    riskMultiplier: number;
  }[];
  weeklyTrend: {
    day: string;
    incidentCount: number;
    changePercent: number;
  }[];
  safeBusinessCount: number;
  policeProximity: number; // meters to nearest police station
}

interface SafeBusiness {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'cafe' | 'restaurant' | 'shop' | 'pharmacy' | 'hospital' | 'auto_stand' | 'metro_station';
  verifiedSafe: boolean;
  femaleStaff: boolean;
  cctvCoverage: boolean;
  wellLit: boolean;
  rating: number; // 1-5
  reviewCount: number;
  operatingHours: {
    open: string;
    close: string;
  };
  emergencyContact?: string;
}

interface TrendAnalysis {
  area: string;
  timeframe: 'week' | 'month' | 'quarter';
  incidentChange: number; // percentage change
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  hotspots: {
    location: string;
    lat: number;
    lng: number;
    severity: string;
  }[];
  safestTimes: string[];
  riskiestTimes: string[];
  recommendations: string[];
}

class SafetyHeatmapService {
  private incidents: IncidentData[] = [];
  private heatmapZones: HeatmapZone[] = [];
  private safeBusinesses: SafeBusiness[] = [];
  private lastUpdated: Date = new Date();
  private backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  constructor() {
    this.loadMockData();
    this.generateHeatmap();
  }

  private loadMockData(): void {
    // Mock incident data for demonstration
    this.incidents = [
      {
        id: '1',
        lat: 12.9716,
        lng: 77.5946,
        type: 'harassment',
        severity: 'medium',
        timeOfDay: 22, // 10 PM
        dayOfWeek: 5, // Friday
        reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        verifiedCount: 3,
        isAnonymous: true,
        weatherCondition: 'dark'
      },
      {
        id: '2',
        lat: 12.9720,
        lng: 77.5950,
        type: 'eve-teasing',
        severity: 'high',
        timeOfDay: 20, // 8 PM
        dayOfWeek: 6, // Saturday
        reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        verifiedCount: 5,
        isAnonymous: false,
        weatherCondition: 'clear'
      },
      {
        id: '3',
        lat: 19.0760,
        lng: 72.8777,
        type: 'stalking',
        severity: 'high',
        timeOfDay: 21, // 9 PM
        dayOfWeek: 0, // Sunday
        reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        verifiedCount: 2,
        isAnonymous: true,
        weatherCondition: 'foggy'
      },
      // Add more mock data...
    ];

    // Mock safe businesses
    this.safeBusinesses = [
      {
        id: '1',
        name: 'Women-Safe Cafe Mocha',
        lat: 12.9716,
        lng: 77.5946,
        type: 'cafe',
        verifiedSafe: true,
        femaleStaff: true,
        cctvCoverage: true,
        wellLit: true,
        rating: 4.8,
        reviewCount: 156,
        operatingHours: { open: '08:00', close: '23:00' },
        emergencyContact: '+91-9876543210'
      },
      {
        id: '2',
        name: 'Safe Auto Stand - MG Road',
        lat: 12.9750,
        lng: 77.5950,
        type: 'auto_stand',
        verifiedSafe: true,
        femaleStaff: false,
        cctvCoverage: true,
        wellLit: true,
        rating: 4.2,
        reviewCount: 89,
        operatingHours: { open: '06:00', close: '24:00' },
        emergencyContact: '+91-9876543211'
      }
    ];
  }

  public async generateHeatmap(): Promise<HeatmapZone[]> {
    try {
      // In real implementation, this would fetch from backend
      // For now, generate based on incident data
      
      const zones: HeatmapZone[] = [];
      const gridSize = 0.005; // roughly 500m grid
      const processedCoords = new Set<string>();

      this.incidents.forEach(incident => {
        // Round coordinates to grid
        const gridLat = Math.round(incident.lat / gridSize) * gridSize;
        const gridLng = Math.round(incident.lng / gridSize) * gridSize;
        const coordKey = `${gridLat},${gridLng}`;

        if (processedCoords.has(coordKey)) {
          // Update existing zone
          const existingZone = zones.find(z => 
            Math.abs(z.lat - gridLat) < gridSize && 
            Math.abs(z.lng - gridLng) < gridSize
          );
          if (existingZone) {
            existingZone.incidentCount++;
            existingZone.riskScore = Math.min(100, existingZone.riskScore + 15);
            if (incident.reportedAt > existingZone.lastIncident) {
              existingZone.lastIncident = incident.reportedAt;
            }
          }
        } else {
          processedCoords.add(coordKey);
          
          // Calculate risk score based on multiple factors
          let riskScore = this.calculateRiskScore(incident);
          
          // Apply predictive factors
          const predictedRisk = this.calculatePredictiveRisk(gridLat, gridLng);
          
          zones.push({
            id: `zone_${zones.length + 1}`,
            lat: gridLat,
            lng: gridLng,
            radius: 250, // 250m radius
            riskScore,
            riskLevel: this.getRiskLevel(riskScore),
            predictedRisk,
            incidentCount: 1,
            lastIncident: incident.reportedAt,
            timePatterns: this.generateTimePatterns(gridLat, gridLng),
            weeklyTrend: this.generateWeeklyTrend(gridLat, gridLng),
            safeBusinessCount: this.countSafeBusinessesNearby(gridLat, gridLng),
            policeProximity: this.calculatePoliceProximity(gridLat, gridLng)
          });
        }
      });

      this.heatmapZones = zones;
      this.lastUpdated = new Date();
      
      return zones;
    } catch (error) {
      console.error('Error generating heatmap:', error);
      return [];
    }
  }

  private calculateRiskScore(incident: IncidentData): number {
    let score = 30; // Base score
    
    // Severity multiplier
    const severityMultipliers = {
      'low': 1.0,
      'medium': 1.5,
      'high': 2.0,
      'critical': 3.0
    };
    score *= severityMultipliers[incident.severity];
    
    // Time of day factor (higher risk at night)
    if (incident.timeOfDay >= 22 || incident.timeOfDay <= 5) {
      score *= 1.8; // Night hours
    } else if (incident.timeOfDay >= 18 || incident.timeOfDay <= 8) {
      score *= 1.3; // Evening/early morning
    }
    
    // Weekend factor
    if (incident.dayOfWeek === 5 || incident.dayOfWeek === 6) {
      score *= 1.2; // Friday/Saturday
    }
    
    // Recent incident factor
    const daysSince = (Date.now() - incident.reportedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 7) {
      score *= 1.5; // Recent incidents are more relevant
    }
    
    // Verification factor
    score += incident.verifiedCount * 5;
    
    return Math.min(100, Math.round(score));
  }

  private calculatePredictiveRisk(lat: number, lng: number): number {
    // AI-like prediction based on patterns
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    let prediction = 20; // Base prediction
    
    // Time-based prediction
    if (currentHour >= 20 || currentHour <= 6) {
      prediction += 30; // Higher risk at night
    }
    
    // Weekend prediction
    if (currentDay === 5 || currentDay === 6) {
      prediction += 15;
    }
    
    // Historical pattern analysis (mock)
    const historicalRisk = this.getHistoricalRiskForArea(lat, lng);
    prediction += historicalRisk;
    
    return Math.min(100, prediction);
  }

  private getHistoricalRiskForArea(lat: number, lng: number): number {
    // Mock historical analysis
    const nearbyIncidents = this.incidents.filter(incident => {
      const distance = this.calculateDistance(lat, lng, incident.lat, incident.lng);
      return distance <= 500; // 500m radius
    });
    
    return Math.min(30, nearbyIncidents.length * 5);
  }

  private getRiskLevel(score: number): 'safe' | 'caution' | 'risky' | 'dangerous' {
    if (score >= 80) return 'dangerous';
    if (score >= 60) return 'risky';
    if (score >= 40) return 'caution';
    return 'safe';
  }

  private generateTimePatterns(lat: number, lng: number): { hour: number; riskMultiplier: number; }[] {
    const patterns = [];
    for (let hour = 0; hour < 24; hour++) {
      let multiplier = 1.0;
      
      // Higher risk during night hours
      if (hour >= 22 || hour <= 5) {
        multiplier = 2.5;
      } else if (hour >= 18 || hour <= 8) {
        multiplier = 1.8;
      } else if (hour >= 12 && hour <= 14) {
        multiplier = 0.7; // Lunch time - safer
      }
      
      patterns.push({ hour, riskMultiplier: multiplier });
    }
    
    return patterns;
  }

  private generateWeeklyTrend(lat: number, lng: number): { day: string; incidentCount: number; changePercent: number; }[] {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map((day, index) => ({
      day,
      incidentCount: Math.floor(Math.random() * 5) + 1,
      changePercent: (Math.random() - 0.5) * 40 // -20% to +20%
    }));
  }

  private countSafeBusinessesNearby(lat: number, lng: number): number {
    return this.safeBusinesses.filter(business => {
      const distance = this.calculateDistance(lat, lng, business.lat, business.lng);
      return distance <= 500; // 500m radius
    }).length;
  }

  private calculatePoliceProximity(lat: number, lng: number): number {
    // Mock police station locations
    const policeStations = [
      { lat: 12.9716, lng: 77.5946 },
      { lat: 19.0760, lng: 72.8777 },
      { lat: 28.6139, lng: 77.2090 }
    ];
    
    const distances = policeStations.map(station => 
      this.calculateDistance(lat, lng, station.lat, station.lng)
    );
    
    return Math.min(...distances);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Public API methods
  public getHeatmapForArea(centerLat: number, centerLng: number, radiusKm: number = 5): HeatmapZone[] {
    return this.heatmapZones.filter(zone => {
      const distance = this.calculateDistance(centerLat, centerLng, zone.lat, zone.lng);
      return distance <= radiusKm * 1000; // Convert km to meters
    });
  }

  public getPredictiveAlert(lat: number, lng: number): string | null {
    const currentHour = new Date().getHours();
    
    // Check if current location/time has high predicted risk
    const nearbyZones = this.getHeatmapForArea(lat, lng, 0.5);
    const highRiskZones = nearbyZones.filter(zone => {
      const timePattern = zone.timePatterns.find(p => p.hour === currentHour);
      return zone.predictedRisk > 70 || (timePattern && timePattern.riskMultiplier > 2.0);
    });
    
    if (highRiskZones.length > 0) {
      const riskLevel = Math.max(...highRiskZones.map(z => z.predictedRisk));
      
      if (riskLevel > 80) {
        return `⚠️ HIGH RISK ALERT: This area shows ${riskLevel}% predicted risk for tonight. Consider alternative routes or travel with company.`;
      } else if (riskLevel > 60) {
        return `🟡 CAUTION: Moderate risk detected (${riskLevel}%). Stay alert and avoid isolated areas.`;
      }
    }
    
    return null;
  }

  public getTrendAnalysis(area: string = "Current Area"): TrendAnalysis {
    // Generate trend analysis based on recent data
    const recentIncidents = this.incidents.filter(incident => {
      const daysSince = (Date.now() - incident.reportedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7; // Last week
    });
    
    const previousWeekIncidents = this.incidents.filter(incident => {
      const daysSince = (Date.now() - incident.reportedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7 && daysSince <= 14; // Previous week
    });
    
    const incidentChange = previousWeekIncidents.length > 0 
      ? ((recentIncidents.length - previousWeekIncidents.length) / previousWeekIncidents.length) * 100
      : 0;
    
    return {
      area,
      timeframe: 'week',
      incidentChange: Math.round(incidentChange),
      trendDirection: incidentChange > 5 ? 'increasing' : incidentChange < -5 ? 'decreasing' : 'stable',
      hotspots: this.getTopHotspots(),
      safestTimes: ['10:00-12:00', '14:00-16:00'],
      riskiestTimes: ['22:00-02:00', '20:00-22:00'],
      recommendations: this.generateRecommendations(incidentChange)
    };
  }

  private getTopHotspots(): { location: string; lat: number; lng: number; severity: string; }[] {
    return this.heatmapZones
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3)
      .map(zone => ({
        location: `Area ${zone.id}`,
        lat: zone.lat,
        lng: zone.lng,
        severity: zone.riskLevel
      }));
  }

  private generateRecommendations(incidentChange: number): string[] {
    const recommendations = [
      'Travel with companions during evening hours',
      'Use well-lit main roads instead of shortcuts',
      'Share live location with trusted contacts'
    ];
    
    if (incidentChange > 10) {
      recommendations.unshift('⚠️ Increased activity - extra caution recommended');
    }
    
    return recommendations;
  }

  public getSafeBusinessesNearby(lat: number, lng: number, radiusKm: number = 2): SafeBusiness[] {
    return this.safeBusinesses.filter(business => {
      const distance = this.calculateDistance(lat, lng, business.lat, business.lng);
      return distance <= radiusKm * 1000;
    }).sort((a, b) => b.rating - a.rating);
  }

  public reportIncident(incident: Omit<IncidentData, 'id' | 'reportedAt'>): IncidentData {
    const newIncident: IncidentData = {
      ...incident,
      id: Date.now().toString(),
      reportedAt: new Date()
    };
    
    this.incidents.push(newIncident);
    
    // Regenerate heatmap with new data
    setTimeout(() => {
      this.generateHeatmap();
    }, 1000);
    
    return newIncident;
  }

  public getHeatmapZones(): HeatmapZone[] {
    return [...this.heatmapZones];
  }

  public getLastUpdated(): Date {
    return this.lastUpdated;
  }
}

export const safetyHeatmap = new SafetyHeatmapService();
export default safetyHeatmap;
