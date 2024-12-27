const express = require('express');
const router = express.Router();

router.get('/logout', (req, res) => {
    // Supprimer le token JWT en supprimant le cookie
    res.clearCookie('authToken');

    // Terminer la session si vous utilisez des sessions
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion:', err);
            return res.status(500).send('Erreur lors de la déconnexion');
        }

        // Rediriger l'utilisateur vers la page de connexion ou la page d'accueil
        res.redirect('/');
    });
});

module.exports = router;
