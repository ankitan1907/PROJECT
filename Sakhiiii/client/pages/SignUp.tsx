import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  UserCheck,
  Shield,
  ArrowRight,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import BeautySalonLogo from '@/components/BeautySalonLogo';
import { Language } from '@shared/types';

interface SignUpForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  gender: 'female' | 'male' | 'other' | 'prefer-not-to-say';
  language: Language;
  acceptTerms: boolean;
}

export default function SignUp() {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const { currentLanguage, availableLanguages } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [form, setForm] = useState<SignUpForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 0,
    gender: 'female',
    language: currentLanguage,
    acceptTerms: false
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Create user account locally with localStorage for offline support
      const userData = {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        password: btoa(form.password), // Basic encoding (use proper hashing in production)
        age: form.age,
        gender: form.gender,
        language: form.language,
        createdAt: new Date().toISOString()
      };

      // Store user data locally
      const existingUsers = JSON.parse(localStorage.getItem('sakhi_users') || '[]');

      // Check if email already exists
      if (existingUsers.some((user: any) => user.email === form.email)) {
        alert('Email already exists. Please use a different email or sign in.');
        setIsLoading(false);
        return;
      }

      existingUsers.push(userData);
      localStorage.setItem('sakhi_users', JSON.stringify(existingUsers));
      localStorage.setItem('sakhi_current_user', JSON.stringify(userData));

      alert('Account created successfully! Welcome to Sakhi!');

      // Redirect to dashboard
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Sign up error:', error);
      alert('Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setGuestLoading(true);
    try {
      // Create guest user for immediate access
      const guestUser = {
        id: 'guest_' + Date.now(),
        name: 'Guest User',
        email: 'guest@sakhi.app',
        isGuest: true,
        language: currentLanguage,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('sakhi_current_user', JSON.stringify(guestUser));
      alert('Welcome! You can explore Sakhi as a guest.');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Guest access error:', error);
      alert('Failed to create guest account. Please try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-pastel-pink/30 to-pearl-white -z-10" />
      <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-pastel-coral/10 to-pastel-lavender/20 -z-10" />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <BeautySalonLogo size="lg" />
            </motion.div>
            <h1 className="brand-text text-3xl font-bold mb-2">
              Join Sakhi
            </h1>
            <p className="text-muted-foreground">
              Your safety companion awaits ✨
            </p>
          </div>

          {/* Sign Up Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSignUp}
            className="glass rounded-2xl p-6 shadow-beautiful space-y-4"
          >
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10 rounded-2xl"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10 rounded-2xl"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="100"
                required
                value={form.age || ''}
                onChange={(e) => setForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                className="rounded-2xl"
                placeholder="Enter your age"
              />
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <Label>Gender</Label>
              <RadioGroup
                value={form.gender}
                onValueChange={(value) => setForm(prev => ({ ...prev, gender: value as SignUpForm['gender'] }))}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                    <Label htmlFor="prefer-not-to-say" className="text-xs">Prefer not to say</Label>
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10 rounded-2xl"
                  placeholder="Create a password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pl-10 pr-10 rounded-2xl"
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={form.acceptTerms}
                onChange={(e) => setForm(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                I agree to the <span className="text-primary font-medium">Terms of Service</span> and{' '}
                <span className="text-primary font-medium">Privacy Policy</span>
              </Label>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading || !form.acceptTerms}
              className="w-full gradient-primary rounded-2xl h-12 text-white font-semibold hover-lift"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">Or explore as guest</span>
            </div>
          </div>

          {/* Guest Access Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            {/* Guest Access */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGuestAccess}
              disabled={guestLoading}
              className="w-full rounded-2xl h-12 border-2 border-accent/30 hover:border-accent hover-lift gradient-secondary"
            >
              {guestLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Setting up...
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5 mr-3" />
                  Try Sakhi as Guest
                  <span className="ml-2 text-xs opacity-75">(Explore features)</span>
                </>
              )}
            </Button>
          </motion.div>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button 
                className="text-primary font-medium hover:text-primary/80 transition-colors"
                onClick={() => window.location.href = '/signin'}
              >
                Sign In
              </button>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8 text-xs text-muted-foreground"
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-primary fill-current" />
              <span>for women's safety</span>
            </div>
            <p>🔒 Your data is encrypted and secure</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
