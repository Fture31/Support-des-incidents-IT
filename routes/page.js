//page.js
module.exports = function(io) {
    const express = require('express');
    const router = express.Router();
    const connection = require('../config/database');
    const authenticateToken = require('../config/auth'); // Assurez-vous d'importer le middleware

    // Route pour afficher une page spécifique
    router.get('/page/:id',  authenticateToken,(req, res) => {
        const id = req.params.id;

        // Afficher le post
        const contentQuery = `
        SELECT Posts.*, Person.Name as authorName 
        FROM Posts 
        JOIN Person ON Posts.userId = Person.id 
        WHERE Posts.id = ?
    `;
        connection.query(contentQuery, [id], (err, contentResults) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).send('Internal server error');
                return;
            }

            if (contentResults.length > 0) {
                const commentsQuery = `
                    SELECT Comments.*, Person.Name as commentAuthorName 
                    FROM Comments 
                    JOIN Person ON Comments.userId = Person.id 
                    WHERE Comments.postId = ?
                `;
                connection.query(commentsQuery, [id], (err, commentsResults) => {
                    if (err) {
                        console.error('Database error:', err);
                        res.status(500).send('Internal server error');
                        return;
                    }

                    res.render('page', {
                        items: contentResults,
                        comments: commentsResults,
                        username: req.user.name,
                    });
                });
            } else {
                res.send('No item found with that ID.');
            }
        });
    });

    // Route pour ajouter un commentaire
    router.post('/page/addComment', authenticateToken, (req, res) => {
        const { postId, content } = req.body;
        const userId = req.user.id; // Utiliser req.user.id au lieu de req.session.userId
      
        if (!postId || !userId || !content) {
            return res.status(400).send('All fields are required');
        }

        // Ajouter un commentaire
        const query = 'INSERT INTO Comments (postId, userId, content) VALUES (?, ?, ?)';
        connection.query(query, [postId, userId, content], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).send('Internal server error');
                return;
            }

            const postQuery = 'SELECT userId FROM Posts WHERE id = ?';
            connection.query(postQuery, [postId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    res.status(500).send('Internal server error');
                    return;
                }

                const authorId = results[0].userId;
                
                if (userId !== authorId) {
                    const notificationMessage = `Nouveau commentaire sur votre post: ${content}`;
                    const notificationQuery = 'INSERT INTO Notifications (userId, message, postId) VALUES (?, ?, ?)';
                    connection.query(notificationQuery, [authorId, notificationMessage, postId], (err) => {
                        if (err) {
                            console.error('Database error:', err);
                            return;
                        }
                    });

                    // Envoyer une notification en temps réel via Socket.IO à l'auteur du post
                    io.to('join_room').emit('new_comment', { postId, userId, content });
                }

                res.redirect(`/page/${postId}`);

            });
        });
    });

    // Route pour afficher les notifications
  
    router.get('/notification', authenticateToken, (req, res) => {
        const perPage = 5; // Nombre d'éléments par page
        const page = parseInt(req.query.page) || 1;
        const offset = (perPage * page) - perPage;
    
        const userId = req.user.id; // Utiliser req.user.id au lieu de req.session.userId

        if (!userId) {
            return res.status(401).send('User not logged in');
        }
    
        // const query = `
        // SELECT Notifications.*, Posts.libelle, Posts.type, Person.Name as commenterName
        // FROM Notifications
        // JOIN Posts ON Notifications.postId = Posts.id
        // JOIN Comments ON Notifications.postId = Comments.postId
        // JOIN Person ON Comments.userId = Person.id
        // WHERE Notifications.userId = ?
        // ORDER BY Notifications.createdAt DESC
        //     LIMIT ? OFFSET ?
        // `;
            
        const query = `
        SELECT 
            Notifications.*, 
            Posts.libelle, 
            Posts.type, 
            Person.Name as commenterName
        FROM Notifications
        LEFT JOIN Posts ON Notifications.postId = Posts.id
        LEFT JOIN Comments ON Notifications.postId = Comments.postId
        LEFT JOIN Person ON Comments.userId = Person.id
        WHERE Notifications.userId = ?
        ORDER BY Notifications.createdAt DESC
        LIMIT ? OFFSET ?
    `;
//     const query = `
//     SELECT 
//         Notifications.*, 
//         Posts.libelle, 
//         Posts.type, 
//         Poster.Name AS posterName,  
//         Poster.avatar AS posterAvatar
//     FROM Notifications
//     LEFT JOIN Posts ON Notifications.postId = Posts.id
//     LEFT JOIN Person AS Poster ON Posts.userId = Poster.id
//     WHERE Notifications.userId = ?
//     ORDER BY Notifications.createdAt DESC
//     LIMIT ? OFFSET ?;
// `;





    

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM Notifications 
            WHERE Notifications.userId = ?
        `;
    
        // Exécution des requêtes SQL
        connection.query(countQuery, [userId], (err, countResult) => {
            if (err) {
                console.error('MySQL error:', err);
                return res.status(500).send('Internal server error');
            }
    
            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / perPage);
    
            connection.query(query, [userId, perPage, offset], (err, results) => {
                if (err) {
                    console.error('MySQL error:', err);
                    return res.status(500).send('Internal server error');
                }
    
                res.render('notification', {
                    notifications: results,
                    username: req.user.name,
                    currentPage: page,
                    totalPages: totalPages,
                });
            });
        });
    });
    
    router.post('/mark-notifications-read', authenticateToken, (req, res) => {
        const userId = req.user.id;
    
        const query = 'UPDATE Notifications SET isRead = 1 WHERE userId = ? AND isRead = 0';
        connection.query(query, [userId], (err) => {
            if (err) {
                console.error('Erreur MySQL :', err);
                return res.status(500).send('Erreur interne du serveur');
            }
    
            res.sendStatus(200);  // Réponse OK
        });
    });
    
    return router;
};
