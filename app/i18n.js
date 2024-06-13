import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import english from './config/language/en.json';
import vietnamese from './config/language/vi.json';

const resources = {
  EN: { translation: english },
  VI: { translation: vietnamese }
};

export function initI18n(lng = 'VI') {
  i18n.use(initReactI18next).init({
    resources,
    lng,
    debug: true,
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });
}
initI18n(); // Initialize i18n with the default language

export default i18n;
