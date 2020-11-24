/* eslint-disable @typescript-eslint/no-var-requires */
import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { Constants } from './models/constants';

const getLanguage = (): string => {
  return localStorage.getItem(Constants.LANGUAGE_STATE_KEY) || 'en';
};

i18n
  .use(detector)
  .use(backend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    saveMissing: false,

    keySeparator: '.', // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: `${Constants.CLIENT_BASE_PATH}locales/{{lng}}/{{ns}}.json`,
    },
    react: {
    },
    defaultNS: 'translation',
    lng: getLanguage(),
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    initImmediate: false,
  });

export default i18n;