// Enhanced Location Service with improved error handling
import { notificationService } from './notificationService';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
  address?: string;
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
  message: string;
  userMessage: string;
  canRetry: boolean;
}

class LocationService {
  private currentLocation: LocationData | null = null;
  private watchId: number | null = null;
  private isTracking: boolean = false;
  private permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
  private retryAttempts: number = 0;
  private maxRetryAttempts: number = 3;
  private lastError: LocationError | null = null;

  constructor() {
    this.checkPermissionStatus();
  }

  /**
   * Check if geolocation is supported and get permission status
   */
  private async checkPermissionStatus(): Promise<void> {
    if (!('geolocation' in navigator)) {
      this.lastError = {
        code: 'NOT_SUPPORTED',
        message: 'Geolocation not supported by browser',
        userMessage: 'Your browser does not support location services. Please update your browser or use a different one.',
        canRetry: false
      };
      return;
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        this.permissionStatus = permission.state;
        
        permission.addEventListener('change', () => {
          this.permissionStatus = permission.state;
          if (permission.state === 'granted' && this.retryAttempts > 0) {
            this.getCurrentLocation(); // Retry if permission was granted
          }
        });
      }
    } catch (error) {
      console.warn('Could not check geolocation permission:', error);
    }
  }

  /**
   * Get current location with improved error handling
   */
  public async getCurrentLocation(showUserNotification: boolean = true): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const error = this.createLocationError('NOT_SUPPORTED', 'Geolocation not supported');
        if (showUserNotification) this.showUserError(error);
        reject(error);
        return;
      }

      // Check if we have a recent location (less than 5 minutes old)
      if (this.currentLocation && 
          (Date.now() - this.currentLocation.timestamp.getTime()) < 5 * 60 * 1000) {
        resolve(this.currentLocation);
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 5 * 60 * 1000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        async (position: GeolocationPosition) => {
          try {
            const location: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed || undefined,
              heading: position.coords.heading || undefined,
              timestamp: new Date()
            };

            // Get address if possible
            try {
              location.address = await this.reverseGeocode(location);
            } catch (geoError) {
              console.warn('Reverse geocoding failed:', geoError);
              // Don't fail the whole operation for geocoding failures
            }

            this.currentLocation = location;
            this.retryAttempts = 0; // Reset retry count on success
            this.lastError = null;

            if (showUserNotification && this.retryAttempts > 0) {
              notificationService.addNotification({
                id: 'location-success',
                type: 'success',
                title: 'Location Found',
                message: 'Your location has been updated successfully.',
                priority: 'low'
              });
            }

            resolve(location);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error processing location:', errorMessage, error);
            const locationError = this.createLocationError('POSITION_UNAVAILABLE', `Error processing location data: ${errorMessage}`);
            if (showUserNotification) this.showUserError(locationError);
            reject(locationError);
          }
        },
        (error: GeolocationPositionError) => {
          const locationError = this.handleGeolocationError(error);
          
          // Retry logic for certain errors
          if (locationError.canRetry && this.retryAttempts < this.maxRetryAttempts) {
            this.retryAttempts++;
            console.log(`Retrying location request (attempt ${this.retryAttempts}/${this.maxRetryAttempts})`);
            
            setTimeout(() => {
              this.getCurrentLocation(showUserNotification).then(resolve).catch(reject);
            }, 2000 * this.retryAttempts); // Exponential backoff
            
            return;
          }
          
          if (showUserNotification) {
            this.showUserError(locationError);
          }
          
          reject(locationError);
        },
        options
      );
    });
  }

  /**
   * Start continuous location tracking
   */
  public async startTracking(): Promise<void> {
    if (this.isTracking) {
      console.log('Location tracking already active');
      return;
    }

    try {
      // Get initial location first
      await this.getCurrentLocation(false);
      
      if (!('geolocation' in navigator)) {
        throw this.createLocationError('NOT_SUPPORTED', 'Geolocation not supported');
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // 30 seconds
      };

      this.watchId = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          this.handleLocationUpdate(position);
        },
        (error: GeolocationPositionError) => {
          const locationError = this.handleGeolocationError(error);
          console.error('Location tracking error:', locationError.message, locationError);

          // Don't stop tracking for temporary errors
          if (error.code !== error.PERMISSION_DENIED) {
            console.log('Continuing location tracking despite error:', locationError.message);
            return;
          }

          // Stop tracking if permission is denied
          this.stopTracking();
          this.showUserError(locationError);
        },
        options
      );

      this.isTracking = true;
      console.log('Location tracking started');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to start location tracking:', errorMessage, error);
      throw new Error(`Location tracking failed: ${errorMessage}`);
    }
  }

  /**
   * Stop location tracking
   */
  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    console.log('Location tracking stopped');
  }

  /**
   * Handle location updates from watchPosition
   */
  private async handleLocationUpdate(position: GeolocationPosition): Promise<void> {
    try {
      const newLocation: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined,
        timestamp: new Date()
      };

      // Only update if location has changed significantly
      if (this.hasLocationChanged(newLocation)) {
        try {
          newLocation.address = await this.reverseGeocode(newLocation);
        } catch (error) {
          console.warn('Reverse geocoding failed during tracking:', error);
        }

        this.currentLocation = newLocation;
        this.retryAttempts = 0; // Reset on successful update
        
        // Emit location update event
        this.emitLocationUpdate(newLocation);
      }
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }

  /**
   * Check if location has changed significantly
   */
  private hasLocationChanged(newLocation: LocationData): boolean {
    if (!this.currentLocation) return true;
    
    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );
    
    // Update if moved more than 10 meters or 5 minutes have passed
    const timeThreshold = 5 * 60 * 1000; // 5 minutes
    const distanceThreshold = 0.01; // ~10 meters
    
    return distance > distanceThreshold || 
           (Date.now() - this.currentLocation.timestamp.getTime()) > timeThreshold;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Handle geolocation errors
   */
  private handleGeolocationError(error: GeolocationPositionError): LocationError {
    let locationError: LocationError;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        locationError = this.createLocationError(
          'PERMISSION_DENIED',
          'Location permission denied',
          'Location access is required for safety features. Please enable location permissions in your browser settings.',
          false
        );
        break;
      
      case error.POSITION_UNAVAILABLE:
        locationError = this.createLocationError(
          'POSITION_UNAVAILABLE',
          'Location information unavailable',
          'Unable to determine your location. Please check your GPS/location settings.',
          true
        );
        break;
      
      case error.TIMEOUT:
        locationError = this.createLocationError(
          'TIMEOUT',
          'Location request timeout',
          'Location request timed out. Please check your connection and try again.',
          true
        );
        break;
      
      default:
        locationError = this.createLocationError(
          'POSITION_UNAVAILABLE',
          'Unknown location error',
          'Unable to get your location. Please try again or check your device settings.',
          true
        );
    }

    this.lastError = locationError;
    return locationError;
  }

  /**
   * Create standardized location error
   */
  private createLocationError(
    code: LocationError['code'],
    message: string,
    userMessage?: string,
    canRetry: boolean = false
  ): LocationError {
    return {
      code,
      message,
      userMessage: userMessage || message,
      canRetry
    };
  }

  /**
   * Show user-friendly error notification
   */
  private showUserError(error: LocationError): void {
    // Dispatch custom event for better error handling
    window.dispatchEvent(new CustomEvent('locationError', {
      detail: {
        message: error.userMessage,
        canRetry: error.canRetry,
        type: error.code === 'PERMISSION_DENIED' ? 'permission' :
              error.code === 'TIMEOUT' ? 'timeout' :
              error.code === 'POSITION_UNAVAILABLE' ? 'unavailable' : 'general'
      }
    }));

    const actionButton = error.canRetry ? {
      label: 'Retry',
      onClick: () => this.getCurrentLocation(true)
    } : (error.code === 'PERMISSION_DENIED' ? {
      label: 'Enable',
      onClick: () => window.open('chrome://settings/content/location', '_blank')
    } : undefined);

    notificationService.addNotification({
      id: `location-error-${Date.now()}`,
      type: 'warning',
      title: 'Location Error',
      message: error.userMessage,
      priority: 'high',
      action: actionButton,
      persistent: error.code === 'PERMISSION_DENIED'
    });
  }

  /**
   * Emit location update event
   */
  private emitLocationUpdate(location: LocationData): void {
    window.dispatchEvent(new CustomEvent('locationUpdate', {
      detail: location
    }));
  }

  /**
   * Reverse geocode coordinates to address
   */
  private async reverseGeocode(location: LocationData): Promise<string> {
    try {
      // Use the existing geocoding service
      const geocodingService = await import('./geocodingService');
      const result = await geocodingService.reverseGeocode(location.latitude, location.longitude);
      return result.address;
    } catch (error) {
      console.warn('Geocoding failed:', error);
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
  }

  /**
   * Get current cached location
   */
  public getCurrentLocationCache(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Get last error
   */
  public getLastError(): LocationError | null {
    return this.lastError;
  }

  /**
   * Check if tracking is active
   */
  public isTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Get permission status
   */
  public getPermissionStatus(): string {
    return this.permissionStatus;
  }

  /**
   * Request permission explicitly
   */
  public async requestPermission(): Promise<boolean> {
    try {
      await this.getCurrentLocation(false);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get location with fallback to IP-based location
   */
  public async getLocationWithFallback(): Promise<LocationData> {
    try {
      return await this.getCurrentLocation(false);
    } catch (error) {
      console.warn('GPS location failed, trying IP-based location');
      try {
        return await this.getIPLocation();
      } catch (ipError) {
        console.error('All location methods failed');
        throw error; // Throw original GPS error
      }
    }
  }

  /**
   * Get approximate location based on IP
   */
  private async getIPLocation(): Promise<LocationData> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const location: LocationData = {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 10000, // Very low accuracy for IP-based location
          timestamp: new Date(),
          address: `${data.city}, ${data.region}, ${data.country_name}`
        };
        
        notificationService.addNotification({
          id: 'ip-location',
          type: 'info',
          title: 'Approximate Location',
          message: 'Using approximate location based on your internet connection.',
          priority: 'low'
        });
        
        return location;
      }
      
      throw new Error('IP location not available');
    } catch (error) {
      throw new Error('Failed to get IP-based location');
    }
  }
}

export const locationService = new LocationService();
export default locationService;
