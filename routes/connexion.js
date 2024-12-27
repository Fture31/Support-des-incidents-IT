//inscription
const express = require('express');
const router = express.Router();
const connection = require('../config/database');
const bcrypt = require('bcrypt');
const session = require('express-session');// Configuration de session
router.use(session({
    secret: 'votre_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // changez à true en production
}));

// Route d'inscription
router.post('/connexion', async (req, res) => {
    const { loginUserName, loginUserPassword, loginUserEmail } = req.body;

    // Validation des entrées
    if (!loginUserName || !loginUserPassword || !loginUserEmail) {
        return res.status(400).send('Tous les champs sont requis.');
    }

  
     
        const query = 'INSERT INTO Person (name, password, email) VALUES (?, ?, ?)';
        connection.query(query, [loginUserName, loginUserPassword, loginUserEmail], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Erreur interne du serveur.');
            }
            res.render('page-login', { message: 'Inscription réussie ! Veuillez vous connecter.' });
        });
   
});

module.exports = router;
