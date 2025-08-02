import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@shared/types';
import { googleAuth } from '@/services/googleAuth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

// Mock Google Sign-In response
interface GoogleSignInResponse {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('sakhi_current_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Convert memberSince back to Date if it exists
        if (parsedUser.memberSince) {
          parsedUser.memberSince = new Date(parsedUser.memberSince);
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('sakhi_current_user');
      }
    }
    setIsLoading(false);
  }, []);

  const mockGoogleSignIn = async (): Promise<GoogleSignInResponse> => {
    // Simulate Google Sign-In with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUsers = [
      { id: '1', email: 'priya.sharma@gmail.com', name: 'Priya Sharma', picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
      { id: '2', email: 'ananya.krishnan@gmail.com', name: 'Ananya Krishnan', picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
      { id: '3', email: 'kavya.reddy@gmail.com', name: 'Kavya Reddy', picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
    ];
    
    // Return random user for demo
    return mockUsers[Math.floor(Math.random() * mockUsers.length)];
  };

  const signIn = async () => {
    setIsLoading(true);
    try {
      // Try real Google Sign-in first, fallback to mock
      let googleResponse: GoogleSignInResponse;
      let usingRealAuth = false;

      try {
        const realGoogleUser = await googleAuth.signIn();
        googleResponse = {
          id: realGoogleUser.id,
          email: realGoogleUser.email,
          name: realGoogleUser.name,
          picture: realGoogleUser.picture
        };
        usingRealAuth = true;
        console.log('✅ Real Google Sign-in successful:', realGoogleUser);
      } catch (error) {
        console.warn('Real Google Sign-in failed, using mock:', error.message || error);

        // Show user a message about fallback
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('Demo Mode', {
            body: 'Using demo authentication. Real Google Sign-in will work with proper API keys.',
            icon: '/favicon.ico'
          });
        }

        googleResponse = await mockGoogleSignIn();
      }
      
      // Check if user exists in our system
      const existingUser = localStorage.getItem(`user-${googleResponse.id}`);
      
      if (existingUser) {
        // Returning user
        const userData = JSON.parse(existingUser);
        userData.memberSince = new Date(userData.memberSince);
        setUser(userData);
        localStorage.setItem('sakhi_current_user', JSON.stringify(userData));
      } else {
        // New user - create profile with minimal info
        const newUser: User = {
          id: googleResponse.id,
          name: googleResponse.name,
          email: googleResponse.email,
          avatar: googleResponse.picture,
          age: 0, // Will be set in profile setup
          gender: 'female', // Default, will be set in profile setup
          memberSince: new Date(),
          language: 'en', // Will inherit from current language context
          profileComplete: false,
        };
        
        setUser(newUser);
        localStorage.setItem('sakhi_current_user', JSON.stringify(newUser));
        localStorage.setItem(`user-${newUser.id}`, JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // Sign out from Google if signed in
      try {
        await googleAuth.signOut();
        console.log('✅ Google sign-out successful');
      } catch (error) {
        console.warn('Google sign-out error:', error);
      }

      // Simulate sign out delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setUser(null);
      localStorage.removeItem('sakhi_current_user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // Reuse the existing signIn logic for Google authentication
    await signIn();
  };

  const signInAsGuest = async () => {
    setIsLoading(true);
    try {
      // Create a guest user
      const guestUser: User = {
        id: `guest-${Date.now()}`,
        email: 'guest@sakhi.app',
        name: 'Guest User',
        avatar: null,
        memberSince: new Date(),
        isGuest: true,
        age: 0,
        gender: 'prefer-not-to-say',
        language: 'en'
      };

      setUser(guestUser);
      localStorage.setItem('sakhi_current_user', JSON.stringify(guestUser));

      // Show notification about limited features
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Guest Mode', {
          body: 'You are using Sakhi as a guest. Some features may be limited.',
          icon: '/favicon.ico'
        });
      }

      console.log('✅ Guest access granted');
    } catch (error) {
      console.error('Guest sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('sakhi_current_user', JSON.stringify(updatedUser));
    if (!user.isGuest) {
      localStorage.setItem(`user-${updatedUser.id}`, JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
