// Real Google OAuth Service with Backend Integration
interface GoogleUser {
  id: string;
  googleId: string;
  name: string;
  email: string;
  picture: string;
  profileSetupComplete?: boolean;
}

interface GoogleJWTPayload {
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

class RealGoogleAuthService {
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  private isInitialized = false;
  private isClientIdValid = false;

  constructor() {
    this.validateClientId();
    if (this.isClientIdValid) {
      this.initialize();
    }
  }

  private validateClientId(): void {
    this.isClientIdValid = !!(this.clientId && 
      this.clientId !== 'your_google_client_id' &&
      this.clientId.length > 20);
    
    if (!this.isClientIdValid) {
      console.warn('⚠️ Google Client ID not properly configured');
    }
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadGoogleScript();
      
      if (typeof window.google !== 'undefined') {
        try {
          window.google.accounts.id.initialize({
            client_id: this.clientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false // Disable FedCM to avoid errors
          });
        } catch (initError) {
          console.warn('⚠️ Google OAuth init failed - domain not authorized:', initError);
          this.isClientIdValid = false;
          return;
        }
        
        this.isInitialized = true;
        console.log('✅ Real Google Auth initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Auth:', error);
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

  private async handleCredentialResponse(response: any): Promise<void> {
    try {
      const credential = response.credential;
      const payload = this.parseJWT(credential);
      
      // Send to backend for authentication and user creation/update
      const backendResponse = await fetch(`${this.backendUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        })
      });

      if (!backendResponse.ok) {
        throw new Error('Backend authentication failed');
      }

      const backendData = await backendResponse.json();
      
      if (backendData.success) {
        const user: GoogleUser = {
          id: backendData.user.id,
          googleId: backendData.user.googleId,
          name: backendData.user.name,
          email: backendData.user.email,
          picture: backendData.user.picture,
          profileSetupComplete: backendData.user.profileSetupComplete
        };

        // Store user data
        localStorage.setItem('google-user', JSON.stringify(user));
        
        // Dispatch custom event for auth context
        window.dispatchEvent(new CustomEvent('google-auth-success', {
          detail: user
        }));
        
        console.log('✅ Google sign-in successful:', user.name);
      } else {
        throw new Error(backendData.error || 'Authentication failed');
      }
      
    } catch (error) {
      console.error('❌ Error handling credential response:', error);
      this.handleAuthError(error);
    }
  }

  private parseJWT(token: string): GoogleJWTPayload {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);

      const jsonPayload = decodeURIComponent(
        atob(padded)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT parsing error:', error);
      throw new Error('Failed to parse Google JWT token');
    }
  }

  private handleAuthError(error: any): void {
    console.error('Google Auth Error:', error);
    window.dispatchEvent(new CustomEvent('google-auth-error', {
      detail: { message: error.message || 'Authentication failed' }
    }));
  }

  private showSignInModal(): void {
    if (!window.google?.accounts?.id) {
      this.handleAuthError(new Error('Google services not available'));
      return;
    }

    // Create modal overlay
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
    title.textContent = 'Sign in with Google';
    title.style.cssText = 'margin: 0 0 20px 0; color: #333; font-size: 24px;';

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Connect your Google account to access all Sakhi safety features';
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
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      this.handleAuthError(new Error('User cancelled sign-in'));
    };

    modal.appendChild(title);
    modal.appendChild(subtitle);
    modal.appendChild(buttonContainer);
    modal.appendChild(cancelButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Render Google Sign-in button
    try {
      window.google.accounts.id.renderButton(buttonContainer, {
        theme: 'filled_blue',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300
      });
    } catch (renderError) {
      console.error('Error rendering Google button:', renderError);
      this.handleAuthError(renderError);
    }
  }

  public async signIn(): Promise<GoogleUser> {
    return new Promise((resolve, reject) => {
      if (!this.isClientIdValid) {
        // Return demo user when client ID is not configured
        const demoUser: GoogleUser = {
          id: 'demo_user_123',
          googleId: 'demo_google_123',
          name: 'Demo User',
          email: 'demo@sakhi.com',
          picture: 'https://via.placeholder.com/96x96.png?text=Demo',
          profileSetupComplete: false
        };
        
        // Store demo user
        localStorage.setItem('google-user', JSON.stringify(demoUser));
        
        console.log('🎭 Using demo mode - Google Client ID not configured');
        resolve(demoUser);
        return;
      }

      if (!this.isInitialized || typeof window.google === 'undefined') {
        reject(new Error('Google Auth not initialized'));
        return;
      }

      // Set up one-time listener for auth success
      const handleAuthSuccess = (event: CustomEvent) => {
        window.removeEventListener('google-auth-success', handleAuthSuccess as EventListener);
        window.removeEventListener('google-auth-error', handleAuthError as EventListener);
        resolve(event.detail as GoogleUser);
      };

      const handleAuthError = (event: CustomEvent) => {
        window.removeEventListener('google-auth-success', handleAuthSuccess as EventListener);
        window.removeEventListener('google-auth-error', handleAuthError as EventListener);
        reject(new Error(event.detail.message));
      };

      window.addEventListener('google-auth-success', handleAuthSuccess as EventListener);
      window.addEventListener('google-auth-error', handleAuthError as EventListener);

      // Add timeout for origin errors
      const timeoutId = setTimeout(() => {
        window.removeEventListener('google-auth-success', handleAuthSuccess as EventListener);
        window.removeEventListener('google-auth-error', handleAuthError as EventListener);
        reject(new Error('Google Auth timeout - domain may not be authorized'));
      }, 10000);

      try {
        // Trigger Google sign-in popup
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If prompt is not displayed, show the modal sign-in
            this.showSignInModal();
          }
        });
      } catch (error) {
        clearTimeout(timeoutId);
        window.removeEventListener('google-auth-success', handleAuthSuccess as EventListener);
        window.removeEventListener('google-auth-error', handleAuthError as EventListener);
        reject(error);
      }
    });
  }

  public async signOut(): Promise<void> {
    try {
      // Revoke Google tokens
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      // Clear local storage
      localStorage.removeItem('google-user');
      
      console.log('✅ Google sign-out successful');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  public getCurrentUser(): GoogleUser | null {
    try {
      const userData = localStorage.getItem('google-user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  public async updateUserProfile(userId: string, profileData: any): Promise<void> {
    try {
      const response = await fetch(`${this.backendUrl}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...profileData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local storage with new profile data
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            profileSetupComplete: true
          };
          localStorage.setItem('google-user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  public isSignedIn(): boolean {
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

export const realGoogleAuth = new RealGoogleAuthService();
export default realGoogleAuth;
