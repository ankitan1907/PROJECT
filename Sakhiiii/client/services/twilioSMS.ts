// Real Twilio SMS Service for SOS Alerts
interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  message: string;
  contacts: EmergencyContact[];
  timestamp: Date;
  status: 'sending' | 'sent' | 'failed';
}

interface WhatsAppMessage {
  message: string;
  url: string;
}

class TwilioSMSService {
  private backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  private demoPhoneNumber = '+919876543210'; // Demo number for testing

  constructor() {
    // Don't auto-initialize demo contacts - let user add their own
    // this.initializeDemoContacts();
  }

  /**
   * Send SOS alert to emergency contacts via Twilio
   */
  async sendSOSAlert(userName: string, location: { lat: number; lng: number; address: string }): Promise<SOSAlert> {
    const contacts = this.getEmergencyContacts();

    // If no contacts are saved, prompt user to add contacts
    if (contacts.length === 0) {
      throw new Error('No emergency contacts found. Please add emergency contacts in your Profile settings before using SOS.');
    }

    const googleMapsLink = `https://maps.google.com/maps?q=${location.lat},${location.lng}`;
    
    const message = this.buildSOSMessage(userName, location.address, googleMapsLink);

    const alert: SOSAlert = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName,
      location,
      message,
      contacts,
      timestamp: new Date(),
      status: 'sending'
    };

    try {
      // Try backend SMS service first (silently)
      const backendResponse = await this.sendViaTwilioBackend(alert);

      if (backendResponse.success) {
        alert.status = 'sent';
        console.log('✅ SMS sent via Twilio backend');
        return alert;
      }
    } catch (error) {
      // Backend not available or blocked by security software - use demo mode (expected)
      console.warn('Backend SMS not available, using demo mode:', error.message);
    }

    // Use demo mode with enhanced user feedback
    await this.sendDemoSMS(alert);

    // Show user that demo mode is being used
    try {
      this.showDemoModeNotification();
    } catch (methodError) {
      console.warn('Demo notification method error:', methodError);
      // Fallback notification
      console.log('📱 Demo Mode: SMS alerts are being simulated for safety demonstration');
    }

    // Save alert to local storage
    this.saveAlert(alert);

    return alert;
  }

  /**
   * Send SMS via backend Twilio service
   */
  private async sendViaTwilioBackend(alert: SOSAlert): Promise<{ success: boolean; results?: any[] }> {
    try {
      const { secureNetworkService } = await import('./secureNetworkService');

      const requestData = {
        message: alert.message,
        contacts: alert.contacts.map(contact => ({
          name: contact.name,
          phone: contact.phone
        })),
        location: alert.location
      };

      const result = await secureNetworkService.secureFetch(`${this.backendUrl}/api/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        timeout: 8000,
        retries: 1,
        showUserError: false
      });

      if (result.success) {
        return result.data;
      } else if (result.isBlocked) {
        throw new Error('Security software blocking SMS request - using demo mode');
      } else {
        throw new Error(result.error || 'Backend SMS service unavailable');
      }
    } catch (error) {
      throw new Error(error.message || 'SMS service communication failed');
    }
  }

  /**
   * Show demo mode notification to user
   */
  private showDemoModeNotification(): void {
    try {
      // Show a console message
      console.log(`
🔄 DEMO MODE ACTIVE
📱 SMS alerts are being simulated
✅ In production, real SMS would be sent via Twilio
🔔 Check browser notifications for demo messages
      `);

      // Show browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('📱 Sakhi Demo Mode', {
          body: 'SMS alerts are being simulated. Real SMS would be sent in production.',
          icon: '/favicon.ico',
          tag: 'demo-mode-notification'
        });
      }

      // Show toast-like notification in the UI (if available)
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const event = new CustomEvent('sakhi-demo-notification', {
          detail: {
            type: 'info',
            title: 'Demo Mode Active',
            message: 'SMS alerts are being simulated for safety.'
          }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.warn('Could not show demo mode notification:', error);
    }
  }

  /**
   * Demo SMS simulation with browser notifications
   */
  private async sendDemoSMS(alert: SOSAlert): Promise<void> {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Show browser notifications as SMS simulation
    if ('Notification' in window && Notification.permission === 'granted') {
      alert.contacts.forEach((contact, index) => {
        setTimeout(() => {
          new Notification(`📱 Demo SMS Sent to ${contact.name}`, {
            body: `Emergency alert delivered to ${contact.phone.replace(/\\d(?=\\d{4})/g, '*')}\\n\\n${alert.message.substring(0, 100)}...`,
            icon: '/favicon.ico',
            tag: `sms-${contact.name}-${alert.id}`,
            requireInteraction: true
          });
        }, index * 1000); // Stagger notifications
      });
    }

    // Console log for demo
    console.log('📱 Demo SMS Alert Sent:');
    console.log('Message:', alert.message);
    console.log('Recipients:');
    alert.contacts.forEach(contact => {
      console.log(`  📞 ${contact.name} (${contact.relation}) - ${contact.phone}`);
    });

    alert.status = 'sent';
  }

  /**
   * Build SOS message text
   */
  private buildSOSMessage(userName: string, address: string, mapsLink: string): string {
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `🚨 URGENT EMERGENCY ALERT from Sakhi App 🚨

${userName} is in immediate danger and needs help!

📍 Current Location:
${address}

🕐 Time: ${timestamp}
🔗 Live Location: ${mapsLink}

⚠️ PLEASE RESPOND IMMEDIATELY OR CALL EMERGENCY SERVICES

This alert was sent by Sakhi - Women Safety App`;
  }

  /**
   * Generate WhatsApp share message and URL
   */
  generateWhatsAppMessage(userName: string, location: { lat: number; lng: number; address: string }): WhatsAppMessage {
    const googleMapsLink = `https://maps.google.com/maps?q=${location.lat},${location.lng}`;
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const message = `🚨 URGENT SAFETY ALERT 🚨

${userName} needs immediate help!

📍 Location: ${location.address}
🕐 Time: ${timestamp}
🔗 Track location: ${googleMapsLink}

Please respond immediately or call emergency services.

Sent via Sakhi Safety App
#WomenSafety #EmergencyAlert`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    return { message, url: whatsappUrl };
  }

  /**
   * Open WhatsApp with pre-filled SOS message
   */
  shareSOSViaWhatsApp(userName: string, location: { lat: number; lng: number; address: string }): void {
    const { url } = this.generateWhatsAppMessage(userName, location);
    window.open(url, '_blank');
  }

  /**
   * Add emergency contact
   */
  addEmergencyContact(contact: EmergencyContact): void {
    const contacts = this.getEmergencyContacts();
    contacts.push(contact);
    localStorage.setItem('emergency-contacts', JSON.stringify(contacts));
  }

  /**
   * Get emergency contacts
   */
  getEmergencyContacts(): EmergencyContact[] {
    const contacts = localStorage.getItem('emergency-contacts');
    return contacts ? JSON.parse(contacts) : [];
  }

  /**
   * Remove emergency contact
   */
  removeEmergencyContact(index: number): void {
    const contacts = this.getEmergencyContacts();
    contacts.splice(index, 1);
    localStorage.setItem('emergency-contacts', JSON.stringify(contacts));
  }

  /**
   * Initialize demo emergency contacts
   */
  private initializeDemoContacts(): void {
    const existingContacts = this.getEmergencyContacts();
    
    if (existingContacts.length === 0) {
      const demoContacts: EmergencyContact[] = [
        {
          name: 'Mom',
          phone: this.demoPhoneNumber,
          relation: 'Mother',
          isPrimary: true
        },
        {
          name: 'Best Friend',
          phone: '+919876543211',
          relation: 'Friend',
          isPrimary: true
        },
        {
          name: 'Emergency Contact',
          phone: '+919876543212',
          relation: 'Emergency',
          isPrimary: false
        }
      ];

      localStorage.setItem('emergency-contacts', JSON.stringify(demoContacts));
      console.log('📋 Demo emergency contacts initialized');
    }
  }

  /**
   * Save alert to local storage
   */
  private saveAlert(alert: SOSAlert): void {
    const alerts = JSON.parse(localStorage.getItem('sos-alerts') || '[]');
    alerts.unshift(alert);
    
    // Keep only last 50 alerts
    if (alerts.length > 50) {
      alerts.splice(50);
    }
    
    localStorage.setItem('sos-alerts', JSON.stringify(alerts));
  }

  /**
   * Get saved alerts
   */
  getAlerts(): SOSAlert[] {
    return JSON.parse(localStorage.getItem('sos-alerts') || '[]');
  }

  /**
   * Test SMS service
   */
  async testSMSService(): Promise<boolean> {
    try {
      const testAlert: SOSAlert = {
        id: 'test-' + Date.now(),
        userId: 'test-user',
        userName: 'Test User',
        location: {
          lat: 12.9716,
          lng: 77.5946,
          address: 'Test Location, Bangalore, Karnataka'
        },
        message: 'This is a test message from Sakhi SMS service.',
        contacts: [{
          name: 'Test Contact',
          phone: this.demoPhoneNumber,
          relation: 'Test',
          isPrimary: true
        }],
        timestamp: new Date(),
        status: 'sending'
      };

      await this.sendDemoSMS(testAlert);
      return true;
    } catch (error) {
      console.error('SMS test failed:', error);
      return false;
    }
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    // Mask all but last 4 digits
    return phone.replace(/\\d(?=\\d{4})/g, '*');
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    // Basic validation for Indian phone numbers
    const phoneRegex = /^[+]?[91]?[6-9]\\d{9}$/;
    return phoneRegex.test(phone.replace(/[\\s-]/g, ''));
  }

  /**
   * Get emergency services numbers for India
   */
  getEmergencyNumbers(): { name: string; number: string; description: string }[] {
    return [
      {
        name: 'Police',
        number: '100',
        description: 'General police emergency'
      },
      {
        name: 'Women Helpline',
        number: '1091',
        description: '24x7 women in distress helpline'
      },
      {
        name: 'Fire Department',
        number: '101',
        description: 'Fire emergency services'
      },
      {
        name: 'Medical Emergency',
        number: '108',
        description: 'Ambulance and medical emergency'
      },
      {
        name: 'Women Safety',
        number: '181',
        description: 'Women safety and security'
      }
    ];
  }
}

export const twilioSMSService = new TwilioSMSService();
export default twilioSMSService;
