import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Edit3,
  Save,
  LogOut,
  Shield,
  Bell,
  Globe,
  Calendar,
  Mail,
  Phone,
  Settings,
  Heart,
  Star,
  Award,
  FileText,
  Download,
  UserPlus,
  Trash2,
  PhoneCall
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { pdfExportService } from '@/services/pdfExportService';
import { twilioSMSService } from '@/services/twilioSMS';
import { Language } from '@shared/types';

interface ProfileForm {
  name: string;
  age: number;
  gender: 'female' | 'male' | 'other' | 'prefer-not-to-say';
  language: Language;
  email: string;
  phone: string;
}

interface NotificationSettings {
  pushNotifications: boolean;
  safetyAlerts: boolean;
  communityUpdates: boolean;
  helplineReminders: boolean;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

const ProfileCard = ({ icon: Icon, title, value, badge }: {
  icon: any;
  title: string;
  value: string | number;
  badge?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pastel-pink/30"
  >
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-primary/20 rounded-xl">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
      {badge && (
        <Badge className="bg-safe/20 text-safe border-safe/30">
          {badge}
        </Badge>
      )}
    </div>
  </motion.div>
);

export default function ProfilePage() {
  const { user, updateUser, signOut } = useAuth();
  const { currentLanguage, setLanguage, availableLanguages, t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: user?.name || '',
    age: user?.age || 0,
    gender: user?.gender || 'female',
    language: user?.language || 'en',
    email: user?.email || '',
    phone: '',
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushNotifications: true,
    safetyAlerts: true,
    communityUpdates: false,
    helplineReminders: true,
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: '',
    phone: '',
    relation: '',
    isPrimary: false
  });

  // Load emergency contacts on component mount
  useState(() => {
    const contacts = twilioSMSService.getEmergencyContacts();
    setEmergencyContacts(contacts);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update user data
    updateUser({
      name: form.name,
      age: form.age,
      gender: form.gender,
      language: form.language,
      email: form.email,
    });
    
    // Update language context
    setLanguage(form.language);
    
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone && newContact.relation) {
      twilioSMSService.addEmergencyContact(newContact);
      setEmergencyContacts(twilioSMSService.getEmergencyContacts());
      setNewContact({ name: '', phone: '', relation: '', isPrimary: false });
      setShowAddContact(false);
    }
  };

  const handleRemoveContact = (index: number) => {
    twilioSMSService.removeEmergencyContact(index);
    setEmergencyContacts(twilioSMSService.getEmergencyContacts());
  };

  const membershipDays = user?.memberSince 
    ? Math.floor((Date.now() - user.memberSince.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const safetyScore = 95; // Mock safety score
  const totalReports = 3; // Mock reports count

  if (!user) return null;

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Profile Settings 👤
        </h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>

        {user?.isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 bg-accent/10 border border-accent/20 rounded-2xl p-4"
          >
            <h3 className="font-semibold text-accent mb-1">Guest Mode Active</h3>
            <p className="text-sm text-muted-foreground">
              You're using Sakhi as a guest. Create an account to save your emergency contacts and unlock all features.
            </p>
          </motion.div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-0 right-0"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Profile Avatar & Basic Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-6 text-center"
      >
        <div className="relative inline-block mb-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-safe rounded-full flex items-center justify-center border-2 border-white">
            <Shield className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-1">{user.name}</h2>
        <p className="text-muted-foreground mb-4">
          Member since {user.memberSince?.toLocaleDateString()}
        </p>
        
        <div className="flex justify-center space-x-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-foreground">{membershipDays}</div>
            <div className="text-muted-foreground">Days Safe</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-safe">{safetyScore}%</div>
            <div className="text-muted-foreground">Safety Score</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-accent">{totalReports}</div>
            <div className="text-muted-foreground">Reports</div>
          </div>
        </div>
      </motion.div>

      {/* Editable Form */}
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pastel-pink/30 space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-2xl"
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="100"
                value={form.age || ''}
                onChange={(e) => setForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                className="rounded-2xl"
              />
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <Label>Gender</Label>
              <RadioGroup
                value={form.gender}
                onValueChange={(value) => setForm(prev => ({ 
                  ...prev, 
                  gender: value as ProfileForm['gender'] 
                }))}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female-edit" />
                    <Label htmlFor="female-edit">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male-edit" />
                    <Label htmlFor="male-edit">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other-edit" />
                    <Label htmlFor="other-edit">Other</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say-edit" />
                    <Label htmlFor="prefer-not-to-say-edit">Prefer not to say</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select
                value={form.language}
                onValueChange={(value: Language) => setForm(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-muted-foreground ml-2">({lang.name})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="rounded-2xl"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
                className="rounded-2xl"
              />
            </div>

            {/* Save Button */}
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-2xl"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Profile Stats */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <ProfileCard
            icon={Calendar}
            title="Age"
            value={user.age ? `${user.age} years` : 'Not set'}
          />
          <ProfileCard
            icon={Globe}
            title="Language"
            value={availableLanguages.find(l => l.code === currentLanguage)?.nativeName || 'English'}
          />
          <ProfileCard
            icon={Mail}
            title="Email"
            value={user.email ? '✓ Verified' : 'Not set'}
            badge={user.email ? 'Verified' : undefined}
          />
          <ProfileCard
            icon={Star}
            title="Safety Score"
            value={`${safetyScore}%`}
            badge="Excellent"
          />
        </motion.div>
      )}

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pastel-pink/30"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Settings
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive app notifications' },
            { key: 'safetyAlerts', label: 'Safety Alerts', description: 'Get notified about nearby incidents' },
            { key: 'communityUpdates', label: 'Community Updates', description: 'Updates from community posts' },
            { key: 'helplineReminders', label: 'Helpline Reminders', description: 'Periodic safety tips and helpline info' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{setting.label}</p>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <Switch
                checked={notifications[setting.key as keyof NotificationSettings]}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, [setting.key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pastel-pink/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <PhoneCall className="w-5 h-5 mr-2 text-sos" />
            Emergency Contacts
          </h3>
          <Button
            size="sm"
            onClick={() => setShowAddContact(true)}
            className="bg-gradient-to-r from-primary to-accent rounded-2xl"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {emergencyContacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <PhoneCall className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-2">No Emergency Contacts Added</p>
            <p className="text-sm">Add trusted contacts who will receive your SOS alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-muted/20"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{contact.name}</h4>
                    {contact.isPrimary && (
                      <Badge className="bg-primary/20 text-primary text-xs">Primary</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.relation}</p>
                  <p className="text-sm font-mono text-muted-foreground">{contact.phone}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveContact(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Contact Form */}
        {showAddContact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-muted/5 rounded-xl border border-muted/20 space-y-3"
          >
            <h4 className="font-medium text-foreground">Add New Emergency Contact</h4>

            <div className="grid grid-cols-1 gap-3">
              <Input
                placeholder="Contact Name"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-2xl"
              />

              <Input
                placeholder="Phone Number (+91XXXXXXXXXX)"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                className="rounded-2xl"
              />

              <Select
                value={newContact.relation}
                onValueChange={(value) => setNewContact(prev => ({ ...prev, relation: value }))}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Colleague">Colleague</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newContact.isPrimary}
                  onCheckedChange={(checked) => setNewContact(prev => ({ ...prev, isPrimary: checked }))}
                />
                <Label className="text-sm">Primary Contact (receives all alerts)</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddContact}
                className="flex-1 rounded-2xl"
                disabled={!newContact.name || !newContact.phone || !newContact.relation}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Contact
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddContact(false);
                  setNewContact({ name: '', phone: '', relation: '', isPrimary: false });
                }}
                className="rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <Button
          variant="outline"
          className="w-full rounded-2xl"
          onClick={async () => {
            try {
              await pdfExportService.exportUserData(user);
            } catch (error) {
              console.error('Export failed:', error);
            }
          }}
        >
          <FileText className="w-4 h-4 mr-2 text-purple-600" />
          Export Safety Data (PDF)
        </Button>
        
        <Button
          variant="destructive"
          className="w-full rounded-2xl"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground bg-muted/10 rounded-2xl p-4"
      >
        <p className="mb-1">🔒 Your data is encrypted and secure</p>
        <p>SafeGuard v1.0 • Made with ❤️ for women's safety</p>
      </motion.div>
    </div>
  );
}
