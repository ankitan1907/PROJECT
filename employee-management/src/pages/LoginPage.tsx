import React from 'react';
import { Building2 } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform rotate-12 transition-transform hover:rotate-0">
              <Building2 size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-xl p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;