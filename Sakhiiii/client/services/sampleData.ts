// Sample Data Service with Real Indian Safety Data
interface SafeZone {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: 'safe_zone' | 'risk_zone';
  description: string;
  lastUpdated: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  radius: number;
  incidentCount?: number;
  address: string;
  city: string;
}

interface IncidentReport {
  id: string;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reportedBy: string;
  timeAgo: string;
  likes: number;
  comments: number;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  timestamp: string;
}

class SampleDataService {
  // Sample Safe Zones (Green Markers)
  private safeZones: SafeZone[] = [
    {
      id: 'safe_1',
      lat: 12.9716,
      lng: 77.5946,
      label: 'MG Road Metro Station - Safe',
      type: 'safe_zone',
      description: 'Well-lit metro station with excellent security and CCTV coverage',
      lastUpdated: '2025-07-30T10:00:00Z',
      riskLevel: 'low',
      radius: 300,
      address: 'MG Road Metro Station, Bangalore, Karnataka',
      city: 'Bangalore'
    },
    {
      id: 'safe_2',
      lat: 28.6139,
      lng: 77.2090,
      label: 'India Gate Area - Safe',
      type: 'safe_zone',
      description: 'Tourist area with high police presence and regular patrolling',
      lastUpdated: '2025-07-30T11:00:00Z',
      riskLevel: 'low',
      radius: 500,
      address: 'India Gate, New Delhi, Delhi',
      city: 'Delhi'
    },
    {
      id: 'safe_3',
      lat: 19.0760,
      lng: 72.8777,
      label: 'Bandra West Police Station',
      type: 'safe_zone',
      description: 'Police station area with immediate emergency response',
      lastUpdated: '2025-07-29T18:30:00Z',
      riskLevel: 'low',
      radius: 400,
      address: 'Bandra West Police Station, Mumbai, Maharashtra',
      city: 'Mumbai'
    },
    {
      id: 'safe_4',
      lat: 13.0827,
      lng: 80.2707,
      label: 'T Nagar Shopping District - Safe',
      type: 'safe_zone',
      description: 'Busy shopping area with good lighting and security',
      lastUpdated: '2025-07-29T20:15:00Z',
      riskLevel: 'low',
      radius: 350,
      address: 'T Nagar Shopping District, Chennai, Tamil Nadu',
      city: 'Chennai'
    },
    {
      id: 'safe_5',
      lat: 17.3850,
      lng: 78.4867,
      label: 'Necklace Road Park Area',
      type: 'safe_zone',
      description: 'Well-maintained park with regular security patrols',
      lastUpdated: '2025-07-30T09:45:00Z',
      riskLevel: 'low',
      radius: 300,
      address: 'Necklace Road Park, Hyderabad, Telangana',
      city: 'Hyderabad'
    }
  ];

  // Sample Risk Zones (Red Markers)
  private riskZones: SafeZone[] = [
    {
      id: 'risk_1',
      lat: 12.9352,
      lng: 77.6245,
      label: 'Koramangala 8th Block - Recent Harassment Reports',
      type: 'risk_zone',
      description: 'Multiple harassment incidents reported in recent weeks',
      lastUpdated: '2025-07-30T15:00:00Z',
      riskLevel: 'high',
      radius: 200,
      incidentCount: 8,
      address: 'Koramangala 8th Block, Bangalore, Karnataka',
      city: 'Bangalore'
    },
    {
      id: 'risk_2',
      lat: 28.6448,
      lng: 77.2167,
      label: 'Connaught Place - Pickpocketing & Harassment',
      type: 'risk_zone',
      description: 'High incidents of pickpocketing and harassment, especially evenings',
      lastUpdated: '2025-07-29T21:00:00Z',
      riskLevel: 'moderate',
      radius: 250,
      incidentCount: 12,
      address: 'Connaught Place, New Delhi, Delhi',
      city: 'Delhi'
    },
    {
      id: 'risk_3',
      lat: 19.1136,
      lng: 72.8697,
      label: 'Andheri Station Area - Multiple Incidents',
      type: 'risk_zone',
      description: 'Crowded station area with multiple safety incidents reported',
      lastUpdated: '2025-07-28T19:30:00Z',
      riskLevel: 'moderate',
      radius: 300,
      incidentCount: 15,
      address: 'Andheri Station Area, Mumbai, Maharashtra',
      city: 'Mumbai'
    }
  ];

  // Sample Incident Reports (For Community Feed)
  private incidentReports: IncidentReport[] = [
    {
      id: 'incident_1',
      type: 'Eve-teasing',
      description: 'Group of men making inappropriate comments near metro entrance.',
      location: {
        lat: 12.9352,
        lng: 77.6245,
        address: 'Koramangala 8th Block, Bangalore'
      },
      reportedBy: 'Priya S.',
      timeAgo: '10 mins ago',
      likes: 12,
      comments: 3,
      severity: 'medium',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: 'incident_2',
      type: 'Stalking',
      description: 'A man followed me from bus stop to office area.',
      location: {
        lat: 19.1136,
        lng: 72.8697,
        address: 'Andheri Station, Mumbai'
      },
      reportedBy: 'Anonymous',
      timeAgo: '1 hour ago',
      likes: 8,
      comments: 2,
      severity: 'high',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: 'incident_3',
      type: 'Harassment',
      description: 'Shopkeeper passed inappropriate remarks to female customers.',
      location: {
        lat: 28.6448,
        lng: 77.2167,
        address: 'Connaught Place, Delhi'
      },
      reportedBy: 'Kavya R.',
      timeAgo: '2 hours ago',
      likes: 15,
      comments: 7,
      severity: 'medium',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'incident_4',
      type: 'Suspicious Activity',
      description: 'Two men loitering near park entrance after midnight.',
      location: {
        lat: 17.3850,
        lng: 78.4867,
        address: 'Necklace Road Park, Hyderabad'
      },
      reportedBy: 'Ananya K.',
      timeAgo: '6 hours ago',
      likes: 9,
      comments: 4,
      severity: 'medium',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'incident_5',
      type: 'Other',
      description: 'Street lights not working for past week.',
      location: {
        lat: 13.0827,
        lng: 80.2707,
        address: 'T Nagar, Chennai'
      },
      reportedBy: 'Anonymous',
      timeAgo: '1 day ago',
      likes: 6,
      comments: 1,
      severity: 'low',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  /**
   * Get all safety zones (both safe and risk zones)
   */
  getAllZones(): SafeZone[] {
    return [...this.safeZones, ...this.riskZones];
  }

  /**
   * Get only safe zones
   */
  getSafeZones(): SafeZone[] {
    return this.safeZones;
  }

  /**
   * Get only risk zones
   */
  getRiskZones(): SafeZone[] {
    return this.riskZones;
  }

  /**
   * Get zones near a specific location
   */
  getZonesNearLocation(lat: number, lng: number, radiusKm: number = 50): SafeZone[] {
    return this.getAllZones().filter(zone => {
      const distance = this.calculateDistance(lat, lng, zone.lat, zone.lng);
      return distance <= radiusKm;
    });
  }

  /**
   * Get all incident reports
   */
  getIncidentReports(): IncidentReport[] {
    return this.incidentReports.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get recent incident reports (last 7 days)
   */
  getRecentIncidents(): IncidentReport[] {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.incidentReports.filter(incident => 
      new Date(incident.timestamp) > weekAgo
    );
  }

  /**
   * Get incidents by severity
   */
  getIncidentsBySeverity(severity: 'low' | 'medium' | 'high' | 'extreme'): IncidentReport[] {
    return this.incidentReports.filter(incident => incident.severity === severity);
  }

  /**
   * Get incidents near a location
   */
  getIncidentsNearLocation(lat: number, lng: number, radiusKm: number = 10): IncidentReport[] {
    return this.incidentReports.filter(incident => {
      const distance = this.calculateDistance(
        lat, lng, 
        incident.location.lat, incident.location.lng
      );
      return distance <= radiusKm;
    });
  }

  /**
   * Add a new incident report
   */
  addIncidentReport(incident: Omit<IncidentReport, 'id' | 'timestamp' | 'likes' | 'comments'>): IncidentReport {
    const newIncident: IncidentReport = {
      ...incident,
      id: `incident_${Date.now()}`,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    
    this.incidentReports.unshift(newIncident);
    
    // Keep only last 100 incidents
    if (this.incidentReports.length > 100) {
      this.incidentReports = this.incidentReports.slice(0, 100);
    }
    
    return newIncident;
  }

  /**
   * Get safety statistics
   */
  getSafetyStats() {
    const total = this.getAllZones().length;
    const safeCount = this.safeZones.length;
    const riskCount = this.riskZones.length;
    const recentIncidents = this.getRecentIncidents().length;
    const highRiskIncidents = this.getIncidentsBySeverity('high').length + 
                              this.getIncidentsBySeverity('extreme').length;

    return {
      totalZones: total,
      safeZones: safeCount,
      riskZones: riskCount,
      recentIncidents,
      highRiskIncidents,
      safetyScore: Math.round(((safeCount / total) * 100))
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Get city-wise incident summary
   */
  getCityStats() {
    const cities = ['Bangalore', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad'];
    return cities.map(city => {
      const cityIncidents = this.incidentReports.filter(incident => 
        incident.location.address.includes(city)
      );
      const citySafeZones = this.safeZones.filter(zone => zone.city === city);
      const cityRiskZones = this.riskZones.filter(zone => zone.city === city);
      
      return {
        city,
        incidents: cityIncidents.length,
        safeZones: citySafeZones.length,
        riskZones: cityRiskZones.length,
        safetyScore: cityRiskZones.length > 0 ? 
          Math.round((citySafeZones.length / (citySafeZones.length + cityRiskZones.length)) * 100) : 
          100
      };
    });
  }

  /**
   * Search incidents by type or description
   */
  searchIncidents(query: string): IncidentReport[] {
    const lowerQuery = query.toLowerCase();
    return this.incidentReports.filter(incident => 
      incident.type.toLowerCase().includes(lowerQuery) ||
      incident.description.toLowerCase().includes(lowerQuery) ||
      incident.location.address.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get trending incident types
   */
  getTrendingIncidentTypes() {
    const typeCount: { [key: string]: number } = {};

    this.incidentReports.forEach(incident => {
      typeCount[incident.type] = (typeCount[incident.type] || 0) + 1;
    });

    return Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get nearby incidents within radius
   */
  getNearbyIncidents(lat: number, lng: number, radiusMeters: number = 10000): IncidentReport[] {
    return this.incidentReports.filter(incident => {
      const distance = this.calculateDistance(lat, lng, incident.location.lat, incident.location.lng) * 1000; // Convert to meters
      return distance <= radiusMeters;
    }).map(incident => ({
      ...incident,
      coordinates: { lat: incident.location.lat, lng: incident.location.lng },
      address: incident.location.address,
      city: incident.location.address.split(',').pop()?.trim() || 'Unknown',
      timestamp: new Date(incident.timestamp),
      isVerified: Math.random() > 0.3 // Random verification status for demo
    }));
  }

  /**
   * Get safe businesses
   */
  getSafeBusinesses(): any[] {
    return [
      {
        id: 'bus_1',
        name: 'Cafe Coffee Day - MG Road',
        category: 'cafe',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        address: 'MG Road, Bangalore, Karnataka',
        city: 'Bangalore',
        phone: '+91-80-12345678',
        hours: '7:00 AM - 11:00 PM',
        rating: 4.5,
        amenities: ['cctv', 'well_lit', 'female_staff']
      },
      {
        id: 'bus_2',
        name: 'Apollo Pharmacy',
        category: 'pharmacy',
        coordinates: { lat: 28.6139, lng: 77.2090 },
        address: 'Connaught Place, New Delhi',
        city: 'Delhi',
        phone: '+91-11-87654321',
        hours: '8:00 AM - 10:00 PM',
        rating: 4.8,
        amenities: ['cctv', 'security', 'well_lit']
      },
      {
        id: 'bus_3',
        name: 'Women-Only Auto Stand',
        category: 'auto_stand',
        coordinates: { lat: 18.9387, lng: 72.8352 },
        address: 'Near Churchgate Station, Mumbai',
        city: 'Mumbai',
        phone: '+91-22-11223344',
        hours: '6:00 AM - 11:00 PM',
        rating: 4.7,
        amenities: ['female_drivers', 'security', 'well_lit']
      },
      {
        id: 'bus_4',
        name: 'Safe Spot Restaurant',
        category: 'restaurant',
        coordinates: { lat: 13.0827, lng: 80.2707 },
        address: 'T. Nagar, Chennai',
        city: 'Chennai',
        phone: '+91-44-98765432',
        hours: '11:00 AM - 11:00 PM',
        rating: 4.6,
        amenities: ['cctv', 'female_staff', 'well_lit', 'security']
      }
    ];
  }
}

export const sampleDataService = new SampleDataService();
export default sampleDataService;
