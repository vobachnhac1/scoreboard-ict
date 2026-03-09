import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const LanguageSwitcher = ({ className = '', compact = false }) => {
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
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Language Toggle Button */}
      <div className={`flex ${compact ? 'flex-col' : 'flex-row items-center'} gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 shadow-inner border border-slate-200/50 dark:border-slate-600/50`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChangeLanguage(lang.code)}
            className={`
              group relative inline-flex items-center justify-center ${compact ? 'px-2 py-2 w-10 h-10' : 'px-3 py-2 w-16 h-10'} rounded-lg
              transition-all duration-300 font-bold text-sm overflow-hidden
              ${language === lang.code 
                ? 'bg-white dark:bg-slate-600 shadow-md scale-100 ring-1 ring-slate-200 dark:ring-slate-500' 
                : 'hover:bg-slate-200 dark:hover:bg-slate-600 scale-95 opacity-70 hover:opacity-100'
              }
            `}
            title={lang.label}
            aria-label={`Switch to ${lang.label}`}
          >
            {/* Background gradient for active language */}
            {language === lang.code && (
              <div className={`absolute inset-0 bg-gradient-to-br ${lang.gradient} opacity-10 rounded-md`}></div>
            )}

            <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${compact ? '' : 'mr-1.5'}`}>
              {lang.flag}
            </span>

            {/* Language code */}
            {!compact && (
              <span className={`
                relative z-10 transition-colors duration-300
                ${language === lang.code 
                  ? 'text-slate-900 dark:text-white font-black' 
                  : 'text-slate-600 dark:text-slate-400 font-bold'
                }
              `}>
                {lang.shortLabel}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;

