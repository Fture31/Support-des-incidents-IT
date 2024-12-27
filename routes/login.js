// routes/login.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const connection = require('../config/database');

router.post('/login', (req, res) => {
    const { loginUserName, loginUserPassword } = req.body;

    const query = 'SELECT * FROM Person WHERE email = ? AND password = ?';
    connection.query(query, [loginUserName, loginUserPassword], (err, results) => {
        if (err) {
            console.error('Erreur de base de données:', err);
            return res.status(500).send('Erreur serveur interne');
        }

        if (results.length > 0) {
            const user = { id: results[0].id, name: results[0].Name };

            // Créer un token JWT valide pour 15 jours
            const token = jwt.sign(user, 'your_jwt_secret', { expiresIn: '15d' });


            // Stocker le token dans un cookie HTTP
            res.cookie('authToken', token, { 
                httpOnly: true, 
                maxAge: 15 * 24 * 60 * 60 * 1000 ,
                secure: false  // Assurez-vous que 'secure' est à 'true' si vous utilisez HTTPS
            }); // 15 jours

            // Rediriger vers une page sécurisée
            return res.redirect('/page-categories');
        } else {
            return res.status(401).send('Nom d\'utilisateur ou mot de passe incorrect');
        }
    });
});

module.exports = router;
