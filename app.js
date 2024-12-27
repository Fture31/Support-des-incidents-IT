// app.js 
const express = require('express');
const connection = require('./config/database.js');
const authenticateToken = require('./config/auth'); // Importer le middleware
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken'); // Importer jsonwebtoken
const http = require('http'); // Importer le module HTTP
const socketIO = require('socket.io'); // Importer le module Socket.IO
// const loginRoutes = require('./routes/login')(io); // Importer les routes de connexion
const BDRoutes= require('./routes/bd');
const vsatRoutes= require('./routes/vsat');
const MaintenanceRoutes= require('./routes/maintenance');
const reseauRoutes= require('./routes/reseau');
const webRoutes= require('./routes/web');
const ConnexionRoutes= require('./routes/connexion');
const securiteRoutes= require('./routes/securite');
const ScriptchatRoutes= require('./routes/chat');
const SearchRoutes= require('./routes/search');
const logoutRoutes= require('./routes/logout');
const cookieParser = require('cookie-parser');


const app = express();
// pour la sesion
app.use(cookieParser());
const session = require('express-session');
const server = http.createServer(app);

// Créer une instance de Socket.IO en écoutant le serveur HTTP
const io = socketIO(server);

io.on('connection', (socket) => {
    console.log('Client connecté');

    // Écoutez un événement personnalisé pour lier l'utilisateur connecté à son socket
    socket.on('register', (userId) => {
        socket.join(userId);  // Associe le socket à l'ID de l'utilisateur
        console.log(`User ${userId} has connected with socket ID ${socket.id}`);
    });

    // Gérer la déconnexion de l'utilisateur
    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    });
});

app.use(session({
    secret: 'votre_secret_de_session',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettre à 'true' seulement si vous êtes sur HTTPS
}));
io.on('connection', (socket) => {
    console.log('Client connecté');

    // Écoutez les événements de nouveau post ou réponse et émettez une notification
    socket.on('new_post', (data) => {
        // data contient des informations sur l'utilisateur et la notification

        // Émet une notification à l'utilisateur via son ID
        io.to(data.userId).emit('new_notification', {
            message: data.message,
            postId: data.postId
        });
    });
});

// Middleware pour les notifications non lues
app.use((req, res, next) => {
    if (req.user && req.user.id) {
        const userId = req.user.id;

        // Requête pour obtenir le nombre de notifications non lues
        const unreadNotificationsQuery = 'SELECT COUNT(*) as unreadCount FROM notifications WHERE userId = ? AND isRead = FALSE';

        connection.query(unreadNotificationsQuery, [userId], (err, results) => {
            if (err) {
                console.error('Erreur de base de données:', err);
                res.locals.unreadCount = 0;
            } else {
                res.locals.unreadCount = results[0].unreadCount || 0;
            }
            next();
        });
    } else {
        res.locals.unreadCount = 0;
        next();
    }
});


// Configuration du moteur de template EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour parser le corps des requêtes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const pageRoutes = require('./routes/page')(io); ; 
const createRoutes=require('./routes/page-create-topic')(io);
const loginRoutes = require('./routes/login') // Importer les routes de connexion
// const createNotification=require('./routes/notification')(io);
app.use('/', loginRoutes); // Utiliser les routes de connexion
app.use('/', reseauRoutes);
app.use('/', vsatRoutes);
app.use('/', MaintenanceRoutes);
app.use('/', BDRoutes);
app.use('/', webRoutes);
app.use('/', securiteRoutes);
app.use('/', pageRoutes);
app.use('/', createRoutes);
app.use('/', ConnexionRoutes);
app.use('/', ScriptchatRoutes);
app.use('/',SearchRoutes);
app.use('/',logoutRoutes);

// app.use('/', createNotification);


// Lors de l'ajout d'un post ou d'une notification
io.to(user.id).emit('new_notification', {
    message: `Nouveau post: ${libelle}`,
    postId: postId
});


app.get('/login', (req, res) => {
    res.render('page-login');  // Assurez-vous que le fichier page-login.ejs existe dans votre dossier views
});

app.get('/', (req, res) => {//PAGE ACCEUIL
    const token = req.cookies.authToken; // Récupérer le token JWT depuis les cookies
    if (token) {
        // Si un token existe, vérifier s'il est valide
        jwt.verify(token, 'your_jwt_secret', (err, user) => {
            if (err) {
                // Si le token est expiré ou invalide, rediriger vers la page de connexion
                return res.redirect('/login');
            } else {
                // Si le token est valide, rediriger vers /page-categories
                return res.redirect('/page-categories');
            }
        });
    } else {
        // Si aucun token n'est présent, rediriger vers la page de connexion
        return res.redirect('/login');
    }
});
app.get('/connexion',  (req, res) => { //PAGE cooonexion
    res.render('page-connexion');
});
app.get('/Bd', authenticateToken,(req, res) => {
    res.render('Bd',{ items: items,username: req.user.name,userId: req.user.id  });
});
app.get('/reseau', authenticateToken,(req, res) => {
    res.render('reseau',{ items: items,username:req.user.name, userId: req.user.id });
});
app.get('/securite', authenticateToken, (req, res) => {
    res.render('securite', { items: items,username:req.user.name ,userId: req.user.id });
});
app.get('/web',  authenticateToken, (req, res) => {
    res.render('web',{ items: items,username: req.user.name,userId: req.user.id  });
});
app.get('/Maintenance' ,  authenticateToken,(req, res) => {
     res.render('Maintenance',{ items: items,username:req.user.name ,userId: req.user.id });
    });
app.get('/vsat', (req, res) => {
    res.render('vsat',{items: items, username:req.user.name,userId: req.user.id });
});
app.get('/page',  authenticateToken, (req, res) => {
    const items = [];
    const comments = [];
    res.render('page',{items: items,username:req.user.name, comments : comments,userId: req.user.id });
});
app.get('/page-create-topic', authenticateToken, (req, res) => {
    res.render('page-create-topic',{username:req.user.name, userId: req.user.id });
});

// app.js ou dans une route spécifique

app.get('/page-categories', authenticateToken, (req, res) => {
    // Accéder aux informations du token JWT
    const usernameFromToken = req.user.name;

    // Accéder aux informations de la session côté serveur
    const usernameFromSession =req.user.name;

    res.render('page-categories', {
        username: usernameFromSession,  // ou usernameFromToken
        userId: req.user.id
    });
});

app.get('/chat',  authenticateToken,(req, res) => {
    res.render('chat');
});

app.get('/search',  authenticateToken,(req, res) => {
    res.render('searchResults', { items: results, query: query, username: username });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
