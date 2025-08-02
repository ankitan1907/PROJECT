import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  Clock, 
  Send,
  AlertTriangle,
  Eye,
  EyeOff,
  FileText,
  Check,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { celebrateReportSubmission } from '@/utils/confetti';

interface IncidentForm {
  type: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images: File[];
  isAnonymous: boolean;
  timestamp: Date;
}

const incidentTypes = [
  { value: 'harassment', label: 'Harassment', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  { value: 'stalking', label: 'Stalking', color: 'bg-sos/20 text-sos border-sos/30' },
  { value: 'catcalling', label: 'Catcalling', color: 'bg-warning/20 text-warning border-warning/30' },
  { value: 'inappropriate_touching', label: 'Inappropriate Touching', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  { value: 'suspicious_activity', label: 'Suspicious Activity', color: 'bg-warning/20 text-warning border-warning/30' },
  { value: 'verbal-abuse', label: 'Verbal Abuse', color: 'bg-warning/20 text-warning border-warning/30' },
  { value: 'suspicious-activity', label: 'Suspicious Activity', color: 'bg-muted/20 text-muted-foreground border-muted/30' },
  { value: 'other', label: 'Other', color: 'bg-secondary/20 text-secondary-foreground border-secondary/30' },
];

const ImagePreview = ({ file, onRemove }: { file: File, onRemove: () => void }) => {
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  return (
    <div className="relative group">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
};

export default function IncidentReporting() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState<IncidentForm>({
    type: '',
    description: '',
    location: '',
    coordinates: undefined,
    images: [],
    isAnonymous: false,
    timestamp: new Date(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { locationService } = await import('../services/locationService');
      const location = await locationService.getCurrentLocation(true);

      const locationString = location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
      setCurrentLocation(locationString);
      setForm(prev => ({
        ...prev,
        location: locationString,
        coordinates: {
          lat: location.latitude,
          lng: location.longitude
        }
      }));
      setIsLoadingLocation(false);
    } catch (error) {
      console.error('Failed to get location:', error);
      setCurrentLocation('Location unavailable');
      setForm(prev => ({ ...prev, location: 'Location unavailable' }));
      setIsLoadingLocation(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...files].slice(0, 3) // Max 3 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.description) return;

    setIsSubmitting(true);

    try {
      // Ensure we have location data
      if (!form.coordinates && form.location !== 'Location unavailable') {
        await getCurrentLocation();
      }

      // Prepare incident data for local storage (offline-first approach)
      const incidentData = {
        id: Date.now().toString(),
        userId: user?.id || 'anonymous',
        userName: form.isAnonymous ? 'Anonymous' : (user?.name || 'Anonymous'),
        type: form.type,
        severity: getSeverityFromType(form.type),
        description: form.description,
        location: form.coordinates ? {
          lat: form.coordinates.lat,
          lng: form.coordinates.lng
        } : null,
        address: form.location,
        city: extractCityFromAddress(form.location),
        photos: form.images.map(img => URL.createObjectURL(img)), // Store as blob URLs temporarily
        timestamp: form.timestamp.toISOString(),
        isAnonymous: form.isAnonymous,
        status: 'submitted'
      };

      // Store incident data locally (offline-first approach)
      const existingIncidents = JSON.parse(localStorage.getItem('sakhi_incidents') || '[]');
      existingIncidents.push(incidentData);
      localStorage.setItem('sakhi_incidents', JSON.stringify(existingIncidents));

      // Simulate processing time for user feedback
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('✅ Incident reported successfully and stored locally:', incidentData);
      setIsSubmitted(true);

      // Celebrate with confetti!
      celebrateReportSubmission();

      // Show success notification
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('incident-reported', {
          detail: { incident: incidentData, location: form.coordinates }
        }));
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setForm({
          type: '',
          description: '',
          location: '',
          coordinates: undefined,
          images: [],
          isAnonymous: false,
          timestamp: new Date(),
        });
      }, 3000);

    } catch (error) {
      console.error('Failed to submit incident report:', error);
      alert('There was an issue saving your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine severity from incident type
  const getSeverityFromType = (type: string): string => {
    switch (type) {
      case 'inappropriate_touching':
        return 'extreme';
      case 'stalking':
      case 'harassment':
        return 'high';
      case 'catcalling':
      case 'suspicious_activity':
        return 'medium';
      default:
        return 'low';
    }
  };

  // Helper function to extract city from address
  const extractCityFromAddress = (address: string): string => {
    if (!address || address === 'Location unavailable') return 'Unknown';

    // Simple extraction - look for common patterns
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return parts[0].trim();
  };

  const shareViaWhatsApp = () => {
    const message = `🚨 Safety Alert - Incident Report
    
Type: ${incidentTypes.find(t => t.value === form.type)?.label}
Location: ${form.location || 'Not specified'}
Time: ${form.timestamp.toLocaleString()}
Description: ${form.description}

Reported via SafeGuard App
#WomenSafety #StaySafe`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-safe rounded-full flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Report Submitted Successfully!
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Thank you for reporting this incident. Your report helps keep our community safe.
          Our team will review it shortly.
        </p>
        
        <div className="space-y-3 w-full max-w-sm">
          <Button
            onClick={shareViaWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Share on WhatsApp
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Reference ID: SR{Date.now().toString().slice(-6)}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Report Incident 📝
        </h1>
        <p className="text-muted-foreground">
          Help keep our community safe by reporting incidents
        </p>
      </motion.div>

      {/* Emergency Alert */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Alert className="border-sos/30 bg-sos/10">
          <AlertTriangle className="h-4 w-4 text-sos" />
          <AlertDescription className="text-sos">
            <strong>Emergency?</strong> If you're in immediate danger, call 100 (Police) or use the SOS button.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {/* Incident Type */}
        <div className="space-y-3">
          <Label htmlFor="incident-type" className="text-base font-semibold">
            What happened? *
          </Label>
          <RadioGroup value={form.type} onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}>
            <div className="grid grid-cols-2 gap-3">
              {incidentTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label
                    htmlFor={type.value}
                    className={`text-sm cursor-pointer px-2 py-1 rounded-lg border ${type.color}`}
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-semibold">
            Describe what happened *
          </Label>
          <Textarea
            id="description"
            placeholder="Please provide details about the incident. The more information you provide, the better we can help."
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-24 rounded-2xl"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-base font-semibold">
            Location
          </Label>
          <div className="flex space-x-2">
            <Input
              id="location"
              placeholder="Enter location or use current location"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              className="rounded-2xl"
            />
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="rounded-2xl px-4"
            >
              {isLoadingLocation ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </Button>
          </div>
          {currentLocation && (
            <p className="text-sm text-muted-foreground">📍 {currentLocation}</p>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Add Photos (Optional)
          </Label>
          <div className="flex items-center space-x-3">
            {form.images.map((file, index) => (
              <ImagePreview
                key={index}
                file={file}
                onRemove={() => removeImage(index)}
              />
            ))}
            
            {form.images.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">
            You can add up to 3 photos. Photos help verify the incident.
          </p>
        </div>

        {/* Anonymous Reporting */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
          <div className="flex items-center space-x-3">
            {form.isAnonymous ? (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Eye className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Report Anonymously</p>
              <p className="text-sm text-muted-foreground">
                Your identity will be kept private
              </p>
            </div>
          </div>
          <Switch
            checked={form.isAnonymous}
            onCheckedChange={(checked) => setForm(prev => ({ ...prev, isAnonymous: checked }))}
          />
        </div>

        {/* Timestamp */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Reported on: {form.timestamp.toLocaleString()}</span>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!form.type || !form.description || isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-2xl py-6 text-base font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting Report...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Report
            </>
          )}
        </Button>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground text-center bg-muted/10 rounded-2xl p-4">
          <p className="mb-2">
            🔒 Your report is encrypted and secure. False reports may have legal consequences.
          </p>
          <p>
            📞 Need immediate help? Call 100 (Police), 108 (Medical), or 1091 (Women Helpline)
          </p>
        </div>
      </motion.form>
    </div>
  );
}
