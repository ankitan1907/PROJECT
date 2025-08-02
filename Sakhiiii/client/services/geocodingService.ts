// Google Geocoding Service for Real Address Resolution
interface GeocodeResult {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  formattedAddress: string;
}

interface ReverseGeocodeParams {
  lat: number;
  lng: number;
}

interface ForwardGeocodeParams {
  address: string;
  city?: string;
  state?: string;
  country?: string;
}

class GeocodingService {
  private apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  private backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  constructor() {
    if (!this.apiKey) {
      console.warn('⚠️ Google Maps API key not configured for geocoding');
    }
  }

  /**
   * Convert coordinates to formatted address using Google Geocoding API
   */
  async reverseGeocode(params: ReverseGeocodeParams): Promise<GeocodeResult> {
    // Always try backend first (most secure)
    try {
      const backendResponse = await this.tryBackendGeocode(params);
      if (backendResponse) {
        return backendResponse;
      }
    } catch (error) {
      // Backend not available, continue to API fallback
    }

    // Try direct API if key is available
    if (this.apiKey) {
      try {
        return await this.directGeocode(params);
      } catch (error) {
        if (error.message.includes('Security software') || error.message.includes('Network request blocked')) {
          console.warn('🛡️ Security software detected - using safe demo location data');
        } else {
          console.warn('📍 Google Geocoding API unavailable, using demo location data');
        }
      }
    }

    // Final fallback to demo data
    return this.getDemoGeocodeResult(params.lat, params.lng);
  }

  /**
   * Convert address to coordinates
   */
  async forwardGeocode(params: ForwardGeocodeParams): Promise<{ lat: number; lng: number }> {
    if (!this.apiKey) {
      // Return approximate coordinates for demo
      return { lat: 12.9716, lng: 77.5946 }; // Bangalore
    }

    try {
      const addressQuery = this.buildAddressQuery(params);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Geocoding API request failed');
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        };
      } else {
        throw new Error(`Geocoding failed: ${data.status}`);
      }

    } catch (error) {
      console.error('Forward geocoding error:', error);
      // Return default location
      return { lat: 12.9716, lng: 77.5946 };
    }
  }

  /**
   * Try backend geocoding service first (more secure)
   */
  private async tryBackendGeocode(params: ReverseGeocodeParams): Promise<GeocodeResult | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${this.backendUrl}/api/geocode/reverse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: params.lat,
          lng: params.lng
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            address: data.address,
            city: data.city,
            state: '',
            country: 'India',
            formattedAddress: data.address
          };
        }
      }

      return null;
    } catch (error) {
      // Handle different error types gracefully
      if (error.name === 'AbortError') {
        console.warn('Backend geocoding timeout');
      } else if (error.message.includes('kaspersky') || error.message.includes('security')) {
        console.warn('Security software blocking geocoding request');
      } else {
        console.warn('Backend geocoding not available:', error.message);
      }
      return null;
    }
  }

  /**
   * Direct Google Geocoding API call
   */
  private async directGeocode(params: ReverseGeocodeParams): Promise<GeocodeResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${params.lat},${params.lng}&key=${this.apiKey}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return this.parseGoogleGeocodeResult(result);
      } else if (data.status === 'REQUEST_DENIED') {
        console.warn('⚠️ Google Geocoding API access denied. Check API key and enable Geocoding API.');
        throw new Error('API access denied');
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.warn('⚠️ Google Geocoding API quota exceeded.');
        throw new Error('API quota exceeded');
      } else {
        throw new Error(`API error: ${data.status}`);
      }
    } catch (error) {
      // Handle different error types with appropriate messaging
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      } else if (error.message.includes('kaspersky') || error.message.includes('security')) {
        console.warn('🛡️ Security software blocking geocoding request');
        throw new Error('Security software blocking request');
      } else if (error.message.includes('Failed to fetch')) {
        console.warn('🌐 Network request failed - possibly blocked by security software');
        throw new Error('Network request blocked');
      }
      throw error;
    }
  }

  /**
   * Parse Google Geocoding API response
   */
  private parseGoogleGeocodeResult(result: any): GeocodeResult {
    const addressComponents = result.address_components || [];
    const formattedAddress = result.formatted_address || '';

    // Extract components
    const getComponent = (type: string) => {
      const component = addressComponents.find((comp: any) => 
        comp.types.includes(type)
      );
      return component ? component.long_name : '';
    };

    return {
      address: formattedAddress,
      city: getComponent('locality') || getComponent('administrative_area_level_2'),
      state: getComponent('administrative_area_level_1'),
      country: getComponent('country'),
      postalCode: getComponent('postal_code'),
      formattedAddress
    };
  }

  /**
   * Build address query for forward geocoding
   */
  private buildAddressQuery(params: ForwardGeocodeParams): string {
    const parts = [params.address];
    
    if (params.city) parts.push(params.city);
    if (params.state) parts.push(params.state);
    if (params.country) parts.push(params.country);
    else parts.push('India'); // Default to India

    return parts.join(', ');
  }

  /**
   * Generate demo geocode result when API is not available
   */
  private getDemoGeocodeResult(lat: number, lng: number): GeocodeResult {
    // Approximate area based on coordinates
    const areas = [
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
      { name: 'Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi' },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'Telangana' },
      { name: 'Pune', lat: 18.5204, lng: 73.8567, state: 'Maharashtra' }
    ];

    // Find closest city
    const distances = areas.map(area => ({
      ...area,
      distance: Math.sqrt(Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2))
    }));

    const closest = distances.reduce((min, current) => 
      current.distance < min.distance ? current : min
    );

    return {
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: closest.name,
      state: closest.state,
      country: 'India',
      formattedAddress: `Near ${closest.name}, ${closest.state}, India`
    };
  }

  /**
   * Get current location with address
   */
  async getCurrentLocationWithAddress(): Promise<{ 
    coordinates: { lat: number; lng: number }; 
    address: GeocodeResult 
  }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          try {
            const address = await this.reverseGeocode(coordinates);
            resolve({ coordinates, address });
          } catch (error) {
            // Still resolve with coordinates even if geocoding fails
            resolve({ 
              coordinates, 
              address: this.getDemoGeocodeResult(coordinates.lat, coordinates.lng)
            });
          }
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Validate if coordinates are within India bounds (approximately)
   */
  isWithinIndia(lat: number, lng: number): boolean {
    // Approximate bounds for India
    const bounds = {
      north: 37.6,
      south: 6.4,
      east: 97.25,
      west: 68.7
    };

    return lat >= bounds.south && lat <= bounds.north && 
           lng >= bounds.west && lng <= bounds.east;
  }

  /**
   * Get area safety score based on location (mock implementation)
   */
  async getAreaSafetyScore(lat: number, lng: number): Promise<{
    score: number;
    level: 'very_safe' | 'safe' | 'moderate' | 'risky' | 'dangerous';
    description: string;
  }> {
    // This would normally query a safety database
    // For now, return mock data based on coordinates
    
    const mockScore = Math.random() * 100;
    let level: 'very_safe' | 'safe' | 'moderate' | 'risky' | 'dangerous';
    let description: string;

    if (mockScore >= 80) {
      level = 'very_safe';
      description = 'This area has excellent safety ratings with regular police patrol and good lighting.';
    } else if (mockScore >= 60) {
      level = 'safe';
      description = 'Generally safe area with good community watch and infrastructure.';
    } else if (mockScore >= 40) {
      level = 'moderate';
      description = 'Average safety area. Exercise normal precautions, especially at night.';
    } else if (mockScore >= 20) {
      level = 'risky';
      description = 'Some safety concerns reported. Avoid isolated areas and travel in groups.';
    } else {
      level = 'dangerous';
      description = 'Multiple safety incidents reported. Avoid this area, especially after dark.';
    }

    return {
      score: Math.round(mockScore),
      level,
      description
    };
  }
}

export const geocodingService = new GeocodingService();
export default geocodingService;
