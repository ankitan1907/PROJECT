import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaBell, FaSearch, FaUser } from 'react-icons/fa';

const Navbar = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (showNotifications) setShowNotifications(false);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showDropdown) setShowDropdown(false);
  };

  const notifications = [
    { id: 1, message: "Temperature anomaly detected in the Pacific", time: "2 mins ago", type: "warning" },
    { id: 2, message: "New research data uploaded", time: "1 hour ago", type: "info" },
    { id: 3, message: "Tsunami prediction updated", time: "3 hours ago", type: "danger" },
  ];

  return (
    <nav className="bg-white shadow-sm z-10">
      <div className="px-4 py-3 md:py-2 mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side - Menu toggle and logo for mobile */}
          <div className="flex items-center">
            <button 
              className="text-ocean-dark p-2 rounded-md lg:hidden"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <FaBars className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center ml-2 md:ml-0">
              <span className="text-xl font-bold text-ocean-darkest tracking-tight hidden md:block">OceanEye</span>
            </Link>
          </div>
          
          {/* Middle - Search */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-ocean-medium"
                placeholder="Search oceans, anomalies, species..."
              />
            </div>
          </div>
          
          {/* Right side - Notifications and Profile */}
          <div className="flex items-center">
            {/* Notifications */}
            <div className="relative ml-3">
              <button
                onClick={toggleNotifications}
                className="p-2 rounded-full text-gray-600 hover:text-ocean-medium focus:outline-none"
                aria-label="View notifications"
              >
                <FaBell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-coral"></span>
              </button>
              
              {/* Notification dropdown */}
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">Notifications</h3>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-start">
                            <div className={`h-2 w-2 rounded-full mt-1.5 mr-2 ${
                              notification.type === 'warning' ? 'bg-warning' : 
                              notification.type === 'danger' ? 'bg-danger' : 'bg-ocean'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-2">
                      <button className="w-full px-4 py-2 text-sm text-center text-ocean-medium hover:text-ocean-dark">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile dropdown */}
            <div className="relative ml-3">
              <button
                onClick={toggleDropdown}
                className="flex items-center text-sm rounded-full focus:outline-none"
                id="user-menu-button"
                aria-expanded={showDropdown}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-ocean-dark flex items-center justify-center text-white">
                  <FaUser className="h-4 w-4" />
                </div>
              </button>
              
              {/* Dropdown menu */}
              {showDropdown && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                >
                  <div className="py-1" role="none">
                    <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Your Profile</a>
                    <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</a>
                    <a href="#help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Help Center</a>
                    <div className="border-t border-gray-100"></div>
                    <a href="#signout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Sign out</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;