const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');
const fs = require('fs');

// Create locales directory if it doesn't exist
const localesPath = path.join(__dirname, '../locales');
if (!fs.existsSync(localesPath)) {
  fs.mkdirSync(localesPath, { recursive: true });
}

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    preload: ['en', 'es'],
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/translation.json')
    },
    detection: {
      order: ['header', 'querystring'],
      caches: false
    }
  });

module.exports = i18next;