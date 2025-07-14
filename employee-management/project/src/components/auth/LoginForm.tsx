import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter both email and password');
      }
      
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // For demo purposes, add a quick login function
  const handleDemoLogin = async () => {
    setEmail('admin@example.com');
    setPassword('password123');
    
    setIsSubmitting(true);
    try {
      const success = await login('admin@example.com', 'password123');
      if (success) {
        navigate('/dashboard');
      } else {
        throw new Error('Demo login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        autoFocus
      />
      
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      
      <div>
        <Button 
          type="submit" 
          fullWidth 
          disabled={isSubmitting}
          icon={<LogIn size={18} />}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>
      
      <Button 
        type="button"
        variant="outline"
        fullWidth
        onClick={handleDemoLogin}
      >
        Demo Login (admin@example.com)
      </Button>
    </form>
  );
};

export default LoginForm;