// creer un post
module.exports = function(io) {
    const express = require('express');
    const router = express.Router();
    const connection = require('../config/database');
    const multer = require('multer');
    const path = require('path');
    const authenticateToken = require('../config/auth');

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            // cb(null, '/home/begade/Documents/projet/forum2019/public/image/post');
            cb(null, path.join(__dirname, '../public/image/post'));
           
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });

    const upload = multer({ storage: storage });

    router.post('/page-create-topic', authenticateToken, upload.single('image'), (req, res) => {
        const { type, libelle, content } = req.body;
        const userId = req.user.id;

        const image = req.file ? req.file.filename : null;

        if (!userId) {
            res.status(401).send('Utilisateur non authentifié');
            return;
        }

        if (!type || !libelle || !content) {
            res.status(400).send('Tous les champs sont requis');
            return;
        }
       
        const query = 'INSERT INTO Posts (userId, type, libelle, content, image) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [userId, type, libelle, content, image], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            const postId = results.insertId;

            connection.query('SELECT id FROM Person WHERE id != ?', [userId], (err, users) => {
                if (err) {
                    console.error('Database error:', err);
                    res.status(500).send('Erreur serveur');
                    return;
                }

                const notificationValues = users.map(user => [user.id, `Nouveau post: ${libelle}`, postId]);
                const notificationQuery = 'INSERT INTO Notifications (userId, message, postId) VALUES ?';

                connection.query(notificationQuery, [notificationValues], (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return;
                    }

                    users.forEach(user => {
                        io.to(user.id).emit('new_notification', {
                            message: `Nouveau post: ${libelle}`,
                            postId: postId
                        });
                    });
                    
                    const redirectUrl = `/${type}`; 
                    res.redirect(redirectUrl);
                });
            });
        });
    });

    return router;
};
