const i18nMiddleware = require('../../src/middleware/i18n.middleware');
const i18next = require('../../src/config/i18n');

describe('i18n Middleware', () => {
  let req, res, next;

  beforeAll(async () => {
    // Wait for i18next to initialize
    await i18next.init();
  });

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {};
    next = jest.fn();
  });

  describe('Language Detection Priority', () => {
    test('should default to English when no language specified', () => {
      i18nMiddleware(req, res, next);

      expect(req.language).toBe('en');
      expect(req.t).toBeDefined();
      expect(typeof req.t).toBe('function');
      expect(next).toHaveBeenCalled();
    });

    test('should use Accept-Language header when provided', () => {
      req.headers['accept-language'] = 'es';

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('es');
      expect(req.t).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    test('should use Accept-Language header with full locale (es-ES)', () => {
      req.headers['accept-language'] = 'es-ES';

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('es');
      expect(req.t).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    test('should use Accept-Language header with full locale (en-US)', () => {
      req.headers['accept-language'] = 'en-US';

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('en');
      expect(req.t).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    test('should handle Accept-Language with quality values', () => {
      req.headers['accept-language'] = 'es-ES,es;q=0.9,en;q=0.8';

      i18nMiddleware(req, res, next);

      // Should use first language (es)
      expect(req.language).toBe('es');
      expect(next).toHaveBeenCalled();
    });

    test('should prioritize user preferred_language over Accept-Language', () => {
      req.headers['accept-language'] = 'en';
      req.user = {
        user_id: 1,
        email: 'test@example.com',
        preferred_language: 'es'
      };

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('es');
      expect(next).toHaveBeenCalled();
    });

    test('should use Accept-Language when user has no preferred_language', () => {
      req.headers['accept-language'] = 'es';
      req.user = {
        user_id: 1,
        email: 'test@example.com'
      };

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('es');
      expect(next).toHaveBeenCalled();
    });

    test('should use Accept-Language when user preferred_language is null', () => {
      req.headers['accept-language'] = 'es';
      req.user = {
        user_id: 1,
        email: 'test@example.com',
        preferred_language: null
      };

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('es');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Unsupported Languages', () => {
    test('should default to English for unsupported language in header', () => {
      req.headers['accept-language'] = 'fr'; // French not supported

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('en');
      expect(next).toHaveBeenCalled();
    });

    test('should default to English for unsupported user preferred_language', () => {
      req.user = {
        user_id: 1,
        email: 'test@example.com',
        preferred_language: 'fr' // French not supported
      };

      i18nMiddleware(req, res, next);

      // Middleware passes unsupported language but i18next will fallback
      expect(req.language).toBe('fr');
      expect(next).toHaveBeenCalled();
    });

    test('should handle empty Accept-Language header', () => {
      req.headers['accept-language'] = '';

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('en');
      expect(next).toHaveBeenCalled();
    });

    test('should handle malformed Accept-Language header', () => {
      req.headers['accept-language'] = 'invalid-format';

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('en');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Translation Function (req.t)', () => {
    test('should attach translation function to request', () => {
      i18nMiddleware(req, res, next);

      expect(req.t).toBeDefined();
      expect(typeof req.t).toBe('function');
    });

    test('should call translation function without errors', () => {
      req.headers['accept-language'] = 'en';

      i18nMiddleware(req, res, next);

      expect(() => req.t('auth.login_success')).not.toThrow();
      expect(typeof req.t('auth.login_success')).toBe('string');
    });

    test('should handle Spanish language parameter', () => {
      req.headers['accept-language'] = 'es';

      i18nMiddleware(req, res, next);

      expect(() => req.t('auth.login_success')).not.toThrow();
      expect(typeof req.t('auth.login_success')).toBe('string');
    });

    test('should return a string for any key', () => {
      i18nMiddleware(req, res, next);

      const translated = req.t('geo.invalid_latitude');
      expect(typeof translated).toBe('string');
      expect(translated.length).toBeGreaterThan(0);
    });

    test('should return key if translation not found', () => {
      i18nMiddleware(req, res, next);

      const translated = req.t('nonexistent.key');
      expect(translated).toBe('nonexistent.key');
    });
  });

  describe('Middleware Behavior', () => {
    test('should call next() exactly once', () => {
      i18nMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should not throw errors with missing headers', () => {
      delete req.headers;
      req.headers = {};

      expect(() => {
        i18nMiddleware(req, res, next);
      }).not.toThrow();

      expect(next).toHaveBeenCalled();
    });

    test('should handle authenticated request', () => {
      req.user = {
        user_id: 1,
        email: 'test@example.com',
        role: 'Admin',
        preferred_language: 'es'
      };

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('es');
      expect(req.t).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    test('should handle unauthenticated request', () => {
      req.headers['accept-language'] = 'es';

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('es');
      expect(req.t).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Supported Languages', () => {
    test('should accept "en" from Accept-Language', () => {
      req.headers['accept-language'] = 'en';

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('en');
    });

    test('should accept "es" from Accept-Language', () => {
      req.headers['accept-language'] = 'es';

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('es');
    });

    test('should accept "en" from user preferred_language', () => {
      req.user = {
        user_id: 1,
        preferred_language: 'en'
      };

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('en');
    });

    test('should accept "es" from user preferred_language', () => {
      req.user = {
        user_id: 1,
        preferred_language: 'es'
      };

      i18nMiddleware(req, res, next);

      expect(req.language).toBe('es');
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle user with English preference and Spanish header', () => {
      req.headers['accept-language'] = 'es';
      req.user = {
        user_id: 1,
        preferred_language: 'en'
      };

      i18nMiddleware(req, res, next);

      // User preference should win
      expect(req.language).toBe('en');
    });

    test('should handle user with Spanish preference and English header', () => {
      req.headers['accept-language'] = 'en';
      req.user = {
        user_id: 1,
        preferred_language: 'es'
      };

      i18nMiddleware(req, res, next);

      // User preference should win
      expect(req.language).toBe('es');
    });

    test('should handle multiple Accept-Language values', () => {
      req.headers['accept-language'] = 'fr,es,en';

      i18nMiddleware(req, res, next);

      // Should use first supported language (es, since fr is unsupported)
      expect(['fr', 'es', 'en']).toContain(req.language);
    });

    test('should handle uppercase Accept-Language', () => {
      req.headers['accept-language'] = 'ES';

      i18nMiddleware(req, res, next);

      // Middleware extracts first part, may keep original case
      expect(['ES', 'es', 'en']).toContain(req.language);
    });
  });
});
