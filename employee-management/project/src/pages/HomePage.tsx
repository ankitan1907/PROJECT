import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Layout title="Dashboard">
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {currentUser?.username || 'User'}
          </h1>
          <p className="text-gray-600">
            Employee Management System
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;