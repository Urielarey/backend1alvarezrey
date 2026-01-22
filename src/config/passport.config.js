const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Configuración de la estrategia JWT
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET || 'tu_secret_key_super_segura_cambiar_en_produccion'
};

// Estrategia JWT para autenticación
passport.use('jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
	try {
		const user = await User.findById(payload.sub).select('-password');
		
		if (!user) {
			return done(null, false);
		}
		
		return done(null, user);
	} catch (error) {
		return done(error, false);
	}
}));

// Estrategia "current" para validar usuario logueado
passport.use('current', new JwtStrategy(jwtOptions, async (payload, done) => {
	try {
		const user = await User.findById(payload.sub).select('-password');
		
		if (!user) {
			return done(null, false, { message: 'Usuario no encontrado' });
		}
		
		return done(null, user);
	} catch (error) {
		return done(error, false);
	}
}));

module.exports = passport;


