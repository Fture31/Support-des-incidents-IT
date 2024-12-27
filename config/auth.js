// config/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.cookies.authToken; // Récupérer le token JWT dans les cookies
    if (!token) {
        return res.redirect('/login'); // Rediriger vers la page de connexion si pas de token
    }

    // Vérifier et décoder le token JWT
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            return res.redirect('/login'); // Rediriger si le token est invalide ou expiré
        }
        req.user = user; // Stocker les infos utilisateur du JWT dans req.user
        next(); // Continuer vers la route suivante
    });
}

module.exports = authenticateToken;
