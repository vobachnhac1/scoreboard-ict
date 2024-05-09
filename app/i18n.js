import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import english from './config/language/en.json';
import vietnamese from './config/language/vi.json';

const resources = {
  en: { translation: english },
  vi: { translation: vietnamese }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'vi', // default language
  debug: true,
  interpolation: {
    escapeValue: false // react already safes from xss
  }
});

export default i18n;
