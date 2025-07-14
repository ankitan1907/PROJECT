import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Language } from '../../types';
import { LANGUAGES } from '../../data/mockData';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelector = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggleSelector}
        className="flex items-center space-x-2 p-2 rounded-full bg-gray-800 text-blue-400 hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="w-5 h-5" />
        <span className="font-semibold">
          {LANGUAGES.find(lang => lang.code === selectedLanguage)?.flag || '🌐'}
        </span>
      </motion.button>

      {isOpen && (
        <motion.div 
          className="absolute left-0 mt-2 p-2 bg-gray-800 rounded-lg shadow-lg z-10 w-64"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {LANGUAGES.map((language: Language) => (
              <motion.button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  selectedLanguage === language.code 
                    ? 'bg-blue-900 text-white' 
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
                whileHover={{ scale: 1.05, backgroundColor: '#1e40af' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{language.flag}</span>
                <span className="text-xs mt-1">{language.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LanguageSelector;