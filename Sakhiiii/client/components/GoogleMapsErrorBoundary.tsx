import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo: string;
}

export class GoogleMapsErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state to trigger error UI
    return { 
      hasError: true, 
      errorInfo: error.message.includes('google') 
        ? 'Google Maps API failed to load'
        : 'Maps component error'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('Google Maps Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorInfo: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Map Loading Error
            </h3>
            <p className="text-gray-600 mb-4 max-w-sm">
              {this.state.errorInfo}. The app will continue to work without maps.
            </p>
            <Button 
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
            <div className="mt-4 text-xs text-gray-500">
              ✅ All safety features still available
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GoogleMapsErrorBoundary;
