require('dotenv').config(); // ← ADD THIS LINE TO LOAD ENVIRONMENT VARIABLES

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const userRepository = require('../repositories/user.repository');

/**
 * Passport.js JWT Authentication Strategy
 *
 * This configures Passport to use JWT for authentication.
 * When a request comes in with a JWT token, Passport:
 * 1. Extracts the token from the Authorization header
 * 2. Verifies it using the JWT_SECRET
 * 3. Calls this strategy with the decoded payload
 * 4. Loads the user from database and attaches to req.user
 */

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: false
};

/**
 * Configure Passport with JWT strategy
 * @param {Object} passport - Passport instance
 */
module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        // jwt_payload contains: { id, email, role, language, iat, exp }
        const user = await userRepository.findById(jwt_payload.id);

        if (user) {
          // User found - attach to req.user
          return done(null, user);
        }

        // No user found - token is valid but user doesn't exist
        return done(null, false);
      } catch (error) {
        // Error occurred while fetching user
        console.error('Passport JWT strategy error:', error);
        return done(error, false);
      }
    })
  );
};