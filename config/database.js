const mysql = require('mysql');

// Paramètres de connexion MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Pas de mot de passe
  database: 'CHATBOT'
};


let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig); // Créer une nouvelle connexion

  connection.connect(function (err) {
    if (err) {
      console.error('Erreur lors de la connexion à MySQL:', err);
      setTimeout(handleDisconnect, 2000); // Attendre 2 secondes avant de réessayer en cas d'échec
    } else {
      console.log("Connected to the database!");
    }
  });

  connection.on('error', function (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Connexion à la base de données perdue. Tentative de reconnexion...');
      handleDisconnect(); // Reconnecter en cas de perte de connexion
    } else {
      throw err;  // Lancer l'erreur pour les autres types d'erreurs
    }
  });
}

handleDisconnect(); // Démarrer la connexion initiale

module.exports = connection;

