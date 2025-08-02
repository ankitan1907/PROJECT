import { Language } from '@shared/types';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp: Date;
}

interface EmergencyAlert {
  id: string;
  userId: string;
  location: LocationData;
  message: string;
  timestamp: Date;
  contacts: EmergencyContact[];
  language: Language;
  severity: 'low' | 'medium' | 'high' | 'emergency';
}

class SMSService {
  private emergencyContacts: EmergencyContact[] = [];
  private currentLocation: LocationData | null = null;

  // Emergency message templates in different languages
  private emergencyTemplates: Record<Language, Record<string, string>> = {
    en: {
      sos: '🚨 EMERGENCY ALERT from Sakhi App 🚨\n\n{userName} needs immediate help!\n\nLocation: {location}\nTime: {time}\n\nPlease contact them immediately or call emergency services.\n\nSent via Sakhi - Women Safety App',
      safetyAlert: '⚠️ Safety Alert from Sakhi App\n\n{userName} is in an unsafe area.\n\nLocation: {location}\nTime: {time}\n\nPlease check on them.\n\nSent via Sakhi - Women Safety App',
      checkIn: 'ℹ️ Check-in from Sakhi App\n\n{userName} has reached their destination safely.\n\nLocation: {location}\nTime: {time}\n\nSent via Sakhi - Women Safety App',
      lowBattery: '🔋 Low Battery Alert from Sakhi App\n\n{userName}\'s phone battery is low (below 15%).\n\nLast known location: {location}\nTime: {time}\n\nSent via Sakhi - Women Safety App'
    },
    hi: {
      sos: '🚨 सखी ऐप से आपातकालीन अलर्ट 🚨\n\n{userName} को तत्काल सहायता चाहिए!\n\nस्थान: {location}\nसमय: {time}\n\nकृपया तुरंत उनसे ���ंपर्क करें या आपातकालीन सेवाओं को कॉल करें।\n\nसखी - महिला सुरक्षा ऐप द्वारा भेजा गया',
      safetyAlert: '⚠️ सखी ऐप से सुरक्षा अलर्ट\n\n{userName} असुरक्षित क्षेत्र में है।\n\nस्थान: {location}\nसमय: {time}\n\nकृपया उनकी जांच करें।\n\nसखी - महिला सुरक्षा ऐप द्वारा भेजा गया',
      checkIn: 'ℹ️ सखी ऐप से चेक-इन\n\n{userName} सुरक्षित रूप से अपने गंतव्य पर पहुंच गए हैं।\n\nस्थान: {location}\nसमय: {time}\n\nसखी - महिला सुरक्षा ऐप द्वारा भेजा गया',
      lowBattery: '🔋 सखी ऐप से कम बैटरी अलर्ट\n\n{userName} के फोन की बैटरी कम है (15% से कम)।\n\nअंतिम ज्ञात स्थान: {location}\nसमय: {time}\n\nसखी - महिला सुरक्षा ऐप द्वारा भेजा गय���'
    },
    kn: {
      sos: '🚨 ಸಖಿ ಆ್ಯಪ್‌ನಿಂದ ತುರ್ತು ಎಚ್ಚರಿಕೆ 🚨\n\n{userName} ಗೆ ತಕ್ಷಣದ ಸಹಾಯ ಬೇಕು!\n\nಸ್ಥಳ: {location}\nಸಮಯ: {time}\n\nದಯವಿಟ್ಟು ತಕ್ಷಣ ���ವರನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ತುರ್ತು ಸೇವೆಗಳಿಗೆ ಕರೆ ಮಾಡಿ।\n\nಸಖಿ - ಮಹಿಳಾ ಸುರಕ್ಷತಾ ಆ್ಯಪ್ ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ',
      safetyAlert: '⚠️ ಸಖಿ ಆ್ಯಪ್‌ನಿಂದ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ\n\n{userName} ಅಸುರಕ್ಷಿತ ಪ್ರದೇಶದಲ್ಲಿದ್ದಾರೆ।\n\nಸ್ಥಳ: {location}\nಸಮಯ: {time}\n\nದಯವಿಟ್ಟು ಅವರನ್ನು ಪರಿಶೀಲಿಸಿ।\n\nಸಖಿ - ಮಹಿಳಾ ಸುರಕ್ಷತಾ ಆ್ಯಪ್ ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ',
      checkIn: 'ℹ️ ಸಖಿ ಆ್ಯಪ್‌ನಿಂದ ಚೆಕ್-ಇನ್\n\n{userName} ಸುರಕ್ಷಿತವಾಗಿ ತಮ್ಮ ಗಮ್ಯಸ್ಥಾನವನ್ನು ತಲುಪಿದ್ದಾರೆ।\n\nಸ್ಥಳ: {location}\nಸಮಯ: {time}\n\nಸಖಿ - ಮ���ಿಳಾ ಸುರಕ್ಷತಾ ಆ್ಯಪ್ ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ',
      lowBattery: '🔋 ಸಖಿ ಆ್ಯಪ್‌ನಿಂದ ಕಡಿಮೆ ಬ್ಯಾಟರಿ ಎಚ್ಚರಿಕೆ\n\n{userName} ಅವರ ಫೋನ್ ಬ್ಯಾಟರಿ ಕಡ��ಮೆಯಾಗಿದೆ (15% ಕಿಂತ ಕಡಿಮೆ)।\n\nಕೊನೆಯ ತಿಳಿದಿರುವ ಸ್ಥಳ: {location}\nಸಮಯ: {time}\n\nಸಖಿ - ಮಹಿಳಾ ಸುರಕ್ಷತಾ ಆ್ಯಪ್ ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ'
    },
    ta: {
      sos: '🚨 சகி ஆப்பிலிருந்து அவசர எச்சரிக்கை 🚨\n\n{userName} உடனடி உதவி தேவை!\n\nஇடம்: {location}\nநேரம்: {time}\n\nதயவு செய்து உடனடியாக அவர்களைத் தொடர்பு கொள்ளவும் அல்லது அவசர சேவைகளை அழைக்கவும்।\n\nசகி - பெண்கள் பாதுகாப்பு ஆப் மூலம் அனுப்பப்பட்டது',
      safetyAlert: '⚠️ சகி ஆப்பிலிருந்து பாதுகாப்பு எச்சரிக்க���\n\n{userName} பாதுகாப்பற்ற பகுதியில் உள்ளார்.\n\nஇடம்: {location}\nநேரம்: {time}\n\nதயவு செய்து அவர்களைச் சரிபார்க்கவும்।\n\nசகி - பெண்கள் பாதுகாப்பு ஆப் மூலம் அனுப்பப்பட்டது',
      checkIn: 'ℹ️ சகி ஆப்பிலிருந்து செக்-இன்\n\n{userName} பாதுகாப்பாக தங்கள் இலக்கை அடைந்துள்ளார்.\n\nஇடம்: {location}\nநேரம்: {time}\n\nசகி - பெண்கள் பாதுகாப்பு ஆப் மூலம் அனுப்பப்பட்டது',
      lowBattery: '🔋 சகி ஆப்பிலிருந்து குறைந்த பேட்டரி எச்சரிக்கை\n\n{userName} இன் தொலைபேசி பேட்டரி குறைவாக உள்ளது (15% க்கும் குறைவாக).\n\nகடைசியாக தெரிந்த இடம்: {location}\nநேரம்: {time}\n\nசகி - பெண்கள் பாதுகாப்பு ஆப் மூலம��� அனுப்பப்பட்டது'
    },
    te: {
      sos: '🚨 సఖి యాప్ నుండి అత్యవసర హెచ్చరిక 🚨\n\n{userName} కు తక్షణ సహాయం అవసరం!\n\nస్థానం: {location}\nసమయం: {time}\n\nదయచేసి వెంటనే వారిని సంప్రదించండి లేదా అత్యవసర సేవలకు కాల్ చేయండి।\n\nసఖి - మహిళా భద్రతా యాప్ ద్వారా పంపబడింది',
      safetyAlert: '⚠️ సఖి యాప్ నుండి భద్రతా హెచ్చరిక\n\n{userName} అసురక్షిత ప్రాంతంలో ఉన్నారు.\n\nస్థానం: {location}\nసమయం: {time}\n\nదయచేసి వారిని తనిఖీ చేయండి.\n\nసఖి - మహిళా భద్రతా యాప్ ద్వారా పంపబడింది',
      checkIn: 'ℹ️ సఖి యాప్ నుండి చెక్-ఇన్\n\n{userName} సురక్షితంగా వారి గమ్యస్థానానికి చేరుకున్నారు.\n\nస్థానం: {location}\nసమయం: {time}\n\nసఖి - మహిళా భద్రతా యాప్ ద్వారా పంపబడింది',
      lowBattery: '🔋 సఖి యాప్ నుండి తక్కువ బ్యాటరీ హెచ్చరిక\n\n{userName} యొక్క ఫోన్ బ్��ాటరీ తక్కువగా ఉంది (15% కంటే తక్కువ).\n\nచివరిగా తెలిసిన స్థానం: {location}\nసమయం: {time}\n\nసఖి - మహిళా భద్రతా యాప్ ద్వారా పంపబడింది'
    }
  };

  constructor() {
    this.loadEmergencyContacts();
    this.initializeLocationTracking();
  }

  private loadEmergencyContacts(): void {
    const saved = localStorage.getItem('emergency-contacts');
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
    localStorage.setItem('emergency-contacts', JSON.stringify(this.emergencyContacts));
  }

  private async initializeLocationTracking(): Promise<void> {
    try {
      const { locationService } = await import('./locationService');
      const location = await locationService.getCurrentLocation(false);
      this.currentLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        address: location.address
      };
      console.log('✅ SMS Service location initialized');
    } catch (error) {
      console.error('Error getting location:', error);
      // Don't throw - allow service to continue without location
    }
  }

  private async getCurrentPosition(): Promise<GeolocationPosition> {
    try {
      const { locationService } = await import('./locationService');
      const location = await locationService.getCurrentLocation(false);

      // Convert to GeolocationPosition format for backward compatibility
      return {
        coords: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: null,
          altitudeAccuracy: null,
          heading: location.heading || null,
          speed: location.speed || null
        },
        timestamp: location.timestamp.getTime()
      } as GeolocationPosition;
    } catch (error) {
      throw new Error(`Location error: ${error.message || 'Unknown error'}`);
    }
  }

  private async reverseGeocode(location: LocationData): Promise<void> {
    // In a real app, you would use a geocoding service like Google Maps API
    // For demo purposes, we'll create a mock address based on Indian cities
    const mockAddresses = [
      'Koramangala, Bangalore, Karnataka, India',
      'Bandra West, Mumbai, Maharashtra, India', 
      'Connaught Place, New Delhi, India',
      'Anna Nagar, Chennai, Tamil Nadu, India',
      'Hitech City, Hyderabad, Telangana, India'
    ];
    
    location.address = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
  }

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

  public async sendSOSAlert(userName: string, language: Language = 'en'): Promise<EmergencyAlert> {
    // Update current location
    try {
      const position = await this.getCurrentPosition();
      this.currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
      };
      await this.reverseGeocode(this.currentLocation);
    } catch (error) {
      console.error('Could not get current location for SOS:', error);
    }

    if (!this.currentLocation) {
      throw new Error('Location not available for emergency alert');
    }

    const template = this.emergencyTemplates[language]?.sos || this.emergencyTemplates.en.sos;
    const message = this.formatMessage(template, {
      userName,
      location: this.currentLocation.address || `${this.currentLocation.latitude.toFixed(6)}, ${this.currentLocation.longitude.toFixed(6)}`,
      time: new Date().toLocaleString()
    });

    const alert: EmergencyAlert = {
      id: Date.now().toString(),
      userId: userName,
      location: this.currentLocation,
      message,
      timestamp: new Date(),
      contacts: [...this.emergencyContacts],
      language,
      severity: 'emergency'
    };

    // Send SMS to all emergency contacts
    await this.sendSMSToContacts(message, this.emergencyContacts);

    // Store alert for tracking
    this.storeAlert(alert);

    return alert;
  }

  public async sendSafetyAlert(userName: string, reason: string, language: Language = 'en'): Promise<EmergencyAlert> {
    if (!this.currentLocation) {
      await this.initializeLocationTracking();
    }

    if (!this.currentLocation) {
      throw new Error('Location not available for safety alert');
    }

    const template = this.emergencyTemplates[language]?.safetyAlert || this.emergencyTemplates.en.safetyAlert;
    const message = this.formatMessage(template, {
      userName,
      location: this.currentLocation.address || `${this.currentLocation.latitude.toFixed(6)}, ${this.currentLocation.longitude.toFixed(6)}`,
      time: new Date().toLocaleString()
    });

    const alert: EmergencyAlert = {
      id: Date.now().toString(),
      userId: userName,
      location: this.currentLocation,
      message,
      timestamp: new Date(),
      contacts: this.emergencyContacts.filter(c => c.isPrimary), // Only primary contacts for safety alerts
      language,
      severity: 'high'
    };

    await this.sendSMSToContacts(message, alert.contacts);
    this.storeAlert(alert);

    return alert;
  }

  public async sendCheckIn(userName: string, language: Language = 'en'): Promise<EmergencyAlert> {
    if (!this.currentLocation) {
      await this.initializeLocationTracking();
    }

    if (!this.currentLocation) {
      throw new Error('Location not available for check-in');
    }

    const template = this.emergencyTemplates[language]?.checkIn || this.emergencyTemplates.en.checkIn;
    const message = this.formatMessage(template, {
      userName,
      location: this.currentLocation.address || `${this.currentLocation.latitude.toFixed(6)}, ${this.currentLocation.longitude.toFixed(6)}`,
      time: new Date().toLocaleString()
    });

    const alert: EmergencyAlert = {
      id: Date.now().toString(),
      userId: userName,
      location: this.currentLocation,
      message,
      timestamp: new Date(),
      contacts: this.emergencyContacts.filter(c => c.isPrimary), // Only primary contacts for check-ins
      language,
      severity: 'low'
    };

    await this.sendSMSToContacts(message, alert.contacts);
    this.storeAlert(alert);

    return alert;
  }

  private formatMessage(template: string, variables: Record<string, string>): string {
    let formatted = template;
    Object.entries(variables).forEach(([key, value]) => {
      formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return formatted;
  }

  private async sendSMSToContacts(message: string, contacts: EmergencyContact[]): Promise<void> {
    // In a real application, this would integrate with an SMS service like Twilio
    // For demo purposes, we'll simulate SMS sending
    
    console.log('📱 Sending SMS to emergency contacts:');
    console.log('Message:', message);
    console.log('Contacts:', contacts.map(c => `${c.name} (${c.phone})`));

    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show browser notification as SMS simulation
    if ('Notification' in window && Notification.permission === 'granted') {
      contacts.forEach(contact => {
        new Notification(`SMS sent to ${contact.name}`, {
          body: `Emergency message sent to ${contact.phone}`,
          icon: '/favicon.ico',
          tag: `sms-${contact.id}`
        });
      });
    }

    // Store sent messages for tracking
    const sentMessages = {
      timestamp: new Date().toISOString(),
      message,
      contacts: contacts.map(c => ({ name: c.name, phone: c.phone }))
    };
    
    const existing = JSON.parse(localStorage.getItem('sent-sms') || '[]');
    existing.unshift(sentMessages);
    // Keep only last 50 messages
    if (existing.length > 50) {
      existing.splice(50);
    }
    localStorage.setItem('sent-sms', JSON.stringify(existing));
  }

  private storeAlert(alert: EmergencyAlert): void {
    const existing = JSON.parse(localStorage.getItem('emergency-alerts') || '[]');
    existing.unshift(alert);
    // Keep only last 100 alerts
    if (existing.length > 100) {
      existing.splice(100);
    }
    localStorage.setItem('emergency-alerts', JSON.stringify(existing));
  }

  public getAlertHistory(): EmergencyAlert[] {
    const alerts = JSON.parse(localStorage.getItem('emergency-alerts') || '[]');
    return alerts.map((alert: any) => ({
      ...alert,
      timestamp: new Date(alert.timestamp),
      location: {
        ...alert.location,
        timestamp: new Date(alert.location.timestamp)
      }
    }));
  }

  public getSentSMSHistory(): any[] {
    return JSON.parse(localStorage.getItem('sent-sms') || '[]');
  }

  // Request notification permission for SMS simulation
  public async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  // Monitor battery level for low battery alerts
  public initializeBatteryMonitoring(userName: string, language: Language = 'en'): void {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const checkBattery = () => {
          if (battery.level < 0.15 && !battery.charging) {
            this.sendLowBatteryAlert(userName, language);
          }
        };

        battery.addEventListener('levelchange', checkBattery);
        battery.addEventListener('chargingchange', checkBattery);
        checkBattery(); // Initial check
      });
    }
  }

  private async sendLowBatteryAlert(userName: string, language: Language): Promise<void> {
    // Only send once per session to avoid spam
    const lastAlert = localStorage.getItem('last-battery-alert');
    const now = Date.now();
    if (lastAlert && now - parseInt(lastAlert) < 3600000) { // 1 hour
      return;
    }

    if (!this.currentLocation) {
      await this.initializeLocationTracking();
    }

    const template = this.emergencyTemplates[language]?.lowBattery || this.emergencyTemplates.en.lowBattery;
    const message = this.formatMessage(template, {
      userName,
      location: this.currentLocation?.address || 'Location unavailable',
      time: new Date().toLocaleString()
    });

    await this.sendSMSToContacts(message, this.emergencyContacts.filter(c => c.isPrimary));
    localStorage.setItem('last-battery-alert', now.toString());
  }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;
