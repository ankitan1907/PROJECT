import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTimes, FaHome, FaGlobe, FaExclamationTriangle, 
  FaFish, FaHistory, FaCloudRain, FaFlask 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <FaHome /> },
    { path: '/map', name: 'Ocean Map', icon: <FaGlobe /> },
    { path: '/anomalies', name: 'Anomaly Detection', icon: <FaExclamationTriangle /> },
    { path: '/biodiversity', name: 'Biodiversity', icon: <FaFish /> },
    { path: '/timeline', name: 'Timeline', icon: <FaHistory /> },
    { path: '/disasters', name: 'Disaster Predictions', icon: <FaCloudRain /> },
    { path: '/research', name: 'Research Mode', icon: <FaFlask /> }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-ocean-darkest transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto`}
        initial={false}
      >
        {/* Sidebar header */}
        <div className="px-4 py-5 flex items-center justify-between text-white border-b border-ocean-dark">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-ocean rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
              </svg>
            </div>
            <h1 className="ml-3 text-lg font-semibold tracking-wider">OceanEye</h1>
          </div>

          <button 
            onClick={toggleSidebar} 
            className="lg:hidden text-white p-1 rounded-md hover:bg-ocean-dark"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-ocean text-white' : 'text-gray-300 hover:bg-ocean-dark hover:text-white'}` 
                  }
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar footer */}
        <div className="p-4 border-t border-ocean-dark text-xs text-gray-400">
          <p>© 2025 OceanEye</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
