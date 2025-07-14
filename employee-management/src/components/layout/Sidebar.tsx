import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UserPlus, Users, BookOpen, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Home' },
    { to: '/employees/add', icon: <UserPlus size={20} />, label: 'Add Employee' },
    { to: '/employees', icon: <Users size={20} />, label: 'View Employees' },
    { to: '/hindi-knowledge', icon: <BookOpen size={20} />, label: 'Knowledge of Hindi' },
    { to: '/print', icon: <FileText size={20} />, label: 'Print Employees' },
  ];

  const linkClasses = 'flex items-center px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors';
  const activeLinkClasses = 'bg-primary-50 text-primary-600 font-medium';

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full bg-white shadow-lg transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 lg:w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <h1 className="text-xl font-semibold text-primary-700">
              Employee Management
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${linkClasses} ${isActive ? activeLinkClasses : ''}`
                }
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;