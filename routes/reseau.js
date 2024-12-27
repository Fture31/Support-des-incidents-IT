
const express = require('express');
const router = express.Router();
const connection = require('../config/database');
const authenticateToken = require('../config/auth'); // Assurez-vous d'importer le middleware

// Route pour la page de Maintenance
router.get('/reseau',  authenticateToken,(req, res) => {
    const perPage = 5; // Nombre d'éléments par page
    const page = parseInt(req.query.page) || 1;
    const offset = (perPage * (page - 1));

    const userId = req.user.id; // Utiliser req.user.id au lieu de req.session.userId

    if (!userId) {
        return res.status(401).send('User not logged in');
    }

    const query = `
        SELECT * FROM Posts 
        WHERE type = 'reseau'
        LIMIT ?, ?`;

    const countQuery = `
        SELECT COUNT(*) as total 
        FROM Posts 
        WHERE type = 'reseau'`;

    // Première requête pour obtenir le nombre total d'éléments
    connection.query(countQuery, (err, countResult) => {
        if (err) {
            console.error('MySQL error:', err);
            return res.status(500).send('Internal server error');
        }

        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / perPage);

        // Deuxième requête pour obtenir les éléments paginés
        connection.query(query, [offset, perPage], (err, results) => {
            if (err) {
                console.error('MySQL error:', err);
                return res.status(500).send('Internal server error');
            }

            res.render('reseau', {
                items: results,
                username: req.user.name,
                currentPage: page,
                totalPages: totalPages
            });
        });
    });
});

module.exports = router;

