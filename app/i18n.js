import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import english from './config/language/en.json';
import vietnamese from './config/language/vi.json';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: { translation: english },
  vi: { translation: vietnamese }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'vi', // default language
    debug: true,
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
