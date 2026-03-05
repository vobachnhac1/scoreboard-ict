import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const LanguageSwitcher = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);

  const languages = [
    { 
      code: 'VI', 
      label: 'Tiếng Việt', 
      shortLabel: 'VI',
      flag: '🇻🇳',
      gradient: 'from-red-500 to-yellow-500'
    },
    { 
      code: 'EN', 
      label: 'English', 
      shortLabel: 'EN',
      flag: '🇬🇧',
      gradient: 'from-blue-500 to-red-500'
    }
  ];

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  const handleChangeLanguage = (langCode) => {
    if (langCode !== language) {
      dispatch({ type: 'SET_LANGUAGE', payload: langCode });
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Language Toggle Button */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChangeLanguage(lang.code)}
            className={`
              group relative inline-flex items-center justify-center px-3 py-2 rounded-md
              transition-all duration-300 font-semibold text-sm
              ${language === lang.code 
                ? 'bg-white dark:bg-gray-600 shadow-md scale-105' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
            title={lang.label}
            aria-label={`Switch to ${lang.label}`}
          >
            {/* Background gradient for active language */}
            {language === lang.code && (
              <div className={`absolute inset-0 bg-gradient-to-br ${lang.gradient} opacity-10 rounded-md`}></div>
            )}

            {/* Flag emoji */}
            <span className="text-lg mr-1.5 transition-transform duration-300 group-hover:scale-110">
              {lang.flag}
            </span>

            {/* Language code */}
            <span className={`
              relative z-10 transition-colors duration-300
              ${language === lang.code 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-gray-400'
              }
            `}>
              {lang.shortLabel}
            </span>

            {/* Active indicator */}
            {language === lang.code && (
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;

