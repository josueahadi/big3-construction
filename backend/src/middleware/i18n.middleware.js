const i18next = require('../config/i18n');

/**
 * Internationalization middleware
 * Detects user language preference with priority:
 * 1. User's preferred_language from database (if authenticated)
 * 2. Accept-Language HTTP header
 * 3. Default English ('en')
 */
function i18nMiddleware(req, res, next) {
  let language = 'en';

  // Priority 1: User's preferred language from database
  if (req.user && req.user.preferred_language) {
    language = req.user.preferred_language;
  } 
  // Priority 2: Accept-Language header
  else if (req.headers['accept-language']) {
    const headerLang = req.headers['accept-language'].split(',')[0].split('-')[0];
    if (['en', 'es'].includes(headerLang)) {
      language = headerLang;
    }
  }

  // Set language for this request and attach translation function
  req.language = language;
  req.t = i18next.getFixedT(language);
  
  next();
}

module.exports = i18nMiddleware;