import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import BeautySalonLogo from '@/components/BeautySalonLogo';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setAuthError(null);

    try {
      // Get stored users
      const existingUsers = JSON.parse(localStorage.getItem('sakhi_users') || '[]');
      
      // Find user by email
      const user = existingUsers.find((u: any) => u.email === email);
      
      if (!user) {
        setAuthError('No account found with this email. Please sign up first.');
        setIsSigningIn(false);
        return;
      }

      // Check password (in production, use proper password hashing)
      if (atob(user.password) !== password) {
        setAuthError('Incorrect password. Please try again.');
        setIsSigningIn(false);
        return;
      }

      // Set current user
      localStorage.setItem('sakhi_current_user', JSON.stringify(user));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Sign in failed:', error);
      setAuthError('Sign in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuestAccess = () => {
    const guestUser = {
      id: 'guest_' + Date.now(),
      name: 'Guest User',
      email: 'guest@sakhi.app',
      isGuest: true,
      language: 'en',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('sakhi_current_user', JSON.stringify(guestUser));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-pastel-pink/30 to-pearl-white -z-10" />
      <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-pastel-coral/10 to-pastel-lavender/20 -z-10" />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
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
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your Sakhi account ✨
            </p>
          </div>

          {/* Sign In Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSignIn}
            className="glass rounded-2xl p-6 shadow-beautiful space-y-4"
          >
            {/* Error Message */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm"
              >
                {authError}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-2xl"
                  placeholder="Enter your email"
                />
              </div>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 rounded-2xl"
                  placeholder="Enter your password"
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

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isSigningIn || !email || !password}
              className="w-full gradient-primary rounded-2xl h-12 text-white font-semibold hover-lift"
            >
              {isSigningIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
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

          {/* Guest Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleGuestAccess}
              className="w-full rounded-2xl h-12 border-2 border-accent/30 hover:border-accent hover-lift gradient-secondary"
            >
              <User className="w-5 h-5 mr-3" />
              Try Sakhi as Guest
              <span className="ml-2 text-xs opacity-75">(Explore features)</span>
            </Button>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button 
                className="text-primary font-medium hover:text-primary/80 transition-colors"
                onClick={() => window.location.href = '/signup'}
              >
                Sign Up
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
              <span>for women's safety & wellness</span>
            </div>
            <p>🔒 Your data is encrypted and secure</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
