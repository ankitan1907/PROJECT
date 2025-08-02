// Secure Network Service - Handles security software blocking and provides fallbacks
import { notificationService } from './notificationService';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  showUserError?: boolean;
}

interface FetchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  isBlocked?: boolean;
  usingFallback?: boolean;
}

class SecureNetworkService {
  private blockedDomains = new Set<string>();
  private lastBlockedTime: number = 0;
  private consecutiveBlocks: number = 0;
  private demoModeActive: boolean = false;

  /**
   * Enhanced fetch with security software blocking detection
   */
  public async secureFetch<T = any>(
    url: string, 
    options: FetchOptions = {}
  ): Promise<FetchResult<T>> {
    const {
      timeout = 10000,
      retries = 2,
      showUserError = false,
      ...fetchOptions
    } = options;

    // Check if domain is known to be blocked
    const domain = this.extractDomain(url);
    if (this.blockedDomains.has(domain) && this.demoModeActive) {
      return {
        success: false,
        error: 'Domain blocked by security software',
        isBlocked: true,
        usingFallback: true
      };
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          this.resetBlockedStatus(domain);
          return {
            success: true,
            data
          };
        } else {
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`
          };
        }

      } catch (error) {
        const isSecurityBlocked = this.detectSecurityBlocking(error);
        
        if (isSecurityBlocked) {
          this.handleSecurityBlocking(domain, showUserError);
          return {
            success: false,
            error: 'Blocked by security software',
            isBlocked: true,
            usingFallback: true
          };
        }

        // Network or other errors - retry if not last attempt
        if (attempt < retries) {
          await this.delay(1000 * (attempt + 1)); // Exponential backoff
          continue;
        }

        return {
          success: false,
          error: error.message || 'Network request failed'
        };
      }
    }

    return {
      success: false,
      error: 'Maximum retries exceeded'
    };
  }

  /**
   * Fetch with automatic fallback to demo data
   */
  public async fetchWithFallback<T>(
    url: string,
    fallbackData: T,
    options: FetchOptions = {}
  ): Promise<FetchResult<T>> {
    const result = await this.secureFetch<T>(url, options);
    
    if (!result.success && result.isBlocked) {
      return {
        success: true,
        data: fallbackData,
        usingFallback: true
      };
    }
    
    return result;
  }

  /**
   * Detect if error is caused by security software
   */
  private detectSecurityBlocking(error: any): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorString = error.toString?.().toLowerCase() || '';
    
    // Check for Kaspersky-specific indicators
    const kasperskyIndicators = [
      'kas.v2.scr.kaspersky-labs.com',
      'gc.kis.v2.scr.kaspersky-labs.com',
      'fetchCallImpl',
      'kaspersky'
    ];

    // Check for generic security software indicators
    const securityIndicators = [
      'script error',
      'content security policy',
      'security policy',
      'mixed content',
      'refused to connect',
      'net::err_blocked_by_client',
      'failed to fetch'
    ];

    const hasKasperskyIndicators = kasperskyIndicators.some(indicator =>
      errorString.includes(indicator) || errorMessage.includes(indicator)
    );

    const hasSecurityIndicators = securityIndicators.some(indicator =>
      errorString.includes(indicator) || errorMessage.includes(indicator)
    );

    // Check stack trace for security software injection
    const stack = error.stack?.toLowerCase() || '';
    const hasSecurityStack = kasperskyIndicators.some(indicator =>
      stack.includes(indicator)
    );

    return hasKasperskyIndicators || hasSecurityStack || 
           (hasSecurityIndicators && this.isLikelySecurityBlocking());
  }

  /**
   * Additional heuristics to detect security blocking
   */
  private isLikelySecurityBlocking(): boolean {
    // If we've had multiple consecutive blocks recently, likely security software
    const now = Date.now();
    const timeSinceLastBlock = now - this.lastBlockedTime;
    
    return this.consecutiveBlocks > 1 && timeSinceLastBlock < 30000; // 30 seconds
  }

  /**
   * Handle security software blocking
   */
  private handleSecurityBlocking(domain: string, showUserError: boolean): void {
    this.blockedDomains.add(domain);
    this.lastBlockedTime = Date.now();
    this.consecutiveBlocks++;
    
    // Activate demo mode after multiple blocks
    if (this.consecutiveBlocks >= 2) {
      this.demoModeActive = true;
    }

    console.warn(`🛡️ Security software detected blocking requests to ${domain}`);

    if (showUserError && !this.hasShownBlockingNotification()) {
      this.showSecurityBlockingNotification();
    }
  }

  /**
   * Reset blocked status on successful request
   */
  private resetBlockedStatus(domain: string): void {
    if (this.blockedDomains.has(domain)) {
      this.blockedDomains.delete(domain);
      this.consecutiveBlocks = Math.max(0, this.consecutiveBlocks - 1);
      
      if (this.consecutiveBlocks === 0) {
        this.demoModeActive = false;
      }
    }
  }

  /**
   * Show user notification about security software blocking
   */
  private showSecurityBlockingNotification(): void {
    const notificationId = 'security-blocking-notification';
    
    // Check if already shown recently
    const lastShown = localStorage.getItem(`${notificationId}-timestamp`);
    const now = Date.now();
    
    if (lastShown && (now - parseInt(lastShown)) < 300000) { // 5 minutes
      return;
    }

    notificationService.addNotification({
      id: notificationId,
      type: 'info',
      title: 'Security Software Detected',
      message: 'Your security software is protecting you by filtering network requests. Demo mode is active.',
      priority: 'medium',
      persistent: false,
      autoClose: 8000,
      action: {
        label: 'Learn More',
        onClick: () => this.showSecurityHelp()
      }
    });

    localStorage.setItem(`${notificationId}-timestamp`, now.toString());
  }

  /**
   * Check if blocking notification was shown recently
   */
  private hasShownBlockingNotification(): boolean {
    const lastShown = localStorage.getItem('security-blocking-notification-timestamp');
    if (!lastShown) return false;
    
    const now = Date.now();
    return (now - parseInt(lastShown)) < 300000; // 5 minutes
  }

  /**
   * Show help about security software
   */
  private showSecurityHelp(): void {
    const helpMessage = `🛡️ Security Software Information

Your antivirus/security software (like Kaspersky) is actively protecting your computer by filtering network requests.

✅ This is normal and safe
✅ Your data is protected
✅ The app works in demo mode

Features available in demo mode:
• Location services ✅
• Emergency SOS ✅
• Voice assistant ✅
• Contact management ✅
• Safety features ✅

Note: Some real-time data will be simulated for demonstration purposes.`;

    alert(helpMessage);
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if currently in demo mode due to blocking
   */
  public isDemoMode(): boolean {
    return this.demoModeActive;
  }

  /**
   * Get blocked domains
   */
  public getBlockedDomains(): string[] {
    return Array.from(this.blockedDomains);
  }

  /**
   * Manually reset demo mode (for testing)
   */
  public resetDemoMode(): void {
    this.demoModeActive = false;
    this.blockedDomains.clear();
    this.consecutiveBlocks = 0;
  }

  /**
   * Test network connectivity
   */
  public async testConnectivity(url: string): Promise<boolean> {
    const result = await this.secureFetch(url, { 
      timeout: 5000, 
      retries: 1,
      showUserError: false 
    });
    return result.success;
  }
}

export const secureNetworkService = new SecureNetworkService();
export default secureNetworkService;
