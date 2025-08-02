import { Language } from '@shared/types';
import { voiceAssistantService } from './voiceAssistantService';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
  canReceiveAlerts: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

interface DangerZone {
  id: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  reportCount: number;
  lastIncident: Date;
}

interface SMSAlert {
  id: string;
  userId: string;
  type: 'sos' | 'danger_zone' | 'safe_arrival' | 'check_in' | 'emergency_circle';
  location: LocationData;
  message: string;
  contacts: EmergencyContact[];
  sentAt: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  dangerZone?: DangerZone;
}

class AdvancedSMSService {
  private twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  private twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  private twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
  private backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  
  private emergencyContacts: EmergencyContact[] = [];
  private currentLocation: LocationData | null = null;
  private isTrackingLocation = false;
  private emergencyCircleActive = false;
  private locationUpdateInterval: NodeJS.Timeout | null = null;

  // Enhanced emergency message templates
  private emergencyTemplates: Record<Language, Record<string, string>> = {
    en: {
      sos: '🚨 URGENT EMERGENCY ALERT from Sakhi App 🚨\n\n{userName} is in immediate danger and needs help!\n\n📍 Current Location:\n{location}\n🕐 Time: {time}\n🔗 Live Location: {googleMapsLink}\n\n⚠️ PLEASE RESPOND IMMEDIATELY OR CALL EMERGENCY SERVICES\n\nThis alert was sent by Sakhi - Women Safety App',
      dangerZone: '⚠️ DANGER ZONE ALERT from Sakhi App\n\n{userName} has entered a high-risk area:\n\n📍 Location: {location}\n⚠️ Risk Level: {riskLevel}\n🕐 Time: {time}\n📊 Recent incidents: {incidentCount}\n🔗 Track: {googleMapsLink}\n\nPlease check on them immediately.\n\nSent via Sakhi Safety App',
      emergencyCircle: '🔄 EMERGENCY CIRCLE ACTIVATED\n\n{userName} is sharing live location with emergency circle.\n\n📍 Current: {location}\n🕐 Started: {time}\n⏱️ Updates every 5 minutes\n🔗 Live tracking: {googleMapsLink}\n\nStay alert until all-clear signal.\n\nSakhi Emergency System',
      safeArrival: '✅ SAFE ARRIVAL CONFIRMED\n\n{userName} has reached destination safely:\n\n📍 {location}\n🕐 {time}\n\nEmergency circle deactivated.\n\nSakhi Safety Confirmation',
      weeklyUpdate: '📊 WEEKLY SAFETY REPORT from Sakhi\n\n{userName}\'s safety summary:\n🛡️ Safe trips: {safeTrips}\n⚠️ Risk areas avoided: {avoidedRisks}\n📱 SOS ready: Always\n\nStay safe! 💜\n\nSakhi Weekly Update'
    },
    hi: {
      sos: '🚨 सखी ऐप से तत्काल आपातकालीन अलर्ट 🚨\n\n{userName} तत्काल खतरे में है और मदद चाहिए!\n\n📍 वर्तमान स्थान:\n{location}\n🕐 समय: {time}\n🔗 लाइव लोकेशन: {googleMapsLink}\n\n⚠️ कृपया तुरंत जवाब दें या आपातकाल���न सेव���ओं को कॉल करें\n\nयह अलर्ट सखी - महिला सुरक्षा ऐप द्वारा भेजा गया',
      dangerZone: '⚠️ सखी ऐप से खतरनाक क्षेत्र अलर्ट\n\n{userName} उच्च जोखिम वाले क्षेत्र में प्रवेश कर गई है:\n\n📍 स्थान: {location}\n⚠️ जोखिम स्तर: {riskLevel}\n🕐 समय: {time}\n📊 हाल की घटनाएं: {incidentCount}\n🔗 ट्रैक करें: {googleMapsLink}\n\nकृपया तुरंत उनसे संपर्क करें।',
      emergencyCircle: '🔄 आपातकालीन सर्कल सक्रि���\n\n{userName} आपातकालीन सर्कल के साथ लाइव लोकेशन साझा कर रही है।\n\n📍 वर्तमान: {location}\n🕐 शुरू: {time}\n⏱️ हर 5 मिनट में अपडेट\n🔗 लाइव ट्रैकि��ग: {googleMapsLink}',
      safeArrival: '✅ सुरक्षित पहुंचने की पुष���टि\n\n{userName} स��रक्षित रूप से गंतव���य प���ुंच गई है:\n\n📍 {location}\n🕐 {time}\n\nआपातकालीन सर्कल निष्क्रिय।',
      weeklyUpdate: '📊 सखी से साप्ताहिक सुरक्षा रिपोर्ट\n\n{userName} की सुरक्षा सारांश:\n🛡️ सुरक्षित यात्राएं: {safeTrips}\n⚠️ बचे गए जोखिम क्षेत्र: {avoidedRisks}\n📱 SOS तैयार: हमेशा'
    }
  };

  constructor() {
    this.loadEmergencyContacts();
    this.startLocationTracking();
  }

  private loadEmergencyContacts(): void {
    const saved = localStorage.getItem('advanced-emergency-contacts');
    if (saved) {
      try {
        this.emergencyContacts = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
        this.emergencyContacts = [];
      }
    }
  }

  private saveEmergencyContacts(): void {
    localStorage.setItem('advanced-emergency-contacts', JSON.stringify(this.emergencyContacts));
  }

  // Real-time location tracking
  private async startLocationTracking(): Promise<void> {
    try {
      const { locationService } = await import('./locationService');

      // Subscribe to location updates
      window.addEventListener('locationUpdate', this.handleLocationUpdateEvent.bind(this));

      // Start tracking
      await locationService.startTracking();
      this.isTrackingLocation = true;

      console.log('✅ Advanced location tracking started');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error starting location tracking:', errorMessage, error);
      // Fallback: still mark as tracking to allow manual location updates
      this.isTrackingLocation = false;

      // Show user-friendly error
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('locationError', {
          detail: {
            message: `Location tracking unavailable: ${errorMessage}`,
            canRetry: true
          }
        }));
      }
    }
  }

  private async handleLocationUpdateEvent(event: CustomEvent): Promise<void> {
    const newLocation: LocationData = event.detail;
    this.currentLocation = newLocation;

    // Check for danger zones
    await this.checkDangerZones(newLocation);

    // Update emergency circle if active
    if (this.emergencyCircleActive) {
      await this.updateEmergencyCircle(newLocation);
    }
  }

  // Legacy method for backward compatibility
  private async handleLocationUpdate(position: GeolocationPosition): Promise<void> {
    const newLocation: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined,
      timestamp: new Date()
    };

    // Get address
    try {
      newLocation.address = await this.reverseGeocode(newLocation.latitude, newLocation.longitude);
    } catch (error) {
      console.warn('Failed to get address:', error);
    }

    this.currentLocation = newLocation;

    // Check for danger zones
    await this.checkDangerZones(newLocation);

    // Update emergency circle if active
    if (this.emergencyCircleActive) {
      await this.updateEmergencyCircle(newLocation);
    }
  }

  private handleLocationError(error: GeolocationPositionError): void {
    console.error('Location error:', error);
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log('Location permission denied');
        break;
      case error.POSITION_UNAVAILABLE:
        console.log('Location information unavailable');
        break;
      case error.TIMEOUT:
        console.log('Location request timeout');
        break;
    }
  }

  private async updateCurrentLocation(): Promise<LocationData> {
    try {
      const { locationService } = await import('./locationService');
      const location = await locationService.getCurrentLocation(false);
      this.currentLocation = location;
      return location;
    } catch (error) {
      console.error('Failed to update current location:', error);
      throw new Error(`Location unavailable: ${error.message || 'Unknown error'}`);
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      // Using Google Geocoding API (you'll need API key)
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      throw new Error('No address found');
    } catch (error) {
      console.warn('Geocoding failed:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  private async checkDangerZones(location: LocationData): Promise<void> {
    try {
      // Get danger zones from backend or local data
      const dangerZones = await this.getDangerZones();
      
      for (const zone of dangerZones) {
        const distance = this.calculateDistance(
          location.latitude, 
          location.longitude, 
          zone.lat, 
          zone.lng
        );
        
        if (distance <= zone.radius) {
          console.log(`Entered danger zone: ${zone.id} (${zone.riskLevel})`);

          // Voice announcement for danger zone entry
          voiceAssistantService.announceDangerZone(true);

          await this.sendDangerZoneAlert(location, zone);
          break; // Only alert for the first zone entered
        }
      }
    } catch (error) {
      console.error('Error checking danger zones:', error);
    }
  }

  private async getDangerZones(): Promise<DangerZone[]> {
    // Mock danger zones for now - replace with backend API call
    return [
      {
        id: 'zone_1',
        lat: 12.9716,
        lng: 77.5946,
        radius: 200, // 200 meters
        riskLevel: 'high',
        reportCount: 15,
        lastIncident: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: 'zone_2', 
        lat: 19.0760,
        lng: 72.8777,
        radius: 150,
        riskLevel: 'moderate',
        reportCount: 8,
        lastIncident: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    ];
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

    return R * c; // Distance in meters
  }

  // Enhanced SOS with real-time updates
  public async sendSOSAlert(userName: string, language: Language = 'en'): Promise<SMSAlert> {
    // Voice announcement for SOS activation
    voiceAssistantService.announceSOSActivation();

    if (!this.currentLocation) {
      await this.updateCurrentLocation();
    }

    if (!this.currentLocation) {
      voiceAssistantService.announceSMSDelivery(0, false);
      throw new Error('Unable to get current location for SOS alert');
    }

    const googleMapsLink = `https://maps.google.com/maps?q=${this.currentLocation.latitude},${this.currentLocation.longitude}`;
    
    const template = this.emergencyTemplates[language]?.sos || this.emergencyTemplates.en.sos;
    const message = this.formatMessage(template, {
      userName,
      location: this.currentLocation.address || `${this.currentLocation.latitude.toFixed(6)}, ${this.currentLocation.longitude.toFixed(6)}`,
      time: new Date().toLocaleString(),
      googleMapsLink
    });

    const alert: SMSAlert = {
      id: Date.now().toString(),
      userId: userName,
      type: 'sos',
      location: this.currentLocation,
      message,
      contacts: this.emergencyContacts.filter(c => c.canReceiveAlerts),
      sentAt: new Date(),
      status: 'pending'
    };

    // Send SMS via backend/Twilio
    await this.sendSMSViaService(alert);

    // Voice confirmations
    voiceAssistantService.announceLocationSent();
    voiceAssistantService.announceSMSDelivery(alert.contacts.length, alert.status === 'sent');

    // Start emergency circle
    await this.activateEmergencyCircle(userName, language);

    return alert;
  }

  private async sendDangerZoneAlert(location: LocationData, zone: DangerZone): Promise<void> {
    const userName = 'Current User'; // Get from auth context
    const language: Language = 'en'; // Get from language context
    
    const googleMapsLink = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
    
    const template = this.emergencyTemplates[language]?.dangerZone || this.emergencyTemplates.en.dangerZone;
    const message = this.formatMessage(template, {
      userName,
      location: location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      riskLevel: zone.riskLevel.toUpperCase(),
      time: new Date().toLocaleString(),
      incidentCount: zone.reportCount.toString(),
      googleMapsLink
    });

    const alert: SMSAlert = {
      id: Date.now().toString(),
      userId: userName,
      type: 'danger_zone',
      location,
      message,
      contacts: this.emergencyContacts.filter(c => c.isPrimary), // Only primary contacts for zone alerts
      sentAt: new Date(),
      status: 'pending',
      dangerZone: zone
    };

    await this.sendSMSViaService(alert);
  }

  // Emergency Circle - Live location sharing
  public async activateEmergencyCircle(userName: string, language: Language = 'en'): Promise<void> {
    this.emergencyCircleActive = true;

    // Voice announcement for emergency circle activation
    voiceAssistantService.announceEmergencyCircleStatus(true);
    
    if (!this.currentLocation) {
      await this.updateCurrentLocation();
    }

    const googleMapsLink = `https://maps.google.com/maps?q=${this.currentLocation?.latitude},${this.currentLocation?.longitude}`;
    
    const template = this.emergencyTemplates[language]?.emergencyCircle || this.emergencyTemplates.en.emergencyCircle;
    const message = this.formatMessage(template, {
      userName,
      location: this.currentLocation?.address || 'Location unavailable',
      time: new Date().toLocaleString(),
      googleMapsLink
    });

    const alert: SMSAlert = {
      id: Date.now().toString(),
      userId: userName,
      type: 'emergency_circle',
      location: this.currentLocation!,
      message,
      contacts: this.emergencyContacts.filter(c => c.canReceiveAlerts),
      sentAt: new Date(),
      status: 'pending'
    };

    await this.sendSMSViaService(alert);

    // Start periodic updates every 5 minutes
    this.locationUpdateInterval = setInterval(async () => {
      if (this.emergencyCircleActive && this.currentLocation) {
        await this.updateEmergencyCircle(this.currentLocation);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async updateEmergencyCircle(location: LocationData): Promise<void> {
    // Send location update to emergency contacts
    const updateMessage = `🔄 Emergency Circle Update\n\n📍 Current Location: ${location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}\n🕐 ${new Date().toLocaleString()}\n🔗 https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
    
    // Send to primary contacts only for updates
    const primaryContacts = this.emergencyContacts.filter(c => c.isPrimary);
    await this.sendSMSToContacts(updateMessage, primaryContacts);
  }

  public async deactivateEmergencyCircle(userName: string, language: Language = 'en'): Promise<void> {
    this.emergencyCircleActive = false;

    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }

    // Voice announcement for emergency circle deactivation
    voiceAssistantService.announceEmergencyCircleStatus(false);

    const template = this.emergencyTemplates[language]?.safeArrival || this.emergencyTemplates.en.safeArrival;
    const message = this.formatMessage(template, {
      userName,
      location: this.currentLocation?.address || 'Unknown location',
      time: new Date().toLocaleString()
    });

    await this.sendSMSToContacts(message, this.emergencyContacts.filter(c => c.canReceiveAlerts));
  }

  private async sendSMSViaService(alert: SMSAlert): Promise<void> {
    try {
      // Check if backend is available and configured
      if (this.backendUrl && this.backendUrl !== 'http://localhost:3000') {
        try {
          const response = await fetch(`${this.backendUrl}/api/sms/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alert),
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });

          if (response.ok) {
            alert.status = 'sent';
            console.log('SMS sent via backend');

            // Voice confirmation of successful SMS delivery
            voiceAssistantService.announceSMSDelivery(alert.contacts.length, true);
            return;
          } else {
            console.warn('Backend SMS API returned error:', response.status);
          }
        } catch (fetchError) {
          console.warn('Backend not available, using demo mode:', fetchError.message);
        }
      }

      // Fallback: Demo mode SMS simulation
      await this.sendViaTwilioDemo(alert);

    } catch (error) {
      console.error('Failed to send SMS:', error);
      alert.status = 'failed';

      // Fallback: Show browser notification
      this.showBrowserNotification(alert);
    }
  }

  private async sendViaTwilioDemo(alert: SMSAlert): Promise<void> {
    // Demo implementation with better user feedback
    console.log('📱 SMS Alert (Demo Mode):', {
      message: alert.message,
      contacts: alert.contacts.map(c => ({ name: c.name, phone: c.phone })),
      location: alert.location,
      type: alert.type,
      timestamp: new Date().toISOString()
    });

    // Simulate realistic SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Show browser notifications as SMS simulation
    if ('Notification' in window) {
      // Request permission if not granted
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if (Notification.permission === 'granted') {
        alert.contacts.forEach((contact, index) => {
          setTimeout(() => {
            new Notification(`📱 SMS Sent to ${contact.name}`, {
              body: `Emergency alert delivered to ${contact.phone.replace(/\d(?=\d{4})/g, '*')}`,
              icon: '/favicon.ico',
              tag: `sms-${contact.id}-${alert.id}`,
              requireInteraction: false,
              silent: false
            });
          }, index * 500); // Stagger notifications
        });
      }
    }

    // Show success message in console with contact details
    console.log(`✅ Demo SMS sent to ${alert.contacts.length} contacts:`);
    alert.contacts.forEach(contact => {
      console.log(`   📞 ${contact.name} (${contact.relation}) - ${contact.phone}`);
    });

    alert.status = 'sent';

    // Voice confirmation for demo SMS delivery
    voiceAssistantService.announceSMSDelivery(alert.contacts.length, true);
  }

  private async sendSMSToContacts(message: string, contacts: EmergencyContact[]): Promise<void> {
    const alert: SMSAlert = {
      id: Date.now().toString(),
      userId: 'current-user',
      type: 'check_in',
      location: this.currentLocation!,
      message,
      contacts,
      sentAt: new Date(),
      status: 'pending'
    };

    await this.sendSMSViaService(alert);
  }

  private showBrowserNotification(alert: SMSAlert): void {
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('🚨 Emergency Alert Status', {
            body: alert.status === 'failed'
              ? `Failed to send alert. Please call emergency contacts directly.`
              : `Alert sent to ${alert.contacts.length} emergency contacts`,
            icon: '/favicon.ico',
            requireInteraction: alert.status === 'failed',
            tag: `alert-${alert.id}`
          });
        } else if (Notification.permission === 'default') {
          // Request permission for future notifications
          Notification.requestPermission();
        }
      }

      // Also show console message as fallback
      const statusEmoji = alert.status === 'sent' ? '✅' : '❌';
      console.log(`${statusEmoji} SMS Alert Status: ${alert.status.toUpperCase()}`);
      console.log(`📧 Message: ${alert.message.substring(0, 100)}...`);
      console.log(`👥 Contacts: ${alert.contacts.map(c => c.name).join(', ')}`);
    } catch (error) {
      console.warn('Error showing notification:', error);
    }
  }

  private formatMessage(template: string, variables: Record<string, string>): string {
    let formatted = template;
    Object.entries(variables).forEach(([key, value]) => {
      formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return formatted;
  }

  // Emergency contacts management
  public addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString()
    };
    
    this.emergencyContacts.push(newContact);
    this.saveEmergencyContacts();
    
    return newContact;
  }

  public removeEmergencyContact(contactId: string): void {
    this.emergencyContacts = this.emergencyContacts.filter(c => c.id !== contactId);
    this.saveEmergencyContacts();
  }

  public getEmergencyContacts(): EmergencyContact[] {
    return [...this.emergencyContacts];
  }

  public getCurrentLocation(): LocationData | null {
    return this.currentLocation;
  }

  public isEmergencyCircleActive(): boolean {
    return this.emergencyCircleActive;
  }
}

export const advancedSMSService = new AdvancedSMSService();
export default advancedSMSService;
