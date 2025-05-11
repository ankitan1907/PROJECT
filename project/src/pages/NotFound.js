import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-ocean-light" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19L19 12L22 15L15 22L12 19Z" fill="currentColor" />
            <path 
              d="M2 22V20H4V22H2ZM2 19V17H4V19H2ZM5 22V20H7V22H5ZM5 19V17H7V19H5ZM5 16V14H7V16H5ZM8 22V20H10V22H8ZM8 19V17H10V19H8ZM8 16V14H10V16H8ZM8 13V11H10V13H8ZM11 22V20H13V22H11ZM11 19V17H13V19H11ZM11 16V14H13V16H11ZM11 13V11H13V13H11ZM11 10V8H13V10H11ZM14 19V17H16V19H14ZM14 16V14H16V16H14ZM14 13V11H16V13H14ZM14 10V8H16V10H14ZM14 7V5H16V7H14ZM17 16V14H19V16H17ZM17 13V11H19V13H17ZM17 10V8H19V10H17ZM17 7V5H19V7H17ZM17 4V2H19V4H17ZM20 13V11H22V13H20ZM20 10V8H22V10H20ZM20 7V5H22V7H20ZM20 4V2H22V4H20Z" 
              fill="currentColor" opacity="0.5"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The ocean page you're looking for seems to have drifted away. Let's navigate back to charted waters.
        </p>
        
        <Link
          to="/"
          className="btn-primary inline-flex items-center px-6 py-3"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
          </svg>
          Back to Dashboard
        </Link>
      </motion.div>
      
      {/* Ocean wave animation */}
      <div className="w-full absolute bottom-0 left-0 overflow-hidden">
        <svg className="w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path 
            fill="#CAF0F8" fillOpacity="0.3"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave"
          ></path>
          <path 
            fill="#90E0EF" fillOpacity="0.4"
            d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,106.7C672,117,768,171,864,176C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave"
            style={{ animationDelay: '0.3s' }}
          ></path>
          <path 
            fill="#00B4D8" fillOpacity="0.5"
            d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,277.3C960,288,1056,288,1152,261.3C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave"
            style={{ animationDelay: '0.6s' }}
          ></path>
          <path 
            fill="#0077B6" fillOpacity="0.7"
            d="M0,160L48,170.7C96,181,192,203,288,229.3C384,256,480,288,576,272C672,256,768,192,864,176C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave"
            style={{ animationDelay: '0.9s' }}
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default NotFound;