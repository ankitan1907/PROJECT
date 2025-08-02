// Google OAuth Service for Real Authentication
interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
}

interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

class GoogleAuthService {
  private isInitialized = false;
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private isClientIdValid = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load Google Identity Services library
      await this.loadGoogleScript();

      // Check if we have a valid client ID
      if (!this.clientId || this.clientId === 'your-google-client-id') {
        console.warn('Google Client ID not configured. Demo mode will be used.');
        this.isClientIdValid = false;
        this.isInitialized = true;
        return;
      }

      this.isClientIdValid = true;

      // Check if Google API is available
      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services not available');
      }

      // Initialize Google OAuth with error handling
      try {
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: this.handleCredentialResponse.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, // Disable FedCM to avoid the error
        });
      } catch (initError) {
        console.warn('Google Identity Services initialization failed:', initError);
        this.isClientIdValid = false;
        // Continue without throwing to allow fallback authentication
      }

      this.isInitialized = true;
      console.log('Google Auth initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      this.isInitialized = false;
      // Don't throw error to allow fallback authentication
    }
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      
      document.head.appendChild(script);
    });
  }

  private async handleCredentialResponse(response: GoogleAuthResponse): Promise<void> {
    try {
      if (!response?.credential) {
        throw new Error('No credential received from Google');
      }

      const userInfo = this.parseJWT(response.credential);
      console.log('Google Auth Success:', userInfo);

      // Validate required fields
      if (!userInfo.email || !userInfo.name) {
        throw new Error('Incomplete user information from Google');
      }

      // Store user data
      localStorage.setItem('google-user', JSON.stringify(userInfo));

      // Trigger custom event for app to handle
      window.dispatchEvent(new CustomEvent('google-auth-success', {
        detail: userInfo
      }));

    } catch (error) {
      console.error('Error handling Google Auth response:', error);
      window.dispatchEvent(new CustomEvent('google-auth-error', {
        detail: error
      }));
    }
  }

  private parseJWT(token: string): GoogleUser {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token provided');
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // Add padding if needed
      const padded = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);

      const jsonPayload = decodeURIComponent(
        atob(padded)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const parsed = JSON.parse(jsonPayload);

      // Map Google JWT fields to our user interface
      return {
        id: parsed.sub || parsed.id,
        email: parsed.email,
        name: parsed.name,
        picture: parsed.picture,
        given_name: parsed.given_name,
        family_name: parsed.family_name,
        locale: parsed.locale || 'en'
      };
    } catch (error) {
      console.error('JWT parsing error:', error);
      throw new Error('Failed to parse Google JWT token');
    }
  }

  async signIn(): Promise<GoogleUser> {
    try {
      await this.initialize();

      // If Google services are not properly initialized or client ID invalid, throw error for fallback
      if (!this.isInitialized || !this.isClientIdValid || !window.google?.accounts?.id) {
        throw new Error(this.isClientIdValid ? 'Google services not available' : 'Google Client ID not configured');
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Google Sign-in timeout'));
        }, 15000); // 15 second timeout

        const cleanup = () => {
          window.removeEventListener('google-auth-success', handleSuccess as EventListener);
          window.removeEventListener('google-auth-error', handleError as EventListener);
          clearTimeout(timeout);
        };

        const handleSuccess = (event: CustomEvent) => {
          cleanup();
          resolve(event.detail);
        };

        const handleError = (event: CustomEvent) => {
          cleanup();
          reject(event.detail);
        };

        window.addEventListener('google-auth-success', handleSuccess as EventListener);
        window.addEventListener('google-auth-error', handleError as EventListener);

        try {
          // Try to show Google Sign-in prompt
          window.google.accounts.id.prompt((notification: any) => {
            if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
              // Fallback to button-based sign-in
              this.showSignInButton().then(resolve).catch(reject);
            }
          });
        } catch (promptError) {
          console.warn('Google prompt failed:', promptError);
          // Fallback to button-based sign-in
          this.showSignInButton().then(resolve).catch(reject);
        }
      });
    } catch (error) {
      console.error('Google Sign-in initialization failed:', error);
      throw error; // This will trigger the fallback in AuthContext
    }
  }

  private async showSignInButton(): Promise<GoogleUser> {
    return new Promise((resolve, reject) => {
      try {
        // Create a modal overlay for the sign-in button
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          text-align: center;
          max-width: 400px;
          width: 90%;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Sign in to Sakhi';
        title.style.cssText = 'margin: 0 0 20px 0; color: #333; font-size: 24px;';

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Continue with your Google account for a personalized safety experience';
        subtitle.style.cssText = 'margin: 0 0 25px 0; color: #666; font-size: 16px;';

        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'google-signin-button-modal';
        buttonContainer.style.cssText = 'margin: 20px 0;';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
          background: #f5f5f5;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          margin-top: 15px;
          cursor: pointer;
          color: #666;
        `;

        cancelButton.onclick = () => {
          cleanup();
          reject(new Error('User cancelled Google Sign-in'));
        };

        const cleanup = () => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        };

        modal.appendChild(title);
        modal.appendChild(subtitle);
        modal.appendChild(buttonContainer);
        modal.appendChild(cancelButton);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Render Google Sign-in button
        window.google?.accounts.id.renderButton(buttonContainer, {
          theme: 'filled_blue',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: buttonContainer.offsetWidth || 300
        });

        // Set up success/error handlers
        const handleSuccess = (event: CustomEvent) => {
          cleanup();
          window.removeEventListener('google-auth-success', handleSuccess as EventListener);
          resolve(event.detail);
        };

        const handleError = (event: CustomEvent) => {
          cleanup();
          window.removeEventListener('google-auth-error', handleError as EventListener);
          reject(event.detail);
        };

        window.addEventListener('google-auth-success', handleSuccess as EventListener);
        window.addEventListener('google-auth-error', handleError as EventListener);

        // Auto-cleanup after 30 seconds
        setTimeout(() => {
          cleanup();
          reject(new Error('Google Sign-in timeout'));
        }, 30000);

      } catch (error) {
        console.error('Error showing Google Sign-in button:', error);
        reject(error);
      }
    });
  }

  async signOut(): Promise<void> {
    try {
      // Revoke Google tokens
      window.google?.accounts.id.disableAutoSelect();
      
      // Clear local storage
      localStorage.removeItem('google-user');
      
      console.log('Google Auth sign-out successful');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  getCurrentUser(): GoogleUser | null {
    try {
      const userData = localStorage.getItem('google-user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isSignedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}

// Global type declarations
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export const googleAuth = new GoogleAuthService();
export default googleAuth;
