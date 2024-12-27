const express = require('express');
const router = express.Router();
const connection = require('../config/database');
const authenticateToken = require('../config/auth'); // Assurez-vous d'importer le middleware

router.get('/search',  authenticateToken,(req, res) => {
    const query = req.query.q;
    const sqlQuery = `
        SELECT Posts.id, Posts.libelle AS text, Posts.createdAt,'post' AS type
        FROM Posts
        WHERE Posts.libelle LIKE ? OR Posts.content LIKE ?
        UNION ALL
        SELECT Comments.id, Comments.createdAt,Comments.content AS text, 'Comment' AS type
        FROM Comments
        JOIN Posts ON Comments.postId = Posts.id
        WHERE Comments.content LIKE ?
    `;
    const searchTerm = `%${query}%`;

    connection.query(sqlQuery, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Erreur lors de la recherche :', err);
            return res.status(500).json({ error: 'Erreur lors de la recherche.' });
        }
        
        res.render ('searchResults', { items: results, query: query, username:  req.user.name,}); // Renvoie les résultats de la recherche sous forme de JSON
    });
});

module.exports = router;
