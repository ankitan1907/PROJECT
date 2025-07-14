import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, toggleSidebar }) => {
  const { currentUser } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md lg:hidden text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-1 text-gray-600 rounded-full hover:text-gray-800 hover:bg-gray-100 focus:outline-none">
          <Bell size={20} />
        </button>

        <div className="relative">
          <div className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-gray-100">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full">
              <User size={18} />
            </div>
            <span className="hidden md:block font-medium text-sm">
              {currentUser?.username || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;